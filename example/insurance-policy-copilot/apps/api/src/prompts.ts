import { query } from './db.js';

export type PromptTemplate = {
  id: string;
  name: string;
  version: number;
  system_prompt: string;
  user_prompt: string;
};

export async function getActivePromptTemplate(name = 'insurance_policy_rag'): Promise<PromptTemplate> {
  const result = await query<PromptTemplate>(
    `SELECT id, name, version, system_prompt, user_prompt
     FROM prompt_templates
     WHERE name = $1 AND is_active = true
     ORDER BY version DESC
     LIMIT 1`,
    [name]
  );

  if (!result.rows[0]) {
    throw new Error(`No active prompt template found for ${name}`);
  }

  return result.rows[0];
}

export function renderTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '');
}

