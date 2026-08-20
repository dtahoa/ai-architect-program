Tiếp tục **Day 6 — Data Wrangler vs DataBrew + Feature Store + Data Quality + Bias**.

Day 6 rất quan trọng vì đây là ngày bạn bắt đầu gặp kiểu câu hỏi MLA khó hơn: **nhiều AWS services đều “có vẻ làm được”, nhưng phải chọn service đúng nhất theo requirement**.

Mental model của Day 6:

```text
Raw Data
   ↓
Prepare / Transform
   │
   ├── Data Wrangler → ML-focused preparation
   ├── DataBrew      → general visual preparation
   └── Glue          → large-scale automated ETL
   ↓
Engineered Features
   ↓
Feature Store
   ├── Offline → Training / Batch
   └── Online  → Real-time inference
   ↓
Quality Check
   ↓
Glue Data Quality
   ↓
Bias Check
   ↓
SageMaker Clarify
   ↓
Training-ready Data
```

AWS hiện mô tả Feature Store là lớp lưu trữ/quản lý features cho ML, Glue Data Quality là managed serverless data-quality service dùng DQDL, còn Clarify cung cấp pre-training và post-training bias metrics. ([AWS Documentation][1])

---

# DAY 6 — Service Selection + Feature Store + Data Quality + Bias

## Concept 1 — Data Wrangler vs DataBrew vs Glue ⭐⭐⭐⭐⭐

Đây là distinction quan trọng nhất của Day 6.

Cả ba đều có thể:

```text
read data
transform data
clean data
```

nhưng **intent khác nhau**.

| Service           | Mental model                     | Typical user                 |
| ----------------- | -------------------------------- | ---------------------------- |
| **Data Wrangler** | ML-oriented data preparation     | Data Scientist / ML Engineer |
| **DataBrew**      | Visual no-code general data prep | Analyst / Data Engineer      |
| **Glue**          | Scalable automated ETL           | Data Engineer                |

---

# Concept 2 — SageMaker Data Wrangler

Mental:

> **Prepare features for Machine Learning.**

```text
Dataset
   ↓
Data Wrangler
   ↓
Clean
Encode
Scale
Feature Engineering
Analyze
   ↓
ML-ready data
```

Nếu question nhấn mạnh:

```text
SageMaker
ML training
feature engineering
interactive/visual
```

→ nghĩ **Data Wrangler**.

---

# Ví dụ thực tế

Data scientist muốn tạo churn model.

Raw:

```text
DOB
country
transactions
last_login
```

Muốn:

```text
DOB
→ age

country
→ one-hot

transactions
→ avg_spend_30_days

last_login
→ days_since_login
```

Best mental answer:

```text
Data Wrangler
```

vì requirement thiên về:

> **ML feature preparation**.

---

# Concept 3 — AWS Glue DataBrew

AWS mô tả DataBrew là **visual data preparation tool** cho phép clean và normalize data mà không cần code, với hơn 250 ready-made transformations và không cần quản lý infrastructure. ([AWS Documentation][2])

Mental:

```text
Raw business data
      ↓
   DataBrew
      ↓
Visual cleaning
      ↓
    Recipe
      ↓
Clean dataset
```

Điểm cần nhớ:

> **Recipe**

---

# DataBrew Recipe là gì?

Recipe là một chuỗi transformation steps.

Ví dụ:

```text
Recipe: clean_customer_data

Step 1
Remove duplicate

Step 2
Replace NULL

Step 3
Convert date format

Step 4
Normalize country

Step 5
Remove invalid values
```

Recipe giúp transformation:

```text
repeatable
reusable
```

---

# Ví dụ thực tế

Business analyst có:

```text
sales.csv
```

và muốn:

```text
remove duplicate
fix date
clean country
normalize phone
```

không cần ML.

Requirement:

```text
visual
no code
general data prep
```

→ **DataBrew**.

DataBrew có thể kết nối datasets từ S3, JDBC sources hoặc Glue Data Catalog. ([AWS Documentation][3])

---

# Concept 4 — AWS Glue

Glue khác hai service trên vì focus mạnh vào:

```text
ETL
automation
scale
multiple sources
```

Mental:

```text
RDS ─────┐
S3 ──────┼→ Glue ETL Job
DynamoDB ┘
              ↓
           Join
           Clean
           Transform
              ↓
             S3
```

AWS mô tả Glue là serverless data integration service có thể discover, prepare, move và integrate data từ nhiều sources, cũng như create/run/monitor ETL pipelines. ([AWS Documentation][4])

---

# Ví dụ thực tế

Requirement:

> Every night, combine 40 TB from RDS, S3 and several other sources and generate Parquet training data.

Signals:

```text
40 TB
multiple sources
every night
automated
ETL
```

→ **Glue**

Không phải Data Wrangler UI.

---

# Cách phân biệt 3 services

```text
Question asks:
"What is the intent?"

            │
            ▼
ML feature engineering?
            │
           YES
            ↓
      Data Wrangler


General visual/no-code cleaning?
            │
           YES
            ↓
         DataBrew


Large automated ETL?
            │
           YES
            ↓
           Glue
```

---

# Exam Trap 1 — “Visual” không đủ

Cả Data Wrangler và DataBrew đều visual.

Do đó:

```text
visual
```

**không phải keyword đủ mạnh**.

Hãy tìm:

```text
ML / feature / SageMaker
→ Data Wrangler
```

hoặc:

```text
business analyst / recipe / general cleaning
→ DataBrew
```

---

# Exam Trap 2 — "Transform" không có nghĩa Glue

Cả ba đều transform.

Ví dụ:

> Data scientist wants to visually transform categorical values before SageMaker training.

→ Data Wrangler.

Không chọn Glue chỉ vì thấy:

```text
transform
```

---

# Concept 5 — Feature là gì?

Recall Day 4:

Raw data:

```text
DOB = 1990-01-01
```

Feature:

```text
Age = 36
```

Raw transactions:

```text
transaction 1
transaction 2
transaction 3
...
```

Features:

```text
avg_spend_30d
orders_30d
days_since_last_order
```

Feature Store giải quyết vấn đề:

> Sau khi tạo feature rồi, **lưu ở đâu để nhiều model có thể reuse một cách consistent?**

---

# Concept 6 — SageMaker Feature Store ⭐⭐⭐⭐⭐

AWS mô tả SageMaker Feature Store là lớp storage/data management cho ML features, giúp **create, store, retrieve, share, discover và manage features**. ([AWS Documentation][1])

Mental:

```text
                 Feature Store

Customer Features
────────────────────────────
customer_id
age
avg_spend_30d
login_count_7d
days_since_purchase
```

Các consumers:

```text
                 Feature Store
                      │
            ┌─────────┼─────────┐
            ▼         ▼         ▼
         Model A   Model B   Model C
```

---

# Vì sao cần Feature Store?

Không có Feature Store:

```text
Team A
raw data
  ↓
compute avg_spend

Team B
raw data
  ↓
compute avg_spend differently

Team C
raw data
  ↓
compute avg_spend again
```

Problems:

```text
duplicate work
different definitions
inconsistent features
training-serving skew
```

Với Feature Store:

```text
raw data
   ↓
feature pipeline
   ↓
Feature Store
   ↓
single reusable feature definition/data
```

AWS explicitly nói Feature Store giúp giảm **training-serving skew** bằng cách process và ingest features consistent giữa ML development và serving. ([AWS Documentation][1])

---

# Concept 7 — Training-serving skew ⭐⭐⭐⭐

Đây là concept hay.

Training:

```text
avg_spend_30d
calculated using logic A
```

Production:

```text
avg_spend_30d
calculated using logic B
```

Model được train trên:

```text
logic A
```

nhưng inference nhận:

```text
logic B
```

→ performance có thể giảm.

Đây là:

> **training-serving skew**

Feature Store giúp centralize/standardize feature handling.

---

# Exam signal

```text
same features
training + inference
consistency
reuse
avoid duplicated feature computation
```

→ **Feature Store**

---

# Concept 8 — Feature Group ⭐⭐⭐⭐

Features trong Feature Store được tổ chức thành:

> **Feature Group**

Mental model giống table:

```text
Feature Group: customer_features

customer_id | age | spend30 | login7
------------------------------------
C001        | 25  | 500     | 12
C002        | 42  | 900     |  3
```

AWS mô tả Feature Group như collection của features, với mỗi record được identify bởi một record identifier và event time. ([AWS Documentation][5])

---

# Concept 9 — Record Identifier

Bạn cần identify entity.

Ví dụ:

```text
customer_id = C001
```

là:

> Record Identifier

Mental:

```text
Feature Group
     │
record_id
     ↓
C001
```

---

# Concept 10 — Event Time

Feature changes over time.

Ví dụ:

```text
C001

08:00 avg_spend = 100
09:00 avg_spend = 120
10:00 avg_spend = 150
```

Event time giúp biết:

```text
feature value valid at what time?
```

Rất quan trọng cho historical feature data.

---

# Concept 11 — Online vs Offline Feature Store ⭐⭐⭐⭐⭐

Đây là comparison phải thuộc tuyệt đối.

```text
              Feature Store
                    │
           ┌────────┴────────┐
           ▼                 ▼
        Online            Offline
         Store             Store
           │                 │
       realtime           training
       latest             history
      low latency          batch
```

AWS hiện mô tả Online Store là low-latency store giữ **latest feature records**, còn Offline Store giữ historical feature records và chủ yếu dùng cho exploration, training và batch prediction. ([AWS Documentation][1])

---

# Concept 12 — Online Store

Think:

> **Latest value + real-time lookup**

Ví dụ fraud detection.

Transaction arrives:

```text
customer_id = C001
```

Model cần ngay:

```text
transactions_last_1h
avg_spend_7d
country_risk
```

Flow:

```text
Transaction
    ↓
customer_id
    ↓
Feature Store Online
    ↓
latest features
    ↓
real-time prediction
```

AWS mô tả Online Store cho low-millisecond latency reads và high-throughput writes. ([AWS Documentation][1])

---

# Exam signals Online Store

```text
real-time inference
latest feature
low latency
milliseconds
online prediction
```

→ **Online Store**

---

# Concept 13 — Offline Store

Think:

> **Historical feature data**

Ví dụ:

```text
customer_id
date
avg_spend
```

Historical:

```text
C001  Jan  100
C001  Feb  150
C001  Mar  200
```

Use:

```text
model training
batch inference
data exploration
```

AWS states the Offline Store uses S3-backed storage and maintains historical feature values; data is stored in Parquet for optimized query/storage. ([AWS Documentation][1])

---

# Exam signals Offline Store

```text
historical
training
batch inference
Athena
large feature dataset
```

→ **Offline Store**

---

# Online vs Offline table

| Requirement         |              Online |       Offline |
| ------------------- | ------------------: | ------------: |
| Latest value        |                   ✅ |       History |
| Real-time inference |                   ✅ | ❌ primary use |
| Low-latency lookup  |                   ✅ |             ❌ |
| Training            | Usually not primary |             ✅ |
| Historical values   | No, latest-oriented |             ✅ |
| Batch prediction    |       ❌ primary use |             ✅ |
| S3-backed history   |                   — |             ✅ |

---

# Exam Trap 3 — “Feature Store” chưa đủ

Question:

> Which Feature Store configuration?

Bạn phải đọc access pattern.

```text
Train using last 12 months
→ Offline

Get latest features in milliseconds
→ Online

Need both
→ Online + Offline
```

AWS allows a Feature Group to be configured with online, offline, or both stores. ([AWS Documentation][1])

---

# Concept 14 — Online + Offline cùng lúc

Một production architecture rất phổ biến:

```text
                   Feature Pipeline
                         │
                         ▼
                  Feature Store
                 /             \
                /               \
          Offline               Online
             │                    │
             ▼                    ▼
         Training              Realtime
             │                 Inference
             ▼                    │
           Model ─────────────────┘
```

Đây giúp:

```text
same features
training + serving
```

---

# Concept 15 — Batch vs Streaming Feature Ingestion

Feature Store hỗ trợ cả:

```text
Batch
```

và:

```text
Streaming
```

AWS docs mô tả streaming ingestion qua `PutRecord`, còn batch ingestion có thể được thực hiện bằng processing jobs hoặc workflows từ S3/Athena/Data Wrangler. ([AWS Documentation][1])

---

# Batch feature example

Every night:

```text
S3
 ↓
Processing
 ↓
calculate features
 ↓
Feature Store Offline
```

---

# Streaming feature example

User logs in:

```text
Login event
   ↓
Kinesis
   ↓
feature update
   ↓
Online Store
```

Now:

```text
login_count_1h
```

updated rapidly.

---

# Concept 16 — Data Wrangler vs Feature Store ⭐⭐⭐⭐⭐

Very common trap.

```text
Data Wrangler
→ CREATE / PREPARE features
```

```text
Feature Store
→ STORE / MANAGE / SERVE features
```

Architecture:

```text
Raw Data
   ↓
Data Wrangler
   ↓
Engineered Features
   ↓
Feature Store
```

---

# Exam Trap 4

Question:

> Multiple teams need to reuse an engineered feature.

Do not answer:

```text
Data Wrangler
```

Data Wrangler can create it.

Need storage/reuse:

```text
Feature Store
```

---

# Concept 17 — Data Quality là gì?

Data quality hỏi:

> Data có đáp ứng rules để dùng đúng mục đích hay không?

Ví dụ customer dataset:

```text
customer_id must not be NULL

customer_id must be unique

age between 18 and 100

country must be valid

salary >= 0
```

Nếu:

```text
age = -20
```

file có thể vẫn là syntactically valid CSV.

Nhưng:

```text
business data invalid
```

---

# Concept 18 — Dimensions của Data Quality

Exam-level nên hiểu:

```text
Completeness
→ values missing?

Uniqueness
→ duplicates?

Validity
→ valid values/range?

Consistency
→ conflicting representations?

Freshness
→ data recent enough?

Integrity
→ relationships valid?
```

Không cần thuộc một academic taxonomy cố định; cần hiểu rule intent.

---

# Concept 19 — AWS Glue Data Quality ⭐⭐⭐⭐⭐

AWS Glue Data Quality cho phép define, evaluate và monitor data quality rules; service là serverless và có thể chạy với Glue Data Catalog tables hoặc trong Glue ETL jobs. ([AWS Documentation][6])

Mental:

```text
Dataset
   ↓
Glue Data Quality
   ↓
Ruleset
   ↓
Evaluate
   ↓
PASS / FAIL
   ↓
Data Quality Score
```

---

# Ví dụ

Dataset:

```text
customer_id
age
email
```

Rules:

```text
customer_id
→ complete

customer_id
→ unique

age
→ 18–100

email
→ valid
```

Glue Data Quality evaluates them.

---

# Concept 20 — DQDL ⭐⭐⭐⭐

DQDL:

> **Data Quality Definition Language**

AWS uses DQDL to define Glue Data Quality rules. ([AWS Documentation][6])

Mental:

```text
DQDL
→ language for defining quality rules
```

You do **not** need memorize syntax deeply for MLA.

Conceptual example:

```text
Rules = [
  customer_id is complete,
  age values are valid,
  row count > minimum
]
```

---

# Exam Trap 5 — DQDL không phải query language

DQDL:

```text
define data-quality rules
```

Not:

```text
SQL query engine
```

Athena is for SQL querying.

---

# Concept 21 — Data Quality Score

AWS defines the Data Quality Score as the **percentage of evaluated data-quality rules that pass**. ([AWS Documentation][6])

Ví dụ:

```text
10 rules

9 PASS
1 FAIL
```

Quality score:

```text
90%
```

---

# Important distinction

Quality Score ≠:

```text
90% rows valid
```

It is based on:

> proportion of **rules** that pass.

That is an exam-worthy distinction.

---

# Concept 22 — Data Catalog vs ETL Job Quality Checks

Glue Data Quality có hai main entry points:

```text
Glue Data Catalog
```

và:

```text
Glue ETL Jobs
```

AWS documents both. ([AWS Documentation][6])

### Data Catalog

Think:

```text
dataset already cataloged
      ↓
evaluate quality
```

Good for:

```text
data lake governance
ongoing quality monitoring
```

---

### ETL Job

Think:

```text
Source
 ↓
Transform
 ↓
Data Quality Check
 ↓
Pass?
 ├── Yes → downstream
 └── No  → quarantine/fail/alert
```

Useful to prevent bad data entering training dataset.

---

# Concept 23 — Data Wrangler vs Glue Data Quality

Another important comparison:

```text
Data Wrangler
→ CLEAN / FIX / TRANSFORM data
```

```text
Glue Data Quality
→ DEFINE / CHECK / MONITOR data-quality rules
```

Example:

```text
age = -5
```

Data Quality:

```text
detect invalid value/rule failure
```

Data Wrangler:

```text
help transform/fix/remove value
```

---

# Exam Trap 6

Question:

> Continuously ensure incoming ETL datasets satisfy completeness and uniqueness rules.

→ **Glue Data Quality**

Not Data Wrangler.

---

# Concept 24 — Bias là gì trong MLA?

Bias ở đây là systematic imbalance/unfairness trong:

```text
training data
```

hoặc:

```text
model predictions
```

Example loan dataset:

```text
Group A
Group B
```

Nếu group representation hoặc positive outcomes khác rất nhiều:

```text
possible bias
```

---

# Concept 25 — Facet ⭐⭐⭐⭐

Trong SageMaker Clarify, một subgroup/property dùng để compare bias thường được gọi là:

> **facet**

Ví dụ:

```text
Age group
Gender category
Geographic category
```

Conceptual:

```text
Facet A
vs
Facet D
```

Clarify compares distributions/outcomes between them.

---

# Concept 26 — SageMaker Clarify ⭐⭐⭐⭐⭐

Mental:

```text
                 Clarify
                    │
           ┌────────┴────────┐
           ▼                 ▼
         Bias          Explainability
```

For Week 1:

```text
focus primarily on
pre-training data bias
```

AWS Clarify provides model-agnostic pre-training bias metrics over raw datasets before model training. ([AWS Documentation][7])

---

# Important 2026 note

AWS documentation currently states that **new customer access to SageMaker Clarify closed on July 30, 2026**, while existing customers can continue using it. However, MLA-C01 still includes Clarify concepts, so for **exam preparation you should still learn it**. ([AWS Documentation][8])

---

# Concept 27 — Pre-training vs Post-training Bias

## Pre-training

Before model exists:

```text
Dataset
 ↓
Clarify
 ↓
Bias metrics
```

Questions:

```text
Are groups represented equally?

Are labels distributed differently
between groups?
```

---

## Post-training

After model:

```text
Model predictions
      ↓
Clarify
      ↓
Compare outcomes
between facets
```

Question:

```text
Does the model predict positive outcomes
differently for groups?
```

AWS provides both pre-training and post-training metrics. ([AWS Documentation][7])

---

# Concept 28 — Class Imbalance (CI) in Clarify ⭐⭐⭐⭐⭐

Be careful.

Clarify's **CI metric** is not simply:

> “99% fraud vs 1% non-fraud.”

In Clarify terminology, CI measures imbalance in **the number of members belonging to different facet values**. ([AWS Documentation][7])

Example:

```text
Training population

Facet A
80,000 people

Facet D
10,000 people
```

Potential issue:

```text
Facet D underrepresented
```

CI measures this imbalance.

---

# Very important exam distinction

Generic ML class imbalance:

```text
Fraud      1%
Normal    99%
```

is target-class imbalance.

Clarify CI:

```text
Facet A 80%
Facet B 20%
```

is group/facet representation imbalance.

They are related concepts but **not identical in exam wording**.

---

# Concept 29 — DPL ⭐⭐⭐⭐⭐

DPL:

> **Difference in Proportions of Labels**

DPL compares positive-label proportions between facets in the **training dataset**. ([AWS Documentation][7])

Example:

```text
Loan approval data

Group A:
80% approved

Group B:
40% approved
```

DPL asks:

> Are positive labels distributed differently between the two groups?

---

# CI vs DPL ⭐⭐⭐⭐⭐

This comparison is very important:

| Metric  | Question                                               |
| ------- | ------------------------------------------------------ |
| **CI**  | Do the groups have similar numbers of samples?         |
| **DPL** | Do the groups have similar positive-label proportions? |

Mental:

```text
CI
→ WHO is represented?

DPL
→ WHAT labels/outcomes do they receive?
```

---

# Example

Dataset:

```text
Group A = 1,000 samples
Group B = 1,000 samples
```

CI:

```text
roughly balanced
```

But:

```text
Group A:
80% positive

Group B:
20% positive
```

DPL:

```text
large difference
```

So:

> balanced group counts do not mean labels are unbiased.

---

# Concept 30 — DPPL

Useful to recognize for later Domain 4.

DPPL:

> Difference in Positive Proportions in Predicted Labels.

That means:

```text
model predictions
```

instead of:

```text
training labels
```

AWS describes DPPL as comparing the proportion of positive **predictions** between facets. ([AWS Documentation][9])

Mental:

```text
DPL
→ BEFORE training
→ observed labels

DPPL
→ AFTER training
→ predicted labels
```

---

# Exam Trap 7 — DPL vs DPPL

Question:

> Compare approval labels in training dataset.

→ **DPL**

Question:

> Compare positive predictions made by deployed/trained model.

→ **DPPL**

---

# Concept 31 — Bias metrics require interpretation

Bias metric ≠ automatic verdict:

```text
metric != "illegal discrimination"
```

AWS explicitly notes that fairness definitions vary and human judgment/stakeholder context is needed to decide which metrics are appropriate. ([AWS Documentation][8])

Exam mental model:

```text
Clarify
→ quantify potential bias

Human/business/legal context
→ interpret significance
```

---

# Concept 32 — Data Quality vs Bias

Another major distinction.

Suppose:

```text
customer_id non-null
age valid
salary valid
```

Dataset can have:

```text
100% data quality rules passing
```

and still be:

```text
biased
```

Example:

```text
Group A = 95%
Group B = 5%
```

Data structurally valid but group B underrepresented.

Therefore:

```text
Data Quality
≠
Fairness / Bias
```

---

# Data Quality vs Clarify

| Requirement              | Tool              |
| ------------------------ | ----------------- |
| NULL values              | Glue Data Quality |
| Invalid ranges           | Glue Data Quality |
| Duplicates               | Glue Data Quality |
| Freshness                | Glue Data Quality |
| Facet representation     | Clarify           |
| Positive label disparity | Clarify           |
| Model fairness           | Clarify           |
| Explain predictions      | Clarify           |

---

# Concept 33 — Full ML preparation architecture

Let's combine Days 2–6.

```text
RDS / DynamoDB / S3
          │
          ▼
         Glue
     large-scale ETL
          │
          ▼
          S3
          │
          ▼
    Data Wrangler
     interactive ML
      preparation
          │
          ▼
   Engineered Features
          │
          ▼
     Feature Store
      /          \
 Offline          Online
    │                │
Training          Inference
    │                │
    └──────┬─────────┘
           │
           ▼
      Data Quality
           │
           ▼
        Clarify
           │
           ▼
      Model Training
```

Real architecture order can vary—for example, quality checks might occur earlier—but this is a useful **mental map** for exam reasoning.

---

# EXAM TRAPS — DAY 6

## Trap 1 — Data Wrangler vs DataBrew

```text
ML + SageMaker + features
→ Data Wrangler

General cleaning + recipe
→ DataBrew
```

---

## Trap 2 — Data Wrangler vs Glue

```text
interactive ML prep
→ Data Wrangler

large automatic ETL
→ Glue
```

---

## Trap 3 — Feature creation vs Feature storage

```text
Create feature
→ Data Wrangler / processing

Reuse/store/serve feature
→ Feature Store
```

---

## Trap 4 — Online vs Offline

```text
milliseconds + latest
→ Online

historical + training
→ Offline
```

---

## Trap 5 — Feature Store isn't model registry

Feature Store stores:

```text
features
```

Model Registry stores:

```text
model versions / metadata
```

Do not confuse them.

---

## Trap 6 — Glue Data Quality doesn't necessarily clean data

Primary job:

```text
measure
validate
monitor
```

It identifies bad records/rule failures; another transformation step may actually fix data.

---

## Trap 7 — Data quality ≠ Bias

```text
No NULLs
No duplicates
All ranges valid
```

does not prove:

```text
fair representation
```

---

## Trap 8 — Generic class imbalance vs Clarify CI

```text
99% Normal
1% Fraud
```

→ generic target-class imbalance.

```text
90% Facet A
10% Facet B
```

→ Clarify CI context.

---

## Trap 9 — DPL vs DPPL

```text
training labels
→ DPL

model predictions
→ DPPL
```

---

## Trap 10 — Online Store isn't historical database

Online store retains latest feature record behavior.

Need historical feature values?

→ **Offline Store**. ([AWS Documentation][1])

---

# Decision Tree — Service Selection

```text
Requirement
    │
    ▼
Prepare data visually for ML?
    │
   YES
    ↓
Data Wrangler

General no-code prep?
    │
   YES
    ↓
DataBrew

Large automated ETL?
    │
   YES
    ↓
Glue

Store/reuse features?
    │
   YES
    ↓
Feature Store

Validate data-quality rules?
    │
   YES
    ↓
Glue Data Quality

Measure bias/fairness?
    │
   YES
    ↓
Clarify
```

---

# Decision Tree — Feature Store

```text
Need feature value
      │
      ▼
Realtime prediction?
      │
     YES
      ↓
Online Store


Historical training/batch?
      │
     YES
      ↓
Offline Store


Need both?
      │
     YES
      ↓
Online + Offline
```

---

# Keyword → Answer Cheat Sheet

```text
ML visual preparation
→ Data Wrangler

visual recipe
→ DataBrew

large-scale ETL
→ Glue

feature reuse
→ Feature Store

latest feature / millisecond
→ Online Store

historical features / training
→ Offline Store

quality rules
→ Glue Data Quality

DQDL
→ Glue Data Quality

bias / fairness
→ Clarify

facet representation
→ CI

positive training-label proportions
→ DPL

positive predicted proportions
→ DPPL
```

---

# 10 câu Practice MLA-C01 — Day 6

**Hãy tự làm trước khi xem đáp án.**

### Question 1

A data scientist wants an interactive visual tool to clean data and create features before training a SageMaker model.

Which solution is MOST appropriate?

A. AWS Glue DataBrew
B. SageMaker Data Wrangler
C. AWS Glue Data Quality
D. SageMaker Feature Store

---

### Question 2

A business analyst wants to visually clean sales data with reusable no-code recipes. The workflow is not specifically ML-oriented.

Which service is the BEST fit?

A. SageMaker Data Wrangler
B. AWS Glue DataBrew
C. SageMaker Clarify
D. Amazon ECR

---

### Question 3

A company needs to combine 30 TB of data from multiple sources every night and generate a transformed training dataset.

Which service is MOST appropriate?

A. AWS Glue
B. SageMaker Feature Store Online Store
C. CloudTrail
D. Clarify

---

### Question 4

Several ML models need to use the same engineered `customer_spend_30d` feature.

Which AWS capability is MOST appropriate for centrally storing and sharing the feature?

A. SageMaker Data Wrangler
B. SageMaker Feature Store
C. AWS Glue Crawler
D. Amazon Kinesis only

---

### Question 5

A fraud-detection API must retrieve the latest customer features with very low latency before every prediction.

Which Feature Store option should be used?

A. Offline Store
B. Online Store
C. S3 Glacier
D. Glue Data Catalog

---

### Question 6

An ML team needs five years of historical feature values for model training and batch inference.

Which Feature Store option is MOST appropriate?

A. Online Store only
B. Offline Store
C. EBS
D. CloudWatch Logs

---

### Question 7

A data pipeline must ensure that `customer_id` is never NULL, is unique, and that `age` remains within an allowed range.

Which AWS capability is MOST appropriate?

A. AWS Glue Data Quality
B. SageMaker Clarify
C. SageMaker Endpoint
D. Amazon ECR

---

### Question 8

A training dataset contains 80,000 records for demographic facet A and only 10,000 records for demographic facet B.

Which SageMaker Clarify pre-training concept is most relevant?

A. Difference in Positive Proportions in Predicted Labels
B. Class Imbalance
C. RMSE
D. Model latency

---

### Question 9

Two demographic groups contain approximately the same number of training samples. However, 80% of group A has a positive training label compared with 30% of group B.

Which metric is MOST directly relevant?

A. Class Imbalance
B. Difference in Proportions of Labels
C. Endpoint latency
D. Data Quality Score

---

### Question 10 — Harder

A company builds a real-time loan-approval model. The same engineered customer features must be used for historical training and low-latency real-time predictions. The company also needs to validate that incoming feature data satisfies completeness rules and assess whether positive labels differ substantially between demographic groups before training.

Which THREE components best meet these requirements?

A. SageMaker Feature Store with Online and Offline stores
B. AWS Glue Data Quality
C. SageMaker Clarify
D. Amazon EBS Provisioned IOPS
E. Amazon CloudFront

---

# Đáp án

```text
Q1  → B
Q2  → B
Q3  → A
Q4  → B
Q5  → B
Q6  → B
Q7  → A
Q8  → B
Q9  → B
Q10 → A + B + C
```

---

# Giải thích đáp án

### Q1 → Data Wrangler

Signals:

```text
data scientist
interactive
visual
features
SageMaker training
```

→ **Data Wrangler**

---

### Q2 → DataBrew

Signals:

```text
business analyst
visual
no-code
recipe
general preparation
```

→ **DataBrew**. AWS describes DataBrew specifically as visual/no-code data preparation with reusable transformations. ([AWS Documentation][2])

---

### Q3 → Glue

Signals:

```text
30 TB
multiple sources
every night
automated
```

→ scalable ETL.

→ **Glue**

---

### Q4 → Feature Store

Requirement isn't:

```text
create feature
```

It is:

```text
store
share
reuse
```

→ **Feature Store**

---

### Q5 → Online Store

Signals:

```text
latest
very low latency
real-time prediction
```

→ **Online Store**. ([AWS Documentation][1])

---

### Q6 → Offline Store

Signals:

```text
5 years
historical
training
batch
```

→ **Offline Store**. ([AWS Documentation][1])

---

### Q7 → Glue Data Quality

Need:

```text
Completeness
Uniqueness
Range validity
```

→ data-quality rules.

→ **Glue Data Quality**

---

### Q8 → Clarify CI

Question asks:

```text
Facet A count
vs
Facet B count
```

→ **Class Imbalance (CI)** in Clarify terminology. ([AWS Documentation][10])

---

### Q9 → DPL

Sample counts are balanced.

Problem is:

```text
80% positive
vs
30% positive
```

→ positive-label distribution.

→ **Difference in Proportions of Labels**. ([AWS Documentation][11])

---

### Q10 → A + B + C

Requirement 1:

```text
historical + realtime features
→ Feature Store Online + Offline
```

Requirement 2:

```text
completeness validation
→ Glue Data Quality
```

Requirement 3:

```text
pre-training label bias
→ Clarify
```

Therefore:

```text
A + B + C
```

---

# 5 câu tự reasoning nâng cao

| Scenario                                              | Think                            |
| ----------------------------------------------------- | -------------------------------- |
| A feature must be retrieved in milliseconds           | **Online Store**                 |
| Feature values from two years ago needed for training | **Offline Store**                |
| `customer_id` is NULL in 2% of rows                   | **Glue Data Quality / cleaning** |
| Group A has 10× more samples than B                   | **Clarify CI**                   |
| Groups have equal size but approval rates 90% vs 30%  | **Clarify DPL**                  |

---

# Wrong Answer Log mẫu

Nếu nhầm Data Wrangler với Feature Store:

```text
Question:
Multiple models need to reuse
avg_spend_30d.

My answer:
Data Wrangler

Correct:
Feature Store

Why:
Data Wrangler helps CREATE the feature.
Feature Store STORES and SERVES it.

Decision rule:

Prepare
→ Data Wrangler

Reuse / serve
→ Feature Store
```

Nếu nhầm CI và DPL:

```text
Question:
Groups have equal sample counts,
but positive label rates differ.

My answer:
CI

Correct:
DPL

Why:
CI measures representation/count imbalance.
DPL compares positive label proportions.

Decision rule:

Sample count
→ CI

Label proportion
→ DPL
```

---

# Final Cheat Sheet — Day 6

```text
                 DATA PREPARATION

ML visual prep
      ↓
Data Wrangler

General visual prep
      ↓
DataBrew

Large automated ETL
      ↓
Glue
```

Sau đó:

```text
              ENGINEERED FEATURES
                      │
                      ▼
                Feature Store
               /             \
              /               \
        Online Store        Offline Store
             │                  │
         latest value        historical
         low latency          training
         realtime             batch
```

Quality và bias:

```text
                DATA CHECKS

Data correctness
      ↓
Glue Data Quality
      ↓
DQDL


Fairness / Bias
      ↓
SageMaker Clarify
      │
      ├── CI
      │    → group representation
      │
      └── DPL
           → positive training labels
```

## Checklist hoàn thành Day 6

Bạn nên tự giải thích được **Data Wrangler vs DataBrew vs Glue**, tại sao Feature Store cần tồn tại, Online khác Offline thế nào, Feature Group/Record Identifier/Event Time dùng để làm gì, training-serving skew là gì, DQDL/Data Quality Score là gì, Data Quality khác Bias thế nào, Clarify làm gì, và đặc biệt phải phân biệt được:

```text
CI
→ sample representation between facets

DPL
→ positive label proportions before training

DPPL
→ positive prediction proportions after training
```

Nếu bạn đạt **8/10 practice questions trở lên**, Day 6 ổn. **Day 7 sẽ là Week 1 Review + Exam Drill**: mình sẽ tổng hợp toàn bộ **Day 1–6 thành khoảng 25 decision rules, các service comparison dễ nhầm, 20 câu MLA-C01 scenario từ medium → hard, rồi chấm theo từng Domain 1 skill** để xác định bạn đã sẵn sàng sang Week 2 hay chưa.

[1]: https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store.html?utm_source=chatgpt.com "Create, store, and share features with Feature Store - Amazon SageMaker AI"
[2]: https://docs.aws.amazon.com/databrew/latest/dg/what-is.html?utm_source=chatgpt.com "What is AWS Glue DataBrew? - AWS Glue DataBrew Developer Guide"
[3]: https://docs.aws.amazon.com/databrew/latest/dg/datasets.html?utm_source=chatgpt.com "Connecting to data with AWS Glue DataBrew - AWS Glue DataBrew Developer Guide"
[4]: https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html?utm_source=chatgpt.com "What is AWS Glue? - AWS Glue"
[5]: https://docs.aws.amazon.com/sagemaker/latest/dg/feature-store-concepts.html?utm_source=chatgpt.com "Feature Store concepts - Amazon SageMaker AI"
[6]: https://docs.aws.amazon.com/glue/latest/dg/glue-data-quality.html?utm_source=chatgpt.com "AWS Glue Data Quality - AWS Glue"
[7]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-measure-data-bias.html?utm_source=chatgpt.com "Pre-training Bias Metrics - Amazon SageMaker AI"
[8]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-measure-post-training-bias.html?utm_source=chatgpt.com "Post-training Data and Model Bias Metrics - Amazon SageMaker AI"
[9]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-post-training-bias-metric-dppl.html?utm_source=chatgpt.com "Difference in Positive Proportions in Predicted Labels (DPPL) - Amazon SageMaker AI"
[10]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-bias-metric-class-imbalance.html?utm_source=chatgpt.com "Class Imbalance (CI) - Amazon SageMaker AI"
[11]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-data-bias-metric-true-label-imbalance.html?utm_source=chatgpt.com "Difference in Proportions of Labels (DPL) - Amazon SageMaker AI"
