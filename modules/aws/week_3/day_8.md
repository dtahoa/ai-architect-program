Chuyển sang **WEEK 2 — Model Development & SageMaker Training**, tiếp tục đúng mental model của Week 1.

Theo exam guide hiện tại, **Domain 2 — ML Model Development chiếm 26% scored content**, gồm 3 nhóm chính: **Choose a modeling approach → Train and refine models → Analyze model performance**. AWS cũng liệt kê trực tiếp các nội dung như built-in algorithms, Script Mode, regularization, hyperparameter tuning, ensemble, Model Registry, evaluation metrics, SageMaker Clarify và Debugger. ([AWS Documentation][1])

# WEEK 2 — ML Model Development

## Mục tiêu cuối tuần

Sau Week 2, khi gặp một scenario, bạn phải suy luận được:

```text
Business problem
      ↓
Regression / Classification / Clustering / GenAI?
      ↓
Algorithm / Managed AI service?
      ↓
Train bằng SageMaker thế nào?
      ↓
Model đang overfit / underfit?
      ↓
Tune hyperparameters thế nào?
      ↓
Dùng metric nào?
      ↓
Model nào tốt hơn?
      ↓
Explain / debug / version model thế nào?
```

### Lịch 7 ngày

| Day               | 10-minute focus                                | Exam focus     |
| ----------------- | ---------------------------------------------- | -------------- |
| **Day 8 / W2D1**  | Chọn model & algorithm                         | Task 2.1       |
| **Day 9 / W2D2**  | SageMaker Training + Script Mode               | Task 2.2       |
| **Day 10 / W2D3** | Overfitting, regularization, ensemble          | Task 2.2       |
| **Day 11 / W2D4** | Hyperparameter tuning + AMT                    | Task 2.2       |
| **Day 12 / W2D5** | Evaluation metrics                             | Task 2.3       |
| **Day 13 / W2D6** | Clarify, Debugger, Experiments, Model Registry | Task 2.2 + 2.3 |
| **Day 14 / W2D7** | **Week 2 Final Drill — 20 questions**          | Full Domain 2  |

---

# DAY 8 — Choosing the Right ML Model

## 1. Mental model

Đầu tiên đừng hỏi:

> "AWS service nào?"

Hãy hỏi:

> **"Output tôi cần predict là gì?"**

```text
Predict NUMBER
→ Regression

Predict CATEGORY
→ Classification

Không có label, muốn tìm GROUP
→ Clustering

Reduce number of features
→ PCA / dimensionality reduction

Detect unusual/outlier data
→ Anomaly detection

Text/Image/Speech problem phổ biến
→ xem managed AI service trước

Generative AI
→ Bedrock / foundation model
```

AWS yêu cầu candidate có khả năng lựa chọn algorithm/model dựa trên business problem, interpretability, cost và available data. ([AWS Documentation][2])

---

## 2. Algorithms quan trọng

| Problem                           | Algorithm/service thường nghĩ tới |
| --------------------------------- | --------------------------------- |
| Tabular classification/regression | **XGBoost**                       |
| Linear classification/regression  | **Linear Learner**                |
| Clustering                        | **K-Means**                       |
| Dimensionality reduction          | **PCA**                           |
| Anomaly detection                 | **Random Cut Forest**             |
| Text embedding/classification     | **BlazingText**                   |
| Foundation model                  | **Bedrock / JumpStart**           |

### Exam favorite

```text
Predict house price
→ Regression

Customer churn yes/no
→ Binary classification

Product category A/B/C/D
→ Multiclass classification

Customer segmentation without labels
→ Clustering

Fraud/outlier without labeled fraud examples
→ Anomaly detection
```

---

# 3. Managed AI service vs custom model

Nếu requirement là commodity AI:

```text
Speech → text
→ Amazon Transcribe

Language translation
→ Amazon Translate

Image/object/face analysis
→ Amazon Rekognition

Foundation model / GenAI
→ Amazon Bedrock
```

AWS exam thường ưu tiên:

> **Managed service nếu nó đáp ứng requirement với ít operational effort hơn.**

---

# 4. Interpretability

Nếu:

* banking
* healthcare
* regulatory decision
* stakeholder cần hiểu "why"

thì interpretability trở nên quan trọng.

Một model đơn giản đôi khi tốt hơn model phức tạp nếu performance chênh không đáng kể.

---

# 5. Exam traps

### Trap 1

Có label → dùng clustering.

❌ Sai.

Clustering thường là **unsupervised**.

### Trap 2

Speech-to-text → build custom neural network.

❌ Nếu requirement tiêu chuẩn → **Transcribe**.

### Trap 3

PCA dùng để classification.

❌ PCA chủ yếu:

```text
high-dimensional data
→ fewer dimensions
```

### Trap 4

Random Cut Forest = forecasting.

❌ Chủ yếu dùng cho **anomaly detection**.

---

# DAY 8 — 10 Exam Questions

### Q1

Một retailer có historical data gồm `customer_age, orders, spending` nhưng không có label và muốn chia khách hàng thành các nhóm hành vi.

A. Linear Learner
B. K-Means
C. PCA
D. XGBoost

### Q2

Company muốn dự đoán giá bán của căn nhà.

A. Regression
B. Classification
C. Clustering
D. Anomaly detection

### Q3

Company muốn phát hiện transaction bất thường mà gần như không có labeled fraud examples.

A. K-Means
B. Linear Learner regression
C. Random Cut Forest
D. PCA

### Q4

Dataset có hàng nghìn correlated numerical features. Team muốn giảm số dimensions.

A. PCA
B. XGBoost
C. K-Means
D. Rekognition

### Q5

Ứng dụng cần chuyển audio cuộc gọi thành text với minimal development effort.

A. SageMaker custom CNN
B. Amazon Translate
C. Amazon Transcribe
D. Rekognition

### Q6

Predict xem customer sẽ churn hay không.

A. Regression
B. Binary classification
C. Clustering
D. PCA

### Q7

Một application cần dịch English → Japanese.

A. Transcribe
B. Translate
C. Rekognition
D. SageMaker PCA

### Q8

Model được sử dụng để approve loan và regulator yêu cầu giải thích prediction.

Yếu tố nào quan trọng nhất khi chọn model?

A. Model size
B. Interpretability
C. Epoch count
D. Batch size

### Q9

Team cần giải pháp GenAI dựa trên foundation model mà không muốn tự quản lý infrastructure.

A. K-Means
B. SageMaker PCA
C. Amazon Bedrock
D. Random Cut Forest

### Q10

Company cần tabular classification và muốn strong general-purpose algorithm cho nonlinear relationships.

A. PCA
B. XGBoost
C. K-Means
D. Translate

### Answers

```text
1 B   K-Means = clustering
2 A   Numeric continuous target = regression
3 C   RCF = anomaly detection
4 A   PCA = dimensionality reduction
5 C   Transcribe = speech → text
6 B   yes/no = binary classification
7 B   Translate
8 B   regulated decision → interpretability
9 C   Bedrock
10 B  XGBoost
```

**Target: ≥8/10**

---

