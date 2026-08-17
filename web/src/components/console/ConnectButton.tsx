"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEnsureChain } from "../../hooks/useEnsureChain";

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { ensureChain, isWrongChain } = useEnsureChain();

  const injectedConnector = connectors[0];
  const hasInjectedWallet = typeof window !== "undefined" && Boolean(window.ethereum);

  if (!hasInjectedWallet) {
    return (
      <a
        className="button button--ghost button--block"
        href="https://www.okx.com/web3/wallet"
        target="_blank"
        rel="noreferrer"
      >
        No wallet detected — get one →
      </a>
    );
  }

  if (!isConnected) {
    return (
      <>
        <button
          type="button"
          className="button button--primary button--block"
          disabled={isPending}
          onClick={() => connect({ connector: injectedConnector })}
        >
          {isPending ? "Connecting…" : "Connect wallet →"}
        </button>
        {error ? <p className="live__error">{error.message}</p> : null}
      </>
    );
  }

  if (isWrongChain) {
    return (
      <button type="button" className="button button--primary button--block" onClick={ensureChain}>
        Switch to X Layer testnet →
      </button>
    );
  }

  return (
    <div className="wallet-row">
      <span className="wallet-row__address">{short(address!)}</span>
      <button type="button" className="button button--ghost" onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
