Dưới đây là **Module 1 – Foundations of AI Technical Architecture** theo hướng rất cụ thể: học gì, kiến trúc ra sao, implement như thế nào.

---

# Module 1: Foundations of AI Technical Architecture

## 1. Mục tiêu của Module 1

Sau module này, bạn cần nắm được:

> Một hệ thống AI production không chỉ là gọi OpenAI API, mà là một hệ thống gồm nhiều layer: frontend, backend, AI orchestration, data, model, security, monitoring, cost control và governance.

Module này đặt nền móng để bạn tư duy như **AI Technical Architect**, không chỉ như developer.

---

# 2. Use Case thực hành

Ta chọn bài toán:

## Insurance Claim Assistant

Hệ thống hỗ trợ nhân viên bảo hiểm xử lý hồ sơ claim.

### Chức năng chính

Người dùng có thể:

1. Upload hồ sơ claim PDF.
2. Hệ thống đọc nội dung hồ sơ.
3. AI tóm tắt claim.
4. AI kiểm tra thông tin thiếu.
5. AI gợi ý rủi ro gian lận.
6. AI đề xuất next action.
7. Nhân viên bảo hiểm review và quyết định.

---

# 3. Architecture tổng thể

```text
User / Claim Officer
        |
        v
React / NextJS Frontend
        |
        v
NestJS Backend API
        |
        v
AI Orchestrator Service
        |
        +--------------------+
        |                    |
        v                    v
Document Service        LLM Provider
PDF Extractor           OpenAI / Azure OpenAI / Claude
        |
        v
Embedding Service
        |
        v
Vector Database
pgvector / OpenSearch / Pinecone
        |
        v
PostgreSQL
Claim Metadata / Users / Audit Logs
```

---

# 4. Kiến trúc theo layer

## Layer 1: Frontend Layer

### Responsibility

Frontend không xử lý AI logic. Frontend chỉ làm:

* Upload document
* Hiển thị trạng thái xử lý
* Hiển thị AI summary
* Hiển thị fraud indicators
* Cho phép human review
* Cho phép approve/reject recommendation

### Tech đề xuất

```text
NextJS
React
TailwindCSS
React Query
```

### Màn hình cần có

```text
1. Claim List
2. Claim Detail
3. Upload Claim Document
4. AI Analysis Result
5. Human Review Panel
```

---

## Layer 2: Backend API Layer

### Responsibility

Backend là nơi quản lý business workflow.

Backend chịu trách nhiệm:

* Authentication
* Authorization
* Claim CRUD
* Upload file
* Trigger AI processing
* Store result
* Audit log
* Human approval workflow

### Tech đề xuất

```text
NestJS
PostgreSQL
Prisma / TypeORM
JWT / OAuth2
BullMQ / SQS
```

### Không nên làm

Backend không nên nhét prompt AI trực tiếp vào controller.

Sai:

```ts
@Post('/analyze')
async analyze() {
  const result = await openai.chat.completions.create(...)
}
```

Đúng hơn:

```ts
@Post('/claims/:id/analyze')
async analyzeClaim(@Param('id') id: string) {
  return this.claimAnalysisService.startAnalysis(id);
}
```

Backend chỉ trigger workflow, còn AI logic nằm ở AI Orchestrator.

---

## Layer 3: AI Orchestrator Layer

Đây là layer quan trọng nhất trong Module 1.

### Responsibility

AI Orchestrator chịu trách nhiệm:

* Build prompt
* Gọi LLM
* Gọi retriever
* Gọi tools
* Validate output
* Apply guardrails
* Format result
* Retry nếu lỗi
* Log token usage
* Version prompt

### Tech đề xuất

```text
Python FastAPI
LangGraph hoặc LangChain
OpenAI SDK
Pydantic
```

Hoặc nếu bạn muốn đồng bộ stack:

```text
NestJS AI Module
LangChain JS
OpenAI SDK
```

Nhưng với hệ thống AI nghiêm túc, tôi khuyên tách riêng:

```text
NestJS = Business API
Python FastAPI = AI Orchestration
```

---

# 5. Architecture cụ thể cho Module 1

## Component Diagram

```text
[Claim Officer]
      |
      v
[NextJS Frontend]
      |
      v
[NestJS API Gateway]
      |
      +----------------------+
      |                      |
      v                      v
[PostgreSQL]           [S3 / Blob Storage]
      |
      v
[AI Job Queue]
      |
      v
[FastAPI AI Orchestrator]
      |
      +----------------------+
      |                      |
      v                      v
[PDF Extractor]         [LLM Client]
      |                      |
      v                      v
[Chunking Service]      [OpenAI / Azure OpenAI]
      |
      v
[Embedding Service]
      |
      v
[Vector DB]
```

---

# 6. Flow xử lý chi tiết

## Flow 1: Upload claim document

```text
User
 ↓
Frontend upload PDF
 ↓
NestJS Backend nhận file
 ↓
Backend lưu file vào S3
 ↓
Backend tạo claim record trong PostgreSQL
 ↓
Backend tạo AI processing job
 ↓
Trả về claimId cho frontend
```

### API

```http
POST /claims
Content-Type: multipart/form-data
```

### Response

```json
{
  "claimId": "claim_123",
  "status": "UPLOADED"
}
```

---

## Flow 2: Process document

```text
AI Worker nhận job
 ↓
Download PDF từ S3
 ↓
Extract text
 ↓
Split text thành chunks
 ↓
Generate embeddings
 ↓
Store vectors vào Vector DB
 ↓
Update claim status = INDEXED
```

### Claim status

```text
UPLOADED
PROCESSING
INDEXED
ANALYZING
COMPLETED
FAILED
```

---

## Flow 3: AI Analysis

```text
User click Analyze
 ↓
Backend gọi AI Orchestrator
 ↓
AI Orchestrator retrieve relevant chunks
 ↓
Build prompt
 ↓
Call LLM
 ↓
Validate JSON response
 ↓
Store result
 ↓
Return to frontend
```

---

# 7. Database design cơ bản

## claims table

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  claim_number VARCHAR(100),
  customer_name VARCHAR(255),
  policy_number VARCHAR(100),
  status VARCHAR(50),
  document_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## claim_ai_analyses table

```sql
CREATE TABLE claim_ai_analyses (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  summary TEXT,
  missing_information JSONB,
  fraud_indicators JSONB,
  recommendation TEXT,
  confidence_score NUMERIC,
  model_name VARCHAR(100),
  prompt_version VARCHAR(50),
  input_tokens INT,
  output_tokens INT,
  created_at TIMESTAMP
);
```

## audit_logs table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  entity_type VARCHAR(100),
  entity_id UUID,
  action VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP
);
```

---

# 8. AI response format

Không nên để LLM trả về text tự do.

Nên ép LLM trả về JSON schema.

```json
{
  "summary": "Claim is related to vehicle accident...",
  "missing_information": [
    "Police report is missing",
    "Repair invoice is missing"
  ],
  "fraud_indicators": [
    {
      "indicator": "Claim submitted 2 days after policy activation",
      "risk_level": "HIGH",
      "reason": "Short time between policy start and claim event"
    }
  ],
  "recommendation": "Request additional documents before approval",
  "confidence_score": 0.82
}
```

---

# 9. Prompt design ban đầu

## System Prompt

```text
You are an insurance claim analysis assistant.

Your role is to help claim officers review claim documents.

You must:
- Summarize the claim
- Identify missing information
- Detect possible fraud indicators
- Recommend next action

You must not:
- Make final claim approval decision
- Invent facts not found in the document
- Ignore uncertainty

Return output in strict JSON format.
```

## User Prompt

```text
Analyze the following claim document context:

{{retrieved_context}}

Claim metadata:

Claim number: {{claim_number}}
Policy number: {{policy_number}}
Customer name: {{customer_name}}

Return JSON with:
- summary
- missing_information
- fraud_indicators
- recommendation
- confidence_score
```

---

# 10. Implementation cụ thể

## Project structure

```text
ai-claim-assistant/
├── apps/
│   ├── frontend/              # NextJS
│   ├── backend/               # NestJS
│   └── ai-service/            # FastAPI
├── infra/
│   ├── docker-compose.yml
│   └── terraform/
└── docs/
    ├── architecture.md
    ├── adr/
    └── diagrams/
```

---

# 11. Backend NestJS structure

```text
backend/src/
├── claims/
│   ├── claims.controller.ts
│   ├── claims.service.ts
│   ├── claims.module.ts
│   └── dto/
├── ai-analysis/
│   ├── ai-analysis.controller.ts
│   ├── ai-analysis.service.ts
│   └── ai-client.service.ts
├── storage/
│   └── s3.service.ts
├── queue/
│   └── analysis.queue.ts
└── audit/
    └── audit.service.ts
```

---

## NestJS API example

```ts
@Post(':id/analyze')
async analyzeClaim(@Param('id') claimId: string) {
  return this.aiAnalysisService.analyzeClaim(claimId);
}
```

## ai-analysis.service.ts

```ts
async analyzeClaim(claimId: string) {
  const claim = await this.claimRepository.findById(claimId);

  const result = await this.aiClient.analyzeClaim({
    claimId: claim.id,
    claimNumber: claim.claimNumber,
    policyNumber: claim.policyNumber,
    customerName: claim.customerName
  });

  await this.analysisRepository.save({
    claimId: claim.id,
    summary: result.summary,
    missingInformation: result.missing_information,
    fraudIndicators: result.fraud_indicators,
    recommendation: result.recommendation,
    confidenceScore: result.confidence_score,
    modelName: result.model_name,
    promptVersion: result.prompt_version,
    inputTokens: result.input_tokens,
    outputTokens: result.output_tokens
  });

  return result;
}
```

---

# 12. AI Service FastAPI structure

```text
ai-service/
├── main.py
├── config.py
├── routers/
│   └── claims.py
├── services/
│   ├── document_loader.py
│   ├── chunking_service.py
│   ├── embedding_service.py
│   ├── retrieval_service.py
│   ├── llm_service.py
│   └── claim_analysis_service.py
├── prompts/
│   └── claim_analysis_v1.txt
└── schemas/
    └── claim_analysis.py
```

---

## FastAPI endpoint

```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ClaimAnalysisRequest(BaseModel):
    claim_id: str
    claim_number: str
    policy_number: str
    customer_name: str

@router.post("/claims/analyze")
async def analyze_claim(request: ClaimAnalysisRequest):
    result = await claim_analysis_service.analyze(request)
    return result
```

---

## Pydantic output schema

```python
from pydantic import BaseModel
from typing import List

class FraudIndicator(BaseModel):
    indicator: str
    risk_level: str
    reason: str

class ClaimAnalysisResult(BaseModel):
    summary: str
    missing_information: List[str]
    fraud_indicators: List[FraudIndicator]
    recommendation: str
    confidence_score: float
    model_name: str
    prompt_version: str
    input_tokens: int
    output_tokens: int
```

---

# 13. Retrieval logic

```python
async def retrieve_claim_context(claim_id: str, query: str):
    query_embedding = await embedding_service.embed(query)

    chunks = await vector_store.search(
        claim_id=claim_id,
        embedding=query_embedding,
        top_k=5
    )

    return "\n\n".join([chunk.text for chunk in chunks])
```

Query mẫu:

```text
Summarize claim event, policy details, accident description, claimed amount, evidence, missing documents, suspicious patterns.
```

---

# 14. LLM call logic

```python
async def analyze_claim(request):
    context = await retrieve_claim_context(
        claim_id=request.claim_id,
        query="claim summary missing documents fraud indicators recommendation"
    )

    prompt = build_prompt(
        context=context,
        claim_number=request.claim_number,
        policy_number=request.policy_number,
        customer_name=request.customer_name
    )

    response = await llm_service.generate_json(prompt)

    validated = ClaimAnalysisResult(**response)

    return validated
```

---

# 15. Docker compose cho local lab

```yaml
version: "3.9"

services:
  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: claims

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./apps/backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  ai-service:
    build: ./apps/ai-service
    ports:
      - "8000:8000"
    depends_on:
      - postgres
```

---

# 16. Minimum implementation scope cho Module 1

Bạn không cần build full production ngay.

Module 1 chỉ cần hoàn thành bản MVP sau:

## MVP Scope

```text
1. Upload PDF
2. Extract text
3. Save claim
4. Call LLM summarize
5. Return structured JSON
6. Save AI analysis result
```

Chưa cần:

```text
- Agent
- Multi-agent
- Complex RAG
- Full LLMOps
- Cost optimization
- Governance framework
```

---

# 17. Bài thực hành Module 1

## Exercise 1: Architecture Design

Tạo file:

```text
docs/architecture.md
```

Nội dung cần có:

```text
1. Business Context
2. Functional Requirements
3. Non-functional Requirements
4. Component Architecture
5. Data Flow
6. Security Considerations
7. Deployment View
8. Risks & Tradeoffs
```

---

## Exercise 2: API Design

Tạo API contract:

```http
POST /claims
GET /claims/:id
POST /claims/:id/analyze
GET /claims/:id/analysis
```

---

## Exercise 3: AI Prompt

Tạo prompt version đầu tiên:

```text
prompts/claim_analysis_v1.txt
```

---

## Exercise 4: JSON Schema

Tạo schema output chuẩn cho AI.

---

## Exercise 5: Simple Implementation

Build backend flow:

```text
Upload PDF → Extract text → Call LLM → Save result
```

---

# 18. Checklist hoàn thành Module 1

Bạn hoàn thành Module 1 khi có đủ:

```text
Architecture document
API contract
Database schema
Prompt v1
AI response schema
Working local demo
ADR-001
Basic audit log
```

---

# 19. ADR mẫu cho Module 1

```text
ADR-001: Separate AI Orchestrator from Backend API

Status: Accepted

Context:
The system needs to support AI workflows such as prompt building,
retrieval, LLM invocation, validation, retry and observability.

Decision:
Use NestJS for business API and FastAPI Python service for AI orchestration.

Reason:
Python ecosystem is stronger for AI/ML libraries.
NestJS remains suitable for business workflow and enterprise API.

Consequences:
Positive:
- Clear separation of concerns
- Easier AI experimentation
- Better support for Python AI libraries

Negative:
- More services to deploy
- More DevOps complexity
- Need service-to-service communication
```

---

# 20. Kết quả bạn nên đạt được

Sau Module 1, bạn nên có khả năng giải thích như một architect:

> Hệ thống AI này không chỉ gọi LLM. Nó có frontend, backend, document processing, AI orchestration, prompt management, vector search, database, audit log, security và human review. AI chỉ đóng vai trò assistant, còn quyết định cuối cùng vẫn do con người.

Đây chính là tư duy nền tảng của **AI Technical Architect**.
