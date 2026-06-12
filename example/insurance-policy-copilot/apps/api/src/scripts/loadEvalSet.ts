import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../db.js';

type EvalFile = {
  name: string;
  description: string;
  cases: Array<{
    question: string;
    expectedAnswer: string;
    expectedCitationHint?: string;
  }>;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const evalPath = path.resolve(__dirname, '../../../../evals/default-policy-checks.json');
const data = JSON.parse(await fs.readFile(evalPath, 'utf8')) as EvalFile;

const setResult = await query<{ id: string }>(
  `INSERT INTO evaluation_sets (name, description)
   VALUES ($1, $2)
   ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
   RETURNING id`,
  [data.name, data.description]
);

for (const evalCase of data.cases) {
  await query(
    `INSERT INTO evaluation_cases
      (evaluation_set_id, question, expected_answer, expected_citation_hint)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (evaluation_set_id, question)
     DO UPDATE SET
       expected_answer = EXCLUDED.expected_answer,
       expected_citation_hint = EXCLUDED.expected_citation_hint`,
    [setResult.rows[0].id, evalCase.question, evalCase.expectedAnswer, evalCase.expectedCitationHint ?? null]
  );
}

console.log(`Loaded ${data.cases.length} evaluation cases into ${data.name}.`);
