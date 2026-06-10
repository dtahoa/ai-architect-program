Dưới đây là **Module 2: AI-First System Design** theo hướng Architect: thiết kế hệ thống bắt đầu từ AI capability, không chỉ “gắn AI vào backend hiện có”.

---

# Module 2: AI-First System Design

## 1. Mục tiêu của Module 2

Module 1 giúp bạn hiểu hệ thống AI gồm những layer nào.

Module 2 giúp bạn trả lời câu hỏi quan trọng hơn:

> Nếu thiết kế một sản phẩm từ đầu với AI là capability chính, kiến trúc sẽ khác gì so với hệ thống SaaS truyền thống?

---

# 2. AI-First khác AI-Retrofit như thế nào?

## AI-Retrofit

Là hệ thống có sẵn, sau đó thêm AI vào.

Ví dụ:

```text
Existing Claim System
        |
        v
Add AI Summary Button
```

Ưu điểm:

```text
Nhanh
Ít thay đổi kiến trúc
Phù hợp POC
```

Nhược điểm:

```text
AI bị gắn thêm vào như một feature phụ
Khó scale AI workflow
Khó kiểm soát quality, cost, governance
```

---

## AI-First

Là thiết kế hệ thống ngay từ đầu với AI là core workflow.

Ví dụ:

```text
Claim Intake
   |
AI Document Understanding
   |
AI Risk Assessment
   |
Human Review
   |
Final Decision
```

Ở đây AI không chỉ là nút “Summarize”. AI tham gia vào workflow chính.

---

# 3. Use Case cho Module 2

Ta dùng bài toán:

## AI Insurance Claim Intake Platform

Hệ thống tiếp nhận hồ sơ claim và dùng AI để hỗ trợ xử lý từ đầu.

### Business flow

```text
Customer submits claim
        |
AI checks document completeness
        |
AI extracts key information
        |
AI classifies claim type
        |
AI identifies risk signals
        |
Claim officer reviews
        |
Officer approves next action
```

---

# 4. Kiến trúc tổng thể Module 2

```text
[Customer / Claim Officer]
          |
          v
[NextJS Frontend]
          |
          v
[NestJS Backend API]
          |
          v
[Workflow Orchestrator]
          |
          +-------------------------------+
          |                               |
          v                               v
[AI Orchestrator]                  [Business Services]
          |                               |
          v                               v
[Prompt Layer]                     [Claim / Policy DB]
          |
          v
[Retriever]
          |
          v
[Vector Database]
          |
          v
[LLM Provider]
          |
          v
[Guardrails + Validation]
          |
          v
[Human Review Queue]
```

Điểm khác biệt lớn nhất so với Module 1:

> Module 2 bắt đầu đưa AI vào workflow chính, có orchestration, state machine, retry, fallback, human approval và evaluation.

---

# 5. Các building block chính

## 5.1 Frontend Layer

Frontend không chỉ hiển thị kết quả AI. Nó phải hỗ trợ **AI-assisted workflow**.

### Screens cần có

```text
1. Claim Submission
2. AI Processing Status
3. Extracted Information Review
4. Missing Document Checklist
5. Risk Signals
6. Human Approval Panel
```

### UX pattern

Thay vì:

```text
Upload PDF → Click Analyze → Show Text
```

Nên là:

```text
Upload claim
   |
AI auto-process
   |
Show extracted fields
   |
Human confirms / edits
   |
AI continues risk analysis
```

---

## 5.2 Backend API Layer

Backend chịu trách nhiệm business workflow.

### Responsibilities

```text
Claim lifecycle
User permission
Workflow state
Audit log
Human approval
Integration với Policy System
Integration với Payment / CRM / Notification
```

### Không nên

Không nên để backend controller gọi LLM trực tiếp.

Sai:

```ts
@Post('/claims/:id/analyze')
async analyze() {
  return openai.chat.completions.create(...)
}
```

Đúng:

```ts
@Post('/claims/:id/start-intake')
async startIntake(@Param('id') claimId: string) {
  return this.claimWorkflowService.startIntakeWorkflow(claimId);
}
```

Backend chỉ điều phối workflow.

---

## 5.3 Workflow Orchestrator

Đây là phần rất quan trọng trong AI-First Design.

Với hệ thống truyền thống, bạn có thể xử lý request-response đơn giản.

Với AI workflow, cần xử lý nhiều bước:

```text
Extract document
Validate extracted fields
Classify claim
Retrieve policy
Assess risk
Ask human review
Continue after approval
```

### Công nghệ có thể dùng

```text
Temporal
AWS Step Functions
Azure Durable Functions
BullMQ
Camunda
```

### Với bạn, giai đoạn học nên dùng

```text
BullMQ nếu muốn đơn giản
Temporal nếu muốn học chuẩn production
AWS Step Functions nếu deploy AWS
```

---

# 6. AI Workflow cụ thể

## Claim Intake Workflow

```text
START
  |
  v
Upload Document
  |
  v
Extract Text
  |
  v
AI Extract Structured Fields
  |
  v
Validate Required Fields
  |
  +--------------------+
  | Missing Info?       |
  +--------------------+
      | Yes                     | No
      v                         v
Request More Info        Classify Claim Type
                                |
                                v
                         Retrieve Policy Context
                                |
                                v
                         Risk Assessment
                                |
                                v
                         Human Review
                                |
                                v
                         Finalize Intake
```

---

# 7. Domain model

## Claim

```ts
type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_PROCESSING'
  | 'WAITING_FOR_CUSTOMER'
  | 'WAITING_FOR_REVIEW'
  | 'REVIEWED'
  | 'REJECTED'
  | 'APPROVED';
```

## Claim Intake Result

```ts
interface ClaimIntakeResult {
  claimId: string;
  claimType: 'AUTO' | 'HEALTH' | 'PROPERTY' | 'TRAVEL';
  extractedFields: ExtractedClaimFields;
  missingFields: string[];
  riskSignals: RiskSignal[];
  recommendation: string;
  confidenceScore: number;
}
```

---

# 8. Database design

## claims table

```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  claim_number VARCHAR(100),
  customer_id UUID,
  policy_number VARCHAR(100),
  claim_type VARCHAR(50),
  status VARCHAR(50),
  submitted_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## claim_documents table

```sql
CREATE TABLE claim_documents (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  document_type VARCHAR(100),
  file_url TEXT,
  extracted_text TEXT,
  processing_status VARCHAR(50),
  created_at TIMESTAMP
);
```

## claim_extracted_fields table

```sql
CREATE TABLE claim_extracted_fields (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  fields JSONB,
  confidence JSONB,
  prompt_version VARCHAR(50),
  model_name VARCHAR(100),
  created_at TIMESTAMP
);
```

## claim_risk_assessments table

```sql
CREATE TABLE claim_risk_assessments (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  risk_level VARCHAR(50),
  risk_signals JSONB,
  recommendation TEXT,
  confidence_score NUMERIC,
  created_at TIMESTAMP
);
```

## human_review_tasks table

```sql
CREATE TABLE human_review_tasks (
  id UUID PRIMARY KEY,
  claim_id UUID REFERENCES claims(id),
  assigned_to UUID,
  status VARCHAR(50),
  ai_recommendation TEXT,
  human_decision VARCHAR(50),
  human_comment TEXT,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

---

# 9. API design cụ thể

## Submit claim

```http
POST /claims
```

Request:

```json
{
  "customerId": "cus_001",
  "policyNumber": "POL-123",
  "claimType": "AUTO"
}
```

Response:

```json
{
  "claimId": "claim_001",
  "status": "DRAFT"
}
```

---

## Upload document

```http
POST /claims/{claimId}/documents
Content-Type: multipart/form-data
```

Response:

```json
{
  "documentId": "doc_001",
  "status": "UPLOADED"
}
```

---

## Start AI intake workflow

```http
POST /claims/{claimId}/intake/start
```

Response:

```json
{
  "workflowId": "wf_001",
  "status": "AI_PROCESSING"
}
```

---

## Get intake result

```http
GET /claims/{claimId}/intake/result
```

Response:

```json
{
  "claimId": "claim_001",
  "claimType": "AUTO",
  "extractedFields": {
    "accidentDate": "2026-06-01",
    "location": "Sydney",
    "vehicleRegistration": "ABC123",
    "claimedAmount": 2500
  },
  "missingFields": [
    "policeReportNumber"
  ],
  "riskSignals": [
    {
      "signal": "Claim submitted shortly after policy start",
      "level": "MEDIUM",
      "reason": "Policy started 3 days before accident date"
    }
  ],
  "recommendation": "Request police report before proceeding",
  "confidenceScore": 0.81
}
```

---

# 10. AI Orchestrator design

## AI service structure

```text
ai-service/
├── main.py
├── routers/
│   └── claim_intake.py
├── workflows/
│   └── claim_intake_workflow.py
├── services/
│   ├── document_extraction_service.py
│   ├── field_extraction_service.py
│   ├── claim_classification_service.py
│   ├── policy_retrieval_service.py
│   ├── risk_assessment_service.py
│   ├── guardrail_service.py
│   └── llm_service.py
├── prompts/
│   ├── extract_claim_fields_v1.txt
│   ├── classify_claim_v1.txt
│   └── risk_assessment_v1.txt
└── schemas/
    ├── claim_fields.py
    ├── claim_classification.py
    └── risk_assessment.py
```

---

# 11. Prompt architecture

Trong AI-First Design, prompt không nên nằm rải rác trong code.

Nên quản lý prompt như artifact.

```text
prompts/
├── extract_claim_fields_v1.txt
├── classify_claim_v1.txt
├── risk_assessment_v1.txt
```

---

## Prompt 1: Extract claim fields

```text
You are an insurance claim intake assistant.

Extract structured information from the claim document.

Rules:
- Only extract facts present in the document.
- Do not infer missing information.
- If a field is missing, return null.
- Return strict JSON only.

Required fields:
- accident_date
- accident_location
- claim_amount
- policy_number
- customer_name
- incident_description
- involved_parties
- supporting_documents
```

Expected output:

```json
{
  "accident_date": "2026-06-01",
  "accident_location": "Sydney",
  "claim_amount": 2500,
  "policy_number": "POL-123",
  "customer_name": "John Smith",
  "incident_description": "Rear-end collision...",
  "involved_parties": ["Driver A", "Driver B"],
  "supporting_documents": ["Repair invoice", "Photo evidence"]
}
```

---

## Prompt 2: Classify claim

```text
Classify the claim into one of the following categories:

- AUTO
- HEALTH
- PROPERTY
- TRAVEL
- OTHER

Use only the document content and extracted fields.

Return JSON:
{
  "claim_type": "...",
  "confidence_score": 0.0,
  "reason": "..."
}
```

---

## Prompt 3: Risk assessment

```text
You are an insurance claim risk assessment assistant.

Assess risk signals based on:
- Claim document
- Extracted fields
- Policy context
- Historical rules

You must not make final approval or rejection decisions.

Return JSON:
{
  "risk_level": "LOW | MEDIUM | HIGH",
  "risk_signals": [],
  "recommendation": "...",
  "confidence_score": 0.0
}
```

---

# 12. Implementation cụ thể bằng NestJS + FastAPI + BullMQ

## Backend workflow service

```ts
@Injectable()
export class ClaimWorkflowService {
  constructor(
    private readonly queue: Queue,
    private readonly claimsRepo: ClaimsRepository,
  ) {}

  async startIntakeWorkflow(claimId: string) {
    await this.claimsRepo.updateStatus(claimId, 'AI_PROCESSING');

    const job = await this.queue.add('claim-intake', {
      claimId,
    });

    return {
      workflowId: job.id,
      status: 'AI_PROCESSING',
    };
  }
}
```

---

## BullMQ processor

```ts
@Processor('claim-workflow')
export class ClaimWorkflowProcessor {
  constructor(
    private readonly aiClient: AiClientService,
    private readonly claimsRepo: ClaimsRepository,
  ) {}

  @Process('claim-intake')
  async processClaimIntake(job: Job<{ claimId: string }>) {
    const { claimId } = job.data;

    const result = await this.aiClient.runClaimIntake({
      claimId,
    });

    if (result.missingFields.length > 0) {
      await this.claimsRepo.updateStatus(claimId, 'WAITING_FOR_CUSTOMER');
    } else {
      await this.claimsRepo.updateStatus(claimId, 'WAITING_FOR_REVIEW');
    }

    return result;
  }
}
```

---

## AI client service

```ts
@Injectable()
export class AiClientService {
  constructor(private readonly httpService: HttpService) {}

  async runClaimIntake(input: { claimId: string }) {
    const response = await this.httpService.axiosRef.post(
      `${process.env.AI_SERVICE_URL}/claim-intake/run`,
      input,
    );

    return response.data;
  }
}
```

---

# 13. FastAPI implementation

## Endpoint

```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ClaimIntakeRequest(BaseModel):
    claim_id: str

@router.post("/claim-intake/run")
async def run_claim_intake(request: ClaimIntakeRequest):
    result = await claim_intake_workflow.run(request.claim_id)
    return result
```

---

## Workflow

```python
class ClaimIntakeWorkflow:
    async def run(self, claim_id: str):
        documents = await document_service.get_documents(claim_id)

        extracted_text = await document_extraction_service.extract_all(
            documents
        )

        extracted_fields = await field_extraction_service.extract(
            extracted_text
        )

        missing_fields = validation_service.find_missing_fields(
            extracted_fields
        )

        classification = await claim_classification_service.classify(
            extracted_text,
            extracted_fields
        )

        policy_context = await policy_retrieval_service.retrieve(
            extracted_fields.policy_number
        )

        risk_assessment = await risk_assessment_service.assess(
            extracted_text=extracted_text,
            extracted_fields=extracted_fields,
            policy_context=policy_context
        )

        return {
            "claim_id": claim_id,
            "claim_type": classification.claim_type,
            "extracted_fields": extracted_fields.model_dump(),
            "missing_fields": missing_fields,
            "risk_signals": risk_assessment.risk_signals,
            "recommendation": risk_assessment.recommendation,
            "confidence_score": risk_assessment.confidence_score
        }
```

---

# 14. Output validation bằng Pydantic

## Extracted fields schema

```python
from pydantic import BaseModel
from typing import Optional, List

class ExtractedClaimFields(BaseModel):
    accident_date: Optional[str]
    accident_location: Optional[str]
    claim_amount: Optional[float]
    policy_number: Optional[str]
    customer_name: Optional[str]
    incident_description: Optional[str]
    involved_parties: List[str] = []
    supporting_documents: List[str] = []
```

---

## Risk signal schema

```python
class RiskSignal(BaseModel):
    signal: str
    level: str
    reason: str

class RiskAssessmentResult(BaseModel):
    risk_level: str
    risk_signals: list[RiskSignal]
    recommendation: str
    confidence_score: float
```

---

# 15. Guardrails cần có trong Module 2

AI-First không có nghĩa là cho AI tự quyết.

Cần guardrails:

```text
1. AI không được approve/reject claim
2. AI phải trả JSON schema
3. Nếu thiếu thông tin, phải flag missing fields
4. Nếu confidence thấp, bắt buộc human review
5. Nếu risk HIGH, bắt buộc escalation
6. Mọi output AI phải lưu audit log
```

---

## Rule engine đơn giản

```python
def apply_guardrails(result):
    actions = []

    if result["confidence_score"] < 0.7:
        actions.append("REQUIRE_HUMAN_REVIEW")

    if result["risk_level"] == "HIGH":
        actions.append("ESCALATE_TO_SENIOR_REVIEWER")

    if len(result["missing_fields"]) > 0:
        actions.append("REQUEST_MORE_INFORMATION")

    return actions
```

---

# 16. Human-in-the-Loop architecture

AI-First production system gần như luôn cần human review, đặc biệt với Insurance và Healthcare.

```text
AI Recommendation
        |
        v
Human Review Task
        |
        v
Officer Accepts / Edits / Rejects
        |
        v
Audit Log
        |
        v
Workflow Continues
```

## Human review API

```http
POST /claims/{claimId}/review
```

Request:

```json
{
  "decision": "REQUEST_MORE_INFO",
  "comment": "Police report is missing.",
  "editedFields": {
    "claimAmount": 2500
  }
}
```

---

# 17. Sequence diagram

```text
User
 |
 | submit claim
 v
Frontend
 |
 | POST /claims
 v
NestJS Backend
 |
 | create claim
 v
PostgreSQL
 |
 | upload document
 v
S3 / Blob Storage
 |
 | start workflow
 v
BullMQ / Temporal
 |
 | call AI service
 v
FastAPI AI Orchestrator
 |
 | extract fields
 v
LLM
 |
 | classify claim
 v
LLM
 |
 | risk assessment
 v
LLM
 |
 | validate JSON
 v
FastAPI
 |
 | return result
 v
NestJS Backend
 |
 | save AI result
 v
PostgreSQL
 |
 | create human review task
 v
Frontend
```

---

# 18. Deployment architecture local

```text
Docker Compose
├── frontend: NextJS
├── backend: NestJS
├── ai-service: FastAPI
├── postgres: PostgreSQL + pgvector
├── redis: BullMQ
└── minio: Local S3
```

---

## docker-compose.yml

```yaml
version: "3.9"

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: ai_claims
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

# 19. Production architecture trên AWS

```text
CloudFront
   |
NextJS on Amplify / ECS
   |
API Gateway / ALB
   |
NestJS Backend on ECS
   |
SQS / EventBridge / Step Functions
   |
FastAPI AI Service on ECS
   |
+-----------------------------+
| S3                          |
| RDS PostgreSQL              |
| OpenSearch / pgvector       |
| Bedrock / OpenAI / Azure AI |
| CloudWatch                  |
+-----------------------------+
```

---

# 20. Non-functional requirements

Với Module 2, bạn bắt đầu cần nghĩ như Architect.

## Availability

```text
Backend API: 99.9%
AI workflow: eventual consistency acceptable
LLM provider failure: fallback required
```

## Performance

```text
Claim submission: < 2s
Document extraction: async
AI intake workflow: < 2 minutes
Human review: async
```

## Security

```text
Encrypt documents at rest
Encrypt traffic in transit
RBAC for claim officers
Audit all AI outputs
Mask PII in logs
```

## Cost

```text
Avoid repeated LLM calls
Cache extracted fields
Store prompt version and token usage
Use smaller model for classification
Use stronger model for risk assessment
```

---

# 21. Model routing strategy

Không phải bước nào cũng dùng model mạnh nhất.

```text
Field Extraction       → GPT-4.1 mini / Claude Haiku
Claim Classification   → small model
Risk Assessment        → stronger model
Final Summary          → stronger model
```

Architect phải biết chia model theo workload.

---

# 22. Implementation scope cho Module 2

Bạn không cần build full enterprise system ngay.

## MVP cần hoàn thành

```text
1. Submit claim
2. Upload document
3. Start AI intake workflow
4. Extract structured fields
5. Detect missing fields
6. Classify claim type
7. Generate risk assessment
8. Create human review task
9. Save audit log
```

## Không cần ở Module 2

```text
Multi-agent
Fine-tuning
Advanced monitoring
Semantic cache
Full governance framework
```

---

# 23. Bài thực hành Module 2

## Exercise 1: AI-First Architecture Document

Tạo file:

```text
docs/module-02-ai-first-system-design.md
```

Nội dung:

```text
1. Business goal
2. AI-first workflow
3. System context
4. Component architecture
5. Sequence diagram
6. Data model
7. API design
8. Human-in-the-loop design
9. Guardrails
10. Risks and tradeoffs
```

---

## Exercise 2: Workflow Implementation

Build:

```text
POST /claims/:id/intake/start
```

Flow:

```text
Backend
  |
Queue
  |
AI Service
  |
Save Result
  |
Create Review Task
```

---

## Exercise 3: Prompt Implementation

Tạo 3 prompt:

```text
extract_claim_fields_v1.txt
classify_claim_v1.txt
risk_assessment_v1.txt
```

---

## Exercise 4: ADR

Viết ADR:

```text
ADR-002: Use async workflow for AI claim intake
```

Decision:

```text
Use asynchronous workflow instead of synchronous request-response.
```

Reason:

```text
AI document processing can take long time.
LLM calls may fail or timeout.
Workflow needs retry and human review.
```

---

# 24. ADR mẫu cho Module 2

```text
ADR-002: Use Asynchronous Workflow for AI Claim Intake

Status: Accepted

Context:
The AI claim intake process includes multiple long-running steps:
document extraction, field extraction, claim classification,
policy retrieval, risk assessment, validation, and human review.

A synchronous HTTP request-response model would be fragile because
LLM calls may timeout, document processing may take minutes, and
some workflows require human approval.

Options:
1. Synchronous API call from Backend to AI Service
2. Background job queue using BullMQ
3. Durable workflow engine using Temporal or AWS Step Functions

Decision:
Use BullMQ for the learning MVP.
For production, consider Temporal or AWS Step Functions.

Rationale:
BullMQ is simple to implement with NestJS and Redis.
It supports background processing, retry, and job status tracking.
It is suitable for MVP and local development.

Consequences:
Positive:
- Better user experience
- Avoids HTTP timeout
- Allows retry and failure handling
- Supports workflow status tracking

Negative:
- Adds Redis dependency
- Requires job monitoring
- Workflow state must be carefully managed
```

---

# 25. Kết quả cần đạt sau Module 2

Sau Module 2, bạn phải có thể giải thích:

> AI-First System Design nghĩa là thiết kế workflow xoay quanh AI capability, nhưng vẫn giữ con người, business rules, audit log, guardrails và workflow state ở trung tâm. AI không tự quyết định nghiệp vụ, AI hỗ trợ workflow để con người ra quyết định tốt hơn.

Đây là tư duy rất quan trọng để đi từ **Tech Lead** lên **AI Technical Architect**.
