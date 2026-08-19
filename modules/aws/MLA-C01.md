Dựa trên screenshot bạn gửi, mình sẽ **điều chỉnh lộ trình theo hướng “exam-oriented” hơn**, thay vì chỉ học theo 4 domain của AWS. Screenshot này có một số kinh nghiệm rất đáng chú ý: đề thực tế có thể hỏi khá nhiều về **Data Wrangler/DataBrew, SageMaker deployment, Model Monitor/Clarify, AWS networking/IAM/S3, container/BYOM và một ít Bedrock/LLM**.

Điểm quan trọng là các nội dung này thực sự phù hợp với blueprint chính thức của MLA-C01. AWS hiện chia MLA-C01 thành 4 domain: **Data Preparation 28%, Model Development 26%, Deployment & Orchestration 22%, Monitoring/Maintenance/Security 24%**. Đề có 65 câu trong 130 phút; exam guide hiện tại cho biết 50 câu tính điểm và 15 câu không tính điểm. ([AWS Documentation][1])

Và vì hiện tại là tháng 8/2026, bạn nên lưu ý **MLA-C01 tiếng Anh chỉ thi đến 28/09/2026**. Lộ trình 1 tháng này vì vậy vẫn rất phù hợp để nhắm thi C01 vào khoảng giữa/cuối tháng 9. ([Amazon Web Services, Inc.][2])

# Lộ trình MLA-C01 trong 1 tháng

Mình đề xuất khoảng **2 giờ/ngày từ thứ Hai–thứ Sáu + 3–4 giờ cuối tuần**, tổng khoảng **65–75 giờ**.

## Chiến lược học sau khi tham khảo screenshot

| Priority | Chủ đề                                           | Mức độ |
| -------- | ------------------------------------------------ | -----: |
| 🔴 P0    | SageMaker end-to-end                             |  ⭐⭐⭐⭐⭐ |
| 🔴 P0    | Data cleaning / feature engineering              |  ⭐⭐⭐⭐⭐ |
| 🔴 P0    | Data Wrangler vs DataBrew                        |  ⭐⭐⭐⭐⭐ |
| 🔴 P0    | Real-time / Async / Serverless / Batch inference |  ⭐⭐⭐⭐⭐ |
| 🔴 P0    | Model Monitor / Clarify                          |  ⭐⭐⭐⭐⭐ |
| 🔴 P0    | Accuracy / Precision / Recall / F1 / RMSE / AUC  |  ⭐⭐⭐⭐⭐ |
| 🟠 P1    | IAM / S3 / VPC / VPC Endpoint                    |   ⭐⭐⭐⭐ |
| 🟠 P1    | Auto Scaling / CloudWatch                        |   ⭐⭐⭐⭐ |
| 🟠 P1    | SageMaker Pipelines / CI-CD                      |   ⭐⭐⭐⭐ |
| 🟠 P1    | Script Mode / BYOM / BYOC                        |   ⭐⭐⭐⭐ |
| 🟠 P1    | ECR / ECS / EKS                                  |    ⭐⭐⭐ |
| 🟡 P2    | Bedrock / RAG / Fine-tuning                      |    ⭐⭐⭐ |
| 🟡 P2    | Temperature / Top-P / Top-K                      |    ⭐⭐⭐ |
| 🟡 P2    | CloudFormation / CDK                             |    ⭐⭐⭐ |
| 🟡 P2    | FSx / EFS / storage details                      |    ⭐⭐⭐ |

Những chủ đề như SageMaker Data Wrangler, DataBrew, Clarify, script mode, deployment endpoints, ECS/EKS, auto scaling, VPC, IAM... đều xuất hiện trực tiếp trong blueprint chính thức chứ không chỉ đến từ kinh nghiệm trong screenshot. ([AWS Documentation][3])

---

# WEEK 1 — Data Preparation + AWS Foundation

**Mục tiêu:** hết tuần 1 phải trả lời được câu:

> Data đang ở đâu → ingest bằng gì → lưu ở đâu → clean thế nào → feature engineering thế nào → đưa vào SageMaker ra sao?

Domain này chiếm **28%**, cao nhất MLA-C01. ([AWS Documentation][1])

## Day 1 — Hiểu exam + baseline test

Học:

* 4 domains
* Question types
* Exam timing
* In-scope services
* Làm pre-test để tìm gap

AWS hiện có cả Multiple Choice, Multiple Response, Ordering và Matching trong exam guide. ([AWS Documentation][1])

**Tài liệu:**

AWS MLA-C01 Official Exam Guide
([AWS Documentation][1])

AWS Exam Prep Plan
([AWS Skill Builder][4])

Official Practice Question Set
([AWS Skill Builder][5])

Official Pretest — 65 câu / 130 phút
([AWS Skill Builder][6])

---

## Day 2 — Storage cho ML

Nắm thật rõ:

```text
S3
EBS
EFS
FSx
RDS
DynamoDB
```

Đặc biệt phải phân biệt:

| Service  | Khi nào nghĩ tới                   |
| -------- | ---------------------------------- |
| S3       | ML dataset / object storage        |
| EBS      | block storage cho EC2              |
| EFS      | shared Linux filesystem            |
| FSx      | high-performance/shared filesystem |
| RDS      | relational data                    |
| DynamoDB | NoSQL                              |

Blueprint yêu cầu hiểu storage trade-off, data formats và cách đưa dữ liệu từ S3/EBS/EFS/RDS/DynamoDB vào ML pipeline. ([AWS Documentation][3])

### Cần nhớ thêm từ screenshot

**FSx for Lustre** thường xuất hiện trong ML/HPC khi:

```text
Huge dataset
      ↓
     S3
      ↓
FSx for Lustre
      ↓
high throughput training
```

Không cần đi quá sâu implementation.

---

# Day 3 — Data formats + ingestion

Nắm:

```text
CSV
JSON
Parquet
ORC
Avro
RecordIO
```

Đặc biệt:

```text
Analytics / large dataset
        ↓
columnar format
        ↓
Parquet / ORC
```

Và ingestion:

```text
Batch
 ├── S3
 ├── Glue
 └── SageMaker

Streaming
 ├── Kinesis
 ├── Flink
 └── Kafka
```

Các format và ingestion mechanisms này được liệt kê trực tiếp trong Domain 1. ([AWS Documentation][3])

---

# Day 4 — Data Cleaning

Screenshot nhấn mạnh rất đúng phần này.

Phải hiểu:

```text
Missing values
Outliers
Duplicates
Incorrect types
Imbalanced classes
Scaling
Normalization
Standardization
Encoding
Binning
Log transformation
```

Ví dụ:

```text
Age
20
21
NULL
25
999
```

Có thể cần:

```text
NULL → imputation
999  → outlier treatment
Age  → standardization
```

AWS blueprint yêu cầu rõ data cleaning, missing data, outliers, deduplication, normalization, scaling, encoding... ([AWS Documentation][3])

---

# Day 5 — SageMaker Data Wrangler ⭐⭐⭐⭐⭐

Đây là chủ đề mình sẽ tăng priority sau screenshot.

Hiểu flow:

```text
Data source
    ↓
Data Wrangler
    ↓
Analyze
    ↓
Clean
    ↓
Transform
    ↓
Feature engineering
    ↓
Export
    ├── S3
    ├── Feature Store
    └── SageMaker Pipeline
```

Data Wrangler hỗ trợ import, transform, visualize/analyze và export workflow sang S3, Feature Store, Pipelines hoặc Python. ([AWS Documentation][7])

**Đọc:**

SageMaker Data Wrangler
([AWS Documentation][7])

---

# Day 6 — Data Wrangler vs DataBrew ⭐⭐⭐⭐⭐

Screenshot nói có thể gặp nhiều câu phân biệt hai service này. Đây là phần rất dễ lấy điểm.

### SageMaker Data Wrangler

Think:

> **Data preparation specifically for ML workflow**

```text
Data
 ↓
Transform
 ↓
Features
 ↓
SageMaker training
```

### AWS Glue DataBrew

Think:

> **General-purpose visual data preparation**

```text
Raw business data
 ↓
DataBrew
 ↓
Recipe
 ↓
Clean dataset
 ↓
S3
```

DataBrew cung cấp visual point-and-click transforms và recipe/job để profile hoặc transform dataset. ([AWS Documentation][8])

### Exam shortcut

```text
Question mentions:

SageMaker + features + ML
→ Data Wrangler

Analyst + visual cleaning + recipe
→ DataBrew
```

---

# Day 7 — Review + 30–40 questions

Target:

**≥70%**

Nếu dưới 70%, chưa qua Week 2.

Tập trung review:

```text
Data Wrangler vs DataBrew
S3 vs EFS vs FSx
CSV vs Parquet
missing/outlier
Feature Store
Glue
Kinesis
```

---

# WEEK 2 — Model Development

Domain 2 chiếm **26%**. AWS yêu cầu model selection, training, tuning, evaluation, SageMaker algorithms, script mode và cả Bedrock/foundation models ở mức thích hợp. ([AWS Documentation][9])

---

# Day 8 — ML fundamentals

Phân biệt:

```text
Classification
Regression
Clustering
Forecasting
Recommendation
Anomaly Detection
```

Ví dụ:

```text
Spam / not spam
→ Classification

House price
→ Regression

Customer groups
→ Clustering
```

Không cần học ML theo kiểu Data Scientist chuyên sâu.

MLA thiên về:

> Which model/service/metric should you use?

---

# Day 9 — Metrics ⭐⭐⭐⭐⭐

Screenshot highlight phần này rất đúng.

Phải thuộc:

### Classification

```text
Accuracy
Precision
Recall
F1
ROC-AUC
Confusion Matrix
```

Mnemonic:

```text
Precision
"Prediction positive có chính xác không?"

Recall
"Có bắt được hết positive không?"
```

Ví dụ fraud detection:

```text
Missing fraud = expensive

→ high Recall
```

Spam:

```text
Don't classify important email as spam

→ Precision important
```

### Regression

```text
MAE
MSE
RMSE
```

RMSE phạt error lớn mạnh hơn.

Các metric F1, Accuracy, Precision, Recall, RMSE, ROC/AUC nằm trực tiếp trong exam guide. ([AWS Documentation][9])

---

# Day 10 — Training + Hyperparameters

Nắm:

```text
epoch
batch size
learning rate
early stopping
regularization
L1/L2
dropout
```

Và:

```text
underfitting
overfitting
```

### Hyperparameter tuning

Hiểu:

```text
Random search

vs

Bayesian optimization
```

SageMaker Automatic Model Tuning là phần trong Domain 2. ([AWS Documentation][9])

---

# Day 11 — SageMaker Training

Hiểu lifecycle:

```text
S3 dataset
   ↓
Training Job
   ↓
Training container
   ↓
model.tar.gz
   ↓
S3
   ↓
Model
```

Nắm:

```text
Built-in algorithm
Built-in framework
Script Mode
Custom container
```

---

# Day 12 — Script Mode vs BYOM/BYOC ⭐⭐⭐⭐⭐

Screenshot nhấn mạnh rất đúng.

### Script Mode

AWS cung cấp container/framework:

```text
AWS PyTorch container
       +
your train.py
```

Use when:

> framework được SageMaker support nhưng bạn có custom training code.

AWS blueprint đề cập trực tiếp việc dùng script mode với TensorFlow/PyTorch. ([AWS Documentation][9])

### Bring Your Own Container

```text
Your model
Your framework
Your dependency
Your Docker image
       ↓
      ECR
       ↓
   SageMaker
```

Use when:

> pre-built SageMaker container không đáp ứng requirement.

AWS có tài liệu chính thức về custom Docker containers cho training/inference. ([AWS Documentation][10])

### Exam shortcut

```text
Custom Python training code
+ supported framework
→ Script Mode

Unsupported framework/dependencies
→ Custom Container
```

---

# Day 13 — Bedrock / LLM basics

Screenshot nói có vài câu Bedrock/RAG.

MLA-C01 blueprint cũng liệt kê **Amazon Bedrock**, foundation models và fine-tuning trong Domain 2. ([AWS Documentation][9])

Chỉ cần hiểu:

```text
Foundation Model
Prompt
Embedding
Vector DB
RAG
Fine-tuning
```

### RAG

```text
Question
   ↓
Embedding
   ↓
Vector Search
   ↓
Relevant documents
   ↓
Prompt + context
   ↓
LLM
```

### RAG vs Fine-tuning

```text
Need latest/private knowledge
→ RAG

Need change model behavior/style/task ability
→ Fine-tuning
```

---

# Day 14 — Temperature / Top-P / Top-K

Theo screenshot nên biết ở conceptual level.

### Temperature

```text
Low
→ deterministic

High
→ creative/random
```

### Top-P

Chỉ chọn token nằm trong nhóm có cumulative probability đạt P.

### Top-K

Chỉ xét K token có probability cao nhất.

AWS Bedrock cho phép điều chỉnh các sampling parameters này; các giá trị/range cụ thể phụ thuộc foundation model. ([AWS Documentation][11])

Sau đó làm **40–50 questions Domain 2**.

Target:

> **≥75%**

---

# WEEK 3 — Deployment + MLOps

Đây là tuần **cực kỳ quan trọng theo screenshot**.

Domain 3 yêu cầu hiểu endpoint types, containers, auto scaling, IaC, CI/CD và deployment targets như SageMaker/ECS/EKS/Lambda. ([AWS Documentation][12])

---

# Day 15 — 4 inference types ⭐⭐⭐⭐⭐

Đây là một trong những bảng quan trọng nhất cần thuộc.

| Type            | Use case                             |
| --------------- | ------------------------------------ |
| Real-time       | low latency                          |
| Serverless      | intermittent / unpredictable traffic |
| Async           | long-running / large payload         |
| Batch Transform | offline bulk prediction              |

### Real-time

```text
Request → endpoint → response

milliseconds
```

### Serverless

```text
sporadic traffic
don't manage instances
```

Trade-off:

```text
possible cold start
```

### Async

```text
request
 ↓
queue
 ↓
processing
 ↓
S3 result
```

Think:

> large payload / processing seconds-minutes.

### Batch

```text
1M records
   ↓
Batch Transform
   ↓
predictions
```

No persistent endpoint.

AWS exam guide liệt kê trực tiếp serverless, real-time, asynchronous và batch inference. ([AWS Documentation][12])

**SageMaker deployment documentation:**
([AWS Documentation][13])

---

# Day 16 — Auto Scaling ⭐⭐⭐⭐⭐

Hiểu:

```text
Endpoint
   ↓
Production Variant
   ↓
Auto Scaling
```

Metrics có thể gồm:

```text
InvocationsPerInstance
CPU
Latency
```

AWS blueprint yêu cầu biết scaling policies và chọn metrics như latency, CPU utilization và invocations per instance. ([AWS Documentation][12])

AWS Auto Scaling docs:
([AWS Documentation][14])

---

# Day 17 — Deployment strategies

Học:

```text
All-at-once
Blue/Green
Canary
Linear
Shadow
```

Ví dụ:

```text
Current model
     ↓
90% traffic

New model
     ↓
10% traffic

→ Canary
```

Shadow:

```text
Production Model ──→ response

       request
          │
          └────→ Shadow Model
                    ↓
                 compare
```

Không ảnh hưởng user.

Deployment/rollback strategies và shadow variants đều nằm trong blueprint. ([AWS Documentation][9])

---

# Day 18 — SageMaker Pipelines

Hiểu:

```text
Processing
   ↓
Training
   ↓
Evaluation
   ↓
Condition
   ↓
Register Model
   ↓
Deploy
```

Phân biệt:

```text
SageMaker Pipelines
→ ML workflow

CodePipeline
→ CI/CD orchestration

Step Functions
→ general workflow

MWAA
→ Airflow
```

---

# Day 19 — CloudFormation / CDK / CI-CD

Screenshot nhắc tới CloudFormation, và Domain 3 cũng yêu cầu CloudFormation/CDK. ([AWS Documentation][12])

Nắm:

```text
CloudFormation
→ declarative YAML/JSON

CDK
→ infrastructure using code
```

Và:

```text
Git
 ↓
CodePipeline
 ↓
CodeBuild
 ↓
SageMaker Pipeline
 ↓
Model Registry
 ↓
Deployment
```

Không cần học CloudFormation syntax sâu.

---

# Day 20 — ECS / EKS / ECR

Screenshot nói cần hiểu basic level — đúng.

### ECR

```text
Docker image registry
```

### ECS

```text
AWS-native container orchestration
```

### EKS

```text
Managed Kubernetes
```

### Fargate

```text
serverless compute for containers
```

Trong MLA blueprint, ECS/EKS/ECR nằm trong scope; Domain 3 yêu cầu chọn giữa SageMaker endpoint, Kubernetes, ECS/EKS và Lambda. ([AWS Documentation][15])

---

# Day 21 — Mock Domain 3

Làm khoảng:

> 40–50 questions

Target:

> **≥75%**

Các câu phải làm tốt:

```text
Async vs Batch
Serverless vs Real-time
Autoscaling
BYOC
ECR
ECS vs EKS
CloudFormation
SageMaker Pipelines
```

---

# WEEK 4 — Monitoring + Security + Mock Exam

Domain 4 chiếm **24%** và tập trung vào monitoring, drift, infrastructure, cost và security. ([AWS Documentation][16])

---

# Day 22 — Model Monitor ⭐⭐⭐⭐⭐

Phải phân biệt 4 thứ:

```text
Data Quality Drift
Model Quality Drift
Bias Drift
Feature Attribution Drift
```

Mental model:

```text
Training data
     ↓
Baseline
     ↓
Production data
     ↓
Compare
     ↓
Violation
     ↓
CloudWatch Alert
```

AWS blueprint trực tiếp yêu cầu SageMaker Model Monitor. ([AWS Documentation][16])

Official documentation:
([AWS Documentation][17])

**Lưu ý thú vị:** AWS hiện đã đóng Model Monitor cho **new customers**, nhưng existing customers vẫn dùng được. Tuy nhiên MLA-C01 blueprint hiện tại vẫn nêu Model Monitor, nên **vẫn phải học cho kỳ thi C01**. ([AWS Documentation][17])

---

# Day 23 — SageMaker Clarify ⭐⭐⭐⭐⭐

Think:

```text
Clarify
 =
Bias
 +
Explainability
```

### Pre-training

Detect bias in dataset.

### Post-training

Detect bias in model.

### Explainability

Think:

```text
SHAP
```

Clarify được liệt kê nhiều lần trong Domain 1, 2 và 4. ([AWS Documentation][3])

AWS Clarify documentation:
([AWS Documentation][18])

Tương tự Model Monitor, Clarify đã thay đổi availability cho new customers từ 30/07/2026, nhưng C01 hiện tại vẫn yêu cầu kiến thức này. ([AWS Documentation][19])

---

# Day 24 — CloudWatch / CloudTrail

Học mental model:

```text
CloudWatch
→ metrics
→ logs
→ alarms

CloudTrail
→ who did what
→ AWS API activity
```

Ví dụ:

> Who deleted SageMaker endpoint?

```text
CloudTrail
```

> Endpoint latency increased?

```text
CloudWatch
```

Domain 4 yêu cầu CloudWatch, CloudTrail, EventBridge và observability/troubleshooting. ([AWS Documentation][16])

---

# Day 25 — IAM + SageMaker security ⭐⭐⭐⭐⭐

Screenshot cảnh báo phần AWS basics có thể xuất hiện khá nhiều.

Nắm:

```text
User
Role
Policy

Identity Policy
Resource Policy

Least privilege
```

SageMaker pattern:

```text
User
 ↓
IAM permission
 ↓
SageMaker

SageMaker
 ↓
Execution Role
 ↓
S3 / ECR / CloudWatch
```

Security là Task 4.3 riêng của exam, bao gồm IAM roles/policies, least privilege, VPC/subnet/security groups. ([AWS Documentation][16])

---

# Day 26 — VPC + Endpoint ⭐⭐⭐⭐

Screenshot đặc biệt nói về:

```text
VPC
Peering
VPC Endpoint
```

Với MLA mình sẽ ưu tiên:

```text
VPC
Subnet
Security Group

Gateway Endpoint
Interface Endpoint
PrivateLink
```

Mental model:

### Gateway Endpoint

Chủ yếu nhớ:

```text
S3
DynamoDB
```

### Interface Endpoint

Think:

```text
PrivateLink
ENI
private IP
AWS services
```

Example exam:

> SageMaker notebook must access S3 privately without public internet.

Think:

```text
S3 VPC Endpoint
```

VPC chính thức nằm trong in-scope services và secure networking nằm trong Domain 4. ([AWS Documentation][15])

---

# Day 27 — S3 Security + Cross-account

Screenshot có nhắc:

> Share S3 bucket from one AWS account to another.

Hiểu:

```text
Account A

S3 bucket
   ↓
Bucket Policy
   ↓
Account B IAM Role/User
```

Phải hiểu interaction giữa:

```text
IAM policy

+

Bucket policy
```

và encryption:

```text
SSE-S3
SSE-KMS
```

Nếu dùng KMS cross-account:

```text
IAM permission
+
KMS key policy
```

Không cần đi sâu S3 certification-level.

---

# Day 28 — Full Mock Exam #1

Thi như thật:

```text
65 questions
130 minutes
No Google
No notes
No pause
```

AWS hiện xác nhận MLA-C01 có 65 câu và 130 phút. ([Amazon Web Services, Inc.][20])

Target:

```text
<65%     🚨 chưa ready

65–74%   ⚠️ cần review

75–79%   👍 gần ready

80–85%   ✅ ready

>85%     🔥 very good
```

Đừng chỉ xem score.

Tạo:

```text
Wrong Answer Log

Question
Why wrong
Correct concept
Keyword
```

Ví dụ:

```text
Question:
Large payload + inference takes minutes

I chose:
Real-time

Correct:
Async

Reason:
Async handles long processing

Keyword:
large payload + long processing
```

---

# Day 29 — Weak-area day

Chỉ học những gì sai.

Nếu mock cho ra:

```text
Data Prep       85%
Model Dev       78%
Deployment      60%
Monitoring      80%
```

thì hôm nay:

> **80% thời gian dành cho Deployment.**

Không đọc lại toàn bộ course.

Review đặc biệt checklist từ screenshot:

* [ ] Data Wrangler vs DataBrew
* [ ] Model Monitor
* [ ] Clarify
* [ ] Accuracy / Precision / Recall / F1
* [ ] RMSE
* [ ] Serverless / Real-time / Async / Batch
* [ ] Autoscaling
* [ ] BYOM / Script Mode / Container
* [ ] S3 cross-account
* [ ] VPC endpoints
* [ ] IAM roles
* [ ] FSx
* [ ] CloudFormation
* [ ] ECS / EKS / ECR
* [ ] Bedrock
* [ ] RAG
* [ ] Fine-tuning
* [ ] temperature / top-p / top-k

---

# Day 30 — Final Mock + Exam readiness

Làm Official Practice Exam / Pretest.

AWS Skill Builder Exam Prep hiện cung cấp practice assessment, labs, videos và hơn 125 exam-style questions trong plan. ([AWS Skill Builder][4])

Mục tiêu cuối:

```text
Mock 1 ≥ 80%
Mock 2 ≥ 80%
Weak domains ≥ 75%
```

Nếu đạt:

> **Book/take the exam.**

---

# 6 bảng comparison bạn nên thuộc trước khi thi

## 1. Data preparation

| Requirement                  | Answer        |
| ---------------------------- | ------------- |
| ML visual preprocessing      | Data Wrangler |
| General visual data cleaning | DataBrew      |
| Distributed ETL              | Glue          |
| Big data processing          | EMR           |
| Feature repository           | Feature Store |

---

## 2. Inference

| Requirement              | Deployment |
| ------------------------ | ---------- |
| Low latency              | Real-time  |
| Sporadic traffic         | Serverless |
| Long-running request     | Async      |
| Millions records offline | Batch      |

---

## 3. Monitoring

| Requirement      | Service        |
| ---------------- | -------------- |
| Model/data drift | Model Monitor  |
| Bias             | Clarify        |
| Explain model    | Clarify / SHAP |
| Infra metrics    | CloudWatch     |
| API audit        | CloudTrail     |

---

## 4. SageMaker customization

| Requirement              | Choice             |
| ------------------------ | ------------------ |
| Built-in algorithm       | SageMaker Built-in |
| PyTorch + own Python     | Script Mode        |
| Unsupported dependencies | BYOC               |
| Own Docker               | ECR + SageMaker    |

---

## 5. Model metric

| Problem                    | Metric    |
| -------------------------- | --------- |
| Overall classification     | Accuracy  |
| False positives expensive  | Precision |
| False negatives expensive  | Recall    |
| Precision + Recall balance | F1        |
| Regression                 | RMSE/MAE  |
| Binary classifier quality  | ROC-AUC   |

---

## 6. LLM

| Requirement                | Choice        |
| -------------------------- | ------------- |
| Add company knowledge      | RAG           |
| Change model behavior      | Fine-tuning   |
| Less randomness            | ↓ Temperature |
| More creativity            | ↑ Temperature |
| Restrict token candidates  | Top-K         |
| Probability mass filtering | Top-P         |

---

# Tài liệu mình khuyên dùng theo thứ tự

Thay vì đọc AWS docs random, mình sẽ đi theo thứ tự này:

1. **AWS MLA-C01 Official Exam Guide** — dùng làm syllabus chính. ([AWS Documentation][1])
2. **AWS Skill Builder MLA-C01 Exam Prep Plan** — course + labs + question sets. ([AWS Skill Builder][4])
3. **Official Practice Question Set** — dùng sau Week 1–2. ([AWS Skill Builder][5])
4. **Official Pretest — 65 questions / 130 minutes** — dùng đầu tháng hoặc cuối Week 3. ([AWS Skill Builder][6])
5. **SageMaker Documentation** — reference khi không hiểu service. ([AWS Documentation][21])
6. **Data Wrangler documentation.** ([AWS Documentation][7])
7. **DataBrew Getting Started.** ([AWS Documentation][8])
8. **Model Monitor documentation.** ([AWS Documentation][17])
9. **Clarify documentation.** ([AWS Documentation][18])
10. **SageMaker inference/deployment documentation.** ([AWS Documentation][13])
11. **SageMaker Docker/BYOC documentation.** ([AWS Documentation][22])
12. **Bedrock inference parameters.** ([AWS Documentation][11])

---

# Một điều mình sẽ thay đổi lớn nhất sau screenshot

Ban đầu rất dễ nghĩ MLA là:

```text
70% Machine Learning
30% AWS
```

Mình **không khuyên học như vậy**.

Qua blueprint AWS và các điểm trong screenshot, mental model tốt hơn là:

```text
             MLA-C01

       ML concepts ~20%
              │
              ▼
          SageMaker
         ~40–45%
              │
       ┌──────┴──────┐
       ▼             ▼
 AWS Infra        MLOps
 ~20%             ~15–20%

IAM              Pipeline
S3               Deploy
VPC              Monitor
ECR              Scale
CloudWatch       CI/CD
```

Nói cách khác, câu hỏi thường không dừng ở:

> **“F1 score là gì?”**

mà có xu hướng thành:

> **“Model có class imbalance, false negative rất costly. Metric nào phù hợp, và AWS service nào giúp monitor model sau khi deployment?”**

Bạn cần nghĩ được:

```text
False negative costly
        ↓
Recall
        ↓
production model
        ↓
SageMaker endpoint
        ↓
Model Monitor
        ↓
CloudWatch
```

Đó mới là kiểu tư duy mình khuyên dùng để học MLA.

## Về phần online exam trong screenshot

Phần này nên xem là **kinh nghiệm cá nhân**, không nên coi tất cả chi tiết về iPhone/iPad/browser là rule chính thức. AWS hiện khuyến nghị chạy Pearson VUE system test **trên chính computer, network và địa điểm sẽ thi**, check-in sớm; nếu muộn hơn 15 phút hoặc máy không vượt system test thì có thể không được thi. Với online proctoring, webcam/screen sharing được sử dụng và bạn không được rời khỏi camera để nghỉ/restroom. ([Amazon Web Services, Inc.][23])

Nếu có lựa chọn, mình sẽ ưu tiên **test center** để giảm risk kỹ thuật. Nếu thi online, hãy chạy system test ít nhất vài ngày trước và chạy lại vào ngày thi. ([Amazon Web Services, Inc.][23])

**Theo lộ trình này, phần mình muốn bạn đầu tư nhiều nhất là Week 1 + Week 3:** Data Wrangler/DataBrew/data cleaning và SageMaker deployment/inference. Đây chính là hai cụm mà screenshot bạn gửi bổ sung rất tốt cho blueprint chính thức.

[1]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01.html "AWS Certified Machine Learning Engineer - Associate (MLA-C01) - AWS Certified Machine Learning Engineer - Associate"
[2]: https://aws.amazon.com/blogs/training-and-certification/updates-to-aws-certified-machine-learning-engineer-associate-mla-c02/ "Updates to AWS Certified Machine Learning Engineer – Associate (MLA-C02) | AWS Training and Certification Blog"
[3]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain1.html "Content Domain 1: Data Preparation for Machine Learning (ML) - AWS Certified Machine Learning Engineer - Associate"
[4]: https://skillbuilder.aws/learning-plan/A2FGY8CH1P/exam-prep-plan-aws-certified-machine-learning-engineer--associate-mlac01--english/3YFU86SSKN?utm_source=chatgpt.com "Exam Prep Plan: AWS Certified Machine Learning Engineer"
[5]: https://skillbuilder.aws/learn/H9QT54A6FP/official-practice-question-set-aws-certified-machine-learning-engineer--associate-mlac01--english/S32HWF3JVF?utm_source=chatgpt.com "AWS Certified Machine Learning Engineer"
[6]: https://skillbuilder.aws/learn/XNGDWPV3NM/official-pretest-aws-certified-machine-learning-engineer--associate-mlac01--english/NKATDW2W5D?utm_source=chatgpt.com "Official Pretest: AWS Certified Machine Learning Engineer"
[7]: https://docs.aws.amazon.com/sagemaker/latest/dg/data-wrangler.html?utm_source=chatgpt.com "Prepare ML Data with Amazon SageMaker Data Wrangler"
[8]: https://docs.aws.amazon.com/databrew/latest/dg/getting-started.html?utm_source=chatgpt.com "Getting started with AWS Glue DataBrew"
[9]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain2.html "Content Domain 2: ML Model Development - AWS Certified Machine Learning Engineer - Associate"
[10]: https://docs.aws.amazon.com/sagemaker/latest/dg/docker-containers-adapt-your-own.html?utm_source=chatgpt.com "Custom Docker containers with SageMaker AI"
[11]: https://docs.aws.amazon.com/bedrock/latest/userguide/inference-parameters.html?utm_source=chatgpt.com "Influence response generation with inference parameters"
[12]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain3.html "Content Domain 3: Deployment and Orchestration of ML Workflows - AWS Certified Machine Learning Engineer - Associate"
[13]: https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html?utm_source=chatgpt.com "Deploy models for inference - Amazon SageMaker AI"
[14]: https://docs.aws.amazon.com/sagemaker/latest/dg/endpoint-auto-scaling-policy.html?utm_source=chatgpt.com "Auto scaling policy overview - Amazon SageMaker AI"
[15]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/mla-01-in-scope-services.html "In-Scope AWS Services - AWS Certified Machine Learning Engineer - Associate"
[16]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain4.html "Content Domain 4: ML Solution Monitoring, Maintenance, and Security - AWS Certified Machine Learning Engineer - Associate"
[17]: https://docs.aws.amazon.com/sagemaker/latest/dg/model-monitor.html?utm_source=chatgpt.com "Data and model quality monitoring with ..."
[18]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-configure-processing-jobs.html?utm_source=chatgpt.com "Fairness, model explainability and bias detection with ..."
[19]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-availability-change.html?utm_source=chatgpt.com "Clarify availability change - Amazon SageMaker AI"
[20]: https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/?utm_source=chatgpt.com "AWS Certified Machine Learning Engineer – Associate"
[21]: https://docs.aws.amazon.com/sagemaker/?utm_source=chatgpt.com "Amazon SageMaker AI Documentation"
[22]: https://docs.aws.amazon.com/sagemaker/latest/dg/docker-containers.html?utm_source=chatgpt.com "Docker containers for training and deploying models"
[23]: https://aws.amazon.com/blogs/training-and-certification/5-tips-for-a-successful-online-proctored-aws-certification-exam/?utm_source=chatgpt.com "5 tips for a successful online-proctored AWS Certification ..."
