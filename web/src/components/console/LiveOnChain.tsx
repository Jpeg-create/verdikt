import { NETWORK } from "../../config";
import { LivePlayground } from "./LivePlayground";
import { LiveProof } from "./LiveProof";

export function LiveOnChain() {
  return (
    <section id="live" className="section section--flush">
      <header className="console__head">
        <h2 className="section__title section__title--inline">Live on {NETWORK.name}</h2>
        <p className="console__meta">
          real contracts · real reads · everything above this section is a client-side simulation —
          this is not
        </p>
      </header>

      <div className="console__grid">
        <div className="console__column">
          <LiveProof />
        </div>
        <div className="console__column">
          <LivePlayground />
        </div>
      </div>
    </section>
  );
}
