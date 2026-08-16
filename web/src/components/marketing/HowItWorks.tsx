import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon";

const STEPS: { step: string; title: string; icon: IconName; detail: ReactNode }[] = [
  {
    step: "01",
    title: "Question submitted",
    icon: "message",
    detail: "A market question and its resolution criteria enter the engine.",
  },
  {
    step: "02",
    title: "Evidence gathered",
    icon: "globe",
    detail: "Multiple independent sources are fetched and snapshotted.",
  },
  {
    step: "03",
    title: "AI resolution pass",
    icon: "cpu",
    detail: "Outcome, confidence score and justification — not a bare boolean.",
  },
  {
    step: "04",
    title: "Proposed on-chain",
    icon: "box",
    detail: (
      <>
        <code>proposeResolution</code> writes the verdict and opens a dispute window.
      </>
    ),
  },
  {
    step: "05",
    title: "Finalized & consumed",
    icon: "coin",
    detail: (
      <>
        <code>finalize()</code> settles the market and pays the winning pool.
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section section--bordered">
      <h2 className="eyebrow">How it works</h2>
      <ol className="step-grid">
        {STEPS.map((step) => (
          <li key={step.step} className="step-card">
            <span className="step-card__index">{step.step}</span>
            <h3 className="step-card__title">{step.title}</h3>
            <p className="step-card__detail">
              <span className="icon-badge">
                <Icon name={step.icon} />
              </span>
              <span>{step.detail}</span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
