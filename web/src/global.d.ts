export {};

declare global {
  interface Window {
    /** Injected by MetaMask, OKX Wallet, and similar extensions. */
    ethereum?: unknown;
  }
}
