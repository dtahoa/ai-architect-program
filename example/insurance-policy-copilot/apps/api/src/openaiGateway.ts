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

export async function createEmbeddings(input: string[]): Promise<EmbeddingResult> {
  const response = await client.embeddings.create({
    model: config.embeddingModel,
    input,
    dimensions: config.embeddingDimensions
  });

  return {
    embeddings: response.data.map((item) => item.embedding),
    inputTokens: response.usage?.prompt_tokens ?? input.reduce((sum, value) => sum + Math.ceil(value.length / 4), 0)
  };
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
