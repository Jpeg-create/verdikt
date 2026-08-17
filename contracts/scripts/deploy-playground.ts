import { ethers } from "hardhat";

// Deploys a second, standalone DemoOutcomeMarket for live visitor staking.
// Kept separate from the market demo-lifecycle.ts drives to finalize/settle/
// claim: stakeYes/stakeNo require !settled, and that market locks permanently
// once settled. Staking never touches the oracle, so no createQuestion() call
// is needed here.
const ORACLE_ADDRESS = "0x073894D882A47b437d59E2FB89B40Cab2f0E2B38";
const PLAYGROUND_MARKET_ID = ethers.id("playground-market");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Market = await ethers.getContractFactory("DemoOutcomeMarket");
  const market = await Market.deploy(ORACLE_ADDRESS, PLAYGROUND_MARKET_ID);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();

  console.log("Playground DemoOutcomeMarket deployed to:", marketAddress);
  console.log("Playground marketId:", PLAYGROUND_MARKET_ID);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
