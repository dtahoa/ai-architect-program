Most developers today learn AI backwards:

```text
Learn OpenAI API
→ Learn LangChain
→ Build chatbot
→ Call themselves AI Engineer
```

But AI Architects and strong AI Engineers learn from the foundation upward.

---

# AI-First Learning Roadmap

Think of AI as a stack.

```text
Level 1  Computer Science Foundation
Level 2  AI Infrastructure
Level 3  Data & Knowledge
Level 4  Machine Learning
Level 5  GenAI & Agents
Level 6  AI Application Development
Level 7  AI Architecture
Level 8  AI Product & Business
```

Your goal:

```text
Understand every layer
Know how they connect
Know when to use each
```

---

# Phase 1: AI Foundations

Before touching LLMs, understand:

## What is AI?

Artificial Intelligence:

```text
Systems that perform tasks
normally requiring human intelligence
```

Examples:

```text
Prediction
Reasoning
Learning
Planning
Understanding language
Vision
Decision making
```

---

## AI Categories

### Rule-Based AI

```text
IF income > 100000
THEN premium_customer
```

No learning.

---

### Machine Learning

```text
Learn patterns from data
```

Example:

```text
Input:
Age
Income
Location

Output:
Will buy insurance?
```

Model learns relationship.

---

### Deep Learning

Uses neural networks.

Examples:

```text
Image recognition
Speech recognition
NLP
LLMs
```

---

### Generative AI

Creates content.

```text
Text
Image
Audio
Video
Code
```

Examples:

```text
GPT
Claude
Gemini
Midjourney
Sora
```

---

# Phase 2: Core AI Concepts

Understand these before coding.

---

## Dataset

Definition:

```text
Collection of examples
used for training
```

Example:

```csv
age,income,buy_insurance
30,50000,yes
45,100000,no
```

---

## Feature

Input variables.

```text
Age
Income
Location
```

---

## Label

Expected output.

```text
Buy Insurance?
```

---

## Training

Process of learning.

```text
Dataset
   |
   v
Training Algorithm
   |
   v
Model
```

---

## Inference

Using model after training.

```text
User Data
   |
   v
Model
   |
   v
Prediction
```

---

## Evaluation

How good is model?

Metrics:

```text
Accuracy
Precision
Recall
F1
AUC
```

---

# Phase 3: Machine Learning Foundation

Even if you focus on GenAI.

You MUST understand ML.

---

## Supervised Learning

Input + known output.

Example:

```text
Claim -> Fraud?
```

---

## Unsupervised Learning

No labels.

Example:

```text
Customer Segmentation
```

---

## Reinforcement Learning

Agent learns via reward.

Example:

```text
Chess
Robotics
Game AI
```

---

# Phase 4: Deep Learning Foundation

---

## Neural Network

Inspired by brain.

```text
Input
 |
Hidden Layer
 |
Output
```

Example:

```text
Image
 |
CNN
 |
Cat / Dog
```

---

## Embedding

One of the MOST important AI concepts.

Definition:

```text
Convert text/image/audio
into numerical vector
```

Example:

```text
"car"
→ [0.23, 0.82, 0.11, ...]
```

Similar concepts:

```text
car
vehicle
truck
```

have similar vectors.

---

## Why embeddings matter

They power:

```text
RAG
Search
Recommendation
Semantic Search
Agents
```

Without embeddings:

```text
No modern AI app
```

---

# Phase 5: LLM Foundation

This is where most people start.

But now you'll understand WHY.

---

## What is LLM?

Large Language Model

```text
Predict next token
```

Example:

```text
"The sky is"

Prediction:

blue
cloudy
clear
```

LLM chooses likely token.

---

## Token

Not word.

Example:

```text
Hello world
```

May become:

```text
Hello
world
```

2 tokens.

---

## Context Window

Memory for current conversation.

Example:

```text
128k tokens
```

Meaning:

```text
How much text model can see
at one time
```

---

## Temperature

Creativity.

```text
0.0 → deterministic
1.0 → creative
```

---

## Hallucination

LLM makes things up.

Example:

```text
Invent policy clause
Invent citation
Invent fact
```

---

# Phase 6: GenAI Application Components

Now we move into building.

---

## Prompt Engineering

The first AI application layer.

```text
User Input
 |
Prompt
 |
LLM
 |
Response
```

---

### Prompt Template

```python
prompt = f"""
You are insurance assistant.

Claim:
{claim}

Return JSON only.
"""
```

---

# Structured Output

Bad:

```text
Free text
```

Good:

```json
{
  "risk_level": "HIGH",
  "missing_documents": []
}
```

---

# Function Calling

LLM can use tools.

```text
LLM
 |
Tool Call
 |
Weather API
 |
Result
```

Example:

```text
get_claim_details()
search_policy()
create_review_task()
```

---

# Phase 7: RAG Foundation

The MOST important AI architecture today.

---

## Problem

LLMs don't know company data.

Example:

```text
Insurance policies
Claims
Contracts
Internal docs
```

---

## Solution

RAG

Retrieval Augmented Generation

---

## Architecture

```text
Question
 |
Embedding
 |
Vector Search
 |
Retrieve Documents
 |
LLM
 |
Answer
```

---

## Components

### Document Store

```text
PDF
Word
Email
Web page
```

---

### Chunking

Split document.

```text
100 pages
 |
Chunks
 |
500 tokens each
```

---

### Embedding Model

```text
Chunk
 |
Embedding
 |
Vector
```

---

### Vector Database

Stores vectors.

Examples:

```text
pgvector
Pinecone
Weaviate
OpenSearch
Qdrant
```

---

### Retriever

Finds relevant chunks.

---

### Generator

LLM generates answer.

---

# Phase 8: Agents Foundation

---

## Workflow

Fixed sequence.

```text
Step A
 |
Step B
 |
Step C
```

---

## Agent

Dynamic reasoning.

```text
Think
 |
Choose Tool
 |
Execute
 |
Observe
 |
Continue
```

---

Example:

```text
Investigate claim
 |
Read claim
 |
Search policy
 |
Search fraud history
 |
Generate recommendation
```

---

# Phase 9: AI Application Architecture

Now we build real apps.

---

## AI-First Architecture

Traditional:

```text
Frontend
 |
Backend
 |
Database
```

AI-First:

```text
Frontend
 |
Backend
 |
AI Gateway
 |
RAG
 |
Agent
 |
LLM
 |
Knowledge Base
 |
Evaluation
```

---

## Components

### Frontend

```text
NextJS
```

---

### Backend

```text
NestJS
```

---

### AI Service

```text
FastAPI
```

---

### Queue

```text
BullMQ
SQS
```

---

### Vector Store

```text
pgvector
```

---

### LLM Provider

```text
OpenAI
Azure OpenAI
Bedrock
Claude
```

---

# Phase 10: Production AI

Most tutorials stop before this.

---

## Observability

Track:

```text
Prompt
Model
Cost
Latency
Tokens
Errors
```

Tools:

```text
Langfuse
LangSmith
MLflow
```

---

## Security

Need:

```text
Prompt Injection Protection
PII Protection
RBAC
Audit Log
```

---

## FinOps

Track:

```text
Cost per Request
Cost per Claim
Cost per User
```

---

## Evaluation

Measure:

```text
Answer quality
Source quality
Human correction rate
Hallucination rate
```

---

# Recommended Learning Order For You

Because you already have:

```text
Tech Lead
NodeJS
Java
Python
React
AWS
Azure
```

I would not spend months on ML theory.

Instead:

### Week 1

AI Basics

```text
AI
ML
Deep Learning
Embeddings
LLM
Tokens
Context Window
```

---

### Week 2

Prompt Engineering

```text
Structured Output
Function Calling
Tool Calling
JSON Schema
```

---

### Week 3

RAG

```text
Chunking
Embedding
Vector DB
Retriever
Citation
```

Build:

```text
Policy Q&A Bot
```

---

### Week 4

AI Service Architecture

```text
NestJS
FastAPI
OpenAI
PostgreSQL
pgvector
```

Build:

```text
AI Copilot
```

---

### Week 5

Agents

```text
Workflows
LangGraph
Tool Calling
Human Review
```

Build:

```text
Claim Investigation Agent
```

---

### Week 6

Production AI

```text
Security
FinOps
LLMOps
Evaluation
Observability
```

---

# First AI Application You Should Build

Do NOT build:

```text
ChatGPT Clone
```

Build:

```text
Insurance Policy Copilot
```

Architecture:

```text
NextJS
 |
NestJS
 |
FastAPI AI Service
 |
OpenAI
 |
pgvector
 |
PostgreSQL
 |
Langfuse
```

Features:

```text
Upload PDF
Chunk document
Generate embeddings
Store vectors
Ask questions
Answer with citations
Track cost
Track prompts
Track latency
```

This single project will teach you:

```text
Embeddings
RAG
Prompting
Vector DB
LLM
Security
Evaluation
FinOps
LLMOps
AI Architecture
```

which are the foundations of almost every modern AI-first application.
