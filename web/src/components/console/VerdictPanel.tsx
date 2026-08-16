import { AUTO_PROPOSE_THRESHOLD_BPS } from "../../config";
import { Panel } from "../Panel";
import type { Category, Verdict } from "../../types";

interface VerdictPanelProps {
  verdict: Verdict | null;
  category: Category;
  question: string;
  resolving: boolean;
}

export function VerdictPanel({ verdict, category, question, resolving }: VerdictPanelProps) {
  const status = verdict ? "resolved" : resolving ? "running" : "idle";
  const statusTone = verdict ? "done" : resolving ? "pending" : "idle";

  if (!verdict) {
    return (
      <Panel label="02 · Verdict" status={status} statusTone={statusTone} bodyClassName="verdict__empty">
        <p>
          no verdict yet
          <br />
          submit a question to run the resolution pass
        </p>
      </Panel>
    );
  }

  const outcomeClass = verdict.outcome ? "is-yes" : "is-no";
  const confidencePct = verdict.confidenceBps / 100;

  return (
    <Panel label="02 · Verdict" status={status} statusTone={statusTone} resolved>
      <p className="verdict__question">
        <span className="verdict__category">[{category}]</span> {question}
      </p>

      <div className="verdict__headline">
        <p className={`verdict__outcome ${outcomeClass}`}>{verdict.outcome ? "YES" : "NO"}</p>
        <div className="verdict__confidence">
          <p className="verdict__confidence-head">
            <span>Confidence</span>
            <span className="verdict__confidence-value">{confidencePct.toFixed(1)}%</span>
          </p>
          <div className="meter">
            <div className={`meter__fill ${outcomeClass}`} style={{ width: `${confidencePct}%` }} />
          </div>
          <p className="verdict__confidence-note">
            {verdict.confidenceBps} bps · threshold {AUTO_PROPOSE_THRESHOLD_BPS} bps to auto-propose
          </p>
        </div>
      </div>

      <h3 className="eyebrow eyebrow--tight">Justification</h3>
      <p className="verdict__justification">{verdict.justification}</p>

      <h3 className="eyebrow eyebrow--tight">
        Evidence considered · {verdict.evidence.length} sources
      </h3>
      <ul className="evidence-list">
        {verdict.evidence.map((item) => (
          <li key={item.source} className="evidence-card">
            <p className="evidence-card__head">
              <span className="evidence-card__source">{item.source}</span>
              <span className="evidence-card__hash">{item.hash}</span>
            </p>
            <p className="evidence-card__content">{item.content}</p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
