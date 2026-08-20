Tiếp tục **Day 5 — SageMaker Data Wrangler**. Đây là ngày bạn gom gần như toàn bộ kiến thức Day 2–4 lại thành một workflow thực tế: **import data → inspect → clean → transform → feature engineering → analyze → export sang training pipeline**.

Mục tiêu cuối Day 5:

```text
Raw Data
   ↓
Import into Data Wrangler
   ↓
Profile / Explore
   ↓
Clean
   ↓
Transform
   ↓
Feature Engineering
   ↓
Analyze quality / leakage / bias
   ↓
Export
   ├── S3
   ├── Feature Store
   └── SageMaker Pipeline
```

# DAY 5 — SageMaker Data Wrangler

## Concept 1 — SageMaker Data Wrangler là gì?

SageMaker Data Wrangler là capability dùng để **chuẩn bị dữ liệu cho Machine Learning** bằng visual workflow, giảm lượng code cần viết.

Mental model:

```text
Data source
   ↓
Data Wrangler
   ↓
Prepare data visually
   ↓
ML-ready dataset
   ↓
SageMaker Training
```

Bạn có thể dùng nó cho:

```text
Missing values
Outliers
Encoding
Scaling
Feature engineering
Data analysis
Bias/leakage checks
Export
```

Điểm quan trọng nhất:

> **Data Wrangler là ML-oriented data preparation tool.**

---

# Ví dụ thực tế

Bạn muốn build churn prediction.

Data hiện ở:

```text
S3 customers.csv
RDS orders
```

Raw data:

```text
customer_id
DOB
country
salary
last_login
transactions
churn
```

Bạn muốn:

```text
DOB
→ Age

country
→ One-hot encode

salary
→ Standardize

last_login
→ days_since_last_login

transactions
→ avg_spend_30_days
```

Flow:

```text
S3 / RDS
   ↓
Data Wrangler
   ↓
Clean
   ↓
Feature Engineering
   ↓
Analyze
   ↓
training.parquet
   ↓
SageMaker Training
```

---

# Concept 2 — Data Wrangler Flow

Data Wrangler dùng concept **Flow**.

Flow là chuỗi các bước biến đổi dữ liệu.

Ví dụ:

```text
Dataset
   ↓
Remove duplicate rows
   ↓
Fill missing salary
   ↓
Normalize country values
   ↓
One-hot encode country
   ↓
Standardize salary
   ↓
Create age
   ↓
Drop unused columns
```

Thay vì bạn manually làm lại:

```python
df.drop_duplicates()
df.fillna(...)
...
```

Flow lưu lại logic transform.

---

# Mental model

```text
Input
  │
  ▼
Transform 1
  │
  ▼
Transform 2
  │
  ▼
Transform 3
  │
  ▼
Output
```

Nó rất giống:

> visual preprocessing pipeline.

---

# Exam signal

Nếu đề nói:

```text
repeatable
visual ML preprocessing
multiple transformation steps
```

→ nghĩ tới:

**Data Wrangler Flow**

---

# Concept 3 — Import Data

Trước khi clean, phải import data.

Data Wrangler có thể làm việc với nhiều data sources.

Exam-level bạn nên nghĩ tới:

```text
S3
Athena
Redshift
relational data sources
```

Một common workflow:

```text
S3
 ↓
Data Wrangler
```

hoặc:

```text
Data lake
 ↓
Athena query
 ↓
Data Wrangler
```

---

# Ví dụ thực tế

Bạn có:

```text
s3://company/raw/customers.csv
```

Import vào Data Wrangler:

```text
S3
 ↓
Data Wrangler
 ↓
Preview
```

Trước khi transform, bạn inspect:

```text
schema
sample rows
column types
missing values
```

---

# Exam trap

Nếu đề nói:

> Need to copy 20 TB into a local notebook manually before cleaning.

Đó không phải approach tối ưu.

Nếu yêu cầu:

```text
interactive ML data preparation
AWS managed solution
```

→ Data Wrangler.

---

# Concept 4 — Schema

Schema mô tả structure của dataset.

Ví dụ:

```text
customer_id → string
age         → integer
salary      → float
country     → string
churn       → integer
```

Nếu schema sai:

```text
salary = string
```

thay vì:

```text
salary = numeric
```

nhiều transformation/model sẽ gặp vấn đề.

---

# Ví dụ

Raw:

```text
salary
"3000"
"5000"
"7000"
```

Data Wrangler có thể convert:

```text
string
→ float
```

---

# Exam signal

```text
incorrect data type
convert column type
schema mismatch
```

→ type transformation.

---

# Concept 5 — Data Profiling

Data profiling = hiểu dataset trước khi transform.

Bạn cần biết:

```text
How many rows?
How many NULLs?
Unique values?
Min/max?
Mean?
Distribution?
Outliers?
```

Ví dụ:

```text
age:
min = 18
max = 999
mean = 41
```

Max = 999 đáng nghi.

---

# Mental model

```text
Don't transform blindly

Profile
   ↓
Understand problem
   ↓
Choose transformation
```

---

# Ví dụ

Country:

```text
VN        60%
US        20%
SG        10%
NULL       5%
Other      5%
```

Bạn có thể quyết định:

```text
NULL → Unknown
```

thay vì drop toàn bộ rows.

---

# Concept 6 — Transformations ⭐⭐⭐⭐⭐

Đây là core của Data Wrangler.

Các transformation bạn phải liên kết với Day 4:

```text
Missing value
→ Fill / Drop

Duplicate
→ Deduplicate

Categorical
→ Encode

Numeric scale
→ Normalize / Standardize

Skewed
→ Transform

Text/date
→ Parse / extract
```

---

# Ví dụ

Raw:

```text
country:
Vietnam
VN
viet nam
```

Transformation:

```text
Vietnam
VN
viet nam

↓

VN
VN
VN
```

---

# Concept 7 — Built-in Transforms

Data Wrangler có nhiều built-in transformations.

Exam không cần thuộc hết menu.

Quan trọng là hiểu categories:

```text
Manage columns
Handle missing values
Encode categorical
Scale numerical
Transform datetime
Transform text
Custom transformation
```

---

# Exam trap

Không cần nhớ:

> menu nằm ở đâu.

MLA test:

> solution nào phù hợp.

Không test UI clicks.

---

# Concept 8 — Custom Transform

Nếu built-in transform không đủ, bạn có thể dùng custom logic.

Mental:

```text
Built-in transformation enough?
   │
   ├── YES → use built-in
   │
   └── NO
        ↓
     custom code
```

---

# Ví dụ

Business-specific feature:

```text
customer_value_score =
monthly_spend * loyalty_factor
```

Nếu không có built-in transform phù hợp:

```text
custom transformation
```

---

# Exam trade-off

Nếu requirement:

> minimize custom code

thì ưu tiên:

```text
built-in transforms
```

Nếu:

> complex proprietary transformation

→ custom code có thể cần.

---

# Concept 9 — Handling Missing Data

Trong Data Wrangler, bạn có thể conceptually:

```text
Fill missing
Drop missing
Replace missing
```

Ví dụ:

```text
salary:
3000
NULL
5000
```

Could:

```text
NULL → median
```

---

# Exam trap

Data Wrangler là tool.

Nhưng **choice of transformation vẫn là ML decision**.

Data Wrangler không automatically biết business-correct imputation.

Bạn vẫn phải quyết định:

```text
mean?
median?
mode?
drop?
unknown category?
```

---

# Concept 10 — Encoding Categories

Ví dụ:

```text
plan:
Free
Standard
Premium
```

Nếu có natural business order:

```text
Free < Standard < Premium
```

ordinal encoding có thể hợp lý.

Nếu:

```text
browser:
Chrome
Safari
Firefox
```

không có order:

→ one-hot.

Data Wrangler giúp thực hiện encoding, nhưng exam vẫn test:

> loại encoding nào hợp lý?

---

# Concept 11 — Scaling

Data Wrangler có thể scale numerical features.

Recall Day 4:

```text
0–1
→ Normalization

mean 0 / std 1
→ Standardization
```

---

# Ví dụ

Dataset:

```text
age: 18–80
salary: 2,000–1,000,000
```

Bạn muốn model không bị magnitude chi phối.

Apply scaling.

---

# Exam trap

Tree-based algorithms không phải lúc nào cũng cần scaling như distance/gradient-based models.

Vì vậy đừng chọn scaling như universal rule.

---

# Concept 12 — Date/Time Transformations

Raw:

```text
2026-08-20 08:30:00
```

Có thể derive:

```text
hour = 8
day_of_week = Thursday
month = 8
is_weekend = false
```

Data Wrangler có thể hỗ trợ việc extract/transform date-time features.

---

# Ví dụ ML

Food delivery demand:

```text
timestamp
```

Raw timestamp có thể ít useful hơn:

```text
hour
weekday
weekend
holiday
```

---

# Concept 13 — Text Transformations

Text data có thể cần:

```text
lowercase
remove characters
tokenize
split
normalize
```

Ví dụ:

```text
" VIETNAM "
```

↓

```text
"vietnam"
```

---

# Concept 14 — Feature Engineering trong Data Wrangler

Data Wrangler không chỉ clean.

Đây là lý do nó thiên về ML.

Bạn có thể tạo:

```text
Raw:
signup_date

Feature:
account_age_days
```

Hoặc:

```text
Raw:
10 transactions

Features:
transaction_count
avg_order_value
total_spend
```

---

# Mental distinction

```text
Cleaning
→ fix bad data

Feature engineering
→ create better predictive information
```

Data Wrangler làm được cả hai.

---

# Concept 15 — Feature Selection

Sau transformation, bạn có thể có:

```text
200 columns
```

Không nhất thiết dùng hết.

Có thể remove:

```text
IDs
leaky features
highly correlated features
irrelevant columns
```

---

# Example

```text
customer_id
```

thường chỉ là identifier.

Nó không nhất thiết là useful model feature.

Có thể drop trước training.

---

# Exam trap — Identifier

Nếu model thấy:

```text
customer_id
transaction_id
order_id
```

đừng assume chúng predictive.

IDs thường:

```text
unique
high cardinality
little generalizable signal
```

---

# Concept 16 — Analysis trong Data Wrangler ⭐⭐⭐⭐⭐

Một điểm quan trọng của Data Wrangler là không chỉ transform mà còn **analyze data**.

Mental model:

```text
Transform
   +
Analyze
```

Có thể inspect:

```text
Distribution
Correlation
Data quality
Target leakage
Model-related insights
```

---

# Concept 17 — Histogram / Distribution

Ví dụ salary:

```text
frequency
  │
  │█████
  │███████
  │████
  │██
  │                          █
  └──────────────────────────── salary
```

Bạn thấy một extreme tail.

Could indicate:

```text
skew
outliers
```

---

# Why useful?

Before applying:

```text
log transform
```

hãy inspect distribution.

---

# Concept 18 — Correlation Analysis

Correlation giúp xem numerical features có relationship như thế nào.

Ví dụ:

```text
monthly_salary
annual_salary
```

correlation gần:

```text
1.0
```

Có thể redundant.

---

# Exam trap

Correlation:

```text
≠ causation
```

MLA không cần statistics deep, nhưng đừng hiểu rằng highly correlated means causal.

---

# Concept 19 — Multicollinearity

Nếu features strongly correlated:

```text
salary_monthly
salary_yearly
income_usd
```

model có thể nhận quá nhiều duplicated signal.

Data Wrangler analysis giúp phát hiện pattern kiểu này.

---

# Concept 20 — Target Leakage Analysis ⭐⭐⭐⭐⭐

Đây là một trong những phần quan trọng nhất.

Recall:

> feature chứa thông tin về target mà production không có tại prediction time.

Example:

```text
Target:
churn

Feature:
cancellation_date
```

Data Wrangler analyses có thể giúp identify suspicious feature relationships.

---

# Exam pattern

Question:

> Dataset has unexpectedly strong predictive feature and near-perfect validation performance.

Think:

```text
target leakage
```

---

# Mental question

Trước mỗi feature:

```text
Would this value exist
BEFORE prediction?
```

Nếu NO:

```text
potential leakage
```

---

# Concept 21 — Quick Model

Một useful idea của Data Wrangler là chạy quick baseline-type analysis/model để estimate predictive usefulness.

Mental model:

```text
Prepared data
   ↓
Quick evaluation
   ↓
Does data appear predictive?
```

Không phải final production model.

Nó giúp:

```text
validate feature preparation
detect weak features
identify potential issues
```

---

# Exam trap

Quick Model:

```text
≠ production model deployment
```

Nó là data-analysis aid.

---

# Concept 22 — Target Column

Để một số analyses/model-oriented checks hoạt động, bạn phải biết:

```text
target / label
```

Ví dụ:

```text
customer_age
spend
country
churn
```

Target:

```text
churn
```

---

# Concept 23 — Data Bias Analysis

Một dataset có thể bias trước training.

Example:

```text
Group A: 90%
Group B: 10%
```

hoặc:

```text
approval rate:
Group A = 80%
Group B = 35%
```

Data Wrangler có thể integrate ML preparation analyses, trong khi **SageMaker Clarify** là service/capability bạn đặc biệt liên kết với bias/explainability.

Mental distinction:

```text
Data Wrangler
→ prepare/analyze data

Clarify
→ bias + explainability
```

---

# Concept 24 — Data Wrangler vs Clarify

Đây là distinction tốt cho exam.

## Data Wrangler

```text
Prepare
Clean
Transform
Feature engineer
Analyze dataset
```

## Clarify

```text
Bias
Fairness
Explainability
SHAP-like analysis
```

Nếu đề nói:

> visually clean and prepare data

→ Data Wrangler.

Nếu:

> measure pre-training bias between demographic groups

→ Clarify.

---

# Concept 25 — Data Quality

Training-ready data phải đáp ứng quality rules.

Ví dụ:

```text
customer_id != NULL
age between 18–100
salary > 0
country valid
```

Data Wrangler giúp inspect/clean.

Nhưng nếu requirement nói:

> enforce reusable automated data quality rules in ETL pipelines

thì nghĩ thêm:

**AWS Glue Data Quality**.

---

# Data Wrangler vs Glue Data Quality

```text
Interactive ML data preparation
→ Data Wrangler

Automated reusable data quality rules
→ Glue Data Quality
```

---

# Concept 26 — Export

Sau khi flow hoàn tất:

```text
Data Wrangler
   ↓
Export
```

Bạn có nhiều destination/workflow options conceptually:

```text
S3
Feature Store
SageMaker processing/training pipeline
SageMaker Pipelines
```

Điểm exam:

> Data Wrangler không phải final storage.

Nó chuẩn bị data rồi export cho downstream ML.

---

# Concept 27 — Export to S3

Common:

```text
Data Wrangler
   ↓
processed dataset
   ↓
S3
   ↓
SageMaker Training
```

Example:

```text
s3://ml/processed/train.parquet
```

---

# Concept 28 — Export to Feature Store

Nếu prepared features cần reuse:

```text
Data Wrangler
   ↓
Feature Store
   ├── Training
   └── Realtime inference
```

Recall Day 2/Week 1:

```text
Offline Store
→ historical/training

Online Store
→ low-latency latest feature lookup
```

---

# Concept 29 — Export into ML Pipeline

Nếu transformation phải chạy repeatedly:

```text
new data arrives
   ↓
same preparation flow
   ↓
training
```

thì nên automate.

Mental:

```text
Data preparation
   ↓
SageMaker Pipeline
   ↓
Training
   ↓
Evaluation
```

---

# Exam signal

```text
repeatable
automated
production ML pipeline
```

→ don't manually click Data Wrangler every time.

Use generated/exported processing workflow / SageMaker Pipelines.

---

# Concept 30 — Interactive vs Production Processing

Đây là distinction cực kỳ quan trọng.

During exploration:

```text
Data Scientist
     ↓
Data Wrangler UI
     ↓
experiment with transformations
```

Production:

```text
Scheduled / pipeline
     ↓
automated processing
     ↓
same transformations
```

Mental:

```text
Interactive prep
→ Data Wrangler

Operational repeatability
→ export/integrate pipeline
```

---

# Exam Trap — Manual process in production

Nếu question nói:

> Data scientists currently manually run transformations every night and company needs reliability/repeatability.

Best answer thường không phải:

```text
keep clicking Data Wrangler
```

Mà:

```text
automate transformation flow/pipeline
```

---

# Concept 31 — Sampling for Exploration

Huge dataset:

```text
20 TB
```

Bạn không nhất thiết interactive-inspect all 20 TB at once.

Có thể use representative sample cho:

```text
EDA
transform design
quick analysis
```

Sau đó apply flow to full dataset in processing job/pipeline.

---

# Exam trap

Sample:

```text
must be representative
```

Nếu fraud is 0.1%, random tiny sample có thể không chứa fraud.

Need stratified/appropriate sampling.

---

# Concept 32 — Data Wrangler vs DataBrew ⭐⭐⭐⭐⭐

Đây là comparison rất có thể bị hỏi.

## Data Wrangler

Think:

```text
ML
SageMaker
feature engineering
training
```

## DataBrew

Think:

```text
general visual data preparation
business analyst
recipe
no-code cleaning
```

---

# Example A

> Data scientist needs visual feature engineering before SageMaker training.

→ **Data Wrangler**

---

# Example B

> Business analyst needs to clean CSV files with reusable no-code recipes.

→ **DataBrew**

---

# Mental shortcut

```text
ML-specific
→ Data Wrangler

General visual data prep
→ DataBrew
```

---

# Concept 33 — Data Wrangler vs Glue ⭐⭐⭐⭐⭐

## Data Wrangler

```text
interactive
ML-focused
visual
feature engineering
```

## Glue

```text
large-scale
automated ETL
multiple sources
serverless pipeline
```

---

# Example

```text
50 TB
RDS + S3 + DynamoDB
nightly transformation
```

→ Glue.

```text
data scientist visually preparing features
before training
```

→ Data Wrangler.

---

# Concept 34 — Data Wrangler vs SageMaker Processing

Mental model:

```text
Data Wrangler
→ design/prep transformations visually

SageMaker Processing
→ run data processing workloads/jobs
```

For production, a Data Wrangler flow may ultimately be operationalized through processing.

Exam may phrase:

```text
repeat Data Wrangler transformation on full dataset
```

Think:

> operational processing job/pipeline.

---

# Concept 35 — Data Wrangler is not Storage

Important distinction:

```text
Data Wrangler
≠ S3
```

Data Wrangler:

```text
prepare data
```

S3:

```text
store data
```

Architecture:

```text
S3
 ↓
Data Wrangler
 ↓
S3
```

Both before and after can be S3.

---

# Concept 36 — Data Wrangler is not Training

Another trap:

```text
Data Wrangler
≠ full model training service
```

Data preparation:

```text
Data Wrangler
```

Training:

```text
SageMaker Training Job
```

Pipeline:

```text
S3
 ↓
Data Wrangler / Processing
 ↓
Training Job
 ↓
Model
```

---

# End-to-End Example

Giả sử fraud detection.

Raw:

```text
S3 transactions.csv

transaction_id
customer_id
amount
country
timestamp
fraud
```

Problems:

```text
NULL country
skewed amount
duplicate rows
timestamp raw
country categorical
```

### Step 1 — Import

```text
S3
 ↓
Data Wrangler
```

### Step 2 — Profile

Detect:

```text
NULL = 3%
duplicates = 1%
amount highly skewed
```

### Step 3 — Clean

```text
remove duplicate transactions

country NULL
→ Unknown
```

### Step 4 — Feature engineering

```text
amount
→ log(amount)

country
→ one-hot

timestamp
→ hour
→ day_of_week
```

### Step 5 — Leakage check

Remove:

```text
post_fraud_investigation_status
```

if available only after fraud confirmed.

### Step 6 — Export

```text
Data Wrangler
 ↓
S3 processed/
 ↓
SageMaker Training
```

Potential production version:

```text
New transactions
      ↓
Processing Pipeline
      ↓
Training
```

---

# EXAM TRAPS — DAY 5

## Trap 1 — Data Wrangler vs DataBrew

```text
ML features + SageMaker
→ Data Wrangler

general visual cleaning
→ DataBrew
```

---

## Trap 2 — Data Wrangler vs Glue

```text
interactive ML prep
→ Data Wrangler

large automated ETL
→ Glue
```

---

## Trap 3 — Data Wrangler vs Clarify

```text
clean/transform
→ Data Wrangler

bias/explainability
→ Clarify
```

---

## Trap 4 — Data Wrangler vs Feature Store

```text
create features
→ Data Wrangler

store/reuse features
→ Feature Store
```

---

## Trap 5 — Data Wrangler vs Training

```text
prepare data
→ Data Wrangler

train model
→ SageMaker Training
```

---

## Trap 6 — Visual tool doesn't replace ML reasoning

Data Wrangler can execute:

```text
mean imputation
median imputation
```

But tool doesn't make:

```text
business-correct choice automatically
```

You still need to understand the data.

---

## Trap 7 — Sample vs Full Dataset

Interactive sample:

```text
good for EDA
```

not necessarily:

```text
final production dataset
```

Need apply final transform to full data.

---

## Trap 8 — Leakage

Near-perfect score after feature engineering?

Check:

```text
target leakage
```

before celebrating.

---

## Trap 9 — Manual pipeline

Repeated production preprocessing should be:

```text
automated
```

not manually rerun.

---

## Trap 10 — Drop all IDs automatically

Identifier may be useless, but not always.

Example:

```text
device_id
```

could encode a business category indirectly, but often it is high cardinality and poor generalization.

Need context.

---

# Decision Tree — Tool Selection

```text
Need data preparation
       │
       ▼
Is this ML-focused interactive preparation?
       │
      YES
       ↓
Data Wrangler
       │
      NO
       ▼
General visual no-code prep?
       │
      YES
       ↓
DataBrew
       │
      NO
       ▼
Large-scale automated ETL?
       │
      YES
       ↓
Glue
```

---

# Decision Tree — Data Wrangler Workflow

```text
Import
  ↓
Profile
  ↓
Problems?
  │
  ├── Missing
  │      ↓
  │   Impute / Drop
  │
  ├── Duplicate
  │      ↓
  │   Deduplicate
  │
  ├── Numeric scale
  │      ↓
  │   Normalize / Standardize
  │
  ├── Categorical
  │      ↓
  │   Encode
  │
  └── Raw date/text
         ↓
      Transform
  ↓
Feature Engineering
  ↓
Analyze
  ↓
Check Leakage/Bias
  ↓
Export
```

---

# Keyword → Answer Cheat Sheet

```text
visual ML preprocessing
→ Data Wrangler

SageMaker feature engineering
→ Data Wrangler

reusable transformation flow
→ Data Wrangler Flow

general visual data cleaning
→ DataBrew

ETL at scale
→ Glue

bias measurement
→ Clarify

reuse ML features
→ Feature Store

training job
→ SageMaker Training

production repeatability
→ SageMaker Pipelines / Processing

target leakage
→ feature contains future/target info
```

---

# 10 câu Practice MLA-C01 — Day 5

Làm trước khi xem đáp án.

## Question 1

A data scientist needs to visually clean missing values, encode categorical columns, and create ML features before training a SageMaker model.

Which capability is MOST appropriate?

A. AWS Glue Data Catalog
B. SageMaker Data Wrangler
C. AWS CloudTrail
D. Amazon ECR

---

## Question 2

A business analyst needs a no-code visual tool to clean CSV datasets using reusable transformation recipes. The workflow is not specifically tied to machine learning.

Which service is the BEST fit?

A. SageMaker Data Wrangler
B. AWS Glue DataBrew
C. SageMaker Training
D. Amazon Kinesis

---

## Question 3

A company needs to join 40 TB of data from RDS and S3 every night and write transformed Parquet files back to S3. The company wants minimal infrastructure management.

Which service is MOST appropriate?

A. Data Wrangler interactive session
B. AWS Glue
C. CloudTrail
D. SageMaker Endpoint

---

## Question 4

A Data Wrangler flow creates a feature named `cancellation_date` for a model that predicts customer churn before cancellation happens.

What is the MAIN concern?

A. High availability
B. Target leakage
C. High IOPS
D. Network latency

---

## Question 5

A Data Wrangler analysis shows that `monthly_salary` and `annual_salary` have an extremely high correlation.

What should the engineer investigate?

A. Whether the features contain redundant information
B. Whether S3 is encrypted
C. Whether Kinesis has enough shards
D. Whether the model needs async inference

---

## Question 6

A data scientist finishes creating a set of customer features. Multiple models need to reuse the same features, and some real-time applications need low-latency access to the latest values.

Where should the features be stored?

A. SageMaker Feature Store
B. CloudTrail
C. EBS only
D. Route 53

---

## Question 7

A team uses Data Wrangler interactively to design transformations. New training data arrives every day, and the exact transformations must run automatically before retraining.

What is the BEST next step?

A. Ask an engineer to manually repeat the transformations each day
B. Operationalize the transformations in an automated processing/pipeline workflow
C. Store screenshots of the Data Wrangler flow
D. Move all data into RDS and stop preprocessing

---

## Question 8

A company needs to measure pre-training bias between two demographic groups.

Which AWS capability should the team primarily consider?

A. SageMaker Clarify
B. Amazon ECR
C. EBS Provisioned IOPS
D. CloudFormation

---

## Question 9

Which TWO statements are correct?

A. Data Wrangler is primarily used for ML-oriented data preparation.
B. Data Wrangler is an object storage service.
C. DataBrew is useful for general visual data preparation.
D. SageMaker Feature Store trains ML models.
E. CloudTrail performs feature engineering.

---

## Question 10 — Harder

A data scientist imports customer data into Data Wrangler. The dataset contains missing income values, categorical countries, a highly skewed purchase amount, and a cancellation timestamp that is only created after a customer churns.

Which FOUR actions are appropriate before model training?

A. Impute missing income values using an appropriate strategy
B. Encode the country feature
C. Consider transforming the highly skewed purchase amount
D. Keep the cancellation timestamp because it improves validation accuracy
E. Remove or exclude the cancellation timestamp to avoid leakage

---

# Đáp án

```text
Q1  → B
Q2  → B
Q3  → B
Q4  → B
Q5  → A
Q6  → A
Q7  → B
Q8  → A
Q9  → A + C
Q10 → A + B + C + E
```

---

# Giải thích

## Q1 → Data Wrangler

Signals:

```text
visual
clean
encode
feature engineering
SageMaker
```

→ Data Wrangler.

---

## Q2 → DataBrew

Signals:

```text
business analyst
general data preparation
visual
recipe
```

→ DataBrew.

---

## Q3 → Glue

Signals:

```text
40 TB
nightly
RDS + S3
ETL
automated
```

→ Glue.

Data Wrangler is more interactive/preparation-oriented.

---

## Q4 → Target Leakage

If:

```text
cancellation_date
```

doesn't exist until churn already happened:

```text
future/target information
```

→ leakage.

---

## Q5 → Redundancy / Multicollinearity

```text
monthly_salary
annual_salary
```

likely encode same information.

Need investigate feature redundancy.

---

## Q6 → Feature Store

Requirement:

```text
reuse features
+
real-time latest values
```

→ Feature Store, particularly online-store behavior for low-latency access.

---

## Q7 → Automated Pipeline

Interactive exploration:

```text
good initially
```

Daily production:

```text
automate
```

Use processing/pipeline workflow.

---

## Q8 → Clarify

Requirement:

```text
pre-training bias
```

→ SageMaker Clarify.

---

## Q9 → A + C

```text
Data Wrangler
→ ML preparation

DataBrew
→ general visual preparation
```

Data Wrangler is not storage.

Feature Store doesn't train model.

---

## Q10 → A + B + C + E

Good:

```text
Missing
→ impute

Country
→ encode

Skew
→ transform

Cancellation timestamp
→ remove
```

Keeping cancellation timestamp is leakage.

---

# 5 câu tự reasoning nâng cao

### Scenario A

```text
Data scientist wants to inspect
5 GB sample visually
and develop transformations
```

Think:

```text
Data Wrangler
```

---

### Scenario B

```text
Transform must run on
20 TB every night
```

Think:

```text
operationalize with Glue /
Processing / pipeline
```

not manual interactive workflow.

---

### Scenario C

```text
Dataset has:
approval_result_after_manual_review
```

Goal:

```text
predict approval before review
```

Think:

```text
target leakage
```

---

### Scenario D

```text
Features need both:
historical training
+
real-time lookup
```

Think:

```text
Feature Store
Offline + Online
```

---

### Scenario E

```text
Need fairness metric
between demographic groups
```

Think:

```text
Clarify
```

---

# Wrong Answer Log mẫu

Nếu nhầm Data Wrangler với Glue:

```text
Question:
Data scientist wants interactive visual
feature engineering before SageMaker training.

My answer:
Glue

Correct:
Data Wrangler

Why:
Glue can transform data,
but the requirement emphasized
interactive ML-focused preparation.

Decision rule:

Interactive ML prep
→ Data Wrangler

Large automated ETL
→ Glue
```

Nếu nhầm Data Wrangler với Feature Store:

```text
Question:
Multiple models need to reuse
the same engineered features.

My answer:
Data Wrangler

Correct:
Feature Store

Why:
Data Wrangler CREATES/PREPARES features.
Feature Store STORES/SERVES features.

Decision rule:

Prepare
→ Data Wrangler

Reuse/store
→ Feature Store
```

---

# Final Cheat Sheet — Day 5

```text
                DATA WRANGLER

                Data Source
                    ↓
                  Import
                    ↓
                 Profile
                    ↓
                  Clean
       ┌────────────┼────────────┐
       │            │            │
    Missing      Duplicate     Outlier
       │            │            │
    Impute       Remove        Handle
                    ↓
                Transform
       ┌────────────┼─────────────┐
       │            │             │
     Encode       Scale       Date/Text
       │            │             │
       └────────────┴─────────────┘
                    ↓
             Feature Engineering
                    ↓
                 Analyze
       ┌────────────┼──────────────┐
       │            │              │
 Correlation     Leakage          Bias
                    ↓
                  Export
          ┌─────────┼─────────┐
          ▼         ▼         ▼
         S3      Feature    Pipeline
                   Store
```

Và comparison quan trọng nhất:

| Requirement                | Service                 |
| -------------------------- | ----------------------- |
| ML visual preparation      | **Data Wrangler**       |
| General visual cleaning    | **DataBrew**            |
| Large-scale ETL            | **Glue**                |
| Bias / explainability      | **Clarify**             |
| Store reusable ML features | **Feature Store**       |
| Train model                | **SageMaker Training**  |
| Automate ML workflow       | **SageMaker Pipelines** |

## Checklist hoàn thành Day 5

Bạn nên trả lời được:

* Data Wrangler dùng để làm gì?
* Data Wrangler Flow là gì?
* Import và profiling để làm gì?
* Built-in transform khác custom transform thế nào?
* Data Wrangler xử lý missing/category/numeric/date thế nào?
* Data cleaning khác feature engineering thế nào?
* Correlation analysis dùng để làm gì?
* Target leakage là gì?
* Data Wrangler khác Clarify thế nào?
* Data Wrangler khác DataBrew thế nào?
* Data Wrangler khác Glue thế nào?
* Data Wrangler khác Feature Store thế nào?
* Feature Store Online/Offline phục vụ gì?
* Khi nào interactive Data Wrangler flow cần operationalize?
* Vì sao không nên manually rerun transformations trong production?

Nếu bạn làm được **8/10 trở lên**, Day 5 đã ổn. **Day 6 tiếp theo nên là Data Wrangler vs DataBrew + Feature Store + Data Quality**, tập trung mạnh vào các comparison question rất dễ xuất hiện trong MLA-C01: `Data Wrangler vs DataBrew vs Glue`, `Online vs Offline Feature Store`, `Glue Data Quality`, `Clarify bias metrics`, và các exam traps chọn service.
