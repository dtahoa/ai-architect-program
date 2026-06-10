Đây là một câu hỏi rất quan trọng. Thực tế, sự khác biệt lớn nhất giữa một **Senior Engineer/Tech Lead** và một **Architect** không phải là biết nhiều công nghệ hơn, mà là:

> Architect phải đưa ra quyết định (Decision) và chịu trách nhiệm giải thích tại sao quyết định đó được đưa ra.

ADR ra đời để giải quyết vấn đề này.

---

# ADR là gì?

ADR = **Architecture Decision Record**

Là một tài liệu ngắn ghi lại:

1. Bối cảnh (Context)
2. Các lựa chọn đã cân nhắc
3. Quyết định được chọn
4. Lý do chọn
5. Trade-off
6. Hệ quả sau quyết định

---

# Tại sao Architect phải viết ADR?

Hãy tưởng tượng sau 2 năm:

Một developer mới vào team hỏi:

> Tại sao công ty lại dùng pgvector thay vì Pinecone?

Nếu không có ADR:

```text
Không ai nhớ

Tech lead nghỉ việc

Architect chuyển team

Developer đoán mò
```

Nếu có ADR:

```text
ADR-003

Decision:
Use pgvector

Reason:
- Existing PostgreSQL cluster
- Small data volume
- Cost optimization

Tradeoff:
- Lower scalability

Date:
2026-06-01
```

Mọi người hiểu ngay.

---

# Architect thực sự làm gì?

Nhiều người nghĩ Architect ngồi vẽ diagram.

Thực tế:

```text
10% Diagram

90% Decision Making
```

Ví dụ:

---

## Quyết định #1

### Dùng GPT hay Claude?

Lựa chọn:

```text
GPT-5
Claude
Gemini
```

Architect phải đánh giá:

| Criteria       | GPT | Claude | Gemini |
| -------------- | --- | ------ | ------ |
| Cost           |     |        |        |
| Accuracy       |     |        |        |
| Context Window |     |        |        |
| Security       |     |        |        |

Sau đó ra quyết định.

Đó là ADR.

---

## Quyết định #2

### Monolith hay Microservice?

Lựa chọn:

```text
Monolith

Microservice
```

Architect phải trả lời:

```text
Tại sao?
```

Không phải:

```text
Microservice vì trend
```

Mà:

```text
Microservice vì:

- Team > 30 engineers
- Multiple deployment cycles
- Independent scaling
```

Đó là ADR.

---

# Một ADR tốt trông như thế nào?

Ví dụ với hệ thống AI Insurance Claim Assistant.

---

## ADR-001

### Separate AI Orchestrator Service

---

### Status

```text
Accepted
```

---

### Context

Hệ thống cần:

```text
- Prompt Engineering
- RAG
- LLM Calls
- Embedding
- Vector Search
- Future Multi-Agent
```

Backend hiện tại:

```text
NestJS
```

---

### Options

#### Option A

```text
Nhét AI vào NestJS
```

Ưu điểm

```text
Ít service
Deploy đơn giản
```

Nhược điểm

```text
Khó maintain

LangGraph support yếu hơn

AI code lẫn business code
```

---

#### Option B

```text
Tách AI Service bằng Python
```

Ưu điểm

```text
LangGraph support tốt

Dễ experiment

Dễ scale riêng
```

Nhược điểm

```text
Thêm service

Thêm DevOps effort
```

---

### Decision

```text
Chọn Option B
```

Tách:

```text
NestJS
```

và

```text
FastAPI AI Service
```

---

### Consequences

Positive

```text
Dễ phát triển AI features

Dễ thêm Agent

Dễ monitor AI
```

Negative

```text
Tăng complexity

Tăng deployment effort
```

---

# Một architect AI sẽ viết ADR về những gì?

Trong dự án AI thật sự bạn sẽ có hàng chục ADR.

Ví dụ:

---

## ADR-002

### Chọn Vector Database

Options:

```text
Pinecone

Weaviate

pgvector
```

Decision:

```text
pgvector
```

Reason:

```text
100k documents

Reuse PostgreSQL

Lowest cost
```

---

## ADR-003

### Chọn LLM

Options:

```text
GPT-5
Claude
Gemini
```

Decision:

```text
Claude
```

Reason:

```text
Large context

Document analysis tốt
```

---

## ADR-004

### Chọn RAG hay Fine-tuning

Decision:

```text
RAG
```

Reason:

```text
Documents thay đổi thường xuyên

Không cần train model
```

---

## ADR-005

### Chọn OpenAI hay Azure OpenAI

Decision:

```text
Azure OpenAI
```

Reason:

```text
Data residency

Compliance

Enterprise security
```

---

# Framework suy nghĩ của Architect

Khi gặp bất kỳ quyết định nào, hãy tự hỏi:

### 1. Problem

```text
Tôi đang giải quyết vấn đề gì?
```

---

### 2. Constraints

```text
Budget?

Timeline?

Team skill?

Compliance?
```

---

### 3. Options

```text
Có những lựa chọn nào?
```

---

### 4. Trade-offs

```text
Mất gì?

Được gì?
```

---

### 5. Decision

```text
Tôi chọn gì?
```

---

### 6. Consequences

```text
6 tháng nữa sẽ thế nào?
```

---

# Bài tập Architect đầu tiên cho bạn

Với background của bạn (NestJS, AWS, Azure, SaaS, Insurance), hãy thử viết ADR sau:

## ADR-001

**Should we separate AI Service from NestJS Backend?**

Các phần cần viết:

```text
Status

Context

Options

Decision

Consequences
```

Giới hạn 1 trang A4.

Đây chính là cách các Principal Architect, Solution Architect và Enterprise Architect làm việc hàng ngày. Họ không được trả lương cao vì biết nhiều framework hơn, mà vì họ có thể đưa ra các quyết định kiến trúc đúng, ghi lại được lý do, và giúp cả tổ chức hiểu được quyết định đó trong nhiều năm sau.
