# PostgreSQL vs Vector Database?

Đây là câu hỏi rất quan trọng vì nhiều người mới học RAG thường nhầm:

```text
PostgreSQL = Vector Database
```

Thực tế không phải vậy.

---

# Câu trả lời ngắn gọn

## PostgreSQL

Là:

```text
Relational Database (RDBMS)
```

Dùng để lưu:

```text
Users
Claims
Policies
Orders
Products
Transactions
```

---

## pgvector

Là:

```text
PostgreSQL Extension
```

Giúp PostgreSQL lưu và tìm kiếm:

```text
Vector Embeddings
```

---

Quan hệ giữa chúng:

```text
PostgreSQL
   |
   +-- pgvector extension
```

Tương tự:

```text
Chrome
   |
   +-- AdBlock Extension
```

Chrome là trình duyệt.

AdBlock là extension.

---

# Nếu chỉ có PostgreSQL

Bạn có thể lưu:

```sql
CREATE TABLE claims (
    id UUID PRIMARY KEY,
    title TEXT,
    description TEXT
);
```

---

Query:

```sql
SELECT *
FROM claims
WHERE title = 'Car Accident';
```

---

Hoặc:

```sql
SELECT *
FROM claims
WHERE customer_id = 123;
```

---

Đây gọi là:

```text
Exact Match Search
```

---

# Vấn đề của AI

Người dùng không search chính xác.

Ví dụ:

Policy ghi:

```text
Vehicle Collision Coverage
```

Người dùng hỏi:

```text
Xe tôi bị đâm có được bồi thường không?
```

---

PostgreSQL thông thường không hiểu:

```text
Vehicle
=
Xe

Collision
=
Đâm xe
```

---

Nó chỉ biết:

```text
String Matching
```

---

# Embedding giải quyết vấn đề

Ví dụ:

```text
Vehicle Collision Coverage
```

Embedding:

```text
[0.21, 0.82, 0.17 ...]
```

---

Câu hỏi:

```text
Xe tôi bị đâm có được cover không?
```

Embedding:

```text
[0.19, 0.79, 0.15 ...]
```

---

Hai vector gần nhau.

=> Semantic Similarity.

---

# pgvector xuất hiện ở đây

pgvector cho phép PostgreSQL lưu:

```sql
embedding VECTOR(1536)
```

Ví dụ:

```sql
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY,
    content TEXT,
    embedding VECTOR(1536)
);
```

---

# Không có pgvector

PostgreSQL:

```text
ID
Name
Description
Date
Number
```

---

Có pgvector:

```text
ID
Name
Description
Embedding Vector
```

---

# Ví dụ thực tế

## Policy Document

```text
Vehicle Collision Coverage

This policy covers vehicle damage
caused by traffic accidents...
```

---

Chunk sau khi embedding:

```sql
INSERT INTO document_chunks (
    content,
    embedding
)
VALUES (
    'Vehicle Collision Coverage...',
    '[0.21,0.82,0.17,...]'
);
```

---

# Khi user hỏi

```text
Xe bị tai nạn có được bảo hiểm không?
```

---

Hệ thống:

## Step 1

Generate embedding

```text
Question
↓
Embedding
↓
[0.19,0.79,0.15...]
```

---

## Step 2

Vector Search

```sql
SELECT *
FROM document_chunks
ORDER BY embedding <-> '[0.19,0.79,0.15...]'
LIMIT 5;
```

---

Toán tử:

```text
<->
```

được pgvector cung cấp.

---

Kết quả:

```text
Vehicle Collision Coverage
```

được trả về.

---

# PostgreSQL vs pgvector

| Feature           | PostgreSQL | pgvector |
| ----------------- | ---------- | -------- |
| Structured Data   | ✅          | ✅        |
| SQL               | ✅          | ✅        |
| Transactions      | ✅          | ✅        |
| Joins             | ✅          | ✅        |
| Exact Search      | ✅          | ✅        |
| Full Text Search  | ✅          | ✅        |
| Vector Storage    | ❌          | ✅        |
| Similarity Search | ❌          | ✅        |
| Embedding Search  | ❌          | ✅        |
| RAG Support       | ❌          | ✅        |

---

# pgvector có phải Vector DB không?

Có thể xem là:

```text
Vector Database inside PostgreSQL
```

---

Tuy nhiên:

```text
PostgreSQL + pgvector
```

không mạnh bằng các Vector DB chuyên dụng.

Ví dụ:

```text
Pinecone
Weaviate
Milvus
Qdrant
```

---

# Khi nào dùng PostgreSQL + pgvector?

Đây là lựa chọn mình khuyên cho 90% dự án AI mới.

Ví dụ:

```text
Insurance Copilot
Healthcare Assistant
Legal Assistant
Customer Support AI
Internal Knowledge AI
```

---

Vì:

```text
✓ Dễ setup

✓ Team đã biết PostgreSQL

✓ Không cần thêm service mới

✓ Cost thấp

✓ Dễ backup

✓ Dễ quản lý
```

---

# Khi nào chuyển sang Pinecone/Qdrant?

Khi dữ liệu rất lớn.

Ví dụ:

```text
100 triệu documents

500 triệu chunks

Nhiều quốc gia

Realtime indexing

Latency < 50ms
```

---

# Với Insurance Policy Copilot của bạn

Mình sẽ chọn:

```text
PostgreSQL 16
+
pgvector
```

Architecture:

```text
NextJS
 |
NestJS
 |
FastAPI
 |
OpenAI Embedding
 |
PostgreSQL + pgvector
 |
Policy Documents
 |
RAG
```

Lý do:

```text
Data volume nhỏ đến trung bình
Team dễ vận hành
Chi phí thấp
Không vendor lock-in
Đủ để học toàn bộ AI Architecture
Đủ cho MVP và Production giai đoạn đầu
```

Đây cũng là stack mà rất nhiều SaaS AI products hiện nay dùng ở giai đoạn MVP và Scale-up trước khi phải chuyển sang các Vector Database chuyên dụng.
