# Module 6: AI Cloud & Infrastructure Architecture

Module 6 giúp bạn trả lời câu hỏi:

> Làm sao deploy một hệ thống AI lên cloud theo hướng production-ready: secure, scalable, observable, cost-aware và dễ vận hành?

Ở Module 1–5, bạn đã học architecture logic. Module 6 chuyển sang **cloud runtime architecture**.

---

# 1. Mục tiêu Module 6

Sau module này, bạn cần hiểu:

```text
1. AI workload nên deploy ở đâu
2. Backend, AI Service, Vector DB, Storage kết nối thế nào
3. Dùng AWS/Azure service nào
4. Network/security thiết kế ra sao
5. Scale AI service thế nào
6. Monitor token, latency, error, cost thế nào
7. Thiết kế multi-region, DR, data residency ra sao
8. Provision bằng Terraform/IaC như thế nào
```

---

# 2. Use case

Tiếp tục dùng:

## AI Insurance Claims Copilot

Thành phần chính:

```text
NextJS Frontend
NestJS Backend API
FastAPI AI Orchestrator
PostgreSQL
Vector Database
Object Storage
Queue / Workflow Engine
LLM Provider
Observability
Secrets Management
```

---

# 3. Cloud Architecture tổng thể

```text
Users
 |
 v
CDN / WAF
 |
 v
Frontend Hosting
 |
 v
API Gateway / Load Balancer
 |
 v
Backend API
 |
 +----------------------+
 |                      |
 v                      v
Database             Object Storage
PostgreSQL           S3 / Azure Blob
 |
 v
Queue / Workflow Engine
 |
 v
AI Orchestrator Service
 |
 +----------------------+
 |                      |
 v                      v
Vector Store          LLM Provider
pgvector/OpenSearch   Bedrock/Azure OpenAI/OpenAI
 |
 v
Observability / Audit / Cost Monitoring
```

---

# 4. AWS Reference Architecture

AWS phù hợp nếu công ty bạn đang chạy SaaS trên AWS.

```text
Route 53
 |
CloudFront
 |
AWS WAF
 |
NextJS on Amplify / ECS / S3 Static Hosting
 |
API Gateway / ALB
 |
ECS Fargate - NestJS Backend
 |
SQS / Step Functions
 |
ECS Fargate - FastAPI AI Service
 |
+--------------------------------------+
| S3 - Raw Documents                   |
| RDS PostgreSQL + pgvector            |
| OpenSearch Vector Search             |
| Bedrock / OpenAI / Azure OpenAI      |
| Secrets Manager                      |
| CloudWatch                           |
| X-Ray / OpenTelemetry                |
+--------------------------------------+
```

AWS Bedrock là dịch vụ managed để dùng foundation models và các capability như knowledge bases, agents và guardrails trong hệ sinh thái AWS. AWS cũng có guidance riêng cho generative AI trong Well-Architected Framework. ([Amazon Web Services, Inc.][1])

---

# 5. Azure Reference Architecture

Azure phù hợp nếu enterprise dùng Microsoft ecosystem.

```text
Azure Front Door
 |
WAF
 |
Static Web Apps / App Service / Container Apps
 |
API Management
 |
Container Apps / AKS - NestJS Backend
 |
Service Bus / Durable Functions
 |
Container Apps / AKS - FastAPI AI Service
 |
+--------------------------------------+
| Azure Blob Storage                   |
| Azure Database for PostgreSQL        |
| Azure AI Search                      |
| Azure OpenAI / Microsoft Foundry     |
| Key Vault                            |
| Application Insights                 |
| Log Analytics                        |
+--------------------------------------+
```

Microsoft Foundry được định vị là enterprise AI platform để build, ground và govern AI apps/agents ở quy mô lớn; Azure cũng cung cấp hạ tầng cloud toàn cầu cho AI workloads. ([Azure AI][2])

---

# 6. Cloud service mapping

| Architecture Layer | AWS                   | Azure                         |
| ------------------ | --------------------- | ----------------------------- |
| CDN/WAF            | CloudFront + WAF      | Azure Front Door + WAF        |
| API Gateway        | API Gateway / ALB     | API Management                |
| Container Runtime  | ECS Fargate / EKS     | Container Apps / AKS          |
| Object Storage     | S3                    | Azure Blob Storage            |
| Database           | RDS PostgreSQL        | Azure Database for PostgreSQL |
| Vector Search      | OpenSearch / pgvector | Azure AI Search / pgvector    |
| Queue              | SQS                   | Service Bus                   |
| Workflow           | Step Functions        | Durable Functions             |
| Secrets            | Secrets Manager       | Key Vault                     |
| LLM                | Bedrock / OpenAI      | Azure OpenAI / Foundry        |
| Logs               | CloudWatch            | Application Insights          |
| IaC                | Terraform / CDK       | Terraform / Bicep             |

---

# 7. Concrete MVP Architecture

Với background của bạn, MVP nên dùng architecture này:

```text
NextJS
 |
NestJS Backend
 |
BullMQ / Redis
 |
FastAPI AI Service
 |
PostgreSQL + pgvector
 |
MinIO locally / S3 on AWS
 |
OpenAI or Azure OpenAI
 |
Langfuse
```

Production AWS version:

```text
CloudFront
 |
ALB
 |
ECS Fargate Services
 |       |
NestJS   FastAPI
 |
SQS
 |
RDS PostgreSQL + pgvector
 |
S3
 |
Secrets Manager
 |
CloudWatch + Langfuse
```

---

# 8. Network Architecture

## Public subnet

Chỉ nên chứa:

```text
Load Balancer
NAT Gateway
Bastion nếu cần, nhưng nên tránh
```

## Private subnet

Nên chứa:

```text
Backend API
AI Service
Database
Redis
Vector DB
Internal services
```

## External access

```text
User → CloudFront/WAF → ALB/API Gateway → Backend
```

Không cho user gọi trực tiếp:

```text
AI Service
Database
Vector DB
S3 private bucket
```

---

# 9. Security Architecture

## Nguyên tắc

```text
Default private
Least privilege
Encrypt everything
No hardcoded secrets
Audit every AI output
PII must not appear in logs
```

## Cần có

```text
TLS everywhere
S3 bucket private
Database in private subnet
Secrets in Secrets Manager / Key Vault
IAM role per service
Security group minimum access
WAF for public endpoint
Audit log for document access
```

---

# 10. AI-specific security

AI infra khác backend thường ở chỗ có thêm:

```text
Prompt injection risk
Sensitive data leakage
Model provider data boundary
Embedding data lifecycle
Tool-call authorization
Human review for high-risk output
```

Ví dụ rule:

```text
FastAPI AI Service được gọi LLM Provider
NestJS Backend không gọi trực tiếp LLM
Frontend không bao giờ gọi LLM Provider
LLM không được tự gọi action nguy hiểm như approve_claim
```

---

# 11. Deployment Architecture

## Container services

Tách riêng:

```text
backend-api
ai-service
worker-service
```

Không nên gom tất cả vào một container.

```text
backend-api:
  handles HTTP business API

ai-service:
  handles AI orchestration

worker-service:
  handles indexing, embedding, async processing
```

---

# 12. ECS Fargate implementation example

## Dockerfile cho FastAPI

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Dockerfile cho NestJS

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["node", "dist/main.js"]
```

---

# 13. Terraform structure

```text
infra/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
├── modules/
│   ├── network/
│   ├── ecs/
│   ├── rds/
│   ├── s3/
│   ├── sqs/
│   ├── secrets/
│   └── observability/
└── main.tf
```

---

# 14. Terraform AWS skeleton

## S3 bucket

```hcl
resource "aws_s3_bucket" "claim_documents" {
  bucket = "${var.project_name}-${var.environment}-claim-documents"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "claim_documents" {
  bucket = aws_s3_bucket.claim_documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

## SQS queue

```hcl
resource "aws_sqs_queue" "ai_jobs" {
  name                       = "${var.project_name}-${var.environment}-ai-jobs"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 1209600
}
```

## RDS PostgreSQL

```hcl
resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-${var.environment}-postgres"
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t4g.medium"
  allocated_storage = 100

  db_name  = "claims"
  username = var.db_username
  password = var.db_password

  publicly_accessible = false
  storage_encrypted   = true
  skip_final_snapshot = false
}
```

---

# 15. Application config

Không hardcode config.

## Backend env

```text
DATABASE_URL
AI_SERVICE_URL
SQS_QUEUE_URL
S3_BUCKET_NAME
JWT_PUBLIC_KEY
```

## AI Service env

```text
OPENAI_API_KEY
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
EMBEDDING_MODEL
VECTOR_DB_URL
LANGFUSE_PUBLIC_KEY
LANGFUSE_SECRET_KEY
```

Trong production, các giá trị này nên nằm trong:

```text
AWS Secrets Manager
Azure Key Vault
```

---

# 16. Async processing architecture

AI workload thường lâu và dễ timeout.

Không nên:

```text
Frontend waits 2 minutes for AI result
```

Nên:

```text
Frontend starts job
Backend queues job
Worker processes
Frontend polls / websocket receives status
```

Flow:

```text
POST /claims/{id}/analyze
 |
Backend creates job
 |
SQS / BullMQ
 |
AI Worker processes
 |
DB updated
 |
Frontend reads status
```

---

# 17. Job status model

```sql
CREATE TABLE ai_jobs (
  id UUID PRIMARY KEY,
  claim_id UUID,
  job_type VARCHAR(100),
  status VARCHAR(50),
  attempts INT,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

Status:

```text
QUEUED
RUNNING
COMPLETED
FAILED
RETRYING
CANCELLED
```

---

# 18. Scaling strategy

## Backend API scaling

Scale theo:

```text
CPU
Memory
Request count
Latency
```

## AI Service scaling

Scale theo:

```text
Queue depth
Number of running jobs
LLM latency
Token throughput
```

## Worker scaling

```text
If SQS visible messages > threshold
increase worker replicas
```

---

# 19. Rate limit & backpressure

LLM provider có rate limit. Architect phải thiết kế backpressure.

Cần có:

```text
Queue
Retry with exponential backoff
Circuit breaker
Provider fallback
Token budget
Max concurrent AI jobs
```

Pseudo-code:

```python
class RateLimitPolicy:
    def should_process(self, tenant_id: str):
        usage = usage_repository.get_current_usage(tenant_id)

        if usage.tokens_today > usage.daily_token_limit:
            return False

        if usage.running_jobs > usage.max_concurrent_jobs:
            return False

        return True
```

---

# 20. Observability Architecture

AI observability cần nhiều hơn logs thường.

Cần track:

```text
Prompt version
Model name
Input tokens
Output tokens
Latency
Cost estimate
JSON validation errors
Retrieval sources
Human correction rate
Provider error rate
```

Architecture:

```text
App logs
 |
CloudWatch / App Insights
 |
OpenTelemetry traces
 |
Langfuse AI traces
 |
Dashboard
 |
Alerts
```

---

# 21. ai_runs table

```sql
CREATE TABLE ai_runs (
  id UUID PRIMARY KEY,
  claim_id UUID,
  tenant_id UUID,
  task_name VARCHAR(100),
  model_provider VARCHAR(100),
  model_name VARCHAR(100),
  prompt_name VARCHAR(100),
  prompt_version VARCHAR(50),
  input_tokens INT,
  output_tokens INT,
  latency_ms INT,
  estimated_cost NUMERIC,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 22. Monitoring alerts

Tạo alert cho:

```text
AI error rate > 5%
P95 latency > 60s
JSON validation failure > 2%
Queue depth > threshold
Token cost/day > budget
RDS CPU > 80%
S3 upload failure > 1%
Embedding job failure > 3%
```

---

# 23. Deployment pipeline

## CI/CD flow

```text
Pull Request
 |
Unit Tests
 |
Build Docker Image
 |
Security Scan
 |
Push Image to Registry
 |
Deploy to Dev
 |
Run Integration Tests
 |
Deploy to Staging
 |
Manual Approval
 |
Deploy to Production
```

---

## GitHub Actions skeleton

```yaml
name: Deploy AI Claims Copilot

on:
  push:
    branches:
      - main

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build backend image
        run: docker build -t backend:${{ github.sha }} ./apps/backend

  build-ai-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build AI service image
        run: docker build -t ai-service:${{ github.sha }} ./apps/ai-service
```

---

# 24. Multi-region architecture

Với Insurance/Healthcare, cần nghĩ về:

```text
Data residency
Disaster recovery
Latency
Compliance
Failover
```

Ví dụ:

```text
Primary region: ap-southeast-2 Sydney
Secondary region: ap-southeast-1 Singapore
Optional: eu-west-2 London for UK customers
```

Architecture:

```text
Global DNS
 |
Primary Region
 |-- App services
 |-- Database primary
 |-- S3 primary
 |
Secondary Region
 |-- Warm standby services
 |-- Read replica / backup restore
 |-- Replicated documents
```

---

# 25. DR strategy

| Component    | DR Strategy                           |
| ------------ | ------------------------------------- |
| Frontend     | Redeploy from image                   |
| Backend      | Multi-AZ / redeploy                   |
| AI Service   | Stateless, redeploy                   |
| PostgreSQL   | Multi-AZ + snapshots + replica        |
| S3           | Versioning + cross-region replication |
| Vector DB    | Rebuild from chunks or replicate      |
| Queue        | Region-local, replay from DB          |
| LLM Provider | Fallback provider                     |

Key principle:

> Vector index should be rebuildable from source documents, chunks and embeddings metadata.

---

# 26. Data residency

Với customer ở UK/AU, architect phải quyết định:

```text
Documents lưu ở region nào?
Embedding lưu ở region nào?
LLM provider xử lý ở region nào?
Logs có chứa PII không?
Backup có cross-region không?
```

Rule mẫu:

```text
AU customers → data stored in Sydney
UK customers → data stored in London
Cross-region replication only if contract allows
No raw PII in centralized logs
```

---

# 27. Production hardening checklist

```text
Private networking
WAF enabled
DB not public
S3 private
Secrets Manager / Key Vault
IAM least privilege
Autoscaling enabled
Health checks
Blue/green deployment
Audit logs
AI run logs
Cost alerts
Backup and restore tested
Prompt version tracked
Model fallback tested
```

---

# 28. ADR mẫu Module 6

## ADR-010: Deploy AI Services as Separate Containers

```text
Status: Accepted

Context:
The Claims Copilot contains business APIs and AI workloads. AI workloads
include document processing, embedding generation, RAG retrieval, LLM calls,
and evaluation. These workloads have different scaling, dependency, and
runtime characteristics from standard API traffic.

Options:
1. Deploy Backend API and AI logic in one service
2. Deploy AI Service as a separate containerized service
3. Use only managed AI workflow services

Decision:
Deploy Backend API and AI Service as separate containers.

Rationale:
Separating services allows independent scaling, clearer ownership, better
dependency isolation, and easier experimentation with Python AI libraries.

Consequences:
Positive:
- Backend and AI workloads scale independently
- Cleaner separation of concerns
- Easier AI experimentation
- Better observability per workload

Negative:
- More deployment complexity
- Requires service-to-service security
- Requires distributed tracing
```

---

## ADR-011: Use Asynchronous Queue for AI Workloads

```text
Status: Accepted

Context:
AI workloads can take seconds or minutes due to document extraction,
embedding, retrieval, and LLM calls. Synchronous HTTP calls risk timeout
and poor user experience.

Decision:
Use queue-based asynchronous processing for AI jobs.

Rationale:
Queues provide retry, backpressure, workload isolation, and better UX.

Consequences:
Positive:
- Avoids HTTP timeout
- Supports retry
- Handles LLM provider latency
- Enables worker autoscaling

Negative:
- More operational complexity
- Need job status tracking
- Need dead-letter queue
```

---

# 29. Bài thực hành Module 6

## Exercise 1: Cloud Architecture Document

Tạo:

```text
docs/module-06-cloud-infrastructure.md
```

Nội dung:

```text
1. Target cloud architecture
2. AWS/Azure service mapping
3. Network diagram
4. Security design
5. Deployment design
6. Scaling strategy
7. Observability design
8. DR strategy
9. Cost considerations
10. ADRs
```

---

## Exercise 2: Dockerize services

Build:

```text
apps/backend/Dockerfile
apps/ai-service/Dockerfile
docker-compose.yml
```

---

## Exercise 3: Terraform MVP

Provision:

```text
VPC
Private subnets
S3 bucket
RDS PostgreSQL
SQS queue
ECS cluster
Secrets Manager
CloudWatch log groups
```

---

## Exercise 4: Async AI worker

Implement:

```text
POST /claims/{id}/analyze
→ create job
→ push queue
→ worker process
→ update status
```

---

## Exercise 5: Observability

Log mỗi AI run:

```text
model
prompt_version
tokens
latency
cost
status
error
```

---

# 30. Checklist hoàn thành Module 6

Bạn hoàn thành Module 6 khi có:

```text
Cloud architecture diagram
AWS/Azure service mapping
Dockerized backend
Dockerized AI service
Queue-based worker
Terraform base infrastructure
Private storage/database design
Secrets management
AI observability table
Cost alerts design
ADR-010
ADR-011
```

---

# Kết quả cần đạt

Sau Module 6, bạn phải giải thích được:

> AI production system không chỉ là app gọi LLM. Nó cần cloud architecture gồm private network, container runtime, object storage, database, vector search, queue, AI worker, secrets, monitoring, cost control, backup, DR và data residency. AI workload nên chạy async, tách khỏi backend API và có observability riêng cho prompt, token, latency, cost và model quality.

[1]: https://aws.amazon.com/?utm_source=chatgpt.com "Cloud Computing Services - Amazon Web Services (AWS)"
[2]: https://ai.azure.com/?utm_source=chatgpt.com "Microsoft Foundry"
