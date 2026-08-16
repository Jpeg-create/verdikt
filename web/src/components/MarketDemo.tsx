import { useState } from "react";
import type { Verdict } from "../types";

type Phase = "staking" | "disputeWindow" | "settled";

export function MarketDemo({ verdict, onReset }: { verdict: Verdict; onReset: () => void }) {
  const [phase, setPhase] = useState<Phase>("staking");
  const [yesStake, setYesStake] = useState(0);
  const [noStake, setNoStake] = useState(0);

  function stake(side: "yes" | "no", amount: number) {
    if (side === "yes") setYesStake((v) => v + amount);
    else setNoStake((v) => v + amount);
  }

  function proposeAndWait() {
    setPhase("disputeWindow");
    // Simulated dispute window — real contract enforces a 1 hour window.
    setTimeout(() => setPhase("settled"), 1800);
  }

  const winningPool = verdict.outcome ? yesStake : noStake;
  const losingPool = verdict.outcome ? noStake : yesStake;
  const payoutMultiplier = winningPool > 0 ? 1 + losingPool / winningPool : 1;

  return (
    <div className="card">
      <h2>Demo outcome market</h2>
      <p>
        A minimal stake-and-settle market consuming Verdikt's verdict — mirrors
        <code> DemoOutcomeMarket.sol</code> in miniature.
      </p>

      {phase === "staking" && (
        <>
          <div className="stake-row">
            <div>
              <p>YES pool: {yesStake} OKB</p>
              <button onClick={() => stake("yes", 1)}>Stake 1 OKB on YES</button>
            </div>
            <div>
              <p>NO pool: {noStake} OKB</p>
              <button onClick={() => stake("no", 1)}>Stake 1 OKB on NO</button>
            </div>
          </div>
          <button className="primary" onClick={proposeAndWait} disabled={yesStake + noStake === 0}>
            Propose resolution on-chain →
          </button>
        </>
      )}

      {phase === "disputeWindow" && (
        <p>Resolution proposed. Waiting out the dispute window before finalizing…</p>
      )}

      {phase === "settled" && (
        <>
          <p className="outcome-pill yes">
            Finalized: {verdict.outcome ? "YES" : "NO"} wins
          </p>
          <p>
            Winning side payout multiplier: <strong>{payoutMultiplier.toFixed(2)}x</strong> staked
            amount (stake back + pro-rata share of the losing pool).
          </p>
        </>
      )}

      <button className="secondary" onClick={onReset}>
        ← Try another question
      </button>
    </div>
  );
}
