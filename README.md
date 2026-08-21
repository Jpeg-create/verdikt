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

Live: [verdikt-oracle.vercel.app](https://verdikt-oracle.vercel.app) — the
"Live on X Layer testnet" section reads these contracts directly and lets you
stake real testnet OKB into a live sandbox market.

| Contract | Address | Explorer |
|---|---|---|
| `VerdiktOracle` | `0x073894D882A47b437d59E2FB89B40Cab2f0E2B38` | [view](https://www.okx.com/web3/explorer/xlayer-test/address/0x073894D882A47b437d59E2FB89B40Cab2f0E2B38) |
| `DemoOutcomeMarket` | `0x956b1B3A5b6043F6bc71DB6f4fa26cBaa7B8b6BA` | [view](https://www.okx.com/web3/explorer/xlayer-test/address/0x956b1B3A5b6043F6bc71DB6f4fa26cBaa7B8b6BA) |

| Flow | Tx | Explorer |
|---|---|---|
| Question created | `0x73948bf6ef82c8f73813dbab71202c1b18c8cd8b3a661d95c8997197be47650b` | [view](https://www.okx.com/web3/explorer/xlayer-test/tx/0x73948bf6ef82c8f73813dbab71202c1b18c8cd8b3a661d95c8997197be47650b) |
| Resolution proposed | `0x6776c48cac2219a4ec23e3404450195a25908c6948303535b59c2f76715c1e03` | [view](https://www.okx.com/web3/explorer/xlayer-test/tx/0x6776c48cac2219a4ec23e3404450195a25908c6948303535b59c2f76715c1e03) |
| Finalized | `0xe9c3894e9c431faa562547298a31ae9441debf13bf552f0cd27d5b2a15078938` | [view](https://www.okx.com/web3/explorer/xlayer-test/tx/0xe9c3894e9c431faa562547298a31ae9441debf13bf552f0cd27d5b2a15078938) |
| Market settled | `0xf399c321043d73024c8ef0548133fddd73b5e5522c61f0872757133833f4f2ba` | [view](https://www.okx.com/web3/explorer/xlayer-test/tx/0xf399c321043d73024c8ef0548133fddd73b5e5522c61f0872757133833f4f2ba) |
| Payout claimed | `0xae8371c58aa1007e35978db3a942500fdf6a370aa2d9a1a8df2d14619abcc4b2` | [view](https://www.okx.com/web3/explorer/xlayer-test/tx/0xae8371c58aa1007e35978db3a942500fdf6a370aa2d9a1a8df2d14619abcc4b2) |

Full lifecycle (question created, staked, proposed, dispute window,
finalized, settled, claimed) run end to end against real testnet contracts,
not just a local EVM.

## Repo layout (monorepo)

verdikt/
contracts/ Solidity contracts (oracle + demo consumer), Hardhat config, deploy scripts
oracle-engine/ TypeScript backend: evidence gathering, AI resolution (DeepSeek), on-chain submission
web/ Next.js frontend — simulated resolution console, plus a live section reading real contracts and accepting real stakes


## Stack

Contracts run on Solidity and Hardhat, deployed first to X Layer testnet
(chain 1952) and then mainnet (chain 196). The resolution engine is Node.js
and TypeScript, calling DeepSeek's API for the actual verification pass. The
frontend is Next.js, React, and TypeScript, and chain interaction goes through
viem and wagmi.

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

Real sports evidence is now live via two independent free sources —
TheSportsDB and football-data.org (both return real final scores, and the
resolution engine cross-checks them). Crypto evidence is live via CoinGecko
+ Binance public price feeds. See `oracle-engine/src/evidence/` for both.

## Status

Contracts: written, compiled, and verified end to end (happy path and
dispute path, correct payout math) against a local EVM, and the full
lifecycle has now run end to end on X Layer testnet — see Proof above.

Oracle engine: the evidence → AI verdict → chain-submission pipeline runs
end to end in live mode with real evidence. Sports outcomes resolve via two
independent free sources (TheSportsDB + football-data.org), crypto thresholds
via CoinGecko + Binance public price feeds. Both are keyless or free-tier, so
the engine runs without paid subscriptions.

Resolution accuracy was smoke-tested against real settled fixtures: correct
verdicts on wins phrased either way ("Did A beat B?" and "Did B beat A?"
resolve to opposite outcomes from the same fixture), a distinct-club control
(Manchester United vs Arsenal did not cross-match Manchester City), and
confidence that tracks evidence (99% with two agreeing sources, ~95% with
one, ≤10% when nothing is found).
