/** Deployment facts and demo tuning surfaced across the console and marketing sections. */

export const ENGINE_VERSION = "0.1.0";

export const NETWORK = {
  name: "X Layer testnet",
  chainId: 195,
} as const;

export const ORACLE_ADDRESS = "0x7A3e…c19B";

/** Dispute window enforced by VerdiktOracle on a real deployment. */
export const PRODUCTION_DISPUTE_WINDOW_SECONDS = 3600;

/** Compressed window used by the client-side demo so the flow stays watchable. */
export const DEMO_DISPUTE_WINDOW_SECONDS = 8;

/** Confidence below this is held rather than proposed on-chain. */
export const AUTO_PROPOSE_THRESHOLD_BPS = 8000;

export const STAKE_INCREMENT_OKB = 1;

/** Settlement receipt shown once the demo market finalizes. */
export const SETTLEMENT_RECEIPT = {
  txHash: "0x4d19…8f02",
  block: "12,904,551",
} as const;
