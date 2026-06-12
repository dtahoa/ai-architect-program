# Evaluation

The evaluation runner measures whether the copilot is grounded in policy text.

## Current Metrics

- `grounded`: answer includes citations.
- `contains_expected_hint`: answer or citation content references the expected keyword.
- `score`: simple average of grounding and hint checks.

## Recommended Production Metrics

- Retrieval recall: did the retrieved chunks contain the correct clause?
- Citation precision: do cited chunks actually support the answer?
- Faithfulness: does the answer avoid claims not present in the source?
- Refusal quality: does it say "cannot determine" when policy text is missing?
- Latency and cost per successful answer.
- Regression score by prompt/model version.

## How to Run

1. Upload at least one policy PDF.
2. Open the Evaluation tab in the web app.
3. Run `default-policy-checks`.

The same endpoint can be called from CI after loading a known fixture policy.

