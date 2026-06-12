import { config } from './config.js';

export type Chunk = {
  index: number;
  content: string;
  pageStart: number;
  pageEnd: number;
  tokenEstimate: number;
};

export function estimateTokens(text: string): number {
  return Math.ceil(text.trim().split(/\s+/).filter(Boolean).length * 1.35);
}

export function chunkText(text: string, pageCount: number): Chunk[] {
  const normalized = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/);
  const tokensPerWord = 1.35;
  const wordsPerChunk = Math.max(120, Math.floor(config.retrieval.chunkTokenTarget / tokensPerWord));
  const overlapWords = Math.max(20, Math.floor(config.retrieval.chunkTokenOverlap / tokensPerWord));
  const chunks: Chunk[] = [];
  const totalWords = words.length;

  for (let start = 0; start < totalWords; start += wordsPerChunk - overlapWords) {
    const end = Math.min(start + wordsPerChunk, totalWords);
    const content = words.slice(start, end).join(' ');
    const pageStart = Math.max(1, Math.floor((start / totalWords) * Math.max(pageCount, 1)) + 1);
    const pageEnd = Math.max(pageStart, Math.ceil((end / totalWords) * Math.max(pageCount, 1)));

    chunks.push({
      index: chunks.length,
      content,
      pageStart,
      pageEnd,
      tokenEstimate: estimateTokens(content)
    });

    if (end === totalWords) break;
  }

  return chunks;
}

