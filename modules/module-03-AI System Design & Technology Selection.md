Dưới đây là **Module 3: AI System Design & Technology Selection** — phần giúp bạn chuyển từ “biết build AI app” sang “biết chọn kiến trúc và công nghệ đúng như một AI Technical Architect”.

---

# Module 3 là gì?

Module 3 tập trung vào câu hỏi:

> Với một bài toán AI cụ thể, nên chọn LLM nào, vector database nào, orchestration nào, cloud service nào, monitoring nào, và tại sao?

Architect không chỉ chọn công nghệ vì “hot”, mà phải dựa trên:

```text
Business requirement
Compliance
Cost
Scale
Team skill
Vendor lock-in
Latency
Maintainability
Production readiness
```

---

# 1. Use case thực hành

Ta tiếp tục dùng hệ thống:

## AI Insurance Claims Copilot

Chức năng chính:

```text
Upload claim document
Extract information
Search policy knowledge base
Analyze risk
Generate recommendation
Human review
Audit result
```

---

# 2. Architecture tổng thể Module 3

```text
[NextJS Frontend]
        |
        v
[NestJS Backend API]
        |
        v
[Workflow Orchestrator]
        |
        v
[AI Orchestrator Service]
        |
        +-------------------------------+
        |                               |
        v                               v
[LLM Gateway]                    [Knowledge Retrieval]
        |                               |
        v                               v
[Model Provider]                 [Vector Database]
OpenAI / Azure OpenAI            pgvector / Pinecone
Claude / Bedrock                 Weaviate / OpenSearch
        |
        v
[Structured Output Validator]
        |
        v
[Evaluation & Monitoring]
Langfuse / LangSmith / Arize
```

Điểm quan trọng trong Module 3:

> Không gọi trực tiếp OpenAI/Claude từ business code. Nên có **LLM Gateway** và **Technology Abstraction Layer** để dễ đổi model, đổi vector DB, kiểm soát cost và monitoring.

---

# 3. AI Technology Stack cần chọn

## 3.1 LLM Provider

Các lựa chọn phổ biến:

```text
OpenAI
Azure OpenAI
Anthropic Claude
AWS Bedrock
Google Gemini
```

### Khi nào chọn OpenAI?

Phù hợp khi:

```text
POC nhanh
Developer experience tốt
Structured output tốt
Tool calling tốt
Không bị ràng buộc mạnh về data residency
```

OpenAI Structured Outputs hỗ trợ ép model trả về theo JSON Schema, rất hữu ích cho các workflow như extract claim fields, risk analysis, report generation. ([OpenAI Developers][1])

---

### Khi nào chọn Azure OpenAI?

Phù hợp khi:

```text
Enterprise
Insurance
Healthcare
Cần private networking
Cần compliance
Cần tích hợp Azure ecosystem
```

Azure OpenAI cũng hỗ trợ Structured Outputs để model trả về đúng JSON Schema, phù hợp với multi-step workflow và data extraction. ([Microsoft Learn][2])

---

### Khi nào chọn AWS Bedrock?

Phù hợp khi:

```text
Đang chạy AWS
Muốn dùng Claude / Titan / Nova qua AWS
Muốn IAM, VPC, CloudWatch, Guardrails
Muốn data nằm trong AWS ecosystem
```

---

## 3.2 Vector Database

Các lựa chọn:

```text
pgvector
Pinecone
Weaviate
OpenSearch Vector Search
Azure AI Search
```

---

## So sánh nhanh

| Criteria       | pgvector                | Pinecone         | Weaviate                 | OpenSearch        |
| -------------- | ----------------------- | ---------------- | ------------------------ | ----------------- |
| Best for       | MVP, SME                | Large scale SaaS | Semantic search platform | AWS enterprise    |
| Cost           | Thấp                    | Trung bình/cao   | Trung bình               | Trung bình/cao    |
| Ops effort     | Thấp nếu đã có Postgres | Thấp             | Trung bình               | Trung bình/cao    |
| Scale          | Vừa                     | Cao              | Cao                      | Cao               |
| Vendor lock-in | Thấp                    | Cao hơn          | Trung bình               | AWS lock-in       |
| Team fit       | Backend team dễ học     | AI/product team  | Search team              | AWS/platform team |

PostgreSQL là hệ quản trị cơ sở dữ liệu mã nguồn mở có lịch sử phát triển lâu dài và nổi tiếng về reliability, extensibility và feature robustness. ([PostgreSQL][3]) Pinecone là vector database fully managed, nhấn mạnh việc indexing tự động và query nhanh ở quy mô lớn. ([Pinecone][4])

---

# 4. Decision Matrix cho Module 3

Architect nên dùng bảng chấm điểm.

## Ví dụ: chọn Vector DB

| Criteria            | Weight | pgvector | Pinecone | Weaviate |
| ------------------- | -----: | -------: | -------: | -------: |
| Cost                |    25% |        5 |        3 |        3 |
| Scale               |    20% |        3 |        5 |        4 |
| Maintenance         |    20% |        4 |        5 |        3 |
| Team familiarity    |    15% |        5 |        3 |        3 |
| Enterprise features |    10% |        3 |        5 |        4 |
| Portability         |    10% |        5 |        2 |        3 |

### Kết luận mẫu

```text
For Module 3 MVP, choose pgvector.

Reason:
- Team already uses PostgreSQL
- Data volume is moderate
- Cost is low
- Easier local development
- Good enough for first production-like MVP

Revisit:
When document volume > 5M chunks or query latency becomes unstable,
evaluate Pinecone or OpenSearch.
```

---

# 5. Architecture cụ thể đề xuất

## Option A: MVP Architecture

Phù hợp học tập và POC.

```text
NextJS
  |
NestJS API
  |
FastAPI AI Service
  |
OpenAI / Azure OpenAI
  |
PostgreSQL + pgvector
  |
Langfuse
```

### Khi dùng

```text
Team nhỏ
Dữ liệu dưới vài trăm nghìn chunks
Muốn build nhanh
Chi phí thấp
```

---

## Option B: AWS Production Architecture

```text
CloudFront
  |
NextJS on ECS / Amplify
  |
ALB / API Gateway
  |
NestJS Backend on ECS
  |
SQS / Step Functions
  |
FastAPI AI Service on ECS
  |
Bedrock / Azure OpenAI / OpenAI
  |
OpenSearch Vector Search
  |
RDS PostgreSQL
  |
S3
  |
CloudWatch + Langfuse
```

### Khi dùng

```text
Enterprise
AWS-first company
Need IAM, VPC, CloudWatch
Need managed search infra
```

---

## Option C: Enterprise Multi-Provider Architecture

```text
Frontend
  |
Backend API
  |
Workflow Engine
  |
AI Gateway
  |
+----------------------------+
| Model Router               |
| - OpenAI                   |
| - Azure OpenAI             |
| - Claude via Bedrock       |
| - Gemini                   |
+----------------------------+
  |
Prompt Registry
  |
Retriever Interface
  |
+----------------------------+
| Vector Store Adapter       |
| - pgvector                 |
| - Pinecone                 |
| - OpenSearch               |
+----------------------------+
  |
Evaluation + Observability
```

### Khi dùng

```text
Muốn tránh vendor lock-in
Muốn route request theo cost/quality
Muốn fallback khi provider lỗi
Muốn enterprise-grade AI platform
```

---

# 6. Implementation cụ thể

## 6.1 Project structure

```text
ai-claims-copilot/
├── apps/
│   ├── frontend/
│   ├── backend/
│   └── ai-service/
├── packages/
│   ├── ai-gateway/
│   ├── vector-store/
│   └── prompt-registry/
├── infra/
│   ├── docker-compose.yml
│   └── terraform/
└── docs/
    ├── adr/
    └── technology-selection.md
```

---

# 7. AI Gateway Pattern

## Vì sao cần AI Gateway?

Không nên để code business gọi trực tiếp:

```python
openai.chat.completions.create(...)
```

Vì sau này bạn sẽ khó:

```text
Đổi model
Thêm fallback
Log token
Theo dõi cost
Áp guardrails
Test quality
```

Nên tạo abstraction:

```text
Application
    |
AI Gateway
    |
Model Provider Adapter
```

---

## Interface mẫu

```python
from abc import ABC, abstractmethod
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class LLMGateway(ABC):
    @abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        output_schema: Type[T],
        model: str,
        temperature: float = 0
    ) -> T:
        pass
```

---

## OpenAI implementation

```python
class OpenAILLMGateway(LLMGateway):
    def __init__(self, client):
        self.client = client

    async def generate_structured(
        self,
        prompt: str,
        output_schema: Type[T],
        model: str,
        temperature: float = 0
    ) -> T:
        response = await self.client.responses.parse(
            model=model,
            input=prompt,
            text_format=output_schema,
            temperature=temperature,
        )

        return response.output_parsed
```

Ý tưởng ở đây là tận dụng structured output để ép response theo schema thay vì parse text tự do. Với workflow AI production, đây là điểm cực kỳ quan trọng. ([OpenAI Developers][1])

---

# 8. Model Router

## Mục tiêu

Không phải task nào cũng dùng model mạnh nhất.

```text
Document extraction      → Small/medium model
Claim classification     → Small model
Fraud/risk assessment    → Strong model
Executive summary        → Strong model
```

---

## Routing config

```yaml
tasks:
  extract_claim_fields:
    primary: gpt-4.1-mini
    fallback: claude-haiku
    temperature: 0

  classify_claim:
    primary: gpt-4.1-mini
    fallback: gpt-4.1
    temperature: 0

  risk_assessment:
    primary: gpt-4.1
    fallback: claude-sonnet
    temperature: 0.1

  final_summary:
    primary: claude-sonnet
    fallback: gpt-4.1
    temperature: 0.2
```

---

## Router implementation

```python
class ModelRouter:
    def __init__(self, config: dict):
        self.config = config

    def route(self, task_name: str) -> dict:
        if task_name not in self.config["tasks"]:
            raise ValueError(f"Unknown AI task: {task_name}")

        return self.config["tasks"][task_name]
```

---

## Usage

```python
async def extract_claim_fields(document_text: str):
    route = model_router.route("extract_claim_fields")

    return await llm_gateway.generate_structured(
        prompt=build_extract_prompt(document_text),
        output_schema=ExtractedClaimFields,
        model=route["primary"],
        temperature=route["temperature"]
    )
```

---

# 9. Vector Store Adapter Pattern

## Vì sao cần adapter?

Nếu bạn viết code dính chặt vào pgvector:

```python
pgvector.search(...)
```

Sau này đổi sang Pinecone hoặc OpenSearch sẽ rất khó.

Nên thiết kế interface:

```python
class VectorStore(ABC):
    async def upsert(self, documents): pass
    async def search(self, query, top_k): pass
```

---

## Interface mẫu

```python
from abc import ABC, abstractmethod
from typing import List

class VectorDocument:
    def __init__(self, id: str, text: str, embedding: list[float], metadata: dict):
        self.id = id
        self.text = text
        self.embedding = embedding
        self.metadata = metadata

class VectorSearchResult:
    def __init__(self, text: str, score: float, metadata: dict):
        self.text = text
        self.score = score
        self.metadata = metadata

class VectorStore(ABC):
    @abstractmethod
    async def upsert(self, documents: List[VectorDocument]):
        pass

    @abstractmethod
    async def search(
        self,
        embedding: list[float],
        top_k: int,
        filters: dict
    ) -> List[VectorSearchResult]:
        pass
```

---

# 10. pgvector implementation

## Database schema

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  claim_id UUID,
  document_id UUID,
  chunk_index INT,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX document_chunks_embedding_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## Search query

```sql
SELECT
  id,
  content,
  metadata,
  1 - (embedding <=> $1) AS similarity
FROM document_chunks
WHERE claim_id = $2
ORDER BY embedding <=> $1
LIMIT $3;
```

---

## Python adapter

```python
class PgVectorStore(VectorStore):
    def __init__(self, db):
        self.db = db

    async def upsert(self, documents: list[VectorDocument]):
        for doc in documents:
            await self.db.execute(
                """
                INSERT INTO document_chunks
                (id, claim_id, document_id, chunk_index, content, embedding, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id)
                DO UPDATE SET
                  content = EXCLUDED.content,
                  embedding = EXCLUDED.embedding,
                  metadata = EXCLUDED.metadata
                """,
                doc.id,
                doc.metadata["claim_id"],
                doc.metadata["document_id"],
                doc.metadata["chunk_index"],
                doc.text,
                doc.embedding,
                doc.metadata,
            )

    async def search(self, embedding: list[float], top_k: int, filters: dict):
        rows = await self.db.fetch(
            """
            SELECT
              content,
              metadata,
              1 - (embedding <=> $1) AS similarity
            FROM document_chunks
            WHERE claim_id = $2
            ORDER BY embedding <=> $1
            LIMIT $3
            """,
            embedding,
            filters["claim_id"],
            top_k,
        )

        return [
            VectorSearchResult(
                text=row["content"],
                score=row["similarity"],
                metadata=row["metadata"],
            )
            for row in rows
        ]
```

---

# 11. Prompt Registry

## Vấn đề

Nếu prompt nằm trong code:

```python
prompt = "You are an insurance assistant..."
```

Bạn sẽ khó:

```text
Version prompt
Rollback
A/B testing
Evaluate quality
Audit production output
```

---

## Prompt structure

```text
prompts/
├── extract_claim_fields/
│   ├── v1.txt
│   └── v2.txt
├── risk_assessment/
│   ├── v1.txt
│   └── v2.txt
└── summary/
    ├── v1.txt
    └── v2.txt
```

---

## Prompt metadata

```yaml
name: risk_assessment
version: v1
owner: ai-platform-team
model: gpt-4.1
created_at: 2026-06-08
description: Initial risk assessment prompt for insurance claims.
```

---

## Prompt loader

```python
class PromptRegistry:
    def __init__(self, base_path: str):
        self.base_path = base_path

    def load(self, name: str, version: str) -> str:
        path = f"{self.base_path}/{name}/{version}.txt"

        with open(path, "r", encoding="utf-8") as file:
            return file.read()
```

---

# 12. Technology selection theo từng layer

## Layer 1: Frontend

### Recommended

```text
NextJS
React Query
TailwindCSS
```

### Reason

```text
Bạn đã có background React/NextJS
Dễ build claim workflow UI
Dễ deploy trên Vercel/AWS Amplify/ECS
```

---

## Layer 2: Backend API

### Recommended

```text
NestJS
PostgreSQL
Prisma
BullMQ
```

### Reason

```text
Bạn mạnh NestJS
Phù hợp enterprise API
Có module structure rõ
BullMQ dễ dùng cho async workflow
```

---

## Layer 3: AI Service

### Recommended

```text
FastAPI
Pydantic
OpenAI SDK / Azure OpenAI SDK
LangGraph sau Module 5
```

### Reason

```text
Python ecosystem mạnh hơn cho AI
Pydantic phù hợp structured output validation
FastAPI nhẹ, nhanh, dễ tách service
```

---

## Layer 4: Vector Store

### Recommended cho Module 3

```text
PostgreSQL + pgvector
```

### Reason

```text
Học nhanh
Chi phí thấp
Local development tốt
Dễ hiểu bản chất vector search
Không bị phụ thuộc managed vendor quá sớm
```

---

## Layer 5: Workflow

### Recommended cho Module 3

```text
BullMQ
```

### Reason

```text
Đủ cho MVP
Tích hợp tốt với NestJS
Dễ retry
Dễ track job status
```

---

## Layer 6: Observability

### Recommended

```text
Langfuse
OpenTelemetry
Prometheus/Grafana sau
```

### Reason

```text
Cần theo dõi prompt, latency, token usage, model output
```

---

# 13. Concrete architecture cho Module 3 MVP

```text
User
 |
 v
NextJS Frontend
 |
 v
NestJS Backend API
 |
 |-- PostgreSQL: claims, users, audit logs
 |
 |-- Redis: BullMQ jobs
 |
 v
FastAPI AI Service
 |
 |-- Prompt Registry
 |-- Model Router
 |-- LLM Gateway
 |-- Vector Store Adapter
 |
 |-- OpenAI / Azure OpenAI
 |
 v
PostgreSQL + pgvector
 |
 v
Langfuse Observability
```

---

# 14. End-to-end implementation flow

## Flow: Analyze claim with technology abstraction

```text
1. User submits claim
2. Backend creates claim
3. Backend queues AI job
4. AI Service loads prompt version
5. AI Service retrieves relevant chunks via VectorStore interface
6. AI Service routes task to selected model
7. LLM Gateway calls provider
8. Structured output validates JSON
9. Result stored in DB
10. Langfuse logs prompt, model, latency, tokens
11. Human review task created
```

---

# 15. API contract

## Start analysis

```http
POST /claims/{claimId}/analysis/start
```

Response:

```json
{
  "claimId": "claim_001",
  "jobId": "job_789",
  "status": "QUEUED"
}
```

---

## Get analysis result

```http
GET /claims/{claimId}/analysis
```

Response:

```json
{
  "claimId": "claim_001",
  "summary": "The claim relates to a vehicle accident...",
  "riskLevel": "MEDIUM",
  "riskSignals": [
    {
      "signal": "Claim submitted shortly after policy activation",
      "level": "MEDIUM",
      "reason": "Policy started 5 days before incident date"
    }
  ],
  "recommendation": "Request additional evidence before proceeding.",
  "model": "gpt-4.1",
  "promptVersion": "risk_assessment:v1",
  "vectorStore": "pgvector",
  "confidenceScore": 0.82
}
```

---

# 16. Database tables cho technology tracking

## ai_runs

```sql
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY,
  claim_id UUID,
  task_name VARCHAR(100),
  model_provider VARCHAR(100),
  model_name VARCHAR(100),
  prompt_name VARCHAR(100),
  prompt_version VARCHAR(50),
  input_tokens INT,
  output_tokens INT,
  latency_ms INT,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## technology_decisions

```sql
CREATE TABLE technology_decisions (
  id UUID PRIMARY KEY,
  adr_id VARCHAR(50),
  title TEXT,
  decision TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 17. Evaluation criteria

Module 3 không chỉ “chọn tool”. Bạn cần đo được lựa chọn đó có đúng không.

## Metrics cần theo dõi

```text
LLM latency
Cost per claim
Accuracy of extracted fields
JSON validation error rate
Retrieval precision
Human correction rate
Provider failure rate
```

---

## Ví dụ target

```text
Extraction accuracy: > 90%
JSON validation success: > 98%
Average AI latency: < 30 seconds
Cost per claim: < $0.10 for MVP
Human correction rate: decreasing over time
```

---

# 18. ADR mẫu cho Module 3

## ADR-003: Use pgvector as Initial Vector Database

```text
Status: Accepted

Context:
The AI Insurance Claims Copilot requires semantic search over claim
documents, policy documents, and supporting evidence. The system needs
a vector database for storing embeddings and retrieving relevant chunks
during RAG workflows.

Current constraints:
- MVP stage
- Team already uses PostgreSQL
- Expected volume is below 500,000 document chunks
- Cost must be minimized
- Local development should be simple

Options:
1. pgvector
2. Pinecone
3. Weaviate
4. OpenSearch Vector Search

Decision:
Use PostgreSQL with pgvector for the MVP.

Rationale:
pgvector allows the team to store embeddings in the existing PostgreSQL
database. This reduces operational complexity, minimizes cost, and makes
local development easier. It is sufficient for the expected MVP scale.

Consequences:
Positive:
- Low operational cost
- Easy local setup
- Reuse existing PostgreSQL skills
- Lower infrastructure complexity

Negative:
- May not scale as well as dedicated vector databases
- Requires index tuning as data grows
- Advanced hybrid search features may be limited

Revisit:
Re-evaluate this decision when:
- Document chunks exceed 5 million
- Query latency exceeds 500ms at P95
- Multi-tenant isolation becomes complex
- Search relevance becomes difficult to tune
```

---

# 19. ADR mẫu thứ hai

## ADR-004: Introduce LLM Gateway

```text
Status: Accepted

Context:
The system needs to call multiple LLM providers for different AI tasks:
field extraction, claim classification, summarization, and risk assessment.

Calling providers directly from business logic would create tight coupling,
make provider migration difficult, and reduce visibility into token usage,
latency, and errors.

Options:
1. Call OpenAI directly from each service
2. Create a shared LLM Gateway abstraction
3. Use a third-party LLM gateway platform

Decision:
Create an internal LLM Gateway abstraction for the MVP.

Rationale:
An internal gateway gives us control over provider selection, prompt version,
structured output validation, retries, fallback, logging, and cost tracking.

Consequences:
Positive:
- Easier to switch providers
- Centralized logging and token tracking
- Supports fallback strategy
- Cleaner business logic

Negative:
- More upfront engineering effort
- Gateway must be maintained
- Requires clear interface design
```

---

# 20. Bài thực hành Module 3

## Exercise 1: Technology Selection Document

Tạo file:

```text
docs/module-03-technology-selection.md
```

Nội dung:

```text
1. Business Context
2. Functional Requirements
3. Non-functional Requirements
4. Technology Options
5. Decision Matrix
6. Final Decisions
7. Risks
8. Revisit Criteria
```

---

## Exercise 2: Implement LLM Gateway

Build:

```text
ai-service/gateways/llm_gateway.py
ai-service/gateways/openai_gateway.py
ai-service/gateways/azure_openai_gateway.py
```

Mục tiêu:

```text
Application không biết đang gọi OpenAI hay Azure OpenAI.
Application chỉ gọi LLMGateway interface.
```

---

## Exercise 3: Implement Vector Store Adapter

Build:

```text
ai-service/vectorstores/base.py
ai-service/vectorstores/pgvector_store.py
```

Mục tiêu:

```text
RAG workflow không phụ thuộc trực tiếp pgvector.
Sau này có thể đổi sang Pinecone/OpenSearch.
```

---

## Exercise 4: Implement Prompt Registry

Build:

```text
ai-service/prompts/
ai-service/prompt_registry.py
```

Mục tiêu:

```text
Prompt có version.
AI run lưu prompt version.
Có thể rollback prompt.
```

---

## Exercise 5: Write ADR

Viết 3 ADR:

```text
ADR-003: Use pgvector as initial vector database
ADR-004: Introduce LLM Gateway
ADR-005: Use structured output for AI result validation
```

---

# 21. Checklist hoàn thành Module 3

Bạn hoàn thành Module 3 khi có:

```text
Technology selection document
Decision matrix
ADR-003 Vector DB
ADR-004 LLM Gateway
ADR-005 Structured Output
LLM Gateway implementation
Vector Store interface
pgvector implementation
Prompt Registry
AI run logging
Working claim analysis flow
```

---

# 22. Kết quả cần đạt

Sau Module 3, bạn phải giải thích được như một AI Architect:

> Chúng ta chọn pgvector không phải vì nó tốt nhất mọi trường hợp, mà vì nó phù hợp nhất với MVP: chi phí thấp, team quen PostgreSQL, scale hiện tại vừa đủ. Đồng thời chúng ta thiết kế Vector Store Adapter để sau này có thể chuyển sang Pinecone hoặc OpenSearch khi scale tăng. Tương tự, LLM Gateway giúp tránh coupling trực tiếp với một provider và hỗ trợ routing, fallback, logging, cost control.

Đây chính là tư duy **AI System Design & Technology Selection**.

[1]: https://developers.openai.com/api/docs/guides/structured-outputs?utm_source=chatgpt.com "Structured model outputs | OpenAI API"
[2]: https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/structured-outputs?utm_source=chatgpt.com "How to use structured outputs with Azure OpenAI ..."
[3]: https://www.postgresql.org/?utm_source=chatgpt.com "PostgreSQL: The world's most advanced open source database"
[4]: https://www.pinecone.io/?utm_source=chatgpt.com "Pinecone: The vector database to build knowledgeable AI"
