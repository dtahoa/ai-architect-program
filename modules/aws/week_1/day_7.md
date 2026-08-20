# MLA-C01 Training — Week 1, Day 7

## Week 1 Review + End-to-End Data Pipeline + Exam Drill

Day 7 không tập trung học thêm nhiều service mới. Mục tiêu là **ghép toàn bộ Day 1 → Day 6 thành một mental model duy nhất** để khi gặp scenario trong exam, bạn biết chọn service nào và loại trừ service nào.

AWS hiện vẫn xác định **Domain 1 — Data Preparation for Machine Learning = 28%** bài thi, gồm ba task chính:

1. **Ingest and store data**
2. **Transform data and perform feature engineering**
3. **Ensure data integrity and prepare data for modeling** ([AWS Documentation][1])

---

# 1. Mental model quan trọng nhất của Week 1

Khi đọc một câu hỏi MLA-C01 về data, hãy tự hỏi theo thứ tự:

```text
1. Data ở đâu?
        ↓
2. Batch hay Streaming?
        ↓
3. Ingest bằng gì?
        ↓
4. Store ở đâu?
        ↓
5. Có cần catalog/query không?
        ↓
6. Clean / transform bằng gì?
        ↓
7. Feature engineering bằng gì?
        ↓
8. Có cần reuse feature không?
        ↓
9. Data quality / bias có vấn đề không?
        ↓
10. Split train/validation/test thế nào?
        ↓
11. SageMaker training đọc data bằng gì?
```

Nếu bạn làm được decision tree này thì phần lớn Domain 1 sẽ trở thành bài **service selection** hơn là học thuộc lòng.

---

# 2. Concept 1 — Data ingestion: Batch vs Streaming

## Concept

Đầu tiên phải xác định dữ liệu đến theo:

```text
Batch
```

hay

```text
Streaming / Real-time
```

### Batch

Ví dụ:

* file CSV được upload mỗi ngày
* database export mỗi đêm
* sales transaction dump
* historical training dataset

Pipeline thường giống:

```text
Database / CSV
      ↓
Glue / DataSync / DMS
      ↓
S3
```

### Streaming

Ví dụ:

```text
clickstream
IoT
fraud transaction
real-time user activity
```

Pipeline:

```text
Application
     ↓
Kinesis Data Streams
     ↓
Processing
     ↓
S3 / Feature Store / ML
```

---

# 3. AWS services cần phân biệt

| Requirement                                       | Service              |
| ------------------------------------------------- | -------------------- |
| Real-time event stream                            | Kinesis Data Streams |
| Deliver streaming data tới S3/Redshift/OpenSearch | Amazon Data Firehose |
| Kafka workload                                    | Amazon MSK           |
| Database migration/CDC                            | AWS DMS              |
| Batch ETL                                         | AWS Glue             |
| Large-scale object storage/data lake              | S3                   |

### Exam shortcut

Nếu thấy:

> Millions of events per second, consumers need to process events independently.

Think:

**Kinesis Data Streams**

Nếu thấy:

> Minimal operational overhead, deliver streaming records into S3.

Think:

**Amazon Data Firehose**

---

# 4. Concept 2 — Data Lake: Amazon S3

Amazon S3 gần như là trung tâm của rất nhiều ML architectures.

Ví dụ:

```text
Application
     ↓
Kinesis
     ↓
S3 raw
     ↓
Glue
     ↓
S3 processed
     ↓
SageMaker
```

Một kiến trúc hay gặp:

```text
s3://ml-data/raw/

s3://ml-data/processed/

s3://ml-data/features/

s3://ml-data/train/

s3://ml-data/validation/

s3://ml-data/test/
```

## Vì sao S3?

* scalable
* durable
* inexpensive
* tích hợp tốt với Glue
* Athena
* EMR
* SageMaker
* Redshift
* Feature Store offline store

### Exam trap

Requirement:

> Store petabytes of training data cost-effectively.

Không cần:

* EBS
* DynamoDB
* RDS

→ **S3**

---

# 5. Concept 3 — CSV vs JSON vs Parquet

Đây là dạng câu hỏi nhỏ nhưng rất dễ lấy điểm.

## CSV

```text
customer_id,age,country,revenue
101,32,VN,500
102,40,US,800
```

Ưu:

* đơn giản
* dễ đọc
* phổ biến

Nhược:

* không compressed tốt
* không optimized analytics
* phải scan nhiều data

---

## JSON

Tốt cho:

* nested data
* event
* API
* semi-structured data

```json
{
  "customer_id": 101,
  "country": "VN"
}
```

---

## Parquet

Columnar format.

Ví dụ query:

```sql
SELECT revenue
FROM transactions
```

Parquet có thể chỉ đọc column:

```text
revenue
```

thay vì toàn bộ record.

### Tốt cho

* Athena
* Glue
* analytics
* large ML datasets

### Exam clue

> Reduce amount of data scanned by Athena.

Think:

**Parquet + partitioning**

---

# 6. Concept 4 — Glue Data Catalog vs Glue ETL vs Athena

Ba cái này rất dễ bị trộn lẫn.

## Glue Data Catalog

Không phải nơi chứa data.

Nó chứa:

```text
metadata
schema
table definition
partition
location
```

Ví dụ:

```text
Table: customer_transactions

Columns:
customer_id
product_id
amount
timestamp

Location:
s3://company-data/transactions/
```

---

## Glue crawler

Crawler scan:

```text
S3
 ↓
discover schema
 ↓
Glue Data Catalog
```

---

## Athena

Dùng SQL query data trong S3.

```text
S3
 ↑
Athena
 ↑
Glue Data Catalog
```

Mental model:

> **S3 stores data.
> Glue Catalog describes data.
> Athena queries data.**

---

# 7. Concept 5 — Data cleaning

Raw ML data thường có:

```text
Missing values
Duplicates
Outliers
Wrong types
Inconsistent categories
Invalid records
```

Ví dụ:

```text
age

25
32
NULL
400
28
```

Ta có thể:

* impute NULL
* remove invalid values
* cap outliers
* normalize values

---

# 8. Missing values

Ba strategy phổ biến:

### Remove rows

Tốt khi:

* rất ít missing records
* mất rows không ảnh hưởng dataset

---

### Mean/median imputation

Ví dụ:

```text
Age

20
30
NULL
40
```

Mean:

```text
30
```

replace:

```text
20
30
30
40
```

Median thường tốt hơn mean khi có outlier.

Ví dụ:

```text
20
25
30
500
```

Mean bị 500 kéo lệch.

---

### Mode

Thường dùng cho categorical feature:

```text
country

VN
VN
US
NULL
```

→ fill `VN`.

---

# 9. Concept 6 — Feature engineering

Raw data:

```text
birth_date = 1990-05-12
```

Model không nhất thiết nên dùng trực tiếp.

Có thể tạo:

```text
age = 36
```

Hoặc:

```text
transaction_timestamp
```

→

```text
hour_of_day
day_of_week
weekend
month
```

Đó chính là feature engineering.

---

# 10. Common feature transformations

Bạn nên nhận ra các keyword sau.

### Normalization

Scale:

```text
0 → 1
```

Ví dụ:

```text
salary

30,000
50,000
1,000,000
```

---

### Standardization

Thường đưa data về:

```text
mean = 0
standard deviation = 1
```

---

### One-hot encoding

```text
country

VN
US
UK
```

→

```text
country_VN
country_US
country_UK
```

---

### Bucketing

```text
age
```

→

```text
18-25
26-35
36-45
```

---

### Text tokenization

```text
"I love AWS"
```

→ tokens.

---

# 11. Concept 7 — Data Wrangler vs DataBrew vs Glue

Đây là một trong những phần **có khả năng xuất hiện dưới dạng service-selection scenario**.

## SageMaker Data Wrangler

Think:

> **ML data preparation**

Dùng cho:

* ML dataset
* transformations
* feature engineering
* visualization
* integrate SageMaker
* export processing workflows
* Feature Store

Ví dụ:

```text
S3
 ↓
Data Wrangler
 ↓
clean
 ↓
transform
 ↓
feature engineering
 ↓
Feature Store / SageMaker
```

---

## AWS Glue DataBrew

Think:

> **Visual/no-code general data preparation**

Suitable:

```text
business analyst
data analyst
```

Muốn:

* clean
* profile
* transform

mà không muốn viết code.

---

## AWS Glue ETL

Think:

> **large-scale serverless ETL**

Ví dụ:

```text
20 TB raw transaction data
```

cần:

```text
join
filter
transform
partition
```

→ Glue.

---

## Exam shortcut

```text
ML-specific feature engineering
            ↓
      Data Wrangler


No-code general data cleaning
            ↓
         DataBrew


Large scalable ETL
            ↓
           Glue
```

---

# 12. Concept 8 — SageMaker Feature Store

Feature Store giải quyết một vấn đề rất quan trọng:

> Không muốn mỗi team/model tự tính lại cùng một feature.

Ví dụ có feature:

```text
customer_30_day_purchase_count
customer_avg_order_value
customer_risk_score
```

Fraud model cần.

Recommendation model cũng cần.

Churn model cũng cần.

Thay vì:

```text
Fraud → calculate feature

Churn → calculate feature

Recommendation → calculate feature
```

ta làm:

```text
                 Feature Store
                /      |       \
             Fraud   Churn   Recommendation
```

---

# 13. Online Store vs Offline Store

Đây là **must-know exam concept**.

## Online Store

Purpose:

> Real-time inference.

Ví dụ API nhận:

```text
customer_id = 123
```

model cần:

```text
purchase_count_30d
average_order_value
risk_score
```

phải lấy rất nhanh.

```text
Feature Store Online
        ↓
real-time endpoint
```

AWS mô tả online store dành cho low-latency real-time prediction và giữ latest feature values. ([AWS Documentation][2])

---

## Offline Store

Purpose:

* historical feature data
* training
* batch inference
* data exploration

Ví dụ:

```text
customer 123

Jan risk_score = 0.2
Feb risk_score = 0.3
Mar risk_score = 0.8
```

Training cần historical records.

Offline Store giữ lịch sử feature và sử dụng S3 làm storage. ([AWS Documentation][3])

### Memorize

```text
ONLINE
latest value
low latency
real-time inference


OFFLINE
historical values
S3
training
batch inference
```

---

# 14. Một exam trap rất hay: training-serving skew

Giả sử training team calculate:

```python
purchase_count = purchases_last_30_days
```

Nhưng production team calculate:

```python
purchase_count = purchases_last_28_days
```

Model training thấy một definition.

Production thấy definition khác.

Đây là:

> **training-serving skew**

Feature Store giúp reuse consistent features giữa training và inference, giảm nguy cơ này. ([AWS Documentation][3])

---

# 15. Concept 9 — Data Quality

Ví dụ dataset:

```text
customer_id   age   revenue

101           25     300
102           NULL   400
102           NULL   400
103           -50    500
```

Problems:

```text
NULL
duplicate
invalid age
```

Ta muốn define rules như:

```text
customer_id must be unique
age must not be null
age >= 0
revenue >= 0
```

AWS service:

> **AWS Glue Data Quality**

Rules có thể được define bằng:

> **Data Quality Definition Language — DQDL**

AWS xác nhận DQDL là domain-specific language để define Glue Data Quality rules. ([AWS Documentation][4])

Mental model:

```text
Dataset
   ↓
Glue Data Quality
   ↓
DQDL rules
   ↓
PASS / FAIL
```

---

# 16. Concept 10 — Data bias

Ví dụ loan dataset:

```text
Group A: 95%
Group B: 5%
```

Model có thể học không tốt cho Group B.

Đây có thể là:

> **Class / facet imbalance**

Một metric bạn nên nhớ:

### CI — Class Imbalance

Kiểm tra representation imbalance.

---

### DPL — Difference in Proportions of Labels

Kiểm tra outcome labels giữa facets.

AWS MLA-C01 exam guide vẫn explicitly liệt kê:

* CI
* DPL
* SageMaker Clarify

trong Domain 1. ([AWS Documentation][1])

---

# 17. Important 2026 note về SageMaker Clarify

Có một thay đổi AWS khá mới mà bạn nên biết.

AWS documentation hiện ghi:

> New customer access to SageMaker Clarify was closed effective **July 30, 2026**.

Existing customers vẫn có thể tiếp tục sử dụng service. ([AWS Documentation][5])

Nhưng **MLA-C01 exam guide hiện tại vẫn explicitly nhắc SageMaker Clarify**, bao gồm bias detection và model interpretation. ([AWS Documentation][1])

Do đó cho mục đích exam:

> **Vẫn phải học Clarify.**

Đừng loại Clarify khỏi đáp án chỉ vì service vừa thay đổi availability.

---

# 18. Concept 11 — Train / Validation / Test split

Ví dụ:

```text
100,000 records
```

có thể chia:

```text
70% Training
15% Validation
15% Test
```

Vai trò:

### Training

```text
model learns
```

### Validation

```text
hyperparameter/model selection
```

### Test

```text
final unbiased evaluation
```

---

# 19. Data leakage

Đây là concept **cực kỳ quan trọng**.

Ví dụ predict:

> Customer có cancel subscription không?

Feature:

```text
customer_age
login_count
monthly_usage
cancellation_date
```

`cancellation_date` chỉ tồn tại sau khi customer cancel.

Nếu đưa nó vào training:

```text
data leakage
```

Model sẽ có accuracy cực cao nhưng production vô dụng.

---

# 20. Time-series split

Với time-series:

Không nên random split tùy tiện.

Ví dụ:

```text
Jan
Feb
Mar
Apr
May
Jun
```

Better:

```text
Train:
Jan → Apr

Validation:
May

Test:
Jun
```

Không nên:

```text
Train:
Jan Mar May Jun

Test:
Feb Apr
```

vì future information có thể leak về past.

---

# 21. End-to-end real-world example

Giả sử bạn đang build:

> **Fraud Detection System**

Data sources:

```text
Historical transactions
        +
Real-time transactions
```

Architecture:

```text
Historical DB
      ↓
AWS DMS
      ↓
Amazon S3 RAW
      ↓
AWS Glue
      ↓
S3 Processed
      ↓
Data Wrangler
      ↓
Feature Engineering
      ↓
Feature Store Offline
      ↓
SageMaker Training
```

Production:

```text
Transaction
     ↓
Kinesis
     ↓
Feature calculation
     ↓
Feature Store Online
     ↓
SageMaker Endpoint
     ↓
Fraud Score
```

Data Quality:

```text
S3
 ↓
Glue Data Quality
 ↓
validate dataset
```

Bias:

```text
Training dataset
      ↓
SageMaker Clarify
      ↓
bias metrics
```

Đây chính là một architecture bạn nên hình dung khi bước vào exam.

---

# 22. Service-selection cheat sheet

| Nếu đề bài nói...                  | Nghĩ tới               |
| ---------------------------------- | ---------------------- |
| Object/data lake                   | S3                     |
| SQL query S3                       | Athena                 |
| Metadata/schema/catalog            | Glue Data Catalog      |
| Auto discover schema               | Glue Crawler           |
| Large-scale serverless ETL         | Glue                   |
| Visual ML preparation              | Data Wrangler          |
| No-code general data preparation   | DataBrew               |
| Validate data quality              | Glue Data Quality      |
| Define quality rules               | DQDL                   |
| Reusable ML features               | Feature Store          |
| Low-latency feature retrieval      | Feature Store Online   |
| Historical features/training       | Feature Store Offline  |
| Streaming events                   | Kinesis Data Streams   |
| Streaming delivery to destinations | Data Firehose          |
| Kafka                              | MSK                    |
| Database migration / CDC           | DMS                    |
| Bias analysis                      | SageMaker Clarify      |
| Data labeling                      | SageMaker Ground Truth |
| Query huge S3 dataset efficiently  | Parquet + partitioning |

---

# 23. Exam traps — Day 7

## Trap #1

### Feature Store Online = training

❌ Wrong.

```text
Online → real-time inference
Offline → training
```

---

## Trap #2

### Glue Catalog stores dataset

❌ Wrong.

Glue Catalog stores:

```text
metadata
```

S3 stores the actual dataset.

---

## Trap #3

### Athena performs ETL

Usually ❌.

Athena:

```text
query
```

Glue:

```text
ETL
```

---

## Trap #4

### Data Wrangler = DataBrew

Không hoàn toàn.

```text
Data Wrangler → ML-centric
DataBrew → general visual data preparation
```

---

## Trap #5

### Use EBS for huge ML data lake

❌

Think:

```text
S3
```

---

## Trap #6

### Random split all datasets

❌

Time-series thường cần:

```text
chronological split
```

---

## Trap #7

### Normalize data trước rồi mới split

Có thể gây leakage.

Safer pattern:

```text
split
 ↓
fit transformation using TRAIN
 ↓
apply transformation
 ↓
validation/test
```

Ví dụ standardization:

Không calculate mean/std từ toàn bộ:

```text
train + test
```

Mà calculate từ:

```text
train only
```

---

## Trap #8

### Offline Store chỉ giữ latest feature

❌

Ngược lại:

```text
Online → latest
Offline → history
```

AWS Feature Store documentation cũng mô tả offline store là historical database trong khi online store tập trung latest values cho low-latency inference. ([AWS Documentation][3])

---

# 24. Exam decision tree cần thuộc

Khi thấy câu hỏi data, chạy mental algorithm này:

```text
QUESTION
   │
   ├── Streaming?
   │      ├── Kafka → MSK
   │      ├── Process stream → Kinesis Data Streams
   │      └── Deliver stream → Firehose
   │
   ├── Storage?
   │      └── ML data lake → S3
   │
   ├── ETL?
   │      ├── Big/serverless → Glue
   │      ├── Visual ML → Data Wrangler
   │      └── Visual general → DataBrew
   │
   ├── Query S3?
   │      └── Athena
   │
   ├── Metadata?
   │      └── Glue Data Catalog
   │
   ├── Features?
   │      └── Feature Store
   │             ├── Training → Offline
   │             └── Real-time inference → Online
   │
   ├── Data quality?
   │      └── Glue Data Quality
   │
   └── Bias?
          └── Clarify
```

---

# 25. MLA-C01 Practice — Day 7

Làm 10 câu này trước khi xem đáp án.

---

### Question 1

A company stores several terabytes of transaction data in Amazon S3 as CSV files.

Data scientists frequently query only a few columns by using Amazon Athena. Query cost and execution time are high.

Which solution is MOST appropriate?

**A.** Move data to DynamoDB
**B.** Convert CSV files to Parquet and partition the dataset
**C.** Move data to EBS
**D.** Compress CSV files into ZIP archives

---

### Question 2

A fraud detection model needs the latest account-risk features with very low latency for each real-time prediction.

Where should these features be stored?

**A.** SageMaker Feature Store offline store
**B.** S3 Glacier
**C.** SageMaker Feature Store online store
**D.** Glue Data Catalog

---

### Question 3

A company wants to train models using historical feature values from the previous two years.

Which option is MOST appropriate?

**A.** Feature Store online store
**B.** Feature Store offline store
**C.** ElastiCache
**D.** API Gateway

---

### Question 4

A data scientist wants a visual interface to clean data, encode categorical variables, perform ML-specific transformations, and then use the result with SageMaker.

Which service is MOST appropriate?

**A.** AWS Glue DataBrew
**B.** SageMaker Data Wrangler
**C.** Amazon Athena
**D.** AWS DMS

---

### Question 5

A team needs to validate the following requirements before training:

```text
customer_id must be unique
age cannot be NULL
age must be >= 18
```

Which solution BEST meets the requirement?

**A.** CloudTrail
**B.** Glue Data Quality with DQDL
**C.** SageMaker Feature Store online store
**D.** Amazon Kinesis Data Streams

---

### Question 6

A company is developing a sales forecasting model.

Dataset:

```text
January 2024 → July 2026
```

Which splitting strategy BEST reduces the risk of future information leaking into the training data?

**A.** Randomly shuffle all records
**B.** Put newer records in training and old records in testing
**C.** Use earlier dates for training and later dates for validation/test
**D.** Duplicate rare months before splitting

---

### Question 7

A model predicts whether employees will resign.

One input feature is:

```text
termination_date
```

This field is populated only after an employee leaves.

Training accuracy becomes almost 100%.

What is the MOST likely problem?

**A.** Underfitting
**B.** Class imbalance
**C.** Data leakage
**D.** Network latency

---

### Question 8

Applications generate a continuous stream of user-click events. Multiple independent applications must consume and process the same events in near real time.

Which service is MOST appropriate?

**A.** AWS Glue Data Catalog
**B.** Kinesis Data Streams
**C.** Amazon S3 Glacier
**D.** AWS DMS

---

### Question 9

A data lake contains millions of S3 objects. Analysts need SQL access to the data, and the schemas must be centrally discoverable.

Which combination should be used?

**A.** Athena + Glue Data Catalog
**B.** SageMaker Endpoint + DynamoDB
**C.** Kinesis + EFS
**D.** Lambda + EBS

---

### Question 10

A company has an ML training dataset where one demographic group represents 95% of samples and another group represents only 5%.

Which concept should the ML engineer investigate FIRST?

**A.** Endpoint latency
**B.** Class/facet imbalance
**C.** Model compression
**D.** Autoscaling

---

# 26. Answers

| Question | Answer |
| -------- | ------ |
| 1        | **B**  |
| 2        | **C**  |
| 3        | **B**  |
| 4        | **B**  |
| 5        | **B**  |
| 6        | **C**  |
| 7        | **C**  |
| 8        | **B**  |
| 9        | **A**  |
| 10       | **B**  |

---

# 27. Giải thích từng câu

### Q1 → B — Parquet + partitioning

Keyword:

```text
Athena
few columns
cost
large dataset
```

→ columnar format.

Parquet giúp Athena không phải scan những column không cần thiết.

---

### Q2 → C — Feature Store Online

Keyword:

```text
latest
low latency
real-time prediction
```

→ Online Store.

---

### Q3 → B — Feature Store Offline

Keyword:

```text
historical
two years
training
```

→ Offline Store.

---

### Q4 → B — Data Wrangler

Keyword:

```text
data scientist
ML
feature engineering
SageMaker
visual
```

→ Data Wrangler.

Nếu chỉ nói:

> business analyst wants visual data cleaning without writing code

thì DataBrew sẽ hấp dẫn hơn.

---

### Q5 → B — Glue Data Quality

Requirement toàn là:

```text
data quality rules
```

DQDL được dùng để define những rules này.

---

### Q6 → C — Chronological split

Forecasting là time-dependent.

Phải preserve:

```text
past → future
```

Ví dụ:

```text
Train
Jan 2024 ───────── Mar 2026

Validation
Apr ─ May 2026

Test
Jun ─ Jul 2026
```

---

### Q7 → C — Data leakage

`termination_date` tiết lộ trực tiếp outcome cần predict.

Accuracy cực cao bất thường cũng là clue.

---

### Q8 → B — Kinesis Data Streams

Clues:

```text
continuous
real time
multiple consumers
```

→ Kinesis Data Streams.

Nếu chỉ cần:

> automatically deliver stream into S3 with minimum administration

thì nghiêng về Firehose.

---

### Q9 → A — Athena + Glue Data Catalog

Mental model:

```text
S3 = data

Glue Catalog = schema

Athena = SQL
```

---

### Q10 → B — Class/facet imbalance

```text
95%
5%
```

là dấu hiệu rất rõ của imbalance.

Exam guide trực tiếp nêu **Class Imbalance (CI)** là một pre-training bias metric cần biết. ([AWS Documentation][1])

---

# 28. Week 1 final cheat sheet

Nếu chỉ được mang **một tờ giấy** vào phòng thi cho Week 1, mình sẽ ghi:

```text
S3
→ ML data lake

Parquet
→ columnar
→ Athena efficiency

Glue
→ ETL

Glue Catalog
→ metadata/schema

Crawler
→ discover schema

Athena
→ SQL on S3

Data Wrangler
→ ML data prep

DataBrew
→ visual/no-code general data prep

Glue Data Quality
→ data validation
→ DQDL

Kinesis Data Streams
→ real-time stream processing

Firehose
→ streaming delivery

MSK
→ Kafka

DMS
→ DB migration / CDC

Feature Store Online
→ latest feature
→ low latency
→ real-time inference

Feature Store Offline
→ history
→ S3
→ training / batch inference

Clarify
→ bias / explainability

Ground Truth
→ labeling

Train
→ learn

Validation
→ tune/select

Test
→ final evaluation

Time series
→ chronological split

Data leakage
→ future/target information leaks into training

Training-serving skew
→ preprocessing/features differ between training & production
```

---

## Day 7 checkpoint

Sau Week 1, bạn nên có thể nhìn architecture này và giải thích **từng arrow**:

```text
                        ┌───────────────┐
                        │ Data Sources  │
                        └───────┬───────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
              Batch                          Stream
                │                               │
          DMS / Glue                    Kinesis / MSK
                │                               │
                └──────────────┬────────────────┘
                               ↓
                              S3
                               │
                     Glue Catalog / Athena
                               │
                         Glue / Data Wrangler
                               │
                      Clean + Transform
                               │
                       Feature Engineering
                               │
                    ┌──────────┴──────────┐
                    ↓                     ↓
             Feature Store          S3 Training Data
             Offline/Online               │
                    │                     ↓
                    └────────────→ SageMaker
```

Nếu bạn có thể trả lời ngay:

> **Data đang ở đâu → ingest bằng gì → lưu ở đâu → clean thế nào → feature engineering thế nào → validate thế nào → đưa vào SageMaker ra sao?**

thì **Week 1 / Domain 1 foundation đã đạt mục tiêu**.

**Week 2 — Day 8** nên chuyển sang **Domain 2: ML Model Development**, bắt đầu từ phần quan trọng nhất: **supervised vs unsupervised → classification vs regression → chọn algorithm/model phù hợp → built-in SageMaker algorithms**, sau đó mới đi sâu training và tuning. ([AWS Documentation][6])

[1]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain1.html?utm_source=chatgpt.com "Content Domain 1: Data Preparation for Machine Learning (ML) - AWS Certified Machine Learning Engineer - Associate"
[2]: https://docs.aws.amazon.com/en_en/sagemaker/latest/dg/feature-store-security.html?utm_source=chatgpt.com "Security and access control - Amazon SageMaker AI"
[3]: https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store.html?utm_source=chatgpt.com "Create, store, and share features with Feature Store - Amazon SageMaker AI"
[4]: https://docs.aws.amazon.com/glue/latest/dg/dqdl.html?utm_source=chatgpt.com "Data Quality Definition Language (DQDL) reference - AWS Glue"
[5]: https://docs.aws.amazon.com/en_en/sagemaker/latest/dg/clarify-availability-change.html?utm_source=chatgpt.com "Clarify availability change - Amazon SageMaker AI"
[6]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain2.html?utm_source=chatgpt.com "Content Domain 2: ML Model Development - AWS Certified Machine Learning Engineer - Associate"
