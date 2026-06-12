import OpenAI from 'openai';
import { config } from './config.js';

if (!config.openaiApiKey) {
  console.warn('OPENAI_API_KEY is not set. API calls that require OpenAI will fail until configured.');
}

const client = new OpenAI({
  apiKey: config.openaiApiKey ?? 'missing-key'
});

export type EmbeddingResult = {
  embeddings: number[][];
  inputTokens: number;
};

type EmbeddingBatch = {
  input: string[];
  startIndex: number;
};

function estimateEmbeddingTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(error: unknown, attempt: number): number {
  const headers = (error as { headers?: Record<string, string> })?.headers;
  const retryAfter = headers?.['retry-after'] ?? headers?.['Retry-After'];
  const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : NaN;

  if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
    return retryAfterMs;
  }

  return Math.min(30_000, 1000 * 2 ** attempt);
}

function isRetryableOpenAIError(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  const code = (error as { code?: string; error?: { code?: string } })?.code
    ?? (error as { error?: { code?: string } })?.error?.code;

  return status === 429 && code !== 'insufficient_quota';
}

function createEmbeddingBatches(input: string[]): EmbeddingBatch[] {
  const batches: EmbeddingBatch[] = [];
  let current: string[] = [];
  let currentTokens = 0;
  let startIndex = 0;

  for (const item of input) {
    const itemTokens = estimateEmbeddingTokens(item);
    const wouldExceedSize = current.length >= config.embedding.batchSize;
    const wouldExceedTokens =
      current.length > 0 && currentTokens + itemTokens > config.embedding.maxTokensPerBatch;

    if (wouldExceedSize || wouldExceedTokens) {
      batches.push({ input: current, startIndex });
      startIndex += current.length;
      current = [];
      currentTokens = 0;
    }

    current.push(item);
    currentTokens += itemTokens;
  }

  if (current.length > 0) {
    batches.push({ input: current, startIndex });
  }

  return batches;
}

async function createEmbeddingBatch(input: string[], attempt = 0) {
  try {
    return await client.embeddings.create({
      model: config.embeddingModel,
      input,
      dimensions: config.embeddingDimensions
    });
  } catch (error) {
    if (attempt < config.embedding.maxRetries && isRetryableOpenAIError(error)) {
      await sleep(getRetryDelayMs(error, attempt));
      return createEmbeddingBatch(input, attempt + 1);
    }

    throw error;
  }
}

export async function createEmbeddings(input: string[]): Promise<EmbeddingResult> {
  const batches = createEmbeddingBatches(input);
  const embeddings: number[][] = new Array(input.length);
  let inputTokens = 0;

  for (const [batchIndex, batch] of batches.entries()) {
    if (batchIndex > 0 && config.embedding.minDelayMs > 0) {
      await sleep(config.embedding.minDelayMs);
    }

    const response = await createEmbeddingBatch(batch.input);

    for (const item of response.data) {
      embeddings[batch.startIndex + item.index] = item.embedding;
    }

    inputTokens += response.usage?.prompt_tokens
      ?? batch.input.reduce((sum, value) => sum + estimateEmbeddingTokens(value), 0);
  }

  return { embeddings, inputTokens };
}

export type ChatResult = {
  answer: string;
  inputTokens: number;
  outputTokens: number;
};

export async function generateAnswer(systemPrompt: string, userPrompt: string): Promise<ChatResult> {
  const response = await client.chat.completions.create({
    model: config.chatModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1
  });

  const usage = response.usage;
  const answer = response.choices[0]?.message.content ?? '';

  return {
    answer,
    inputTokens: usage?.prompt_tokens ?? Math.ceil((systemPrompt.length + userPrompt.length) / 4),
    outputTokens: usage?.completion_tokens ?? Math.ceil(answer.length / 4)
  };
}
