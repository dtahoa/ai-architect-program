---

# DAY 14 — WEEK 2 FINAL DRILL

## Target

**20 câu Medium → Hard**

```text
≥ 16/20 → PASS Week 2
14–15     → review weak areas
≤ 13      → repeat Day 10–13
```

Không nhìn đáp án trước.

---

## Q1 — Algorithm selection

Một company có transaction records nhưng fraud labels rất ít. Team muốn tìm unusual transaction patterns.

A. PCA
B. Random Cut Forest
C. Linear regression
D. Translate

---

## Q2 — Managed AI

Một application cần automatically transcribe thousands of customer-support calls. Company muốn lowest operational overhead.

A. Build PyTorch speech model
B. Amazon Transcribe
C. SageMaker PCA
D. Rekognition

---

## Q3 — Problem type

Predict quantity của một product sẽ bán được vào ngày mai.

A. Classification
B. Regression
C. Clustering
D. PCA

---

## Q4 — Training

Training accuracy = 98%.

Validation accuracy = 72%.

Best action?

A. Increase model complexity
B. Apply regularization
C. Remove validation data
D. Train indefinitely

---

## Q5 — Underfitting

Training accuracy 65%, validation accuracy 64%.

Best diagnosis?

A. Severe overfit
B. Likely underfit
C. Data leakage proven
D. Perfect fit

---

## Q6 — Regularization

Neural network overfits badly.

Which option is MOST appropriate?

A. Dropout
B. More layers
C. More epochs indefinitely
D. Remove test dataset

---

## Q7 — L1

Primary characteristic of L1 regularization?

A. Encourages sparse weights
B. Creates additional classes
C. Performs clustering
D. Deploys models

---

## Q8 — Script Mode

Team has an existing PyTorch `train.py` and wants to run it with SageMaker-managed PyTorch infrastructure.

A. Glue ETL
B. SageMaker Script Mode
C. Rekognition
D. Batch Transform

---

## Q9 — Spot training

A training job uses Spot capacity and may be interrupted. Team wants to resume instead of restarting.

A. Model Registry
B. Checkpointing
C. Clarify
D. PCA

---

## Q10 — HPO

Team wants SageMaker to automatically find optimal `max_depth`, `eta`, and `min_child_weight`.

A. SageMaker Clarify
B. SageMaker AMT
C. SageMaker Model Registry
D. SageMaker Batch Transform

---

## Q11 — Bayesian optimization

Team selects Bayesian optimization rather than random search.

Primary advantage?

A. Previous tuning results can guide later trials
B. It guarantees zero overfitting
C. It removes need for validation data
D. It automatically deploys model

---

## Q12 — Precision vs Recall

Security system detects malicious requests. Missing an attack is far more costly than generating an extra alert.

Which metric should be prioritized?

A. Precision
B. Recall
C. RMSE
D. MAE

---

## Q13 — Precision

Spam filter must avoid placing legitimate business email into spam.

A. Recall
B. Precision
C. RMSE
D. R² only

---

## Q14 — Imbalanced classification

Fraud rate is 0.1%. A model achieves 99.9% accuracy by predicting every transaction as non-fraud.

What should team do?

A. Conclude model is excellent
B. Evaluate precision/recall/F1 instead
C. Increase accuracy to 100%
D. Convert to regression

---

## Q15 — Regression

Team predicts hospital waiting time and wants large prediction errors penalized more heavily.

A. F1
B. Precision
C. RMSE
D. Recall

---

## Q16 — Explainability

Regulator requires company to explain which features contributed to individual model predictions.

A. SageMaker Debugger
B. SageMaker Clarify
C. Model Registry
D. K-Means

---

## Q17 — Training diagnosis

During neural-network training, loss oscillates and fails to converge.

Which service is MOST directly relevant for analyzing training behavior?

A. SageMaker Clarify
B. SageMaker Debugger
C. Model Registry
D. Translate

---

## Q18 — Governance

Company requires every model version to have status:

```text
Pending
Approved
Rejected
```

and needs audit history.

A. SageMaker Model Registry
B. Clarify
C. PCA
D. Kinesis

---

## Q19 — Production comparison

Team wants Model B to see production traffic and collect predictions for comparison, but customers must continue receiving Model A's predictions.

A. Blue/green replacement
B. Shadow variant
C. Offline PCA
D. Clustering

---

## Q20 — Ensemble

Team trains several different models and then trains another model using their predictions as features.

Which technique?

A. Bagging
B. Stacking
C. PCA
D. Dropout