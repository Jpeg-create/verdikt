import {
  DEMO_DISPUTE_WINDOW_SECONDS,
  PRODUCTION_DISPUTE_WINDOW_SECONDS,
  SETTLEMENT_RECEIPT,
  STAKE_INCREMENT_OKB,
  NETWORK,
} from "../../config";
import { Panel } from "../Panel";
import type { MarketPhase, StakeSide, Verdict } from "../../types";

interface DemoMarketProps {
  verdict: Verdict | null;
  phase: MarketPhase;
  yesStake: number;
  noStake: number;
  secondsRemaining: number;
  onStake: (side: StakeSide) => void;
  onPropose: () => void;
  onReset: () => void;
}

function share(stake: number, pot: number) {
  return pot === 0 ? 0 : Math.round((stake / pot) * 100);
}

function countdown(seconds: number) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function panelStatus(verdict: Verdict | null, phase: MarketPhase) {
  if (phase === "settled") return { label: "finalized", tone: "done" as const };
  if (phase === "dispute") return { label: "dispute window", tone: "pending" as const };
  if (verdict) return { label: "ready", tone: "active" as const };
  return { label: "locked", tone: "idle" as const };
}

export function DemoMarket({
  verdict,
  phase,
  yesStake,
  noStake,
  secondsRemaining,
  onStake,
  onPropose,
  onReset,
}: DemoMarketProps) {
  const pot = yesStake + noStake;
  const yesWins = verdict?.outcome === true;
  const winningPool = yesWins ? yesStake : noStake;
  const losingPool = yesWins ? noStake : yesStake;
  const payoutMultiplier = winningPool > 0 ? 1 + losingPool / winningPool : 1;

  const canPropose = verdict !== null && pot > 0;
  const proposeHint = !verdict
    ? "verdict required before proposing"
    : pot === 0
      ? "stake into a pool to enable"
      : "calls proposeResolution() then finalize()";

  const status = panelStatus(verdict, phase);

  return (
    <Panel label="03 · Demo market" status={status.label} statusTone={status.tone}>
      <p className="market__intro">
        A minimal stake-and-settle market consuming the verdict — mirrors{" "}
        <code>DemoOutcomeMarket.sol</code> in miniature.
      </p>

      <div className="pool-grid">
        <div className={phase === "settled" && yesWins ? "pool pool--won-yes" : "pool"}>
          <p className="pool__label is-yes">YES POOL</p>
          <p className="pool__amount">
            {yesStake}
            <span>OKB</span>
          </p>
          <p className="pool__share">{share(yesStake, pot)}% of pot</p>
        </div>
        <div className={phase === "settled" && verdict && !yesWins ? "pool pool--won-no" : "pool"}>
          <p className="pool__label is-no">NO POOL</p>
          <p className="pool__amount">
            {noStake}
            <span>OKB</span>
          </p>
          <p className="pool__share">{share(noStake, pot)}% of pot</p>
        </div>
      </div>

      {phase === "staking" ? (
        <>
          <div className="stake-row">
            <button type="button" className="button button--stake is-yes" onClick={() => onStake("yes")}>
              + {STAKE_INCREMENT_OKB} on YES
            </button>
            <button type="button" className="button button--stake is-no" onClick={() => onStake("no")}>
              + {STAKE_INCREMENT_OKB} on NO
            </button>
          </div>
          <button
            type="button"
            className="button button--primary button--block"
            disabled={!canPropose}
            onClick={onPropose}
          >
            Propose resolution on-chain →
          </button>
          <p className="market__hint">{proposeHint}</p>
        </>
      ) : null}

      {phase === "dispute" ? (
        <div className="dispute">
          <p className="dispute__label">Dispute window open</p>
          <p className="dispute__clock">{countdown(secondsRemaining)}</p>
          <p className="dispute__detail">
            Verdict proposed. Any staker may dispute before <code>finalize()</code> writes it
            permanently.
          </p>
          <p className="dispute__note">
            production window: {PRODUCTION_DISPUTE_WINDOW_SECONDS / 60} minutes ·{" "}
            {DEMO_DISPUTE_WINDOW_SECONDS}s for the demo
          </p>
        </div>
      ) : null}

      {phase === "settled" && verdict ? (
        <>
          <div className={yesWins ? "settlement settlement--yes" : "settlement settlement--no"}>
            <p className="eyebrow eyebrow--tight">Finalized</p>
            <p className={`settlement__outcome ${yesWins ? "is-yes" : "is-no"}`}>
              {verdict.outcome ? "YES" : "NO"} wins
            </p>
            <p className="settlement__payout">
              <span className="settlement__multiplier">{payoutMultiplier.toFixed(2)}x</span>
              payout multiplier
            </p>
            <p className="settlement__detail">
              Stake back plus pro-rata share of the {losingPool} OKB losing pool.
            </p>
          </div>
          <p className="receipt">
            <span>tx {SETTLEMENT_RECEIPT.txHash} · finalize()</span>
            <span>
              block {SETTLEMENT_RECEIPT.block} · {NETWORK.name}
            </span>
          </p>
        </>
      ) : null}

      <button type="button" className="button button--ghost button--block" onClick={onReset}>
        ← Reset and try another question
      </button>
    </Panel>
  );
}
