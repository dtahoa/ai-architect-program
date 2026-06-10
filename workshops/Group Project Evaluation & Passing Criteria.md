Bạn nên cập nhật phần **Group Project Evaluation & Passing Criteria** vào Workshop 2 để học viên hiểu rõ điều kiện đậu, không chỉ tổng điểm.

---

# Group Project Evaluation & Passing Criteria

## Evaluation Rubric

| Criteria                                 | Weight |
| ---------------------------------------- | -----: |
| Business Understanding & Problem Framing |    10% |
| Architecture Quality & Design Decisions  |    20% |
| Data Architecture & AI Pipeline          |    15% |
| GenAI Pattern Selection & Justification  |    10% |
| Security, Privacy & Governance           |    15% |
| Scalability, Performance & FinOps        |    10% |
| LLMOps, Monitoring & Evaluation          |    10% |
| Implementation & Demo                    |    10% |

---

## Scoring Scale

| Score | Meaning           |
| ----- | ----------------- |
| 5.0   | Outstanding       |
| 4.5   | Excellent         |
| 4.0   | Very Good         |
| 3.5   | Good              |
| 3.0   | Satisfactory      |
| 2.5   | Needs Improvement |
| 2.0   | Poor              |
| 1.0   | Unacceptable      |

---

# Pass / Fail Criteria

A group will be considered **PASS** only when **both conditions below are satisfied**:

### Condition 1 — Weighted Final Score

The overall weighted final score must be:

```text
Weighted Final Score >= 3.5
```

Formula:

```text
Weighted Final Score
=
Σ (Criterion Score × Criterion Weight)
```

Example:

| Criteria                | Score | Weight | Weighted |
| ----------------------- | ----: | -----: | -------: |
| Business Understanding  |   4.0 |    10% |     0.40 |
| Architecture Quality    |   4.0 |    20% |     0.80 |
| Data Architecture       |   3.5 |    15% |    0.525 |
| GenAI Pattern Selection |   3.5 |    10% |     0.35 |
| Security & Governance   |   4.0 |    15% |     0.60 |
| Scalability & FinOps    |   3.5 |    10% |     0.35 |
| LLMOps & Monitoring     |   3.5 |    10% |     0.35 |
| Implementation & Demo   |   4.0 |    10% |     0.40 |

Final:

```text
Weighted Final Score = 3.775
```

Condition 1:

```text
PASS
```

---

### Condition 2 — Minimum Score Per Criterion

The average score of **every criterion** must be:

```text
Average Score >= 3.0
```

This rule prevents a team from compensating for a major weakness in one critical area by scoring very highly elsewhere.

Example:

| Criteria              | Score |
| --------------------- | ----: |
| Architecture Quality  |   4.5 |
| Security & Governance |   2.5 |

Result:

```text
Weighted Final = 3.8
```

But:

```text
Security & Governance = 2.5 < 3.0
```

Therefore:

```text
FAIL
```

---

# Mandatory Architecture Areas

To achieve a passing score, the capstone must demonstrate competence in all of the following areas:

```text
✓ Business Problem Definition
✓ AI Use Case Identification
✓ Architecture Design
✓ Data Architecture
✓ GenAI Architecture Pattern
✓ Security & Governance
✓ Scalability & FinOps
✓ LLMOps & Monitoring
✓ Technical Implementation
✓ Stakeholder Communication
```

A project missing any of these areas will typically receive a score below 3.0 in the corresponding criterion.

---

# Common Reasons for Failing

## Architecture-focused but no implementation

```text
Beautiful diagrams
No working prototype
No API design
No technical validation
```

Impact:

```text
Implementation & Demo < 3.0
```

---

## Working demo but weak architecture reasoning

```text
System works
No ADRs
No trade-off analysis
No NFRs
```

Impact:

```text
Architecture Quality < 3.0
```

---

## No security and governance design

```text
No tenant isolation
No audit logging
No human review
No guardrails
```

Impact:

```text
Security & Governance < 3.0
```

---

## No FinOps or LLMOps

```text
No cost estimation
No monitoring
No evaluation framework
No prompt versioning
```

Impact:

```text
Scalability & FinOps < 3.0
LLMOps & Monitoring < 3.0
```

---

# Recommended Target Score

To be competitive and demonstrate AI Architect readiness:

| Level       | Weighted Final |
| ----------- | -------------: |
| Pass        |          ≥ 3.5 |
| Strong Pass |          ≥ 4.0 |
| Distinction |          ≥ 4.5 |

Recommended target:

```text
Weighted Final ≥ 4.0
AND
All Criteria ≥ 3.5
```

This indicates the team has delivered a balanced architecture across business, technical, security, operational, and governance dimensions—exactly what is expected from an AI Technical Architect rather than an AI Engineer.
