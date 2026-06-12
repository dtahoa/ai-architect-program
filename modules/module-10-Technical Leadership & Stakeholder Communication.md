# Module 10: Technical Leadership & Stakeholder Communication

Module 10 là phần chuyển bạn từ:

```text
Senior/Tech Lead biết build system
```

sang:

```text
AI Technical Architect biết dẫn dắt quyết định kỹ thuật
```

---

# 1. Mục tiêu Module 10

Sau module này, bạn cần làm tốt 5 việc:

```text
1. Giải thích architecture cho nhiều nhóm khác nhau
2. Viết ADR rõ ràng
3. Trình bày trade-off kỹ thuật
4. Giao tiếp cost, risk, timeline
5. Xây AI adoption roadmap
```

Architect không chỉ hỏi:

```text
Build thế nào?
```

Mà phải trả lời:

```text
Tại sao chọn cách này?
Rủi ro là gì?
Chi phí thế nào?
Ai chịu trách nhiệm?
Khi nào nên scale?
Nếu sai thì rollback ra sao?
```

---

# 2. Architect phải giao tiếp với ai?

## Engineering team

Họ cần biết:

```text
Component nào build trước
Interface thế nào
Coding standard
Deployment strategy
Failure handling
```

## Product Owner

Họ cần biết:

```text
Feature nào có thể làm
MVP scope là gì
AI limitation là gì
Timeline thế nào
```

## Business stakeholders

Họ cần biết:

```text
Business value
Cost
Risk
Compliance
ROI
```

## Security / Compliance

Họ cần biết:

```text
Data flow
PII handling
Audit log
Human review
Access control
```

## Executive

Họ cần biết:

```text
Tại sao đầu tư
Lộ trình 3–6–12 tháng
Rủi ro lớn nhất
Chi phí dự kiến
```

---

# 3. Cốt lõi của Module 10

## Architect không chỉ nói “nên dùng gì”

Ví dụ câu trả lời yếu:

```text
Chúng ta nên dùng LangGraph, pgvector, OpenAI.
```

Câu trả lời của architect:

```text
Với MVP, chúng ta chọn pgvector vì team đã dùng PostgreSQL,
data volume hiện tại chưa lớn, chi phí thấp và dễ vận hành.

Tuy nhiên, nếu vượt 5 triệu chunks hoặc P95 search latency > 500ms,
chúng ta sẽ đánh giá lại Pinecone hoặc OpenSearch.

Quyết định này được ghi trong ADR-003.
```

---

# 4. Deliverables quan trọng của Architect

Một AI Technical Architect nên tạo được:

```text
1. Architecture Vision
2. C4 Diagram
3. Sequence Diagram
4. ADR
5. Risk Register
6. Cost Estimate
7. Security & Governance Plan
8. AI Roadmap
9. Executive Summary
10. Technical Implementation Plan
```

---

# 5. Architecture Communication theo từng level

## Level 1: Executive View

Dùng cho CEO/CTO/Product Head.

```text
Goal:
Reduce claim processing time by 40%.

Solution:
AI Claims Copilot supports document summarization,
missing document detection, policy Q&A and risk recommendation.

Control:
AI does not approve or reject claims.
Final decision remains with human claim officer.
```

Không nên nói quá sâu:

```text
Embedding vector dimension
LangGraph node
pgvector index type
```

---

## Level 2: Product View

Dùng cho PO/BA/Delivery Manager.

```text
MVP Scope:
- Upload claim document
- Extract claim fields
- Summarize claim
- Detect missing information
- Generate recommendation
- Human review

Out of scope:
- Auto approval
- Full fraud automation
- Fine-tuning
- Multi-agent workflow
```

---

## Level 3: Engineering View

Dùng cho dev team.

```text
Frontend: NextJS
Backend: NestJS
AI Service: FastAPI
Queue: BullMQ/SQS
Storage: S3
Database: PostgreSQL + pgvector
LLM: Azure OpenAI/OpenAI
Observability: Langfuse
```

---

## Level 4: Security View

Dùng cho Security/Compliance.

```text
Controls:
- Tenant isolation
- Secure retrieval with tenant_id + claim_id
- PII masking in logs
- Prompt injection detection
- Human review for high-risk output
- AI audit trail
```

---

# 6. ADR là công cụ lãnh đạo kỹ thuật

ADR = Architecture Decision Record.

ADR giúp team hiểu:

```text
Chúng ta quyết định gì?
Tại sao?
Có lựa chọn nào khác?
Trade-off là gì?
Khi nào cần xem lại?
```

---

## ADR template chuẩn

```text
ADR-XXX: Title

Status:
Proposed / Accepted / Deprecated / Superseded

Context:
Vấn đề hoặc bối cảnh cần quyết định.

Options:
1. Option A
2. Option B
3. Option C

Decision:
Chọn option nào.

Rationale:
Tại sao chọn.

Consequences:
Positive:
- ...

Negative:
- ...

Revisit Criteria:
Khi nào cần xem lại quyết định.
```

---

# 7. ADR mẫu cho Module 10

## ADR-018: AI Must Support Human Decision-Making, Not Replace It

```text
Status: Accepted

Context:
The AI Claims Copilot provides summaries, missing document detection,
policy Q&A and risk recommendations. Claim approval or rejection has
financial, legal and customer impact.

Options:
1. Allow AI to approve/reject low-risk claims
2. Allow AI to recommend actions only
3. Disable AI recommendation entirely

Decision:
AI will only provide decision support. Final claim decisions must be made
by authorized human claim officers.

Rationale:
Insurance decisions require accountability, explainability and compliance.
AI output may be wrong, incomplete or based on insufficient context.
Keeping humans in the loop reduces operational and legal risk.

Consequences:
Positive:
- Clear human accountability
- Lower compliance risk
- Easier audit and dispute handling
- Safer MVP adoption

Negative:
- Lower automation level
- Some workflows remain manual
- Requires human review UI and process

Revisit Criteria:
Revisit after six months of production data if:
- AI recommendation accuracy is consistently high
- Human correction rate is below agreed threshold
- Compliance approves partial automation
```

---

# 8. Risk Register

Architect phải biết nói về risk rõ ràng.

## Template
```text
| Risk             |   Impact | Probability | Mitigation                      | Owner        |
| ---------------- | -------: | ----------: | ------------------------------- | ------------ |
| AI hallucination |     High |      Medium | RAG + citation + human review   | AI Architect |
| Data leakage     | Critical |         Low | Tenant filter + audit + RBAC    | Security     |
| Cost overrun     |   Medium |      Medium | Budget guard + model routing    | Platform     |
| Poor adoption    |     High |      Medium | Human-centered UX + training    | Product      |
| LLM outage       |     High |         Low | Fallback provider + queue retry | Platform     |
```
---

# 9. Cách giải thích trade-off

Một architect tốt không nói:

```text
Cái này tốt nhất.
```

Mà nói:

```text
Cái này phù hợp nhất trong bối cảnh hiện tại.
```

Ví dụ:

## pgvector vs Pinecone

```text
pgvector:
- Rẻ hơn
- Dễ vận hành nếu đã có PostgreSQL
- Phù hợp MVP

Pinecone:
- Scale tốt hơn
- Managed service tốt hơn
- Chi phí cao hơn
- Vendor lock-in cao hơn
```

Kết luận:

```text
MVP chọn pgvector.
Khi scale vượt ngưỡng, đánh giá lại Pinecone.
```

---

# 10. Executive Summary mẫu

```text
AI Claims Copilot will reduce claim review effort by assisting claim officers
with document summarization, missing information detection, policy Q&A and
risk recommendations.

The MVP will not automate claim approval or rejection. AI will provide
decision support only, with human review required for high-risk or
low-confidence cases.

The proposed architecture separates business workflow from AI orchestration,
uses secure document retrieval, tracks all AI runs, and includes audit,
cost monitoring and governance controls.

Expected benefits:
- Faster claim triage
- Better consistency
- Reduced manual document review
- Improved auditability

Key risks:
- Hallucination
- Data leakage
- Cost overrun
- Low user trust

Mitigation:
- RAG with citations
- Tenant-level retrieval filters
- Human-in-the-loop
- AI usage metering
- Guardrails and evaluation
```

---

# 11. AI Adoption Roadmap

## Phase 1: Foundation

```text
Duration: 4–6 weeks

Build:
- Document ingestion
- Claim summarization
- Basic RAG
- Audit log
- Human review

Goal:
Prove AI can assist claim officers safely.
```

## Phase 2: Production MVP

```text
Duration: 8–12 weeks

Build:
- Secure retrieval
- Prompt versioning
- Cost tracking
- Guardrails
- Evaluation dataset
- Role-based access control

Goal:
Deploy to limited users.
```

## Phase 3: Scale

```text
Duration: 3–6 months

Build:
- Model routing
- Semantic cache
- Advanced monitoring
- Workflow automation
- Integration with policy/CRM systems

Goal:
Scale across teams.
```

## Phase 4: Optimization

```text
Duration: 6–12 months

Build:
- Agentic investigation
- Advanced fraud signals
- Multi-region deployment
- Governance automation
- Continuous evaluation

Goal:
Enterprise AI platform capability.
```

---

# 12. Stakeholder communication pattern

## Với executive

Nói theo:

```text
Value → Risk → Cost → Timeline → Decision needed
```

Ví dụ:

```text
This AI Copilot can reduce claim review time, but we should not automate
approval in the MVP. The safest path is decision support with human review.
We need approval for a 12-week MVP, limited pilot users and a defined AI
governance process.
```

---

## Với engineering

Nói theo:

```text
Architecture → Interfaces → Responsibilities → Trade-offs → Next tasks
```

---

## Với security

Nói theo:

```text
Data flow → Trust boundaries → Controls → Audit → Residual risk
```

---

## Với product

Nói theo:

```text
User journey → MVP scope → AI limitation → Feedback loop
```

---

# 13. Architecture Review Meeting format

## Agenda 60 phút

```text
1. Business context — 5 phút
2. Architecture overview — 10 phút
3. Key decisions — 15 phút
4. Risks & trade-offs — 15 phút
5. Open questions — 10 phút
6. Actions & owners — 5 phút
```

---

# 14. Questions architect phải chuẩn bị

```text
Why this architecture?
Why now?
Why not simpler?
Why not buy instead of build?
What happens if the LLM fails?
How do we control cost?
How do we prevent data leakage?
How do we measure quality?
Who owns the final decision?
What is out of scope?
```

---

# 15. Bài thực hành Module 10

## Exercise 1: Viết Executive Summary

Tạo file:

```text
docs/executive-summary.md
```

Nội dung 1 trang:

```text
Business value
MVP scope
Architecture approach
Key risks
Mitigation
Decision needed
```

---

## Exercise 2: Viết Risk Register

Tạo:

```text
docs/risk-register.md
```

Ít nhất 10 risks:

```text
Security
Cost
Quality
Adoption
Compliance
Operations
Vendor lock-in
```

---

## Exercise 3: Viết ADR

Tạo 3 ADR:

```text
ADR-018: AI supports human decision-making
ADR-019: Start with MVP before agentic automation
ADR-020: Use phased AI adoption roadmap
```

---

## Exercise 4: Chuẩn bị Architecture Review Deck

Slide structure:

```text
1. Problem
2. Business goal
3. Proposed architecture
4. MVP scope
5. Key decisions
6. Risks
7. Cost estimate
8. Roadmap
9. Decision needed
```

---

## Exercise 5: Stakeholder Role-play

Bạn cần luyện giải thích cùng một architecture cho 4 nhóm:

```text
Executive
Product
Engineering
Security
```

Mỗi nhóm dùng ngôn ngữ khác nhau.

---

# 16. Checklist hoàn thành Module 10

Bạn hoàn thành Module 10 khi có:

```text
Executive summary
Architecture review document
Risk register
AI adoption roadmap
ADR set
Stakeholder communication plan
Architecture review deck outline
Decision log
Open question log
```

---

# 17. Kết quả cần đạt

Sau Module 10, bạn phải có thể nói như một AI Technical Architect:

> Chúng ta không chỉ build AI feature. Chúng ta triển khai AI capability có kiểm soát, bắt đầu bằng MVP an toàn, có human review, audit, cost tracking, guardrails và evaluation. Kiến trúc này tối ưu cho learning, compliance và khả năng scale về sau. Các quyết định chính đã được ghi bằng ADR, các rủi ro có owner, và roadmap được chia theo phase để stakeholders có thể ra quyết định rõ ràng.
