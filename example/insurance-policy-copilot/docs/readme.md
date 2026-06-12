# Insurance Policy Copilot - Workflow hoạt động

Tài liệu này giải thích cách các component trong project phối hợp với nhau để tạo thành một AI application kiểu production: từ UI, API, database, vector search, RAG, Groq chat, citation, cost tracking, prompt tracking đến evaluation.

## 1. Bức tranh tổng thể

```text
User
  |
  v
React UI
  |
  | HTTP REST API
  v
Fastify API
  |
  |-- Upload PDF
  |-- Parse PDF
  |-- Chunk text
  |-- Local BGE embedding
  |-- Vector search
  |-- Prompt rendering
  |-- Groq chat completion
  |-- Citation mapping
  |-- Cost / prompt / evaluation tracking
  v
PostgreSQL + pgvector
```

Project này không phải là ChatGPT clone. Nó là một RAG application:

```text
RAG = Retrieval Augmented Generation
```

Nghĩa là LLM không tự trả lời bằng trí nhớ chung. Hệ thống sẽ:

1. Đọc tài liệu policy.
2. Cắt tài liệu thành chunks.
3. Biến chunks thành vectors.
4. Lưu vectors vào pgvector.
5. Khi user hỏi, tìm chunks liên quan nhất.
6. Gửi chunks đó vào prompt cho LLM.
7. LLM trả lời dựa trên context được truy xuất.
8. API trả về answer kèm citations.

## 2. Các module chính

```text
apps/web
  React UI

apps/api
  Fastify backend
  PDF ingestion
  Embedding
  RAG
  Groq chat
  Evaluation

infra/db
  PostgreSQL schema
  pgvector tables
  prompt templates

docs
  Architecture and operation notes

evals
  Evaluation cases
```

## 3. Runtime services

Khi chạy Docker Compose, project có 3 service chính:

```text
web  -> http://localhost:5173
api  -> http://localhost:8080
db   -> localhost:5432
```

### Web service

Web app dùng React + Vite.

Vai trò:

- Cho user upload PDF.
- Hiển thị danh sách documents.
- Cho user đặt câu hỏi.
- Hiển thị answer và citations.
- Hiển thị prompt/cost telemetry.
- Chạy evaluation.

File quan trọng:

```text
apps/web/src/App.tsx
apps/web/src/api.ts
```

### API service

API dùng Fastify.

Vai trò:

- Nhận request từ UI.
- Validate input.
- Parse PDF.
- Chunk text.
- Tạo embeddings.
- Query pgvector.
- Render prompt.
- Gọi Groq để tạo answer.
- Lưu logs, cost, prompt run, evaluation result.

File quan trọng:

```text
apps/api/src/routes.ts
apps/api/src/ingestion.ts
apps/api/src/openaiGateway.ts
apps/api/src/retrieval.ts
apps/api/src/chat.ts
apps/api/src/evaluation.ts
```

### Database service

Database dùng PostgreSQL + pgvector.

Vai trò:

- Lưu metadata document.
- Lưu chunks.
- Lưu embedding vectors.
- Lưu prompt templates.
- Lưu prompt runs.
- Lưu token/cost usage.
- Lưu chat history.
- Lưu evaluation cases/runs/results.

File schema:

```text
infra/db/001_schema.sql
infra/db/002_embedding_384.sql
```

## 4. Upload PDF workflow

Flow:

```text
User upload PDF
  |
  v
React calls POST /api/documents/upload
  |
  v
Fastify receives multipart file
  |
  v
API validates file type = application/pdf
  |
  v
PDF parser extracts text and page count
  |
  v
Chunker splits text into overlapping chunks
  |
  v
Local BGE model creates 384-dim embeddings
  |
  v
API stores document + chunks + vectors in PostgreSQL
  |
  v
Document status becomes ready
```

### Step 1: UI upload

Trong `App.tsx`, khi user chọn file:

```text
onUpload(file)
  -> uploadPolicy(file)
  -> POST /api/documents/upload
```

`apps/web/src/api.ts` tạo `FormData`:

```text
form.append("file", file)
```

Sau upload, UI gọi lại:

```text
GET /api/documents
GET /api/telemetry/costs
GET /api/prompts
```

để refresh màn hình.

### Step 2: API nhận PDF

Route:

```text
POST /api/documents/upload
```

File:

```text
apps/api/src/routes.ts
```

API kiểm tra:

```text
file exists?
mime type == application/pdf?
```

Sau đó gọi:

```text
ingestPdf(...)
```

### Step 3: chống duplicate

Trong `ingestion.ts`, API tính hash:

```text
sha256(file buffer)
```

Nếu PDF đã upload và status là `ready` hoặc `processing`, API trả về duplicate.

Nếu PDF cũ bị `failed`, API xóa row cũ và cho upload lại. Điều này quan trọng vì nếu lỗi embedding hoặc quota xảy ra, user có thể retry cùng file.

### Step 4: parse PDF

File:

```text
apps/api/src/pdf.ts
```

API dùng `pdf-parse` để lấy:

```text
text
pageCount
```

Nếu PDF scan dạng ảnh và không có text extractable, hệ thống sẽ fail với message:

```text
No extractable text found in this PDF.
```

Production version nên thêm OCR cho scanned PDF.

### Step 5: chunking

File:

```text
apps/api/src/chunking.ts
```

LLM và embedding model không nên xử lý cả tài liệu dài một lần. Vì vậy text được chia thành chunks.

Config:

```text
CHUNK_TOKEN_TARGET default = 650
CHUNK_TOKEN_OVERLAP default = 90
```

Overlap giúp câu trả lời không bị mất context ở ranh giới giữa 2 chunks.

Ví dụ:

```text
Chunk 1: words 1-500
Chunk 2: words 430-930
Chunk 3: words 860-1360
```

### Step 6: embedding

Project hiện tại dùng local embedding:

```text
EMBEDDING_PROVIDER=local
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
EMBEDDING_DIMENSIONS=384
```

Trong code, Transformers.js dùng ONNX artifact:

```text
Xenova/bge-small-en-v1.5
```

Lý do:

- `BAAI/bge-small-en-v1.5` là model gốc.
- `Xenova/bge-small-en-v1.5` là bản đã convert để chạy tốt với Transformers.js/ONNX trong Node.js.
- Output vector có 384 dimensions.

Embedding biến text thành vector:

```text
"flood damage is excluded"
  -> [0.012, -0.083, 0.144, ... 384 numbers]
```

Các đoạn text có ý nghĩa giống nhau sẽ có vectors gần nhau trong vector space.

### Step 7: lưu vào database

Tables liên quan:

```text
documents
document_chunks
llm_usage
```

`documents` lưu metadata:

```text
id
filename
mime_type
sha256
page_count
status
created_at
```

`document_chunks` lưu nội dung và vector:

```text
document_id
chunk_index
page_start
page_end
content
token_estimate
embedding vector(384)
```

Sau khi mọi chunk được insert thành công:

```text
documents.status = ready
```

Nếu có lỗi ở parse/chunk/embedding/insert:

```text
documents.status = failed
```

## 5. Ask question workflow

Flow:

```text
User asks question
  |
  v
React calls POST /api/chat
  |
  v
API embeds the question with local BGE
  |
  v
pgvector searches nearest document chunks
  |
  v
API builds RAG context with citation markers
  |
  v
API renders prompt template
  |
  v
Groq generates answer
  |
  v
API stores prompt run, usage, chat message
  |
  v
UI shows answer + citations + cost/latency
```

### Step 1: UI gửi câu hỏi

Trong `App.tsx`:

```text
onAsk()
  -> askQuestion(question)
  -> POST /api/chat
```

Request body:

```json
{
  "question": "Does this policy cover flood damage?"
}
```

### Step 2: API validate question

Route:

```text
POST /api/chat
```

Validation:

```text
question min length = 3
question max length = 2000
```

Sau đó API gọi:

```text
answerQuestion(question)
```

File:

```text
apps/api/src/chat.ts
```

### Step 3: embed question

Trước khi search, câu hỏi cũng phải được biến thành vector:

```text
"Does this policy cover flood damage?"
  -> vector(384)
```

Điều quan trọng: document chunks và question phải dùng cùng embedding model.

Trong project này:

```text
chunks embedding: BGE small, 384 dims
question embedding: BGE small, 384 dims
```

Nếu document dùng OpenAI 1536 dims nhưng question dùng BGE 384 dims, vector search sẽ sai hoặc lỗi.

### Step 4: vector search bằng pgvector

File:

```text
apps/api/src/retrieval.ts
```

Query chính:

```sql
ORDER BY c.embedding <=> $1::vector
LIMIT topK
```

`<=>` là cosine distance operator của pgvector.

Ý tưởng:

```text
question vector
  compare with
all chunk vectors
  return nearest chunks
```

Nếu `topK = 6`, API lấy tối đa 6 chunks liên quan nhất.

### Step 5: build context

API biến chunks thành context:

```text
[1] policy.pdf, pages 2-3, chunk 0
chunk content here...

[2] policy.pdf, pages 4-5, chunk 1
chunk content here...
```

Các marker `[1]`, `[2]` là citation markers. LLM được yêu cầu dùng marker này khi trả lời.

### Step 6: prompt template

Prompt không hard-code trực tiếp trong code. Nó được lưu trong database:

```text
prompt_templates
```

Template hiện tại:

```text
name = insurance_policy_rag
version = 1
is_active = true
```

System prompt nói model:

```text
You are an insurance policy copilot.
Answer only from supplied policy context.
If not supported, say cannot determine.
Include citation markers like [1], [2].
```

User prompt inject:

```text
Question: {{question}}

Policy context:
{{context}}
```

Đây là prompt tracking foundation. Khi production, mỗi lần đổi prompt nên tạo version mới thay vì sửa trực tiếp version cũ.

### Step 7: gọi Groq

Embedding đã local, nhưng answer generation dùng Groq qua OpenAI-compatible API.

Config:

```text
CHAT_PROVIDER=groq
CHAT_BASE_URL=https://api.groq.com/openai/v1
CHAT_MODEL=llama-3.3-70b-versatile
```

File:

```text
apps/api/src/openaiGateway.ts
```

API gọi Groq bằng OpenAI-compatible SDK:

```text
client.chat.completions.create(...)
```

Input gồm:

```text
system prompt
user prompt with question + retrieved context
```

Output là answer dạng text.

### Step 8: citation mapping

File:

```text
apps/api/src/retrieval.ts
```

API trả citations về UI:

```json
{
  "marker": "[1]",
  "filename": "policy.pdf",
  "pageStart": 2,
  "pageEnd": 3,
  "similarity": 0.8231,
  "preview": "..."
}
```

Citation giúp user audit:

```text
Câu trả lời này dựa trên đoạn nào trong policy?
Ở page nào?
Similarity bao nhiêu?
```

Với insurance domain, citation rất quan trọng vì answer liên quan đến coverage, exclusions, limits, claims.

## 6. Cost tracking workflow

Tables:

```text
llm_usage
prompt_runs
```

Tracked fields:

```text
operation
model
input_tokens
output_tokens
total_tokens
estimated_cost_usd
created_at
```

Hiện tại embedding là local, nên:

```text
embedding cost = 0
```

Chat completion vẫn có cost estimate dựa trên:

```text
CHAT_INPUT_PRICE_PER_1M
CHAT_OUTPUT_PRICE_PER_1M
```

UI gọi:

```text
GET /api/telemetry/costs
```

và hiển thị:

```text
total cost
total tokens
cost by operation
recent prompt runs
```

## 7. Prompt tracking workflow

Prompt tracking trả lời câu hỏi:

```text
Answer này được tạo bởi prompt nào?
Prompt version nào?
Rendered prompt thực tế là gì?
Latency bao nhiêu?
Model nào?
```

Khi user hỏi câu hỏi:

1. API lấy active prompt template.
2. Render prompt với question + context.
3. Gọi Groq.
4. Insert vào `prompt_runs`.
5. Insert token/cost vào `llm_usage`.
6. Insert answer/citations vào `chat_messages`.

Tables:

```text
prompt_templates
prompt_runs
chat_messages
llm_usage
```

Đây là LLMOps cơ bản. Nếu answer sai, team có thể trace lại:

```text
question
retrieved chunks
prompt version
model
latency
tokens
answer
citations
```

## 8. Evaluation workflow

Evaluation dùng để đo chất lượng AI system.

Flow:

```text
User clicks Run Evaluation
  |
  v
POST /api/evaluations/run
  |
  v
API loads evaluation cases
  |
  v
For each case, call answerQuestion()
  |
  v
Check grounding and expected hint
  |
  v
Store evaluation run + results
  |
  v
UI displays score
```

Tables:

```text
evaluation_sets
evaluation_cases
evaluation_runs
evaluation_results
```

Current simple metrics:

```text
grounded
contains_expected_hint
score
```

Ví dụ:

```text
Question: Are floods excluded or covered?
Expected hint: flood
```

System check:

- Answer có citation không?
- Answer hoặc cited context có chứa expected hint không?

Production evaluation nên mạnh hơn:

- Retrieval recall.
- Citation precision.
- Faithfulness.
- Refusal correctness.
- Regression by prompt/model version.

## 9. Vì sao cần pgvector?

Nếu chỉ dùng SQL bình thường:

```sql
WHERE content LIKE '%flood%'
```

thì hệ thống chỉ match keyword.

Nhưng user có thể hỏi:

```text
Does it cover water damage from heavy rain?
```

Trong policy có thể ghi:

```text
flood exclusion
```

Keyword search có thể miss. Vector search hiểu semantic similarity tốt hơn:

```text
heavy rain water damage
flood exclusion
```

có thể gần nhau trong embedding space.

pgvector cho phép PostgreSQL lưu và search vectors:

```text
embedding vector(384)
```

và query cosine distance:

```sql
embedding <=> question_vector
```

## 10. Vì sao chunking quan trọng?

Không nên đưa toàn bộ PDF vào LLM vì:

- Tốn token.
- Chậm.
- Đắt.
- Có thể vượt context window.
- Answer dễ bị nhiễu bởi phần không liên quan.

Chunking giúp:

- Search đúng đoạn liên quan.
- Giảm context gửi vào LLM.
- Tạo citation chính xác hơn.
- Scale tốt hơn khi có nhiều documents.

## 11. Vì sao embedding local nhưng answer dùng Groq?

Embedding và generation là 2 năng lực khác nhau.

Embedding:

```text
Text -> vector
```

Generation:

```text
Question + context -> answer
```

Project hiện tại dùng:

```text
Embedding: local BGE small
Generation: Groq chat model
```

Lợi ích:

- Không bị quota embeddings của OpenAI.
- Embedding cost = 0.
- Dữ liệu chunk không cần gửi đến OpenAI ở ingestion time.
- Vẫn tận dụng hosted LLM tốc độ cao để tạo answer chất lượng.

Trade-off:

- Container lớn hơn.
- Lần chạy đầu tiên chậm hơn vì model init/download.
- CPU embedding chậm hơn hosted embedding ở quy mô lớn.
- Production cần cache model artifact hoặc bake model vào image.

## 12. Data lifecycle

### Document lifecycle

```text
upload received
  -> documents.status = processing
  -> parse/chunk/embed/store
  -> ready
```

Nếu lỗi:

```text
processing
  -> failed
```

Nếu user upload lại cùng file bị failed:

```text
delete old failed row
  -> reprocess
```

### Chat lifecycle

```text
question received
  -> question embedding
  -> retrieve chunks
  -> render prompt
  -> Groq answer
  -> store prompt run
  -> store usage
  -> store chat message
  -> return answer to UI
```

## 13. Các endpoint chính

```text
GET  /health
GET  /api/documents
POST /api/documents/upload
POST /api/chat
GET  /api/prompts
GET  /api/telemetry/costs
POST /api/evaluations/run
GET  /api/evaluations/runs/:id
```

## 14. Mapping endpoint với component

| Endpoint | UI action | Backend function | Database |
| --- | --- | --- | --- |
| `GET /api/documents` | Load policy list | SQL query documents/chunks | `documents`, `document_chunks` |
| `POST /api/documents/upload` | Upload PDF | `ingestPdf` | `documents`, `document_chunks`, `llm_usage` |
| `POST /api/chat` | Ask question | `answerQuestion` | `prompt_runs`, `llm_usage`, `chat_messages` |
| `GET /api/prompts` | Telemetry tab | SQL query prompt templates | `prompt_templates` |
| `GET /api/telemetry/costs` | Telemetry tab | Aggregate usage | `llm_usage`, `prompt_runs` |
| `POST /api/evaluations/run` | Evaluation tab | `runEvaluation` | `evaluation_runs`, `evaluation_results` |

## 15. Production architecture mindset

Project này đang là learning/reference app. Trong production cần thêm:

- Authentication.
- Tenant isolation.
- Object storage cho PDF gốc.
- OCR cho scanned PDF.
- Malware scanning.
- PII redaction.
- Prompt injection detection.
- Rate limits.
- Audit logs.
- Background job queue cho ingestion.
- Observability bằng OpenTelemetry.
- Evaluation gate trong CI/CD.
- Model/prompt registry.
- Hybrid search: keyword + vector.
- Reranker.
- Human review workflow.

## 16. Tóm tắt ngắn gọn

```text
Upload PDF:
PDF -> text -> chunks -> BGE vectors -> pgvector

Ask question:
question -> BGE vector -> pgvector search -> context -> Groq -> answer + citations

Tracking:
prompt_runs + llm_usage + chat_messages

Evaluation:
test questions -> same RAG pipeline -> score quality
```

Nếu hiểu project này, bạn đã nắm được phần lõi của một AI-first application hiện đại:

```text
Data
  -> Knowledge
  -> Embedding
  -> Retrieval
  -> Prompt
  -> Generation
  -> Citation
  -> Observability
  -> Evaluation
```
