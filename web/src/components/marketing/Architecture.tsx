import { NETWORK, PRODUCTION_DISPUTE_WINDOW_SECONDS } from "../../config";

const PACKAGES = [
  {
    index: "01",
    path: "oracle-engine/",
    stack: "Node.js + TypeScript",
    detail:
      "Gathers evidence from independent sources, runs the DeepSeek resolution pass, submits the result on-chain.",
  },
  {
    index: "02",
    path: "contracts/",
    stack: "Solidity + Hardhat",
    detail:
      "VerdiktOracle holds proposals through the dispute window; DemoOutcomeMarket consumes the finalized verdict.",
  },
  {
    index: "03",
    path: "web/",
    stack: "React + Vite",
    detail: "Create a market question, watch it resolve, see the payout — the demo you are reading now.",
  },
];

const SPECS = [
  { label: "Network", value: `${NETWORK.name} · chainId ${NETWORK.chainId}` },
  { label: "Chain client", value: "viem" },
  { label: "Resolution model", value: "DeepSeek API" },
  { label: "Categories", value: "Sports · Crypto" },
  { label: "Dispute window", value: `${PRODUCTION_DISPUTE_WINDOW_SECONDS}s in production` },
  { label: "Oracle interface", value: "proposeResolution() · finalize()" },
];

export function Architecture() {
  return (
    <section id="architecture" className="section">
      <h2 className="eyebrow">Architecture</h2>

      <ul className="card-grid">
        {PACKAGES.map((pkg) => (
          <li key={pkg.path} className="package-card">
            <div className="package-card__head">
              <code>{pkg.path}</code>
              <span className="package-card__index">{pkg.index}</span>
            </div>
            <p className="package-card__stack">{pkg.stack}</p>
            <p className="package-card__detail">{pkg.detail}</p>
          </li>
        ))}
      </ul>

      <dl className="spec-grid">
        {SPECS.map((spec) => (
          <div key={spec.label}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
