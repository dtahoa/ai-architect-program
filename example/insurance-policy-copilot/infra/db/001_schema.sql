CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  sha256 TEXT NOT NULL UNIQUE,
  page_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  page_start INTEGER NOT NULL,
  page_end INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_estimate INTEGER NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
  ON document_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, version)
);

CREATE TABLE IF NOT EXISTS prompt_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_template_id UUID REFERENCES prompt_templates(id),
  request_type TEXT NOT NULL,
  question TEXT,
  rendered_system_prompt TEXT,
  rendered_user_prompt TEXT,
  model TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS llm_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_run_id UUID REFERENCES prompt_runs(id) ON DELETE SET NULL,
  operation TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_run_id UUID REFERENCES prompt_runs(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluation_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluation_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_set_id UUID NOT NULL REFERENCES evaluation_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  expected_citation_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluation_cases_set_question
  ON evaluation_cases(evaluation_set_id, question);

CREATE TABLE IF NOT EXISTS evaluation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_set_id UUID NOT NULL REFERENCES evaluation_sets(id),
  model TEXT NOT NULL,
  score NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evaluation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_run_id UUID NOT NULL REFERENCES evaluation_runs(id) ON DELETE CASCADE,
  evaluation_case_id UUID NOT NULL REFERENCES evaluation_cases(id),
  answer TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  grounded BOOLEAN NOT NULL,
  contains_expected_hint BOOLEAN NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO prompt_templates (name, version, system_prompt, user_prompt, is_active)
VALUES (
  'insurance_policy_rag',
  1,
  'You are an insurance policy copilot. Answer only from the supplied policy context. If the answer is not supported, say you cannot determine it from the uploaded policy. Return concise business language and include citation markers like [1], [2].',
  'Question: {{question}}

Policy context:
{{context}}

Citation rules:
- Use only the provided chunks.
- Every factual claim about coverage, exclusions, limits, or conditions must cite at least one source.
- Do not invent policy terms.',
  true
)
ON CONFLICT (name, version) DO NOTHING;

INSERT INTO evaluation_sets (name, description)
VALUES ('default-policy-checks', 'Core checks for coverage, exclusions, limits, and citation grounding.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO evaluation_cases (evaluation_set_id, question, expected_answer, expected_citation_hint)
SELECT s.id, item.question, item.expected_answer, item.expected_citation_hint
FROM evaluation_sets s
CROSS JOIN (
  VALUES
    (
      'What events are covered by this policy?',
      'The answer should list covered events only when supported by the policy text.',
      'cover'
    ),
    (
      'Are floods excluded or covered?',
      'The answer should not guess. It should cite the flood clause if present or say the uploaded policy does not determine it.',
      'flood'
    ),
    (
      'What is the claim notification deadline?',
      'The answer should include the deadline or state that the uploaded policy does not specify it.',
      'notice'
    )
) AS item(question, expected_answer, expected_citation_hint)
WHERE s.name = 'default-policy-checks'
  AND NOT EXISTS (
    SELECT 1
    FROM evaluation_cases c
    WHERE c.evaluation_set_id = s.id
      AND c.question = item.question
  );
