Dưới đây là **Module 4: Data Architecture for AI Systems** — phần cực kỳ quan trọng, vì trong hệ thống AI production:

> Model tốt nhưng data bẩn → kết quả vẫn tệ.
> Data architecture kém → RAG sai, hallucination cao, audit khó, compliance rủi ro.

---

# Module 4 là gì?

Module này giúp bạn thiết kế **data architecture cho AI**, gồm:

```text
Data ingestion
Document processing
Chunking
Embedding
Vector indexing
Metadata management
Data quality
Data lineage
Security
RAG retrieval
Governance
```

---

# 1. Use case tiếp tục

## AI Insurance Claims Copilot

Nguồn dữ liệu:

```text
Claim documents
Policy documents
Customer records
Medical reports
Repair invoices
Email attachments
Historical claim decisions
Fraud rules
Compliance policies
```

AI cần dùng dữ liệu này để:

```text
Tóm tắt claim
Trích xuất thông tin
Tìm policy liên quan
Phát hiện thiếu hồ sơ
Đánh giá risk
Đề xuất next action
```

---

# 2. Data Architecture tổng thể

```text
[Data Sources]
    |
    v
[Ingestion Layer]
    |
    v
[Raw Data Storage]
    |
    v
[Processing Layer]
    |
    v
[Curated Data Layer]
    |
    v
[Embedding Pipeline]
    |
    v
[Vector Store]
    |
    v
[Retrieval Layer]
    |
    v
[AI Orchestrator / LLM]
```

---

# 3. Architecture cụ thể

```text
PDF / DOCX / Email / Image
        |
        v
Upload API
        |
        v
Object Storage
S3 / Azure Blob / MinIO
        |
        v
Document Processing Service
        |
        +----------------------------+
        |                            |
        v                            v
Text Extraction                 OCR Service
        |                            |
        v                            v
Document Normalizer
        |
        v
Chunking Service
        |
        v
Metadata Enrichment
        |
        v
Embedding Service
        |
        v
Vector Database
pgvector / OpenSearch / Pinecone
        |
        v
Retrieval Service
        |
        v
AI Orchestrator
        |
        v
LLM Response
```

---

# 4. Data layers trong AI system

## 4.1 Raw Data Layer

Lưu dữ liệu gốc, chưa xử lý.

Ví dụ:

```text
claim_001_accident_report.pdf
claim_001_invoice.jpg
policy_auto_2026.pdf
medical_guideline_v3.docx
```

Storage:

```text
S3 / Azure Blob / MinIO
```

Nguyên tắc:

```text
Không sửa file gốc
Version file
Encrypt at rest
Gắn metadata
Audit access
```

---

## 4.2 Processed Data Layer

Lưu dữ liệu đã extract.

Ví dụ:

```json
{
  "documentId": "doc_001",
  "text": "This claim relates to a vehicle accident...",
  "pageCount": 5,
  "language": "en",
  "extractionMethod": "pdf_text_extractor",
  "confidence": 0.94
}
```

---

## 4.3 Curated Data Layer

Dữ liệu đã chuẩn hóa để AI dùng.

Ví dụ:

```json
{
  "claimId": "claim_001",
  "documentType": "repair_invoice",
  "incidentDate": "2026-06-01",
  "claimAmount": 2500,
  "currency": "AUD",
  "provider": "ABC Auto Repair"
}
```

---

## 4.4 Vector Data Layer

Dữ liệu đã chunk + embedding.

```json
{
  "chunkId": "chunk_001",
  "documentId": "doc_001",
  "claimId": "claim_001",
  "content": "The accident occurred on...",
  "embedding": [0.012, -0.044, 0.087],
  "metadata": {
    "documentType": "accident_report",
    "page": 2,
    "source": "claim_document"
  }
}
```

---

# 5. Data pipeline chi tiết

## Pipeline chuẩn

```text
Upload document
    |
Virus scan
    |
Store raw file
    |
Extract text
    |
Normalize text
    |
Detect language
    |
Classify document type
    |
Split into chunks
    |
Generate embeddings
    |
Store vectors
    |
Update indexing status
```

---

# 6. Document ingestion design

## API upload document

```http
POST /claims/{claimId}/documents
Content-Type: multipart/form-data
```

Response:

```json
{
  "documentId": "doc_001",
  "claimId": "claim_001",
  "status": "UPLOADED",
  "fileUrl": "s3://claims/raw/doc_001.pdf"
}
```

---

## Document status

```text
UPLOADED
SCANNING
STORED
EXTRACTING
EXTRACTED
CHUNKING
EMBEDDING
INDEXED
FAILED
```

---

# 7. Database design

## documents table

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  claim_id UUID,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  document_type VARCHAR(100),
  storage_url TEXT,
  status VARCHAR(50),
  checksum VARCHAR(128),
  file_size_bytes BIGINT,
  page_count INT,
  language VARCHAR(20),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## document_texts table

```sql
CREATE TABLE document_texts (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  extracted_text TEXT,
  extraction_method VARCHAR(100),
  extraction_confidence NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## document_chunks table

```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  claim_id UUID,
  chunk_index INT,
  content TEXT,
  token_count INT,
  page_number INT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## document_embeddings table

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY,
  chunk_id UUID REFERENCES document_chunks(id),
  embedding VECTOR(1536),
  embedding_model VARCHAR(100),
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 8. Metadata quan trọng

Trong RAG, metadata cực kỳ quan trọng.

Không nên chỉ lưu:

```text
content + embedding
```

Nên lưu:

```json
{
  "claim_id": "claim_001",
  "document_id": "doc_001",
  "document_type": "repair_invoice",
  "source_type": "claim_document",
  "page_number": 3,
  "uploaded_by": "user_001",
  "created_at": "2026-06-08",
  "confidentiality": "restricted",
  "tenant_id": "tenant_001"
}
```

Vì retrieval production cần filter:

```text
Chỉ search trong claim này
Chỉ search trong tenant này
Chỉ search document user có quyền xem
Chỉ lấy document active version
```

---

# 9. Chunking strategy

Chunking ảnh hưởng trực tiếp đến chất lượng RAG.

## Bad chunking

```text
Chia mỗi 1000 ký tự bất kể nội dung
```

Vấn đề:

```text
Cắt ngang câu
Mất context
Retrieval sai
LLM thiếu thông tin
```

---

## Better chunking

```text
Chia theo section
Giữ heading
Giữ page number
Overlap hợp lý
```

Ví dụ:

```text
Chunk size: 800 tokens
Overlap: 100 tokens
Split by: heading > paragraph > sentence
```

---

## Chunk format nên lưu

```json
{
  "chunkId": "chunk_001",
  "title": "Accident Description",
  "content": "The accident occurred on...",
  "pageNumber": 2,
  "previousChunkId": "chunk_000",
  "nextChunkId": "chunk_002"
}
```

---

# 10. Implementation: Chunking service

```python
from typing import List
from dataclasses import dataclass

@dataclass
class Chunk:
    content: str
    chunk_index: int
    token_count: int
    metadata: dict

class ChunkingService:
    def __init__(self, chunk_size: int = 800, overlap: int = 100):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def split_text(self, text: str, metadata: dict) -> List[Chunk]:
        words = text.split()
        chunks = []
        start = 0
        index = 0

        while start < len(words):
            end = start + self.chunk_size
            chunk_words = words[start:end]
            content = " ".join(chunk_words)

            chunks.append(
                Chunk(
                    content=content,
                    chunk_index=index,
                    token_count=len(chunk_words),
                    metadata={
                        **metadata,
                        "chunk_index": index,
                    },
                )
            )

            index += 1
            start = end - self.overlap

        return chunks
```

---

# 11. Embedding pipeline

## Flow

```text
Chunk
  |
Embedding model
  |
Vector
  |
Vector store
```

---

## Embedding service

```python
class EmbeddingService:
    def __init__(self, client, model: str):
        self.client = client
        self.model = model

    async def embed_text(self, text: str) -> list[float]:
        response = await self.client.embeddings.create(
            model=self.model,
            input=text
        )

        return response.data[0].embedding

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        response = await self.client.embeddings.create(
            model=self.model,
            input=texts
        )

        return [item.embedding for item in response.data]
```

---

# 12. Indexing service

```python
class DocumentIndexingService:
    def __init__(
        self,
        chunking_service,
        embedding_service,
        vector_store,
        document_repository,
    ):
        self.chunking_service = chunking_service
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.document_repository = document_repository

    async def index_document(self, document_id: str):
        document = await self.document_repository.get(document_id)

        chunks = self.chunking_service.split_text(
            text=document.extracted_text,
            metadata={
                "document_id": document.id,
                "claim_id": document.claim_id,
                "document_type": document.document_type,
                "tenant_id": document.tenant_id,
            },
        )

        embeddings = await self.embedding_service.embed_batch(
            [chunk.content for chunk in chunks]
        )

        vector_documents = []

        for chunk, embedding in zip(chunks, embeddings):
            vector_documents.append({
                "id": f"{document.id}_{chunk.chunk_index}",
                "content": chunk.content,
                "embedding": embedding,
                "metadata": chunk.metadata,
            })

        await self.vector_store.upsert(vector_documents)

        await self.document_repository.update_status(
            document_id,
            "INDEXED"
        )
```

---

# 13. Retrieval architecture

## Simple retrieval

```text
User query
  |
Embed query
  |
Vector search
  |
Top K chunks
  |
LLM
```

---

## Production retrieval

```text
User query
  |
Query rewrite
  |
Embed query
  |
Metadata filter
  |
Hybrid search
  |
Reranking
  |
Context assembly
  |
LLM
```

---

# 14. Retrieval service implementation

```python
class RetrievalService:
    def __init__(self, embedding_service, vector_store):
        self.embedding_service = embedding_service
        self.vector_store = vector_store

    async def retrieve_for_claim(
        self,
        claim_id: str,
        tenant_id: str,
        query: str,
        top_k: int = 5,
    ):
        query_embedding = await self.embedding_service.embed_text(query)

        results = await self.vector_store.search(
            embedding=query_embedding,
            top_k=top_k,
            filters={
                "claim_id": claim_id,
                "tenant_id": tenant_id,
            },
        )

        return results
```

---

# 15. Context assembly

Không nên nhét toàn bộ chunks vào prompt một cách thô.

Nên format context rõ ràng:

```python
def assemble_context(chunks):
    context_parts = []

    for index, chunk in enumerate(chunks, start=1):
        metadata = chunk.metadata

        context_parts.append(f"""
[Source {index}]
Document Type: {metadata.get("document_type")}
Page: {metadata.get("page_number")}
Content:
{chunk.text}
""")

    return "\n\n".join(context_parts)
```

Prompt nên yêu cầu AI cite source:

```text
Use only the provided sources.
If the answer is not found in the sources, say "not enough information".
Reference source number when making claims.
```

---

# 16. Data quality checks

AI data pipeline cần kiểm tra chất lượng.

## Checks nên có

```text
File type hợp lệ
File không rỗng
Extracted text không quá ngắn
OCR confidence đủ cao
Document type xác định được
Chunk không rỗng
Embedding được tạo thành công
Metadata bắt buộc đầy đủ
```

---

## Data quality implementation

```python
class DataQualityService:
    def validate_extracted_text(self, text: str):
        issues = []

        if not text or len(text.strip()) < 100:
            issues.append("EXTRACTED_TEXT_TOO_SHORT")

        if len(text.split()) < 30:
            issues.append("LOW_WORD_COUNT")

        return issues

    def validate_metadata(self, metadata: dict):
        required_fields = [
            "document_id",
            "claim_id",
            "tenant_id",
            "document_type",
        ]

        return [
            field
            for field in required_fields
            if field not in metadata or metadata[field] is None
        ]
```

---

# 17. Data lineage

Lineage trả lời câu hỏi:

> AI output này được tạo từ những document nào, chunk nào, prompt nào, model nào?

Production AI bắt buộc cần phần này.

## ai_response_sources table

```sql
CREATE TABLE ai_response_sources (
  id UUID PRIMARY KEY,
  ai_run_id UUID,
  document_id UUID,
  chunk_id UUID,
  similarity_score NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);
```

Khi AI trả lời, lưu:

```json
{
  "aiRunId": "run_001",
  "sources": [
    {
      "documentId": "doc_001",
      "chunkId": "chunk_004",
      "similarityScore": 0.89
    }
  ]
}
```

---

# 18. Security & privacy

Với Insurance/Healthcare, data architecture phải có security ngay từ đầu.

## Cần có

```text
Tenant isolation
RBAC
PII masking
Encryption at rest
Encryption in transit
Audit log
Retention policy
Data deletion workflow
Access control trong retrieval
```

---

## Retrieval security rule

Không bao giờ search vector DB kiểu:

```python
vector_store.search(query_embedding)
```

Phải luôn filter:

```python
vector_store.search(
    embedding=query_embedding,
    filters={
        "tenant_id": tenant_id,
        "claim_id": claim_id,
        "allowed_document_types": allowed_types,
    }
)
```

---

# 19. Data retention

Ví dụ policy:

```text
Raw claim documents: 7 years
Extracted text: 7 years
Embeddings: same as source document
AI outputs: 7 years
Audit logs: 7 years
Temporary files: delete after 24 hours
```

Nguyên tắc:

> Embedding cũng được xem là derived data từ document gốc, nên khi document bị xóa, embedding liên quan cũng phải xóa.

---

# 20. Local architecture cho Module 4

```text
Docker Compose
├── backend: NestJS
├── ai-service: FastAPI
├── postgres + pgvector
├── redis
├── minio
└── langfuse
```

---

# 21. Folder structure

```text
apps/ai-service/
├── ingestion/
│   ├── document_loader.py
│   ├── text_extractor.py
│   ├── ocr_service.py
│   └── document_classifier.py
├── chunking/
│   └── chunking_service.py
├── embeddings/
│   └── embedding_service.py
├── retrieval/
│   ├── retrieval_service.py
│   └── context_assembler.py
├── quality/
│   └── data_quality_service.py
├── lineage/
│   └── lineage_service.py
└── vectorstores/
    ├── base.py
    └── pgvector_store.py
```

---

# 22. End-to-end implementation flow

## Step 1: Upload

```text
POST /claims/{claimId}/documents
```

Backend:

```text
Save metadata
Upload file to MinIO/S3
Create ingestion job
```

---

## Step 2: Extract

AI service:

```text
Download file
Extract text
Run quality check
Save extracted text
```

---

## Step 3: Chunk

```text
Split text into chunks
Save chunks to database
```

---

## Step 4: Embed

```text
Generate embeddings
Store vectors
Update document status INDEXED
```

---

## Step 5: Retrieve

```text
User asks:
"What documents are missing for this claim?"

System:
Embed query
Search chunks with claim_id + tenant_id filter
Return top chunks
Assemble context
Call LLM
```

---

# 23. API design

## Start indexing

```http
POST /documents/{documentId}/index
```

Response:

```json
{
  "documentId": "doc_001",
  "status": "INDEXING"
}
```

---

## Get document processing status

```http
GET /documents/{documentId}/status
```

Response:

```json
{
  "documentId": "doc_001",
  "status": "INDEXED",
  "steps": {
    "upload": "COMPLETED",
    "extraction": "COMPLETED",
    "chunking": "COMPLETED",
    "embedding": "COMPLETED",
    "indexing": "COMPLETED"
  }
}
```

---

## Search claim knowledge

```http
POST /claims/{claimId}/search
```

Request:

```json
{
  "query": "What evidence supports the accident date?",
  "topK": 5
}
```

Response:

```json
{
  "results": [
    {
      "chunkId": "chunk_001",
      "documentId": "doc_001",
      "documentType": "accident_report",
      "pageNumber": 2,
      "content": "The accident occurred on...",
      "score": 0.91
    }
  ]
}
```

---

# 24. ADR mẫu cho Module 4

## ADR-006: Store Raw Documents Separately from Processed AI Data

```text
Status: Accepted

Context:
The AI Claims Copilot needs to process claim documents such as PDFs,
images, invoices, medical reports, and policy documents. These documents
must be preserved for audit, compliance, and future reprocessing.

Options:
1. Store only extracted text
2. Store raw files and extracted text
3. Store only embeddings

Decision:
Store raw documents in object storage and processed data in PostgreSQL.

Rationale:
Raw documents are the source of truth. Extracted text, chunks, and embeddings
are derived data and can be regenerated when extraction or embedding models
change.

Consequences:
Positive:
- Better auditability
- Easier reprocessing
- Supports future model improvements
- Clear separation between source data and derived AI data

Negative:
- Higher storage cost
- Need lifecycle management
- Need stronger access control
```

---

## ADR-007: Use Metadata Filtering for Secure Retrieval

```text
Status: Accepted

Context:
The system uses vector search to retrieve claim-related context for RAG.
Without proper filtering, retrieval may accidentally return documents from
other tenants, claims, or users.

Decision:
All retrieval queries must include tenant_id and claim_id filters.

Rationale:
Vector similarity alone is not enough for secure retrieval. Access control
must be enforced before context is sent to the LLM.

Consequences:
Positive:
- Prevents cross-tenant data leakage
- Improves relevance
- Supports audit and compliance

Negative:
- Requires complete metadata
- Bad metadata can break retrieval
- More complex query logic
```

---

# 25. Bài thực hành Module 4

## Exercise 1: Data Architecture Document

Tạo file:

```text
docs/module-04-data-architecture.md
```

Nội dung:

```text
1. Data sources
2. Data flow
3. Raw/processed/curated/vector layers
4. Document lifecycle
5. Metadata design
6. Chunking strategy
7. Embedding strategy
8. Retrieval security
9. Data lineage
10. Retention policy
```

---

## Exercise 2: Implement Document Ingestion

Build:

```text
POST /claims/{claimId}/documents
```

Flow:

```text
Upload file
Store raw file
Save document metadata
Create indexing job
```

---

## Exercise 3: Implement Indexing Pipeline

Build:

```text
Document → Extract text → Chunk → Embed → Store vector
```

---

## Exercise 4: Implement Secure Retrieval

Build:

```text
POST /claims/{claimId}/search
```

Requirement:

```text
Search phải filter theo tenant_id + claim_id.
```

---

## Exercise 5: Implement Lineage

Khi AI trả lời, lưu:

```text
ai_run_id
document_id
chunk_id
similarity_score
prompt_version
model_name
```

---

# 26. Checklist hoàn thành Module 4

Bạn hoàn thành Module 4 khi có:

```text
Data architecture document
Raw document storage
Document metadata table
Text extraction pipeline
Chunking service
Embedding service
Vector store
Secure retrieval service
Data quality checks
Lineage tracking
Retention policy
ADR-006
ADR-007
```

---

# 27. Kết quả cần đạt

Sau Module 4, bạn phải có thể nói như một AI Architect:

> Trong hệ thống AI, dữ liệu gốc là source of truth. Extracted text, chunks và embeddings chỉ là derived data. Retrieval phải luôn có metadata filter để tránh data leakage. Mọi AI output cần lineage để biết nó được tạo từ document nào, chunk nào, prompt nào và model nào.

Đây là nền tảng bắt buộc trước khi đi sang **Module 5: GenAI & LLM Architecture Patterns**.
