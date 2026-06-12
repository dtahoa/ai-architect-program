import { config } from './config.js';
import { answerQuestion } from './chat.js';
import { query } from './db.js';

type EvalCase = {
  id: string;
  question: string;
  expected_answer: string;
  expected_citation_hint: string | null;
};

export async function runEvaluation(setName = 'default-policy-checks') {
  const setResult = await query<{ id: string }>('SELECT id FROM evaluation_sets WHERE name = $1', [setName]);
  const set = setResult.rows[0];
  if (!set) {
    throw new Error(`Evaluation set not found: ${setName}`);
  }

  const caseResult = await query<EvalCase>(
    `SELECT id, question, expected_answer, expected_citation_hint
     FROM evaluation_cases
     WHERE evaluation_set_id = $1
     ORDER BY created_at ASC`,
    [set.id]
  );

  const runResult = await query<{ id: string }>(
    `INSERT INTO evaluation_runs (evaluation_set_id, model)
     VALUES ($1, $2)
     RETURNING id`,
    [set.id, config.chatModel]
  );

  const runId = runResult.rows[0].id;
  const results = [];

  for (const evalCase of caseResult.rows) {
    const rag = await answerQuestion(evalCase.question);
    const answerLower = rag.answer.toLowerCase();
    const citationText = rag.citations.map((citation) => citation.preview).join(' ').toLowerCase();
    const grounded = rag.citations.length > 0 && /\[\d+\]/.test(rag.answer);
    const expectedHint = evalCase.expected_citation_hint?.toLowerCase();
    const containsExpectedHint = expectedHint
      ? answerLower.includes(expectedHint) || citationText.includes(expectedHint)
      : true;
    const score = (Number(grounded) + Number(containsExpectedHint)) / 2;

    await query(
      `INSERT INTO evaluation_results
        (evaluation_run_id, evaluation_case_id, answer, citations, grounded, contains_expected_hint, score)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
      [runId, evalCase.id, rag.answer, JSON.stringify(rag.citations), grounded, containsExpectedHint, score]
    );

    results.push({
      caseId: evalCase.id,
      question: evalCase.question,
      answer: rag.answer,
      grounded,
      containsExpectedHint,
      score
    });
  }

  const average = results.length
    ? results.reduce((sum, result) => sum + result.score, 0) / results.length
    : 0;

  await query('UPDATE evaluation_runs SET score = $1 WHERE id = $2', [average, runId]);

  return {
    runId,
    setName,
    score: Number(average.toFixed(2)),
    results
  };
}

