Nếu mục tiêu của bạn là xây dựng **AI Architect Learning Program + Workshop + Capstone Project** và cập nhật liên tục trong 3–12 tháng tới, mình không khuyến khích Google Drive.

Thay vào đó nên chọn một trong các lựa chọn dưới đây:

# 1. GitHub (Khuyến nghị nhất)

Nếu bạn là Tech Lead/Architect.

### Structure

```text
ai-architect-program/
│
├── modules/
│   ├── module-01-ai-fundamentals.md
│   ├── module-02-ai-architecture-principles.md
│   ├── ...
│   └── module-10-technical-leadership.md
│
├── workshops/
│   ├── workshop-01-ai-first-vs-retrofit.md
│   └── workshop-02-capstone.md
│
├── capstone/
│   ├── requirements.md
│   ├── scoring-rubric.md
│   └── pass-fail-criteria.md
│
├── adr/
│   ├── ADR-001.md
│   ├── ADR-002.md
│   └── ...
│
├── diagrams/
│
└── README.md
```

### Ưu điểm

```text
✓ Free
✓ Version control
✓ Track history
✓ Pull Request review
✓ Markdown native
✓ Mermaid diagrams
✓ PlantUML support
✓ Team collaboration
✓ Professional architect workflow
```

### Thực tế

90%+ Architect, Principal Engineer, Staff Engineer sẽ lưu:

```text
ADR
Architecture Docs
RFC
System Design
Training Materials
```

trên Git repository.

---

# 2. GitHub + MkDocs (Tốt nhất cho Training Program)

Đây là setup mình khuyên cho khóa học của bạn.

## Documentation as Code

Viết:

```text
Markdown
```

Build thành website:

```text
AI Architect Learning Portal
```

Ví dụ:

```text
Home
├── Module 1
├── Module 2
├── Module 3
├── ...
├── Workshop 1
├── Workshop 2
└── Capstone
```

---

### Tech Stack

```text
GitHub
+
MkDocs
+
Material Theme
+
GitHub Pages
```

### Cost

```text
FREE
```

### Kết quả

Website kiểu:

```text
https://your-org.github.io/ai-architect-program
```

---

# 3. Notion

Nếu audience là:

```text
Manager
BA
Product Owner
Non-technical audience
```

Notion rất tốt.

### Ưu điểm

```text
✓ Dễ viết
✓ Dễ chia sẻ
✓ Database
✓ Templates
✓ Nice UI
```

### Nhược điểm

```text
✗ Khó quản lý version
✗ Khó review architecture changes
✗ Không phù hợp ADR lớn
✗ Diagram management chưa tốt
```

---

# 4. Obsidian

Nếu học một mình.

### Ưu điểm

```text
✓ Local-first
✓ Markdown
✓ Knowledge graph
✓ Free
✓ Cross-linking
```

Ví dụ:

```text
Module 3
   ↓
RAG
   ↓
Vector Database
   ↓
Workshop 1
   ↓
Capstone
```

Bạn sẽ có knowledge graph rất mạnh.

### Nhược điểm

```text
✗ Collaboration yếu
✗ Không phải enterprise workflow
```

---

# 5. Docusaurus

Nếu muốn xây:

```text
Internal AI Architecture Academy
```

giống:

* Stripe Docs
* Kubernetes Docs
* OpenAI Docs

### Ưu điểm

```text
✓ Professional
✓ Versioning
✓ Search
✓ Blog
✓ Docs portal
```

### Nhược điểm

```text
✗ Setup phức tạp hơn MkDocs
```

---

# Cách mình sẽ làm nếu là AI Architect Lead

## Personal Learning

```text
Obsidian
```

để ghi chép.

---

## Team Knowledge Base

```text
GitHub Repository
```

Structure:

```text
/architecture
/modules
/workshops
/capstone
/adr
```

---

## Publish khóa học

```text
MkDocs + GitHub Pages
```

Flow:

```text
Markdown
      ↓
GitHub
      ↓
MkDocs
      ↓
GitHub Pages
```

Kết quả:

```text
AI Architect Program Portal
```

có:

```text
Module 1-10
Workshop 1
Workshop 2
Capstone
ADR templates
Architecture templates
Evaluation rubric
Pass/fail criteria
```

và hoàn toàn miễn phí.

### Đề xuất cuối cùng cho chương trình của bạn

```text
Storage & Versioning:
GitHub

Documentation:
Markdown

Publishing:
MkDocs Material

Diagram:
draw.io + Mermaid

ADR:
Markdown trong /adr

Workshop Deliverables:
Markdown + PPT

Capstone Repository:
GitHub
```

Đây là cách gần nhất với quy trình mà các team kiến trúc tại các công ty như Microsoft, Amazon, Google và nhiều SaaS engineering organization sử dụng cho architecture governance và technical knowledge management.
