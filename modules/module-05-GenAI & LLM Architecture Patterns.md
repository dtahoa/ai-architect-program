# Module 5: GenAI & LLM Architecture Patterns

Module 5 giúp bạn hiểu **các pattern kiến trúc phổ biến khi xây hệ thống GenAI/LLM production**.

Module này trả lời câu hỏi:

> Khi nào dùng simple prompt, khi nào dùng RAG, khi nào dùng tool calling, khi nào dùng agent, khi nào cần human-in-the-loop?

---

# 1. Mục tiêu Module 5

Sau module này bạn cần nắm:

```text
1. Prompt-only pattern
2. RAG pattern
3. Tool-calling pattern
4. Agent pattern
5. Multi-agent pattern
6. Human-in-the-loop pattern
7. Guardrails pattern
8. Evaluation pattern
```

Với vai trò **AI Technical Architect**, bạn không chỉ biết implement, mà phải biết:

```text
Pattern nào phù hợp với requirement nào
Pattern nào rủi ro cao
Pattern nào tốn cost
Pattern nào dễ vận hành production
```

---

# 2. Use case xuyên suốt

## AI Insurance Claims Copilot

Hệ thống hỗ trợ nhân viên bảo hiểm:

```text
Upload claim document
Extract claim information
Search policy knowledge base
Summarize claim
Assess risk
Detect missing documents
Recommend next action
Human review
```

---

# 3. Pattern 1: Simple Prompt Pattern

## Khi nào dùng?

Dùng khi task đơn giản, không cần dữ liệu ngoài.

Ví dụ:

```text
Summarize một đoạn text
Rewrite email
Classify sentiment
Format JSON
Extract fields từ một document đã có sẵn text
```

---

## Architecture

```text
User
 |
 v
Backend / AI Service
 |
 v
Prompt Builder
 |
 v
LLM
 |
 v
Output Validator
 |
 v
Response
```

---

## Implementation

```python
class SimplePromptService:
    def __init__(self, llm_gateway):
        self.llm_gateway = llm_gateway

    async def summarize_claim_text(self, text: str):
        prompt = f"""
You are an insurance claim assistant.

Summarize the following claim document in 5 bullet points.

Document:
{text}
"""

        return await self.llm_gateway.generate_text(
            prompt=prompt,
            model="gpt-4.1-mini",
            temperature=0
        )
```

---

## Ưu điểm

```text
Dễ build
Latency thấp
Cost thấp
Ít component
```

## Nhược điểm

```text
Không có knowledge ngoài input
Dễ hallucinate nếu prompt không chặt
Không phù hợp câu hỏi cần search dữ liệu
```

---

# 4. Pattern 2: RAG Pattern

RAG = **Retrieval-Augmented Generation**

Dùng khi LLM cần trả lời dựa trên dữ liệu nội bộ.

---

## Khi nào dùng?

Ví dụ:

```text
Policy này có cover loại claim này không?
Claim thiếu document nào?
Điều khoản nào áp dụng cho case này?
Có bằng chứng nào trong hồ sơ hỗ trợ accident date?
```

---

## Architecture

```text
User Query
 |
 v
AI Service
 |
 v
Query Embedding
 |
 v
Vector Search
 |
 v
Top K Relevant Chunks
 |
 v
Context Assembly
 |
 v
LLM
 |
 v
Cited Answer
```

---

## RAG flow cụ thể

```text
1. User hỏi câu hỏi
2. Embed câu hỏi
3. Search vector DB
4. Lọc theo tenant_id, claim_id, policy_id
5. Lấy top chunks
6. Build prompt với context
7. LLM trả lời dựa trên context
8. Lưu source lineage
```

---

## Implementation

```python
class RagService:
    def __init__(self, embedding_service, vector_store, llm_gateway):
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.llm_gateway = llm_gateway

    async def answer_claim_question(
        self,
        claim_id: str,
        tenant_id: str,
        question: str
    ):
        query_embedding = await self.embedding_service.embed_text(question)

        chunks = await self.vector_store.search(
            embedding=query_embedding,
            top_k=5,
            filters={
                "claim_id": claim_id,
                "tenant_id": tenant_id,
            }
        )

        context = self.assemble_context(chunks)

        prompt = f"""
You are an insurance claim assistant.

Answer the question using only the provided sources.
If the answer is not found, say "Not enough information".

Question:
{question}

Sources:
{context}

Return answer with source references.
"""

        answer = await self.llm_gateway.generate_text(
            prompt=prompt,
            model="gpt-4.1",
            temperature=0
        )

        return {
            "answer": answer,
            "sources": [
                {
                    "chunk_id": chunk.id,
                    "document_id": chunk.metadata["document_id"],
                    "score": chunk.score
                }
                for chunk in chunks
            ]
        }

    def assemble_context(self, chunks):
        return "\n\n".join([
            f"""
[Source {index + 1}]
Document: {chunk.metadata.get("document_type")}
Page: {chunk.metadata.get("page_number")}
Content:
{chunk.text}
"""
            for index, chunk in enumerate(chunks)
        ])
```

---

## Ưu điểm

```text
Giảm hallucination
Dùng được dữ liệu nội bộ
Có source traceability
Không cần fine-tune
```

## Nhược điểm

```text
Phụ thuộc chất lượng chunking
Phụ thuộc vector search
Có thể retrieve sai context
Tốn thêm embedding + vector DB
```

---

# 5. Pattern 3: Tool Calling Pattern

Tool calling là khi LLM không chỉ trả lời text, mà có thể gọi function/API.

---

## Khi nào dùng?

Ví dụ:

```text
Get claim by ID
Check policy status
Calculate claim amount
Create review task
Send notification
Check fraud rule engine
```

---

## Architecture

```text
User
 |
 v
LLM
 |
 v
Tool Decision
 |
 v
Backend Tool/API
 |
 v
Tool Result
 |
 v
LLM Final Response
```

---

## Tool examples

```text
get_claim_details(claim_id)
get_policy_details(policy_number)
calculate_deductible(policy_id, claim_amount)
create_human_review_task(claim_id)
```

---

## Implementation

```python
class ClaimTools:
    def __init__(self, claim_repository, policy_repository):
        self.claim_repository = claim_repository
        self.policy_repository = policy_repository

    async def get_claim_details(self, claim_id: str):
        return await self.claim_repository.get_by_id(claim_id)

    async def get_policy_details(self, policy_number: str):
        return await self.policy_repository.get_by_number(policy_number)

    async def calculate_deductible(
        self,
        policy_number: str,
        claim_amount: float
    ):
        policy = await self.policy_repository.get_by_number(policy_number)

        deductible = policy.deductible_amount
        payable_amount = max(claim_amount - deductible, 0)

        return {
            "deductible": deductible,
            "payable_amount": payable_amount
        }
```

---

## Tool Registry

```python
TOOL_REGISTRY = {
    "get_claim_details": {
        "description": "Get claim details by claim ID",
        "handler": claim_tools.get_claim_details
    },
    "get_policy_details": {
        "description": "Get policy details by policy number",
        "handler": claim_tools.get_policy_details
    },
    "calculate_deductible": {
        "description": "Calculate deductible and payable amount",
        "handler": claim_tools.calculate_deductible
    }
}
```

---

## Architect rule

LLM không được gọi tool nguy hiểm trực tiếp.

Ví dụ không nên cho LLM tự gọi:

```text
approve_claim()
pay_claim()
delete_customer_data()
```

Những action đó phải qua human approval.

---

# 6. Pattern 4: Agent Pattern

Agent là pattern khi LLM có thể:

```text
Lập kế hoạch
Gọi tool
Quan sát kết quả
Ra bước tiếp theo
Lặp lại nhiều lần
```

---

## Khi nào dùng?

Dùng khi task có nhiều bước và không biết trước thứ tự cố định.

Ví dụ:

```text
Investigate suspicious claim
Analyze cyber incident
Review multiple documents
Compare claim against policy and historical cases
```

---

## Architecture

```text
User Goal
 |
 v
Agent Planner
 |
 v
Tool Selection
 |
 v
Tool Execution
 |
 v
Observation
 |
 v
Next Step Decision
 |
 v
Final Answer
```

---

## Example: Claim Investigation Agent

Agent có thể dùng tools:

```text
search_claim_documents
get_policy_details
search_historical_claims
check_fraud_rules
generate_investigation_report
```

---

## Implementation đơn giản

```python
class ClaimInvestigationAgent:
    def __init__(self, llm_gateway, tools):
        self.llm_gateway = llm_gateway
        self.tools = tools

    async def run(self, claim_id: str, goal: str):
        steps = []

        for step_number in range(5):
            prompt = f"""
You are a claim investigation agent.

Goal:
{goal}

Claim ID:
{claim_id}

Previous steps:
{steps}

Available tools:
- search_claim_documents
- get_policy_details
- check_fraud_rules
- generate_report

Decide the next tool to call.
Return JSON:
{{
  "tool_name": "...",
  "tool_input": {{ }},
  "reason": "..."
}}
"""

            decision = await self.llm_gateway.generate_json(prompt)

            tool_name = decision["tool_name"]

            if tool_name == "generate_report":
                break

            tool_result = await self.tools[tool_name](**decision["tool_input"])

            steps.append({
                "decision": decision,
                "result": tool_result
            })

        return await self.generate_final_report(claim_id, steps)

    async def generate_final_report(self, claim_id: str, steps: list):
        prompt = f"""
Generate final investigation report.

Claim ID:
{claim_id}

Investigation steps:
{steps}
"""
        return await self.llm_gateway.generate_text(prompt)
```

---

## Ưu điểm

```text
Linh hoạt
Phù hợp task phức tạp
Có thể xử lý nhiều bước
```

## Nhược điểm

```text
Khó kiểm soát
Cost cao
Latency cao
Dễ loop
Khó debug
Cần guardrails mạnh
```

---

# 7. Pattern 5: Multi-Agent Pattern

Multi-agent là khi nhiều agent chuyên trách phối hợp với nhau.

---

## Khi nào dùng?

Chỉ dùng khi task thật sự phức tạp.

Ví dụ trong Insurance Claims:

```text
Document Agent
Policy Agent
Fraud Agent
Compliance Agent
Report Agent
```

---

## Architecture

```text
Coordinator Agent
 |
 +--> Document Analysis Agent
 |
 +--> Policy Review Agent
 |
 +--> Fraud Detection Agent
 |
 +--> Compliance Agent
 |
 v
Final Report Agent
```

---

## Concrete design

```text
Claim Investigation Coordinator
        |
        +-- Document Agent
        |     Extract facts from claim documents
        |
        +-- Policy Agent
        |     Check policy coverage
        |
        +-- Fraud Agent
        |     Identify fraud signals
        |
        +-- Compliance Agent
        |     Check regulatory concerns
        |
        +-- Report Agent
              Generate final recommendation
```

---

## Implementation skeleton

```python
class MultiAgentClaimWorkflow:
    def __init__(
        self,
        document_agent,
        policy_agent,
        fraud_agent,
        compliance_agent,
        report_agent,
    ):
        self.document_agent = document_agent
        self.policy_agent = policy_agent
        self.fraud_agent = fraud_agent
        self.compliance_agent = compliance_agent
        self.report_agent = report_agent

    async def run(self, claim_id: str):
        document_result = await self.document_agent.analyze(claim_id)
        policy_result = await self.policy_agent.review(claim_id)
        fraud_result = await self.fraud_agent.assess(claim_id)
        compliance_result = await self.compliance_agent.check(claim_id)

        final_report = await self.report_agent.generate({
            "document_analysis": document_result,
            "policy_review": policy_result,
            "fraud_assessment": fraud_result,
            "compliance_check": compliance_result,
        })

        return final_report
```

---

## Architect warning

Không nên dùng multi-agent quá sớm.

Thứ tự nên là:

```text
Simple Prompt
→ RAG
→ Tool Calling
→ Single Agent
→ Multi-Agent
```

Nếu simple workflow giải quyết được thì không cần agent.

---

# 8. Pattern 6: Human-in-the-Loop Pattern

Đây là pattern bắt buộc trong Healthcare, Insurance, Finance.

---

## Khi nào dùng?

Khi AI output ảnh hưởng tới:

```text
Tiền
Sức khỏe
Pháp lý
Khách hàng
Compliance
Business decision
```

---

## Architecture

```text
AI Analysis
 |
 v
Risk / Confidence Check
 |
 +-- Low risk + high confidence --> Auto draft
 |
 +-- High risk / low confidence --> Human Review
 |
 v
Reviewer Decision
 |
 v
Audit Log
```

---

## Implementation

```python
class HumanReviewPolicy:
    def should_require_review(self, ai_result):
        if ai_result["confidence_score"] < 0.75:
            return True

        if ai_result["risk_level"] == "HIGH":
            return True

        if len(ai_result.get("missing_documents", [])) > 0:
            return True

        return False
```

---

## Backend flow

```ts
async handleAIResult(claimId: string, result: ClaimAIResult) {
  await this.aiResultRepository.save(claimId, result);

  const requireReview =
    result.confidenceScore < 0.75 ||
    result.riskLevel === 'HIGH' ||
    result.missingDocuments.length > 0;

  if (requireReview) {
    await this.reviewTaskService.create({
      claimId,
      reason: 'AI_REVIEW_REQUIRED',
      aiRecommendation: result.recommendation,
    });

    await this.claimRepository.updateStatus(
      claimId,
      'WAITING_FOR_REVIEW',
    );
  }
}
```

---

# 9. Pattern 7: Guardrails Pattern

Guardrails giúp kiểm soát AI behavior.

---

## Các loại guardrails

```text
Input guardrails
Output guardrails
Tool guardrails
Policy guardrails
Security guardrails
Cost guardrails
```

---

## Ví dụ guardrails cho Insurance

```text
AI không được approve claim
AI không được reject claim
AI không được tạo thông tin không có trong source
AI phải cite source
AI phải trả JSON đúng schema
AI phải flag uncertainty
AI không được expose PII trái quyền
```

---

## Implementation

```python
class GuardrailService:
    def validate_ai_result(self, result: dict):
        violations = []

        if "approve" in result.get("recommendation", "").lower():
            violations.append("AI_MUST_NOT_APPROVE_CLAIM")

        if "reject" in result.get("recommendation", "").lower():
            violations.append("AI_MUST_NOT_REJECT_CLAIM")

        if result.get("confidence_score", 1) < 0.7:
            violations.append("LOW_CONFIDENCE_REQUIRES_REVIEW")

        return violations
```

---

# 10. Pattern 8: Evaluation Pattern

AI system không thể chỉ test bằng unit test.

Cần evaluation.

---

## Cần đo gì?

```text
Answer correctness
Source faithfulness
JSON schema validity
Extraction accuracy
Hallucination rate
Human correction rate
Cost per task
Latency
```

---

## Evaluation architecture

```text
Test Dataset
 |
 v
Run AI Pipeline
 |
 v
Compare Expected Output
 |
 v
Score
 |
 v
Report
```

---

## Eval dataset example

```json
{
  "claimId": "claim_eval_001",
  "question": "What document is missing?",
  "expectedAnswer": "Police report",
  "expectedSources": ["doc_001_page_3"]
}
```

---

## Implementation

```python
class EvaluationRunner:
    def __init__(self, rag_service):
        self.rag_service = rag_service

    async def run_eval(self, test_cases: list[dict]):
        results = []

        for test_case in test_cases:
            actual = await self.rag_service.answer_claim_question(
                claim_id=test_case["claim_id"],
                tenant_id=test_case["tenant_id"],
                question=test_case["question"]
            )

            score = self.score_answer(
                expected=test_case["expected_answer"],
                actual=actual["answer"]
            )

            results.append({
                "test_case_id": test_case["id"],
                "score": score,
                "actual": actual
            })

        return results

    def score_answer(self, expected: str, actual: str):
        if expected.lower() in actual.lower():
            return 1.0
        return 0.0
```

---

# 11. Architecture tổng hợp cho Module 5

```text
NextJS Frontend
 |
 v
NestJS Backend
 |
 v
Workflow Queue / Temporal
 |
 v
FastAPI AI Orchestrator
 |
 +--> Prompt-only Service
 |
 +--> RAG Service
 |
 +--> Tool Calling Service
 |
 +--> Agent Service
 |
 +--> Guardrail Service
 |
 +--> Evaluation Service
 |
 v
LLM Gateway
 |
 v
OpenAI / Azure OpenAI / Bedrock
 |
 v
PostgreSQL + pgvector
 |
 v
Audit Log + Observability
```

---

# 12. Implementation folder structure

```text
apps/ai-service/
├── patterns/
│   ├── simple_prompt/
│   │   └── summarize_claim.py
│   ├── rag/
│   │   ├── rag_service.py
│   │   └── context_assembler.py
│   ├── tools/
│   │   ├── claim_tools.py
│   │   └── tool_registry.py
│   ├── agents/
│   │   ├── claim_investigation_agent.py
│   │   └── multi_agent_workflow.py
│   ├── guardrails/
│   │   └── guardrail_service.py
│   └── evaluation/
│       └── evaluation_runner.py
├── gateways/
│   └── llm_gateway.py
├── vectorstores/
│   └── pgvector_store.py
└── prompts/
    ├── summarize_claim_v1.txt
    ├── rag_answer_v1.txt
    ├── risk_assessment_v1.txt
    └── investigation_agent_v1.txt
```

---

# 13. API design cho Module 5

## Simple prompt summary

```http
POST /claims/{claimId}/summarize
```

---

## RAG question answering

```http
POST /claims/{claimId}/ask
```

Request:

```json
{
  "question": "What documents are missing?"
}
```

---

## Tool-based calculation

```http
POST /claims/{claimId}/calculate
```

---

## Agent investigation

```http
POST /claims/{claimId}/investigate
```

Response:

```json
{
  "claimId": "claim_001",
  "riskLevel": "MEDIUM",
  "findings": [
    "Policy started 5 days before incident",
    "Police report is missing"
  ],
  "recommendation": "Request additional documents before proceeding",
  "requiresHumanReview": true
}
```

---

# 14. Khi nào chọn pattern nào?

| Requirement                     | Pattern nên dùng  |
| ------------------------------- | ----------------- |
| Tóm tắt text đơn giản           | Simple Prompt     |
| Hỏi đáp trên document nội bộ    | RAG               |
| Cần gọi API/database            | Tool Calling      |
| Task nhiều bước, không cố định  | Agent             |
| Nhiều vai trò phân tích độc lập | Multi-Agent       |
| Quyết định rủi ro cao           | Human-in-the-loop |
| Cần kiểm soát output            | Guardrails        |
| Cần đo chất lượng AI            | Evaluation        |

---

# 15. Common mistake

## Sai lầm 1: Dùng agent cho mọi thứ

Không nên:

```text
User hỏi policy coverage
→ Agent tự lập kế hoạch 10 bước
```

Nên:

```text
User hỏi policy coverage
→ RAG + citation
```

---

## Sai lầm 2: Không có source citation

RAG mà không lưu source thì rất khó audit.

---

## Sai lầm 3: Cho AI quyết định nghiệp vụ

Không nên:

```text
AI approves claim
```

Nên:

```text
AI recommends next action
Human approves
```

---

## Sai lầm 4: Không có evaluation

AI app production mà không có eval thì không biết prompt mới tốt hay tệ hơn.

---

# 16. ADR mẫu cho Module 5

## ADR-008: Use RAG for Policy and Claim Document Question Answering

```text
Status: Accepted

Context:
The Claims Copilot needs to answer questions based on claim documents,
policy documents, and supporting evidence. The information changes
frequently and must be traceable to source documents.

Options:
1. Prompt-only LLM
2. Fine-tuning
3. RAG
4. Agent-based search

Decision:
Use RAG for document-based question answering.

Rationale:
RAG allows the system to retrieve relevant document chunks at runtime
without retraining the model. It supports source citation, easier updates,
and better auditability.

Consequences:
Positive:
- Uses up-to-date internal documents
- Reduces hallucination
- Supports source traceability
- Avoids fine-tuning cost

Negative:
- Requires good chunking and indexing
- Retrieval quality must be monitored
- Bad metadata can cause wrong results
```

---

## ADR-009: Require Human Review for High-Risk AI Recommendations

```text
Status: Accepted

Context:
The Claims Copilot generates risk signals and recommendations for claim
officers. Some recommendations may affect customer outcomes and financial
decisions.

Decision:
AI must not make final approval or rejection decisions. High-risk or
low-confidence outputs must require human review.

Rationale:
Insurance claim decisions have financial, legal, and compliance impact.
AI should assist humans, not replace accountable decision makers.

Consequences:
Positive:
- Reduces business risk
- Improves compliance
- Keeps human accountability
- Supports auditability

Negative:
- Slower processing for high-risk cases
- Requires review workflow
- Adds operational workload
```

---

# 17. Bài thực hành Module 5

## Exercise 1: Implement Simple Prompt

Build:

```text
POST /claims/{claimId}/summarize
```

Goal:

```text
Summarize claim document into structured summary.
```

---

## Exercise 2: Implement RAG QA

Build:

```text
POST /claims/{claimId}/ask
```

Requirement:

```text
Answer based only on claim documents.
Return sources.
```

---

## Exercise 3: Implement Tool Calling

Build tools:

```text
get_claim_details
get_policy_details
calculate_deductible
create_review_task
```

---

## Exercise 4: Implement Claim Investigation Agent

Agent goal:

```text
Investigate claim risk and generate recommendation.
```

Tools:

```text
search_claim_documents
get_policy_details
check_fraud_rules
```

---

## Exercise 5: Implement Human Review Rule

Rule:

```text
If risk HIGH or confidence < 0.75,
create human review task.
```

---

## Exercise 6: Implement Evaluation Dataset

Create:

```text
eval/claim_qa_eval.json
```

Example:

```json
[
  {
    "id": "eval_001",
    "claim_id": "claim_001",
    "tenant_id": "tenant_001",
    "question": "What document is missing?",
    "expected_answer": "Police report"
  }
]
```

---

# 18. Checklist hoàn thành Module 5

Bạn hoàn thành Module 5 khi có:

```text
Simple prompt service
RAG question-answering service
Tool registry
Claim investigation agent
Human review rule
Guardrail service
Evaluation runner
Source citation
ADR-008
ADR-009
Working demo
```

---

# 19. Kết quả cần đạt

Sau Module 5, bạn phải giải thích được:

> Không phải bài toán nào cũng cần agent. Prompt-only phù hợp task đơn giản. RAG phù hợp khi cần dữ liệu nội bộ và source citation. Tool calling phù hợp khi AI cần gọi API. Agent phù hợp task nhiều bước. Multi-agent chỉ nên dùng khi có nhiều vai trò phân tích độc lập. Với Insurance và Healthcare, human-in-the-loop và guardrails là bắt buộc.

Đây là tư duy cốt lõi của **GenAI & LLM Architecture Patterns**.
