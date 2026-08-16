import {
  DEMO_DISPUTE_WINDOW_SECONDS,
  ORACLE_ADDRESS,
  PRODUCTION_DISPUTE_WINDOW_SECONDS,
} from "../../config";
import { Panel } from "../Panel";
import type { MarketPhase, Verdict } from "../../types";

interface ContractCallProps {
  verdict: Verdict | null;
  questionId: string;
  evidenceHash: string;
  phase: MarketPhase;
}

function callStatus(verdict: Verdict | null, phase: MarketPhase) {
  if (phase === "settled") return { label: "finalized ✓", tone: "done" };
  if (phase === "dispute") return { label: "proposed · awaiting finalize", tone: "pending" };
  if (verdict) return { label: "ready to propose", tone: "active" };
  return { label: "awaiting verdict", tone: "idle" };
}

export function ContractCall({ verdict, questionId, evidenceHash, phase }: ContractCallProps) {
  const status = callStatus(verdict, phase);

  return (
    <Panel
      label="Contract call"
      status={`VerdiktOracle · ${ORACLE_ADDRESS}`}
      bodyClassName="call-payload"
    >
      <p className="call-payload__comment">
        // step 04 — proposeResolution(bytes32,bool,uint16,bytes32)
      </p>
      <p>
        <span className="call-payload__key">questionId</span>
        {questionId}
      </p>
      <p>
        <span className="call-payload__key">outcome</span>
        {verdict ? String(verdict.outcome) : "—"}
      </p>
      <p>
        <span className="call-payload__key">confidence</span>
        {verdict ? verdict.confidenceBps : "—"}
      </p>
      <p>
        <span className="call-payload__key">evidenceHash</span>
        {verdict ? evidenceHash : "—"}
      </p>

      <p className="call-payload__comment call-payload__comment--spaced">
        // step 05 — finalize(bytes32) after disputeWindow
      </p>
      <p>
        <span className="call-payload__key">disputeWindow</span>
        {DEMO_DISPUTE_WINDOW_SECONDS}s (demo) · {PRODUCTION_DISPUTE_WINDOW_SECONDS}s (prod)
      </p>
      <p>
        <span className="call-payload__key">status</span>
        <span className={`call-payload__status is-${status.tone}`}>{status.label}</span>
      </p>
    </Panel>
  );
}
