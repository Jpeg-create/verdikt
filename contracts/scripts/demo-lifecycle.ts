import { ethers } from "hardhat";

// From the deploy.ts run against xlayerTestnet.
const ORACLE_ADDRESS = "0x073894D882A47b437d59E2FB89B40Cab2f0E2B38";
const MARKET_ADDRESS = "0x956b1B3A5b6043F6bc71DB6f4fa26cBaa7B8b6BA";
const MARKET_ID = ethers.id("demo-market-1");

const YES_STAKE = ethers.parseEther("0.02");
const NO_STAKE = ethers.parseEther("0.01");

const STATUS_NONE = 0n;
const STATUS_PROPOSED = 1n;

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);

  const oracle = await ethers.getContractAt("VerdiktOracle", ORACLE_ADDRESS);
  const market = await ethers.getContractAt("DemoOutcomeMarket", MARKET_ADDRESS);

  // Step 1: register the question, if it isn't yet.
  const question = await oracle.questions(MARKET_ID);
  if (question.createdAt === 0n) {
    const resolveBy = Math.floor(Date.now() / 1000);
    const tx = await oracle.createQuestion(
      MARKET_ID,
      0, // Category.Sports
      "Did Team A win Match X on Date Y?",
      "Resolves YES if Team A is declared the official winner per the league's published result.",
      resolveBy
    );
    const receipt = await tx.wait();
    console.log("1. Question created. Tx:", receipt!.hash);
  } else {
    console.log("1. Question already exists, skipping.");
  }

  // Step 2: seed both sides of the market so the payout math has something to prove.
  const totalYes = await market.totalYes();
  const totalNo = await market.totalNo();
  if (totalYes === 0n && totalNo === 0n) {
    const tx1 = await market.stakeYes({ value: YES_STAKE });
    await tx1.wait();
    const tx2 = await market.stakeNo({ value: NO_STAKE });
    const receipt2 = await tx2.wait();
    console.log("2. Staked YES + NO. Last tx:", receipt2!.hash);
  } else {
    console.log("2. Already staked, skipping.");
  }

  // Step 3: submit the AI-resolved verdict.
  let resolution = await oracle.resolutions(MARKET_ID);
  if (resolution.status === STATUS_NONE) {
    const evidenceHash = ethers.id("demo-evidence-bundle");
    const tx = await oracle.proposeResolution(
      MARKET_ID,
      true, // outcome: YES
      9200, // 92.00% confidence
      "Official league result confirms Team A won 3-1; corroborated by two independent news outlets.",
      evidenceHash
    );
    const receipt = await tx.wait();
    console.log("3. Resolution proposed. Tx:", receipt!.hash);
    resolution = await oracle.resolutions(MARKET_ID);
  } else {
    console.log("3. Resolution already proposed, skipping.");
  }

  // Step 4: finalize, once the 1-hour dispute window has passed.
  if (resolution.status === STATUS_PROPOSED) {
    const now = Math.floor(Date.now() / 1000);
    const deadline = Number(resolution.disputeDeadline);
    if (now < deadline) {
      console.log(
        `4. Dispute window still open — re-run this script after ${new Date(deadline * 1000).toISOString()}.`
      );
      return;
    }
    const tx = await oracle.finalize(MARKET_ID);
    const receipt = await tx.wait();
    console.log("4. Resolution finalized. Tx:", receipt!.hash);
  } else {
    console.log("4. Already finalized, skipping.");
  }

  // Step 5: pull the verdict into the market.
  if (!(await market.settled())) {
    const tx = await market.settle();
    const receipt = await tx.wait();
    console.log("5. Market settled. Tx:", receipt!.hash);
  } else {
    console.log("5. Already settled, skipping.");
  }

  // Step 6: claim the winning payout.
  if (!(await market.claimed(signer.address))) {
    const tx = await market.claim();
    const receipt = await tx.wait();
    console.log("6. Claimed payout. Tx:", receipt!.hash);
  } else {
    console.log("6. Already claimed, skipping.");
  }

  console.log("Lifecycle complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
