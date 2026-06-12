Embedding là một trong những khái niệm quan trọng nhất trong AI Architecture. Nếu hiểu sai embedding, bạn sẽ rất khó hiểu:

```text
RAG
Vector Database
Semantic Search
Recommendation System
Knowledge Graph + AI
Agent Memory
```

---

# 1. Embedding là gì?

Hãy tưởng tượng AI không hiểu text như con người.

Ví dụ:

```text
"I want to buy a car"

"Tôi muốn mua ô tô"

"Need a vehicle"
```

Con người biết:

```text
3 câu trên gần giống nghĩa nhau
```

Máy tính thì không.

Nó chỉ thấy:

```text
String A
String B
String C
```

---

Embedding là quá trình:

```text
Text
 ↓
AI Model
 ↓
Vector (dãy số)
```

Ví dụ:

```text
"I want to buy a car"

→

[
  0.23,
 -0.11,
  0.77,
 ...
]
```

Thường:

```text
512 dimensions
768 dimensions
1024 dimensions
1536 dimensions
3072 dimensions
```

---

# 2. Tại sao phải chuyển thành vector?

Vì vector có thể đo được:

```text
Similarity
Distance
Relationship
```

Ví dụ:

```text
Car
Vehicle
Automobile
```

sẽ nằm gần nhau trong không gian vector.

---

# 3. Hình dung đơn giản

Giả sử chỉ có 2 chiều:

```text
          Sports Car

              ●

       Car ●

 Vehicle ●

Truck ●

----------------------------

Banana ●

Apple ●
```

Ta thấy:

```text
Car gần Vehicle
Car gần Sports Car

Car rất xa Banana
```

AI sử dụng điều này để tìm dữ liệu liên quan.

---

# 4. Embedding Model làm gì?

Ví dụ:

```text
OpenAI text-embedding-3-small

Input:
"Insurance claim"

Output:
[0.123, -0.887, 0.55, ...]
```

Mỗi câu:

```text
Sentence
Paragraph
Document
```

đều được chuyển thành vector.

---

# 5. Embedding KHÔNG phải LLM

Đây là điểm nhiều người nhầm.

## Embedding Model

Nhiệm vụ:

```text
Convert text → vector
```

Ví dụ:

```text
text-embedding-3-small
text-embedding-3-large
```

---

## LLM

Nhiệm vụ:

```text
Generate text
Reasoning
Summarization
Chat
```

Ví dụ:

```text
GPT-4.1
GPT-5
Claude
Gemini
```

---

# 6. Khi nào dùng Embedding?

## Case 1: Semantic Search

Ví dụ:

User search:

```text
car accident
```

Database có:

```text
vehicle collision
```

Keyword search:

```text
Không match
```

Embedding search:

```text
Match được
```

---

## Case 2: RAG

Đây là use case phổ biến nhất.

Ví dụ:

```text
10000 policy documents
```

User hỏi:

```text
What documents are required for accident claims?
```

Không thể gửi 10000 documents cho GPT.

Quá tốn tiền.

---

Ta làm:

```text
Documents
 ↓
Chunk
 ↓
Embedding
 ↓
Vector DB
```

Khi user hỏi:

```text
Question
 ↓
Embedding
 ↓
Vector Search
 ↓
Top 5 relevant chunks
 ↓
GPT
```

Đây chính là:

```text
RAG
```

---

# 7. Embedding trong RAG

## Index time

```text
Policy PDF
```

---

Chunk:

```text
Chunk 1
Chunk 2
Chunk 3
```

---

Embedding:

```text
Chunk 1
 ↓
Vector

Chunk 2
 ↓
Vector

Chunk 3
 ↓
Vector
```

---

Store:

```text
pgvector
Pinecone
Qdrant
Weaviate
OpenSearch
```

---

# 8. Query time

User hỏi:

```text
What documents are needed?
```

---

Question:

```text
Embedding
```

↓

```text
Vector Search
```

↓

```text
Top 5 nearest chunks
```

↓

```text
GPT
```

↓

```text
Answer
```

---

# 9. Real Example

Document:

```text
Accident claims require:

- Police report
- Repair invoice
- Driver license
```

---

Chunk embedding:

```text
[0.1, 0.4, -0.8, ...]
```

---

Question:

```text
What documents are required?
```

Embedding:

```text
[0.12, 0.41, -0.81, ...]
```

---

Similarity:

```text
95%
```

→ Retrieve chunk.

---

GPT trả lời:

```text
Required documents:

- Police report
- Repair invoice
- Driver license
```

---

# 10. Vector Database là gì?

Database thường:

```sql
SELECT * FROM claims
WHERE claim_number='ABC123'
```

---

Vector DB:

```text
Find top 5 most similar vectors
```

Ví dụ:

```sql
SELECT *
FROM document_chunks
ORDER BY embedding <-> query_embedding
LIMIT 5;
```

(pgvector syntax)

---

# 11. PostgreSQL + pgvector

Bạn đã hỏi trước đó:

```text
PostgreSQL + pgvector khác gì?
```

---

PostgreSQL:

```text
Normal database
```

---

pgvector:

```text
Extension
```

thêm khả năng:

```text
Store vectors
Similarity search
ANN indexes
```

Ví dụ:

```sql
CREATE TABLE chunks (
  id UUID,
  content TEXT,
  embedding VECTOR(1536)
);
```

---

# 12. Embedding Workflow thực tế

## Upload document

```text
claim.pdf
```

↓

Extract text

↓

Chunking

↓

```text
chunk_1
chunk_2
chunk_3
```

↓

Embedding

↓

```text
vector_1
vector_2
vector_3
```

↓

Store pgvector

---

# 13. FastAPI Example

## Generate embedding

```python
from openai import OpenAI

client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Insurance claim requires police report"
)

embedding = response.data[0].embedding
```

---

Save:

```python
chunk = DocumentChunk(
    content=text,
    embedding=embedding
)

db.save(chunk)
```

---

# 14. Search Example

Question:

```text
What documents are required?
```

---

Generate query embedding:

```python
query_embedding = embedding_service.embed(
    question
)
```

---

Search:

```python
chunks = vector_store.search(
    embedding=query_embedding,
    top_k=5
)
```

---

Return:

```text
Chunk A
Chunk B
Chunk C
```

---

# 15. Cosine Similarity là gì?

Đây là metric phổ biến nhất.

```text
1.0
=
Giống hệt
```

```text
0.9
=
Rất giống
```

```text
0.5
=
Liên quan
```

```text
0.0
=
Không liên quan
```

---

Ví dụ:

```text
Car
Vehicle
```

```text
Similarity = 0.95
```

---

```text
Car
Banana
```

```text
Similarity = 0.10
```

---

# 16. Những gì có thể embedding

Không chỉ text.

Embedding có thể dùng cho:

```text
Text
Image
Audio
Video
Code
PDF
Knowledge Graph nodes
```

Ví dụ:

```text
Source code search
```

Question:

```text
Where is JWT validation implemented?
```

↓

Embedding

↓

Search source code

↓

Return files liên quan

---

# 17. Sai lầm phổ biến

## Sai lầm 1

```text
Embedding = GPT
```

Sai.

Embedding không generate text.

---

## Sai lầm 2

```text
Store whole PDF as one vector
```

Sai.

Phải:

```text
Chunk
→ Embed
→ Store
```

---

## Sai lầm 3

```text
Không có metadata filter
```

Ví dụ:

```text
tenant A
tenant B
```

Nếu không filter:

```text
Cross-tenant data leak
```

---

# 18. Cách Architect nghĩ về Embedding

Khi nghe requirement:

```text
Search documents
Find similar cases
Knowledge base
Policy lookup
Semantic search
Recommendation
RAG
Agent memory
```

Bạn phải nghĩ ngay:

```text
Need Embedding
Need Vector Database
Need Retrieval Layer
Need Metadata Filter
Need Similarity Search
```

---

# 19. Kiến trúc thực tế cho Insurance Copilot

```text
PDF Upload
 |
 OCR
 |
 Chunking
 |
 Embedding Model
 |
 pgvector
 |
 RAG Service
 |
 GPT
 |
 Claim Officer
```

---

# 20. Quy tắc nhớ nhanh

Nếu dữ liệu cần:

```text
Exact Match
```

dùng:

```text
SQL
```

Ví dụ:

```text
claim_number = CLM-123
```

---

Nếu cần:

```text
Meaning Match
Semantic Match
Similar Content
Knowledge Search
```

dùng:

```text
Embedding + Vector Search
```

Đây chính là nền tảng của gần như mọi hệ thống **RAG, AI Search, Copilot, Knowledge Assistant và Agent Memory** hiện nay.
