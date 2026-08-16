import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // The resolver is the address the off-chain oracle-engine signs with.
  // Defaults to the deployer for local/testnet convenience — override via
  // RESOLVER_ADDRESS if the engine uses a separate key.
  const resolverAddress = process.env.RESOLVER_ADDRESS ?? deployer.address;

  const Oracle = await ethers.getContractFactory("VerdiktOracle");
  const oracle = await Oracle.deploy(resolverAddress);
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log("VerdiktOracle deployed to:", oracleAddress);
  console.log("Resolver address set to:", resolverAddress);

  // Deploy one demo market wired to a placeholder marketId for local testing.
  // Real marketIds are created via oracle.createQuestion(...) from the engine.
  const demoMarketId = ethers.id("demo-market-1");
  const Market = await ethers.getContractFactory("DemoOutcomeMarket");
  const market = await Market.deploy(oracleAddress, demoMarketId);
  await market.waitForDeployment();
  console.log("DemoOutcomeMarket deployed to:", await market.getAddress());
  console.log("Demo marketId:", demoMarketId);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
