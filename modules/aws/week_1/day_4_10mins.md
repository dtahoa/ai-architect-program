Có. Day 4 nhiều concept nhưng thực ra có thể nén lại thành một **mental model 5 bước**. Đừng cố nhớ từng kỹ thuật rời rạc; hãy nhớ pipeline:

> **Clean → Transform → Engineer → Balance → Split**

Đây là bản quick summary nên thuộc trước khi đi sâu:

| Bước             | Câu hỏi cần trả lời                  | Concept chính cần nhớ                                                        |
| ---------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| **1. Clean**     | Data có “bẩn” không?                 | Missing values, outliers, duplicates, inconsistent categories                |
| **2. Transform** | Data có cùng scale / format không?   | Normalization, standardization, categorical encoding, binning, log transform |
| **3. Engineer**  | Có thể tạo feature tốt hơn không?    | Date/time features, aggregation, interaction features, feature selection     |
| **4. Balance**   | Target có lệch class không?          | Oversampling, undersampling, synthetic samples, class weights                |
| **5. Split**     | Chia data thế nào để model học đúng? | Train/Validation/Test, stratified split, shuffle, time-series split, leakage |

### 1. CLEAN — sửa data trước khi train

Mental model:

> **Missing → Wrong → Duplicate → Extreme**

* **Missing value**: mean / median / mode / drop.
* **Outlier**: investigate trước, sau đó cap / remove / log transform.
* **Duplicate**: deduplicate.
* **Category không thống nhất**: `US`, `USA`, `United States` → chuẩn hóa.

Exam shortcut:

> Data quality problem → nghĩ **cleaning** trước, chưa nghĩ tới model.

---

### 2. TRANSFORM — biến data sang dạng model dễ học

Ba cặp quan trọng nhất:

**Normalization vs Standardization**

```text
Normalization
→ thường scale 0 → 1

Standardization
→ mean ≈ 0
→ std ≈ 1
```

Mental shortcut:

> **Normalize = Range**
> **Standardize = Distribution**

**One-hot vs Ordinal encoding**

```text
Color:
Red / Blue / Green
→ One-hot
```

Vì không có thứ tự.

```text
Size:
Small < Medium < Large
→ Ordinal encoding
```

Mental shortcut:

> **Nominal → One-hot**
> **Ordinal → Ordinal encoding**

Ngoài ra có:

```text
Binning
age → 0-18 / 19-35 / 36-60

Log transform
100, 1000, 100000
→ giảm skew
```

---

### 3. FEATURE ENGINEERING — biến raw data thành signal tốt hơn

Ví dụ bạn có:

```text
purchase_timestamp
2026-08-25 08:30
```

Có thể tạo:

```text
hour = 8
day_of_week = Tuesday
is_weekend = false
```

Hoặc:

```text
price = 10
quantity = 5

total_value = price × quantity = 50
```

Đây chính là feature engineering.

Mental model:

> **Raw data → useful signal**

Các loại nên nhận diện:

```text
Date/time feature
Aggregation
Interaction feature
Log transformation
Binning
```

---

### 4. FEATURE SELECTION — không phải càng nhiều feature càng tốt

Nếu có:

```text
height_cm
height_meter
```

hai feature gần như chứa cùng information.

Có thể gây:

> **multicollinearity**

Hoặc có 1,000 features nhưng nhiều feature vô ích → tăng noise, computation và overfitting.

Mental model:

> **Feature Engineering = tạo feature**
> **Feature Selection = bỏ feature không cần thiết**

---

### 5. CLASS IMBALANCE — cực kỳ hay gặp trong exam

Ví dụ fraud detection:

```text
Normal: 99,000
Fraud:   1,000
```

Accuracy 99% có thể vẫn là model tệ.

Các cách xử lý:

```text
Oversampling
→ tăng minority class

Undersampling
→ giảm majority class

Synthetic sampling
→ tạo thêm minority samples

Class weights
→ phạt sai minority class mạnh hơn
```

Mental shortcut:

> **Imbalanced data → đừng tin accuracy ngay.**

Có thể cần Precision, Recall, F1, PR-AUC tùy bài toán.

---

## Concept nguy hiểm nhất Day 4: DATA LEAKAGE

Nếu chỉ nhớ **một exam trap**, nhớ cái này.

Ví dụ muốn predict khách hàng có default khoản vay hay không.

Bạn vô tình dùng:

```text
default_date
```

làm feature.

Model accuracy cực cao.

Nhưng `default_date` chỉ tồn tại **sau khi default xảy ra**.

→ **Target leakage.**

Mental model:

> Model đã “nhìn thấy đáp án”.

Một dạng khác rất hay thi:

Bạn standardize toàn bộ dataset:

```text
Full dataset
     ↓
StandardScaler.fit()
     ↓
Train/Test split
```

Sai.

Vì statistics của test set đã leak vào training.

Đúng:

```text
Split
 ↓
Train ── fit scaler
 ↓
transform train

Test
 ↓
transform using SAME scaler
```

Shortcut:

> **Split first → fit transformations on TRAIN only.**

---

# Train / Validation / Test

Nhớ đúng vai trò:

```text
TRAIN
↓
model learns

VALIDATION
↓
choose model / hyperparameters

TEST
↓
final unbiased evaluation
```

Không dùng test set để tune model.

Mental model:

> **Train = học**
> **Validation = chọn**
> **Test = thi**

---

# Stratified vs Random vs Time-series Split

Đây là phần rất đáng học vì exam thích hỏi.

### Random split

Data độc lập, không có vấn đề chronology:

```text
random split
```

### Stratified split

Class imbalance:

```text
Fraud = 1%
Normal = 99%
```

Muốn train/test vẫn giữ tỷ lệ gần 1/99:

> **Stratified split**

### Time-series

Ví dụ predict demand:

```text
Jan Feb Mar Apr → Train

May → Validation

Jun → Test
```

Không random:

```text
Jan May Mar → train ❌
Feb Jun → test
```

vì future information có thể leak vào past.

Mental shortcut:

> **Time series → preserve chronology.**

---

# AWS services Day 4 — chỉ cần nhớ 3 cái

Bạn không cần học tất cả feature của từng service ngay. Chỉ cần mental map:

```text
Data Wrangler
     ↓
ML-focused data preparation

DataBrew
     ↓
Visual/no-code data cleaning

Glue
     ↓
ETL / large-scale data integration
```

### SageMaker Data Wrangler

Nếu đề nói:

> ML engineer muốn visual prepare, clean, transform, feature engineer data trước SageMaker training.

→ nghĩ **Data Wrangler**.

### AWS Glue DataBrew

Nếu đề nói:

> Business analyst / data analyst muốn visually clean data, little/no code.

→ nghĩ **DataBrew**.

### AWS Glue

Nếu đề nói:

> Large ETL pipeline, Spark, catalog, transform data across data lake.

→ nghĩ **Glue**.

Mental shortcut:

> **ML prep → Data Wrangler**
> **No-code cleaning → DataBrew**
> **ETL pipeline → Glue**

---

# Day 4 trong một sơ đồ duy nhất

Bạn có thể thuộc sơ đồ này:

```text
RAW DATA
   │
   ▼
① CLEAN
Missing
Outliers
Duplicates
Categories
   │
   ▼
② TRANSFORM
Scaling
Encoding
Binning
Log
   │
   ▼
③ FEATURE ENGINEERING
Date/time
Aggregation
Interaction
Selection
   │
   ▼
④ BALANCE
Over/undersampling
Class weights
   │
   ▼
⑤ SPLIT
Train
Validation
Test
   │
   ▼
MODEL TRAINING
```

Và bao quanh toàn bộ pipeline là một cảnh báo lớn:

```text
          ⚠ DATA LEAKAGE ⚠

Never let information from
Validation/Test/Future
leak into Training
```

# Nếu học Day 4 trong 10 phút

Tôi khuyên tập trung theo thứ tự này:

1. **Data leakage** — cực quan trọng.
2. **Train / Validation / Test**.
3. **Normalization vs Standardization**.
4. **One-hot vs Ordinal encoding**.
5. **Class imbalance**.
6. **Stratified vs Time-series split**.
7. **Missing / Outlier / Duplicate**.
8. **Feature engineering vs feature selection**.
9. **Data Wrangler vs DataBrew vs Glue**.

Nếu gặp câu MLA-C01, hãy tự hỏi theo cây quyết định:

```text
Data problem là gì?
│
├─ Missing / duplicate / outlier?
│     → CLEAN
│
├─ Scale khác nhau?
│     → NORMALIZE / STANDARDIZE
│
├─ Categorical?
│     ├─ no order → ONE-HOT
│     └─ ordered → ORDINAL
│
├─ Minority class quá ít?
│     → CLASS IMBALANCE
│
├─ Accuracy bất thường cao?
│     → CHECK LEAKAGE
│
├─ Need same class ratio?
│     → STRATIFIED SPLIT
│
├─ Time-series?
│     → CHRONOLOGICAL SPLIT
│
└─ AWS service?
      ├─ ML prep → DATA WRANGLER
      ├─ no-code clean → DATABREW
      └─ ETL → GLUE
```

Nếu bạn **thuộc được cây này**, bạn đã nắm khoảng “xương sống” của Day 4; những concept còn lại chủ yếu là mở rộng của các nhánh trên.
