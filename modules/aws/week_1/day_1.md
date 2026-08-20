Dưới đây là **Day 1 theo đúng format**:

> **concept → ví dụ thực tế → AWS service → cách phân biệt → exam traps → 10 câu practice MLA-C01**

Mục tiêu của Day 1 chưa phải học sâu từng service. Bạn cần xây được **“map” của kỳ thi** để từ Day 2 trở đi biết mỗi kiến thức đang nằm ở đâu và câu hỏi đang test điều gì.

AWS xác nhận MLA-C01 kiểm tra khả năng **build, operationalize, deploy và maintain ML solutions/pipelines trên AWS**. Candidate target nên có nền tảng SageMaker/AWS ML engineering cùng kiến thức cơ bản về data engineering, deployment, monitoring, CI/CD và security. ([AWS Documentation][1])

---

# DAY 1 — Understand the MLA-C01 Exam

## Concept 1 — 4 Domains của MLA-C01

Đây là thứ đầu tiên nên thuộc.

```text
MLA-C01
│
├── Domain 1 — Data Preparation
│      28%
│
├── Domain 2 — Model Development
│      26%
│
├── Domain 3 — Deployment & Orchestration
│      22%
│
└── Domain 4 — Monitoring, Maintenance & Security
       24%
```

AWS phân bổ scored content đúng theo tỷ lệ này. ([AWS Documentation][1])

### Ý nghĩa

Không nên học theo kiểu:

```text
S3
SageMaker
Glue
CloudWatch
IAM
...
```

một cách rời rạc.

Nên học theo lifecycle:

```text
DATA
 ↓
PREPARE
 ↓
TRAIN
 ↓
EVALUATE
 ↓
DEPLOY
 ↓
MONITOR
 ↓
SECURE
```

Và map vào domain:

```text
DATA / PREPARE
→ Domain 1

TRAIN / EVALUATE
→ Domain 2

DEPLOY / PIPELINE
→ Domain 3

MONITOR / SECURE
→ Domain 4
```

---

# Ví dụ thực tế

Giả sử công ty muốn dự đoán customer churn.

```text
RDS customer data
        ↓
       S3
        ↓
Data Wrangler
        ↓
Training dataset
        ↓
SageMaker Training
        ↓
Model
        ↓
SageMaker Endpoint
        ↓
Production
        ↓
CloudWatch / Model Monitor
```

Mapping:

| Step                | Domain   |
| ------------------- | -------- |
| RDS → S3            | Domain 1 |
| Clean data          | Domain 1 |
| Feature engineering | Domain 1 |
| Train model         | Domain 2 |
| Evaluate F1         | Domain 2 |
| Deploy endpoint     | Domain 3 |
| Auto scaling        | Domain 3 |
| Monitor drift       | Domain 4 |
| IAM / encryption    | Domain 4 |

Đây là cách mình khuyên bạn nhìn gần như mọi scenario trong MLA.

---

# Cách phân biệt 4 domains

## Domain 1 — Data Preparation

Keyword:

```text
ingest
data source
storage
clean
transform
feature
encoding
missing value
bias in dataset
labeling
```

Ví dụ:

> "How should the engineer transform categorical customer data?"

→ Domain 1.

AWS Domain 1 có 3 task: ingest/store data, transform/feature engineering, và ensure data integrity/prepare for modeling. ([AWS Documentation][2])

---

## Domain 2 — Model Development

Keyword:

```text
algorithm
training
hyperparameter
accuracy
precision
recall
F1
RMSE
overfitting
model selection
```

Ví dụ:

> "False negatives are expensive. Which evaluation metric should be prioritized?"

→ Domain 2.

Domain 2 gồm choose modeling approach, train/refine models và analyze performance. ([AWS Documentation][3])

---

## Domain 3 — Deployment & Orchestration

Keyword:

```text
endpoint
real-time
async
serverless
batch inference
autoscaling
CI/CD
pipeline
deployment
container
```

Ví dụ:

> "Inference requests take several minutes and payloads are large."

→ Domain 3.

Domain 3 tập trung deployment infrastructure, infrastructure scripting và CI/CD orchestration. ([AWS Documentation][4])

---

## Domain 4 — Monitoring / Security

Keyword:

```text
drift
monitor
alarm
CloudWatch
CloudTrail
IAM
KMS
encryption
VPC
security
```

Ví dụ:

> "Detect when production input distribution changes."

→ Domain 4.

---

# Exam trap #1

Đề có thể đưa một scenario chứa nhiều domain.

Ví dụ:

> A company stores training data in S3. After deployment, prediction accuracy decreases because production data distribution changed.

Có hai concepts:

```text
S3
→ Domain 1

Production data distribution changed
→ Domain 4
```

Câu hỏi hỏi cái nào thì tập trung cái đó.

Nếu hỏi:

> Which solution detects this issue?

thì S3 chỉ là **noise**.

Đáp án liên quan monitoring/drift mới quan trọng.

---

# Concept 2 — MLA không phải kỳ thi về lý thuyết ML thuần túy

Một hiểu lầm phổ biến:

> MLA = thi Machine Learning algorithms.

Không hoàn toàn.

AWS mô tả candidate phải biết cả:

```text
Data engineering
ML
AWS infrastructure
Deployment
CI/CD
Monitoring
Security
```

([AWS Documentation][1])

Mental model tốt hơn:

```text
             MLA-C01

        ML Engineering
             │
  ┌──────────┼───────────┐
  │          │           │
 Data       Model      Production
  │          │           │
S3         Train       Deploy
Glue       Evaluate    Monitor
Kinesis    Tune        Scale
                      Secure
```

---

# Ví dụ thực tế

Developer A biết:

```python
model.fit(X, y)
```

nhưng không biết:

```text
data lấy từ đâu
model lưu ở đâu
endpoint deploy thế nào
IAM role nào
monitor drift thế nào
```

Developer đó **chưa đáp ứng toàn bộ mục tiêu MLA**.

MLA muốn bạn hiểu:

```text
Model
+
AWS production environment
```

---

# Exam trap #2

Đề thường không hỏi:

> What is Amazon SageMaker?

Mà hỏi:

> A company needs X, with constraints Y and Z. Which solution requires the least operational effort?

Có nghĩa bạn phải chọn dựa trên:

```text
Requirement
+
Trade-off
+
AWS service
```

Không chỉ definition.

---

# Concept 3 — Question Types

AWS hiện liệt kê 4 loại câu hỏi cho MLA-C01. ([AWS Documentation][1])

## 1. Multiple Choice

Có:

```text
1 correct
3 incorrect
```

Ví dụ:

> Which AWS service provides object storage?

A. EBS
B. EFS
C. S3
D. RDS

→ **C**

---

## 2. Multiple Response

Có:

```text
5+ options

2 hoặc nhiều correct answers
```

AWS yêu cầu chọn **tất cả đáp án đúng** mới được credit. ([AWS Documentation][1])

Ví dụ:

> Which TWO services can participate in streaming workloads?

* A. Kinesis
* B. Kafka
* C. EBS
* D. CloudFormation
* E. Route 53

→ A + B.

### Trap

Nếu chọn:

```text
A + B + C
```

vẫn sai.

---

# 3. Ordering

Bạn phải xếp 3–5 bước đúng thứ tự. ([AWS Documentation][1])

Ví dụ:

```text
A. Deploy
B. Train
C. Prepare data
D. Evaluate
```

Correct:

```text
Prepare data
   ↓
Train
   ↓
Evaluate
   ↓
Deploy
```

---

# 4. Matching

Bạn phải match nhiều concepts với requirement. AWS yêu cầu match toàn bộ chính xác để nhận credit. ([AWS Documentation][1])

Ví dụ:

| Requirement        | Answer |
| ------------------ | ------ |
| Object storage     | S3     |
| Serverless compute | Lambda |
| Container registry | ECR    |

---

# Exam trap #3 — Multiple Response

Khi câu hỏi nói:

> Which TWO...

việc đầu tiên:

```text
Need exactly 2 answers
```

Khi nói:

> Which THREE...

```text
Need exactly 3
```

Đừng đọc xong rồi quên số lượng.

Mình thường đánh dấu mental:

```text
[TWO]
```

trước khi đọc đáp án.

---

# Concept 4 — Exam Timing

AWS hiện ghi:

```text
65 questions
130 minutes
```

([Amazon Web Services, Inc.][5])

Average:

```text
130 / 65
= 2 minutes/question
```

Nhưng không nên cố 2 phút chính xác mỗi câu.

Mình đề xuất:

```text
Easy question
→ 30–60 sec

Normal
→ 1–2 min

Complex scenario
→ 2–3 min

Too hard
→ flag + continue
```

---

# Chiến thuật thời gian

## Pass 1

Khoảng:

```text
90 minutes
```

Làm những câu chắc chắn và medium.

Nếu một câu đã quá 2–3 phút:

```text
Flag
↓
Move on
```

---

## Pass 2

Còn khoảng:

```text
30–35 minutes
```

Quay lại flagged questions.

---

## Final review

Khoảng:

```text
5–10 minutes
```

Check:

```text
unanswered?
multiple response count?
ordering?
obvious mistakes?
```

---

# Exam trap #4 — Để trống câu

AWS ghi rõ:

> unanswered questions are scored incorrect và không có penalty cho guessing. ([AWS Documentation][1])

Vì vậy:

```text
Don't know
   ↓
Eliminate
   ↓
Guess
```

Không nên:

```text
Don't know
   ↓
Leave blank
```

---

# Concept 5 — Scoring

MLA-C01:

```text
50 scored questions
15 unscored questions
```

AWS không cho bạn biết câu nào là unscored. Passing score là:

```text
720 / 1000
```

([AWS Documentation][1])

Rất quan trọng:

> **720 không có nghĩa đơn giản là cần đúng 72%.**

AWS sử dụng scaled scoring.

Do đó trong practice test, đừng tính:

```text
72% practice
= chắc chắn pass
```

Không đúng.

---

# Strategy cho mock test

Mình dùng threshold thực dụng:

| Mock score | Interpretation |
| ---------: | -------------- |
|       <65% | chưa ready     |
|     65–74% | gap khá lớn    |
|     75–79% | gần ready      |
| **80–85%** | good target    |
|       >85% | rất tốt        |

Mục tiêu của bạn nên là:

> **ổn định ≥80%, không phải một lần may mắn 80%.**

---

# Exam trap #5 — Domain score

AWS dùng compensatory scoring: bạn **không bắt buộc pass từng domain riêng**, chỉ cần overall score đủ pass. ([AWS Documentation][1])

Ví dụ:

```text
Domain 1  90%
Domain 2  85%
Domain 3  68%
Domain 4  82%
```

Không có nghĩa automatically fail Domain 3 rồi fail exam.

Tuy nhiên khi ôn:

> Domain nào dưới ~70–75% vẫn nên xem là weakness.

---

# Concept 6 — In-Scope AWS Services

Danh sách chính thức khá dài và AWS nói rõ nó **non-exhaustive và có thể thay đổi**. ([AWS Documentation][6])

Bạn không cần học tất cả sâu như nhau.

Day 1 nên tạo một **service map**.

---

# AWS Service Map

## A. DATA / ANALYTICS

Các service in-scope gồm Athena, Data Firehose, EMR, Glue, DataBrew, Glue Data Quality, Kinesis, Lake Formation, Flink, OpenSearch và Redshift. ([AWS Documentation][6])

Exam priority mình đề xuất:

```text
★★★★★ Glue
★★★★★ Data Wrangler*
★★★★★ DataBrew
★★★★★ Kinesis

★★★★☆ EMR
★★★★☆ Flink
★★★★☆ Glue Data Quality
★★★☆☆ Athena
★★★☆☆ Redshift
```

*Data Wrangler là capability thuộc SageMaker.

Mental map:

```text
Data
 │
 ├── batch → Glue / EMR
 │
 └── stream → Kinesis / Flink
```

---

# B. STORAGE

Official in-scope:

```text
EBS
EFS
FSx
S3
S3 Glacier
Storage Gateway
```

([AWS Documentation][6])

Mental map:

```text
S3
→ object

EBS
→ block

EFS
→ shared file system

FSx
→ specialized managed file system
```

Week 1 sẽ đi sâu nhóm này.

---

# C. DATABASE

In scope:

```text
DocumentDB
DynamoDB
ElastiCache
Neptune
RDS
```

([AWS Documentation][6])

Day 1 chỉ cần:

```text
RDS
→ relational SQL

DynamoDB
→ NoSQL key-value/document
```

Các service khác học khi gặp relevant scenario.

---

# D. CORE ML

Danh sách ML rất rộng, nhưng service quan trọng nhất:

```text
Amazon SageMaker
```

Ngoài ra in-scope còn có Bedrock, Comprehend, Personalize, Rekognition, Textract, Transcribe, Translate và nhiều AI services khác. ([AWS Documentation][6])

Exam priority:

```text
★★★★★ SageMaker

★★★☆☆ Bedrock

★★☆☆☆ Comprehend
★★☆☆☆ Rekognition
★★☆☆☆ Textract
★★☆☆☆ Personalize
...
```

Không học tất cả ngang nhau.

---

# E. COMPUTE

In scope:

```text
AWS Batch
EC2
Lambda
```

và một số service khác. ([AWS Documentation][6])

Mental map:

```text
EC2
→ server / VM

Lambda
→ serverless function

Batch
→ batch compute jobs
```

---

# F. CONTAINERS

Official:

```text
ECR
ECS
EKS
```

([AWS Documentation][6])

Mental map:

```text
ECR
→ store Docker images

ECS
→ AWS container orchestration

EKS
→ Kubernetes
```

Quan trọng cho BYOC / deployment.

---

# G. ORCHESTRATION

Official in-scope:

```text
EventBridge
MWAA
SNS
SQS
Step Functions
```

([AWS Documentation][6])

Mental map:

```text
Step Functions
→ workflow orchestration

EventBridge
→ event routing

SQS
→ queue

SNS
→ pub/sub notification

MWAA
→ managed Airflow
```

---

# H. CI/CD

Official:

```text
CDK
CodeArtifact
CodeBuild
CodeDeploy
CodePipeline
```

([AWS Documentation][6])

Mental:

```text
CodePipeline
→ pipeline

CodeBuild
→ build/test

CodeDeploy
→ deployment

CDK
→ infrastructure as code
```

---

# I. MONITORING

High priority:

```text
CloudWatch
CloudWatch Logs
CloudTrail
CloudFormation
Auto Scaling
```

đều nằm trong official scope. ([AWS Documentation][6])

Mental:

```text
CloudWatch
→ metrics / alarms / logs

CloudTrail
→ AWS API audit

CloudFormation
→ IaC
```

---

# J. NETWORK

Official MLA scope có:

```text
API Gateway
CloudFront
Direct Connect
VPC
```

([AWS Documentation][6])

Trong practice MLA, ưu tiên hiểu:

```text
VPC
subnet
security group
VPC endpoint
private networking
```

hơn là học CloudFront sâu.

---

# K. SECURITY

Official in-scope:

```text
IAM
KMS
Macie
Secrets Manager
```

([AWS Documentation][6])

Mental:

```text
IAM
→ Who can do what?

KMS
→ Encryption keys

Secrets Manager
→ Credentials/secrets

Macie
→ sensitive data discovery in S3
```

---

# Cách phân biệt các service ngay Day 1

Bạn chưa cần biết implementation.

Chỉ cần làm được dạng:

| Keyword                     | Service        |
| --------------------------- | -------------- |
| object storage              | S3             |
| relational DB               | RDS            |
| NoSQL                       | DynamoDB       |
| ETL                         | Glue           |
| streaming                   | Kinesis        |
| distributed data processing | EMR            |
| serverless function         | Lambda         |
| ML platform                 | SageMaker      |
| container image             | ECR            |
| Kubernetes                  | EKS            |
| metrics/alarm               | CloudWatch     |
| API audit                   | CloudTrail     |
| encryption key              | KMS            |
| identity/permissions        | IAM            |
| workflow orchestration      | Step Functions |

---

# Exam trap #6 — Chọn service “quá mạnh”

AWS exam thường có nhiều đáp án technically possible.

Ví dụ:

> Run a small transformation every time an S3 file arrives. Processing takes 5 seconds.

Có thể technically dùng:

```text
EC2
ECS
EMR
Lambda
```

Nhưng requirement:

```text
small
event-driven
seconds
minimum operational overhead
```

→ **Lambda** thường tốt nhất.

Bạn phải đọc các qualifier:

```text
most cost-effective
least operational overhead
lowest latency
highly available
near real-time
minimal code changes
```

Những từ này thường quyết định đáp án.

---

# Exam trap #7 — AWS hay ưu tiên managed service

Ví dụ:

```text
Manage Kafka cluster yourself on EC2
```

vs managed alternative phù hợp.

Nếu requirement nói:

> minimize operational overhead

thì thường ưu tiên managed option.

Mental rule:

```text
Both work technically
      ↓
Which meets requirement
with less management?
```

Đừng chọn architecture phức tạp chỉ vì nó powerful.

---

# Exam trap #8 — Không nhìn keyword đơn lẻ

Ví dụ:

> The company wants to process millions of historical records overnight.

Có chữ:

```text
millions
```

nhưng keyword quan trọng hơn:

```text
historical
overnight
```

→ **batch**

không phải streaming.

Ngược lại:

> Customer transactions must be processed within seconds as they arrive.

→ **streaming**.

---

# Exam trap #9 — Security có thể xuất hiện ở mọi domain

Ví dụ Domain 1:

> Training data contains PII.

Có thể hỏi:

```text
encryption
masking
access control
```

Không phải cứ IAM/KMS là Domain 4 duy nhất.

AWS exam guide cũng đưa encryption, anonymization, masking, PII/PHI và data residency vào Domain 1 data preparation. ([AWS Documentation][2])

---

# Exam trap #10 — SageMaker không phải đáp án cho mọi thứ

Vì exam là MLA, dễ có tâm lý:

> Có SageMaker → chọn SageMaker.

Sai.

Ví dụ:

> Need durable low-cost object storage for 10 TB training dataset.

Đáp án:

```text
S3
```

không phải:

```text
SageMaker
```

SageMaker là ML platform; storage problem vẫn chọn storage service.

---

# Concept 7 — Baseline Test

Day 1 nên kết thúc bằng một baseline.

Mục tiêu baseline **không phải pass**.

Mục tiêu:

```text
Identify your gaps
```

AWS cũng khuyến nghị Official Pretest để xác định areas cần refresh. ([Amazon Web Services, Inc.][5])

---

# Cách làm baseline đúng

Không Google.

Không mở notes.

Làm như exam.

Sau đó không chỉ lưu:

```text
Score = 62%
```

Mà tạo bảng:

| Question | Domain | Why wrong                  |
| -------- | ------ | -------------------------- |
| Q3       | D1     | nhầm Glue/DataBrew         |
| Q8       | D2     | không hiểu Recall          |
| Q13      | D3     | nhầm Async/Batch           |
| Q17      | D4     | nhầm CloudWatch/CloudTrail |

Cuối test:

```text
D1  55%
D2  65%
D3  45%
D4  75%
```

Bạn lập tức biết:

```text
Highest gap
→ Domain 3

Second gap
→ Domain 1
```

---

# Wrong Answer Log

Mình rất khuyên tạo format này:

```text
Question:
Large payload, inference takes 10 minutes.

My answer:
Real-time endpoint

Correct:
Async inference

Why wrong:
I focused on "inference" but ignored long processing time.

Exam signal:
large payload + long-running request
→ Async inference
```

Điều cần lưu không phải:

> Q27 = B

mà là:

> **keyword → decision rule**

---

# 10 câu Practice MLA-C01 — Day 1

Hãy làm trước khi xem đáp án.

## Question 1

Which MLA-C01 domain has the highest weighting?

A. Model Development
B. Data Preparation for ML
C. Deployment and Orchestration
D. Monitoring, Maintenance, and Security

---

## Question 2

A company needs to remove missing values, encode categorical variables, and create new features before training a model.

Which domain primarily covers these tasks?

A. Domain 1
B. Domain 2
C. Domain 3
D. Domain 4

---

## Question 3

A machine learning engineer needs to evaluate whether a classifier should prioritize precision or recall.

Which domain primarily covers this task?

A. Domain 1
B. Domain 2
C. Domain 3
D. Domain 4

---

## Question 4

A model has already been trained. The engineer now needs to choose between real-time inference and asynchronous inference.

Which domain primarily covers this decision?

A. Domain 1
B. Domain 2
C. Domain 3
D. Domain 4

---

## Question 5

A company wants to detect changes in production data distribution after model deployment.

Which domain primarily covers this task?

A. Domain 1
B. Domain 2
C. Domain 3
D. Domain 4

---

## Question 6

A company needs durable object storage for several terabytes of training data.

Which AWS service is the MOST appropriate?

A. Amazon EBS
B. Amazon S3
C. Amazon RDS
D. Amazon ECR

---

## Question 7

A team needs a managed service to perform ETL on large datasets stored in Amazon S3.

Which service is the BEST fit?

A. AWS Glue
B. IAM
C. Amazon CloudWatch
D. AWS KMS

---

## Question 8

A machine learning application needs to ingest events continuously as customers click items on a website.

Which AWS service should the engineer consider first?

A. Amazon EBS
B. Amazon Kinesis
C. AWS CloudFormation
D. Amazon ECR

---

## Question 9

An engineer wants to determine which IAM principal deleted a SageMaker endpoint yesterday.

Which service should the engineer use?

A. Amazon CloudWatch
B. AWS CloudTrail
C. AWS Glue
D. Amazon Kinesis

---

## Question 10

A Multiple Response question states:

> Select TWO answers.

You identify three answers that could technically work, but only two satisfy all stated requirements.

What should you do?

A. Select all three because they are technically possible
B. Select only the two that satisfy every requirement
C. Select the cheapest two regardless of requirements
D. Leave the question unanswered

---

# Đáp án

```text
1. B
2. A
3. B
4. C
5. D
6. B
7. A
8. B
9. B
10. B
```

---

# Giải thích từng câu

## Q1 → B — Data Preparation

Weights:

```text
D1 = 28%
D2 = 26%
D3 = 22%
D4 = 24%
```

D1 lớn nhất. ([AWS Documentation][1])

---

## Q2 → A — Domain 1

Keywords:

```text
missing values
categorical encoding
feature engineering
```

→ Data Preparation.

---

## Q3 → B — Domain 2

```text
Precision
Recall
F1
RMSE
```

là model performance/evaluation concepts.

→ Model Development.

---

## Q4 → C — Domain 3

```text
Real-time
Async
Serverless
Batch
```

đều liên quan deployment/inference.

---

## Q5 → D — Domain 4

```text
Production
+
distribution changed
```

→ data drift / monitoring.

---

## Q6 → B — S3

Requirement:

```text
terabytes
durable
object storage
training data
```

→ S3.

EBS là block storage.

ECR lưu container images.

RDS là relational database.

---

## Q7 → A — Glue

Keyword:

```text
managed
ETL
large dataset
S3
```

→ AWS Glue.

---

## Q8 → B — Kinesis

Keyword:

```text
events continuously
as customers click
```

→ streaming ingestion.

→ Kinesis.

---

## Q9 → B — CloudTrail

Question:

> **Who performed an AWS API action?**

Think:

```text
CloudTrail
```

Nếu hỏi:

> CPU / latency / alarm?

Think:

```text
CloudWatch
```

---

## Q10 → B

Multiple Response yêu cầu chọn chính xác số lượng đáp án đúng. AWS yêu cầu tất cả correct responses để nhận credit. ([AWS Documentation][1])

---

# 5 distinction bắt buộc nhớ sau Day 1

Nếu chỉ học một phần của Day 1, hãy thuộc bảng này:

| A          | B          | Khác nhau                                               |
| ---------- | ---------- | ------------------------------------------------------- |
| Domain 1   | Domain 2   | **data** vs **model**                                   |
| Domain 2   | Domain 3   | **train/evaluate** vs **deploy**                        |
| Domain 3   | Domain 4   | **put into production** vs **operate after production** |
| CloudWatch | CloudTrail | **metrics/logs/alarm** vs **API audit**                 |
| S3         | SageMaker  | **store data** vs **ML platform**                       |

---

# Definition map Day 1

Bạn nên có thể nhìn bảng này và trả lời trong vài giây:

```text
S3
→ Object storage

Glue
→ ETL

Kinesis
→ Streaming

SageMaker
→ ML platform

ECR
→ Container images

Lambda
→ Serverless compute

Step Functions
→ Workflow

CloudWatch
→ Metrics / alarms

CloudTrail
→ API audit

IAM
→ Permissions

KMS
→ Encryption keys
```

---

# Checklist hoàn thành Day 1

Trước khi chuyển Day 2, bạn nên tự trả lời được:

* [ ] MLA-C01 test điều gì?
* [ ] 4 domains là gì?
* [ ] Tỷ trọng từng domain?
* [ ] Data preparation khác model development thế nào?
* [ ] Model development khác deployment thế nào?
* [ ] Deployment khác monitoring thế nào?
* [ ] 4 dạng question là gì?
* [ ] Multiple Response có rule gì?
* [ ] 65 questions / 130 minutes nghĩa là khoảng bao nhiêu phút/câu?
* [ ] Có nên để câu unanswered không?
* [ ] S3, Glue, Kinesis, SageMaker, CloudWatch, CloudTrail, IAM, KMS làm gì ở high level?
* [ ] Khi gặp một scenario, có thể xác định nó thuộc domain nào không?

Nếu bạn đạt khoảng **8/10 câu practice trở lên**, Day 1 là đủ để chuyển sang **Day 2 — Storage & Data Sources**, nơi cần đi sâu **S3 vs EBS vs EFS vs FSx vs RDS vs DynamoDB**, kèm các scenario kiểu MLA và exam traps.

[1]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01.html "AWS Certified Machine Learning Engineer - Associate (MLA-C01) - AWS Certified Machine Learning Engineer - Associate"
[2]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain1.html "Content Domain 1: Data Preparation for Machine Learning (ML) - AWS Certified Machine Learning Engineer - Associate"
[3]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain2.html?utm_source=chatgpt.com "Content Domain 2: ML Model Development - AWS Certified Machine Learning Engineer - Associate"
[4]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain3.html?utm_source=chatgpt.com "Content Domain 3: Deployment and Orchestration of ML Workflows - AWS Certified Machine Learning Engineer - Associate"
[5]: https://aws.amazon.com/certification/certified-machine-learning-engineer-associate// "AWS Certified Machine Learning Engineer – Associate"
[6]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/mla-01-in-scope-services.html "In-Scope AWS Services - AWS Certified Machine Learning Engineer - Associate"
