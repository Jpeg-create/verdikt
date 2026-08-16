import { Icon, type IconName } from "../Icon";

const GUARANTEES: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: "file-check",
    title: "Evidence before opinion",
    detail:
      "Every resolution ships the sources it read. They are hashed and committed with the proposal, so the inputs stay auditable after the fact.",
  },
  {
    icon: "gauge",
    title: "Confidence, not a bare boolean",
    detail:
      "A basis-point score travels with the outcome. Below the threshold the verdict is held rather than proposed.",
  },
  {
    icon: "timer",
    title: "Dispute-windowed finality",
    detail:
      "A proposal sits open for the window before finalize() writes it. The AI never lands a verdict unchallenged.",
  },
  {
    icon: "flask",
    title: "Runs without credentials",
    detail:
      "Mock mode resolves against canned evidence, so the whole loop is testable with no funded wallet and no API key.",
  },
];

export function Guarantees() {
  return (
    <section id="guarantees" className="section section--top-rule">
      <p className="eyebrow">What the oracle guarantees</p>
      <h2 className="section__title">A verdict a market can settle on</h2>

      <ul className="card-grid card-grid--wide">
        {GUARANTEES.map((guarantee) => (
          <li key={guarantee.title} className="feature-card">
            <span className="icon-badge icon-badge--framed">
              <Icon name={guarantee.icon} />
            </span>
            <h3 className="feature-card__title">{guarantee.title}</h3>
            <p className="feature-card__detail">{guarantee.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
