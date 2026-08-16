const CLAIMS = [
  "Every verdict carries its evidence set and a confidence score, not a bare boolean.",
  "Evidence is hashed and committed with the proposal, so the inputs are auditable after the fact.",
  "A dispute window sits between proposal and finalization — the AI never writes a verdict unchallenged.",
];

export function TrustSurface() {
  return (
    <section className="panel trust">
      <h3 className="eyebrow">Trust surface</h3>
      <ul className="trust__list">
        {CLAIMS.map((claim) => (
          <li key={claim}>
            <span className="trust__check" aria-hidden="true">
              ✓
            </span>
            {claim}
          </li>
        ))}
      </ul>
    </section>
  );
}
