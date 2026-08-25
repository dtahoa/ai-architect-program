Được. Với **Day 5**, cách học nhanh nhất là gom các concept xoay quanh một câu hỏi duy nhất:

> **Sau khi data đã được clean/transform, làm sao biến nó thành feature tốt, quản lý feature nhất quán và đưa vào ML pipeline/SageMaker?**

Mental model 10 phút:

> **Create → Store → Share → Serve → Avoid leakage**

## 1. CREATE — Feature Engineering

Mục tiêu:

> Biến raw data thành tín hiệu mà model học tốt hơn.

Ví dụ raw data:

```text
transaction_time = 2026-08-25 22:30
amount = 1,500,000
customer_age = 35
```

Có thể tạo:

```text
hour = 22
is_night = true
amount_log = log(amount)
age_bucket = 30-40
```

Mental shortcut:

> **Raw columns ≠ necessarily good features**

Feature engineering thường gồm:

```text
Date/time extraction
Aggregation
Binning
Interaction
Scaling
Encoding
Log transformation
```

Ví dụ aggregation:

```text
Raw transactions
      ↓
transactions_last_7_days
avg_amount_last_30_days
max_amount_last_24_hours
```

Trong fraud detection, những feature kiểu này thường có ý nghĩa hơn từng transaction đơn lẻ.

---

# 2. FEATURE ENGINEERING vs FEATURE SELECTION

Hai concept rất dễ lẫn.

### Feature Engineering

> **Tạo feature mới**

```text
price × quantity
      ↓
total_purchase_value
```

### Feature Selection

> **Chọn feature cần giữ**

Ví dụ:

```text
1000 features
     ↓
remove irrelevant/redundant features
     ↓
150 useful features
```

Mental shortcut:

> **Engineering = CREATE**
> **Selection = KEEP**

Exam có thể đưa scenario:

> Training chậm, nhiều feature redundant, overfitting.

→ nghĩ tới **Feature Selection**, không phải tạo thêm feature.

---

# 3. FEATURE STORE — concept quan trọng nhất Day 5

Hãy tưởng tượng team có feature:

```text
customer_total_spend_30d
customer_login_count_7d
fraud_attempt_count_24h
```

Nếu mỗi team tự tính:

```text
Training pipeline → logic A
Batch inference   → logic B
Real-time API     → logic C
```

rất dễ xảy ra:

> **Training-serving skew**

Tức là feature lúc training và inference được tính khác nhau.

Feature Store giải quyết:

```text
                 Feature Store
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      Training              Inference
```

Mental model:

> **Feature Store = central repository for ML features**

Trong AWS:

> **Amazon SageMaker Feature Store**

---

# 4. ONLINE STORE vs OFFLINE STORE

Đây là cặp Day 5 nên thuộc lòng.

## Online Store

Cho:

> **Low-latency, real-time inference**

Ví dụ:

```text
Customer opens banking app
        ↓
Need latest fraud features
        ↓
< milliseconds / low latency >
        ↓
Prediction
```

→ **Online Store**

Mental shortcut:

> **Online = NOW**

---

## Offline Store

Cho:

> Historical features / batch processing / model training

Ví dụ:

```text
2 years customer history
       ↓
Build training dataset
       ↓
Train model
```

→ **Offline Store**

Mental shortcut:

> **Offline = HISTORY**

Quick comparison:

|             | Online Store        | Offline Store       |
| ----------- | ------------------- | ------------------- |
| Purpose     | Real-time inference | Training / batch    |
| Data        | Latest values       | Historical records  |
| Latency     | Low                 | Not primary concern |
| Typical use | API prediction      | Training dataset    |

Nếu đề hỏi:

> Need historical feature values for training.

→ **Offline Store**

Nếu hỏi:

> Need latest customer feature with low latency.

→ **Online Store**

---

# 5. FEATURE GROUP

Trong SageMaker Feature Store, features được tổ chức thành:

> **Feature Group**

Mental model gần giống một table:

```text
CustomerFeatureGroup

customer_id
age
total_spend_30d
transactions_7d
fraud_count_30d
event_time
```

Hai field đặc biệt rất đáng nhớ:

```text
Record Identifier
Event Time
```

Ví dụ:

```text
customer_id = C123
event_time  = 2026-08-25 09:00
```

Mental shortcut:

> **Record ID = WHO / WHAT**
> **Event Time = WHEN**

---

# 6. EVENT TIME — tại sao quan trọng?

Giả sử:

```text
10:00 customer_balance = $100
12:00 customer_balance = $500
15:00 customer_balance = $300
```

Khi training model cho prediction xảy ra lúc **11:00**, bạn không được sử dụng:

```text
12:00 → $500 ❌
15:00 → $300 ❌
```

vì đó là future information.

Bạn chỉ được dùng:

```text
10:00 → $100 ✅
```

Đây dẫn tới một concept cực quan trọng.

---

# 7. POINT-IN-TIME CORRECT JOIN

Tên nghe khó nhưng mental model cực đơn giản:

> **Khi train model ở thời điểm T, chỉ dùng feature tồn tại trước hoặc tại T.**

Ví dụ:

```text
Fraud happened
2026-08-20 10:00
```

Feature history:

```text
09:00 fraud_count = 2 ✅

11:00 fraud_count = 3 ❌
```

Nếu lấy giá trị 11:00 để train prediction lúc 10:00:

> **Future leakage**

Point-in-time join giúp tránh việc đó.

Mental shortcut:

> **Prediction at T → features <= T**

Đây là exam concept cực đáng nhớ.

---

# 8. TRAINING-SERVING SKEW

Ví dụ training:

```python
age / 100
```

Inference:

```python
age / 120
```

Model được train với một distribution nhưng production nhận distribution khác.

→ prediction quality giảm.

Đây gọi là:

> **Training-serving skew**

Feature Store + reusable transformations giúp giảm vấn đề này.

Mental model:

```text
Same feature definition
        ↓
Training = Serving
```

Exam trap:

> Model rất tốt offline nhưng poor production performance.

Một nguyên nhân cần nghĩ đến:

```text
Training-serving skew
Data drift
Feature drift
Leakage
```

Đừng mặc định ngay rằng model algorithm tệ.

---

# 9. BATCH vs REAL-TIME FEATURE

Đây là cách dễ nhất để phân biệt kiến trúc.

## Batch feature

Ví dụ:

```text
Average spending last 30 days
```

Có thể calculate mỗi đêm:

```text
S3
 ↓
Glue / Spark
 ↓
Feature Store
```

## Streaming / real-time feature

Ví dụ:

```text
Number of failed login attempts
in last 5 minutes
```

Cần update liên tục:

```text
Events
 ↓
Kinesis
 ↓
processing
 ↓
Feature Store Online
 ↓
real-time model
```

Mental shortcut:

> **Slow-changing feature → Batch**
> **Fast-changing feature → Streaming**

---

# 10. SAGE MAKER PROCESSING — nhớ vai trò

Một scenario rất hay gặp:

> Run Python/Spark preprocessing job on managed infrastructure before training.

→ **SageMaker Processing**

Mental model:

```text
S3 raw data
    ↓
SageMaker Processing
    ↓
clean / transform / feature engineer
    ↓
S3 processed data
    ↓
SageMaker Training
```

Think:

> **Processing job = managed preprocessing compute**

Không phải:

```text
SageMaker Training
```

Training job để train model.

Processing job để:

```text
preprocessing
postprocessing
evaluation
feature engineering
```

---

# 11. DATA WRANGLER vs PROCESSING vs FEATURE STORE

Đây là bộ ba dễ bị exam trộn.

### Data Wrangler

> Visually prepare data.

```text
Explore
Clean
Transform
Preview
```

Mental shortcut:

> **BUILD transformations visually**

### SageMaker Processing

> Execute processing workload.

```text
Python
Spark
Containers
Large dataset
```

Mental shortcut:

> **RUN transformations**

### Feature Store

> Store/manage/reuse features.

Mental shortcut:

> **KEEP features**

Tóm lại:

```text
Data Wrangler
     ↓
DESIGN / PREPARE

Processing
     ↓
EXECUTE

Feature Store
     ↓
STORE / SERVE
```

---

# Exam trap #1 — Online Store dùng để training

Sai.

```text
Online
→ real-time inference

Offline
→ historical training
```

---

# Exam trap #2 — Feature Store là nơi lưu raw dataset

Không phải mục đích chính.

```text
S3
→ raw / processed datasets

Feature Store
→ ML features
```

Think:

> **S3 = DATA**
> **Feature Store = FEATURES**

---

# Exam trap #3 — dùng latest feature cho historical training

Ví dụ hiện tại:

```text
customer_score = 900
```

Nhưng 6 tháng trước:

```text
customer_score = 500
```

Nếu prediction 6 tháng trước nhưng dùng `900`:

❌ leakage.

Cần:

> **point-in-time historical feature**

---

# Exam trap #4 — calculate feature separately everywhere

```text
Training calculates age differently
Inference calculates age differently
```

→ training-serving skew.

Better:

```text
One consistent feature definition
             ↓
        Feature Store
```

---

# Exam trap #5 — Real-time requirement nhưng dùng batch pipeline

Scenario:

> Fraud decision must happen while credit-card transaction is being processed.

Không nên nghĩ:

```text
nightly Glue ETL
```

Mà nghĩ:

```text
Streaming
+
Online features
+
Real-time endpoint
```

---

# Day 5 trong một sơ đồ

Chỉ cần nhớ flow này:

```text
RAW DATA
   │
   ▼
FEATURE ENGINEERING
   │
   ├── create
   ├── aggregate
   ├── encode
   └── select
   │
   ▼
SageMaker Processing
   │
   ▼
FEATURE STORE
   │
   ├───────────────┐
   ▼               ▼
OFFLINE           ONLINE
   │               │
historical       latest
   │               │
training         inference
   │               │
   └───────┬───────┘
           ▼
       ML MODEL
```

Và nguyên tắc bảo vệ toàn pipeline:

```text
        ⚠ NO LEAKAGE ⚠

Prediction at time T
        ↓
Only use features available
at or before time T
```

# Nếu chỉ có 10 phút học Day 5

Học đúng thứ tự này:

1. **Feature Engineering vs Feature Selection**
2. **SageMaker Feature Store**
3. **Online Store vs Offline Store**
4. **Feature Group**
5. **Record Identifier + Event Time**
6. **Point-in-time correct data**
7. **Training-serving skew**
8. **Batch vs Streaming features**
9. **SageMaker Processing**
10. **Data Wrangler vs Processing vs Feature Store**

Nếu còn **2 phút trước khi vào exam**, chỉ cần thuộc bảng này:

| Nếu đề nói...                         | Nghĩ ngay tới                 |
| ------------------------------------- | ----------------------------- |
| Create better predictors              | **Feature Engineering**       |
| Remove useless features               | **Feature Selection**         |
| Central ML feature repository         | **Feature Store**             |
| Historical training features          | **Offline Store**             |
| Latest low-latency features           | **Online Store**              |
| Identify entity                       | **Record Identifier**         |
| Know when feature occurred            | **Event Time**                |
| Prevent using future information      | **Point-in-time correctness** |
| Training feature ≠ production feature | **Training-serving skew**     |
| Run preprocessing Python/Spark        | **SageMaker Processing**      |
| Visual ML data preparation            | **Data Wrangler**             |
| Raw datasets / data lake              | **S3**                        |

Và câu thần chú Day 5:

> **Engineer → Store → Offline for TRAIN → Online for SERVE → Never use FUTURE features.**

Đây là phần Day 5 mà tôi sẽ ưu tiên nếu mục tiêu là **pass MLA-C01**, thay vì cố nhớ hết mọi option/configuration của SageMaker Feature Store.
