"use client";

import { explorerAddressUrl, explorerTxUrl } from "../../lib/chain";
import { ORACLE_ADDRESS, PROOF_MARKET_ADDRESS, PROOF_TRAIL } from "../../lib/contracts";
import { useLiveOracle } from "../../hooks/useLiveOracle";
import { Panel } from "../Panel";

function statusTone(status: string | undefined) {
  if (status === "finalized") return "done" as const;
  if (status === "proposed" || status === "disputed") return "pending" as const;
  return "idle" as const;
}

function formatDeadline(deadline: bigint | undefined) {
  if (!deadline || deadline === 0n) return "—";
  return new Date(Number(deadline) * 1000).toISOString().replace(".000Z", "Z");
}

export function LiveProof() {
  const { question, resolution, isLoading, isError } = useLiveOracle();

  const status = resolution?.status;
  const confidencePct = resolution ? resolution.confidenceBps / 100 : 0;
  const outcomeClass = resolution?.outcome ? "is-yes" : "is-no";

  return (
    <>
      <Panel
        label="Live · VerdiktOracle"
        status={`${ORACLE_ADDRESS.slice(0, 6)}…${ORACLE_ADDRESS.slice(-4)}`}
        bodyClassName="call-payload"
      >
        {isError ? (
          <p className="live__error">Couldn&apos;t reach X Layer testnet — check your connection and reload.</p>
        ) : isLoading || !question ? (
          <p>reading chain…</p>
        ) : (
          <>
            <p className="call-payload__comment">// real question, from oracle.questions(marketId)</p>
            <p>
              <span className="call-payload__key">category</span>
              {question.category}
            </p>
            <p>
              <span className="call-payload__key">question</span>
              {question.questionText}
            </p>

            <p className="call-payload__comment call-payload__comment--spaced">
              // real resolution, from oracle.resolutions(marketId)
            </p>
            <p>
              <span className="call-payload__key">status</span>
              <span className={`call-payload__status is-${statusTone(status)}`}>
                {status ?? "none"}
              </span>
            </p>
            {resolution ? (
              <>
                <div className="verdict__headline verdict__headline--compact">
                  <p className={`verdict__outcome ${outcomeClass}`}>
                    {resolution.outcome ? "YES" : "NO"}
                  </p>
                  <div className="verdict__confidence">
                    <div className="meter">
                      <div
                        className={`meter__fill ${outcomeClass}`}
                        style={{ width: `${confidencePct}%` }}
                      />
                    </div>
                    <p className="verdict__confidence-note">{confidencePct.toFixed(1)}% confidence</p>
                  </div>
                </div>
                <p>
                  <span className="call-payload__key">justification</span>
                  {resolution.justification}
                </p>
                <p>
                  <span className="call-payload__key">disputeDeadline</span>
                  {formatDeadline(resolution.disputeDeadline)}
                </p>
              </>
            ) : null}
          </>
        )}
      </Panel>

      <Panel label="Proof trail" status={PROOF_TRAIL.filter((s) => s.tx).length + " / " + PROOF_TRAIL.length + " steps on-chain"}>
        <ul className="proof-trail">
          {PROOF_TRAIL.map((step) => (
            <li key={step.step} className="proof-trail__item">
              <span className={step.tx ? "proof-trail__dot is-done" : "proof-trail__dot"} />
              <span className="proof-trail__step">{step.step}</span>
              {step.tx ? (
                <a href={explorerTxUrl(step.tx)} target="_blank" rel="noreferrer" className="proof-trail__link">
                  {step.tx.slice(0, 10)}… ↗
                </a>
              ) : (
                <span className="proof-trail__pending">pending</span>
              )}
            </li>
          ))}
        </ul>
        <a
          href={explorerAddressUrl(PROOF_MARKET_ADDRESS)}
          target="_blank"
          rel="noreferrer"
          className="proof-trail__market-link"
        >
          View DemoOutcomeMarket on the explorer ↗
        </a>
      </Panel>
    </>
  );
}
