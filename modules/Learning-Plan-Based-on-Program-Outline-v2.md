Với mục tiêu của bạn là **AI Technical Architect**, tôi khuyên nên xây dựng tài liệu theo hướng **12 tuần học + 10 module + 1 capstone project xuyên suốt**, thay vì học rời rạc từng chương.

Dựa trên background của bạn (Tech Lead, AWS/Azure, SaaS, Healthcare, Insurance), tôi đã thiết kế một roadmap thực hành ở mức gần với yêu cầu của các vị trí:

* AI Technical Architect
* AI Solution Architect
* GenAI Architect
* Principal Engineer (AI)

---

# Giai đoạn 0: Chuẩn bị môi trường (Tuần 0)

## Mục tiêu

Chuẩn hóa môi trường AI Development

### Cài đặt

```bash
VS Code

Python 3.12

Docker

NodeJS 22

AWS CLI

Azure CLI

Terraform

Postman

GitHub Copilot
```

---

## Tạo Lab Environment

### AWS

* S3
* Lambda
* ECS
* OpenSearch
* Bedrock

### Azure

* Azure OpenAI
* AI Search
* Storage Account

---

# Module 1

# Foundations of AI Technical Architecture

## Learning Outcome

Sau chương này bạn phải trả lời được:

> Một hệ thống AI Production gồm những thành phần nào?

---

## Kiến trúc AI hiện đại

```text
Users
 ↓
Frontend
 ↓
API Gateway
 ↓
AI Orchestrator
 ↓
LLM
 ↓
Knowledge Base
 ↓
Vector Database
 ↓
Enterprise Systems
```

---

## Thực hành 1

### Bài toán

Thiết kế

```text
Insurance Claim Assistant
```

### Chức năng

* Upload claim document
* Summarize
* Fraud hint
* Recommendation

---

## Deliverable

Tạo:

### Context Diagram

```text
Customer
    |
Claim Portal
    |
AI Service
    |
OpenAI
```

---

### Container Diagram

```text
Frontend (React)

Backend (NestJS)

AI Service (Python)

Postgres

Vector DB

OpenAI
```

---

### ADR

Ví dụ

```text
ADR-001

Decision:

Use OpenAI GPT

Reason:

Fast implementation

Tradeoff:

Vendor lock-in
```

---

# Module 2

# AI First System Design

## Learning Outcome

Biết thiết kế hệ thống bắt đầu từ AI thay vì backend.

---

## Học

### AI Request Lifecycle

```text
User Question
 ↓
Prompt Builder
 ↓
Retriever
 ↓
Context Assembly
 ↓
LLM
 ↓
Guardrails
 ↓
Response
```

---

## Thực hành

### Build

```text
AI Customer Support Assistant
```

---

## Stack

Frontend

```text
NextJS
```

Backend

```text
NestJS
```

AI

```text
LangGraph
OpenAI
```

---

## Deliverables

### Sequence Diagram

```text
User

Frontend

AI Gateway

Retriever

LLM
```

---

### Capacity Planning

Tính:

```text
1000 users/day

Average 20 requests

20,000 AI requests/day
```

---

# Module 3

# Technology Selection

Đây là phần kiến trúc sư phải làm tốt.

---

## Assignment

So sánh

### Vector Database

1. Pinecone

2. Weaviate

3. pgvector

---

## Template

| Criteria    | Pinecone | Weaviate | pgvector |
| ----------- | -------- | -------- | -------- |
| Cost        |          |          |          |
| Scale       |          |          |          |
| HA          |          |          |          |
| Maintenance |          |          |          |

---

## Kết quả mong đợi

Biết chọn:

```text
POC → pgvector

SME → Weaviate

Enterprise → Pinecone
```

---

# Module 4

# Data Architecture

## Learning Outcome

Hiểu dữ liệu trong AI quan trọng hơn model.

---

## Xây Pipeline

```text
PDF

↓

Extract

↓

Chunk

↓

Embedding

↓

Vector DB
```

---

## Thực hành

### Build

Enterprise Document Search

---

### Dataset

Insurance Policies

Claims Procedures

Medical Guidelines

---

## Tools

```python
LangChain

OpenAI Embeddings

OpenSearch
```

---

## Coding Task

Tạo:

```python
document_ingestion.py
```

gồm

* PDF Loader
* Chunker
* Embedder
* Indexer

---

# Module 5

# GenAI Architecture Patterns

## Học 5 Pattern

### Pattern 1

Prompt Engineering

```text
User
 ↓
LLM
```

---

### Pattern 2

RAG

```text
User
 ↓
Retriever
 ↓
LLM
```

---

### Pattern 3

Agent

```text
User
 ↓
Agent
 ↓
Tool
```

---

### Pattern 4

Multi-Agent

```text
Coordinator
 ↓
Workers
```

---

### Pattern 5

Human Approval

```text
AI
 ↓
Reviewer
 ↓
Execute
```

---

## Thực hành

Xây

```text
Cyber Security Incident Copilot
```

Agent:

* Log Analyzer
* Threat Analyzer
* Report Writer

---

# Module 6

# AI Infrastructure

## AWS Focus

### Bedrock

Hiểu:

* Claude
* Titan
* Nova

---

### OpenSearch

Learn

* Vector Search
* Hybrid Search

---

### ECS

Deploy AI Service

---

### Terraform

Provision

```text
S3
OpenSearch
ECS
```

---

## Thực hành

### Deploy

AI Assistant lên AWS

---

### Deliverable

Terraform module

```text
infra/
```

---

# Module 7

# FinOps for AI

Đây là phần rất ít AI Engineer biết.

---

## Học

### Cost Formula

```text
Input Tokens

+

Output Tokens

+

Embedding Tokens
```

---

## Lab

### Cho bài toán

```text
1 million requests/month
```

---

### Tính

GPT

Claude

Gemini

---

## Deliverable

Excel

```text
ai_cost_estimation.xlsx
```

---

# Module 8

# AI Security

Quan trọng với Insurance và Healthcare.

---

## Học

### OWASP LLM Top 10

* Prompt Injection
* Data Leakage
* Jailbreak
* Insecure Output

---

## Assignment

Threat Model

```text
Healthcare AI Assistant
```

---

## Deliverables

### DFD

Data Flow Diagram

---

### STRIDE Analysis

| Threat | Impact | Mitigation |
| ------ | ------ | ---------- |

---

# Module 9

# MLOps & LLMOps

## Learning Outcome

Biết vận hành AI Production.

---

## Build Pipeline

```text
GitHub

↓

CI

↓

Deploy

↓

Evaluate

↓

Monitor
```

---

## Tool

```text
GitHub Actions

Langfuse

OpenTelemetry

Prometheus
```

---

## Thực hành

Triển khai

```text
Prompt Versioning
```

---

# Module 10

# Leadership

Đây là nơi phân biệt Senior Engineer và Architect.

---

## Học

### Architecture Review

### Executive Presentation

### Stakeholder Management

### Cost Communication

---

## Assignment

Viết

```text
AI Adoption Roadmap
```

cho công ty bảo hiểm.

---

# Capstone Project (4 tuần)

## Chủ đề đề xuất

### AI Insurance Claims Copilot

Rất phù hợp với background của bạn.

---

## Phase 1

Document Ingestion

```text
PDF

OCR

Chunking

Embedding
```

---

## Phase 2

RAG

```text
Knowledge Base

Vector Search

Answer Generation
```

---

## Phase 3

Multi-Agent

Agents:

* Claims Agent
* Fraud Agent
* Compliance Agent
* Recommendation Agent

---

## Phase 4

Human Approval

```text
AI Recommendation

↓

Claims Officer

↓

Approve
```

---

# Portfolio cuối khóa

Nếu hoàn thành toàn bộ roadmap, bạn nên có:

### GitHub Repositories

1. ai-document-ingestion
2. enterprise-rag-platform
3. ai-insurance-copilot
4. llmops-pipeline
5. ai-cost-estimator

### Architecture Artifacts

* Context Diagram
* C4 Diagram
* Sequence Diagram
* ADR
* Threat Model
* Cost Model
* Deployment Diagram

### Technical Documents

* Solution Design Document
* AI Governance Plan
* FinOps Report
* Executive Summary

Đây là bộ hồ sơ đủ mạnh để ứng tuyển các vị trí AI Technical Architect tại các công ty SaaS, Insurance, Healthcare hoặc Consulting, đồng thời tận dụng tối đa kinh nghiệm 15 năm của bạn thay vì đi theo lộ trình AI Engineer từ đầu.
