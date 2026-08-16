import type { Category, Verdict } from "../types";

export function VerdictCard({
  category,
  question,
  verdict,
  onContinue,
}: {
  category: Category;
  question: string;
  verdict: Verdict;
  onContinue: () => void;
}) {
  const confidencePct = (verdict.confidenceBps / 100).toFixed(1);

  return (
    <div className="card">
      <h2>Verdikt's resolution</h2>
      <p className="question-echo">
        <span className="badge">{category}</span> {question}
      </p>

      <div className={`outcome-pill ${verdict.outcome ? "yes" : "no"}`}>
        {verdict.outcome ? "YES" : "NO"} · {confidencePct}% confidence
      </div>

      <p className="justification">{verdict.justification}</p>

      <h3>Evidence considered</h3>
      <ul className="evidence-list">
        {verdict.evidence.map((item, i) => (
          <li key={i}>
            <strong>{item.source}</strong>: {item.content}
          </li>
        ))}
      </ul>

      <p className="note">
        On a real deployment, this verdict is proposed on-chain via{" "}
        <code>VerdiktOracle.proposeResolution</code>, held open for a dispute
        window, then finalized — see the demo continuation below.
      </p>

      <button className="primary" onClick={onContinue}>
        Continue to demo market →
      </button>
    </div>
  );
}
