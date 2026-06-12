Đây là một trong những khái niệm quan trọng nhất của AI Architect.

Nhiều người nghĩ:

```text
RAG = LangChain
RAG = LlamaIndex
RAG = Pinecone
RAG = Vector DB
```

Thực ra:

```text
RAG ≠ Framework
RAG ≠ Product
RAG ≠ Database
```

---

# 1. RAG là gì?

RAG =

```text
Retrieval-Augmented Generation
```

dịch đơn giản:

```text
Truy xuất dữ liệu
+
Bổ sung vào prompt
+
LLM sinh câu trả lời
```

---

## Không có RAG

GPT chỉ biết:

```text
Knowledge đã học trước đó
```

Ví dụ:

```text
Question:
What documents are required for claim CLM-123?
```

GPT không thể biết.

Vì:

```text
Claim CLM-123 nằm trong hệ thống của bạn
GPT chưa từng thấy
```

---

## Có RAG

GPT sẽ được cấp thêm dữ liệu:

```text
Claim documents
Policy documents
Knowledge base
Internal SOP
Database records
```

Trước khi trả lời.

---

# 2. RAG có phải framework không?

Không.

RAG là:

```text
Architecture Pattern
```

giống như:

```text
MVC
Microservices
CQRS
Event Driven
```

---

Ví dụ:

MVC không phải framework.

Bạn có thể dùng:

```text
Spring MVC
ASP.NET MVC
NestJS MVC
Django MVC
```

---

Tương tự:

RAG không phải framework.

Bạn có thể build bằng:

```text
LangChain
LlamaIndex
Hay tự code
```

---

# 3. Tại sao cần RAG?

LLM có một vấn đề lớn:

## Hallucination

Ví dụ:

User hỏi:

```text
Policy ABC có cover flood damage không?
```

GPT không có policy ABC.

Nó có thể:

```text
Đoán
```

và trả lời sai.

---

RAG giải quyết:

```text
Lấy policy ABC
↓
Đưa vào context
↓
GPT trả lời dựa trên policy thật
```

---

# 4. RAG dùng để làm gì?

RAG được dùng khi AI cần truy cập dữ liệu riêng.

---

## Use Case 1

Insurance Copilot

```text
Policy documents
Claim documents
```

---

## Use Case 2

Healthcare Assistant

```text
Medical guidelines
Patient records
```

---

## Use Case 3

Legal Assistant

```text
Contracts
Regulations
```

---

## Use Case 4

Internal Company Copilot

```text
Wiki
Confluence
SOP
Meeting notes
```

---

## Use Case 5

Customer Support

```text
Product documentation
FAQ
Knowledge base
```

---

# 5. RAG hoạt động thế nào?

Architecture:

```text
User Question
      |
      v
Embedding
      |
      v
Vector Search
      |
      v
Top Relevant Chunks
      |
      v
Build Context
      |
      v
Prompt
      |
      v
LLM
      |
      v
Answer
```

---

# 6. Flow chi tiết

Giả sử bạn có:

```text
insurance_policy.pdf
```

---

## Step 1

Upload document

```text
insurance_policy.pdf
```

---

## Step 2

Extract text

```text
Page 1
Page 2
...
```

---

## Step 3

Chunking

Ví dụ:

```text
Chunk 1
Chunk 2
Chunk 3
Chunk 4
```

---

## Step 4

Embedding

```text
Chunk 1
 ↓
Vector

Chunk 2
 ↓
Vector
```

---

## Step 5

Store

```text
pgvector
Pinecone
Qdrant
Weaviate
```

---

# Query Time

User hỏi:

```text
What documents are required for accident claims?
```

---

## Step 1

Embedding câu hỏi

```text
Question
 ↓
Vector
```

---

## Step 2

Similarity Search

```text
Vector DB
```

trả về:

```text
Chunk 12
Chunk 28
Chunk 44
```

---

## Step 3

Build Context

```text
[Source 1]
...

[Source 2]
...

[Source 3]
...
```

---

## Step 4

Prompt

```text
Question
+
Retrieved Sources
```

---

## Step 5

GPT trả lời

```text
Police report
Driver licence
Repair invoice
```

---

# 7. RAG KHÔNG train model

Đây là hiểu nhầm phổ biến.

---

Nhiều người nghĩ:

```text
Upload PDF
↓
GPT học PDF
```

Sai.

---

RAG không train gì cả.

```text
PDF
↓
Chunk
↓
Embedding
↓
Store
```

---

Mỗi lần user hỏi:

```text
Retrieve lại
```

---

# 8. Fine-tuning vs RAG

## Fine-tuning

```text
Dữ liệu
↓
Train model
↓
Model mới
```

---

Ưu điểm:

```text
Model học pattern
```

---

Nhược điểm:

```text
Đắt
Khó update
```

---

## RAG

```text
Dữ liệu
↓
Vector DB
↓
Retrieve khi cần
```

---

Ưu điểm:

```text
Rẻ
Dễ update
Không retrain
```

---

Hiện nay:

```text
80-90% enterprise AI
=
RAG
```

---

# 9. RAG trong Insurance Policy Copilot

Bạn đang build:

```text
Policy PDFs
Claims PDFs
```

---

Architecture:

```text
Policy PDFs
Claim PDFs
        |
        v
Text Extraction
        |
        v
Chunking
        |
        v
Embedding
        |
        v
pgvector
        |
        v
Retriever
        |
        v
Context Builder
        |
        v
GPT
        |
        v
Answer + Sources
```

---

# 10. Có những loại RAG nào?

## Basic RAG

```text
Question
↓
Retrieve
↓
GPT
```

---

## Advanced RAG

```text
Question
↓
Rewrite Query
↓
Retrieve
↓
Rerank
↓
GPT
```

---

## Agentic RAG

```text
Question
↓
Agent
↓
Multiple Searches
↓
Multiple Tools
↓
GPT
```

---

# 11. Production RAG Architecture

```text
Frontend
 |
NestJS
 |
AI Gateway
 |
Retriever
 |
pgvector
 |
Context Builder
 |
LLM Gateway
 |
GPT
 |
Answer
```

---

# 12. Framework nào hỗ trợ RAG?

RAG không phải framework.

Nhưng có framework giúp build RAG:

### LangChain

[LangChain](https://www.langchain.com?utm_source=chatgpt.com)

---

### LlamaIndex

[LlamaIndex](https://www.llamaindex.ai?utm_source=chatgpt.com)

---

### Hay tự code

Ví dụ:

```python
query_embedding = embed(question)

chunks = vector_store.search(
    embedding=query_embedding
)

context = build_context(chunks)

answer = llm.generate(
    question,
    context
)
```

---

# 13. Góc nhìn AI Architect

Khi nghe requirement:

```text
Search company documents
Ask questions on PDFs
Policy lookup
Knowledge base assistant
Customer support AI
Internal wiki chatbot
```

Bạn phải nghĩ ngay:

```text
Need RAG
Need Embedding
Need Vector Database
Need Retrieval Layer
Need Context Builder
Need Source Citation
```

---

# Công thức nhớ nhanh

```text
GPT chỉ biết kiến thức đã học

RAG giúp GPT biết dữ liệu của công ty bạn
```

Hay ngắn gọn hơn:

```text
RAG
=
Search Engine
+
LLM
```

Trong Insurance Policy Copilot của bạn:

```text
Policy PDF
+
Claim PDF
+
RAG
+
GPT
=
Insurance Policy Assistant
```

đó chính là kiến trúc nền tảng của hầu hết các Copilot và Enterprise AI Assistant hiện nay.
