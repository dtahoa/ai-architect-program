import { config } from './config.js';
import { estimateCostUsd } from './cost.js';
import { chunkText } from './chunking.js';
import { query, toVectorLiteral } from './db.js';
import { sha256 } from './hash.js';
import { createEmbeddings } from './openaiGateway.js';
import { parsePdf } from './pdf.js';

export async function ingestPdf(input: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const digest = sha256(input.buffer);
  const existing = await query<{ id: string }>('SELECT id FROM documents WHERE sha256 = $1', [digest]);

  if (existing.rows[0]) {
    return {
      documentId: existing.rows[0].id,
      duplicate: true,
      chunks: 0
    };
  }

  const parsed = await parsePdf(input.buffer);
  const chunks = chunkText(parsed.text, parsed.pageCount);

  if (chunks.length === 0) {
    throw new Error('No extractable text found in this PDF. Add OCR support before uploading scanned policies.');
  }

  const docResult = await query<{ id: string }>(
    `INSERT INTO documents (filename, mime_type, sha256, page_count, status)
     VALUES ($1, $2, $3, $4, 'processing')
     RETURNING id`,
    [input.filename, input.mimeType, digest, parsed.pageCount]
  );

  const documentId = docResult.rows[0].id;

  try {
    const embeddings = await createEmbeddings(chunks.map((chunk) => chunk.content));

    for (const chunk of chunks) {
      await query(
        `INSERT INTO document_chunks
          (document_id, chunk_index, page_start, page_end, content, token_estimate, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7::vector)`,
        [
          documentId,
          chunk.index,
          chunk.pageStart,
          chunk.pageEnd,
          chunk.content,
          chunk.tokenEstimate,
          toVectorLiteral(embeddings.embeddings[chunk.index])
        ]
      );
    }

    const cost = estimateCostUsd({ operation: 'embedding', inputTokens: embeddings.inputTokens });
    await query(
      `INSERT INTO llm_usage (operation, model, input_tokens, total_tokens, estimated_cost_usd)
       VALUES ('embedding', $1, $2, $2, $3)`,
      [config.embeddingModel, embeddings.inputTokens, cost]
    );

    await query(`UPDATE documents SET status = 'ready' WHERE id = $1`, [documentId]);

    return {
      documentId,
      duplicate: false,
      chunks: chunks.length
    };
  } catch (error) {
    await query(`UPDATE documents SET status = 'failed' WHERE id = $1`, [documentId]);
    throw error;
  }
}
