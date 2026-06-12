# Insurance Policy Copilot

Reference implementation for a production-style AI-first insurance policy assistant.

```text
Upload PDF
  -> Chunking
  -> Embedding
  -> pgvector
  -> RAG
  -> Groq
  -> Citation
  -> Cost Tracking
  -> Prompt Tracking
  -> Evaluation
```

This project is intentionally small enough to study, but it includes the architecture hooks a real team needs: document ingestion, vector search, grounded generation, citations, prompt registry, token/cost accounting, evaluation datasets, and operational dashboards.

## Architecture

```text
React Web App
  | upload / ask / inspect telemetry
  v
Fastify API
  |-- PDF extraction
  |-- chunking
  |-- Local BGE embeddings
  |-- pgvector retrieval
  |-- Groq answer generation
  |-- citation mapping
  |-- prompt + cost tracking
  '-- evaluation runner
  v
PostgreSQL + pgvector
```

## Quick Start

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Set `OPENAI_API_KEY` in `.env`.

3. Start the stack:

```bash
docker compose up --build
```

4. Open the app:

```text
http://localhost:5173
```

API health check:

```text
http://localhost:8080/health
```

## Local Development

```bash
npm install
npm run dev
```

The database still runs through Docker:

```bash
docker compose up db
```

## Main Capabilities

- Upload PDF policies and extract page-aware text.
- Split text into overlapping chunks with stable token estimates.
- Generate local BGE embeddings in rate-limit-aware batches and store them in `pgvector`.
- Retrieve the most relevant policy chunks for a question.
- Generate grounded answers with citations through Groq's OpenAI-compatible API.
- Track prompt template version, rendered prompt, token usage, latency, and cost.
- Run a small evaluation set against uploaded policies.
- Inspect cost and prompt telemetry in the UI.

## Embeddings

The default embedding provider is local Transformers.js using BGE small:

```text
EMBEDDING_PROVIDER=local
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
EMBEDDING_DIMENSIONS=384
```

For Transformers.js runtime compatibility, the API maps `BAAI/bge-small-en-v1.5` to the ONNX-ready `Xenova/bge-small-en-v1.5` artifact internally. The semantic model is BGE small.

The API still batches embedding work so the same code can run with hosted embedding providers later.

```text
EMBEDDING_BATCH_SIZE=8
EMBEDDING_MAX_TOKENS_PER_BATCH=8000
EMBEDDING_MIN_DELAY_MS=750
EMBEDDING_MAX_RETRIES=4
```

## Project Layout

```text
apps/api       Fastify API, RAG pipeline, evaluation runner
apps/web       React UI for upload, chat, telemetry, evaluation
infra/db       PostgreSQL schema and seed prompt templates
docs           Architecture, security, and evaluation notes
evals          Example evaluation dataset
```

## Production Notes

This example is designed to teach the foundation. Before using it for customer data, add authentication, tenant isolation, object storage, malware scanning, PII redaction, rate limits, audit logging, backup policy, and CI/CD gates. See `docs/security-and-governance.md`.

