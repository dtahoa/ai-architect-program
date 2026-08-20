Được. Day 2 mình sẽ đi sâu vào **Storage & Data Sources**, vì đây là phần nền tảng để sau này hiểu Data Wrangler, Feature Store và SageMaker Training.

AWS MLA-C01 Domain 1 yêu cầu bạn biết cách lấy dữ liệu từ **S3, EBS, EFS, RDS, DynamoDB**, hiểu các AWS storage option và trade-off về **cost, performance, data structure**, đồng thời biết khi nào dùng FSx và cách đưa data vào training resource. ([AWS Documentation][1])

# DAY 2 — Storage & Data Sources

## Mục tiêu Day 2

Sau Day 2, khi gặp một câu hỏi như:

> "Company has 20 TB of training data. Where should it store the dataset?"

hoặc:

> "Multiple EC2 training nodes need concurrent access to the same POSIX file system."

hoặc:

> "Training requires extremely high-throughput access to data currently stored in S3."

Bạn phải lập tức nghĩ được:

```text
20 TB ML dataset
→ S3

Shared Linux filesystem
→ EFS

High-performance ML/HPC filesystem + S3
→ FSx for Lustre
```

Mental model của toàn Day 2:

```text
                       DATA
                        │
          ┌─────────────┼──────────────┐
          │             │              │
       Object          File          Block
          │             │              │
         S3         EFS / FSx         EBS
          │
          │
    ┌─────┴─────┐
    │           │
Relational     NoSQL
    │           │
   RDS       DynamoDB
```

---

# Concept 1 — Object vs Block vs File Storage

Đây là distinction quan trọng nhất của Day 2.

AWS không chỉ hỏi:

> EBS là gì?

Mà thường hỏi:

> Requirement này cần **object, block hay file storage**?

## Object Storage

Think:

```text
File
+
metadata
+
unique key
```

Ví dụ:

```text
s3://ml-data/training/customers.parquet
```

AWS service:

> **Amazon S3**

---

## Block Storage

Think:

```text
Virtual hard disk
      ↓
attached to server
```

AWS service:

> **Amazon EBS**

---

## File Storage

Think:

```text
/folder/subfolder/file.csv

shared filesystem
```

AWS services:

```text
EFS
FSx
```

---

# Cách phân biệt nhanh

| Requirement                             | Storage |
| --------------------------------------- | ------- |
| Store huge ML dataset                   | **S3**  |
| Disk attached to EC2                    | **EBS** |
| Shared Linux filesystem                 | **EFS** |
| High-performance/specialized filesystem | **FSx** |

Đây là bảng quan trọng nhất của Day 2.

---

# Concept 2 — Amazon S3 ⭐⭐⭐⭐⭐

## S3 là gì?

Amazon S3 là **object storage**.

Dữ liệu được tổ chức:

```text
Bucket
   │
   ├── raw/
   │    └── customers.csv
   │
   ├── processed/
   │    └── customers.parquet
   │
   ├── training/
   │    └── train.parquet
   │
   └── models/
        └── model.tar.gz
```

AWS định nghĩa bucket là container cho objects; object chứa content cùng metadata. ([AWS Documentation][2])

---

# Ví dụ thực tế

Bạn xây churn prediction.

Data:

```text
5 years transaction history
Size = 8 TB
```

Không cần database query transaction theo từng millisecond.

Bạn cần:

```text
durable
cheap
scalable
integrates with SageMaker
```

Architecture:

```text
POS / RDS / files
       ↓
      ETL
       ↓
       S3
       │
       ├── raw/
       ├── processed/
       └── training/
                ↓
        SageMaker Training
```

Đây là một pattern cực kỳ phổ biến.

---

# S3 không phải filesystem thông thường

Đây là exam trap.

S3 sử dụng:

```text
Bucket
+
Object Key
```

chứ không hoạt động giống disk filesystem truyền thống.

Ví dụ:

```text
training/2026/customer.parquet
```

nhìn giống:

```text
folder/folder/file
```

nhưng về concept S3 vẫn là:

```text
Object key:
training/2026/customer.parquet
```

---

# Khi nào nghĩ tới S3?

Keywords:

```text
object storage

training dataset

data lake

large dataset

model artifact

durable storage

raw data

processed data

batch input/output
```

→ **S3**

---

# S3 trong Machine Learning

Một ML pipeline rất thường có:

```text
                  S3

        ┌─────────┼─────────┐
        │         │         │
       Raw    Processed    Model
       Data      Data     Artifacts
        │         │         │
        └────┬────┘         │
             ▼              │
          Training          │
             │              │
             ▼              │
           Model ───────────┘
```

Bạn nên coi S3 là:

> **central storage layer của rất nhiều AWS ML workloads.**

---

# S3 Storage Classes

Exam MLA không cần đi sâu như SAA, nhưng nên hiểu high level.

```text
Frequently accessed
→ S3 Standard

Unknown/changing access
→ Intelligent-Tiering

Infrequently accessed
→ Standard-IA

Archive
→ Glacier classes
```

### Ví dụ

Current training dataset:

```text
actively used every day
```

→ S3 Standard.

Dataset của model 5 năm trước:

```text
must retain for compliance
almost never accessed
```

→ Glacier-related storage có thể hợp lý.

---

# Exam trap — Glacier cho training data

Nếu question nói:

> Training job must immediately access data every day.

Không chọn Glacier chỉ vì:

> cheaper.

Requirement quan trọng hơn:

```text
immediate/frequent access
```

---

# Concept 3 — Amazon EBS ⭐⭐⭐

Amazon Elastic Block Store cung cấp **block storage** cho EC2. ([AWS Documentation][3])

Mental model:

```text
EC2 Instance
      │
      ▼
   EBS Volume
```

Hãy tưởng tượng:

> EBS ≈ virtual SSD/HDD.

---

# Ví dụ thực tế

Bạn chạy:

```text
EC2 instance
  │
  ├── OS
  ├── Python
  ├── local temporary processing
  └── ML data
        ↓
       EBS
```

Application cần disk có:

```text
low latency
random read/write
high IOPS
```

→ EBS có thể hợp lý.

---

# EBS Provisioned IOPS

MLA Domain 1 còn explicitly nhắc tới:

> Amazon EBS Provisioned IOPS

như một option candidate nên hiểu khi extracting/storing data. ([AWS Documentation][1])

Mental model:

```text
Need predictable high I/O performance
            ↓
       Provisioned IOPS
```

Không cần nhớ toàn bộ throughput numbers.

---

# EBS có shared được không?

Đừng tạo mental model:

```text
100 EC2
   ↓
one normal EBS volume
```

EBS chủ yếu gắn với compute instances theo block-storage semantics.

Nếu đề nhấn mạnh:

```text
many Linux instances
+
same shared filesystem
```

thường nghĩ:

> **EFS**

chứ không phải EBS.

---

# S3 vs EBS

|                     | S3                | EBS                  |
| ------------------- | ----------------- | -------------------- |
| Type                | Object            | Block                |
| Typical use         | Dataset/data lake | Instance disk        |
| Access              | API/object        | Mounted block device |
| Scale               | Extremely large   | Volume               |
| Tied to EC2         | No                | Typically yes        |
| ML training dataset | ⭐⭐⭐⭐⭐             | ⭐⭐                   |
| Random disk I/O     | ❌ not same model  | ✅                    |

Exam shortcut:

```text
"store 100 TB training data"
→ S3

"EC2 requires high IOPS disk"
→ EBS
```

---

# Exam Trap — Storage ≠ Database

Nếu question nói:

> Store 50 TB training images.

Đừng chọn RDS.

Images là:

```text
objects
```

→ S3.

Nếu nói:

> Application needs transactional SQL queries.

→ RDS.

---

# Concept 4 — Amazon EFS ⭐⭐⭐

EFS = **Elastic File System**.

Think:

> Managed shared file system.

Mental model:

```text
EC2 A ─────┐
           │
EC2 B ─────┼──→ EFS
           │
EC2 C ─────┘

          /ml-data/
```

AWS documentation describes EFS as a file system that can be mounted by compute resources through VPC mount targets. ([AWS Documentation][4])

---

# Ví dụ thực tế

Bạn có nhiều training workers:

```text
Worker 1
Worker 2
Worker 3
Worker 4
```

Tất cả cần:

```text
/ml/training/images/
```

Architecture:

```text
Worker 1 ──┐
Worker 2 ──┤
Worker 3 ──┼── EFS
Worker 4 ──┘
```

EFS phù hợp hơn việc mỗi worker tự download một copy.

---

# EFS dùng filesystem semantics

Bạn có thể hình dung:

```text
/data
/data/images
/data/model
```

Application sử dụng filesystem-like access.

Điều này khác S3.

S3:

```text
GET object
PUT object
```

EFS:

```text
open()
read()
write()
directory
file
```

---

# S3 vs EFS ⭐⭐⭐⭐⭐

Đây là distinction rất quan trọng.

## Scenario A

> Store 30 TB training images cheaply and durably.

```text
→ S3
```

## Scenario B

> Multiple Linux compute instances need concurrent filesystem access.

```text
→ EFS
```

Mental rule:

```text
Object?
→ S3

File system?
→ EFS
```

---

# Concept 5 — Amazon FSx ⭐⭐⭐⭐

FSx là một family của managed file systems.

Trong MLA-C01 official Domain 1, AWS explicitly nhắc **Amazon FSx for NetApp ONTAP** trong core data sources và yêu cầu hiểu cách configure data để load vào training resources từ EFS/FSx. ([AWS Documentation][1])

Ngoài ra, với ML workload bạn rất nên biết:

> **FSx for Lustre**

vì đây là service dễ xuất hiện trong scenario hiệu năng cao.

---

# FSx for Lustre

Mental model:

```text
S3
 │
 │ large ML dataset
 ▼
FSx for Lustre
 │
 │ very high throughput
 ▼
Training cluster
```

AWS mô tả FSx for Lustre là high-performance filesystem tối ưu cho workload processing như **machine learning và HPC**, đồng thời tích hợp native với S3. ([AWS Documentation][5])

---

# Ví dụ thực tế

Dataset:

```text
10 million images
50 TB
```

Training trên nhiều GPU.

Nếu mỗi GPU worker đọc data từ storage chậm:

```text
GPU
 ↓
WAITING FOR DATA
 ↓
expensive GPU idle
```

Ta cần:

```text
very high throughput
parallel filesystem
```

→ FSx for Lustre.

Architecture:

```text
              S3
               │
        long-term storage
               │
               ▼
        FSx for Lustre
               │
        high throughput
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
      GPU     GPU      GPU
```

---

# S3 vs FSx for Lustre

Đây là exam distinction rất hay.

```text
S3
→ durable object storage

FSx for Lustre
→ high-performance filesystem
```

Không phải chọn một và bỏ một.

Có thể:

```text
S3
+
FSx for Lustre
```

cùng tồn tại.

---

# Ví dụ

S3:

```text
Store dataset long term
```

FSx:

```text
Feed training cluster quickly
```

Pattern:

```text
Long-term dataset
      ↓
      S3
      ↓
FSx for Lustre
      ↓
GPU Training
```

---

# EFS vs FSx for Lustre

| Requirement                    |                EFS |      FSx for Lustre |
| ------------------------------ | -----------------: | ------------------: |
| Shared filesystem              |                  ✅ |                   ✅ |
| General Linux shared files     |              ⭐⭐⭐⭐⭐ |                  ⭐⭐ |
| ML/HPC performance             |                ⭐⭐⭐ |               ⭐⭐⭐⭐⭐ |
| Massive parallel throughput    |                 ⭐⭐ |               ⭐⭐⭐⭐⭐ |
| Integration with S3 ML dataset | Possible workflows | **Strong use case** |

Exam shortcut:

```text
Shared filesystem
→ EFS

Extremely high-performance ML/HPC
→ FSx for Lustre
```

---

# FSx for NetApp ONTAP

Không nên bỏ qua vì AWS explicitly nhắc nó trong MLA-C01 blueprint. ([AWS Documentation][1])

High-level mental model:

```text
Existing enterprise NetApp-style workloads
+
managed AWS filesystem
+
enterprise storage capabilities
       ↓
FSx for NetApp ONTAP
```

Không cần học administration sâu cho MLA.

### Cần phân biệt

```text
ML/HPC + high throughput
→ FSx for Lustre

NetApp enterprise filesystem requirement
→ FSx for NetApp ONTAP
```

---

# Concept 6 — Amazon RDS ⭐⭐⭐

RDS = managed **relational database** service.

AWS manages much of:

```text
provisioning
backups
patching
monitoring
database infrastructure
```

và supports engines như MySQL, PostgreSQL, MariaDB, Oracle và SQL Server. ([AWS Documentation][6])

Mental model:

```text
Tables
  │
  ├── Customers
  ├── Orders
  └── Products

SQL
JOIN
WHERE
GROUP BY
```

---

# Ví dụ thực tế

Production application:

```text
customers

id | name | age
1  | A    | 25
2  | B    | 31
```

Orders:

```text
customer_id | product | amount
1           | X       | 100
1           | Y       | 200
```

ML pipeline muốn tạo:

```text
customer_id
total_orders
average_order_value
```

Có thể:

```text
RDS
 ↓
extract data
 ↓
Glue
 ↓
S3
 ↓
training
```

---

# RDS thường là SOURCE, không nhất thiết là training store

Đây là point quan trọng.

Production:

```text
Application
    ↓
   RDS
```

ML:

```text
RDS
 ↓
ETL
 ↓
S3
 ↓
SageMaker
```

Bạn thường không muốn training job:

```text
scan production RDS continuously
```

vì:

```text
training = large read workload
production DB = operational workload
```

Có thể ảnh hưởng application.

---

# Exam trap — RDS vs S3

Scenario:

> Customer records currently reside in RDS. The company needs to train models repeatedly over five years of historical data.

Question:

> Where should training datasets be stored cost-effectively?

Có chữ **RDS**, nhưng đó là current source.

Better pattern:

```text
RDS
 ↓
extract
 ↓
S3
 ↓
Training
```

Đừng keyword-match:

> saw RDS → answer RDS.

---

# Concept 7 — Amazon DynamoDB ⭐⭐⭐

DynamoDB là:

> serverless, fully managed distributed **NoSQL database**.

AWS mô tả DynamoDB cung cấp single-digit millisecond performance ở scale lớn. ([AWS Documentation][7])

Mental model:

```text
Partition Key
       ↓
      Item
```

Ví dụ:

```text
customer_id = C123

{
  name: "John",
  plan: "Premium",
  login_count: 25
}
```

---

# DynamoDB khác RDS như thế nào?

## RDS

Think:

```text
relational

tables
SQL
joins
relationships
```

## DynamoDB

Think:

```text
NoSQL

key-value/document
massive scale
predictable low latency
access-pattern driven
```

---

# Ví dụ thực tế

User profile application:

```text
user_id
   ↓
DynamoDB
   ↓
profile
```

ML pipeline:

```text
DynamoDB
    ↓
extract
    ↓
processed dataset
    ↓
S3
    ↓
SageMaker
```

DynamoDB cũng được liệt kê trực tiếp trong Domain 1 như một storage source mà candidate cần biết cách extract data. ([AWS Documentation][1])

---

# RDS vs DynamoDB ⭐⭐⭐⭐

|              | RDS                        | DynamoDB                     |
| ------------ | -------------------------- | ---------------------------- |
| Type         | Relational                 | NoSQL                        |
| SQL          | ✅                          | Not relational SQL model     |
| JOIN         | Natural fit                | Avoid relational join design |
| Schema       | Structured                 | Flexible                     |
| Access       | Queries/relations          | Key/access patterns          |
| Scale        | Managed relational scaling | Massive distributed scaling  |
| Latency goal | DB dependent               | Single-digit ms design goal  |

Exam shortcut:

```text
Relationships + SQL
→ RDS

Key-value + huge scale + predictable low latency
→ DynamoDB
```

---

# Concept 8 — Operational Data vs Analytical / Training Data

Đây là concept quan trọng hơn việc nhớ service definition.

## Operational data

Ví dụ:

```text
customer login
shopping cart
orders
account details
```

Services thường gặp:

```text
RDS
DynamoDB
```

Purpose:

```text
serve application
```

---

## Training / analytical data

Ví dụ:

```text
3 years orders
500 million click events
historical customer behavior
```

Thường:

```text
S3
```

Purpose:

```text
analytics
training
batch processing
```

---

# Architecture thực tế

```text
APPLICATION
     │
 ┌───┴──────┐
 ▼          ▼
RDS     DynamoDB
 │          │
 └────┬─────┘
      │
     ETL
      │
      ▼
     S3
      │
      ▼
Data Preparation
      │
      ▼
SageMaker
```

Đây là architecture mental model cực kỳ hữu ích cho MLA.

---

# Concept 9 — Data source khác training storage

Một question có thể nói:

> Data originates from DynamoDB.

Điều này không có nghĩa:

```text
train from DynamoDB
```

Có thể architecture tốt hơn:

```text
DynamoDB
   │
extract
   ▼
  S3
   │
transform
   ▼
training.parquet
   │
   ▼
SageMaker
```

AWS Domain 1 kiểm tra khả năng **extract data from sources**, merge data và đưa dữ liệu vào SageMaker-related workflows. ([AWS Documentation][1])

---

# Concept 10 — Storage Decision = Cost + Performance + Structure

AWS explicitly yêu cầu candidate đưa ra storage decision dựa trên:

```text
Cost
+
Performance
+
Data Structure
```

([AWS Documentation][1])

Đây là framework bạn nên dùng khi thi.

---

## 1. Structure

Hỏi:

```text
Object?
File?
Block?
Relational?
NoSQL?
```

---

## 2. Performance

Hỏi:

```text
High IOPS?

Shared filesystem?

Massive parallel throughput?

Low-latency database lookup?
```

---

## 3. Cost

Hỏi:

```text
10 GB?
10 TB?
1 PB?

Frequently accessed?
Archive?

Always running?
```

---

# Decision Tree — cực kỳ nên thuộc

```text
Need to store/access data
          │
          ▼
Is it relational operational data?
    │
  YES ───────────→ RDS
    │ NO
    ▼
NoSQL/key-value operational data?
    │
  YES ───────────→ DynamoDB
    │ NO
    ▼
Large object/dataset storage?
    │
  YES ───────────→ S3
    │ NO
    ▼
Need block disk for compute?
    │
  YES ───────────→ EBS
    │ NO
    ▼
Need shared filesystem?
    │
  YES
    ▼
Extreme ML/HPC throughput?
    │
 YES ────────────→ FSx for Lustre
    │
    NO
    ▼
   EFS
```

Nếu bạn nhớ được diagram này thì Day 2 đã thành công khoảng 70%.

---

# Concept 11 — S3 + SageMaker

Một trong những patterns quan trọng nhất MLA:

```text
              S3
               │
        training dataset
               │
               ▼
      SageMaker Training
               │
               ▼
             Model
               │
               ▼
              S3
        model artifacts
```

Do đó khi đọc scenario:

> training data stored in S3

đây là hoàn toàn bình thường.

---

# Concept 12 — File Storage + SageMaker Training

Có những dataset/workload phù hợp filesystem hơn object storage.

AWS Domain 1 thậm chí yêu cầu hiểu:

> configuring data to load into model training resources using Amazon EFS and Amazon FSx. ([AWS Documentation][1])

Ví dụ:

```text
Millions of tiny files
+
training framework expects filesystem
```

Có thể:

```text
EFS / FSx
     ↓
Training
```

Nếu thêm:

```text
extremely high throughput
HPC
many GPU workers
```

→ nghiêng về FSx for Lustre.

---

# Concept 13 — Availability và Durability

Hai từ này dễ bị lẫn.

## Durability

> Data có bị mất không?

Mental:

```text
Store data
   ↓
years later
   ↓
still exists
```

---

## Availability

> Service/data có truy cập được khi cần không?

Mental:

```text
Can I access it now?
```

Ví dụ system có:

```text
99.99% availability
```

không có nghĩa:

```text
99.99% durability
```

Hai concept khác nhau.

---

# Concept 14 — IOPS vs Throughput

Đây là exam concept rất hữu ích.

## IOPS

> Input/output operations per second.

Think:

```text
many small random reads/writes
```

Ví dụ database disk.

---

## Throughput

> Amount of data transferred per second.

Think:

```text
MB/s
GB/s
```

Ví dụ:

```text
large training dataset
feeding many GPU workers
```

cần **high throughput**.

---

# Exam shortcut

```text
Many small random I/O operations
→ IOPS important

Huge ML dataset streaming to compute
→ throughput important
```

---

# Concept 15 — Latency vs Throughput

Đừng nhầm.

## Latency

```text
How long does ONE request take?
```

Example:

```text
5 ms
```

## Throughput

```text
How much can be processed per time?
```

Example:

```text
10 GB/s
```

Một storage system có thể:

```text
high throughput
```

nhưng không nhất thiết:

```text
lowest latency
```

---

# EXAM TRAPS — Day 2

## Trap 1 — S3 vs EFS

Question:

> Multiple training instances must simultaneously mount and modify files using POSIX filesystem semantics.

Có chữ:

```text
training
```

đừng automatic chọn S3.

Keyword quyết định:

```text
mount
shared
filesystem
```

→ **EFS**

---

# Trap 2 — S3 vs FSx

> Dataset is stored in S3. Hundreds of GPU workers require very high throughput.

Đừng nghĩ:

```text
Move everything permanently away from S3
```

Một pattern tốt:

```text
S3
 ↓
FSx for Lustre
 ↓
training
```

---

# Trap 3 — EBS vs EFS

Question:

> A single EC2 instance requires very high random I/O.

→ EBS.

Question:

> 20 EC2 instances require access to same filesystem.

→ EFS.

---

# Trap 4 — RDS vs DynamoDB

Question:

> Need complex relational queries and joins.

→ RDS.

Question:

> Key-value workload at massive scale with predictable low latency.

→ DynamoDB.

---

# Trap 5 — Data is currently in X

Đề:

> Customer data is currently stored in an RDS database...

Không có nghĩa answer chắc chắn là RDS.

Đọc **phần sau**:

> ...and must be used repeatedly to train ML models over historical data.

Potential solution:

```text
RDS → S3 → Training
```

---

# Trap 6 — "Cheapest"

Đề AWS thường nói:

> MOST cost-effective

Nhưng đừng chọn cheapest nếu không đáp ứng requirement.

```text
Requirement first
      ↓
candidate solutions
      ↓
cost optimization
```

Không phải:

```text
cheapest service
      ↓
hope it works
```

---

# Trap 7 — Database cho file/image data

Question:

> Millions of images for computer vision training.

Đừng chọn:

```text
RDS
```

chỉ vì "store data".

Think:

```text
objects
→ S3
```

---

# Trap 8 — Use EFS cho mọi shared data

Nếu scenario nói:

```text
high-performance computing
massive parallel ML training
high throughput
S3 dataset
```

thì **FSx for Lustre** thường hợp hơn general shared EFS.

---

# Trap 9 — DynamoDB ≠ Data warehouse

DynamoDB rất scalable.

Nhưng:

```text
scalable
≠
best analytical warehouse
```

Nếu requirement là:

```text
historical ML dataset
large analytics
```

thường không automatic chọn DynamoDB.

---

# Trap 10 — EBS ≠ permanent central ML data lake

Bạn có thể lưu data trên EBS.

Nhưng nếu requirement:

```text
100 TB
central
durable
many workflows
object dataset
```

→ S3 thường là lựa chọn phù hợp hơn.

---

# Comparison Table — phải thuộc

| Service        | Type          | Best mental keyword | Typical ML use              |
| -------------- | ------------- | ------------------- | --------------------------- |
| **S3**         | Object        | Dataset / data lake | Raw/training/model data     |
| **EBS**        | Block         | EC2 disk / IOPS     | Local compute storage       |
| **EFS**        | File          | Shared filesystem   | Shared training files       |
| **FSx Lustre** | File          | HPC / throughput    | High-performance training   |
| **RDS**        | Relational DB | SQL / JOIN          | Application source data     |
| **DynamoDB**   | NoSQL DB      | Key-value / scale   | Operational source/features |

---

# Keyword → Answer

Hãy luyện đến mức nhìn keyword là phản xạ:

```text
object storage
→ S3

training dataset
→ S3

data lake
→ S3

EC2 disk
→ EBS

high IOPS block device
→ EBS

shared Linux filesystem
→ EFS

many instances same files
→ EFS

high-performance ML filesystem
→ FSx for Lustre

HPC
→ FSx for Lustre

SQL + relationships
→ RDS

JOIN
→ RDS

NoSQL
→ DynamoDB

key-value
→ DynamoDB

single-digit millisecond scalable DB
→ DynamoDB
```

---

# Scenario tổng hợp

Giả sử hệ thống e-commerce:

```text
                 Application
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
         RDS                  DynamoDB
      Orders DB              User Session
          │                       │
          └──────────┬────────────┘
                     │
                   Extract
                     │
                     ▼
                    S3
             ┌───────┴───────┐
             │               │
            raw           processed
                             │
                             ▼
                      training.parquet
                             │
                             ▼
                        SageMaker
```

Bây giờ dataset rất lớn và multi-GPU training cần throughput cao:

```text
S3
 │
 ▼
FSx for Lustre
 │
 ├── GPU 1
 ├── GPU 2
 ├── GPU 3
 └── GPU N
```

Một EC2 processing server cần local high-IOPS scratch disk:

```text
EC2
 ↓
EBS
```

Một nhóm compute cần shared POSIX filesystem:

```text
EC2 ─┐
EC2 ─┼→ EFS
EC2 ─┘
```

Nếu bạn hiểu được architecture này thì các service của Day 2 sẽ không còn rời rạc.

---

# 10 câu Practice MLA-C01 — Day 2

**Hãy làm trước khi kéo xuống phần đáp án.**

## Question 1

A machine learning team needs to store 50 TB of image data for model training. The data must be highly durable and accessible by multiple AWS services.

Which storage service is MOST appropriate?

A. Amazon EBS
B. Amazon S3
C. Amazon RDS
D. Amazon DynamoDB

---

## Question 2

A company runs a data-processing application on a single EC2 instance. The application requires a high-performance block device with predictable IOPS.

Which service should the company use?

A. Amazon S3
B. Amazon EFS
C. Amazon EBS
D. Amazon DynamoDB

---

## Question 3

Twenty Linux EC2 instances need concurrent access to the same directory structure.

Which service is the BEST fit?

A. Amazon S3
B. Amazon EBS
C. Amazon EFS
D. Amazon DynamoDB

---

## Question 4

A company stores 40 TB of training data in Amazon S3. Hundreds of GPU workers need a high-performance parallel filesystem to access this dataset during training.

Which solution is MOST appropriate?

A. Move the data to DynamoDB
B. Use Amazon FSx for Lustre integrated with S3
C. Store all data in Amazon RDS
D. Attach one EBS volume to all GPU workers

---

## Question 5

An application requires complex SQL queries involving relationships between customers, orders, and products.

Which AWS service is the BEST choice?

A. DynamoDB
B. S3
C. RDS
D. EFS

---

## Question 6

An application stores user session information using a known key. The system needs predictable single-digit millisecond performance at very large scale and the team does not want to manage database servers.

Which service is MOST appropriate?

A. Amazon RDS
B. Amazon DynamoDB
C. Amazon EBS
D. Amazon FSx

---

## Question 7

A company's application stores operational customer data in RDS. The ML team needs five years of customer history for repeated model training while minimizing impact on the production database.

Which approach is BEST?

A. Run every training job directly against production RDS
B. Copy/extract historical data to S3 and train using that dataset
C. Move the production database to EBS
D. Store the data in ECR

---

## Question 8

A machine learning workload has millions of files and requires a shared POSIX filesystem. Performance requirements are moderate, and extreme HPC throughput is not required.

Which service should the engineer consider first?

A. EFS
B. S3 Glacier
C. DynamoDB
D. Kinesis

---

## Question 9

Which TWO statements are correct?

A. S3 is object storage.
B. EBS is primarily a managed relational database.
C. EFS provides filesystem-based shared storage.
D. DynamoDB is a relational SQL database.
E. RDS is object storage.

---

## Question 10 — Harder

A research company trains deep learning models using a multi-node GPU cluster. The dataset is stored durably in S3. Training is frequently bottlenecked because workers cannot read the training data fast enough. The company wants to retain S3 as its long-term data repository.

What is the BEST solution?

A. Increase the provisioned IOPS of S3
B. Copy the dataset into DynamoDB
C. Use FSx for Lustre with the S3 dataset
D. Store the dataset in RDS Multi-AZ

---

# Đáp án

```text
Q1  → B
Q2  → C
Q3  → C
Q4  → B
Q5  → C
Q6  → B
Q7  → B
Q8  → A
Q9  → A + C
Q10 → C
```

---

# Giải thích đáp án

## Q1 → S3

Keywords:

```text
50 TB
images
training
durable
multiple AWS services
```

Images là objects.

→ **S3**

---

## Q2 → EBS

Keywords:

```text
single EC2
block device
IOPS
```

→ **EBS**

MLA blueprint thậm chí nêu EBS Provisioned IOPS như kiến thức Domain 1. ([AWS Documentation][1])

---

## Q3 → EFS

Keywords:

```text
20 Linux EC2
same directory
concurrent access
```

→ shared filesystem.

→ **EFS**

---

## Q4 → FSx for Lustre

Keywords:

```text
S3 dataset
hundreds GPUs
parallel filesystem
high performance
```

→ **FSx for Lustre**

Đây là workload mà AWS mô tả FSx for Lustre rất phù hợp: ML/HPC workloads cần scalable high-speed filesystem access, với S3 integration. ([AWS Documentation][5])

---

## Q5 → RDS

Keywords:

```text
SQL
relationships
customer/order/product
```

→ relational DB.

→ **RDS**

---

## Q6 → DynamoDB

Keywords:

```text
known key
huge scale
single-digit milliseconds
serverless
```

→ DynamoDB. ([AWS Documentation][7])

---

## Q7 → RDS → S3

Production RDS là:

```text
operational database
```

Training workload có thể rất read-heavy.

Better:

```text
RDS
 ↓
extract
 ↓
S3
 ↓
training
```

---

## Q8 → EFS

Requirement:

```text
shared
POSIX filesystem
moderate performance
```

Không có HPC/high-throughput requirement.

→ **EFS**

---

## Q9 → A + C

```text
S3 = Object storage
EFS = File storage
```

EBS không phải database.

DynamoDB không phải relational DB.

RDS không phải object storage.

---

## Q10 → FSx for Lustre

Question có gần như đầy đủ exam signals:

```text
deep learning
multi-node GPU
S3
I/O bottleneck
high throughput
retain S3
```

Architecture:

```text
S3
 ↓
FSx for Lustre
 ↓
GPU cluster
```

→ **C**

---

# 5 câu nâng cao để tự kiểm tra

Không cần trả lời ngay; thử reasoning bằng decision tree.

### Scenario A

```text
10 PB historical images
infrequently accessed
must retain 7 years
```

Think:

```text
Object
+
archive
→ S3 archival storage
```

### Scenario B

```text
PostgreSQL
complex SQL
JOIN
transactions
```

→ RDS.

### Scenario C

```text
shopping cart
millions users
key-value
very low latency
```

→ DynamoDB.

### Scenario D

```text
one EC2
database scratch volume
very high random I/O
```

→ EBS.

### Scenario E

```text
128 GPU workers
dataset in S3
training data I/O bottleneck
```

→ FSx for Lustre.

---

# Wrong Answer Log cho Day 2

Nếu sai question nào, đừng ghi:

```text
Q4 = B
```

Hãy ghi:

```text
Question:
GPU training cannot read S3 data fast enough.

I chose:
EFS

Correct:
FSx for Lustre

Why:
I saw "shared filesystem"
but ignored "high-performance GPU / HPC".

Decision rule:
Shared general filesystem
→ EFS

High-performance ML/HPC filesystem
→ FSx for Lustre
```

Đây là cách học rất hiệu quả cho MLA.

---

# Final Cheat Sheet — Day 2

Trước khi kết thúc hôm nay, bạn nên thuộc mental map này:

```text
                         STORAGE
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
       OBJECT              FILE              BLOCK
         │                  │                  │
         S3             EFS / FSx             EBS
                            │
                     ┌──────┴──────┐
                     │             │
                   EFS          FSx Lustre
                     │             │
                  shared        ML / HPC
                  general       high throughput


                         DATABASE
                            │
                   ┌────────┴────────┐
                   │                 │
                  RDS            DynamoDB
                   │                 │
              relational           NoSQL
                  SQL             key-value
                 JOIN             massive scale
```

Và ML architecture:

```text
RDS / DynamoDB
       │
       │ operational data
       ▼
     Extract
       │
       ▼
      S3
       │
       │ historical/training data
       ▼
Data Preparation
       │
       ▼
  SageMaker Training
```

Nếu high-performance training:

```text
S3
 ↓
FSx for Lustre
 ↓
GPU Training
```

## Checklist hoàn thành Day 2

Bạn nên tự trả lời được:

* [ ] Object, block và file storage khác nhau như thế nào?
* [ ] S3 khác EBS thế nào?
* [ ] EBS khác EFS thế nào?
* [ ] EFS khác FSx for Lustre thế nào?
* [ ] Khi nào dùng S3 + FSx cùng lúc?
* [ ] RDS khác DynamoDB thế nào?
* [ ] Operational data khác training data thế nào?
* [ ] Vì sao không nên mặc định train trực tiếp từ production RDS?
* [ ] IOPS khác throughput thế nào?
* [ ] Latency khác throughput thế nào?
* [ ] Nhìn requirement có chọn được S3/EBS/EFS/FSx/RDS/DynamoDB không?

Nếu bạn làm được **8/10 practice questions trở lên và giải thích được tại sao 3 đáp án còn lại sai**, bạn có thể chuyển sang **Day 3 — Data Formats + Batch/Streaming Ingestion**. Day 3 mình sẽ đi sâu **CSV vs JSON vs Parquet vs ORC vs Avro vs RecordIO → Batch vs Streaming → Kinesis vs Kafka vs Flink → Glue/Spark**, cũng theo đúng format **concept → example → AWS service → comparison → exam traps → 10 câu MLA-C01**.

**Tài liệu AWS chính thức cho Day 2:** MLA-C01 Domain 1 [Domain 1 Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain1.html?utm_source=chatgpt.com) · Amazon S3 [S3 Getting Started](https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html?utm_source=chatgpt.com) · Amazon EBS [EBS Documentation](https://docs.aws.amazon.com/ebs/?utm_source=chatgpt.com) · Amazon EFS [EFS Getting Started](https://docs.aws.amazon.com/efs/latest/ug/getting-started.html?utm_source=chatgpt.com) · FSx for Lustre [FSx for Lustre and S3](https://docs.aws.amazon.com/fsx/latest/LustreGuide/fsx-data-repositories.html?utm_source=chatgpt.com) · DynamoDB [DynamoDB Introduction](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html?utm_source=chatgpt.com) · RDS [Amazon RDS Introduction](https://docs.aws.amazon.com/AmazonRDS/latest/gettingstartedguide/what-is-rds.html?utm_source=chatgpt.com).

Mình cũng có thể nhắc bạn học từng Day theo lộ trình MLA này để giữ đúng tiến độ 1 tháng.

[1]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain1.html?utm_source=chatgpt.com "Content Domain 1: Data Preparation for Machine Learning (ML) - AWS Certified Machine Learning Engineer - Associate"
[2]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html?utm_source=chatgpt.com "Getting started with Amazon S3 - Amazon Simple Storage Service"
[3]: https://docs.aws.amazon.com/ebs/?utm_source=chatgpt.com "Amazon EBS Documentation"
[4]: https://docs.aws.amazon.com/efs/latest/ug/creating-using-create-fs.html?utm_source=chatgpt.com "Creating EFS file systems - Amazon Elastic File System"
[5]: https://docs.aws.amazon.com/fsx/latest/LustreGuide/fsx-data-repositories.html?utm_source=chatgpt.com "Using data repositories with Amazon FSx for Lustre - FSx for Lustre"
[6]: https://docs.aws.amazon.com/AmazonRDS/latest/gettingstartedguide/what-is-rds.html?utm_source=chatgpt.com "Getting started with Amazon Relational Database Service - Amazon Relational Database Service"
[7]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html?utm_source=chatgpt.com "What is Amazon DynamoDB? - Amazon DynamoDB"
