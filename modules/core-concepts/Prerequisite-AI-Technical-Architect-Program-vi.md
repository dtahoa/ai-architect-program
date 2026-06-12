Rất tốt. Để thực sự hiểu AI và trở thành AI Architect, bạn cần hiểu **bản chất bên dưới**, không chỉ nhớ các thuật ngữ.

---

# AI THỰC CHẤT LÀ GÌ?

Nhiều người nghĩ:

```text
AI = ChatGPT
```

Điều này sai.

Thực tế:

```text
AI là một lĩnh vực lớn

AI
├── Rule-Based System
├── Machine Learning
├── Deep Learning
├── Computer Vision
├── NLP
├── Robotics
└── Generative AI
```

ChatGPT chỉ là:

```text
AI
 └── Generative AI
      └── LLM
           └── ChatGPT
```

---

# LEVEL 1: COMPUTER SCIENCE FOUNDATION

Đây là phần mà các developer thường đã có.

Ví dụ:

```text
Programming
Database
API
Distributed System
Cloud
Networking
Security
```

Nếu không có nền tảng này:

```text
Khó xây production AI system
```

---

# LEVEL 2: AI INFRASTRUCTURE

AI không chạy trong không khí.

Nó cần hạ tầng.

Ví dụ:

```text
GPU
Storage
Database
Cloud
Container
Kubernetes
Queue
Monitoring
```

---

## GPU là gì?

CPU:

```text
Ít core
Mạnh cho logic
```

GPU:

```text
Hàng ngàn core
Mạnh cho tính toán song song
```

Ví dụ:

```text
Train model
Generate embeddings
Inference LLM
```

đều dùng GPU.

---

# LEVEL 3: DATA & KNOWLEDGE

AI không thể thông minh hơn dữ liệu của nó.

---

## Data là gì?

Ví dụ:

```text
Customer
Policy
Claim
Invoice
Medical Report
```

---

## Knowledge là gì?

Data đã được tổ chức để có ý nghĩa.

Ví dụ:

```text
Policy A
cover:
- accident
- fire

not cover:
- flood
```

Đây là knowledge.

---

# LEVEL 4: MACHINE LEARNING

Đây là nơi AI bắt đầu "học".

---

## Con người học như thế nào?

Ví dụ:

Bạn cho trẻ em xem:

```text
Mèo
Mèo
Mèo
Chó
Chó
Chó
```

Sau nhiều lần:

```text
Nó học được pattern
```

Machine Learning cũng vậy.

---

## Dataset

Là dữ liệu dùng để học.

Ví dụ:

```csv
age,income,buy_insurance
30,50000,yes
45,100000,no
```

---

## Feature

Feature là thông tin đầu vào.

Ví dụ:

```text
Age
Income
Location
```

---

## Label

Kết quả mong muốn.

Ví dụ:

```text
Buy insurance?
```

---

## Training

Training là quá trình học.

```text
Dataset
 |
Training
 |
Model
```

---

Ví dụ:

```text
100.000 claims
```

cho model học.

---

Sau training:

```text
Model biết
claim nào có nguy cơ fraud
```

---

# LEVEL 5: DEEP LEARNING

Machine Learning dùng nhiều thuật toán.

Deep Learning dùng:

```text
Neural Network
```

---

# Neural Network là gì?

Mô phỏng rất sơ khai cách neuron hoạt động.

Ví dụ:

```text
Input
 |
Hidden Layer
 |
Output
```

---

Ví dụ nhận diện ảnh:

```text
Image
 |
Neural Network
 |
Cat
```

---

# Embedding - Khái niệm QUAN TRỌNG NHẤT

Nếu chỉ chọn 1 khái niệm để hiểu AI hiện đại.

Tôi sẽ chọn:

```text
Embedding
```

---

## Embedding là gì?

Máy tính không hiểu:

```text
car
truck
insurance
policy
```

Nó chỉ hiểu số.

Embedding biến:

```text
Text
Image
Audio
```

thành:

```text
Vector
```

---

Ví dụ:

```text
car
```

thành:

```text
[0.1, 0.3, 0.7, 0.2 ...]
```

---

## Điều kỳ diệu

Các từ giống nhau:

```text
car
truck
vehicle
```

có vector gần nhau.

---

Các từ khác nhau:

```text
car
banana
```

xa nhau.

---

# Tại sao Embedding quan trọng?

Nó là nền tảng của:

```text
Semantic Search
Recommendation
RAG
Agent
Knowledge Base
```

---

Nếu không có embedding:

```text
Không có ChatGPT với company documents
Không có AI Copilot
Không có AI Search
```

---

# LEVEL 6: LLM FOUNDATION

Đây là phần mọi người hay học đầu tiên.

---

# LLM là gì?

Large Language Model.

Nhiều người nghĩ:

```text
LLM hiểu ngôn ngữ
```

Không hẳn.

---

Bản chất:

```text
LLM dự đoán token tiếp theo
```

---

Ví dụ:

```text
The sky is
```

Model dự đoán:

```text
blue
```

---

Tiếp tục:

```text
The sky is blue
```

---

Nó làm việc này hàng tỷ lần.

---

# Token là gì?

Không phải từ.

Ví dụ:

```text
Insurance Policy
```

có thể thành:

```text
Insurance
Policy
```

2 tokens.

---

Một tài liệu:

```text
100 pages
```

thực tế:

```text
100.000+ tokens
```

---

# Context Window

Là bộ nhớ tạm thời.

Ví dụ:

```text
128k tokens
```

nghĩa là:

```text
Model chỉ nhìn thấy
128k token cùng lúc
```

---

# Hallucination

Đây là vấn đề lớn nhất.

Ví dụ:

Bạn hỏi:

```text
Policy này có cover flood không?
```

Model không biết.

Nhưng nó trả lời:

```text
Có
```

dù policy không ghi vậy.

Đó là:

```text
Hallucination
```

---

# LEVEL 7: GENAI APPLICATION

Bắt đầu xây app.

---

# Prompt Engineering

Prompt giống như:

```text
Instruction cho AI
```

---

Ví dụ:

```python
prompt = """
Bạn là chuyên gia bảo hiểm.

Trả kết quả JSON.

Claim:
{claim}
"""
```

---

# Structured Output

Thay vì:

```text
Risk cao
```

nên:

```json
{
  "risk_level": "HIGH"
}
```

---

Tại sao?

Vì:

```text
Backend parse được
Frontend render được
Workflow xử lý được
```

---

# Function Calling

AI gọi tool.

Ví dụ:

```text
LLM
 |
get_claim()
 |
search_policy()
 |
create_review_task()
```

---

Đây là nền tảng của Agent.

---

# LEVEL 8: RAG

Khái niệm quan trọng nhất trong AI Architect hiện nay.

---

# Vấn đề

LLM không biết dữ liệu công ty.

Ví dụ:

```text
Claims
Policies
Contracts
Invoices
```

---

# Giải pháp

RAG

Retrieval Augmented Generation

---

# Flow

```text
Question
 |
Embedding
 |
Vector Search
 |
Find Documents
 |
LLM
 |
Answer
```

---

# Ví dụ thực tế

Bạn hỏi:

```text
Claim này có được cover không?
```

---

Hệ thống:

```text
1. Embed câu hỏi

2. Search policy

3. Lấy đoạn liên quan

4. Gửi cho GPT

5. GPT trả lời
```

---

Lúc này GPT không trả lời bằng trí nhớ.

Nó trả lời bằng:

```text
Company Knowledge
```

---

# LEVEL 9: AGENTS

---

# Workflow

Workflow:

```text
A
→ B
→ C
```

cố định.

---

# Agent

Agent tự quyết định.

```text
Think
 |
Choose Tool
 |
Observe
 |
Continue
```

---

Ví dụ:

```text
Investigate Claim
```

---

Agent:

```text
Đọc claim

↓

Tìm policy

↓

Tìm fraud history

↓

Đánh giá risk

↓

Tạo recommendation
```

---

# LEVEL 10: AI ARCHITECTURE

Lúc này bạn bắt đầu nghĩ như Architect.

---

Không còn là:

```text
Làm sao gọi GPT?
```

---

Mà là:

```text
Làm sao xây hệ thống AI production?
```

---

Kiến trúc:

```text
Frontend (NextJS)
 |
Backend (NestJS)
 |
AI Gateway
 |
AI Service (FastAPI)
 |
RAG
 |
Vector DB
 |
OpenAI
 |
PostgreSQL
 |
Observability
 |
Evaluation
```

---

# LEVEL 11: PRODUCTION AI

Đây là phần 95% tutorial không dạy.

---

## Security

Ví dụ:

```text
Prompt Injection
Data Leakage
Tenant Isolation
PII Protection
```

---

## Observability

Track:

```text
Prompt
Tokens
Cost
Latency
Errors
```

---

## Evaluation

Đo:

```text
AI có trả lời đúng không?
```

---

## FinOps

Đo:

```text
Request này tốn bao nhiêu tiền?
```

---

# Tư duy AI-First

Developer truyền thống nghĩ:

```text
UI
↓
API
↓
Database
```

---

AI-First nghĩ:

```text
Business Problem
↓
AI Capability
↓
Knowledge
↓
Workflow
↓
Human Review
↓
Architecture
↓
Implementation
```

---

# Project đầu tiên nên làm

Với background của bạn (NodeJS, Java, Python, AWS, Azure, Tech Lead), project tốt nhất không phải ChatGPT Clone.

Hãy build:

```text
Insurance Policy Copilot
```

bao gồm:

```text
Upload PDF
↓
Chunking
↓
Embedding
↓
pgvector
↓
RAG
↓
OpenAI
↓
Citation
↓
Cost Tracking
↓
Prompt Tracking
↓
Evaluation
```

Chỉ riêng project này sẽ giúp bạn hiểu gần như toàn bộ nền tảng của một hệ thống AI-First hiện đại từ **Embedding → RAG → Agent → Security → LLMOps → AI Architecture**.
