import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  MessageSquareText,
  Upload,
  WalletCards
} from 'lucide-react';
import {
  askQuestion,
  Citation,
  CostTelemetry,
  DocumentRow,
  EvaluationRun,
  getCosts,
  getPrompts,
  listDocuments,
  PromptRow,
  runEvaluation,
  uploadPolicy
} from './api';

type Tab = 'chat' | 'telemetry' | 'evaluation';

function formatCurrency(value: number | string | undefined) {
  return `$${Number(value ?? 0).toFixed(6)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function App() {
  const [tab, setTab] = useState<Tab>('chat');
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [costs, setCosts] = useState<CostTelemetry | null>(null);
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [question, setQuestion] = useState('Does this policy cover flood damage?');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [usage, setUsage] = useState<Record<string, number | string> | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationRun | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function refresh() {
    const [docs, telemetry, promptData] = await Promise.all([listDocuments(), getCosts(), getPrompts()]);
    setDocuments(docs.documents);
    setCosts(telemetry);
    setPrompts(promptData.prompts);
  }

  useEffect(() => {
    refresh().catch((err) => setError(err.message));
  }, []);

  const readyDocuments = useMemo(() => documents.filter((doc) => doc.status === 'ready'), [documents]);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setBusy('upload');
    setError('');
    try {
      await uploadPolicy(file);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(null);
    }
  }

  async function onAsk() {
    setBusy('ask');
    setError('');
    try {
      const response = await askQuestion(question);
      setAnswer(response.answer);
      setCitations(response.citations);
      setUsage(response.usage);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Question failed.');
    } finally {
      setBusy(null);
    }
  }

  async function onEvaluate() {
    setBusy('eval');
    setError('');
    try {
      const response = await runEvaluation();
      setEvaluation(response);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">
            <Bot size={24} />
          </div>
          <div>
            <h1>Insurance Policy Copilot</h1>
            <p>RAG with citations, costs, prompts, and evals</p>
          </div>
        </div>

        <label className="uploadBox">
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
          {busy === 'upload' ? <Loader2 className="spin" size={20} /> : <Upload size={20} />}
          <span>Upload policy PDF</span>
        </label>

        <section className="panel">
          <div className="panelTitle">
            <FileText size={18} />
            <span>Policies</span>
          </div>
          <div className="docList">
            {documents.length === 0 ? (
              <p className="muted">No policies uploaded.</p>
            ) : (
              documents.map((doc) => (
                <div className="docRow" key={doc.id}>
                  <div>
                    <strong>{doc.filename}</strong>
                    <span>{doc.page_count} pages · {doc.chunks} chunks</span>
                  </div>
                  <mark className={doc.status}>{doc.status}</mark>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel metrics">
          <div>
            <span className="metricLabel">Total cost</span>
            <strong>{formatCurrency(costs?.totals.total_cost_usd)}</strong>
          </div>
          <div>
            <span className="metricLabel">Tokens</span>
            <strong>{costs?.totals.total_tokens ?? 0}</strong>
          </div>
        </section>
      </aside>

      <section className="workspace">
        <nav className="tabs" aria-label="Workspace tabs">
          <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}>
            <MessageSquareText size={18} />
            Chat
          </button>
          <button className={tab === 'telemetry' ? 'active' : ''} onClick={() => setTab('telemetry')}>
            <BarChart3 size={18} />
            Telemetry
          </button>
          <button className={tab === 'evaluation' ? 'active' : ''} onClick={() => setTab('evaluation')}>
            <ClipboardList size={18} />
            Evaluation
          </button>
        </nav>

        {error && <div className="error">{error}</div>}

        {tab === 'chat' && (
          <div className="grid two">
            <section className="panel mainPanel">
              <div className="panelTitle">
                <MessageSquareText size={18} />
                <span>Policy Question</span>
              </div>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about coverage, exclusions, limits, conditions, or claim deadlines."
              />
              <button className="primary" onClick={onAsk} disabled={busy === 'ask' || readyDocuments.length === 0}>
                {busy === 'ask' ? <Loader2 className="spin" size={18} /> : <Bot size={18} />}
                Ask Copilot
              </button>
              {readyDocuments.length === 0 && (
                <p className="muted">Upload at least one ready policy before asking.</p>
              )}
            </section>

            <section className="panel mainPanel">
              <div className="panelTitle">
                <CheckCircle2 size={18} />
                <span>Grounded Answer</span>
              </div>
              <div className="answer">{answer || 'The answer will appear here with citation markers.'}</div>
              {usage && (
                <div className="usageStrip">
                  <span>{usage.latencyMs} ms</span>
                  <span>{usage.inputTokens} in</span>
                  <span>{usage.outputTokens} out</span>
                  <span>{formatCurrency(String(usage.estimatedCostUsd))}</span>
                </div>
              )}
            </section>

            <section className="panel wide">
              <div className="panelTitle">
                <FileText size={18} />
                <span>Citations</span>
              </div>
              <div className="citationGrid">
                {citations.length === 0 ? (
                  <p className="muted">Retrieved policy chunks will be listed here.</p>
                ) : (
                  citations.map((citation) => (
                    <article className="citation" key={citation.chunkId}>
                      <div>
                        <strong>{citation.marker} {citation.filename}</strong>
                        <span>Pages {citation.pageStart}-{citation.pageEnd} · similarity {citation.similarity}</span>
                      </div>
                      <p>{citation.preview}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {tab === 'telemetry' && (
          <div className="grid two">
            <section className="panel mainPanel">
              <div className="panelTitle">
                <WalletCards size={18} />
                <span>Cost by Operation</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th>Calls</th>
                    <th>Tokens</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(costs?.byOperation ?? []).map((row) => (
                    <tr key={row.operation}>
                      <td>{row.operation}</td>
                      <td>{row.calls}</td>
                      <td>{row.total_tokens}</td>
                      <td>{formatCurrency(row.estimated_cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="panel mainPanel">
              <div className="panelTitle">
                <Activity size={18} />
                <span>Prompt Templates</span>
              </div>
              <div className="docList">
                {prompts.map((prompt) => (
                  <div className="docRow" key={prompt.id}>
                    <div>
                      <strong>{prompt.name}</strong>
                      <span>Version {prompt.version} · {formatDate(prompt.created_at)}</span>
                    </div>
                    <mark className={prompt.is_active ? 'ready' : 'processing'}>
                      {prompt.is_active ? 'active' : 'inactive'}
                    </mark>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel wide">
              <div className="panelTitle">
                <ClipboardList size={18} />
                <span>Recent Prompt Runs</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Question</th>
                    <th>Model</th>
                    <th>Latency</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(costs?.recentRuns ?? []).map((run) => (
                    <tr key={run.id}>
                      <td>{run.request_type}</td>
                      <td>{run.question ?? '-'}</td>
                      <td>{run.model}</td>
                      <td>{run.latency_ms} ms</td>
                      <td>{formatDate(run.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {tab === 'evaluation' && (
          <div className="grid two">
            <section className="panel mainPanel">
              <div className="panelTitle">
                <ClipboardList size={18} />
                <span>Default Evaluation</span>
              </div>
              <p className="bodyText">
                Runs coverage, exclusion, and claim-deadline checks against the uploaded policy corpus.
              </p>
              <button className="primary" onClick={onEvaluate} disabled={busy === 'eval' || readyDocuments.length === 0}>
                {busy === 'eval' ? <Loader2 className="spin" size={18} /> : <ClipboardList size={18} />}
                Run Evaluation
              </button>
            </section>

            <section className="panel mainPanel">
              <div className="panelTitle">
                <BarChart3 size={18} />
                <span>Score</span>
              </div>
              <div className="score">{evaluation ? `${Math.round(evaluation.score * 100)}%` : '-'}</div>
              <p className="muted">Grounding and expected-clause hint checks.</p>
            </section>

            <section className="panel wide">
              <div className="panelTitle">
                <CheckCircle2 size={18} />
                <span>Evaluation Results</span>
              </div>
              <div className="citationGrid">
                {evaluation?.results.map((result) => (
                  <article className="citation" key={result.caseId}>
                    <div>
                      <strong>{result.question}</strong>
                      <span>Score {Math.round(result.score * 100)}% · grounded {String(result.grounded)}</span>
                    </div>
                    <p>{result.answer}</p>
                  </article>
                )) ?? <p className="muted">Run an evaluation to inspect quality gates.</p>}
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

