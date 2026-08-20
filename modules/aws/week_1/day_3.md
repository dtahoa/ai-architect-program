Tiếp tục **Day 3 — Data Formats + Batch/Streaming Ingestion**. Đây là ngày rất quan trọng vì Domain 1 yêu cầu trực tiếp kiến thức về **Parquet, JSON, CSV, ORC, Avro, RecordIO**, cũng như ingestion bằng **Kinesis, Apache Flink, Apache Kafka**, và merge/transform bằng **AWS Glue / Apache Spark**. ([AWS Documentation][1])

Mục tiêu cuối Day 3 là khi nhìn requirement, bạn phải trả lời được:

```text
Data format nào?
    ↓
Batch hay Streaming?
    ↓
Ingest bằng service nào?
    ↓
Có cần transform/process không?
    ↓
Glue / Spark / Flink?
```

# DAY 3 — Data Formats + Batch & Streaming Ingestion

## Concept 1 — Data Format là gì?

Data format là **cách dữ liệu được encode và tổ chức khi lưu hoặc truyền**.

Ví dụ cùng một record:

```text
customer_id = 101
age = 30
country = VN
salary = 3000
```

Có thể lưu thành CSV:

```csv
101,30,VN,3000
```

hoặc JSON:

```json
{
  "customer_id": 101,
  "age": 30,
  "country": "VN",
  "salary": 3000
}
```

hoặc binary format:

```text
Parquet
Avro
ORC
RecordIO
```

Điều exam quan tâm không phải:

> "Parquet definition là gì?"

mà thường là:

> "Format nào phù hợp nhất với access pattern này?"

AWS Domain 1 nói rõ candidate phải biết chọn format dựa trên **data access patterns**. ([AWS Documentation][1])

---

# Concept 2 — Row-based vs Columnar Storage ⭐⭐⭐⭐⭐

Đây là concept quan trọng nhất của phần format.

Giả sử dataset:

| id | age | country | salary | churn |
| -: | --: | ------- | -----: | ----: |
|  1 |  25 | VN      |   3000 |     0 |
|  2 |  42 | US      |   5000 |     1 |
|  3 |  35 | SG      |   4000 |     0 |

## Row-oriented

Data được lưu theo row:

```text
Row 1:
1,25,VN,3000,0

Row 2:
2,42,US,5000,1

Row 3:
3,35,SG,4000,0
```

Think:

```text
CSV
JSON-like records
Avro
```

---

## Column-oriented

Data được lưu theo column:

```text
id:
1,2,3

age:
25,42,35

country:
VN,US,SG

salary:
3000,5000,4000
```

Think:

```text
Parquet
ORC
```

---

# Ví dụ thực tế

Dataset có:

```text
100 columns
1 billion rows
```

Nhưng query chỉ cần:

```text
age
salary
churn
```

Nếu row-based:

```text
read lots of unnecessary data
```

Nếu columnar:

```text
read only:
age
salary
churn
```

→ ít I/O hơn.

---

# Exam shortcut

```text
Large analytics dataset
+
query subset of columns
+
reduce scan cost
+
compression

→ Parquet / ORC
```

---

# Concept 3 — CSV ⭐⭐⭐⭐

CSV = **Comma-Separated Values**.

Ví dụ:

```csv
customer_id,age,country
1,25,VN
2,40,US
3,30,SG
```

### Ưu điểm

```text
Simple
Human-readable
Widely supported
Easy to exchange
```

### Nhược điểm

```text
No rich schema
No nested structures
Usually larger
Less efficient analytics
```

---

# Ví dụ thực tế

Bạn có:

```text
customer_list.csv
10 MB
```

cần gửi cho team khác hoặc test model nhanh.

CSV hoàn toàn ổn.

---

# Khi nào chọn CSV?

Exam signals:

```text
simple
small dataset
human readable
compatibility
easy interchange
```

→ CSV.

---

# Exam trap

Question:

> 15 TB dataset is frequently queried by only 5 out of 100 columns.

Đừng chọn CSV vì:

> easy.

Requirement là analytics performance.

→ **Parquet** thường hợp hơn.

---

# Concept 4 — JSON ⭐⭐⭐⭐

JSON phù hợp với **semi-structured / nested data**.

Ví dụ:

```json
{
  "customer_id": 101,
  "name": "Alex",
  "address": {
    "city": "HCM",
    "country": "VN"
  },
  "interests": ["AWS", "AI"]
}
```

CSV xử lý nested data này không tự nhiên.

---

# Ví dụ thực tế

API response:

```text
GET /customer/101
```

Response:

```json
{
  "id": 101,
  "orders": [
    {"product": "A", "price": 100},
    {"product": "B", "price": 200}
  ]
}
```

JSON rất phù hợp.

---

# Exam keyword

```text
API
nested
semi-structured
documents
variable fields
```

→ JSON.

---

# CSV vs JSON

| Requirement           |        CSV |       JSON |
| --------------------- | ---------: | ---------: |
| Flat table            |          ✅ |          ✅ |
| Nested structure      |          ❌ |          ✅ |
| Human-readable        |          ✅ |          ✅ |
| Simple analytics file |          ✅ |          ✅ |
| API payload           |         ⭐⭐ |      ⭐⭐⭐⭐⭐ |
| File size efficient   | Usually no | Usually no |

Mental:

```text
Flat
→ CSV

Nested/semi-structured
→ JSON
```

---

# Concept 5 — Apache Parquet ⭐⭐⭐⭐⭐

Parquet là **columnar binary storage format**.

Đây là format cực kỳ quan trọng trong AWS analytics/ML.

Mental:

```text
Huge dataset
     ↓
Columnar
     ↓
Compression
     ↓
Efficient analytics
```

---

# Ví dụ thực tế

Dataset:

```text
1 TB
100 columns
```

Model training chỉ dùng:

```text
age
salary
purchase_count
churn
```

Parquet cho phép processing system đọc chủ yếu các columns cần.

---

# Vì sao Parquet compress tốt?

Một column thường chứa cùng type:

```text
country:

VN
VN
VN
US
VN
VN
```

Dữ liệu tương tự nhau → compress tốt.

Trong row:

```text
101,VN,25,3000
102,VN,35,4000
```

types bị trộn.

---

# Exam signals

```text
analytics
large dataset
columnar
reduce scanned data
compression
Athena
Spark
ML preparation
```

→ **Parquet**

---

# Concept 6 — ORC ⭐⭐⭐

ORC = Optimized Row Columnar.

Dù tên có "Row", đây vẫn là **columnar format**.

Mental MLA:

```text
ORC ≈ Parquet
     ↓
columnar analytics
```

Bạn không cần học low-level internal implementation.

---

# Parquet vs ORC

Cả hai:

```text
columnar
compressed
analytics friendly
```

Trong MLA, nếu scenario chỉ nói:

> columnar format for analytics

cả hai có thể technically đúng nếu offered appropriately.

Parquet phổ biến hơn trong nhiều ML/data lake scenarios.

---

# Exam trap

Đừng nghĩ:

```text
ORC
→ row-based
```

do chữ "Row" trong tên.

Nó là:

> **columnar storage format.**

---

# Concept 7 — Apache Avro ⭐⭐⭐

Avro là serialization format dựa trên **records + schema**.

Mental model:

```text
Record
+
Schema
↓
Serialized binary data
```

Ví dụ schema conceptually:

```text
customer_id → integer
country → string
salary → double
```

Data records dùng schema đó.

---

# Avro phù hợp khi nào?

Thường nghĩ đến:

```text
streaming
record-based data
schema evolution
serialization
```

---

# Parquet vs Avro

Đây là comparison khá hay.

```text
Parquet
→ column-oriented
→ analytics

Avro
→ row/record oriented
→ serialization / streaming
```

Mental shortcut:

```text
Analyze columns
→ Parquet

Move/serialize records
→ Avro
```

---

# Concept 8 — RecordIO ⭐⭐⭐

RecordIO là format record-based thường xuất hiện với ML/SageMaker workloads.

Mental model exam:

```text
Individual records
      ↓
binary serialization
      ↓
efficient ML training input
```

AWS Domain 1 đưa RecordIO vào danh sách format candidate cần biết. ([AWS Documentation][1])

Không cần học protobuf detail.

---

# Khi nào cần nhớ RecordIO?

Nếu question nói:

```text
SageMaker built-in algorithm
+
optimized record input
```

RecordIO có thể xuất hiện.

---

# Comparison toàn bộ formats

| Format   | Type            | Main mental keyword       |
| -------- | --------------- | ------------------------- |
| CSV      | Text / row      | Simple flat data          |
| JSON     | Text / record   | Nested / semi-structured  |
| Parquet  | Columnar binary | Analytics                 |
| ORC      | Columnar binary | Analytics                 |
| Avro     | Record binary   | Serialization / streaming |
| RecordIO | Record binary   | ML/SageMaker              |

---

# Exam cheat sheet

```text
Simple flat
→ CSV

Nested/semi-structured
→ JSON

Large analytical dataset
→ Parquet

Columnar alternative
→ ORC

Streaming serialized records
→ Avro

SageMaker optimized record format
→ RecordIO
```

---

# Concept 9 — Validated vs Non-validated formats

AWS blueprint cũng nhắc **validated and non-validated formats**. ([AWS Documentation][1])

Ý tưởng đơn giản:

> Data format syntactically đọc được chưa có nghĩa data đúng business rules.

Ví dụ JSON:

```json
{
  "age": -500,
  "salary": "hello"
}
```

JSON có thể syntactically valid.

Nhưng business/model data:

```text
age = -500
salary = hello
```

invalid.

---

# Hai loại validation

## Format validation

```text
JSON parse được không?
CSV có đúng columns?
Parquet file có đọc được?
```

## Data validation

```text
Age between 0–120?
Salary numeric?
customer_id non-null?
```

Điểm này sẽ nối sang Glue Data Quality ở Day 4/6.

---

# Concept 10 — Batch vs Streaming ⭐⭐⭐⭐⭐

Đây là phần quan trọng thứ hai của Day 3.

## Batch processing

Data được gom thành một batch rồi xử lý.

Ví dụ:

```text
00:00
Collect daily sales
     ↓
01:00
Process 10 million rows
     ↓
02:00
Write result to S3
```

Mental:

```text
scheduled
bulk
historical
hourly/daily
```

---

# Ví dụ thực tế

Mỗi đêm:

```text
RDS
 ↓
Export yesterday's transactions
 ↓
S3
 ↓
Glue
 ↓
training dataset
```

Đây là batch.

---

# Streaming processing

Data đến liên tục:

```text
Transaction #1
       ↓
Transaction #2
       ↓
Transaction #3
       ↓
...
```

Bạn xử lý:

```text
seconds
milliseconds
near-real-time
```

---

# Ví dụ thực tế

Fraud detection:

```text
Card Transaction
        ↓
      Stream
        ↓
fraud features
        ↓
Prediction
```

Bạn không thể chờ tới midnight.

→ streaming.

---

# Batch vs Streaming

| Requirement          | Batch | Streaming |
| -------------------- | ----: | --------: |
| Nightly jobs         |     ✅ |         ❌ |
| Historical data      |     ✅ | Sometimes |
| Immediate events     |     ❌ |         ✅ |
| Simpler architecture |     ✅ |      Less |
| Real-time analytics  |     ❌ |         ✅ |
| Continuous data      |     ❌ |         ✅ |

Exam shortcut:

```text
"every night"
"daily"
"historical"
"bulk"

→ Batch
```

```text
"as events arrive"
"within seconds"
"real-time"
"continuous"

→ Streaming
```

---

# Exam Trap — "Millions of records" không đồng nghĩa streaming

Ví dụ:

> Process 100 million transactions once every night.

Có:

```text
100 million
```

nhưng:

```text
once every night
```

→ **Batch**.

Volume không quyết định streaming.

Latency requirement mới quan trọng.

---

# Concept 11 — Amazon Kinesis Data Streams ⭐⭐⭐⭐⭐

AWS Domain 1 trực tiếp nhắc Kinesis cho streaming ingestion. ([AWS Documentation][1])

Kinesis Data Streams được AWS mô tả là service để collect/process large streams of data records **in real time**. ([AWS Documentation][2])

Mental model:

```text
Producer
   ↓
Kinesis Data Stream
   ↓
Consumer
```

---

# Ví dụ

Website:

```text
User click
User click
Purchase
Search
Login
```

↓

```text
Kinesis Data Streams
```

↓

```text
Fraud app
Analytics app
ML feature pipeline
```

---

# Producer và Consumer

## Producer

Đẩy data vào stream:

```text
Application
IoT device
Web service
```

## Consumer

Đọc records:

```text
Lambda
Flink app
custom application
```

Mental:

```text
Producer
   ↓
Stream
   ↓
Consumer
```

---

# Kinesis Data Streams dùng khi nào?

Keywords:

```text
real time
continuous events
clickstream
transaction stream
IoT events
custom stream consumer
```

→ Kinesis Data Streams.

---

# Concept 12 — Shard

Kinesis Data Streams có concept **shard**.

Ở exam level bạn chỉ cần hiểu:

```text
Stream
 │
 ├── Shard 1
 ├── Shard 2
 └── Shard 3
```

Shard liên quan:

```text
capacity
parallelism
scaling
```

Không cần thuộc throughput limits trừ khi bạn muốn học sâu.

Mental:

```text
More shards
→ more parallel capacity
```

---

# Concept 13 — Partition Key

Producer gửi record với partition key.

Ví dụ:

```text
customer_id = 123
```

Records với same partition key được mapped consistently theo stream partitioning logic.

Mental purpose:

```text
partition key
→ decide shard placement
→ related records ordering
```

Ví dụ dùng:

```text
customer_id
device_id
account_id
```

---

# Exam trap

Nếu chọn partition key luôn giống nhau:

```text
"all-data"
```

thì có thể tạo:

```text
hot shard
```

Một shard bị quá tải trong khi shard khác rảnh.

Mental:

```text
good partition distribution
→ better scaling
```

---

# Concept 14 — Kinesis Data Streams vs Data Firehose

Mặc dù screenshot Week 1 ban đầu tập trung Kinesis, MLA in-scope cũng có Amazon Data Firehose.

Bạn nên phân biệt high-level.

## Kinesis Data Streams

Think:

```text
stream platform
custom consumers
real-time processing
retain/replay stream data
```

## Amazon Data Firehose

Think:

```text
stream
 ↓
managed delivery
 ↓
S3 / analytics destination
```

Mental shortcut:

```text
Need custom streaming application
→ Kinesis Data Streams

Need easiest delivery into destination
→ Data Firehose
```

---

# Ví dụ

Requirement:

> Continuously send application logs into S3 with minimal management.

Think:

```text
Data Firehose
```

Requirement:

> Multiple custom applications need to process events in real time.

Think:

```text
Kinesis Data Streams
```

---

# Concept 15 — Apache Kafka ⭐⭐⭐⭐

Apache Kafka là distributed event-streaming platform.

Mental model giống:

```text
Producer
   ↓
Kafka Topic
   ↓
Consumer
```

AWS environment thường có:

> **Amazon MSK — Managed Streaming for Apache Kafka**

Exam signals:

```text
existing Kafka
Kafka compatible
migrate Kafka workload
Kafka ecosystem
```

→ Kafka/MSK.

---

# Kinesis vs Kafka

|                          | Kinesis      | Kafka                          |
| ------------------------ | ------------ | ------------------------------ |
| AWS-native               | ✅            | Through MSK managed AWS option |
| Streaming                | ✅            | ✅                              |
| Existing Kafka ecosystem | Less natural | ⭐⭐⭐⭐⭐                          |
| Custom consumers         | ✅            | ✅                              |
| Managed AWS approach     | ✅            | MSK                            |

Mental shortcut:

```text
AWS-native new streaming
→ Kinesis

Existing Kafka / Kafka compatibility
→ MSK
```

Không phải absolute rule, nhưng rất useful trong exam.

---

# Concept 16 — Apache Flink ⭐⭐⭐⭐⭐

Đây là chỗ nhiều người nhầm.

**Flink không phải primarily ingestion/storage stream service.**

Flink là **stream processing engine**.

AWS Managed Service for Apache Flink cho phép dùng Java, Scala, Python hoặc SQL để process/analyze streaming data. ([AWS Documentation][3])

Mental:

```text
Kinesis / Kafka
      ↓
    Flink
      ↓
transform
filter
aggregate
window
join
      ↓
Output
```

---

# Ví dụ thực tế

Input stream:

```text
customer=1 amount=100
customer=1 amount=50
customer=2 amount=200
```

Flink có thể calculate:

```text
customer 1:
total last 5 minutes = 150

customer 2:
total last 5 minutes = 200
```

Đây gọi là stream processing.

---

# Kinesis vs Flink ⭐⭐⭐⭐⭐

Đây là distinction phải thuộc.

```text
Kinesis
→ carry/store stream records

Flink
→ process/analyze stream records
```

Architecture:

```text
Producer
   ↓
Kinesis
   ↓
Flink
   ↓
Processed Stream
   ↓
S3 / database / dashboard
```

---

# Exam trap

Question:

> Need continuously compute rolling 5-minute averages over incoming transactions.

Không chỉ cần ingest.

Cần:

```text
stateful stream processing
window aggregation
```

→ **Flink**.

---

# Concept 17 — Windowing trong streaming

Flink thường xuất hiện cùng concept:

```text
window
```

Vì stream không có "end".

Nếu muốn:

> Calculate average purchase over every 5-minute interval

Bạn cần chia endless stream:

```text
00:00–00:05
00:05–00:10
00:10–00:15
```

→ windows.

Mental:

```text
Continuous stream
     ↓
window
     ↓
aggregation
```

---

# Concept 18 — AWS Glue ⭐⭐⭐⭐⭐

AWS Glue là **serverless data integration service** cho discover, prepare, move và integrate data từ nhiều sources; AWS mô tả nó có thể tạo/chạy/monitor ETL pipelines. ([AWS Documentation][4])

Mental:

```text
Source A ─┐
Source B ─┼→ Glue
Source C ─┘
             ↓
           ETL
             ↓
            S3
```

---

# ETL nghĩa là gì?

## Extract

Lấy data:

```text
RDS
S3
DynamoDB
```

## Transform

```text
clean
join
filter
rename
convert
```

## Load

ghi đến:

```text
S3
Redshift
other destination
```

---

# Ví dụ thực tế

Data:

```text
RDS customers
+
S3 transactions
+
CSV promotions
```

Need:

```text
Join
clean
transform
```

↓

```text
Glue
```

↓

```text
training.parquet
```

AWS MLA Domain 1 trực tiếp nêu Glue và Spark là tools để merge data từ nhiều sources. ([AWS Documentation][1])

---

# Concept 19 — Glue Data Catalog

Glue không chỉ là ETL.

Một concept rất useful:

> **Glue Data Catalog**

Mental:

```text
S3 files
     ↓
metadata catalog
     ↓
Table definitions
Schemas
Locations
```

Ví dụ:

```text
S3:
s3://company/data/customers/
```

Glue Catalog:

```text
Table: customers

columns:
id
age
country
salary
```

Service khác có thể dùng metadata này.

---

# Concept 20 — Glue Crawler

Crawler có thể inspect data:

```text
S3
 ↓
Glue Crawler
 ↓
infer schema
 ↓
Data Catalog
```

Mental shortcut:

```text
Discover schema automatically
→ Glue Crawler
```

---

# Glue Job vs Crawler

```text
Crawler
→ discover metadata/schema

Glue Job
→ transform data
```

Exam trap:

> Need convert CSV to Parquet.

→ **Glue Job**, không phải crawler.

> Need automatically catalog unknown datasets.

→ **Crawler**.

---

# Concept 21 — Apache Spark ⭐⭐⭐⭐

Spark = distributed data processing engine.

Mental:

```text
Huge Dataset
    ↓
Split work across nodes
    ↓
Node A
Node B
Node C
    ↓
combined result
```

---

# Ví dụ

Dataset:

```text
50 TB
```

Need:

```text
join
aggregate
transform
```

Single machine quá chậm.

Use:

```text
distributed Spark processing
```

---

# Spark chạy ở đâu trên AWS?

Có thể:

```text
Amazon EMR
AWS Glue
```

Glue itself uses distributed processing technologies for ETL workloads.

---

# Glue vs EMR/Spark

## Glue

Think:

```text
serverless
managed ETL
less ops
```

## EMR

Think:

```text
big data platform
more control
Spark/Hadoop ecosystem
```

---

# Exam shortcut

```text
Serverless ETL
minimal management
→ Glue

Highly customized Spark/Hadoop cluster
→ EMR
```

---

# Concept 22 — Batch architecture example

Một full batch pipeline:

```text
Production RDS
      ↓
nightly extract
      ↓
     S3 raw
      ↓
   Glue Job
      ↓
clean + join
      ↓
S3 processed
      ↓
Parquet
      ↓
SageMaker Training
```

Question signals:

```text
nightly
historical
bulk
training
```

---

# Concept 23 — Streaming architecture example

Full streaming pipeline:

```text
Website
   ↓
click events
   ↓
Kinesis Data Streams
   ↓
Managed Flink
   ↓
aggregate features
   ↓
Feature Store / S3
```

Signals:

```text
real-time
continuous
rolling metrics
```

---

# Concept 24 — Streaming → Batch hybrid

Real systems often combine both.

Example:

```text
             Transactions
                   ↓
                Kinesis
                   ↓
                 Flink
               /       \
              /         \
     realtime features   S3
            ↓             ↓
        inference       historical
                         training
```

Một stream có thể feed:

```text
real-time prediction
```

và simultaneously:

```text
offline training data
```

Đây là rất ML-realistic.

---

# Concept 25 — Schema Evolution

Điều này đặc biệt liên quan Avro/streaming.

Suppose schema version 1:

```text
id
name
```

Version 2:

```text
id
name
country
```

Schema evolution = hệ thống xử lý thay đổi schema theo thời gian mà không phá dữ liệu cũ.

Mental:

```text
Data format changes
      ↓
backward/forward compatibility
```

Với MLA, hiểu concept là đủ.

---

# Exam Traps — Day 3

## Trap 1 — CSV vì "simple"

Scenario:

```text
100 TB
query only 3 columns
Athena analytics
minimize scanned data
```

→ Parquet.

Không chọn CSV chỉ vì familiar.

---

# Trap 2 — JSON vs Parquet

Question:

> API sends nested records.

→ JSON.

Question:

> Analytics over huge historical nested data after ingestion.

Có thể convert:

```text
JSON
 ↓
Glue
 ↓
Parquet
```

Raw format và analytical format có thể khác nhau.

---

# Trap 3 — Kinesis vs Flink

Question:

> Collect events.

→ Kinesis.

Question:

> Calculate 5-minute moving average.

→ Flink.

---

# Trap 4 — Kinesis vs Firehose

Question:

> Multiple custom consumers need to independently process records.

→ Kinesis Data Streams.

Question:

> Deliver stream data directly into S3 with minimal management.

→ Data Firehose.

---

# Trap 5 — Kafka vs Kinesis

Existing Kafka application:

```text
Kafka APIs
Kafka clients
Kafka ecosystem
```

→ MSK typically natural.

New AWS-native solution with no Kafka requirement:

→ Kinesis may be simpler.

---

# Trap 6 — Batch vs Streaming

"Large data" ≠ streaming.

```text
500 million rows nightly
→ Batch
```

"Small events continuously"

```text
100 events/sec but need response in seconds
→ Streaming
```

---

# Trap 7 — Glue Crawler vs Job

```text
Discover schema
→ Crawler

Transform records
→ Job
```

---

# Trap 8 — Glue vs Flink

Glue:

```text
batch ETL
```

Flink:

```text
continuous stream processing
```

Do not interchange them just because both "transform data."

---

# Trap 9 — Parquet vs Avro

```text
column analytics
→ Parquet

record serialization / streaming
→ Avro
```

---

# Trap 10 — Parquet không phải database

Parquet:

```text
file format
```

S3:

```text
storage
```

Athena:

```text
query service
```

Ví dụ:

```text
S3
  └── customers.parquet
        ↑
      Athena
```

Ba concepts khác nhau.

---

# Decision Tree — Format

```text
Choose Data Format
       │
       ▼
Need nested/semi-structured?
       │
      YES
       ↓
      JSON
       │
      NO
       ▼
Large analytics / read selected columns?
       │
      YES
       ↓
Parquet / ORC
       │
      NO
       ▼
Simple flat human-readable?
       │
      YES
       ↓
      CSV
       │
      NO
       ▼
Record serialization / streaming?
       │
      YES
       ↓
      Avro
```

---

# Decision Tree — Ingestion

```text
Incoming Data
    │
    ▼
Need processing immediately?
    │
 ┌──┴───┐
NO      YES
│        │
▼        ▼
Batch   Streaming
│        │
│        ├─ Ingest
│        │     ↓
│        │ Kinesis / Kafka
│        │
│        └─ Complex processing
│              ↓
│            Flink
│
└─ ETL
     ↓
   Glue / Spark
```

---

# Comparison Table quan trọng

| Requirement                 | Best mental answer |
| --------------------------- | ------------------ |
| Flat simple format          | CSV                |
| Nested semi-structured      | JSON               |
| Large analytics             | Parquet            |
| Columnar alternative        | ORC                |
| Record serialization        | Avro               |
| SageMaker record format     | RecordIO           |
| Scheduled bulk processing   | Batch              |
| Continuous data             | Streaming          |
| AWS-native event stream     | Kinesis            |
| Kafka ecosystem             | MSK/Kafka          |
| Stream calculations         | Flink              |
| Serverless ETL              | Glue               |
| Distributed data processing | Spark              |
| Discover schema             | Glue Crawler       |

---

# Keyword → Answer

```text
columnar
→ Parquet / ORC

nested
→ JSON

simple flat
→ CSV

serialization
→ Avro

SageMaker record
→ RecordIO

nightly
→ Batch

as events arrive
→ Streaming

clickstream
→ Kinesis

Kafka-compatible
→ MSK

rolling average
→ Flink

ETL
→ Glue

schema discovery
→ Glue Crawler

large distributed transformation
→ Spark
```

---

# Scenario tổng hợp

Giả sử e-commerce company:

## Source 1 — Historical orders

```text
RDS
 ↓
nightly
 ↓
Glue
 ↓
Parquet
 ↓
S3
```

Purpose:

```text
model training
```

---

## Source 2 — User clicks

```text
Website
 ↓
JSON events
 ↓
Kinesis
 ↓
Flink
 ↓
real-time features
```

---

## Store historical stream

```text
Kinesis
 ↓
delivery
 ↓
S3
 ↓
Parquet
```

Now:

```text
Real-time:
Kinesis → Flink → Prediction

Offline:
S3 Parquet → SageMaker Training
```

Đây là một kiến trúc rất điển hình để hiểu Day 3.

---

# 10 câu Practice MLA-C01 — Day 3

**Làm trước khi xem đáp án.**

## Question 1

A company stores 20 TB of historical transaction data. Data scientists frequently analyze only a small subset of columns.

Which format is MOST appropriate?

A. CSV
B. JSON
C. Apache Parquet
D. Plain text

---

## Question 2

An application sends records containing nested customer attributes and arrays.

Which format is MOST appropriate?

A. CSV
B. JSON
C. ORC only
D. EBS

---

## Question 3

A company processes 100 million transactions once every night to create a training dataset.

What processing pattern should the company use?

A. Streaming
B. Batch
C. Real-time inference
D. Online Feature Store

---

## Question 4

A retailer needs to capture website click events continuously as they occur.

Which AWS service is MOST appropriate for ingesting the events?

A. Amazon Kinesis Data Streams
B. Amazon EBS
C. AWS CloudFormation
D. Amazon RDS

---

## Question 5

A company is already using Apache Kafka applications and Kafka-compatible clients. The company wants a managed AWS streaming solution with minimal application changes.

Which service is MOST appropriate?

A. Amazon S3
B. Amazon MSK
C. AWS Glue
D. Amazon EFS

---

## Question 6

A fraud system needs to calculate the total transaction amount for each account over continuously updating 5-minute windows.

Which technology is MOST appropriate?

A. Amazon EBS
B. Apache Flink
C. Amazon RDS
D. S3 Glacier

---

## Question 7

A machine learning team needs to combine data from Amazon RDS and Amazon S3, clean the records, and create a Parquet training dataset. The team wants to minimize infrastructure management.

Which service is the BEST choice?

A. AWS Glue
B. Amazon Route 53
C. AWS IAM
D. Amazon ECR

---

## Question 8

A company needs to automatically inspect datasets stored in S3, infer their schema, and register metadata.

Which AWS Glue component should be used?

A. Glue Job
B. Glue Crawler
C. Glue Trigger only
D. SageMaker Endpoint

---

## Question 9

Which TWO statements are correct?

A. Parquet is optimized for column-oriented analytics.
B. Apache Flink is primarily object storage.
C. Kinesis Data Streams supports real-time streaming records.
D. CSV is a managed AWS database.
E. EBS is a data serialization format.

---

## Question 10 — Harder

A company receives JSON clickstream events continuously. It needs to calculate rolling aggregates in real time and also retain historical data for future ML model training.

Which architecture is MOST appropriate?

A. Store all events only in RDS and run nightly queries
B. Ingest events with Kinesis, process them with Flink, and persist historical data in S3
C. Store events on EBS volumes attached to a single EC2 instance
D. Use CloudFormation to analyze the stream

---

# Đáp án

```text
Q1  → C
Q2  → B
Q3  → B
Q4  → A
Q5  → B
Q6  → B
Q7  → A
Q8  → B
Q9  → A + C
Q10 → B
```

---

# Giải thích đáp án

## Q1 → Parquet

Keywords:

```text
20 TB
historical
subset of columns
```

→ columnar format.

→ **Parquet**

AWS Domain 1 trực tiếp yêu cầu chọn format dựa trên data access patterns. ([AWS Documentation][1])

---

## Q2 → JSON

Keyword:

```text
nested
arrays
```

→ JSON.

---

## Q3 → Batch

Keyword:

```text
once every night
```

100 million records không thay đổi điều đó.

```text
Scheduled bulk processing
→ Batch
```

---

## Q4 → Kinesis Data Streams

```text
continuous
as events occur
```

→ real-time streaming ingestion.

AWS mô tả Kinesis Data Streams cho large real-time streams of records. ([AWS Documentation][2])

---

## Q5 → Amazon MSK

Keyword:

```text
existing Kafka
Kafka-compatible clients
minimal changes
```

→ Managed Kafka is natural.

---

## Q6 → Flink

Keywords:

```text
continuous
5-minute window
aggregate
```

→ stream processing.

Managed Service for Apache Flink được thiết kế cho processing/analyzing streaming data. ([AWS Documentation][5])

---

## Q7 → Glue

Requirement:

```text
RDS + S3
join
clean
convert
minimal management
```

→ serverless data integration / ETL.

→ **Glue**. ([AWS Documentation][4])

---

## Q8 → Glue Crawler

Requirement:

```text
inspect
infer schema
metadata
```

→ Crawler.

Không phải Glue Job.

---

## Q9 → A + C

```text
Parquet
→ columnar analytics

Kinesis
→ streaming
```

Flink là processing engine, không phải storage.

---

## Q10 → Kinesis + Flink + S3

Requirement có cả:

```text
continuous ingestion
+
real-time aggregation
+
historical ML training
```

Map:

```text
Ingest
→ Kinesis

Process
→ Flink

Historical storage
→ S3
```

Đây chính là pattern hybrid streaming + offline ML.

---

# 5 câu nâng cao tự reasoning

## Scenario A

```text
500 GB CSV
Athena scans every day
only 4 columns used
query cost too high
```

Think:

```text
CSV
 ↓
convert
 ↓
Parquet
```

---

## Scenario B

```text
IoT sensor readings
arrive every second
```

Think:

```text
Streaming
→ Kinesis
```

---

## Scenario C

```text
Need hourly 10-minute moving average
on stream
```

Think:

```text
Flink
```

---

## Scenario D

```text
8 TB RDS export
once nightly
clean + join + convert
```

Think:

```text
Batch
→ Glue
→ Parquet
→ S3
```

---

## Scenario E

```text
Company already has Kafka producers
and Kafka consumer groups
```

Think:

```text
MSK
```

---

# Wrong Answer Log mẫu Day 3

Nếu bạn nhầm Kinesis và Flink:

```text
Question:
Calculate a rolling five-minute average
for incoming transactions.

My answer:
Kinesis

Correct:
Flink

Why wrong:
Kinesis carries the event stream.
The requirement was processing/aggregation.

Decision rule:
Capture/transport stream
→ Kinesis

Transform/window/aggregate stream
→ Flink
```

Nếu nhầm CSV và Parquet:

```text
Question:
20 TB dataset, query 3/100 columns.

My answer:
CSV

Correct:
Parquet

Why wrong:
I focused on simplicity instead of
access pattern and query efficiency.

Decision rule:
Simple/interchange
→ CSV

Large analytical column access
→ Parquet
```

---

# Final Cheat Sheet Day 3

```text
                   DATA FORMAT

Simple flat ─────────────→ CSV

Nested / API ────────────→ JSON

Large analytics ─────────→ Parquet
                              │
                              └→ ORC alternative

Record serialization ────→ Avro

SageMaker record ────────→ RecordIO
```

Và ingestion:

```text
                       INGESTION

                     Data arrives
                          │
               ┌──────────┴──────────┐
               │                     │
            Scheduled             Continuous
               │                     │
               ▼                     ▼
             Batch                Streaming
               │                     │
               ▼              ┌──────┴──────┐
          Glue / Spark         │             │
                              ▼             ▼
                           Kinesis        Kafka
                              │
                              ▼
                            Flink
                       process / aggregate
```

Và architecture quan trọng nhất:

```text
Batch ML
=======

RDS / Files
     ↓
    Glue
     ↓
 Parquet
     ↓
    S3
     ↓
SageMaker


Realtime ML
===========

Events
  ↓
Kinesis
  ↓
Flink
  ↓
Realtime Features
  ↓
Prediction

  +
  ↓

S3 historical data
  ↓
future training
```

## Checklist hoàn thành Day 3

Bạn nên trả lời được:

* [ ] Row-oriented và columnar khác nhau thế nào?
* [ ] CSV khác JSON thế nào?
* [ ] Khi nào chọn Parquet thay CSV?
* [ ] ORC thuộc row hay columnar?
* [ ] Avro khác Parquet thế nào?
* [ ] Batch khác streaming thế nào?
* [ ] Volume lớn có tự động đồng nghĩa streaming không?
* [ ] Kinesis làm gì?
* [ ] Kafka/MSK dùng khi nào?
* [ ] Kinesis khác Flink như thế nào?
* [ ] Flink windowing dùng để làm gì?
* [ ] Glue dùng để làm gì?
* [ ] Glue Crawler khác Glue Job thế nào?
* [ ] Glue khác EMR/Spark như thế nào?
* [ ] Có xây được pipeline `RDS → Glue → S3 Parquet → SageMaker` không?
* [ ] Có xây được pipeline `Event → Kinesis → Flink → S3/Feature → ML` không?

Nếu bạn đạt **8/10 trở lên**, Day 3 ổn. Phần tiếp theo sẽ là **Day 4 — Data Cleaning & Feature Engineering**, và đây sẽ là một trong những ngày quan trọng nhất của Week 1: **missing values → imputation → outliers → duplicates → normalization vs standardization → encoding → binning → log transform → class imbalance → target leakage**, kèm exam traps và 10 câu MLA-C01.

[1]: https://docs.aws.amazon.com/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01-domain1.html?utm_source=chatgpt.com "Content Domain 1: Data Preparation for Machine Learning (ML) - AWS Certified Machine Learning Engineer - Associate"
[2]: https://docs.aws.amazon.com/streams/latest/dev/introduction.html?utm_source=chatgpt.com "What is Amazon Kinesis Data Streams? - Amazon Kinesis Data Streams"
[3]: https://docs.aws.amazon.com/managed-flink/?utm_source=chatgpt.com "Amazon Managed Service for Apache Flink Documentation"
[4]: https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html?utm_source=chatgpt.com "What is AWS Glue? - AWS Glue"
[5]: https://docs.aws.amazon.com/managed-flink/latest/java/what-is.html?utm_source=chatgpt.com "What is Amazon Managed Service for Apache Flink? - Managed Service for Apache Flink"
