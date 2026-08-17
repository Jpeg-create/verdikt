"use client";

import { useEffect, useState } from "react";
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

  // window.ethereum can be injected synchronously before hydration, so reading it
  // directly during render would mismatch the server markup. Defer to an effect.
  const [hasLegacyProvider, setHasLegacyProvider] = useState(false);
  useEffect(() => {
    setHasLegacyProvider(Boolean(window.ethereum));
  }, []);

  // EIP-6963 wallets (OKX, MetaMask, etc.) announce themselves and get a connector
  // id equal to their rdns, independent of window.ethereum. wagmi's bare injected()
  // fallback always has id "injected" and only works if a wallet claimed that slot,
  // so prefer an announced wallet and only fall back to it when window.ethereum exists.
  const announcedConnector = connectors.find((c) => c.id !== "injected");
  const fallbackConnector = hasLegacyProvider ? connectors.find((c) => c.id === "injected") : undefined;
  const walletConnector = announcedConnector ?? fallbackConnector;

  if (!walletConnector) {
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
          onClick={() => connect({ connector: walletConnector })}
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
