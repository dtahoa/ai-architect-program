
---

# DAY 11 — Hyperparameter Tuning + SageMaker AMT

## Parameter vs Hyperparameter

### Model parameters

Model **learns** chúng:

```text
weights
biases
tree splits
```

### Hyperparameters

Bạn configure:

```text
learning_rate
batch_size
max_depth
number_of_trees
```

---

# Hyperparameter Optimization

Goal:

```text
Find hyperparameter combination
        ↓
maximize/minimize objective metric
```

Ví dụ:

```text
XGBoost

max_depth: 3–10
eta: 0.01–0.3
num_round: 100–1000

objective:
maximize validation:AUC
```

SageMaker **Automatic Model Tuning — AMT** chạy nhiều training jobs và tìm configuration tốt nhất theo objective metric. ([AWS Documentation][3])

---

# Random Search

```text
randomly sample combinations
```

Useful khi search space lớn.

---

# Bayesian Optimization

Dùng kết quả previous jobs để chọn promising configuration tiếp theo.

Mental model:

```text
Random
→ explore blindly

Bayesian
→ learn from previous trials
```

---

# Critical exam concept

Nếu tăng:

```text
Max parallel training jobs
```

→ nhanh hơn

BUT Bayesian optimization có ít information từ previous completed jobs hơn để guide next jobs.

Đây là kiểu tradeoff AWS rất thích hỏi.

---

# Exam trap

HPO ≠ training model parameters.

```text
Training
→ learns weights

AMT
→ searches hyperparameters
```

---

# DAY 11 — 10 Questions

### Q1

Đâu là hyperparameter của XGBoost?

A. learned tree split
B. max_depth
C. prediction output
D. feature value

### Q2

Goal của SageMaker AMT?

A. Store raw data
B. Find optimal hyperparameters
C. Deploy endpoint
D. Encrypt data

### Q3

Team muốn maximize ROC-AUC. Trong AMT, ROC-AUC đóng vai trò:

A. input channel
B. objective metric
C. checkpoint
D. IAM policy

### Q4

Search method nào uses information from previous trials?

A. Random search
B. Bayesian optimization
C. PCA
D. K-Means

### Q5

Random search:

A. only tests one configuration
B. samples configurations from search space
C. learns model weights
D. automatically deploys endpoint

### Q6

Team tăng number of parallel HPO jobs. Primary benefit?

A. Lower dimensionality
B. Faster overall tuning
C. Better explainability guaranteed
D. Prevent overfitting guaranteed

### Q7

Learning rate quá lớn có thể gây:

A. unstable/non-convergent training
B. automatic better model
C. fewer classes
D. improved explainability

### Q8

Hyperparameter nào directly controls tree complexity?

A. max_depth
B. object label
C. prediction
D. ground truth

### Q9

Weights của neural network là:

A. hyperparameters only
B. learned model parameters
C. objective metrics
D. metadata

### Q10

Cần automatically search learning rate và batch size.

A. Clarify
B. AMT
C. Model Registry
D. Rekognition

### Answers

```text
1 B
2 B
3 B
4 B
5 B
6 B
7 A
8 A
9 B
10 B
```