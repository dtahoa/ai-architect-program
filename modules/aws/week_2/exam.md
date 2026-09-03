---

# FINAL DRILL — ANSWERS

```text
01 B
02 B
03 B
04 B
05 B

06 A
07 A
08 B
09 B
10 B

11 A
12 B
13 B
14 B
15 C

16 B
17 B
18 A
19 B
20 B
```

## Decision rules

| Q  | Rule cần nhớ                                      |
| -- | ------------------------------------------------- |
| 1  | Unlabeled anomaly → **Random Cut Forest**         |
| 2  | Speech → text → **Transcribe**                    |
| 3  | Numeric continuous target → **Regression**        |
| 4  | Train good + validation bad → **overfit**         |
| 5  | Train bad + validation bad → **underfit**         |
| 6  | NN overfit → **Dropout**                          |
| 7  | L1 → **sparsity**                                 |
| 8  | Existing framework script → **Script Mode**       |
| 9  | Spot interruption → **checkpoint**                |
| 10 | Search hyperparameters → **AMT**                  |
| 11 | Trials guide subsequent trials → **Bayesian**     |
| 12 | FN expensive → **Recall**                         |
| 13 | FP expensive → **Precision**                      |
| 14 | Imbalanced classes → don't trust accuracy alone   |
| 15 | Large regression errors costly → **RMSE**         |
| 16 | Bias/explainability → **Clarify**                 |
| 17 | Training/convergence → **Debugger**               |
| 18 | Version/approval/audit → **Model Registry**       |
| 19 | Production traffic without serving B → **Shadow** |
| 20 | Base predictions → meta-model → **Stacking**      |

---

# Week 2 — 1-minute Cheat Sheet

Trước khi kết thúc tuần này, thuộc mental map sau:

```text
MODEL SELECTION
───────────────
number             → regression
category           → classification
groups/no labels   → K-Means
anomaly            → Random Cut Forest
reduce dimensions  → PCA
speech→text        → Transcribe
translation        → Translate
GenAI              → Bedrock


TRAINING
────────
epoch      → full dataset pass
batch      → samples/update
Script Mode→ custom code + AWS framework container
Spot       → cheaper + interruption
checkpoint → resume


MODEL PROBLEM
─────────────
train ↑ validation ↓
→ overfit

train ↓ validation ↓
→ underfit

Overfit fixes:
regularization / dropout / early stop /
more data / feature selection


HPO
───
weights            → parameters
learning rate etc. → hyperparameters
search HP          → SageMaker AMT
learn from trials  → Bayesian optimization


METRICS
───────
FP expensive     → Precision
FN expensive     → Recall
balance P/R      → F1
imbalanced       → avoid accuracy alone
regression       → MAE / RMSE
big error costly → RMSE
classification discrimination → ROC-AUC


SAGEMAKER TOOLS
───────────────
WHY / BIAS
→ Clarify

TRAINING PROBLEM / CONVERGENCE
→ Debugger

EXPERIMENT COMPARISON
→ Experiments

VERSION / APPROVAL / AUDIT
→ Model Registry

REAL TRAFFIC, NO USER IMPACT
→ Shadow variant
```

Nếu đạt **≥16/20 ở Day 14**, Week 3 nên chuyển sang **Domain 3 — Deployment & Orchestration of ML Workflows (22%)**: `real-time endpoint vs serverless vs async vs batch → model deployment → containers → SageMaker Pipelines → EventBridge/Step Functions → CI/CD → blue/green/canary/shadow → IaC`. ([AWS Documentation][4])

[1]: https://docs.aws.amazon.com/pdfs/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01.pdf?utm_source=chatgpt.com "AWS Certified Machine Learning Engineer - Associate - Exam Guide (MLA-C01)"
[2]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain2.html "Content Domain 2: ML Model Development - AWS Certified Machine Learning Engineer - Associate"
[3]: https://docs.aws.amazon.com/sagemaker/latest/dg/automatic-model-tuning.html?utm_source=chatgpt.com "Automatic model tuning with SageMaker AI - Amazon SageMaker AI"
[4]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain3.html?utm_source=chatgpt.com "Content Domain 3: Deployment and Orchestration of ML Workflows - AWS Certified Machine Learning Engineer - Associate"