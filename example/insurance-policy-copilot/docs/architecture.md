# Architecture

## Request Flow

```text
PDF upload
  -> API validates file
  -> PDF parser extracts page text
  -> chunker creates overlapping semantic chunks
  -> embedding gateway calls OpenAI
  -> chunks + vectors are stored in PostgreSQL pgvector

Question
  -> API embeds the question
  -> pgvector cosine search retrieves top chunks
  -> prompt renderer creates a tracked prompt run
  -> OpenAI generates a grounded response
  -> API maps citations back to document/page/chunk
  -> usage, tokens, latency, and estimated cost are persisted
```

## Core Decisions

- PostgreSQL with `pgvector` keeps metadata and vectors transactionally close for a first production system.
- OpenAI access is isolated behind `openaiGateway.ts` so models and pricing can change without rewriting routes.
- Prompt templates are database records with versions, not hard-coded strings only.
- Citations reference chunks and page spans because insurance answers must be auditable.
- Evaluation is built into the API so quality checks can become CI/CD or release gates later.

## Future Extensions

- Tenant-aware row-level security.
- Object storage for original PDFs.
- OCR for scanned policies.
- Hybrid retrieval using BM25 plus vector search.
- Reranking for long policies.
- Human review workflow for low-confidence answers.
- OpenTelemetry traces and metrics export.

