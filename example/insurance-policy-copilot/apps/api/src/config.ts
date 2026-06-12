import 'dotenv/config';

function numberFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  apiPort: numberFromEnv('API_PORT', 8080),
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://copilot:copilot@localhost:5432/insurance_copilot',
  openaiApiKey: process.env.OPENAI_API_KEY,
  chatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4.1-mini',
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
  embeddingDimensions: numberFromEnv('OPENAI_EMBEDDING_DIMENSIONS', 1536),
  embedding: {
    batchSize: numberFromEnv('EMBEDDING_BATCH_SIZE', 8),
    maxTokensPerBatch: numberFromEnv('EMBEDDING_MAX_TOKENS_PER_BATCH', 8000),
    minDelayMs: numberFromEnv('EMBEDDING_MIN_DELAY_MS', 750),
    maxRetries: numberFromEnv('EMBEDDING_MAX_RETRIES', 4)
  },
  prices: {
    chatInputPer1M: numberFromEnv('CHAT_INPUT_PRICE_PER_1M', 0.4),
    chatOutputPer1M: numberFromEnv('CHAT_OUTPUT_PRICE_PER_1M', 1.6),
    embeddingPer1M: numberFromEnv('EMBEDDING_PRICE_PER_1M', 0.02)
  },
  retrieval: {
    topK: numberFromEnv('RETRIEVAL_TOP_K', 6),
    chunkTokenTarget: numberFromEnv('CHUNK_TOKEN_TARGET', 650),
    chunkTokenOverlap: numberFromEnv('CHUNK_TOKEN_OVERLAP', 90)
  }
};

