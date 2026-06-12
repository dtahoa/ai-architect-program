import { config } from './config.js';
import { query, toVectorLiteral } from './db.js';
import { createEmbeddings } from './openaiGateway.js';

export type RetrievedChunk = {
  id: string;
  document_id: string;
  filename: string;
  chunk_index: number;
  page_start: number;
  page_end: number;
  content: string;
  similarity: number;
};

export async function retrieveContext(question: string): Promise<{
  chunks: RetrievedChunk[];
  embeddingTokens: number;
}> {
  const embedded = await createEmbeddings([question]);
  const vector = toVectorLiteral(embedded.embeddings[0]);

  const result = await query<RetrievedChunk>(
    `SELECT
        c.id,
        c.document_id,
        d.filename,
        c.chunk_index,
        c.page_start,
        c.page_end,
        c.content,
        1 - (c.embedding <=> $1::vector) AS similarity
     FROM document_chunks c
     JOIN documents d ON d.id = c.document_id
     WHERE c.embedding IS NOT NULL
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [vector, config.retrieval.topK]
  );

  return {
    chunks: result.rows,
    embeddingTokens: embedded.inputTokens
  };
}

export function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      const citationNumber = index + 1;
      return `[${citationNumber}] ${chunk.filename}, pages ${chunk.page_start}-${chunk.page_end}, chunk ${chunk.chunk_index}
${chunk.content}`;
    })
    .join('\n\n');
}

export function buildCitations(chunks: RetrievedChunk[]) {
  return chunks.map((chunk, index) => ({
    marker: `[${index + 1}]`,
    chunkId: chunk.id,
    documentId: chunk.document_id,
    filename: chunk.filename,
    pageStart: chunk.page_start,
    pageEnd: chunk.page_end,
    similarity: Number(chunk.similarity.toFixed(4)),
    preview: chunk.content.slice(0, 240)
  }));
}

