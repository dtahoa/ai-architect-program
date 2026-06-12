import OpenAI from 'openai';
import { config } from './config.js';

if (!config.openaiApiKey) {
  console.warn('OPENAI_API_KEY is not set. Hosted OpenAI embedding calls will fail until configured.');
}

if (config.chatProvider === 'groq' && !config.groqApiKey) {
  console.warn('GROQ_API_KEY is not set. Groq chat completion calls will fail until configured.');
}

const hostedEmbeddingClient = new OpenAI({
  apiKey: config.openaiApiKey ?? 'missing-key'
});

const chatClient = new OpenAI({
  apiKey: config.chatProvider === 'groq'
    ? config.groqApiKey ?? 'missing-key'
    : config.openaiApiKey ?? 'missing-key',
  baseURL: config.chatProvider === 'groq' ? config.chatBaseUrl : undefined
});

type FeatureExtractionPipeline = (
  input: string | string[],
  options: { pooling: 'mean'; normalize: boolean }
) => Promise<{ data: Float32Array | number[]; dims: number[]; tolist?: () => number[] | number[][] }>;

let localExtractorPromise: Promise<FeatureExtractionPipeline> | undefined;

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

function resolveLocalEmbeddingModel(model: string): string {
  if (model === 'BAAI/bge-small-en-v1.5') {
    return 'Xenova/bge-small-en-v1.5';
  }

  return model;
}

async function getLocalExtractor(): Promise<FeatureExtractionPipeline> {
  if (!localExtractorPromise) {
    localExtractorPromise = import('@xenova/transformers').then(async ({ pipeline, env }) => {
      env.allowLocalModels = false;
      return pipeline(
        'feature-extraction',
        resolveLocalEmbeddingModel(config.embeddingModel)
      ) as Promise<FeatureExtractionPipeline>;
    });
  }

  return localExtractorPromise;
}

function normalizeLocalEmbeddingOutput(output: {
  data: Float32Array | number[];
  dims: number[];
  tolist?: () => number[] | number[][];
}): number[][] {
  const listed = output.tolist?.();

  if (Array.isArray(listed) && Array.isArray(listed[0])) {
    return listed as number[][];
  }

  if (Array.isArray(listed)) {
    return [listed as number[]];
  }

  const [rows, dimensions] = output.dims.length === 2
    ? output.dims
    : [1, output.dims[output.dims.length - 1] ?? config.embeddingDimensions];
  const data = Array.from(output.data);
  const embeddings: number[][] = [];

  for (let row = 0; row < rows; row += 1) {
    embeddings.push(data.slice(row * dimensions, (row + 1) * dimensions));
  }

  return embeddings;
}

async function createLocalEmbeddingBatch(input: string[]): Promise<number[][]> {
  const extractor = await getLocalExtractor();
  const output = await extractor(input, { pooling: 'mean', normalize: true });
  return normalizeLocalEmbeddingOutput(output);
}

async function createEmbeddingBatch(input: string[], attempt = 0) {
  try {
    return await hostedEmbeddingClient.embeddings.create({
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

    if (config.embeddingProvider === 'local') {
      const batchEmbeddings = await createLocalEmbeddingBatch(batch.input);

      for (const [index, embedding] of batchEmbeddings.entries()) {
        embeddings[batch.startIndex + index] = embedding;
      }

      inputTokens += batch.input.reduce((sum, value) => sum + estimateEmbeddingTokens(value), 0);
      continue;
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
  const response = await chatClient.chat.completions.create({
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
