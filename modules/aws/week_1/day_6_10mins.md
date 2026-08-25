Được. Với **Day 6**, thay vì cố nhớ hàng loạt service + metric, hãy gom tất cả vào một câu hỏi:

> **Data đã chuẩn bị xong chưa, có đủ chất lượng và có bias trước khi đưa vào model không?**

Nếu Day 5 là:

> **Engineer → Store → Serve features**

thì Day 6 nên nhớ:

> **Validate → Measure → Detect Bias → Fix → Train**

AWS MLA-C01 đặt các nội dung này trong **Domain 1 – Task 1.3: Ensure data integrity and prepare data for modeling**, bao gồm data quality, class imbalance, pre-training bias, DPL/CI và các kỹ thuật giảm bias. ([AWS Documentation][1])

# Day 6 — 10-minute mental model

```text
PREPARED DATA
     │
     ▼
① VALIDATE QUALITY
     │
     ▼
② MEASURE QUALITY
     │
     ▼
③ DETECT BIAS
     │
     ▼
④ MITIGATE BIAS
     │
     ▼
⑤ TRAIN MODEL
```

Hai AWS service cần bật ra trong đầu:

```text
Data Quality
    → AWS Glue Data Quality

Bias / Fairness
    → SageMaker Clarify
```

---

# 1. DATA QUALITY — trước tiên hỏi data có đáng tin không?

Ví dụ dataset:

```text
customer_id    age    income
C001           30     50000
C002           null   70000
C002           null   70000
C004           -10    40000
```

Có ít nhất:

```text
Missing value
Duplicate
Invalid value
```

Mental model:

> **Data Quality = data có đúng với expectation không?**

Các dimension thường gặp:

```text
Completeness
Uniqueness
Validity
Consistency
Accuracy
Freshness
```

Trong exam, quan trọng nhất thường là:

```text
NULL?
Duplicate?
Range valid?
Schema đúng?
Row count bất thường?
```

---

# 2. AWS GLUE DATA QUALITY

AWS service chính:

> **AWS Glue Data Quality**

Nó cho phép định nghĩa các rule rồi evaluate dataset; AWS mô tả **Data Quality Score** là tỷ lệ phần trăm các data-quality rules pass. ([AWS Documentation][2])

Mental model:

```text
DATA
 │
 ▼
QUALITY RULES
 │
 ▼
PASS / FAIL
 │
 ▼
DATA QUALITY SCORE
```

Ví dụ:

```text
Rule 1 → customer_id must exist
Rule 2 → customer_id unique
Rule 3 → age between 0-120
Rule 4 → income >= 0
```

Nếu:

```text
3 rules pass
1 rule fail
```

thì:

```text
Data Quality Score = 75%
```

Không cần nghĩ công thức phức tạp:

> **DQ Score = % rules passed**

---

# 3. DQDL — cái tên phải nhận diện

AWS Glue Data Quality dùng:

> **Data Quality Definition Language — DQDL**

AWS định nghĩa DQDL là domain-specific language để viết rules cho Glue Data Quality. ([AWS Documentation][3])

Ví dụ:

```text
Rules = [
   IsComplete "customer_id",
   IsUnique "customer_id"
]
```

Bạn không cần học thuộc syntax cho MLA-C01.

Chỉ cần nhớ:

> **DQDL = language for defining Glue Data Quality rules**

Ví dụ mental mapping:

| Requirement                   | Rule idea      |
| ----------------------------- | -------------- |
| No null ID                    | `IsComplete`   |
| ID unique                     | `IsUnique`     |
| 90% values available          | `Completeness` |
| Dataset must have records     | `RowCount`     |
| Values within valid set/range | `ColumnValues` |

AWS docs cũng dùng những rule như `IsComplete`, `IsUnique` và `Completeness`. ([AWS Documentation][3])

---

# 4. DATA QUALITY vs DATA CLEANING

Exam rất dễ trộn hai thứ này.

### Data Quality

> **Detect vấn đề**

```text
age has 10% NULL
```

### Data Cleaning

> **Fix vấn đề**

```text
NULL
 ↓
median imputation
```

Mental shortcut:

> **Quality = CHECK**
> **Cleaning = FIX**

Ví dụ:

```text
Glue Data Quality
      ↓
发现 15% missing values
      ↓
Glue / Data Wrangler / DataBrew
      ↓
clean / transform
```

---

# 5. DATABREW vs GLUE DATA QUALITY

Đây là cặp rất dễ nhầm.

### Glue DataBrew

Mental model:

> **Visually clean data**

Ví dụ:

```text
Remove NULL
Remove duplicates
Normalize values
Fix columns
```

### Glue Data Quality

Mental model:

> **Validate data using rules**

Ví dụ:

```text
Completeness > 95%
customer_id unique
age between 0-120
```

Shortcut:

```text
DataBrew
→ CLEAN

Glue Data Quality
→ CHECK
```

---

# 6. BIAS — concept lớn thứ hai của Day 6

Giả sử bạn train loan approval model.

Dataset:

```text
Group A → 90,000 samples
Group B → 10,000 samples
```

Model có khả năng học Group A tốt hơn.

Đây có thể tạo ra:

> **Bias**

AWS exam guide yêu cầu nhận diện bias trong data, bao gồm **selection bias, measurement bias**, và các pre-training bias metrics như **CI và DPL**. ([AWS Documentation][1])

Mental model:

```text
BAD / UNBALANCED DATA
        ↓
MODEL LEARNS IT
        ↓
BIASED PREDICTIONS
```

---

# 7. FACET — từ khóa cực quan trọng trong Clarify

Trong SageMaker Clarify:

> **Facet = attribute/group mà bạn muốn kiểm tra bias**

AWS định nghĩa facet là feature/column chứa attribute dùng để đo bias. ([AWS Documentation][4])

Ví dụ:

```text
age_group
gender
region
```

Giả sử:

```text
age_group:

25-50 → facet A
50+   → facet D
```

Clarify thường nói:

```text
Facet a
→ favored group

Facet d
→ disfavored group
```

Mental shortcut:

> **Facet = GROUP being compared**

---

# 8. PRE-TRAINING vs POST-TRAINING BIAS

Đây có lẽ là distinction quan trọng nhất của Day 6.

## Pre-training bias

Model:

```text
❌ chưa tồn tại
```

Bạn đang hỏi:

> Dataset có bias không?

```text
DATA
 ↓
Clarify
 ↓
Bias metrics
```

Ví dụ:

```text
Group A = 90%
Group D = 10%
```

→ imbalance trước training.

Mental shortcut:

> **PRE = DATA bias**

---

## Post-training bias

Model đã train:

```text
DATA
 ↓
TRAIN
 ↓
MODEL
 ↓
PREDICTIONS
```

Bạn hỏi:

> Model có predict khác nhau giữa các groups không?

Mental shortcut:

> **POST = MODEL/PREDICTION bias**

AWS Clarify có riêng các pre-training và post-training bias metrics. ([AWS Documentation][5])

Nhớ:

```text
PRE
→ inspect labels/data

POST
→ inspect predictions
```

---

# 9. CI — CLASS IMBALANCE

Metric đầu tiên nên thuộc:

> **CI = Class Imbalance**

Ví dụ:

```text
Group A = 900 samples
Group D = 100 samples
```

→ strongly imbalanced.

AWS định nghĩa:

```text
CI = (na - nd) / (na + nd)
```

với range:

```text
-1 → +1
```

Giá trị gần:

```text
0 → groups khá balanced

+1 / -1
→ strongly imbalanced
```

([AWS Documentation][6])

Nhưng cho exam, đừng tập trung công thức.

Mental shortcut:

> **CI asks: “Hai groups có số lượng sample cân bằng không?”**

---

# 10. CI của Clarify KHÁC class imbalance thông thường

Đây là một trap nhỏ nhưng đáng chú ý.

Classification dataset:

```text
Fraud     = 1%
NonFraud  = 99%
```

Đây là:

> target class imbalance.

Clarify CI có thể kiểm tra imbalance giữa **facet groups**:

```text
Group A = 90%
Group D = 10%
```

Hai concept liên quan nhưng không hoàn toàn giống nhau.

Exam thường chỉ cần nhận diện:

> dataset/group representation imbalance → **CI**

---

# 11. DPL — DIFFERENCE IN PROPORTIONS OF LABELS

Metric thứ hai rất đáng thuộc:

> **DPL = Difference in Proportions of Labels**

Mental question:

> Hai groups có tỷ lệ **positive label** khác nhau không?

Ví dụ loan dataset:

```text
Group A
100 people
80 approved

positive rate = 80%
```

Group D:

```text
100 people
40 approved

positive rate = 40%
```

Difference:

```text
80% - 40%
= 40%
```

→ labels có disparity lớn.

Mental shortcut:

> **DPL = compare LABEL outcomes**

Và quan trọng:

> **DPL = PRE-training**

---

# 12. CI vs DPL — thuộc bảng này

| Metric  | Hỏi gì?                                              |
| ------- | ---------------------------------------------------- |
| **CI**  | Hai groups có bao nhiêu samples?                     |
| **DPL** | Hai groups có tỷ lệ positive labels khác nhau không? |

Ví dụ:

```text
Group A = 900
Group D = 100
```

→ nghĩ:

> **CI**

Ví dụ:

```text
A approval = 80%
D approval = 40%
```

→ nghĩ:

> **DPL**

Shortcut:

```text
CI
→ COUNT

DPL
→ LABEL
```

---

# 13. DPPL — post-training counterpart rất dễ nhớ

Sau khi model predict:

```text
Group A predicted approved = 70%
Group D predicted approved = 40%
```

Metric:

> **DPPL = Difference in Positive Proportions in Predicted Labels**

AWS định nghĩa DPPL là difference giữa proportion positive predictions của các facets. ([AWS Documentation][7])

Mental shortcut cực hay:

```text
DPL
→ Labels
→ PRE-training

DPPL
→ Predicted Labels
→ POST-training
```

Chỉ cần thấy chữ:

> **PREDICTED**

→ biết model đã tồn tại.

---

# 14. SageMaker Clarify

Mental model:

> **Bias + Fairness + Explainability**

```text
Dataset
   │
   ├── Pre-training bias
   │
   └── Train model
            │
            ▼
      Post-training bias
```

Clarify cũng hỗ trợ feature attribution/explainability ngoài bias detection. ([AWS Documentation][8])

Đối với Day 6, ưu tiên:

```text
Clarify
   ↓
Bias detection

PRE
→ CI
→ DPL

POST
→ DPPL
→ other model fairness metrics
```

---

# 15. Một lưu ý hiện tại về Clarify

Có một thay đổi AWS khá mới: **SageMaker Clarify đóng quyền truy cập cho khách hàng mới từ ngày 30/07/2026**; khách hàng hiện tại vẫn có thể sử dụng. ([AWS Documentation][8])

Tuy nhiên, với mục tiêu của bạn là **MLA-C01**, vẫn phải học Clarify: exam guide MLA-C01 hiện tại vẫn liệt kê bias detection bằng SageMaker Clarify/“Clarity” và các pre-training metrics như **CI, DPL**. ([AWS Documentation][1])

Vì vậy:

> **Real-world AWS 2026:** biết service lifecycle đã thay đổi.
> **MLA-C01 exam:** vẫn học Clarify.

---

# 16. MITIGATE BIAS — phát hiện xong phải biết xử lý

Giả sử:

```text
Class A = 95%
Class B = 5%
```

Các option:

```text
Oversampling
Undersampling
Synthetic data
Data augmentation
Class weighting
Collect more representative data
```

AWS exam guide explicit đề cập các chiến lược như:

> synthetic data generation và resampling. ([AWS Documentation][1])

Mental shortcut:

```text
Minority too small
       ↓
MORE minority
       ↓
oversampling / synthetic
```

Hoặc:

```text
Majority huge
     ↓
LESS majority
     ↓
undersampling
```

---

# 17. SELECTION BIAS vs MEASUREMENT BIAS

Không cần học academic quá sâu.

## Selection Bias

Data sample không đại diện population.

Ví dụ:

```text
Want:
all customers

Collected:
only premium customers
```

→ **Selection bias**

Mental shortcut:

> **Wrong WHO**

---

## Measurement Bias

Cách đo data tạo ra distortion.

Ví dụ:

```text
Sensor A
→ accurate

Sensor B
→ consistently +5 degrees
```

→ **Measurement bias**

Mental shortcut:

> **Wrong HOW**

Nhớ:

```text
Selection bias
→ sample problem

Measurement bias
→ measurement problem
```

---

# 18. DAY 4 vs DAY 5 vs DAY 6

Để không bị lẫn cả tuần:

```text
DAY 4
Data Preparation
↓
Clean + Transform + Split
```

```text
DAY 5
Features
↓
Engineer + Store + Serve
```

```text
DAY 6
Integrity
↓
Quality + Bias
```

Mental model cả ba ngày:

```text
RAW DATA
    │
    ▼
DAY 4
CLEAN / TRANSFORM
    │
    ▼
DAY 5
FEATURE ENGINEERING
    │
    ▼
DAY 6
QUALITY + BIAS CHECK
    │
    ▼
TRAIN MODEL
```

---

# Các AWS services Day 6 — chỉ nhớ như này

| Service               | Mental model                          |
| --------------------- | ------------------------------------- |
| **Data Wrangler**     | ML data preparation                   |
| **DataBrew**          | Visual/no-code cleaning               |
| **AWS Glue**          | ETL                                   |
| **Glue Data Quality** | Validate data                         |
| **DQDL**              | Define quality rules                  |
| **SageMaker Clarify** | Detect bias/fairness + explainability |
| **Feature Store**     | Store/reuse ML features               |

Nếu exam hỏi:

```text
Need visually clean dataset
→ DataBrew
```

```text
Need validate completeness / uniqueness
→ Glue Data Quality
```

```text
Need write data-quality rules
→ DQDL
```

```text
Need detect pre-training bias
→ Clarify
```

```text
Need centralized features
→ Feature Store
```

---

# Exam Trap #1 — DataBrew vs Glue Data Quality

> Need remove NULL / transform data.

→ **DataBrew**

> Need continuously check if NULL percentage exceeds threshold.

→ **Glue Data Quality**

Think:

```text
FIX
→ DataBrew

CHECK
→ Glue Data Quality
```

---

# Exam Trap #2 — DPL vs DPPL

Question says:

> Analyze bias before training.

→ **DPL**

Question says:

> Analyze differences in model predictions.

→ **DPPL**

Remember:

```text
DPL
→ Labels

DPPL
→ Predicted Labels
```

---

# Exam Trap #3 — CI vs DPL

Question:

> Group A has 95,000 records, Group B has 5,000.

→ **CI**

Question:

> Approval label is positive for 80% of A but only 30% of B.

→ **DPL**

Remember:

> **CI = COUNT**
> **DPL = OUTCOME**

---

# Exam Trap #4 — Data Quality Score

Suppose:

```text
10 rules total
8 pass
2 fail
```

Do not overthink:

```text
DQ Score = 80%
```

AWS defines it directly as percentage of rules passing. ([AWS Documentation][2])

---

# Exam Trap #5 — model chưa train nhưng chọn post-training metric

Nếu scenario:

```text
Dataset
↓
Need identify bias
↓
Model NOT trained
```

Không chọn post-training metric.

Think:

> **PRE-training bias**

---

# Exam Trap #6 — Accuracy tốt ≠ Fair model

Model:

```text
Overall accuracy = 96%
```

nhưng:

```text
Group A accuracy = 98%
Group D accuracy = 70%
```

Vẫn có fairness/bias concern.

Do not assume:

> high accuracy = unbiased.

---

# Day 6 trong một sơ đồ duy nhất

```text
              PREPARED DATA
                    │
                    ▼
         ┌────────────────────┐
         │  DATA QUALITY      │
         │                    │
         │ Completeness       │
         │ Uniqueness         │
         │ Validity           │
         └─────────┬──────────┘
                   │
                   ▼
          GLUE DATA QUALITY
                   │
            DQDL Rules
                   │
          Data Quality Score
                   │
                   ▼
         ┌────────────────────┐
         │   BIAS CHECK       │
         │                    │
         │ Facet              │
         │ CI                 │
         │ DPL                │
         └─────────┬──────────┘
                   │
                   ▼
          SAGEMAKER CLARIFY
                   │
             mitigate bias
                   │
                   ▼
              TRAIN MODEL
                   │
                   ▼
           POST-TRAIN BIAS
                   │
                  DPPL
```

# Nếu chỉ có 10 phút học Day 6

Học đúng thứ tự này:

1. **Data Quality = validate data**
2. **Glue Data Quality**
3. **DQDL**
4. **Data Quality Score = % rules passed**
5. **Facet**
6. **Pre-training vs Post-training bias**
7. **CI**
8. **DPL**
9. **DPPL**
10. **SageMaker Clarify**
11. **Selection bias vs Measurement bias**
12. **Resampling / synthetic data để mitigate bias**

---

# Nếu còn đúng 2 phút trước exam

Chỉ học bảng này:

| Đề nói...                                  | Nghĩ ngay                       |
| ------------------------------------------ | ------------------------------- |
| Check data quality                         | **Glue Data Quality**           |
| Define quality rules                       | **DQDL**                        |
| % quality rules pass                       | **Data Quality Score**          |
| Visually clean data                        | **DataBrew**                    |
| Attribute/group tested for bias            | **Facet**                       |
| Group sample counts unequal                | **CI**                          |
| Positive labels differ before training     | **DPL**                         |
| Positive predictions differ after training | **DPPL**                        |
| Detect bias                                | **SageMaker Clarify**           |
| Dataset not representative                 | **Selection bias**              |
| Data measured incorrectly                  | **Measurement bias**            |
| Minority underrepresented                  | **Resampling / synthetic data** |

Và câu thần chú Day 6:

> **QUALITY before MODEL → CI counts PEOPLE → DPL checks LABELS → DPPL checks PREDICTIONS.**

Hoặc phiên bản 5 giây:

```text
Glue DQ = Is my DATA good?

Clarify PRE = Is my DATA biased?

Clarify POST = Is my MODEL biased?
```

Nếu nắm chắc ba dòng cuối này, phần lớn scenario Day 6 sẽ trở thành bài **nhận diện keyword → chọn đúng concept/service**, thay vì phải nhớ hàng chục định nghĩa riêng lẻ.

[1]: https://docs.aws.amazon.com/pdfs/aws-certification/latest/machine-learning-engineer-associate-01/machine-learning-engineer-associate-01.pdf?utm_source=chatgpt.com "AWS Certified Machine Learning Engineer - Associate - Exam Guide (MLA-C01)"
[2]: https://docs.aws.amazon.com/glue/latest/dg/glue-data-quality.html?utm_source=chatgpt.com "AWS Glue Data Quality - AWS Glue"
[3]: https://docs.aws.amazon.com/glue/latest/dg/dqdl.html?utm_source=chatgpt.com "Data Quality Definition Language (DQDL) reference - AWS Glue"
[4]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-detect-data-bias.html?utm_source=chatgpt.com "Pre-training Data Bias - Amazon SageMaker AI"
[5]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-processing-job-analysis-results.html?utm_source=chatgpt.com "Analysis Results - Amazon SageMaker AI"
[6]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-bias-metric-class-imbalance.html?utm_source=chatgpt.com "Class Imbalance (CI) - Amazon SageMaker AI"
[7]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-post-training-bias-metric-dppl.html?utm_source=chatgpt.com "Difference in Positive Proportions in Predicted Labels (DPPL) - Amazon SageMaker AI"
[8]: https://docs.aws.amazon.com/sagemaker/latest/dg/clarify-configure-processing-jobs.html?utm_source=chatgpt.com "Fairness, model explainability and bias detection with SageMaker Clarify - Amazon SageMaker AI"
