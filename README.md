# Verdikt

An AI-verified outcome oracle for X Layer's Exchange OS outcome markets.

## The problem

Exchange OS's outcome markets settle on real-world events, not price feeds.
Per the whitepaper, event outcomes are resolved by "designated third-party
oracle providers," and the protocol doesn't pre-integrate any of them. That
role is just sitting open. Right now, resolving an outcome market means
trusting one operator's manual call, or nothing at all.

## The solution

Verdikt turns a plain-language market question into a verifiable on-chain
verdict. Not a black-box yes/no: an outcome, a confidence score, and gathered
evidence behind it. A market asks "Did Team A win Match X on Date Y?" and
Verdikt answers with a resolution, its reasoning, and a proposal that any
Exchange OS deployer can plug in as their oracle.

question ──▶ evidence gathering ──▶ AI resolution pass ──▶ proposeResolution()
│
dispute window
│
finalize() ──▶ market settles


Two categories for the MVP: sports (final results) and crypto (price and
threshold questions, e.g. "was BTC ≥ $100k at time T").

## Proof: deployed on X Layer testnet

| Contract | Address | Explorer |
|---|---|---|
| `VerdiktOracle` | _pending deploy_ | — |
| `DemoOutcomeMarket` | _pending deploy_ | — |

| Flow | Tx | Explorer |
|---|---|---|
| Question created | _pending_ | — |
| Resolution proposed | _pending_ | — |
| Finalized | _pending_ | — |
| Market settled + claimed | _pending_ | — |

This table gets filled in once the contracts are live on X Layer testnet
(see `contracts/scripts/deploy.ts`). Until then, the full lifecycle is
verified against a local EVM — details in Status below.

## Repo layout (monorepo)

verdikt/
contracts/ Solidity contracts (oracle + demo consumer), Hardhat config, deploy scripts
oracle-engine/ TypeScript backend: evidence gathering, AI resolution (DeepSeek), on-chain submission
web/ React/Vite frontend demo — create a mock market, watch it resolve, see payout


## Stack

Contracts run on Solidity and Hardhat, deployed first to X Layer testnet
(chain 1952) and then mainnet (chain 196). The resolution engine is Node.js
and TypeScript, calling DeepSeek's API for the actual verification pass. The
frontend is React, Vite, and TypeScript, and chain interaction goes through
viem.

## Quickstart

```bash
# contracts
cd contracts && npm install
cp .env.example .env        # fill in DEPLOYER_PRIVATE_KEY (testnet funds only)
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network xlayerTestnet

# oracle engine
cd ../oracle-engine && npm install
cp .env.example .env        # MOCK_MODE=true works with no keys or funds
npm start

# web demo
cd ../web && npm install
npm run dev
```

## Testing without funds or credentials

Every layer has a mock mode. The resolution engine can run against canned
evidence, and the frontend can simulate a full market lifecycle (stake,
resolve, dispute window, settle, claim) entirely client-side. You shouldn't
need a wallet, funds, or an API key to see the whole thing work.

## Limitations, as of now

Dispute resolution currently falls back to a single admin address
(`adminResolveDispute`). That's fine for proving the propose → dispute →
finalize loop works, but it's not a real dispute mechanism — a production
version needs a multisig, a staking/slashing challenge game, or an
escalation path to a second independent oracle.

The contracts haven't had a third-party security review. They're compiled
and functionally tested: the full propose → dispute → finalize → settle →
claim lifecycle, plus the path where a dispute freezes finalization, both
pass against a local EVM with correct payout math. That's not the same as
an audit.

Real sports and crypto evidence sources are still being wired in — see
Status below for where that stands.

## Status

Contracts: written, compiled, and verified end to end (happy path and
dispute path, correct payout math) against a local EVM. X Layer testnet
deployment is in progress.

Oracle engine: the evidence → AI verdict → chain-submission pipeline runs
end to end in mock mode. Real sports and crypto evidence sources are next.
