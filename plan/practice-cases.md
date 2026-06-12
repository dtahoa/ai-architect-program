AI Talent Screening Copilot là một use case RAG đơn giản hơn Insurance Policy Copilot rất nhiều.

---

# CV Matching Copilot

Thay vì:

```text
Insurance Policy PDF
+
Question
```

Bạn sẽ có:

```text
CV
+
Job Description (JD)
+
Question
```

Ví dụ:

```text
CV:
Nguyen Van A

15 years experience
NodeJS
Java
Python
AWS
Azure
React
AI Architecture
...

Question:
Is this candidate suitable for AI Engineer role?
```

---

# Đây có phải RAG không?

## Case 1: Chỉ 1 CV

Nếu chỉ upload:

```text
1 CV
```

và hỏi:

```text
Is this candidate suitable for AI Engineer?
```

thì:

```text
KHÔNG cần RAG
```

Flow:

```text
CV PDF
↓
Extract Text
↓
Build Prompt
↓
LLM
```

---

Architecture:

```text
Upload CV
 |
PDF Parser
 |
Text Extraction
 |
Prompt Builder
 |
GPT
 |
Evaluation
```

---

# Case 2: CV + JD

Ví dụ:

```text
CV.pdf

JD.pdf
```

Question:

```text
How well does this candidate fit this job?
```

Flow:

```text
CV
+
JD
↓
Prompt
↓
LLM
```

Vẫn:

```text
Không cần RAG
```

vì dữ liệu rất nhỏ.

---

Prompt:

```text
You are a senior AI hiring manager.

Candidate CV:

{cv_content}

Job Description:

{jd_content}

Evaluate:

1. Technical fit
2. AI skills
3. Missing skills
4. Overall score (1-10)
5. Recommendation
```

---

# Case 3: Hàng ngàn CV

Lúc này mới cần RAG.

Ví dụ:

```text
5000 CVs
```

Question:

```text
Find the best AI Engineer candidates.
```

---

Architecture:

```text
CVs
 |
Chunking
 |
Embedding
 |
pgvector
 |
Semantic Search
 |
Top Candidates
 |
LLM Ranking
```

Đây là:

```text
RAG + Candidate Search
```

---

# Case 4: AI Recruiter Copilot

Đây là bài capstone rất hay cho AI Architect.

Architecture:

```text
JD Upload
 |
JD Analyzer
 |
Skill Extractor
 |
Embedding
 |
Candidate Search
 |
RAG
 |
LLM Evaluation
 |
Candidate Ranking
 |
Hiring Recommendation
```

---

# Với CV của bạn

Nếu dùng CV bạn đã mô tả:

```text
15 years experience
10 years Tech Lead
NodeJS
NestJS
Java
Python
React
NextJS
Angular
AWS
Azure
Healthcare
Insurance
Ecommerce
```

Question:

```text
Is this candidate suitable for AI Engineer?
```

LLM sẽ đánh giá theo tiêu chí:

```text
Programming
Cloud
Data
ML/AI
LLMOps
Architecture
Leadership
```

---

# Thực tế đây là bài học rất tốt để hiểu AI Architecture

## Version 1

```text
Upload CV
↓
Ask Question
↓
GPT
```

Bạn học:

```text
Prompt Engineering
PDF Parsing
Structured Output
```

---

## Version 2

```text
Upload CV
Upload JD
↓
AI Matching
```

Bạn học:

```text
Document Processing
Evaluation
Scoring
```

---

## Version 3

```text
1000 CVs
100 JDs
```

Bạn học:

```text
Embedding
pgvector
RAG
Semantic Search
Ranking
```

---

## Version 4

```text
Enterprise AI Recruiter Copilot
```

Bạn học:

```text
RAG
Agent
Workflow
LLMOps
Governance
FinOps
Human Review
```

---

Nếu mục tiêu của bạn là **thực hành toàn bộ Module 4 → Module 9**, mình còn khuyến nghị đổi capstone từ **Insurance Policy Copilot** sang:

```text
AI Talent Screening Copilot
```

vì:

```text
✓ Dữ liệu CV dễ kiếm
✓ Có thể tự tạo JD
✓ Dễ demo
✓ Có RAG
✓ Có Embedding
✓ Có Evaluation
✓ Có AI Scoring
✓ Có Human Review
✓ Có LLMOps
✓ Có Security (PII)
✓ Phù hợp AI Architect learning
```

và sát với kinh nghiệm Tech Lead/Engineering Manager của bạn hơn nhiều so với Insurance domain.
