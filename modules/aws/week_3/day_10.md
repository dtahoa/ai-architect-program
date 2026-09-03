---

# DAY 10 — Overfitting, Underfitting & Regularization

Đây là một trong những phần quan trọng nhất của Week 2.

# 1. Overfitting

```text
Training performance = excellent
Validation performance = bad
```

Model đã "memorize" training data.

### Fix

```text
More training data
Data augmentation
Regularization
Dropout
L1 / L2
Simpler model
Feature selection
Early stopping
```

---

# 2. Underfitting

```text
Training = bad
Validation = bad
```

Model chưa đủ khả năng học pattern.

Fix:

```text
More complex model
Better features
Train longer
Reduce excessive regularization
```

---

# Mental model cực quan trọng

```text
Train good
Validation bad
→ OVERFIT

Train bad
Validation bad
→ UNDERFIT
```

---

# Regularization

## L1

Encourages weights toward zero và có thể tạo sparse model.

Mental shortcut:

```text
L1
→ feature selection-ish
→ sparse
```

## L2

Penalizes large weights.

```text
L2
→ smaller weights
→ reduce overfit
```

## Dropout

Randomly disables neurons during NN training.

```text
Neural network overfitting
→ dropout
```

---

# Ensemble

Combine multiple models.

### Bagging

```text
models independently
→ combine result
```

### Boosting

```text
model 2 tries to correct model 1
model 3 tries to correct previous errors
```

XGBoost = boosting.

### Stacking

Predictions of multiple models become input to another model.

---

# Catastrophic forgetting

Fine-tune pretrained model quá mạnh vào new dataset:

```text
model improves new task
BUT
forgets previously learned capability
```

Mitigate bằng conservative fine-tuning, suitable learning rate, mix/replay data depending on approach.

AWS explicitly includes preventing overfitting, underfitting and catastrophic forgetting. ([AWS Documentation][2])

---

# DAY 10 — 10 Questions

### Q1

Training accuracy 99%, validation accuracy 74%.

A. Underfitting
B. Overfitting
C. Data parallelism
D. Convergence achieved perfectly

### Q2

Training accuracy 62%, validation accuracy 60%.

A. Overfitting
B. Likely underfitting
C. Data leakage
D. Shadow testing

### Q3

Best solution cho neural network đang overfit?

A. Add dropout
B. Add more layers indefinitely
C. Remove validation
D. Increase training epochs greatly

### Q4

Regularization nào thường promotes sparse weights?

A. L1
B. L2
C. PCA
D. K-Means

### Q5

L2 primarily:

A. creates clusters
B. penalizes large weights
C. increases classes
D. performs translation

### Q6

Training dừng khi validation metric không cải thiện.

A. Model Registry
B. Early stopping
C. Shadow variant
D. Data parallelism

### Q7

XGBoost thuộc family nào?

A. Bagging
B. Boosting
C. PCA
D. Clustering

### Q8

Multiple base model predictions được đưa vào một meta-model.

A. Stacking
B. PCA
C. Early stopping
D. Dropout

### Q9

Fine-tuned model trở nên tốt ở new task nhưng mất capability cũ.

A. Data drift
B. Catastrophic forgetting
C. Class imbalance
D. Underfitting

### Q10

Model overfits vì có quá nhiều irrelevant features. Một giải pháp?

A. Feature selection
B. More irrelevant features
C. Remove test set
D. Increase model complexity

### Answers

```text
1 B
2 B
3 A
4 A
5 B
6 B
7 B
8 A
9 B
10 A
```