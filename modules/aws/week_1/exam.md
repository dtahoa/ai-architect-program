Được. Hôm nay mình sẽ làm đúng kiểu **exam drill**, không đưa đáp án trước để tránh làm giảm giá trị self-test.

Bộ này gồm **20 câu Medium → Hard**, phủ gần như toàn bộ Week 1:

```text
Storage
Data Formats
Batch / Streaming
Glue / Spark / Flink
Data Wrangler / DataBrew
Feature Engineering
Feature Store
Data Quality
Clarify / Bias
Leakage / Class Imbalance
```

🎯 **Pass condition: ≥16/20 (80%)**

Sau khi bạn gửi đáp án, mình sẽ:

* chấm từng câu;
* giải thích câu sai;
* tạo **Wrong Answer Log**;
* với **mỗi câu sai ghi đúng 1 decision rule ngắn**;
* xác định weakness theo topic;
* nếu ≥16/20 → chuyển sang **Week 2 — Model Development & SageMaker Training**.

# Day 7 — Week 1 Exam Drill

## Question 1 — Storage

Một công ty có **60 TB ảnh y tế** dùng để train nhiều model khác nhau. Dataset cần durable, cost-effective, được nhiều AWS analytics/ML services truy cập, nhưng không cần POSIX filesystem.

Giải pháp phù hợp nhất là?

A. Amazon EBS
B. Amazon EFS
C. Amazon S3
D. Amazon RDS

---

## Question 2 — S3 vs FSx for Lustre

Dataset 40 TB đang lưu lâu dài trong S3. Một distributed GPU training job có hàng trăm workers và thường xuyên bị bottleneck vì tốc độ đọc dữ liệu.

Công ty muốn **giữ S3 làm long-term storage**.

Giải pháp tốt nhất?

A. Move toàn bộ dataset từ S3 sang DynamoDB
B. Attach một EBS volume duy nhất cho toàn bộ GPU nodes
C. Use Amazon FSx for Lustre integrated with S3
D. Move training dataset sang RDS

---

## Question 3 — EBS vs EFS

Một ứng dụng processing chạy trên **một EC2 instance** và cần:

```text
very high random read/write IOPS
block-device semantics
```

Nên dùng:

A. S3
B. EBS
C. EFS
D. FSx for Lustre

---

## Question 4 — Data Format

Một data lake chứa 25 TB customer events với 150 columns. Data scientists thường chỉ query khoảng 8–10 columns, và công ty muốn giảm lượng data scanned cũng như storage cost.

Format phù hợp nhất?

A. CSV
B. JSON
C. Parquet
D. Plain text

---

## Question 5 — JSON vs Parquet

Một API nhận payload như sau:

```json
{
  "customerId": "C101",
  "device": {
    "type": "mobile",
    "os": "Android"
  },
  "items": [
    {"id": "A1", "price": 100},
    {"id": "A2", "price": 200}
  ]
}
```

Format tự nhiên nhất để application gửi raw event là:

A. CSV
B. JSON
C. ORC
D. RecordIO

---

## Question 6 — Avro vs Parquet

Một hệ thống streaming cần serialize hàng triệu records với schema rõ ràng và schema có thể thay đổi theo thời gian. Mục tiêu chính là **record serialization**, không phải analytical column scans.

Format nào phù hợp hơn?

A. Parquet
B. Avro
C. CSV
D. ORC

---

## Question 7 — Batch vs Streaming

Một retailer xử lý:

```text
300 million transactions
once every night at 1 AM
```

để tạo training dataset cho demand forecasting.

Pattern phù hợp?

A. Streaming
B. Batch
C. Real-time inference
D. Online Feature Store

---

## Question 8 — Kinesis vs Flink

Fraud system đã ingest transactions bằng Kinesis. Requirement mới:

> Tính tổng amount của từng account trong rolling 5-minute window liên tục.

Component phù hợp nhất cho phần này?

A. Kinesis Data Streams alone
B. AWS Glue Crawler
C. Apache Flink
D. Amazon EBS

---

## Question 9 — Kinesis vs Firehose

Application logs được sinh liên tục. Requirement duy nhất là:

> Deliver logs vào S3 với **minimal operational effort**.

Không cần nhiều custom consumers hoặc complex stream processing.

Nên chọn:

A. Kinesis Data Streams + custom consumer
B. Amazon Data Firehose
C. Apache Spark cluster
D. Amazon RDS

---

# Question 10 — Glue vs Data Wrangler

Một ML engineer có 4 GB sample data và muốn:

```text
visually inspect distributions
handle missing values
encode categories
create features
prepare data for SageMaker training
```

Giải pháp phù hợp nhất?

A. AWS Glue
B. SageMaker Data Wrangler
C. AWS Glue Data Quality
D. CloudTrail

---

# Question 11 — DataBrew vs Data Wrangler

Một business analyst không xây ML model. Họ muốn clean monthly CSV files bằng:

```text
visual UI
no code
reusable recipes
```

Nên dùng:

A. Data Wrangler
B. Glue DataBrew
C. SageMaker Feature Store
D. SageMaker Clarify

---

# Question 12 — Glue at scale

Mỗi đêm công ty phải:

```text
RDS customers
+
S3 transactions
+
another database
```

sau đó join, clean, transform khoảng **35 TB**, xuất Parquet về S3.

Requirement:

> serverless + automated + minimal infrastructure management

Nên dùng:

A. AWS Glue
B. Data Wrangler interactive flow manually
C. Amazon EFS
D. SageMaker Clarify

---

# Question 13 — Missing Values

Income distribution:

```text
28,000
30,000
31,000
32,000
33,000
900,000
NULL
```

Một vài missing income values cần imputation.

Cách hợp lý nhất trong số các đáp án?

A. Mean
B. Median
C. Maximum
D. Always replace with zero

---

# Question 14 — Encoding

Feature:

```text
browser
-------
Chrome
Firefox
Safari
Edge
```

Không có natural order.

Transformation phù hợp nhất?

A. Ordinal encoding: Chrome=1, Firefox=2...
B. One-hot encoding
C. Standardization
D. Log transformation

---

# Question 15 — Target Leakage

Mục tiêu:

> Predict customer churn **30 days before cancellation**.

Features candidate:

```text
A. avg_spend_last_30_days
B. login_count_last_7_days
C. account_age_days
D. final_cancellation_reason
```

Feature nào **phải đặc biệt loại khỏi model**?

A. A
B. B
C. C
D. D

---

# Question 16 — Time Series Leakage

Bạn muốn dự đoán sales tháng tiếp theo từ dữ liệu 2023–2026.

Cách split nào phù hợp nhất?

A. Randomly shuffle all rows rồi chia train/test
B. Train trên 2023–2025, test trên later 2026 data
C. Train trên 2026 và test trên 2023
D. Dùng test set trong mỗi vòng hyperparameter tuning

---

# Question 17 — Feature Store

Một công ty đã tạo:

```text
customer_avg_spend_30d
login_count_1h
fraud_count_90d
```

Requirements:

1. Train model bằng historical feature values.
2. Real-time fraud API phải lấy latest values với low latency.
3. Muốn giảm training-serving skew.

Nên thiết kế thế nào?

A. Online Feature Store only
B. Offline Feature Store only
C. Feature Store với cả Online và Offline stores
D. Data Wrangler only

---

# Question 18 — Glue Data Quality

ETL pipeline phải enforce:

```text
customer_id must not be NULL
customer_id must be unique
age must be between 18 and 100
```

Và chạy rules tự động mỗi lần pipeline chạy.

AWS capability phù hợp nhất?

A. SageMaker Clarify
B. AWS Glue Data Quality
C. SageMaker Feature Store
D. Amazon Kinesis

---

# Question 19 — Clarify CI vs DPL

Training dataset có:

```text
Facet A: 50,000 samples
Facet B: 50,000 samples
```

Nhưng:

```text
Facet A positive labels = 85%
Facet B positive labels = 30%
```

Metric pre-training nào trực tiếp phản ánh vấn đề được mô tả?

A. Class Imbalance (CI)
B. Difference in Proportions of Labels (DPL)
C. RMSE
D. Endpoint latency

---

# Question 20 — HARD — Multiple Response

**Select THREE.**

Một công ty đang xây loan-default model.

Dataset có các vấn đề:

```text
1. 97% non-default, 3% default
2. annual_salary và monthly_salary gần như encode cùng information
3. debt_collection_started chỉ xuất hiện sau khi customer đã default
4. ML engineer muốn kiểm tra pre-training bias giữa demographic facets
```

Ba actions/capabilities nào phù hợp nhất?

A. Investigate class imbalance and use a suitable mitigation strategy
B. Investigate/remove redundant correlated features
C. Keep `debt_collection_started` because it increases accuracy
D. Remove `debt_collection_started` because of target leakage
E. Use SageMaker Clarify for pre-training bias analysis

**Lưu ý:** câu này yêu cầu **THREE** đáp án.

---

# Answer Sheet

Hãy trả lời theo format này để mình chấm nhanh:

```text
1C
2C
3B
4?
5?
6?
7?
8?
9?
10?
11?
12?
13?
14?
15?
16?
17?
18?
19?
20: A + ? + ?
```

Không cần giải thích reasoning ở vòng đầu. Mình muốn dùng đáp án của bạn để tìm đúng gap thật sự.

# Score interpretation

|     Score | Đánh giá                       |
| --------: | ------------------------------ |
|      0–11 | 🚨 Cần review Week 1 khá nhiều |
|     12–15 | ⚠️ Gần đạt, còn một số gap     |
| **16–17** | ✅ Week 1 đạt yêu cầu           |
| **18–19** | 🔥 Rất tốt                     |
| **20/20** | 🏆 Week 1 rất chắc             |

Khi bạn gửi 20 đáp án, mình sẽ trả lại theo format:

```text
Score: 17/20 ✅

Wrong Answer Log
───────────────────────────────────────

Q6
Your answer: Parquet
Correct: Avro

Why:
Requirement là record serialization / schema evolution.

Decision Rule:
Streaming record serialization → Avro


Q19
Your answer: CI
Correct: DPL

Why:
Group sizes equal; difference nằm ở positive label rate.

Decision Rule:
Facet counts → CI
Label proportions → DPL
```

Sau đó mình sẽ tạo **Week 1 Gap Map** kiểu:

```text
Storage                ✅
Formats                ⚠️
Batch/Streaming        ✅
Data Cleaning          ✅
Feature Engineering    ✅
AWS Tool Selection     ✅
Feature Store          ✅
Data Quality           ✅
Bias/Clarify           ⚠️
```

Nếu **≥16/20**, bài tiếp theo sẽ chính thức sang:

> **WEEK 2 — Day 8: ML Fundamentals — Classification vs Regression vs Clustering vs Forecasting vs Recommendation vs Anomaly Detection**, tiếp tục đúng format `concept → example → AWS → comparison → exam traps → 10 practice questions`.
