import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { answerQuestion } from './chat.js';
import { query } from './db.js';
import { runEvaluation } from './evaluation.js';
import { ingestPdf } from './ingestion.js';

const askSchema = z.object({
  question: z.string().min(3).max(2000)
});

const evalSchema = z.object({
  setName: z.string().default('default-policy-checks')
});

export async function registerRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true }));

  app.get('/api/documents', async () => {
    const result = await query(
      `SELECT d.id, d.filename, d.page_count, d.status, d.created_at, COUNT(c.id)::int AS chunks
       FROM documents d
       LEFT JOIN document_chunks c ON c.document_id = d.id
       GROUP BY d.id
       ORDER BY d.created_at DESC`
    );

    return { documents: result.rows };
  });

  app.post('/api/documents/upload', async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.code(400).send({ error: 'Missing PDF file.' });
    }

    if (file.mimetype !== 'application/pdf') {
      return reply.code(415).send({ error: 'Only PDF uploads are supported.' });
    }

    const buffer = await file.toBuffer();
    const result = await ingestPdf({
      filename: file.filename,
      mimeType: file.mimetype,
      buffer
    });

    return result;
  });

  app.post('/api/chat', async (request, reply) => {
    const parsed = askSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    return answerQuestion(parsed.data.question);
  });

  app.get('/api/prompts', async () => {
    const result = await query(
      `SELECT id, name, version, is_active, created_at
       FROM prompt_templates
       ORDER BY name, version DESC`
    );
    return { prompts: result.rows };
  });

  app.get('/api/telemetry/costs', async () => {
    const totals = await query(
      `SELECT
        COALESCE(SUM(estimated_cost_usd), 0)::float AS total_cost_usd,
        COALESCE(SUM(input_tokens), 0)::int AS input_tokens,
        COALESCE(SUM(output_tokens), 0)::int AS output_tokens,
        COALESCE(SUM(total_tokens), 0)::int AS total_tokens
       FROM llm_usage`
    );

    const byOperation = await query(
      `SELECT operation,
        COUNT(*)::int AS calls,
        COALESCE(SUM(total_tokens), 0)::int AS total_tokens,
        COALESCE(SUM(estimated_cost_usd), 0)::float AS estimated_cost_usd
       FROM llm_usage
       GROUP BY operation
       ORDER BY operation`
    );

    const recentRuns = await query(
      `SELECT id, request_type, question, model, latency_ms, created_at
       FROM prompt_runs
       ORDER BY created_at DESC
       LIMIT 20`
    );

    return {
      totals: totals.rows[0],
      byOperation: byOperation.rows,
      recentRuns: recentRuns.rows
    };
  });

  app.post('/api/evaluations/run', async (request, reply) => {
    const parsed = evalSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }

    return runEvaluation(parsed.data.setName);
  });

  app.get('/api/evaluations/runs/:id', async (request) => {
    const params = request.params as { id: string };
    const run = await query('SELECT * FROM evaluation_runs WHERE id = $1', [params.id]);
    const results = await query(
      `SELECT er.*, ec.question, ec.expected_answer, ec.expected_citation_hint
       FROM evaluation_results er
       JOIN evaluation_cases ec ON ec.id = er.evaluation_case_id
       WHERE er.evaluation_run_id = $1
       ORDER BY er.created_at ASC`,
      [params.id]
    );

    return {
      run: run.rows[0] ?? null,
      results: results.rows
    };
  });
}

