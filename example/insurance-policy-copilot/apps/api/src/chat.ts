import { config } from './config.js';
import { estimateCostUsd } from './cost.js';
import { query } from './db.js';
import { generateAnswer } from './openaiGateway.js';
import { getActivePromptTemplate, renderTemplate } from './prompts.js';
import { buildCitations, buildContext, retrieveContext } from './retrieval.js';

export async function answerQuestion(question: string) {
  const started = Date.now();
  const { chunks, embeddingTokens } = await retrieveContext(question);
  const context = buildContext(chunks);
  const citations = buildCitations(chunks);
  const template = await getActivePromptTemplate();
  const systemPrompt = renderTemplate(template.system_prompt, {});
  const userPrompt = renderTemplate(template.user_prompt, {
    question,
    context
  });

  const chat = await generateAnswer(systemPrompt, userPrompt);
  const latencyMs = Date.now() - started;

  const promptRun = await query<{ id: string }>(
    `INSERT INTO prompt_runs
      (prompt_template_id, request_type, question, rendered_system_prompt, rendered_user_prompt, model, latency_ms)
     VALUES ($1, 'rag_answer', $2, $3, $4, $5, $6)
     RETURNING id`,
    [template.id, question, systemPrompt, userPrompt, config.chatModel, latencyMs]
  );

  const promptRunId = promptRun.rows[0].id;
  const embeddingCost = estimateCostUsd({ operation: 'embedding', inputTokens: embeddingTokens });
  const chatCost = estimateCostUsd({
    operation: 'chat',
    inputTokens: chat.inputTokens,
    outputTokens: chat.outputTokens
  });

  await query(
    `INSERT INTO llm_usage
      (prompt_run_id, operation, model, input_tokens, output_tokens, total_tokens, estimated_cost_usd)
     VALUES
      ($1, 'embedding', $2, $3, 0, $3, $4),
      ($1, 'chat', $5, $6, $7, $8, $9)`,
    [
      promptRunId,
      config.embeddingModel,
      embeddingTokens,
      embeddingCost,
      config.chatModel,
      chat.inputTokens,
      chat.outputTokens,
      chat.inputTokens + chat.outputTokens,
      chatCost
    ]
  );

  await query(
    `INSERT INTO chat_messages (prompt_run_id, question, answer, citations)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [promptRunId, question, chat.answer, JSON.stringify(citations)]
  );

  return {
    answer: chat.answer,
    citations,
    usage: {
      promptRunId,
      latencyMs,
      embeddingTokens,
      inputTokens: chat.inputTokens,
      outputTokens: chat.outputTokens,
      estimatedCostUsd: Number((embeddingCost + chatCost).toFixed(6))
    }
  };
}

