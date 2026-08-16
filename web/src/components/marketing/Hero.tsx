import Image from "next/image";
import { Icon, type IconName } from "../Icon";

const HIGHLIGHTS: { icon: IconName; title: string; detail: string }[] = [
  {
    icon: "shield-check",
    title: "Evidence-backed",
    detail: "Multiple independent sources",
  },
  {
    icon: "link",
    title: "On-chain verifiable",
    detail: "Proposed, disputed, finalized",
  },
];

const EVIDENCE_SOURCES: { icon: IconName; label: string }[] = [
  { icon: "globe", label: "Official sites" },
  { icon: "newspaper", label: "News outlets" },
  { icon: "code", label: "APIs" },
  { icon: "chain", label: "On-chain data" },
  { icon: "users", label: "Community signals" },
];

const ON_CHAIN_FLOW = [
  { label: "Propose Resolution", settled: false },
  { label: "Dispute Window", settled: false },
  { label: "Finalize", settled: false },
  { label: "Settle & Payout", settled: true },
];

export function Hero() {
  return (
    <section className="hero">
      <div className="hero__copy">
        <h1 className="hero__headline">
          An AI oracle that renders{" "}
          <span className="hero__accent">
            verifiable verdicts
            <span className="hero__seal" aria-hidden="true">
              <Icon name="check" />
            </span>
          </span>{" "}
          for on-chain outcome markets.
        </h1>

        <p className="hero__eyebrow">
          <span>Designated third-party oracle provider · X Layer Exchange OS</span>
          <span className="hero__rule" aria-hidden="true" />
        </p>

        <p className="hero__lede">
          Verdikt turns a plain-language market question into an evidence-backed resolution —
          outcome, confidence score and written justification — then proposes it on-chain through a
          dispute-windowed finalize. Built as a designated third-party oracle provider for X Layer's
          Exchange OS outcome markets.
        </p>

        <ul className="hero__highlights">
          {HIGHLIGHTS.map((highlight) => (
            <li key={highlight.title}>
              <span className="icon-badge">
                <Icon name={highlight.icon} />
              </span>
              <span>
                <span className="hero__highlight-title">{highlight.title}</span>
                <span className="hero__highlight-detail">{highlight.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hero__figure">
        <Image
          className="oracle-render"
          src="/oracle-render.png"
          alt="A verified verdict sealed in a cube, fed by independent evidence sources"
          width={1536}
          height={1024}
          sizes="(max-width: 900px) 90vw, 40vw"
          priority
        />

        <div className="float-card float-card--engine">
          <p className="float-card__title float-card__title--centered">AI resolution engine</p>
          <dl className="float-card__rows">
            <div>
              <dt>Outcome</dt>
              <dd className="is-positive">WIN</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd className="is-positive">92%</dd>
            </div>
            <div>
              <dt>Justification</dt>
              <dd className="is-accent">View</dd>
            </div>
          </dl>
          <span className="float-card__stem" aria-hidden="true" />
        </div>

        <div className="float-card float-card--evidence">
          <p className="float-card__title">Evidence sources</p>
          <ul className="float-card__list">
            {EVIDENCE_SOURCES.map((source) => (
              <li key={source.label}>
                <span className="float-card__icon">
                  <Icon name={source.icon} />
                </span>
                {source.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="float-card float-card--flow">
          <span className="float-card__feed" aria-hidden="true" />
          <p className="float-card__title float-card__title--centered">On-chain flow</p>
          <ul className="float-card__list">
            {ON_CHAIN_FLOW.map((step) => (
              <li key={step.label}>
                <span
                  className={step.settled ? "flow-dot flow-dot--settled" : "flow-dot"}
                  aria-hidden="true"
                />
                {step.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
