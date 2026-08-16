import { NETWORK } from "../../config";

export function WhyThirdParty() {
  return (
    <section className="rationale">
      <p className="rationale__quote">
        <span className="eyebrow">Why a third-party oracle</span>
        Exchange OS outcome markets “do not depend on continuous price feeds; event outcomes are
        resolved by designated third-party oracle providers” — and no provider is pre-integrated by
        the protocol.
      </p>

      <dl className="rationale__facts">
        <div className="fact-tile">
          <dt>Network</dt>
          <dd>X Layer · {NETWORK.chainId}</dd>
        </div>
        <div className="fact-tile">
          <dt>Categories</dt>
          <dd>Sports · Crypto</dd>
        </div>
      </dl>
    </section>
  );
}
