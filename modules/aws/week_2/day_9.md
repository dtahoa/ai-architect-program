# DAY 9 — SageMaker Training + Script Mode

## Mental model

```text
Code
+
Training data
+
Container/framework
+
Compute instance
+
Hyperparameters
        ↓
SageMaker Training Job
        ↓
model artifact
        ↓
S3
```

---

## Epoch, Batch, Step

### Epoch

Model nhìn thấy **toàn bộ training dataset một lần**.

```text
10 epochs
= dataset được đi qua 10 lần
```

### Batch size

Số samples xử lý trước mỗi parameter update.

Ví dụ:

```text
dataset = 10,000 samples
batch size = 100

steps / epoch ≈ 100
```

### Step

Một lần optimizer update parameters.

---

# SageMaker Script Mode

Bạn có code PyTorch/TensorFlow/sklearn:

```python
train.py
```

Thay vì tự build toàn bộ ML container:

```text
SageMaker framework container
        +
your train.py
```

Đây là **Script Mode**.

AWS exam guide explicitly includes using SageMaker Script Mode with supported frameworks such as TensorFlow and PyTorch. ([AWS Documentation][2])

---

# Training time

Muốn giảm training time:

```text
Early stopping
Distributed training
GPU
appropriate instance
Managed Spot Training
```

### Distributed training

```text
Huge dataset
→ Data parallelism

Model too large for one device
→ Model parallelism
```

---

# Managed Spot Training

```text
lower cost
BUT
instance can be interrupted
```

Vì vậy nên dùng:

```text
checkpoint
→ S3
```

để resume training.

---

# Exam traps

```text
Need custom TensorFlow code
→ Script Mode

Need completely custom dependencies/runtime
→ custom container

Need reduce cost and interruption acceptable
→ Spot Training

Need resume interrupted training
→ checkpoint
```

---

# DAY 9 — 10 Questions

### Q1

Một epoch nghĩa là gì?

A. One parameter update
B. One complete pass through training dataset
C. One prediction
D. One model deployment

### Q2

Dataset có 20,000 samples và batch size = 200. Khoảng bao nhiêu steps/epoch?

A. 10
B. 100
C. 200
D. 20,000

### Q3

Team có TensorFlow training script riêng và muốn minimal container management.

A. Build EC2 manually
B. SageMaker Script Mode
C. Lambda
D. Glue

### Q4

Training workload có thể tolerate interruption và team ưu tiên giảm cost.

A. Dedicated Hosts
B. Managed Spot Training
C. Lambda
D. Multi-AZ endpoint

### Q5

Điều gì giúp Spot Training resume sau interruption?

A. CloudTrail
B. Checkpointing
C. Clarify
D. Model Registry

### Q6

Dataset rất lớn nhưng model vừa với một GPU. Training nên scale bằng:

A. Data parallelism
B. Model parallelism
C. PCA
D. Shadow testing

### Q7

Model quá lớn để fit trên một accelerator.

A. Data parallelism
B. Model parallelism
C. Batch Transform
D. K-Means

### Q8

Training loss không còn cải thiện sau nhiều epoch. Cách giảm wasted training?

A. Increase epochs
B. Early stopping
C. Increase features
D. Disable metrics

### Q9

Batch size tăng thường làm:

A. xử lý nhiều samples mỗi update hơn
B. automatically prevent overfitting
C. remove need for epochs
D. turn classification into regression

### Q10

SageMaker training output model artifacts thường được lưu ở đâu?

A. Route 53
B. S3
C. CloudFront
D. API Gateway

### Answer

```text
1 B
2 B
3 B
4 B
5 B
6 A
7 B
8 B
9 A
10 B
```