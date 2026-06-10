Dưới đây là phần **Workshop & Group Project** được thiết kế như một chương thực hành cuối khóa cho lộ trình **AI Technical Architect**.

---

# Workshop & Group Project

## Mục tiêu tổng thể

Sau 10 module, học viên phải chứng minh được 3 năng lực:

```text
1. Thiết kế được AI architecture end-to-end
2. Biết phân biệt AI-First vs AI-Retrofit
3. Trình bày được quyết định kiến trúc, trade-off, risk, cost và implementation plan
```

---

# Workshop 1: End-to-End AI System Design Lab

## Chủ đề

```text
AI-First vs AI-Retrofit
```

---

## 1. Mục tiêu Workshop 1

Workshop này giúp học viên hiểu:

```text
Khi nào nên retrofit AI vào hệ thống hiện có
Khi nào nên thiết kế AI-first workflow
Architecture khác nhau như thế nào
Cost/risk khác nhau ra sao
Implementation khác nhau thế nào
```

---

# 2. Case Study

## Business Context

Một công ty bảo hiểm đang có hệ thống claim management truyền thống.

Hiện tại flow như sau:

```text
Customer submits claim
 |
Claim officer manually reviews documents
 |
Officer checks policy
 |
Officer requests missing information
 |
Officer makes recommendation
 |
Senior officer approves
```

Vấn đề:

```text
Review document mất nhiều thời gian
Claim officer phải đọc nhiều PDF
Dễ bỏ sót missing documents
Policy lookup thủ công
Risk assessment chưa nhất quán
```

---

# 3. Bài toán Workshop

Thiết kế 2 phương án:

```text
Option A: AI-Retrofit Architecture
Option B: AI-First Architecture
```

Sau đó so sánh và chọn phương án phù hợp.

---

# 4. Option A: AI-Retrofit Architecture

## Ý tưởng

Hệ thống claim hiện tại giữ nguyên. AI được thêm vào như một feature phụ.

Ví dụ:

```text
Existing Claim System
 |
Add "AI Summarize" button
 |
Add "Ask Policy" button
```

---

## Architecture

```text
Existing Claim Portal
 |
Existing Backend
 |
AI Feature API
 |
AI Service
 |
LLM Provider
 |
Vector DB
```

---

## Component cụ thể

```text
Frontend:
- Thêm button "Summarize Claim"
- Thêm panel "AI Suggestion"

Backend:
- Thêm API /claims/{id}/ai-summary
- Thêm API /claims/{id}/ask-ai

AI Service:
- Summary service
- RAG Q&A service
- Prompt registry

Data:
- Existing claim DB
- Document storage
- Vector DB cho policy documents
```

---

## API design

```http
POST /claims/{claimId}/ai-summary
```

Response:

```json
{
  "claimId": "claim_001",
  "summary": "This claim relates to a vehicle accident...",
  "missingDocuments": [
    "Police report",
    "Repair invoice"
  ],
  "confidenceScore": 0.82
}
```

---

## Ưu điểm

```text
Nhanh triển khai
Ít thay đổi hệ thống hiện tại
Rủi ro thấp hơn
Phù hợp POC/MVP
Dễ thuyết phục stakeholder
```

## Nhược điểm

```text
AI chỉ là add-on
Workflow chưa tối ưu
Khó scale thành AI platform
Khó kiểm soát end-to-end quality
Dễ phát sinh technical debt
```

---

# 5. Option B: AI-First Architecture

## Ý tưởng

Thiết kế lại claim intake workflow với AI là capability chính.

Không phải thêm nút AI, mà AI tham gia từ đầu workflow.

---

## Architecture

```text
Customer Claim Submission
 |
Document Upload
 |
AI Intake Workflow
 |
Extract Fields
 |
Check Missing Documents
 |
Policy Retrieval
 |
Risk Assessment
 |
Human Review
 |
Final Decision
```

---

## Component cụ thể

```text
Frontend:
- Claim submission wizard
- AI processing status
- Extracted fields review
- Missing document checklist
- Risk panel
- Human review screen

Backend:
- Claim workflow service
- Review task service
- Audit service
- Policy service

AI Service:
- Document extraction
- Field extraction
- RAG service
- Risk assessment
- Guardrails
- Evaluation

Infra:
- Queue/workflow engine
- Object storage
- PostgreSQL
- Vector DB
- Observability
```

---

## API design

```http
POST /claims/{claimId}/intake/start
```

Response:

```json
{
  "workflowId": "wf_001",
  "claimId": "claim_001",
  "status": "AI_PROCESSING"
}
```

---

## Workflow

```text
Start claim intake
 |
Extract document text
 |
Extract structured claim fields
 |
Validate required fields
 |
Retrieve policy context
 |
Generate risk assessment
 |
Apply guardrails
 |
Create human review task
```

---

## Ưu điểm

```text
Workflow tối ưu cho AI
Dễ scale thành AI platform
Có governance rõ hơn
Có audit end-to-end
Phù hợp production dài hạn
```

## Nhược điểm

```text
Chi phí triển khai cao hơn
Thay đổi business process nhiều hơn
Cần stakeholder alignment mạnh hơn
Rủi ro adoption cao hơn
Cần training người dùng
```

---

# 6. Workshop Activity

## Thời lượng đề xuất

```text
Total: 3–4 giờ
```

## Agenda

```text
1. Case study briefing — 20 phút
2. Group discussion — 30 phút
3. Design AI-Retrofit — 45 phút
4. Design AI-First — 45 phút
5. Compare options — 30 phút
6. Present decision — 30 phút
7. Instructor feedback — 30 phút
```

---

# 7. Deliverables Workshop 1

Mỗi group phải nộp:

```text
1. AI-Retrofit architecture diagram
2. AI-First architecture diagram
3. Comparison matrix
4. Recommended approach
5. ADR-001: Choose AI-First or AI-Retrofit
6. MVP implementation plan
```

---

# 8. Comparison Matrix mẫu

| Criteria              | AI-Retrofit | AI-First           |
| --------------------- | ----------- | ------------------ |
| Speed to MVP          | High        | Medium             |
| Initial cost          | Low         | Medium/High        |
| Workflow impact       | Low         | High               |
| Long-term scalability | Medium      | High               |
| Governance            | Medium      | High               |
| User adoption risk    | Low         | Medium             |
| Technical debt        | Medium/High | Low/Medium         |
| Best fit              | POC/MVP     | Strategic platform |

---

# 9. ADR mẫu cho Workshop 1

```text
ADR-W01: Choose AI-Retrofit for MVP and AI-First for Long-Term Architecture

Status: Accepted

Context:
The company wants to reduce claim review effort using AI. The existing
claim management system is already in production and supports current
business operations.

Options:
1. AI-Retrofit: add AI features to existing claim system
2. AI-First: redesign claim intake workflow around AI capabilities

Decision:
Use AI-Retrofit for the first MVP, while designing the target architecture
toward AI-First.

Rationale:
AI-Retrofit allows faster validation with lower business disruption.
However, AI-First provides a better long-term architecture for workflow
automation, audit, governance and scalability.

Consequences:
Positive:
- Faster MVP delivery
- Lower initial adoption risk
- Allows business validation before large investment
- Keeps long-term architecture direction clear

Negative:
- Some short-term technical debt
- AI workflow may be limited by existing system
- Future migration to AI-First workflow is required

Revisit Criteria:
Revisit after MVP pilot if:
- Claim officers actively use AI features
- Summary accuracy is acceptable
- Human correction rate is below agreed threshold
- Business approves investment in AI-first workflow
```

---

# Workshop 2: Group Evaluation

## Chủ đề

```text
AI Technical Architecture Capstone
```

---

# 1. Mục tiêu Workshop 2

Workshop 2 là phần đánh giá cuối khóa.

Mỗi group phải thiết kế và trình bày một giải pháp AI architecture hoàn chỉnh.

---

# 2. Format

```text
Preparation time: 4 weeks
Presentation time: 40 minutes per group
Q&A: included or additional 10–15 minutes
```

---

# 3. Capstone Topic đề xuất

## AI Insurance Claims Copilot

Group có thể chọn biến thể khác, ví dụ:

```text
AI Healthcare Assistant
AI Customer Support Copilot
AI Cyber Incident Investigator
AI Legal Document Reviewer
AI E-commerce Product Assistant
```

Nhưng nên giữ cùng structure.

---

# 4. Yêu cầu Capstone

Mỗi group phải thiết kế hệ thống có đủ:

```text
1. Business context
2. AI use cases
3. Functional requirements
4. Non-functional requirements
5. Architecture diagram
6. Data architecture
7. GenAI pattern selection
8. Cloud infrastructure
9. Security & governance
10. LLMOps/monitoring
11. FinOps/cost model
12. ADRs
13. Implementation plan
14. Working prototype hoặc technical proof-of-concept
```

---

# 5. Architecture bắt buộc phải có

```text
Frontend
 |
Backend API
 |
Workflow / Queue
 |
AI Orchestrator
 |
LLM Gateway
 |
Prompt Registry
 |
Retriever / Vector DB
 |
Data Store
 |
Observability
 |
Human Review
```

---

# 6. Implementation cụ thể cho Capstone

## Recommended stack

```text
Frontend:
NextJS

Backend:
NestJS

AI Service:
FastAPI

Database:
PostgreSQL + pgvector

Queue:
BullMQ / Redis

Storage:
S3 / MinIO

LLM:
OpenAI / Azure OpenAI / Bedrock

Monitoring:
Langfuse

Infra:
Docker Compose for local
Terraform optional for cloud
```

---

# 7. Repo structure

```text
ai-architecture-capstone/
├── apps/
│   ├── frontend/
│   ├── backend/
│   └── ai-service/
├── infra/
│   ├── docker-compose.yml
│   └── terraform/
├── docs/
│   ├── architecture.md
│   ├── data-architecture.md
│   ├── security.md
│   ├── finops.md
│   ├── llmops.md
│   └── adr/
├── prompts/
├── eval/
└── README.md
```

---

# 8. Minimum Working Prototype

Group không cần build full enterprise system.

Nhưng nên có MVP chạy được:

```text
1. Upload document
2. Extract text
3. Chunk document
4. Generate embedding
5. Store vector
6. Ask question using RAG
7. Return answer with sources
8. Save AI run log
9. Show result in UI hoặc Postman
```

---

# 9. Docker Compose mẫu

```yaml
version: "3.9"

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: capstone
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: app
      MINIO_ROOT_PASSWORD: apppassword
    ports:
      - "9000:9000"
      - "9001:9001"

  backend:
    build: ./apps/backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - minio

  ai-service:
    build: ./apps/ai-service
    ports:
      - "8000:8000"
    depends_on:
      - postgres
```

---

# 10. Backend API cần implement

## Claim APIs

```http
POST /claims
GET /claims/{claimId}
POST /claims/{claimId}/documents
POST /claims/{claimId}/analyze
GET /claims/{claimId}/analysis
POST /claims/{claimId}/ask
```

---

# 11. AI Service APIs

```http
POST /documents/{documentId}/index
POST /claims/{claimId}/summarize
POST /claims/{claimId}/ask
POST /claims/{claimId}/risk-assessment
```

---

# 12. Database schema tối thiểu

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  claim_number VARCHAR(100),
  customer_name VARCHAR(255),
  policy_number VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  file_name VARCHAR(255),
  storage_url TEXT,
  document_type VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  claim_id UUID REFERENCES claims(id),
  chunk_index INT,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE ai_runs (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  task_name VARCHAR(100),
  model_name VARCHAR(100),
  prompt_version VARCHAR(50),
  input_tokens INT,
  output_tokens INT,
  latency_ms INT,
  estimated_cost NUMERIC,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 13. FastAPI implementation skeleton

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AskClaimRequest(BaseModel):
    claim_id: str
    question: str
    tenant_id: str

@app.post("/claims/ask")
async def ask_claim(request: AskClaimRequest):
    result = await rag_service.answer_question(
        claim_id=request.claim_id,
        tenant_id=request.tenant_id,
        question=request.question,
    )
    return result
```

---

# 14. RAG service skeleton

```python
class RagService:
    def __init__(self, embedding_service, vector_store, llm_gateway):
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.llm_gateway = llm_gateway

    async def answer_question(self, claim_id, tenant_id, question):
        query_embedding = await self.embedding_service.embed_text(question)

        chunks = await self.vector_store.search(
            embedding=query_embedding,
            top_k=5,
            filters={
                "claim_id": claim_id,
                "tenant_id": tenant_id,
            },
        )

        context = self.assemble_context(chunks)

        prompt = f"""
You are an insurance claim assistant.

Answer using only the provided sources.
If the answer is not found, say "Not enough information".

Question:
{question}

Sources:
{context}
"""

        answer = await self.llm_gateway.generate_text(
            prompt=prompt,
            model="gpt-4.1-mini",
            temperature=0,
        )

        return {
            "answer": answer,
            "sources": [
                {
                    "chunkId": c.id,
                    "documentId": c.metadata["document_id"],
                    "score": c.score,
                }
                for c in chunks
            ],
        }

    def assemble_context(self, chunks):
        return "\n\n".join([
            f"[Source {i+1}]\n{chunk.text}"
            for i, chunk in enumerate(chunks)
        ])
```

---

# 15. 4-week preparation plan

## Week 1: Architecture & Scope

Deliverables:

```text
Business context
Problem statement
MVP scope
AI use cases
High-level architecture
ADR-001
```

Focus:

```text
Chọn use case
Chọn AI-first hoặc AI-retrofit
Vẽ architecture
Xác định NFR
```

---

## Week 2: Data & AI Pipeline

Deliverables:

```text
Data architecture
Document ingestion design
Chunking strategy
Embedding strategy
Vector DB design
RAG flow
```

Implementation:

```text
Upload document
Extract text
Chunk
Embed
Store vector
```

---

## Week 3: Security, FinOps, LLMOps

Deliverables:

```text
Threat model
Secure retrieval design
Guardrails
AI run logging
Cost model
Evaluation plan
Monitoring design
```

Implementation:

```text
RAG ask endpoint
AI run log
Prompt version
Source citation
Basic guardrail
```

---

## Week 4: Finalization & Presentation

Deliverables:

```text
Final architecture document
Slide deck
Demo script
ADRs
Risk register
Roadmap
Cost estimate
```

Implementation:

```text
End-to-end demo
Bug fixing
Presentation rehearsal
```

---

# 16. Presentation structure: 40 minutes

## Recommended timing

```text
1. Business problem — 3 minutes
2. Use case & MVP scope — 4 minutes
3. Architecture overview — 7 minutes
4. Data architecture & RAG — 5 minutes
5. Security & governance — 5 minutes
6. FinOps & scalability — 4 minutes
7. LLMOps & monitoring — 4 minutes
8. Demo — 5 minutes
9. Key ADRs & trade-offs — 3 minutes
```

---

# 17. Slide deck structure

```text
Slide 1: Title & team
Slide 2: Business problem
Slide 3: Target users & use cases
Slide 4: MVP scope
Slide 5: AI-First vs AI-Retrofit decision
Slide 6: High-level architecture
Slide 7: Component architecture
Slide 8: Data architecture
Slide 9: RAG flow
Slide 10: Security architecture
Slide 11: Governance & human review
Slide 12: FinOps model
Slide 13: LLMOps & evaluation
Slide 14: Demo flow
Slide 15: ADRs & trade-offs
Slide 16: Roadmap
Slide 17: Risks & mitigations
Slide 18: Final recommendation
```

---

# 18. Evaluation rubric

| Criteria                | Weight |
| ----------------------- | -----: |
| Business understanding  |    10% |
| Architecture quality    |    20% |
| Data architecture       |    15% |
| GenAI pattern selection |    10% |
| Security & governance   |    15% |
| FinOps & scalability    |    10% |
| LLMOps & monitoring     |    10% |
| Implementation/demo     |    10% |

---

# 19. What good looks like

Một group tốt sẽ nói được:

```text
Chúng tôi chọn AI-Retrofit cho MVP vì giảm disruption,
nhưng target architecture là AI-First.

RAG được dùng cho policy Q&A vì cần source citation.
AI không được approve/reject claim.
Secure retrieval luôn filter tenant_id và claim_id.
Mọi AI run lưu model, prompt version, token, latency, cost.
Prompt change phải qua evaluation trước khi production.
```

---

# 20. Common mistakes cần tránh

```text
Dùng agent cho mọi thứ
Không có human review
Không có source citation
Không có tenant isolation
Không track cost
Không có ADR
Không nói trade-off
Architecture quá đẹp nhưng không implement được
Demo không gắn với business problem
```

---

# 21. Final Capstone Checklist

Group hoàn thành khi có:

```text
Architecture document
Architecture diagrams
Data architecture
Security design
FinOps design
LLMOps design
Risk register
3–5 ADRs
Working prototype
40-minute presentation deck
Demo script
Implementation roadmap
```

---

# 22. Capstone ADRs nên có

```text
ADR-001: Choose AI-Retrofit for MVP or AI-First
ADR-002: Use RAG instead of fine-tuning
ADR-003: Use pgvector for MVP vector search
ADR-004: AI must not make final business decision
ADR-005: Use async workflow for AI processing
```

---

# 23. Kết quả cuối cùng học viên cần đạt

Sau 2 workshop này, học viên phải chứng minh được năng lực:

```text
Không chỉ biết gọi LLM API,
mà biết thiết kế một AI platform có:
- Business alignment
- Architecture reasoning
- Data pipeline
- Secure RAG
- Human review
- FinOps
- LLMOps
- ADR
- Production roadmap
```

Đây là điểm chuyển từ **AI Engineer mindset** sang **AI Technical Architect mindset**.
