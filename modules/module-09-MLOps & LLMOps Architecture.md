# Module 9: MLOps & LLMOps Architecture

Module 9 trả lời câu hỏi:

> Làm sao vận hành AI system như production software: có versioning, evaluation, monitoring, rollback, incident response và continuous improvement?

---

# 1. MLOps vs LLMOps

## MLOps

Dùng cho hệ thống có train model.

```text
Data → Train model → Evaluate → Deploy → Monitor → Retrain
```

Ví dụ:

```text
Fraud detection model
Risk scoring model
Claim classification model tự train
```

---

## LLMOps

Dùng cho hệ thống GenAI/LLM.

```text
Prompt → RAG → LLM call → Tool call → Evaluation → Monitoring → Improve
```

Ví dụ:

```text
Claim summarization
Policy Q&A
Risk explanation
Claim investigation agent
```

LLMOps cần quản lý prompt, RAG quality, trace, cost, latency, hallucination và human feedback. Langfuse, LangSmith và MLflow đều hỗ trợ observability/evaluation cho LLM apps/agents. ([Langfuse][1])

---

# 2. Architecture tổng thể Module 9

```text
Developer
 |
 v
Git Repository
 |
 v
CI/CD Pipeline
 |
 +--> Unit Tests
 +--> Prompt Tests
 +--> RAG Evaluation
 +--> Security Checks
 +--> Cost Regression Checks
 |
 v
Staging Environment
 |
 v
Evaluation Gate
 |
 v
Production Deployment
 |
 v
LLMOps Monitoring
 |
 +--> Traces
 +--> Token Cost
 +--> Latency
 +--> Quality Score
 +--> Human Feedback
 |
 v
Improvement Loop
```

---

# 3. LLMOps khác CI/CD thường ở đâu?

Backend truyền thống test:

```text
Unit test
Integration test
Contract test
Load test
```

LLM system cần thêm:

```text
Prompt version test
Structured output validation
RAG source quality test
Hallucination test
Human review rate tracking
Cost per request regression
Latency regression
Model fallback test
Tool-call safety test
```

---

# 4. Production Architecture cho AI Claims Copilot

```text
NextJS Frontend
 |
NestJS Backend
 |
Queue / Workflow
 |
FastAPI AI Service
 |
 +--> Prompt Registry
 +--> LLM Gateway
 +--> RAG Pipeline
 +--> Tool Executor
 +--> Guardrails
 +--> Evaluation Runner
 |
Observability Platform
Langfuse / LangSmith / MLflow
 |
PostgreSQL
 |
Dashboards + Alerts
```

---

# 5. Những artifact cần version

Trong LLMOps, không chỉ version code.

Cần version:

```text
Application code
Prompt
Prompt template variables
Model name
Model routing config
Embedding model
Chunking strategy
Retrieval config
Reranker config
Tool schema
Guardrail policy
Evaluation dataset
Golden answers
Infrastructure config
```

Ví dụ một AI run phải biết:

```json
{
  "model": "gpt-4.1",
  "prompt": "risk_assessment:v3",
  "embedding_model": "text-embedding-3-small",
  "chunking_strategy": "section-aware:v2",
  "retrieval_top_k": 5,
  "guardrail_policy": "claims_policy:v1"
}
```

---

# 6. Prompt Registry Architecture

```text
prompts/
├── claim_summary/
│   ├── v1.txt
│   ├── v2.txt
│   └── metadata.yaml
├── risk_assessment/
│   ├── v1.txt
│   ├── v2.txt
│   └── metadata.yaml
└── policy_qa/
    ├── v1.txt
    ├── v2.txt
    └── metadata.yaml
```

## Metadata

```yaml
name: risk_assessment
version: v2
owner: ai-platform-team
approved_by: claims-domain-owner
model: gpt-4.1
status: candidate
created_at: 2026-06-08
```

---

# 7. Prompt deployment lifecycle

```text
Draft
 |
Local test
 |
Evaluation dataset
 |
Staging
 |
Approval
 |
Production
 |
Monitor
 |
Rollback if needed
```

Không nên sửa prompt trực tiếp trong production.

---

# 8. Evaluation Architecture

```text
Evaluation Dataset
 |
Run Candidate Prompt/Model
 |
Compare Against Baseline
 |
Score
 |
Pass/Fail Gate
 |
Deploy or Reject
```

---

## Eval dataset example

```json
[
  {
    "id": "eval_001",
    "claim_id": "claim_001",
    "question": "What document is missing?",
    "expected_answer_contains": ["police report"],
    "expected_source_document": "accident_report.pdf"
  }
]
```

---

# 9. Evaluation metrics

## Cho RAG

```text
Answer correctness
Source faithfulness
Source relevance
No-answer accuracy
Citation accuracy
```

## Cho extraction

```text
Field accuracy
JSON schema validity
Missing field detection
Confidence calibration
```

## Cho agent

```text
Task success rate
Tool-call correctness
Number of steps
Unsafe tool-call attempts
Cost per successful task
```

## Cho production

```text
Latency P95
Cost per claim
Human correction rate
User feedback score
Guardrail violation rate
```

---

# 10. Evaluation Runner implementation

```python
class EvaluationRunner:
    def __init__(self, ai_service, evaluator):
        self.ai_service = ai_service
        self.evaluator = evaluator

    async def run(self, dataset: list[dict], config: dict):
        results = []

        for case in dataset:
            actual = await self.ai_service.answer_question(
                claim_id=case["claim_id"],
                question=case["question"],
                config=config,
            )

            score = self.evaluator.score(
                expected=case,
                actual=actual,
            )

            results.append({
                "case_id": case["id"],
                "score": score,
                "actual": actual,
            })

        return results
```

---

# 11. Simple evaluator

```python
class SimpleEvaluator:
    def score(self, expected: dict, actual: dict):
        score = 0

        if expected["expected_answer_contains"][0].lower() in actual["answer"].lower():
            score += 0.5

        source_ids = [s["document_id"] for s in actual["sources"]]

        if expected["expected_source_document"] in source_ids:
            score += 0.5

        return score
```

---

# 12. CI/CD Pipeline cho LLMOps

```text
Pull Request
 |
Code lint
 |
Unit tests
 |
Prompt syntax check
 |
Schema validation
 |
RAG eval
 |
Cost regression check
 |
Security scan
 |
Build image
 |
Deploy staging
 |
Smoke test
 |
Manual approval
 |
Deploy production
```

---

## GitHub Actions skeleton

```yaml
name: LLMOps Pipeline

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test-and-evaluate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run unit tests
        run: pytest tests/unit

      - name: Validate prompts
        run: python scripts/validate_prompts.py

      - name: Run RAG evaluation
        run: python scripts/run_eval.py --dataset eval/claims_qa.json

      - name: Check cost regression
        run: python scripts/check_cost_regression.py

      - name: Build AI service
        run: docker build -t ai-service:${{ github.sha }} ./apps/ai-service
```

---

# 13. Prompt validation

```python
from pathlib import Path

REQUIRED_VARIABLES = {
    "risk_assessment": [
        "{{claim_context}}",
        "{{policy_context}}",
        "{{output_schema}}",
    ]
}

def validate_prompt(prompt_name: str, content: str):
    missing = []

    for variable in REQUIRED_VARIABLES.get(prompt_name, []):
        if variable not in content:
            missing.append(variable)

    return missing
```

---

# 14. Deployment strategy

## Blue/green cho prompt

```text
Production Prompt v1
 |
Deploy Candidate v2 to 10% traffic
 |
Compare metrics
 |
Promote v2 or rollback
```

## Canary theo tenant

```text
Internal tenant only
 |
Pilot customer
 |
10% production
 |
100% production
```

---

# 15. Rollback Strategy

Cần rollback được:

```text
Prompt version
Model routing config
Embedding model
Retriever config
Application image
Guardrail policy
```

Ví dụ:

```yaml
active_prompts:
  risk_assessment: v2

rollback_to:
  risk_assessment: v1
```

---

# 16. Observability Architecture

```text
AI Request
 |
Trace ID
 |
Prompt version
 |
Retriever results
 |
LLM call
 |
Tool calls
 |
Guardrails
 |
Final output
 |
Human feedback
 |
Dashboard
```

Langfuse mô tả mình là open-source LLM engineering platform cho development, monitoring, evaluation và debugging; LangSmith cũng tập trung vào tracing, evaluation và monitoring cho LLM apps/agents. ([Langfuse][1])

---

# 17. ai_traces table

```sql
CREATE TABLE ai_traces (
  id UUID PRIMARY KEY,
  trace_id VARCHAR(128),
  tenant_id UUID,
  user_id UUID,
  claim_id UUID,
  task_name VARCHAR(100),
  prompt_name VARCHAR(100),
  prompt_version VARCHAR(50),
  model_name VARCHAR(100),
  input_tokens INT,
  output_tokens INT,
  latency_ms INT,
  estimated_cost NUMERIC,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 18. ai_eval_runs table

```sql
CREATE TABLE ai_eval_runs (
  id UUID PRIMARY KEY,
  eval_name VARCHAR(100),
  dataset_version VARCHAR(50),
  candidate_config JSONB,
  baseline_config JSONB,
  total_cases INT,
  passed_cases INT,
  failed_cases INT,
  average_score NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 19. Human feedback loop

```text
AI output
 |
Human reviewer edits
 |
System records correction
 |
Feedback dataset
 |
Next evaluation run
 |
Prompt/model improvement
```

## Feedback table

```sql
CREATE TABLE ai_human_feedback (
  id UUID PRIMARY KEY,
  ai_run_id UUID,
  reviewer_id UUID,
  feedback_type VARCHAR(50),
  original_output JSONB,
  corrected_output JSONB,
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 20. Production monitoring alerts

Tạo alert cho:

```text
P95 latency tăng > 30%
Cost/request tăng > 20%
JSON validation error > 2%
RAG no-source answer > 1%
Human correction rate > 15%
Guardrail violation > 5%
Provider error > 3%
Tool-call failure > 2%
```

---

# 21. Incident response cho AI

Ví dụ incident:

```text
Prompt v4 làm AI recommend sai
RAG retrieve nhầm tenant
Model provider timeout
Cost tăng đột biến
Agent gọi tool sai
```

## Playbook

```text
1. Disable problematic prompt/model config
2. Rollback to previous prompt
3. Pause affected workflow
4. Identify impacted claims/users
5. Review traces and sources
6. Notify stakeholders
7. Patch guardrail/eval
8. Add regression test
```

---

# 22. Concrete implementation folder

```text
apps/ai-service/
├── prompts/
├── eval/
│   ├── datasets/
│   ├── evaluators/
│   └── evaluation_runner.py
├── observability/
│   ├── tracing.py
│   ├── metrics.py
│   └── langfuse_client.py
├── llmops/
│   ├── prompt_registry.py
│   ├── deployment_config.py
│   ├── rollback_service.py
│   └── release_gate.py
└── scripts/
    ├── validate_prompts.py
    ├── run_eval.py
    └── check_cost_regression.py
```

---

# 23. ADR mẫu Module 9

## ADR-016: Require Evaluation Gate Before Prompt Deployment

```text
Status: Accepted

Context:
Prompt changes can significantly affect output quality, cost, safety and
business behavior. Manual review alone is insufficient for production AI.

Decision:
Every production prompt change must pass an evaluation gate before release.

Rationale:
Evaluation reduces regression risk and provides evidence that a prompt
change improves or maintains quality.

Consequences:
Positive:
- Lower regression risk
- Better release confidence
- Measurable quality control
- Easier rollback decision

Negative:
- Slower prompt release
- Requires evaluation dataset maintenance
- Requires CI/CD integration
```

---

## ADR-017: Track Full AI Trace for Production Requests

```text
Status: Accepted

Context:
AI responses depend on prompt version, model, retrieved sources, tool calls,
guardrails and runtime configuration. Without traceability, debugging and
audit are difficult.

Decision:
Capture full AI traces for production requests, including prompt version,
model, latency, token usage, retrieved source IDs, tool calls and guardrail
results.

Rationale:
Tracing enables debugging, monitoring, incident response, cost analysis and
auditability.

Consequences:
Positive:
- Faster debugging
- Better audit trail
- Supports FinOps
- Enables quality monitoring

Negative:
- More storage cost
- Must avoid logging sensitive raw PII
- Requires retention policy
```

---

# 24. Bài thực hành Module 9

## Exercise 1: Prompt Registry

Build:

```text
PromptRegistry.load(name, version)
Prompt metadata YAML
Active prompt config
```

---

## Exercise 2: Evaluation Dataset

Tạo:

```text
eval/datasets/claims_qa_v1.json
```

Có ít nhất:

```text
10 câu hỏi RAG
10 case field extraction
5 case risk assessment
```

---

## Exercise 3: Evaluation Runner

Build:

```text
python scripts/run_eval.py
```

Output:

```text
average_score
failed_cases
cost_estimate
latency
```

---

## Exercise 4: CI/CD Gate

Pipeline fail nếu:

```text
average_score < baseline_score
JSON validity < 98%
cost/request tăng > 20%
```

---

## Exercise 5: Observability

Log mỗi request:

```text
trace_id
prompt_version
model
retrieved_sources
tool_calls
tokens
latency
cost
guardrail_result
```

---

# 25. Checklist hoàn thành Module 9

Bạn hoàn thành Module 9 khi có:

```text
Prompt registry
Prompt metadata
Evaluation dataset
Evaluation runner
Release gate
AI trace logging
Human feedback table
Rollback config
Monitoring alerts
Incident response playbook
ADR-016
ADR-017
```

---

# Kết quả cần đạt

Sau Module 9, bạn phải giải thích được:

> LLMOps là cách vận hành AI app có kiểm soát. Không deploy prompt/model thay đổi trực tiếp lên production. Mỗi thay đổi phải có evaluation, trace, cost check, safety check và rollback plan. Production AI phải theo dõi prompt version, model, sources, tool calls, token cost, latency, guardrail violation và human feedback.

[1]: https://langfuse.com/?utm_source=chatgpt.com "Langfuse"
