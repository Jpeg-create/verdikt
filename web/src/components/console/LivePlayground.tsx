"use client";

import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { explorerAddressUrl, explorerTxUrl } from "../../lib/chain";
import { PLAYGROUND_MARKET_ADDRESS } from "../../lib/contracts";
import { PLAYGROUND_STAKE_OKB, useLivePlayground } from "../../hooks/useLivePlayground";
import { useEnsureChain } from "../../hooks/useEnsureChain";
import { Panel } from "../Panel";
import { ConnectButton } from "./ConnectButton";

function share(part: bigint, total: bigint) {
  if (total === 0n) return 0;
  return Math.round((Number(part) / Number(total)) * 100);
}

export function LivePlayground() {
  const { isConnected } = useAccount();
  const { isWrongChain } = useEnsureChain();
  const {
    isPlaygroundDeployed,
    totalYes,
    totalNo,
    isReadError,
    stake,
    txHash,
    isSubmitting,
    isConfirming,
    isConfirmed,
    error,
  } = useLivePlayground();

  const pot = totalYes + totalNo;
  const canStake = isPlaygroundDeployed && isConnected && !isWrongChain && !isSubmitting && !isConfirming;

  if (!isPlaygroundDeployed) {
    return (
      <Panel label="Live · stake real testnet OKB" status="not deployed yet" statusTone="idle">
        <p className="market__intro">
          A second, always-open <code>DemoOutcomeMarket</code> for live visitor staking — separate
          from the finalized proof market, so it never locks. Run{" "}
          <code>contracts/scripts/deploy-playground.ts</code> and fill in{" "}
          <code>PLAYGROUND_MARKET_ADDRESS</code> in <code>src/lib/contracts.ts</code> to switch this
          panel on.
        </p>
      </Panel>
    );
  }

  return (
    <Panel label="Live · stake real testnet OKB" status={isConnected ? "wallet connected" : "wallet disconnected"} statusTone={isConnected ? "active" : "idle"}>
      <p className="market__intro">
        A second, always-open <code>DemoOutcomeMarket</code> — separate from the finalized proof
        market above, so it never locks. Stakes {PLAYGROUND_STAKE_OKB} testnet OKB, real gas, real
        tx.
      </p>

      <div className="pool-grid">
        <div className="pool">
          <p className="pool__label is-yes">YES POOL</p>
          <p className="pool__amount">
            {Number(formatEther(totalYes)).toFixed(3)}
            <span>OKB</span>
          </p>
          <p className="pool__share">{share(totalYes, pot)}% of pot</p>
        </div>
        <div className="pool">
          <p className="pool__label is-no">NO POOL</p>
          <p className="pool__amount">
            {Number(formatEther(totalNo)).toFixed(3)}
            <span>OKB</span>
          </p>
          <p className="pool__share">{share(totalNo, pot)}% of pot</p>
        </div>
      </div>

      {isReadError ? (
        <p className="live__error">Couldn&apos;t reach X Layer testnet — check your connection and reload.</p>
      ) : null}

      <ConnectButton />

      {isConnected && !isWrongChain ? (
        <>
          <div className="stake-row">
            <button
              type="button"
              className="button button--stake is-yes"
              disabled={!canStake}
              onClick={() => stake("yes")}
            >
              Stake {PLAYGROUND_STAKE_OKB} on YES
            </button>
            <button
              type="button"
              className="button button--stake is-no"
              disabled={!canStake}
              onClick={() => stake("no")}
            >
              Stake {PLAYGROUND_STAKE_OKB} on NO
            </button>
          </div>
          <p className="market__hint">
            need testnet OKB?{" "}
            <a href="https://www.okx.com/xlayer/faucet" target="_blank" rel="noreferrer">
              faucet ↗
            </a>
          </p>
        </>
      ) : null}

      {isSubmitting ? <p className="live__pending">confirm the transaction in your wallet…</p> : null}
      {isConfirming ? <p className="live__pending">waiting for the transaction to land…</p> : null}
      {error ? <p className="live__error">{error.message.split("\n")[0]}</p> : null}
      {isConfirmed && txHash ? (
        <p className="receipt">
          <span>
            tx{" "}
            <a href={explorerTxUrl(txHash)} target="_blank" rel="noreferrer">
              {txHash.slice(0, 10)}…
            </a>{" "}
            · stake confirmed
          </span>
        </p>
      ) : null}

      <a
        href={explorerAddressUrl(PLAYGROUND_MARKET_ADDRESS)}
        target="_blank"
        rel="noreferrer"
        className="proof-trail__market-link"
      >
        View this market on the explorer ↗
      </a>
    </Panel>
  );
}
