Được. Để học Week 1 hiệu quả, mình khuyên **không học từng AWS service rời rạc**, mà nhìn toàn bộ Domain 1 như một pipeline:

```text
Raw Data
   │
   ├── S3
   ├── RDS
   ├── DynamoDB
   ├── EFS / FSx
   └── Streaming
         │
         ▼
      INGEST
         │
         ▼
   CLEAN / TRANSFORM
         │
         ▼
 FEATURE ENGINEERING
         │
         ▼
 DATA QUALITY / BIAS
         │
         ▼
   FEATURE STORE
         │
         ▼
 Training-ready Data
         │
         ▼
      SageMaker
```

AWS chia Domain 1 thành đúng 3 task lớn: **ingest & store**, **transform & feature engineering**, và **ensure data integrity & prepare for modeling**. Domain này chiếm **28% scored content**, lớn nhất trong MLA-C01. ([AWS Documentation][1])

---

# 1. Day 1 — Hiểu kỳ thi trước khi học

## 1.1 Bốn domain của MLA-C01

Bạn cần nhớ cấu trúc này:

| Domain   | Nội dung                           |  Weight |
| -------- | ---------------------------------- | ------: |
| Domain 1 | Data Preparation for ML            | **28%** |
| Domain 2 | ML Model Development               |     26% |
| Domain 3 | Deployment & Orchestration         |     22% |
| Domain 4 | Monitoring, Maintenance & Security |     24% |

Điều này có nghĩa là gần **1/3 kiến thức tính điểm liên quan đến data preparation**. ([AWS Documentation][1])

MLA không chỉ hỏi:

> S3 là gì?

Mà thường hỏi kiểu:

> Dataset rất lớn, cần query một số column thường xuyên và tối ưu storage/scan cost. Nên lưu CSV hay Parquet?

Bạn phải biết **chọn solution dựa trên requirement**.

---

## 1.2 Question types

MLA-C01 có bốn dạng câu hỏi:

| Type              | Ý nghĩa                       |
| ----------------- | ----------------------------- |
| Multiple Choice   | 1 đáp án đúng                 |
| Multiple Response | nhiều đáp án đúng             |
| Ordering          | xếp các bước đúng thứ tự      |
| Matching          | ghép requirement với solution |

AWS hiện quy định 65 câu trong 130 phút. Trong exam guide, 50 câu được tính điểm và 15 câu là unscored; bạn không biết câu nào là unscored. Không bị trừ điểm khi đoán, vì vậy không nên để trống câu hỏi. Passing score là **720/1000**. ([Amazon Web Services, Inc.][2])

Một timing hợp lý:

```text
130 minutes / 65 questions
≈ 2 minutes / question
```

Những câu dài có architecture diagram hoặc nhiều requirement có thể dành 3 phút; câu definition/service selection nên cố gắng dưới 1 phút.

---

# 2. Domain 1 thực chất kiểm tra điều gì?

Hãy nhớ ba câu hỏi:

```text
1. Data ở đâu và lấy vào bằng cách nào?

2. Data cần transform thế nào để model dùng được?

3. Data có đủ sạch, đúng, unbiased và secure để train chưa?
```

Mapping với AWS:

```text
Task 1.1
Ingest & Store
      ↓
S3 / EFS / FSx / RDS / DynamoDB
Kinesis / Kafka / Glue

Task 1.2
Transform & Feature Engineering
      ↓
Data Wrangler
DataBrew
Glue
Spark
Feature Store

Task 1.3
Data Integrity
      ↓
Glue Data Quality
Clarify
Ground Truth
KMS
PII protection
```

Đây chính là scope AWS mô tả trong Domain 1. ([AWS Documentation][3])

---

# 3. Day 2 — Data Source và Storage

Đây là phần đầu tiên bạn cần hiểu thật chắc.

## 3.1 Data Source khác Storage như thế nào?

**Data source** = nơi dữ liệu hiện đang tồn tại.

Ví dụ:

```text
Customer database → RDS

User click events → Kinesis

Product catalog → DynamoDB

Historical transactions → S3
```

**Storage cho ML** = nơi bạn đưa hoặc truy cập dữ liệu để processing/training.

Ví dụ:

```text
RDS
 ↓ extract
S3
 ↓
SageMaker Training
```

Không nhất thiết training trực tiếp từ database production.

---

# 4. Amazon S3

S3 là **object storage**.

Mental model:

```text
Bucket
 ├── customers/
 │    └── customers.parquet
 │
 ├── training/
 │    └── train.csv
 │
 └── models/
      └── model.tar.gz
```

Trong ML, S3 rất thường được dùng cho:

```text
Raw data
Processed data
Training data
Model artifacts
Batch prediction input/output
```

Domain 1 yêu cầu bạn biết extract data từ S3 và lựa chọn storage dựa trên cost, performance và data structure. ([AWS Documentation][3])

### Exam signal

Nếu đề nói:

> Store large amounts of ML training data durably and cost-effectively.

Thường nghĩ đầu tiên:

**S3**.

---

# 5. EBS vs EFS vs FSx

Đây là nhóm rất dễ gây nhầm.

## EBS — Elastic Block Store

Mental model:

```text
EC2
 │
 ▼
EBS Volume
```

EBS giống như một disk/SSD attached vào compute instance.

Use case:

```text
Need block storage
Need high IOPS
Application running on EC2
```

Domain 1 thậm chí nhắc tới **EBS Provisioned IOPS** như một performance option cần biết. ([AWS Documentation][3])

---

## EFS — Elastic File System

Mental model:

```text
Compute A ─┐
Compute B ─┼── EFS
Compute C ─┘
```

EFS là shared file system.

Nếu nhiều compute resource cần access cùng filesystem:

> think EFS.

---

## FSx

FSx là family của managed file systems.

Trong exam guide Domain 1 có ví dụ **FSx for NetApp ONTAP**, trong khi Amazon FSx nói chung nằm trong in-scope services. ([AWS Documentation][3])

Mental model:

```text
Need specialized / high-performance
managed filesystem
        ↓
       FSx
```

Trong ML/HPC bạn cũng thường thấy FSx xuất hiện khi workload cần filesystem performance cao.

---

## Bảng nhớ nhanh

| Requirement                             | Think |
| --------------------------------------- | ----- |
| Object/dataset storage                  | S3    |
| Disk attached to compute                | EBS   |
| Shared Linux filesystem                 | EFS   |
| Specialized/high-performance managed FS | FSx   |

Đừng cố nhớ definition dài. Hãy nhớ **access pattern**.

---

# 6. RDS và DynamoDB

Hai service này thường đóng vai trò **data sources**.

## RDS

Relational database:

```text
Customers
Orders
Products

SELECT ...
JOIN ...
WHERE ...
```

Think:

> structured relational data + SQL.

---

## DynamoDB

NoSQL key-value/document database.

Mental model:

```text
customer_id
     ↓
customer profile
```

Think:

> very fast lookup by key, highly scalable operational data.

Domain 1 nêu trực tiếp S3, EBS, EFS, RDS và DynamoDB là các nơi bạn cần biết cách extract data. ([AWS Documentation][3])

---

# 7. Day 3 — Data Formats

Đây là phần rất quan trọng.

Bạn cần hiểu:

```text
CSV
JSON
Parquet
ORC
Avro
RecordIO
```

AWS liệt kê tất cả những format này trong MLA-C01 Domain 1. ([AWS Documentation][3])

---

# 8. CSV

Ví dụ:

```csv
customer_id,age,country,salary
1,25,VN,2000
2,31,US,5000
3,27,SG,4000
```

Ưu điểm:

```text
simple
human-readable
widely supported
```

Nhược điểm:

```text
larger size
limited schema information
inefficient when reading only a few columns from huge data
```

Exam:

> Small/simple dataset + interoperability

CSV có thể hợp lý.

---

# 9. JSON

Ví dụ:

```json
{
  "customer_id": 1,
  "age": 25,
  "address": {
    "country": "VN",
    "city": "HCM"
  }
}
```

Khác CSV ở chỗ JSON hỗ trợ:

```text
nested structures
semi-structured data
```

Think:

> API/event/document-shaped data.

---

# 10. Parquet

Đây là format rất quan trọng cho Data Engineering và ML.

Parquet là **columnar format**.

Giả sử dataset:

```text
customer_id
age
country
salary
transactions
churn
```

Nếu query chỉ cần:

```text
age
salary
churn
```

columnar storage giúp chỉ đọc các column cần thiết thay vì toàn bộ record.

Mental model:

```text
Big analytics dataset
       +
query selected columns
       +
compression
       ↓
     Parquet
```

Domain 1 yêu cầu chọn Parquet/JSON/CSV/ORC dựa trên data access pattern. ([AWS Documentation][3])

### Exam shortcut

```text
Large analytical dataset
+
reduce scan/storage
+
column based

→ Parquet
```

---

# 11. ORC

ORC cũng là columnar format.

Exam-level mental model:

```text
Parquet ≈ columnar
ORC     ≈ columnar
```

Bạn không cần thuộc low-level file structure.

Quan trọng là hiểu:

```text
CSV / JSON
→ easier/simple interchange

Parquet / ORC
→ analytics / large datasets
```

---

# 12. Avro

Avro là binary serialization format có schema.

Mental model:

```text
event / record
   ↓
serialized data
   +
schema
```

Thường gặp trong data pipelines và streaming systems.

Với MLA, hiểu concept là đủ.

---

# 13. RecordIO

RecordIO đáng chú ý vì SageMaker built-in algorithms có thể sử dụng format này.

Trong SageMaker protobuf RecordIO, observations được encode thành binary records; một số SageMaker algorithms có thể sử dụng RecordIO cho training/inference. ([AWS Documentation][4])

Exam-level:

```text
RecordIO
     ↓
efficient serialized records
     ↓
SageMaker training
```

Không cần học protobuf syntax.

---

# 14. Batch ingestion vs Streaming ingestion

Đây là concept rất quan trọng.

## Batch

Data được xử lý theo từng khối.

```text
Every night 01:00

Database
   ↓
Extract 10M records
   ↓
S3
   ↓
Glue
```

Think:

```text
hourly
daily
weekly
large scheduled datasets
```

---

## Streaming

Data đến liên tục.

```text
User Click
   ↓
User Click
   ↓
Transaction
   ↓
Transaction
   ↓
...
```

Need processing:

```text
continuously
or near-real-time
```

Domain 1 nêu Kinesis, Apache Flink và Apache Kafka cho streaming ingestion. ([AWS Documentation][3])

---

# 15. Kinesis, Kafka và Flink khác nhau thế nào?

Một mental model đơn giản:

```text
Producer
   ↓
Streaming Platform
   ↓
Processing
   ↓
Destination
```

## Kinesis

Think:

> AWS-native streaming ingestion.

Ví dụ:

```text
Web clicks
   ↓
Kinesis
   ↓
processing
```

---

## Kafka

Think:

> distributed event streaming platform.

Nếu requirement nói:

```text
existing Kafka workload
Kafka-compatible
event streaming
```

thì Kafka/MSK có thể là đáp án.

---

## Flink

Flink không chủ yếu là nơi giữ events.

Flink là:

> **stream processing engine**.

```text
Kinesis
   ↓
Flink

filter
aggregate
transform
window
   ↓
Output
```

Exam distinction:

```text
Kinesis / Kafka
→ transport/store stream events

Flink
→ process streaming events
```

---

# 16. AWS Glue

Glue là **serverless data integration service** dùng để discover, prepare, move và integrate data từ nhiều sources. ([AWS Documentation][5])

Mental model:

```text
S3
RDS
Database
  │
  ▼
 Glue
  │
ETL
  │
  ▼
Cleaned S3
```

ETL:

```text
Extract
Transform
Load
```

Ví dụ:

```text
RDS orders
+
S3 customer data
      ↓
     Glue
      ↓
join
clean
transform
      ↓
training.parquet
```

Exam signal:

> Large-scale serverless ETL / merge multiple datasets.

Think:

**AWS Glue**.

---

# 17. Spark / EMR

Spark là distributed data-processing framework.

Mental model:

```text
Very large dataset
      ↓
many compute nodes
      ↓
    Spark
```

Amazon EMR có thể chạy Spark.

Exam:

```text
large-scale distributed processing
complex Spark workload

→ EMR / Spark
```

Trong khi:

```text
managed serverless ETL

→ Glue
```

Glue và Spark/EMR đều được liệt kê trong Domain 1. ([AWS Documentation][3])

---

# 18. Day 4 — Data Cleaning

Giả sử dữ liệu:

```text
customer age salary country

A        25  3000   VN
B        NULL 5000  US
C        999 4000   VN
D        32  NULL   SG
D        32  NULL   SG
```

Bạn có ít nhất ba problems:

```text
NULL
→ Missing value

999
→ Outlier

D duplicated
→ Duplicate
```

AWS yêu cầu hiểu missing-value imputation, outliers, combining và deduplication. ([AWS Documentation][3])

---

# 19. Missing value / Imputation

Missing:

```text
salary = NULL
```

Có thể xử lý:

```text
remove row

or

fill value
```

Fill value gọi là:

> **imputation**

Ví dụ:

```text
salary NULL

→ median salary
```

Median thường useful khi data có extreme values.

Điểm exam quan trọng:

> Đừng mặc định mọi NULL đều phải delete.

Tùy amount và business meaning.

---

# 20. Outlier

Ví dụ:

```text
Age:

25
31
27
29
999
```

999 rất có thể là outlier hoặc bad data.

Có thể:

```text
remove
cap
replace
transform
investigate
```

Outlier khác missing value:

```text
NULL
→ no value

999
→ has value, but suspicious
```

---

# 21. Deduplication

Ví dụ:

```text
customer_id = 123
customer_id = 123
```

Nếu cùng record xuất hiện hai lần:

```text
remove duplicate
```

Nếu không xử lý:

```text
some samples get excessive weight
→ training data distorted
```

---

# 22. Feature Engineering là gì?

Đây là concept cực kỳ quan trọng.

Raw data thường không thể đưa trực tiếp vào model.

Ví dụ:

```text
DOB = 1990-01-05
```

Model có thể không cần DOB.

Ta tạo:

```text
Age = 36
```

Age là:

> **feature**

Quá trình biến raw data thành features tốt hơn gọi là:

> **Feature Engineering**

AWS Domain 1 yêu cầu scaling, standardization, splitting, binning, log transformation và normalization. ([AWS Documentation][3])

---

# 23. Feature và Label

Ví dụ muốn predict customer churn:

```text
Age
Country
MonthlySpend
LoginCount
      ↓
   FEATURES

Churn
  ↓
 LABEL / TARGET
```

Training dataset:

```text
Age  Spend  LoginCount  Churn

25   100       10         0
31   500        1         1
42   200       15         0
```

Model học:

```text
features
   ↓
patterns
   ↓
label
```

---

# 24. Scaling

Ví dụ:

```text
Age:
20–70

Salary:
1,000–1,000,000
```

Salary magnitude lớn hơn Age rất nhiều.

Scaling đưa features về scale hợp lý.

---

# 25. Normalization

Một cách phổ biến:

```text
Original

10
20
30
40

↓

0
0.33
0.67
1
```

Mental model:

```text
Normalization
→ map values into a common range
```

Ví dụ thường gặp:

```text
0 → 1
```

---

# 26. Standardization

Standardization thường đưa data về:

```text
mean ≈ 0
standard deviation ≈ 1
```

Formula:

```text
z = (x - mean) / standard deviation
```

Exam memory:

```text
Normalization
→ range

Standardization
→ mean 0 / std 1
```

---

# 27. Binning

Ví dụ raw:

```text
Age = 23
Age = 42
Age = 68
```

Binning:

```text
18–30 → Young
31–50 → Middle
51+   → Senior
```

Bạn biến continuous numeric value thành categories.

---

# 28. Feature splitting

Ví dụ:

```text
Address:
"HCM, Vietnam"
```

Split thành:

```text
City = HCM
Country = Vietnam
```

Hoặc:

```text
Timestamp

2026-08-20 08:30
```

split:

```text
hour = 8
day_of_week = Thursday
month = 8
```

Các feature mới có thể hữu ích hơn raw timestamp.

---

# 29. Log transformation

Giả sử income:

```text
1,000
2,000
3,000
5,000
2,000,000
```

Distribution bị skew mạnh.

Log transform:

```text
log(x)
```

giúp compress extreme ranges.

Mental model:

```text
Highly skewed numeric feature
        ↓
log transformation
```

---

# 30. Encoding categorical variables

Model thường cần numeric representation.

Ví dụ:

```text
Country

VN
US
SG
```

Cần encode.

Domain 1 yêu cầu hiểu one-hot, binary, label encoding và tokenization. ([AWS Documentation][3])

---

# 31. One-hot encoding

```text
Country
VN
US
SG
```

↓

```text
VN US SG

1  0  0
0  1  0
0  0  1
```

Ưu điểm:

Không tạo giả định rằng:

```text
VN < US < SG
```

Phù hợp với nominal categorical features.

---

# 32. Label encoding

```text
Low    → 0
Medium → 1
High   → 2
```

Có thể phù hợp khi category có natural ordering.

Nhưng nếu:

```text
VN → 0
US → 1
SG → 2
```

model có thể vô tình hiểu SG > US > VN.

Do đó one-hot thường an toàn hơn cho non-ordinal category.

---

# 33. Tokenization

Trong text:

```text
"I love AWS"
```

↓

```text
"I"
"love"
"AWS"
```

hoặc thành token IDs:

```text
[145, 921, 82]
```

Đây là bước chuẩn bị text cho NLP/LLM model.

---

# 34. Day 5 — SageMaker Data Wrangler

Đây là một trong những service quan trọng nhất Week 1.

Data Wrangler cung cấp workflow để:

```text
Import
 ↓
Explore
 ↓
Clean
 ↓
Transform
 ↓
Featurize
 ↓
Analyze
 ↓
Export
```

với ít hoặc không cần code, đồng thời vẫn cho phép custom Python/transforms. ([AWS Documentation][6])

Ví dụ:

```text
S3
 ↓
Data Wrangler

Remove NULL
 ↓
Remove duplicate
 ↓
One-hot country
 ↓
Normalize salary
 ↓
Analyze data
 ↓
Training dataset
```

### Exam trigger

Nếu question chứa:

```text
SageMaker
+
interactive visual data preparation
+
feature engineering
```

rất mạnh:

> **Data Wrangler**

---

# 35. Data Wrangler Flow

Data Wrangler lưu các bước transform dưới dạng flow.

```text
Dataset
   ↓
Remove Null
   ↓
Encode Country
   ↓
Normalize Salary
   ↓
Feature Engineering
```

Flow kết nối datasets, transformations và analyses thành một data preparation pipeline. ([AWS Documentation][7])

Bạn không phải manually redo từng operation.

---

# 36. Data Wrangler Analysis

Data Wrangler không chỉ transform.

Nó còn giúp:

```text
EDA
visualization
data quality analysis
anomaly detection
target leakage analysis
multicollinearity analysis
```

AWS documentation mô tả Data Wrangler có các analyses phục vụ exploration và quality insights. ([AWS Documentation][8])

---

# 37. Target Leakage

Concept này rất quan trọng.

Giả sử muốn predict:

```text
Will customer cancel subscription?
```

Dataset lại chứa:

```text
cancellation_date
```

Bạn dùng:

```text
cancellation_date
```

để predict cancellation.

Model accuracy:

```text
99.9%
```

nhưng vô nghĩa vì feature chỉ tồn tại **sau khi cancellation xảy ra**.

Đó là:

> **Target Leakage**

Mental model:

```text
Feature accidentally reveals answer
        ↓
Target Leakage
```

---

# 38. Day 6 — Data Wrangler vs DataBrew

Đây là comparison mình khuyên bạn thuộc.

## Data Wrangler

Primary mental model:

> ML-oriented data preparation integrated with SageMaker.

```text
Data
 ↓
Data Wrangler
 ↓
Features
 ↓
ML Training
```

AWS mô tả Data Wrangler cho import, prepare, transform, featurize và analyze data trong ML workflows. ([AWS Documentation][6])

---

## AWS Glue DataBrew

DataBrew là visual data preparation tool giúp clean và normalize data mà không cần code; AWS cung cấp hơn 250 ready-made transformations. ([AWS Documentation][9])

Mental model:

```text
Business / analytics dataset
          ↓
      DataBrew
          ↓
      visual recipe
          ↓
     clean dataset
          ↓
          S3
```

DataBrew có concept quan trọng:

> **Recipe**

```text
Step 1 Remove null
Step 2 Format date
Step 3 Remove duplicate
Step 4 Normalize country
```

Recipe = reusable series of transformations.

---

# 39. Data Wrangler vs DataBrew vs Glue

Đây là một bảng nên nhớ:

| Requirement                           | Think             |
| ------------------------------------- | ----------------- |
| Visual ML data prep                   | **Data Wrangler** |
| Feature engineering for SageMaker     | **Data Wrangler** |
| Visual no-code data cleaning          | **DataBrew**      |
| Reusable visual transformation recipe | **DataBrew**      |
| Large-scale ETL                       | **Glue**          |
| Merge many sources                    | **Glue**          |
| Complex distributed Spark             | **EMR/Spark**     |

AWS exam guide liệt kê Data Wrangler, Glue, DataBrew và Spark/EMR là các công cụ transform data. ([AWS Documentation][3])

---

# 40. SageMaker Feature Store

Sau feature engineering, bạn có thể có features như:

```text
customer_age
avg_order_value
orders_last_30_days
login_frequency
churn_risk_feature
```

Nếu nhiều models/team cần reuse, không muốn mỗi project tự tính lại.

Dùng:

> **SageMaker Feature Store**

Mental model:

```text
Raw Data
   ↓
Feature Engineering
   ↓
Feature Store
   │
   ├── Model A
   ├── Model B
   └── Model C
```

Feature Store là storage/data management layer cho ML features. ([AWS Documentation][10])

---

# 41. Online Store vs Offline Store

Đây là concept rất có khả năng được hỏi.

## Offline Store

Use:

```text
historical features
training
data exploration
batch inference
```

AWS nói offline store được dùng khi không cần sub-second retrieval và thường dùng cho training/batch inference. ([AWS Documentation][11])

---

## Online Store

Use:

```text
latest feature values
low-latency lookup
real-time inference
```

AWS mô tả online store cho low-latency real-time inference, trong khi offline store dành cho training/batch inference. ([AWS Documentation][12])

Mental model:

```text
             Feature Store
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 Online Store          Offline Store
        │                   │
real-time inference      training
low latency              batch
latest value              history
```

### Exam shortcut

```text
Model training
→ Offline Store

Realtime prediction
→ Online Store
```

---

# 42. Day 7 / Task 1.3 — Data Quality

Clean data chưa chắc đã là **valid data**.

Ví dụ:

```text
age = 25
salary = 3000
country = VN
```

Looks okay.

Nhưng rule:

```text
age must be 18–100
salary > 0
customer_id must not be null
customer_id must be unique
```

Đây là:

> **Data Quality rules**

---

# 43. AWS Glue Data Quality

Glue Data Quality cho phép define/evaluate quality rules đối với datasets và sử dụng **DQDL — Data Quality Definition Language**. ([AWS Documentation][13])

Ví dụ conceptually:

```text
customer_id
→ Complete
→ Unique

age
→ between valid range

country
→ valid values
```

Mental model:

```text
Data
 ↓
Glue Data Quality
 ↓
Rules
 ↓
PASS / FAIL
```

Exam signal:

> Continuously validate ETL dataset quality.

Think:

**Glue Data Quality**.

---

# 44. Class Imbalance

Giả sử fraud dataset:

```text
Normal     99,000
Fraud       1,000
```

Dataset rất imbalanced.

Nếu model luôn predict:

```text
Normal
```

Accuracy:

```text
99%
```

nhưng model hoàn toàn vô dụng.

Đây là lý do class imbalance rất quan trọng.

AWS Domain 1 yêu cầu hiểu class imbalance và strategies như resampling hoặc synthetic data generation. ([AWS Documentation][3])

Có thể xử lý:

```text
oversampling minority
undersampling majority
synthetic samples
class weighting
```

---

# 45. Bias không hoàn toàn giống Class Imbalance

Một distinction quan trọng.

Giả sử training data:

```text
Group A: 80,000
Group B: 10,000
```

Một demographic/facet được represent ít hơn đáng kể.

SageMaker Clarify gọi một metric là **Class Imbalance (CI)** để đo imbalance về số samples giữa facets. ([AWS Documentation][14])

---

# 46. Difference in Proportions of Labels — DPL

Ví dụ loan dataset:

```text
Group A:
approved = 80%

Group B:
approved = 30%
```

DPL đo difference của proportions of positive labels giữa các facets. ([AWS Documentation][15])

Mental model:

```text
CI
→ Do groups have similar amounts of data?

DPL
→ Do groups have similar positive-label proportions?
```

Không cần thuộc formula để thi ở mức Associate; hiểu interpretation quan trọng hơn.

---

# 47. SageMaker Clarify

Exam mental model:

```text
Clarify
   │
   ├── Bias detection
   │
   └── Explainability
```

Week 1 chủ yếu tập trung:

> **pre-training data bias**

```text
Raw dataset
   ↓
Clarify
   ↓
CI / DPL / other metrics
   ↓
Detect bias
   ↓
Mitigate
   ↓
Train
```

AWS exam guide trực tiếp yêu cầu dùng Clarify để identify/mitigate bias. ([AWS Documentation][3])

Một lưu ý thực tế hiện tại: AWS docs nói Clarify không còn mở cho new customers, nhưng **MLA-C01 blueprint hiện vẫn explicitly yêu cầu Clarify**, nên nếu mục tiêu của bạn là thi C01 thì vẫn cần học concept này. ([AWS Documentation][14])

---

# 48. Train / Validation / Test split

Dataset:

```text
100,000 samples
```

Có thể chia:

```text
Training
~70%

Validation
~15%

Test
~15%
```

Tỷ lệ không phải rule cố định.

Vai trò:

```text
Training
→ model learns

Validation
→ tune/select model

Test
→ final unbiased evaluation
```

Điểm quan trọng:

> Test set không nên được dùng để train model.

AWS Domain 1 đề cập dataset splitting, shuffling và augmentation để prepare data và giảm prediction bias. ([AWS Documentation][3])

---

# 49. Shuffling

Nếu dataset:

```text
First 50,000
→ all class A

Next 50,000
→ all class B
```

và bạn chia:

```text
first 80% = training
last 20% = test
```

thì dataset split bị bias.

Shuffle:

```text
A B A A B B A B...
```

trước khi split giúp distribution hợp lý hơn.

---

# 50. Data Augmentation

Ví dụ image dataset nhỏ:

```text
Original image
     │
     ├── rotate
     ├── crop
     ├── flip
     └── brightness
```

→ tạo thêm training samples.

Use cases:

```text
increase dataset diversity
reduce overfitting
help minority examples
```

Domain 1 explicitly đưa augmentation vào data preparation strategies. ([AWS Documentation][3])

---

# 51. Data Labeling

Supervised ML cần:

```text
Input
+
Correct answer
```

Ví dụ:

```text
email → spam
image → dog
transaction → fraud
```

Việc thêm:

```text
spam
dog
fraud
```

gọi là:

> **labeling / annotation**

---

# 52. SageMaker Ground Truth

Ground Truth dùng workforce/human annotators để tạo high-quality labeled datasets; AWS docs mô tả private workforce, vendors hoặc Mechanical Turk. ([AWS Documentation][16])

Mental model:

```text
Unlabeled images
      ↓
Ground Truth
      ↓
Human labeling
      ↓
cat
dog
car
      ↓
Training dataset
```

Exam:

```text
Need human labels for ML training

→ Ground Truth
```

Ground Truth hiện không open cho new customers, nhưng vẫn được liệt kê trong MLA-C01 Domain 1 nên vẫn cần biết cho exam. ([AWS Documentation][17])

---

# 53. Data Security

Domain 1 cũng có một số security concepts.

AWS yêu cầu hiểu:

```text
encryption
data classification
anonymization
masking
PII
PHI
data residency
```

([AWS Documentation][3])

---

# 54. PII

PII:

> Personally Identifiable Information.

Ví dụ:

```text
name
email
phone
passport number
address
```

ML pipeline phải tránh expose sensitive information không cần thiết.

---

# 55. PHI

PHI:

> Protected Health Information.

Ví dụ healthcare:

```text
patient
diagnosis
treatment
medical history
```

Exam có thể đặt requirement:

> Healthcare dataset must protect PHI.

Bạn phải nghĩ tới:

```text
encryption
access control
masking
compliance
```

---

# 56. Masking vs Anonymization

Ví dụ email:

```text
hoa.nguyen@example.com
```

Masking:

```text
h********@example.com
```

Anonymization có mục tiêu mạnh hơn:

```text
remove / transform information
so individual cannot reasonably be identified
```

Mental model:

```text
masking
→ hide visible sensitive parts

anonymization
→ remove identifying association
```

---

# 57. Encryption at rest vs in transit

## At rest

Data đang nằm trong:

```text
S3
EBS
EFS
database
```

→ encrypt stored data.

AWS service quan trọng:

```text
KMS
```

---

## In transit

Data di chuyển:

```text
Client
   ↓
Network
   ↓
AWS Service
```

→ use encrypted transport such as TLS.

KMS và IAM nằm trong MLA-C01 in-scope services. ([AWS Documentation][18])

---

# 58. Data Residency

Ví dụ requirement:

> Customer data from Germany must remain in an approved geographic region.

Đây là:

> **data residency**

Không chỉ là security problem mà còn có thể là compliance/legal requirement.

Domain 1 explicitly nêu data residency cùng PII/PHI. ([AWS Documentation][3])

---

# 59. Toàn bộ Week 1 kết nối với nhau như thế nào?

Giả sử bạn đang build:

> **Customer Churn Prediction**

Data hiện tại:

```text
RDS
→ customer profile

DynamoDB
→ activity

S3
→ purchase history

Kinesis
→ click events
```

### Step 1 — Ingest

```text
RDS ────────┐
DynamoDB ───┼──→ Glue
S3 ─────────┘

Kinesis
   ↓
stream processing
```

### Step 2 — Store

```text
S3

raw/
processed/
training/
```

### Step 3 — Clean

```text
Data Wrangler

NULL
duplicates
invalid age
outliers
```

### Step 4 — Feature engineering

```text
DOB
 ↓
Age

Transactions
 ↓
AvgSpend30Days

Country
 ↓
One Hot

Salary
 ↓
Normalization
```

### Step 5 — Store features

```text
Feature Store

Offline
→ model training

Online
→ real-time inference
```

### Step 6 — Quality

```text
Glue Data Quality

customer_id not null
age valid
features complete
```

### Step 7 — Bias

```text
Clarify

CI
DPL
```

### Step 8 — Prepare

```text
Shuffle
  ↓
Train / Validation / Test
```

### Step 9

```text
Training-ready data
       ↓
    SageMaker
```

Nếu bạn hiểu được flow này, bạn đã hiểu **phần cốt lõi của Week 1**.

---

# 60. Bảng “keyword → answer” nên thuộc

| Nếu đề nói...                  | Nghĩ ngay tới         |
| ------------------------------ | --------------------- |
| Object storage / ML dataset    | **S3**                |
| Block storage / EC2 disk       | **EBS**               |
| Shared filesystem              | **EFS**               |
| Specialized managed filesystem | **FSx**               |
| Streaming ingestion            | **Kinesis / Kafka**   |
| Stream processing              | **Flink**             |
| Serverless ETL                 | **Glue**              |
| Distributed Spark processing   | **EMR/Spark**         |
| ML visual data preparation     | **Data Wrangler**     |
| Visual no-code cleaning        | **DataBrew**          |
| Reusable transformation recipe | **DataBrew**          |
| Reusable ML features           | **Feature Store**     |
| Training/history features      | **Offline Store**     |
| Real-time feature lookup       | **Online Store**      |
| Data quality rules             | **Glue Data Quality** |
| Pre-training bias              | **Clarify**           |
| Human labeling                 | **Ground Truth**      |
| Columnar analytics             | **Parquet / ORC**     |
| Semi-structured nested data    | **JSON**              |
| Simple interchange             | **CSV**               |

---

# 61. Những thứ bạn thực sự phải master sau Week 1

Bạn không cần nhớ hàng trăm AWS options. Khi gặp một scenario, bạn cần tự trả lời được chuỗi quyết định này:

```text
Data source?
     ↓
Batch or Streaming?
     ↓
Which storage?
     ↓
Which format?
     ↓
How to clean?
     ↓
Which transformation tool?
     ↓
Which features?
     ↓
Feature Store needed?
     ↓
Quality okay?
     ↓
Bias?
     ↓
Security / PII?
     ↓
Train / Val / Test
     ↓
Ready for SageMaker
```

Nếu bạn trả lời được từng bước và giải thích **tại sao chọn service A thay vì B**, thì Domain 1 sẽ dễ hơn rất nhiều so với học thuộc definitions.

### Mức độ ưu tiên mình đề xuất cho Week 1

```text
★★★★★  Data Wrangler
★★★★★  DataBrew vs Data Wrangler
★★★★★  Data Cleaning
★★★★★  Feature Engineering
★★★★★  S3
★★★★★  Parquet vs CSV
★★★★★  Feature Store online/offline

★★★★☆  Glue
★★★★☆  Batch vs Streaming
★★★★☆  Kinesis
★★★★☆  Data Quality
★★★★☆  Class Imbalance / Bias
★★★★☆  Clarify

★★★☆☆  EBS / EFS / FSx
★★★☆☆  RDS / DynamoDB
★★★☆☆  Ground Truth
★★★☆☆  Avro / ORC / RecordIO
★★★☆☆  PII / KMS / data residency
```

Nếu học tiếp theo cách này, bước hợp lý nhất là mình **đi sâu Day 1 trước**, sau đó Day 2, Day 3... và với mỗi ngày mình có thể làm theo format: **concept → ví dụ thực tế → AWS service → cách phân biệt → exam traps → 10 câu practice MLA-C01**. Đây sẽ hiệu quả hơn việc chỉ đọc lý thuyết toàn Week 1 một lượt.

[1]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01.html "AWS Certified Machine Learning Engineer - Associate (MLA-C01) - AWS Certified Machine Learning Engineer - Associate"
[2]: https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/?utm_source=chatgpt.com "AWS Certified Machine Learning Engineer – Associate"
[3]: https://docs.aws.amazon.com/zh_tw/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain1.html "Content Domain 1: Data Preparation for Machine Learning (ML) - AWS Certified Machine Learning Engineer - Associate"
[4]: https://docs.aws.amazon.com/sagemaker/latest/dg/cdf-training.html?utm_source=chatgpt.com "Common Data Formats for Training - Amazon SageMaker AI"
[5]: https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html?utm_source=chatgpt.com "What is AWS Glue? - AWS Glue"
[6]: https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html?utm_source=chatgpt.com "Prepare ML Data with Amazon SageMaker Data Wrangler"
[7]: https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler-data-flow.html?utm_source=chatgpt.com "Create and Use a Data Wrangler Flow"
[8]: https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler-data-insights.html?utm_source=chatgpt.com "Get Insights On Data and Data Quality"
[9]: https://docs.aws.amazon.com/databrew/latest/dg/what-is.html?utm_source=chatgpt.com "AWS Glue DataBrew"
[10]: https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store-concepts.html?utm_source=chatgpt.com "Feature Store concepts"
[11]: https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store-storage-configurations-offline-store.html?utm_source=chatgpt.com "Offline store - Amazon SageMaker AI"
[12]: https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store-security.html?utm_source=chatgpt.com "Security and access control - Amazon SageMaker AI"
[13]: https://docs.aws.amazon.com/glue/latest/dg/glue-data-quality.html?utm_source=chatgpt.com "AWS Glue Data Quality"
[14]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-bias-metric-class-imbalance.html "Class Imbalance (CI) - Amazon SageMaker AI"
[15]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-measure-data-bias.html "Pre-training Bias Metrics - Amazon SageMaker AI"
[16]: https://docs.aws.amazon.com/sagemaker/latest/dg/sms.html?utm_source=chatgpt.com "Training data labeling using humans with ..."
[17]: https://docs.aws.amazon.com/sagemaker/latest/dg/sms-getting-started.html?utm_source=chatgpt.com "Create a bounding box labeling job with Ground Truth"
[18]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/mla-01-in-scope-services.html "In-Scope AWS Services - AWS Certified Machine Learning Engineer - Associate"
