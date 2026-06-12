const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export type DocumentRow = {
  id: string;
  filename: string;
  page_count: number;
  status: string;
  created_at: string;
  chunks: number;
};

export type Citation = {
  marker: string;
  chunkId: string;
  documentId: string;
  filename: string;
  pageStart: number;
  pageEnd: number;
  similarity: number;
  preview: string;
};

export type ChatResponse = {
  answer: string;
  citations: Citation[];
  usage: {
    promptRunId: string;
    latencyMs: number;
    embeddingTokens: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
};

export type CostTelemetry = {
  totals: {
    total_cost_usd: number;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  byOperation: Array<{
    operation: string;
    calls: number;
    total_tokens: number;
    estimated_cost_usd: number;
  }>;
  recentRuns: Array<{
    id: string;
    request_type: string;
    question: string | null;
    model: string;
    latency_ms: number;
    created_at: string;
  }>;
};

export type PromptRow = {
  id: string;
  name: string;
  version: number;
  is_active: boolean;
  created_at: string;
};

export type EvaluationRun = {
  runId: string;
  setName: string;
  score: number;
  results: Array<{
    caseId: string;
    question: string;
    answer: string;
    grounded: boolean;
    containsExpectedHint: boolean;
    score: number;
  }>;
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ? JSON.stringify(data.error) : response.statusText);
  }
  return data as T;
}

export async function uploadPolicy(file: File) {
  const form = new FormData();
  form.append('file', file);
  return parseJson<{ documentId: string; duplicate: boolean; chunks: number }>(
    await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: form
    })
  );
}

export async function listDocuments() {
  return parseJson<{ documents: DocumentRow[] }>(await fetch(`${API_BASE_URL}/api/documents`));
}

export async function askQuestion(question: string) {
  return parseJson<ChatResponse>(
    await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })
  );
}

export async function getCosts() {
  return parseJson<CostTelemetry>(await fetch(`${API_BASE_URL}/api/telemetry/costs`));
}

export async function getPrompts() {
  return parseJson<{ prompts: PromptRow[] }>(await fetch(`${API_BASE_URL}/api/prompts`));
}

export async function runEvaluation() {
  return parseJson<EvaluationRun>(
    await fetch(`${API_BASE_URL}/api/evaluations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setName: 'default-policy-checks' })
    })
  );
}

