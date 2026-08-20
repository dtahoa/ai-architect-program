Tiếp tục **Day 4 — Data Cleaning & Feature Engineering**. Đây là một trong những phần quan trọng nhất của Week 1 vì câu hỏi MLA thường không chỉ hỏi “service nào”, mà đưa một dataset có vấn đề và hỏi **cần transform gì trước khi training**.

Mục tiêu cuối Day 4:

```text
Raw Data
   ↓
Identify problems
   ↓
Clean
   ↓
Transform
   ↓
Create useful features
   ↓
Prevent leakage / imbalance issues
   ↓
Training-ready dataset
```

# DAY 4 — Data Cleaning & Feature Engineering

## Concept 1 — Data Cleaning là gì?

Data cleaning là quá trình xử lý các vấn đề trong raw data trước khi đưa vào model.

Ví dụ:

```text
customer_id | age  | salary | country | churn
------------------------------------------------
001         | 25   | 3000   | VN      | 0
002         | NULL | 5000   | US      | 1
003         | 999  | 4000   | VN      | 0
003         | 999  | 4000   | VN      | 0
004         | 31   | NULL   | "Viet Nam" | 1
```

Có ít nhất:

```text
NULL
→ Missing value

age = 999
→ Outlier / invalid value

row 003 duplicated
→ Duplicate

VN vs Viet Nam
→ inconsistent category
```

Data cleaning nhằm biến thành:

```text
consistent
valid
usable
less noisy
```

---

# Concept 2 — Missing Values ⭐⭐⭐⭐⭐

Missing value là dữ liệu bị thiếu:

```text
salary = NULL
```

hoặc:

```text
salary = NaN
```

## Các cách xử lý

### Option 1 — Remove row

Ví dụ:

```text
100,000 rows
10 rows missing
```

Có thể delete 10 rows nếu không quan trọng.

---

### Option 2 — Remove feature/column

Nếu column:

```text
secondary_phone
```

có:

```text
95% missing
```

và không quan trọng với model, có thể drop feature.

---

### Option 3 — Imputation

**Imputation = thay missing value bằng giá trị hợp lý.**

Ví dụ:

```text
salary:

3000
4000
NULL
5000
```

Có thể:

```text
NULL → mean
```

hoặc:

```text
NULL → median
```

---

# Mean vs Median

Ví dụ:

```text
salary:

3000
3200
3300
3400
100000
NULL
```

Mean bị ảnh hưởng mạnh bởi:

```text
100000
```

Median ít bị ảnh hưởng.

Mental rule:

```text
Data roughly symmetric
→ Mean can work

Data has strong outliers/skew
→ Median often safer
```

---

# Categorical imputation

Ví dụ:

```text
country:

VN
VN
US
NULL
VN
```

Có thể dùng:

```text
mode
```

tức giá trị xuất hiện nhiều nhất.

Hoặc category riêng:

```text
Unknown
```

---

# Exam trap — NULL không tự động delete

Nếu đề hỏi:

> Dataset contains 15% missing values.

Không thể kết luận ngay:

```text
remove all rows
```

Cần nghĩ:

```text
How much data?
Which feature?
Why missing?
Can we impute?
Would deleting introduce bias?
```

---

# AWS Service

Trong SageMaker workflow, **Data Wrangler** rất phù hợp để:

```text
detect missing values
fill missing values
drop rows/columns
apply transformations
```

Mental:

```text
Visual ML data cleaning
→ SageMaker Data Wrangler
```

---

# Concept 3 — Outliers ⭐⭐⭐⭐⭐

Outlier là observation khác biệt đáng kể so với phần lớn data.

Ví dụ:

```text
Age:

21
32
40
29
999
```

999 rõ ràng suspicious.

Nhưng:

```text
Salary:

3000
5000
7000
500000
```

500000 có thể:

```text
real CEO salary
```

hoặc:

```text
bad data
```

Đừng assume mọi extreme value đều sai.

---

# Các cách xử lý outlier

Có thể:

```text
remove
cap
transform
replace
investigate
```

### Capping

Ví dụ:

```text
salary > 99th percentile
```

đưa về:

```text
99th percentile value
```

---

### Log transform

Nếu feature có distribution:

```text
100
200
300
500
100000
```

có thể:

```text
log(x)
```

để compress range.

---

# Exam trap

Question:

> One numeric feature is highly right-skewed because of a small number of very large values.

Potential answer:

```text
log transformation
```

Không phải lúc nào cũng delete outliers.

---

# Concept 4 — Duplicate Data

Ví dụ:

```text
customer_id | transaction
123         | 100
123         | 100
```

Nếu đây là accidental duplication:

```text
same transaction counted twice
```

thì training data bị distort.

---

# Vì sao duplicate nguy hiểm?

Giả sử một fraud transaction accidentally appears 20 lần:

```text
model sees this pattern 20x
```

Nó có thể overweight pattern đó.

Mental:

```text
Duplicate
→ sample gets excessive influence
```

---

# Exam signal

```text
same record repeated
duplicate IDs
duplicated rows
```

→ deduplication.

---

# Concept 5 — Inconsistent Data

Ví dụ category:

```text
VN
Vietnam
Viet Nam
VIETNAM
```

Model có thể xem thành:

```text
4 different categories
```

trong khi business meaning giống nhau.

Need normalization:

```text
VN
```

---

# Ví dụ khác

Date:

```text
20/08/2026
2026-08-20
Aug 20 2026
```

Need consistent date format.

---

# Mental rule

```text
Same meaning
different representation
→ standardize/normalize representation
```

---

# Concept 6 — Feature Engineering ⭐⭐⭐⭐⭐

Feature engineering là:

> biến raw data thành representation hữu ích hơn cho model.

Ví dụ raw:

```text
date_of_birth = 1990-05-02
```

Có thể derive:

```text
age = 36
```

Age có thể useful hơn DOB.

---

# Ví dụ Customer Churn

Raw:

```text
customer_id
signup_date
transactions
last_login
country
```

Feature engineering:

```text
account_age_days

days_since_last_login

transactions_last_30_days

avg_order_value

total_spend

country_encoded
```

Model dùng:

```text
features
```

không nhất thiết dùng raw source fields.

---

# Feature vs Label

Ví dụ churn prediction:

```text
FEATURES

age
country
avg_spend
login_count
days_since_last_login

         ↓

       MODEL

         ↓

LABEL

churn = 0 / 1
```

Label còn gọi:

```text
target
```

---

# Concept 7 — Numerical vs Categorical Features

## Numerical

```text
age = 30

salary = 5000

transactions = 20
```

## Categorical

```text
country = VN

plan = Premium

device = Mobile
```

Cách preprocessing thường khác nhau.

---

# Concept 8 — Scaling ⭐⭐⭐⭐⭐

Giả sử:

```text
Age:
18–80

Salary:
1,000–1,000,000
```

Magnitude rất khác.

Một số ML algorithms nhạy với scale.

Scaling nhằm:

```text
put features on comparable scales
```

---

# Concept 9 — Normalization ⭐⭐⭐⭐⭐

Normalization thường đưa values vào một range.

Ví dụ Min-Max:

```text
10
20
30
40
```

↓

```text
0
0.33
0.67
1
```

Formula conceptually:

```text
x' = (x - min) / (max - min)
```

Result thường:

```text
0 → 1
```

---

# Khi nào nghĩ tới normalization?

Exam keywords:

```text
bounded range
0 to 1
rescale
min-max
```

→ normalization.

---

# Concept 10 — Standardization ⭐⭐⭐⭐⭐

Standardization thường biến feature về:

```text
mean ≈ 0
standard deviation ≈ 1
```

Formula:

```text
z = (x - mean) / standard deviation
```

Ví dụ:

```text
Salary:
3000
4000
5000
```

sau standardization có thể thành:

```text
-1.22
0
1.22
```

---

# Normalization vs Standardization

Đây là comparison phải thuộc:

|                       | Normalization | Standardization          |
| --------------------- | ------------- | ------------------------ |
| Typical result        | bounded range | mean 0, std 1            |
| Common technique      | Min-Max       | Z-score                  |
| Sensitive to outliers | khá sensitive | cũng có thể bị ảnh hưởng |
| Keyword               | `0–1`         | `mean=0/std=1`           |

Exam shortcut:

```text
Need 0–1 range
→ Normalization

Need zero mean/unit variance
→ Standardization
```

---

# Exam trap

**Standardization không có nghĩa chuẩn hóa text/category name.**

Trong ML exam:

```text
standardization
```

thường nói về numerical scaling.

---

# Concept 11 — Encoding Categorical Features ⭐⭐⭐⭐⭐

Model thường cần numeric representation.

Ví dụ:

```text
country:

VN
US
SG
```

Không thể luôn đưa raw strings vào traditional ML algorithm.

Cần:

```text
encoding
```

---

# Concept 12 — Label Encoding

Ví dụ:

```text
Low    → 0
Medium → 1
High   → 2
```

Có natural order:

```text
Low < Medium < High
```

nên numeric mapping có meaning.

---

# Exam trap

Country:

```text
VN → 0
US → 1
SG → 2
```

Model có thể infer:

```text
SG > US > VN
```

dù relationship này không tồn tại.

Với **nominal category**, one-hot encoding thường an toàn hơn.

---

# Concept 13 — One-Hot Encoding ⭐⭐⭐⭐⭐

Input:

```text
Country
VN
US
SG
```

Output:

```text
country_VN | country_US | country_SG
------------------------------------
1          | 0          | 0
0          | 1          | 0
0          | 0          | 1
```

Không tạo ordering giả.

---

# Khi nào dùng one-hot?

```text
categorical
no natural ordering
small/moderate number of categories
```

Ví dụ:

```text
country
browser
payment_method
```

---

# Problem — High Cardinality

Nếu có:

```text
100,000 product IDs
```

one-hot có thể tạo:

```text
100,000 columns
```

Đây gọi là high cardinality problem.

Exam có thể muốn alternative:

```text
embedding
hashing
other encoding strategy
```

Ở MLA-C01, hiểu vấn đề quan trọng hơn học thuật toán sâu.

---

# Concept 14 — Ordinal vs Nominal

Đây là distinction giúp chọn encoding.

## Ordinal

Có order:

```text
Small
Medium
Large
```

hoặc:

```text
Beginner
Intermediate
Advanced
```

Có thể label/ordinal encoding.

---

## Nominal

Không có order:

```text
VN
US
Japan
```

hoặc:

```text
Chrome
Safari
Firefox
```

One-hot thường hợp lý.

Mental:

```text
Has meaningful order
→ ordinal encoding possible

No meaningful order
→ one-hot
```

---

# Concept 15 — Binning ⭐⭐⭐⭐

Binning biến continuous numerical values thành categories/ranges.

Ví dụ:

```text
age = 24
age = 42
age = 67
```

↓

```text
18–30
31–50
51+
```

---

# Ví dụ business

Raw:

```text
purchase_count = 47
```

Feature:

```text
purchase_frequency = "high"
```

---

# Vì sao bin?

Có thể:

```text
reduce noise
capture non-linear relationships
simplify features
```

Nhưng sẽ mất thông tin chi tiết.

---

# Exam trap

Nếu model cần exact continuous information, binning không phải tự động tốt hơn.

Binning là transformation **có trade-off**.

---

# Concept 16 — Log Transformation ⭐⭐⭐⭐

Giả sử:

```text
Revenue:

100
200
300
500
1000000
```

Highly skewed.

Apply:

```text
log(revenue)
```

Distribution có thể bớt skew.

Mental:

```text
Strong right-skew
large numeric range
→ Log transformation
```

---

# Khi nào không dùng?

Values:

```text
0
negative
```

cần xử lý carefully vì log standard không defined cho ≤0.

Exam thường ở conceptual level, không cần toán sâu.

---

# Concept 17 — Date/Time Feature Engineering

Raw:

```text
2026-08-20 08:35:00
```

Có thể derive:

```text
hour = 8

day_of_week = Thursday

month = 8

is_weekend = false
```

Tại sao useful?

Ví dụ e-commerce:

```text
customers purchase more on weekend
```

Raw timestamp không thể hiện relationship dễ bằng feature:

```text
is_weekend
```

---

# Concept 18 — Aggregated Features

Raw transactions:

```text
Customer A:

$10
$30
$20
$100
```

Feature:

```text
total_spend = $160

avg_spend = $40

transaction_count = 4
```

Đây là feature engineering rất phổ biến.

---

# Example

Churn model:

```text
Raw transactions
        ↓
Aggregate
        ↓
avg_spend_30_days

login_count_7_days

days_since_last_purchase
```

Những features này thường predictive hơn raw rows.

---

# Concept 19 — Interaction Features

Có thể combine features:

```text
height
weight
```

↓

```text
BMI
```

hoặc:

```text
total_spend / months_active
```

↓

```text
monthly_average_spend
```

Interaction/derived feature giúp model thấy relationship tốt hơn.

---

# Concept 20 — Feature Selection ⭐⭐⭐⭐

Không phải feature nào có cũng nên đưa vào model.

Giả sử 500 columns nhưng nhiều feature:

```text
irrelevant
duplicate
highly correlated
noisy
```

Có thể:

```text
remove unnecessary features
```

Mục tiêu:

```text
simpler model
less overfitting
faster training
better interpretability
```

---

# Concept 21 — Correlation

Ví dụ:

```text
salary_usd
salary_vnd
```

hai features gần như encode cùng information.

Nếu model có quá nhiều highly correlated features, có thể:

```text
redundancy
instability in some models
```

Feature selection có thể remove một feature.

---

# Concept 22 — Multicollinearity

Multicollinearity xảy ra khi predictor features có correlation rất cao.

Ví dụ:

```text
annual_salary
monthly_salary
```

Vì:

```text
annual_salary ≈ monthly_salary × 12
```

nên gần như cùng information.

MLA không cần học statistics sâu, nhưng Data Wrangler analyses có thể giúp identify correlation/multicollinearity.

---

# Concept 23 — Target Leakage ⭐⭐⭐⭐⭐

Đây là **exam concept cực kỳ quan trọng**.

Target leakage xảy ra khi training data chứa information mà trong production **không tồn tại tại thời điểm prediction**, hoặc feature vô tình reveal target.

---

# Ví dụ 1 — Churn

Goal:

```text
Predict whether customer will cancel.
```

Feature:

```text
cancellation_date
```

Nếu customer đã cancel thì cancellation_date tồn tại.

Model:

```text
cancellation_date exists
→ churn = YES
```

Accuracy:

```text
99.9%
```

nhưng model vô dụng.

---

# Ví dụ 2 — Loan default

Goal:

```text
Predict whether loan will default.
```

Feature:

```text
debt_collection_started
```

Collection xảy ra sau default.

→ leakage.

---

# Mental rule

```text
Would this feature be known
at prediction time?
```

Nếu:

```text
NO
```

có nguy cơ target leakage.

---

# Exam trap

Question nói:

> Validation accuracy is unexpectedly near 100%.

Một possible reason:

```text
target leakage
```

đặc biệt nếu feature chứa outcome/future information.

---

# Concept 24 — Train/Test Leakage

Một dạng leakage khác:

Bạn preprocessing toàn dataset trước khi split.

Ví dụ:

```text
Entire dataset
      ↓
calculate mean
      ↓
standardize
      ↓
train/test split
```

Mean đã sử dụng:

```text
test data
```

→ information leakage.

Safer:

```text
Train/test split
      ↓
calculate transformation using TRAIN
      ↓
apply same transformation to test
```

---

# Concept 25 — Class Imbalance ⭐⭐⭐⭐⭐

Ví dụ fraud:

```text
99,000 normal
1,000 fraud
```

Model luôn predict:

```text
NORMAL
```

Accuracy:

```text
99%
```

nhưng fraud detection:

```text
0%
```

Đây là lý do **accuracy có thể misleading**.

---

# Class imbalance khác outlier

Outlier:

```text
individual extreme samples
```

Class imbalance:

```text
one target class far more common
```

Ví dụ:

```text
fraud 1%
normal 99%
```

---

# Các cách xử lý class imbalance

## Oversampling minority

```text
Fraud:
1,000
 ↓
resample
 ↓
10,000
```

---

## Undersampling majority

```text
Normal:
99,000
 ↓
sample
 ↓
10,000
```

---

## Synthetic samples

Generate additional minority examples.

Concept phổ biến:

```text
SMOTE-like strategies
```

Không cần algorithm detail sâu.

---

## Class weights

Tell model:

```text
Fraud errors
→ more expensive
```

Model penalizes minority mistakes more.

---

# Exam trap

Nếu dataset:

```text
99% negative
1% positive
```

và question nói:

> Model accuracy is 99% but fails to detect positives.

Root issue:

```text
class imbalance
+
accuracy unsuitable alone
```

Metric sẽ được học sâu Day 9, nhưng ở Day 4 bạn cần thấy problem.

---

# Concept 26 — Data Augmentation

Data augmentation tạo thêm samples thông qua transformations.

Ví dụ images:

```text
Original
  │
  ├── rotate
  ├── crop
  ├── flip
  └── brightness adjustment
```

Purpose:

```text
increase data diversity
reduce overfitting
```

---

# Text example

Có thể:

```text
paraphrase
synonym replacement
```

nhưng phải cẩn thận giữ nguyên label/meaning.

---

# Concept 27 — Sampling

Dataset:

```text
1 billion rows
```

Bạn có thể dùng:

```text
representative sample
```

để:

```text
EDA
prototype
experiment quickly
```

Nhưng sample cần:

```text
representative
```

không biased.

---

# Random Sampling

Random:

```text
pick observations randomly
```

---

# Stratified Sampling

Nếu target:

```text
90% A
10% B
```

stratified sampling giữ tỷ lệ:

```text
90/10
```

trong subsets.

Rất useful với classification.

---

# Concept 28 — Train / Validation / Test Split

Sau cleaning:

```text
Dataset
   │
   ├── Training
   │
   ├── Validation
   │
   └── Test
```

## Training

Model học parameters.

---

## Validation

Dùng để:

```text
choose model
tune hyperparameters
compare experiments
```

---

## Test

Chỉ dùng cuối để estimate real performance.

Mental:

```text
Train
→ Learn

Validation
→ Tune

Test
→ Final exam
```

---

# Exam trap

Nếu continuously tune model based on test performance:

```text
test set stops being unbiased
```

Bạn đã indirectly overfit test set.

---

# Concept 29 — Shuffling

Giả sử dataset sorted:

```text
first 50k
→ churn=0

last 10k
→ churn=1
```

Nếu split sequentially:

```text
train
→ mostly 0

test
→ mostly 1
```

bad.

Shuffle:

```text
0,1,0,0,1,0,1...
```

rồi split.

---

# Exception — Time Series

Đừng random shuffle blindly trong time-series prediction.

Ví dụ:

```text
Train:
2023–2025

Test:
2026
```

Nếu shuffle future records vào training:

```text
future leakage
```

Exam trap:

```text
time-series
→ preserve chronological ordering
```

---

# Concept 30 — Data Wrangler ⭐⭐⭐⭐⭐

Day 4 service quan trọng nhất:

> **SageMaker Data Wrangler**

Mental workflow:

```text
S3 / source
   ↓
Data Wrangler
   ↓
missing values
   ↓
outliers
   ↓
encode
   ↓
scale
   ↓
feature engineering
   ↓
analysis
   ↓
training data
```

Use when requirement says:

```text
ML-focused
visual
data preparation
SageMaker
feature engineering
```

---

# Concept 31 — DataBrew

DataBrew cũng có thể:

```text
clean
normalize
transform
profile
```

Nhưng mental distinction:

```text
ML workflow + feature engineering
→ Data Wrangler

General no-code visual data preparation
→ DataBrew
```

---

# Concept 32 — Glue

Glue phù hợp hơn khi:

```text
large-scale ETL
many sources
automated batch processing
```

Ví dụ:

```text
RDS + S3 + DynamoDB
     ↓
    Glue
     ↓
clean/join/transform
```

---

# Data Wrangler vs DataBrew vs Glue

| Requirement                       | Think             |
| --------------------------------- | ----------------- |
| Visual ML prep                    | **Data Wrangler** |
| Feature engineering for SageMaker | **Data Wrangler** |
| General visual cleaning           | **DataBrew**      |
| Recipe-based transformation       | **DataBrew**      |
| Large-scale serverless ETL        | **Glue**          |
| Merge multiple sources            | **Glue**          |

---

# Concept 33 — Data Cleaning vs Feature Engineering

Đây là distinction cần rõ.

## Data Cleaning

Fix problems.

```text
NULL
duplicate
invalid values
inconsistent categories
```

---

## Feature Engineering

Create better representation.

```text
DOB
→ age

timestamp
→ hour

transactions
→ average_spend

country
→ one-hot
```

Mental:

```text
Cleaning
→ make data correct

Feature Engineering
→ make data useful
```

---

# Full Example — Customer Churn

Raw:

```text
customer_id
DOB
country
transactions
last_login
churn
```

Problems:

```text
DOB missing
country inconsistent
duplicate customers
extreme transactions
```

### Step 1 — Clean

```text
Remove duplicates

Impute missing values

Normalize country labels

Investigate/cap outliers
```

### Step 2 — Feature Engineering

```text
DOB
→ age

last_login
→ days_since_login

transactions
→ total_spend_30d
→ avg_spend
→ transaction_count

country
→ one-hot
```

### Step 3 — Check leakage

Don't use:

```text
cancellation_date
```

if predicting churn.

### Step 4 — Split

```text
Train
Validation
Test
```

Then:

```text
Ready for SageMaker Training
```

---

# EXAM TRAPS — Day 4

## Trap 1 — Mean vs Median

Scenario:

```text
Income has extreme outliers
+
missing values
```

Better imputation often:

```text
Median
```

rather than mean.

---

## Trap 2 — One-Hot vs Label Encoding

```text
Country
→ One-hot
```

because no meaningful order.

```text
Risk:
Low/Medium/High
→ Ordinal encoding possible
```

---

## Trap 3 — Normalization vs Standardization

```text
Need values between 0 and 1
→ Normalization

Need mean 0 and std 1
→ Standardization
```

---

## Trap 4 — Delete every outlier

Wrong mental model:

```text
Extreme
→ delete
```

Could be:

```text
valid rare event
```

especially fraud.

Deleting rare fraud could destroy signal.

---

## Trap 5 — Accuracy on imbalanced data

```text
99% accuracy
```

doesn't necessarily mean good model.

Check:

```text
class distribution
```

---

## Trap 6 — Leakage produces amazing performance

If:

```text
training 99.9%
validation 99.8%
```

and suspicious features exist:

```text
target leakage
```

is possible.

---

## Trap 7 — Split after transformations

Some transformations must learn parameters **only from training data**.

Bad:

```text
full dataset
→ fit scaler
→ split
```

Better:

```text
split
→ fit scaler on train
→ apply to train/validation/test
```

---

## Trap 8 — Time series shuffle

Bad:

```text
2024–2026 all shuffled
```

when predicting future.

Can create future leakage.

---

## Trap 9 — High-cardinality one-hot

```text
customer_id
```

with millions unique values should not automatically one-hot.

Could create millions dimensions.

---

## Trap 10 — Data Wrangler vs Glue

Scenario:

> Merge 50 TB from many sources every night.

→ Glue may be better.

Scenario:

> Data scientist wants interactive visual feature engineering before SageMaker training.

→ Data Wrangler.

---

# Decision Tree — Cleaning

```text
Raw Data
   │
   ▼
Missing values?
   │
 YES
   ↓
Drop or Impute
   │
   ▼
Outliers?
   │
 YES
   ↓
Investigate / cap / transform / remove
   │
   ▼
Duplicates?
   │
 YES
   ↓
Deduplicate
   │
   ▼
Inconsistent categories?
   │
 YES
   ↓
Standardize labels
```

---

# Decision Tree — Feature Engineering

```text
Feature
  │
  ▼
Numeric?
  │
 YES
  ├── Need common range?
  │      ↓
  │  Normalize
  │
  ├── Need mean 0/std 1?
  │      ↓
  │  Standardize
  │
  └── Highly skewed?
         ↓
      Log transform


Categorical?
  │
 YES
  ├── Has order?
  │      ↓
  │ Ordinal encoding
  │
  └── No order?
         ↓
      One-hot
```

---

# Keyword → Answer Cheat Sheet

```text
NULL
→ Imputation

Extreme value
→ Outlier

Repeated row
→ Deduplication

0–1
→ Normalization

Mean 0 / std 1
→ Standardization

Nominal category
→ One-hot

Ordered category
→ Ordinal encoding

Highly skewed
→ Log transformation

Continuous → ranges
→ Binning

Feature reveals target
→ Target leakage

99/1 target distribution
→ Class imbalance

Human-readable ML visual prep
→ Data Wrangler
```

---

# 10 câu Practice MLA-C01 — Day 4

Hãy thử tự làm trước.

## Question 1

A training dataset contains a numeric income column with several missing values. The distribution is highly skewed and includes several extremely large values.

Which imputation strategy is MOST appropriate?

A. Replace missing values with zero
B. Replace missing values with the median
C. Replace missing values with the maximum
D. Remove the entire dataset

---

## Question 2

A dataset contains the categorical feature:

```text
Country:
Vietnam
Japan
Australia
```

There is no inherent ordering between the values.

Which transformation is MOST appropriate?

A. One-hot encoding
B. Standardization
C. Min-max scaling
D. Log transformation

---

## Question 3

A numerical feature must be rescaled to values between 0 and 1.

Which transformation should be used?

A. Standardization
B. Normalization
C. One-hot encoding
D. Binning

---

## Question 4

A machine learning engineer wants a numeric feature to have approximately zero mean and unit variance.

Which transformation should the engineer use?

A. One-hot encoding
B. Standardization
C. Binning
D. Label encoding

---

## Question 5

A company is building a model to predict whether customers will cancel their subscriptions. The training dataset includes a `cancellation_date` column.

What is the MAIN concern with using this column as a feature?

A. Class imbalance
B. Target leakage
C. Missing value imputation
D. High cardinality

---

## Question 6

A fraud dataset contains:

```text
99,500 legitimate transactions
500 fraudulent transactions
```

A model predicts every transaction as legitimate and achieves 99.5% accuracy.

What is the primary issue?

A. Dataset is too small
B. Target leakage
C. Class imbalance
D. Data normalization

---

## Question 7

A data scientist wants to visually clean data, handle missing values, encode categories, and create features before training a SageMaker model.

Which AWS capability is MOST appropriate?

A. SageMaker Data Wrangler
B. Amazon CloudTrail
C. Amazon ECR
D. AWS KMS

---

## Question 8

A feature contains:

```text
10
20
30
50
10,000,000
```

The feature is heavily right-skewed.

Which transformation should the engineer consider?

A. One-hot encoding
B. Log transformation
C. Label encoding
D. Tokenization

---

## Question 9

A dataset records customer events over three years. The company wants to predict future behavior.

Which approach minimizes the risk of future-data leakage?

A. Randomly mix all dates before splitting
B. Train on later dates and test on earlier dates
C. Train on earlier data and test on later data
D. Use the test set during hyperparameter tuning

---

## Question 10 — Harder

An ML engineer has a dataset containing:

```text
DOB
country
transactions
cancellation_date
```

The goal is to predict customer churn before cancellation happens.

Which THREE actions are most appropriate?

A. Convert DOB into age
B. One-hot encode country
C. Use cancellation_date as a predictive feature
D. Create transaction-frequency features
E. Duplicate churned customer records until accuracy reaches 99%

---

# Đáp án

```text
Q1  → B
Q2  → A
Q3  → B
Q4  → B
Q5  → B
Q6  → C
Q7  → A
Q8  → B
Q9  → C
Q10 → A + B + D
```

---

# Giải thích

## Q1 → Median

Dataset có:

```text
skew
+
outliers
```

Median resistant hơn mean đối với extreme values.

---

## Q2 → One-hot

Country là nominal category.

Không có:

```text
Vietnam < Japan < Australia
```

One-hot tránh fake ordering.

---

## Q3 → Normalization

Signal:

```text
0–1
```

→ Min-Max normalization.

---

## Q4 → Standardization

Signal:

```text
mean = 0
std = 1
```

→ Z-score standardization.

---

## Q5 → Target Leakage

`cancellation_date` chỉ biết sau khi churn/cancellation đã xảy ra.

Nếu dùng để predict churn:

```text
answer is already embedded in feature
```

---

## Q6 → Class Imbalance

```text
99.5% legitimate
0.5% fraud
```

Predict everything legitimate vẫn có accuracy rất cao.

Accuracy bị misleading.

---

## Q7 → Data Wrangler

Requirement:

```text
visual
ML data cleaning
feature engineering
SageMaker training
```

→ Data Wrangler.

---

## Q8 → Log Transformation

Extreme right-skew:

```text
10
20
30
50
10M
```

log compresses large ranges.

---

## Q9 → Train earlier, test later

Time-based prediction phải preserve chronology:

```text
Past
→ train

Future
→ test
```

Nếu future record lọt vào training sẽ leakage.

---

## Q10 → A + B + D

Good:

```text
DOB → Age

Country → One-hot

Transactions → frequency
```

Bad:

```text
Cancellation date
→ target leakage
```

Duplicate churn rows blindly cũng không phải sound solution.

---

# 5 câu nâng cao tự reasoning

### Scenario A

```text
Salary:
mostly 20k–80k
a few values > 10 million
```

Think:

```text
Outlier?
Valid?
Skew?
Possibly log transformation
```

Đừng auto-delete.

---

### Scenario B

```text
Plan:
Bronze
Silver
Gold
Platinum
```

Có natural order.

Think:

```text
Ordinal encoding
```

---

### Scenario C

```text
Browser:
Chrome
Firefox
Safari
```

Không order.

Think:

```text
One-hot
```

---

### Scenario D

```text
Customer churn dataset
feature = final_refund_status
```

Nếu final refund xảy ra sau churn:

```text
Target leakage
```

---

### Scenario E

```text
Fraud:
0.1%

Normal:
99.9%
```

Think:

```text
Class imbalance
+
don't rely only on accuracy
```

---

# Wrong Answer Log mẫu

Nếu nhầm normalization và standardization:

```text
Question:
Scale feature to zero mean and unit variance.

My answer:
Normalization

Correct:
Standardization

Why wrong:
I treated all scaling methods as identical.

Decision rule:

0–1
→ Normalization

mean 0 / std 1
→ Standardization
```

Nếu nhầm class imbalance:

```text
Question:
99% accuracy but model never finds fraud.

My answer:
Need normalization

Correct:
Class imbalance

Why:
The model exploits the majority class.

Decision rule:
Highly unequal label counts
→ Class imbalance
```

---

# Final Cheat Sheet — Day 4

```text
                DATA CLEANING

Missing values
      ↓
   Imputation

Duplicates
      ↓
 Deduplicate

Outliers
      ↓
Investigate / Cap / Transform

Inconsistent category
      ↓
Standardize values
```

Feature engineering:

```text
                FEATURE ENGINEERING

Numeric
  │
  ├── 0–1
  │    → Normalization
  │
  ├── mean 0/std 1
  │    → Standardization
  │
  ├── skewed
  │    → Log
  │
  └── ranges
       → Binning


Categorical
  │
  ├── no order
  │    → One-hot
  │
  └── ordered
       → Ordinal encoding
```

Quality issues:

```text
Amazing accuracy unexpectedly
         ↓
check Target Leakage


99% majority / 1% minority
         ↓
check Class Imbalance
```

Và flow tổng thể:

```text
Raw Data
   ↓
Missing / Duplicate / Outlier
   ↓
Clean
   ↓
Encode / Scale / Transform
   ↓
Feature Engineering
   ↓
Check Leakage
   ↓
Check Class Balance
   ↓
Train / Validation / Test
   ↓
Training-ready Dataset
```

## Checklist hoàn thành Day 4

Bạn nên tự trả lời được:

* Missing value khác outlier thế nào?
* Mean và median imputation khác nhau khi nào?
* Duplicate data có thể ảnh hưởng training thế nào?
* Data cleaning khác feature engineering ra sao?
* Feature khác label thế nào?
* Normalization khác standardization thế nào?
* One-hot khác ordinal encoding thế nào?
* Nominal và ordinal category khác nhau ra sao?
* Khi nào dùng binning?
* Khi nào nghĩ tới log transformation?
* Target leakage là gì?
* Làm sao phát hiện feature có nguy cơ leakage?
* Class imbalance là gì?
* Vì sao 99% accuracy có thể vẫn là model rất tệ?
* Oversampling và undersampling là gì?
* Tại sao time-series không nên random split bất cẩn?
* Data Wrangler khác Glue/DataBrew ở điểm nào?

Nếu làm được **8/10 practice questions và giải thích được vì sao các đáp án sai không phù hợp**, Day 4 đã ổn. **Day 5 tiếp theo sẽ tập trung sâu vào SageMaker Data Wrangler**: Data Wrangler Flow → Data Sources → Transformations → Analyses → Data Quality → Target Leakage → Quick Model → export sang S3/Feature Store/SageMaker Pipelines → các exam traps MLA-C01.
