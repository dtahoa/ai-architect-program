# Module 7: Scalability, Performance & FinOps for AI

Module 7 trả lời câu hỏi:

> Làm sao để hệ thống AI chịu được tải lớn, phản hồi nhanh, không vượt rate limit, và kiểm soát được chi phí theo từng request, từng tenant, từng workflow?

AI system khác backend truyền thống vì cost không chỉ đến từ server/database, mà còn từ:

```text
Input tokens
Output tokens
Embedding tokens
Vector search
Reranking
LLM retries
Agent tool calls
Context size
Prompt version
Model choice
```

Các nhà cung cấp cloud/LLM đều tính phí theo mô hình usage-based, nên FinOps phải là một phần của architecture, không phải việc làm sau. AWS cũng nhấn mạnh cloud là mô hình pay-as-you-go, còn OpenAI/Azure OpenAI/Bedrock đều có pricing dựa trên usage/token/model. ([Amazon Web Services, Inc.][1])

---

# 1. Mục tiêu Module 7

Sau module này bạn cần nắm:

```text
1. Scale backend, AI service, worker, vector DB
2. Tối ưu latency cho LLM workflow
3. Kiểm soát token usage
4. Thiết kế model routing
5. Caching cho AI
6. Rate limit và backpressure
7. Cost tracking theo tenant/request/job
8. Budget alert
9. FinOps dashboard
10. ADR cho scalability và cost
```

---

# 2. Use case tiếp tục

## AI Insurance Claims Copilot

Workload chính:

```text
Document ingestion
Text extraction
Chunking
Embedding
RAG question answering
Claim summarization
Risk assessment
Fraud investigation agent
Human review
```

---

# 3. Architecture tổng thể Module 7

```text
Users
 |
 v
API Gateway / Load Balancer
 |
 v
NestJS Backend
 |
 +------------------------+
 |                        |
 v                        v
Redis Cache          PostgreSQL
 |
 v
Queue / Workflow Engine
 |
 v
AI Worker Pool
 |
 +------------------------+
 |                        |
 v                        v
LLM Gateway          Vector Store
 |
 v
Model Router
 |
 v
LLM Provider
 |
 v
AI Usage Metering
 |
 v
FinOps Dashboard
```

---

# 4. Scalability Architecture

## 4.1 Scale theo loại workload

Không phải component nào cũng scale giống nhau.

| Component        | Scale theo gì                         |
| ---------------- | ------------------------------------- |
| Frontend         | CDN traffic                           |
| Backend API      | Request per second, CPU, memory       |
| AI Worker        | Queue depth, running jobs             |
| Embedding Worker | Number of pending chunks              |
| Vector DB        | Query latency, index size             |
| LLM Gateway      | Token throughput, provider rate limit |
| Database         | Connection count, CPU, IOPS           |
| Cache            | Hit rate, memory                      |

---

# 5. AI workload classification

Trong AI system, nên chia workload thành 3 nhóm.

## Group 1: Real-time

Cần phản hồi nhanh.

```text
User hỏi claim question
Small summarization
Claim field lookup
```

Target:

```text
P95 < 5–10 seconds
```

---

## Group 2: Near-real-time

Có thể chờ.

```text
Claim analysis
Risk assessment
Document indexing
```

Target:

```text
P95 < 1–3 minutes
```

---

## Group 3: Batch

Chạy nền.

```text
Re-embedding
Monthly evaluation
Bulk document migration
Cost report generation
```

Target:

```text
Minutes to hours
```

---

# 6. Reference Architecture

## Real-time path

```text
Frontend
 |
Backend API
 |
AI Gateway
 |
Cache check
 |
Retriever
 |
LLM
 |
Response
```

## Async path

```text
Frontend
 |
Backend API
 |
Queue
 |
AI Worker
 |
LLM / Embedding / Vector DB
 |
Save result
 |
Notify frontend
```

Architect rule:

> Request nào có thể vượt 10–15 giây nên đưa vào async workflow.

---

# 7. Performance bottlenecks trong AI system

Các bottleneck thường gặp:

```text
Prompt quá dài
Retrieve quá nhiều chunks
Output quá dài
Dùng model quá mạnh cho task đơn giản
Không cache
Gọi LLM tuần tự thay vì song song
Agent loop quá nhiều bước
Embedding từng chunk một thay vì batch
Vector index chưa tune
Database connection pool nhỏ
Provider rate limit
```

---

# 8. Latency breakdown

Ví dụ một request RAG:

```text
Auth + backend: 100ms
Query embedding: 300ms
Vector search: 100ms
Context assembly: 50ms
LLM generation: 3000–8000ms
Validation: 100ms
DB save: 50ms
```

Trong đa số AI app, bottleneck chính là:

```text
LLM generation
Output length
Retries
External provider latency
```

---

# 9. Performance optimization patterns

## Pattern 1: Prompt compression

Thay vì gửi:

```text
10 chunks x 800 tokens = 8000 tokens
```

Tối ưu:

```text
Top 5 chunks
Remove boilerplate
Summarize long context
Use metadata filters
```

---

## Pattern 2: Model routing

Không dùng model mạnh nhất cho mọi task.

```text
Classification        → small model
Field extraction      → small/medium model
Risk assessment       → stronger model
Legal explanation     → stronger model
```

---

## Pattern 3: Semantic cache

Nếu câu hỏi giống nhau về mặt ngữ nghĩa, reuse response.

```text
Question:
"What documents are missing?"

Similar:
"Which required documents are not provided?"
```

---

## Pattern 4: Batch embedding

Không nên embed từng chunk:

```python
for chunk in chunks:
    embed(chunk)
```

Nên:

```python
embed_batch(chunks)
```

---

## Pattern 5: Streaming response

Dùng cho UX.

```text
LLM trả token dần
Frontend hiển thị dần
User cảm thấy nhanh hơn
```

---

# 10. FinOps Architecture

FinOps cho AI cần track cost theo nhiều chiều:

```text
Tenant
User
Claim
Workflow
Task
Model
Prompt version
Token usage
Provider
Environment
```

---

## Cost flow

```text
LLM Call
 |
Capture usage
 |
Estimate cost
 |
Store ai_usage_records
 |
Aggregate daily
 |
Dashboard
 |
Budget alert
```

---

# 11. Cost formula

Công thức cơ bản:

```text
Total AI Cost =
Input Token Cost
+ Output Token Cost
+ Embedding Cost
+ Vector DB Cost
+ Reranking Cost
+ Infrastructure Cost
+ Observability Cost
```

Cụ thể:

```text
Input cost =
input_tokens / 1,000,000 * input_price_per_1m

Output cost =
output_tokens / 1,000,000 * output_price_per_1m

Embedding cost =
embedding_tokens / 1,000,000 * embedding_price_per_1m
```

Không nên hardcode giá model trong code vì pricing thay đổi theo thời gian; nên cấu hình giá trong database/config và cập nhật định kỳ từ pricing page chính thức của provider. ([OpenAI][2])

---

# 12. Database design cho FinOps

## ai_usage_records

```sql
CREATE TABLE ai_usage_records (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  user_id UUID,
  claim_id UUID,
  ai_run_id UUID,
  task_name VARCHAR(100),
  provider VARCHAR(100),
  model_name VARCHAR(100),
  prompt_name VARCHAR(100),
  prompt_version VARCHAR(50),
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  embedding_tokens INT DEFAULT 0,
  cached BOOLEAN DEFAULT false,
  latency_ms INT,
  estimated_cost NUMERIC(12, 6),
  created_at TIMESTAMP DEFAULT now()
);
```

---

## ai_model_pricing

```sql
CREATE TABLE ai_model_pricing (
  id UUID PRIMARY KEY,
  provider VARCHAR(100),
  model_name VARCHAR(100),
  input_price_per_1m NUMERIC(12, 6),
  output_price_per_1m NUMERIC(12, 6),
  embedding_price_per_1m NUMERIC(12, 6),
  currency VARCHAR(10),
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## tenant_ai_budgets

```sql
CREATE TABLE tenant_ai_budgets (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  monthly_budget NUMERIC(12, 2),
  daily_token_limit BIGINT,
  monthly_token_limit BIGINT,
  max_concurrent_jobs INT,
  alert_threshold_percent INT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

# 13. Cost calculation implementation

```python
class CostCalculator:
    def __init__(self, pricing_repository):
        self.pricing_repository = pricing_repository

    async def estimate_cost(
        self,
        provider: str,
        model_name: str,
        input_tokens: int,
        output_tokens: int,
        embedding_tokens: int = 0,
    ) -> float:
        pricing = await self.pricing_repository.get_active_pricing(
            provider=provider,
            model_name=model_name,
        )

        input_cost = (
            input_tokens / 1_000_000
        ) * pricing.input_price_per_1m

        output_cost = (
            output_tokens / 1_000_000
        ) * pricing.output_price_per_1m

        embedding_cost = (
            embedding_tokens / 1_000_000
        ) * pricing.embedding_price_per_1m

        return input_cost + output_cost + embedding_cost
```

---

# 14. LLM Gateway với metering

```python
class MeteredLLMGateway:
    def __init__(
        self,
        llm_gateway,
        usage_repository,
        cost_calculator,
    ):
        self.llm_gateway = llm_gateway
        self.usage_repository = usage_repository
        self.cost_calculator = cost_calculator

    async def generate_structured(
        self,
        tenant_id: str,
        claim_id: str,
        task_name: str,
        prompt_name: str,
        prompt_version: str,
        prompt: str,
        output_schema,
        model: str,
    ):
        start_time = time.time()

        response = await self.llm_gateway.generate_structured(
            prompt=prompt,
            output_schema=output_schema,
            model=model,
        )

        latency_ms = int((time.time() - start_time) * 1000)

        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens

        estimated_cost = await self.cost_calculator.estimate_cost(
            provider="openai",
            model_name=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )

        await self.usage_repository.save({
            "tenant_id": tenant_id,
            "claim_id": claim_id,
            "task_name": task_name,
            "prompt_name": prompt_name,
            "prompt_version": prompt_version,
            "model_name": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "latency_ms": latency_ms,
            "estimated_cost": estimated_cost,
        })

        return response
```

---

# 15. Budget enforcement

FinOps không chỉ report chi phí. Nó phải có guardrail.

## Budget check trước khi gọi LLM

```python
class BudgetGuard:
    def __init__(self, usage_repository, budget_repository):
        self.usage_repository = usage_repository
        self.budget_repository = budget_repository

    async def can_execute(self, tenant_id: str):
        budget = await self.budget_repository.get_by_tenant(tenant_id)
        usage = await self.usage_repository.get_monthly_usage(tenant_id)

        if usage.estimated_cost >= budget.monthly_budget:
            return False, "MONTHLY_BUDGET_EXCEEDED"

        if usage.tokens_today >= budget.daily_token_limit:
            return False, "DAILY_TOKEN_LIMIT_EXCEEDED"

        if usage.running_jobs >= budget.max_concurrent_jobs:
            return False, "MAX_CONCURRENT_JOBS_EXCEEDED"

        return True, None
```

---

# 16. Rate limit architecture

```text
Request
 |
Tenant budget check
 |
Provider rate limit check
 |
Queue / Token bucket
 |
LLM call
 |
Usage record
```

---

## Token bucket implementation concept

```python
class TokenBucket:
    def __init__(self, capacity: int, refill_rate: int):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()

    def allow(self, cost: int = 1):
        now = time.time()
        elapsed = now - self.last_refill

        self.tokens = min(
            self.capacity,
            self.tokens + elapsed * self.refill_rate
        )

        self.last_refill = now

        if self.tokens >= cost:
            self.tokens -= cost
            return True

        return False
```

---

# 17. Caching Architecture

## Cache levels

```text
Level 1: Exact cache
Same prompt hash → same response

Level 2: Semantic cache
Similar question → reusable response

Level 3: Retrieval cache
Same query → same chunks

Level 4: Embedding cache
Same text → same embedding
```

---

## Cache key design

```python
import hashlib

def create_prompt_cache_key(
    tenant_id: str,
    model: str,
    prompt_name: str,
    prompt_version: str,
    prompt: str,
):
    raw = f"{tenant_id}:{model}:{prompt_name}:{prompt_version}:{prompt}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
```

---

## Exact response cache

```python
class ResponseCache:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def get(self, key: str):
        cached = await self.redis.get(key)
        if not cached:
            return None
        return json.loads(cached)

    async def set(self, key: str, value: dict, ttl_seconds: int = 3600):
        await self.redis.set(
            key,
            json.dumps(value),
            ex=ttl_seconds
        )
```

---

# 18. Semantic cache architecture

```text
User question
 |
Create embedding
 |
Search cache vector store
 |
Similarity > threshold?
 |
Return cached answer
 |
Else call LLM and store answer
```

Use carefully for Insurance:

```text
Chỉ cache trong same tenant
Chỉ cache trong same claim/policy scope
Không cache high-risk recommendation quá lâu
Không cache nếu data version thay đổi
```

---

# 19. Model routing for cost

## Routing matrix

| Task                 | Default model | Escalate when         |
| -------------------- | ------------- | --------------------- |
| Claim classification | Small model   | confidence < 0.8      |
| Field extraction     | Small/medium  | JSON invalid twice    |
| Summary              | Medium        | long complex document |
| Risk assessment      | Strong        | always                |
| Fraud investigation  | Strong        | high value claim      |

---

## Implementation

```python
class CostAwareModelRouter:
    def __init__(self, config):
        self.config = config

    def select_model(
        self,
        task_name: str,
        risk_level: str = "LOW",
        document_tokens: int = 0,
    ):
        task_config = self.config[task_name]

        if risk_level == "HIGH":
            return task_config["high_accuracy_model"]

        if document_tokens > task_config["large_context_threshold"]:
            return task_config["large_context_model"]

        return task_config["default_model"]
```

---

# 20. Retry strategy

Retries có thể tăng cost rất nhanh.

Không nên retry vô hạn.

## Retry policy

```text
Timeout: retry 2 times
Rate limit: exponential backoff
JSON validation fail: retry once with repair prompt
Policy violation: no retry, send human review
Provider outage: fallback provider
```

---

## Implementation

```python
class RetryPolicy:
    def should_retry(self, error_type: str, attempt: int):
        max_attempts = {
            "TIMEOUT": 2,
            "RATE_LIMIT": 3,
            "JSON_VALIDATION_ERROR": 1,
            "POLICY_VIOLATION": 0,
        }

        return attempt < max_attempts.get(error_type, 0)
```

---

# 21. Queue-based scaling

## SQS/BullMQ worker logic

```text
Queue depth low  → 1 worker
Queue depth high → scale to N workers
Rate limit near  → slow down workers
Budget near max  → pause low-priority jobs
```

---

## Job priority

```text
P0: User waiting in UI
P1: Claim officer workflow
P2: Background indexing
P3: Batch re-embedding
P4: Evaluation
```

---

# 22. Priority queue example

```ts
await queue.add(
  'claim-risk-assessment',
  { claimId },
  {
    priority: 1,
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
);
```

---

# 23. Performance SLOs

## Suggested SLO

```text
RAG QA P95 latency < 8s
Claim summary P95 latency < 15s
Risk assessment P95 latency < 60s
Document indexing P95 < 3 minutes
JSON validation success > 98%
AI provider error rate < 2%
Cache hit rate > 30% for repeated queries
Cost per claim analysis < target budget
```

---

# 24. FinOps dashboard

Dashboard cần có:

```text
Cost by tenant
Cost by model
Cost by task
Cost by prompt version
Cost per claim
Token usage trend
Top expensive users
Cache hit rate
Retry cost
Failed-call cost
Daily burn rate
Monthly forecast
```

---

## SQL: cost by task

```sql
SELECT
  task_name,
  model_name,
  COUNT(*) AS total_calls,
  SUM(input_tokens) AS input_tokens,
  SUM(output_tokens) AS output_tokens,
  SUM(estimated_cost) AS total_cost,
  AVG(latency_ms) AS avg_latency
FROM ai_usage_records
WHERE created_at >= date_trunc('month', now())
GROUP BY task_name, model_name
ORDER BY total_cost DESC;
```

---

## SQL: cost by tenant

```sql
SELECT
  tenant_id,
  SUM(estimated_cost) AS monthly_cost,
  SUM(input_tokens + output_tokens + embedding_tokens) AS total_tokens
FROM ai_usage_records
WHERE created_at >= date_trunc('month', now())
GROUP BY tenant_id
ORDER BY monthly_cost DESC;
```

---

# 25. Cost optimization playbook

## Khi cost cao do input tokens

Làm:

```text
Reduce chunk count
Improve metadata filter
Summarize context
Compress prompt
Remove unnecessary system instructions
Use smaller context model
```

---

## Khi cost cao do output tokens

Làm:

```text
Set max output tokens
Return structured JSON
Ask concise answer
Use bullet limit
Avoid verbose reasoning
```

---

## Khi cost cao do retries

Làm:

```text
Improve prompt
Use structured output
Validate before LLM call
Fallback only when needed
Fix provider timeout
```

---

## Khi cost cao do agent

Làm:

```text
Limit max steps
Restrict tools
Use deterministic workflow where possible
Cache tool results
Require human review earlier
```

---

# 26. Concrete architecture cho Module 7 MVP

```text
NextJS
 |
NestJS Backend
 |
Redis
 |-- Response cache
 |-- Rate limit
 |-- BullMQ queue
 |
FastAPI AI Service
 |
 |-- Budget Guard
 |-- Cost-aware Model Router
 |-- Metered LLM Gateway
 |-- Retrieval Cache
 |
PostgreSQL
 |-- ai_usage_records
 |-- ai_model_pricing
 |-- tenant_ai_budgets
 |
pgvector
 |
Langfuse / Dashboard
```

---

# 27. Implementation folder structure

```text
apps/ai-service/
├── finops/
│   ├── cost_calculator.py
│   ├── budget_guard.py
│   ├── usage_repository.py
│   └── pricing_repository.py
├── performance/
│   ├── response_cache.py
│   ├── semantic_cache.py
│   ├── rate_limiter.py
│   └── retry_policy.py
├── routing/
│   └── cost_aware_model_router.py
├── gateways/
│   └── metered_llm_gateway.py
└── workers/
    └── ai_job_worker.py
```

---

# 28. API cho FinOps

## Get tenant AI usage

```http
GET /tenants/{tenantId}/ai-usage?month=2026-06
```

Response:

```json
{
  "tenantId": "tenant_001",
  "month": "2026-06",
  "estimatedCost": 123.45,
  "totalTokens": 128000000,
  "costByTask": [
    {
      "taskName": "risk_assessment",
      "cost": 65.12
    },
    {
      "taskName": "rag_qa",
      "cost": 32.88
    }
  ]
}
```

---

## Set tenant budget

```http
PUT /tenants/{tenantId}/ai-budget
```

Request:

```json
{
  "monthlyBudget": 500,
  "dailyTokenLimit": 10000000,
  "monthlyTokenLimit": 200000000,
  "maxConcurrentJobs": 10,
  "alertThresholdPercent": 80
}
```

---

# 29. ADR mẫu Module 7

## ADR-012: Introduce Metered LLM Gateway

```text
Status: Accepted

Context:
The AI Claims Copilot uses LLM calls for summarization, extraction,
classification, RAG, and risk assessment. These calls generate variable
cost based on input tokens, output tokens, model choice, retries, and
workflow complexity.

Decision:
Introduce a Metered LLM Gateway that records token usage, latency, model,
prompt version, estimated cost, tenant ID, claim ID, and task name for
every LLM call.

Rationale:
Centralized metering enables FinOps reporting, cost allocation, budget
enforcement, model comparison, and optimization.

Consequences:
Positive:
- Cost visibility by tenant/task/model
- Easier budget enforcement
- Better debugging
- Supports optimization decisions

Negative:
- More implementation effort
- Requires pricing data maintenance
- Gateway becomes critical infrastructure
```

---

## ADR-013: Use Cost-Aware Model Routing

```text
Status: Accepted

Context:
Different AI tasks have different complexity and risk levels. Using the
most capable model for all tasks increases cost unnecessarily.

Decision:
Use cost-aware model routing. Simple tasks use smaller models. High-risk
or complex tasks use stronger models.

Rationale:
This reduces cost while preserving quality for critical workflows.

Consequences:
Positive:
- Lower average cost per claim
- Better scalability under budget
- Enables model fallback and experimentation

Negative:
- More routing complexity
- Requires evaluation per task
- Incorrect routing may reduce quality
```

---

# 30. Bài thực hành Module 7

## Exercise 1: Implement AI Usage Metering

Build:

```text
ai_usage_records table
MeteredLLMGateway
CostCalculator
```

Mỗi LLM call phải lưu:

```text
tenant_id
claim_id
task_name
model_name
prompt_version
input_tokens
output_tokens
latency_ms
estimated_cost
```

---

## Exercise 2: Implement Budget Guard

Rule:

```text
If tenant exceeds monthly budget,
block low-priority AI jobs.
```

---

## Exercise 3: Implement Response Cache

Cache:

```text
Same tenant
Same claim
Same prompt version
Same model
Same prompt hash
```

---

## Exercise 4: Implement Cost-aware Model Router

Routing:

```text
classification → small model
risk assessment → strong model
summary → medium model
```

---

## Exercise 5: Create FinOps Dashboard Queries

Viết SQL:

```text
Cost by tenant
Cost by task
Cost by model
Cost by prompt version
Retry cost
Daily burn rate
```

---

# 31. Checklist hoàn thành Module 7

Bạn hoàn thành Module 7 khi có:

```text
Scalability architecture
Real-time vs async workload classification
Queue-based scaling design
Rate limit policy
Retry policy
Response cache
Model routing
ai_usage_records table
ai_model_pricing table
tenant_ai_budgets table
Metered LLM Gateway
Cost calculator
Budget guard
FinOps dashboard SQL
ADR-012
ADR-013
```

---

# Kết quả cần đạt

Sau Module 7, bạn phải giải thích được:

> AI scalability không chỉ là tăng số container. Phải scale theo queue depth, token throughput, provider rate limit, vector search latency và cost budget. FinOps phải được gắn vào LLM Gateway để biết mỗi request, mỗi claim, mỗi tenant tốn bao nhiêu tiền. Tối ưu AI cost bằng prompt compression, model routing, caching, batch embedding, retry control và budget guard.

[1]: https://aws.amazon.com/?utm_source=chatgpt.com "Cloud Computing Services - Amazon Web Services (AWS)"
[2]: https://openai.com/?utm_source=chatgpt.com "OpenAI | Research & Deployment"
