import { config } from './config.js';

export type UsageInput = {
  operation: 'embedding' | 'chat';
  inputTokens: number;
  outputTokens?: number;
};

export function estimateCostUsd(usage: UsageInput): number {
  if (usage.operation === 'embedding') {
    if (config.embeddingProvider === 'local') {
      return 0;
    }

    return (usage.inputTokens / 1_000_000) * config.prices.embeddingPer1M;
  }

  return (
    (usage.inputTokens / 1_000_000) * config.prices.chatInputPer1M +
    ((usage.outputTokens ?? 0) / 1_000_000) * config.prices.chatOutputPer1M
  );
}

