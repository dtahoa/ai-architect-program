---

# DAY 13 — Clarify, Debugger, Experiments & Model Registry

Ngày này cần phân biệt các SageMaker services.

# 1. SageMaker Clarify

Mental model:

```text
WHY + BIAS
→ CLARIFY
```

Dùng để:

* detect bias
* explain predictions
* feature attribution
* SHAP-based explanations

Ví dụ:

```text
Loan rejected.

"Why?"
→ SageMaker Clarify
```

---

# 2. SageMaker Debugger

Mental model:

```text
TRAINING BEHAVING STRANGELY
→ DEBUGGER
```

Ví dụ:

```text
loss not decreasing
gradient issue
training convergence problem
```

AWS Domain 2 explicitly lists using SageMaker Model Debugger to debug convergence. ([AWS Documentation][2])

---

# 3. SageMaker Experiments

Mental model:

```text
Which experiment produced this result?
```

Track:

```text
dataset
parameters
hyperparameters
metrics
runs
```

→ reproducibility + comparison.

---

# 4. SageMaker Model Registry

Mental model:

```text
VERSION + APPROVAL + GOVERNANCE
→ MODEL REGISTRY
```

Example:

```text
Model v1
Model v2
Model v3

v3 → PendingManualApproval
v2 → Approved
```

Exam guide explicitly includes Model Registry for model versioning, repeatability and audits. ([AWS Documentation][2])

---

# Clarify vs Debugger vs Registry

| Requirement                   | Use                |
| ----------------------------- | ------------------ |
| Why prediction?               | **Clarify**        |
| Bias?                         | **Clarify**        |
| Training/convergence problem? | **Debugger**       |
| Experiment comparison?        | **Experiments**    |
| Model versions/approval?      | **Model Registry** |

---

# Shadow variant

Scenario:

```text
Production Model A
        +
Candidate Model B

send copy of production traffic to B
BUT
B response not returned to customers
```

= **Shadow testing**

Use để compare candidate vs production safely.

AWS explicitly mentions comparing shadow variant performance with production variant under Task 2.3. ([AWS Documentation][2])

---

# DAY 13 — 10 Questions

### Q1

Bank cần biết features nào khiến một loan application bị rejected.

A. Model Registry
B. SageMaker Clarify
C. Glue
D. Route 53

### Q2

Team muốn detect bias trong training dataset.

A. Clarify
B. Debugger
C. K-Means
D. Batch Transform

### Q3

Training loss unexpectedly stops decreasing và team cần investigate convergence.

A. Clarify
B. Debugger
C. Model Registry
D. Rekognition

### Q4

Team phải maintain model v1/v2/v3 và approval status.

A. Model Registry
B. Debugger
C. PCA
D. Transcribe

### Q5

Data scientist muốn compare multiple ML experiments reproducibly.

A. SageMaker Experiments
B. Route 53
C. CloudFront
D. Translate

### Q6

Candidate model phải receive real production traffic nhưng không ảnh hưởng user responses.

A. Canary deployment
B. Shadow testing
C. Replace production model
D. Batch Transform

### Q7

SageMaker Clarify commonly uses which approach for model explanation?

A. SHAP
B. DNS
C. TLS
D. SQL JOIN

### Q8

Requirement: audit lịch sử model versions.

A. Model Registry
B. Debugger
C. Lambda
D. PCA

### Q9

Requirement: diagnose model convergence.

A. Clarify
B. Debugger
C. Registry
D. Translate

### Q10

Candidate model B được copied traffic nhưng user vẫn nhận prediction từ A.

B là:

A. production variant
B. shadow variant
C. PCA component
D. training channel

### Answers

```text
1 B
2 A
3 B
4 A
5 A
6 B
7 A
8 A
9 B
10 B
```