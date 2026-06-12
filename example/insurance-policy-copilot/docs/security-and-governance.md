# Security and Governance

This sample demonstrates the architecture path, but customer policy documents may contain sensitive data. Production hardening should include:

- Authentication and authorization for every API route.
- Tenant isolation in every table and vector query.
- File size limits, content type checks, malware scanning, and quarantine.
- PII detection and redaction before model calls where required.
- Prompt-injection guardrails that treat uploaded text as untrusted data.
- Audit logs for uploads, queries, answers, and administrative changes.
- Key management through a secret manager, not `.env` files.
- Data retention and deletion policies.
- Cost budgets, rate limits, and abuse detection.
- Evaluation gates before prompt/model changes are promoted.

The RAG prompt already tells the model to use only supplied context, but that is not a complete security control. Treat it as one layer in a larger governance system.

