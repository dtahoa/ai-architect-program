---

# DAY 12 — Evaluation Metrics

Đây là phần **exam-heavy nhất Week 2**.

# Classification

Confusion matrix:

```text
                    Predicted
                 Positive Negative

Actual Positive      TP      FN
Actual Negative      FP      TN
```

---

## Accuracy

```text
(TP + TN) / Total
```

Use khi classes tương đối balanced.

### Trap

Dataset:

```text
99% normal
1% fraud
```

Model luôn predict "normal":

```text
accuracy = 99%
```

nhưng model gần như vô dụng.

---

# Precision

> Trong những cái model nói positive, bao nhiêu cái thực sự positive?

```text
Precision = TP / (TP + FP)
```

Quan trọng khi:

> **False Positive expensive**

Ví dụ:

```text
spam detection
```

Không muốn legitimate email bị xem là spam.

---

# Recall

> Trong tất cả actual positives, model tìm được bao nhiêu?

```text
Recall = TP / (TP + FN)
```

Quan trọng khi:

> **False Negative expensive**

Ví dụ:

```text
cancer detection
fraud detection
security attack
```

---

# F1

Balance:

```text
Precision + Recall
```

đặc biệt hữu ích với imbalanced dataset.

---

# ROC-AUC

Đo khả năng phân biệt positive/negative across classification thresholds.

```text
closer to 1
→ generally better discrimination
```

---

# Regression

## MAE

```text
average absolute error
```

Dễ explain.

## RMSE

```text
sqrt(mean(error²))
```

Large errors bị penalize mạnh hơn.

---

# Decision rule

```text
False Positive dangerous
→ Precision

False Negative dangerous
→ Recall

Need balance Precision + Recall
→ F1

Threshold-independent discrimination
→ ROC-AUC

Regression + punish large errors
→ RMSE
```

AWS specifically names confusion matrix, F1, accuracy, precision, recall, RMSE, ROC và AUC in Domain 2. ([AWS Documentation][2])

---

# DAY 12 — 10 Questions

### Q1

Cancer screening system phải minimize missed cancer cases.

A. Precision
B. Recall
C. Accuracy
D. RMSE

### Q2

Email spam filter cần minimize legitimate email incorrectly classified as spam.

A. Recall
B. Precision
C. RMSE
D. MAE

### Q3

Dataset rất imbalanced. Team muốn balance precision và recall.

A. Accuracy
B. F1
C. RMSE
D. MSE

### Q4

Metric nào dành cho regression?

A. Recall
B. Precision
C. RMSE
D. ROC-AUC

### Q5

Company đặc biệt muốn penalize large regression errors.

A. RMSE
B. Accuracy
C. Recall
D. F1

### Q6

Fraud dataset có 0.5% fraud. Model có 99.5% accuracy nhưng không detect fraud nào.

Best conclusion?

A. Excellent model
B. Accuracy misleading because class imbalance
C. Need PCA
D. Need clustering

### Q7

TP=80, FP=20.

Precision = ?

A. 0.2
B. 0.8
C. 1.0
D. 4.0

### Q8

TP=80, FN=20.

Recall = ?

A. 0.8
B. 0.2
C. 4
D. 1.25

### Q9

ROC-AUC gần 1 thường cho biết:

A. poor discrimination
B. strong discrimination
C. high regression error
D. many clusters

### Q10

False negatives có business cost cao.

Metric nào ưu tiên?

A. Recall
B. Precision
C. RMSE
D. MAE

### Answers

```text
1 B
2 B
3 B
4 C
5 A
6 B
7 B
8 A
9 B
10 A
```