import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("VerdiktOracle + DemoOutcomeMarket", () => {
  async function deployFixture() {
    const [admin, resolver, alice, bob] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("VerdiktOracle");
    const oracle = await Oracle.connect(admin).deploy(resolver.address);

    const marketId = ethers.id("test-market-1");
    const Market = await ethers.getContractFactory("DemoOutcomeMarket");
    const market = await Market.deploy(await oracle.getAddress(), marketId);

    return { oracle, market, marketId, admin, resolver, alice, bob };
  }

  it("runs the full propose -> dispute window -> finalize -> settle -> claim loop", async () => {
    const { oracle, market, marketId, resolver, alice, bob } = await deployFixture();

    const now = await time.latest();

    await oracle.createQuestion(
      marketId,
      0, // Category.Sports
      "Did Team A win Match X on 2026-08-20?",
      "Resolves YES if Team A wins per official match result.",
      now // resolvable immediately for the test
    );

    // Users stake before resolution.
    await market.connect(alice).stakeYes({ value: ethers.parseEther("1") });
    await market.connect(bob).stakeNo({ value: ethers.parseEther("1") });

    // Oracle engine proposes an outcome (YES, 96% confidence).
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence-bundle-v1"));
    await oracle
      .connect(resolver)
      .proposeResolution(marketId, true, 9600, "Official result confirms Team A won 2-1.", evidenceHash);

    // Cannot finalize before the dispute window closes.
    await expect(oracle.finalize(marketId)).to.be.revertedWith("Verdikt: dispute window open");

    await time.increase(60 * 61); // past the 1 hour dispute window

    await oracle.finalize(marketId);
    expect(await oracle.isFinalized(marketId)).to.equal(true);
    expect(await oracle.getOutcome(marketId)).to.equal(true);

    // Demo market settles and pays the YES side.
    await market.settle();
    expect(await market.settled()).to.equal(true);

    const before = await ethers.provider.getBalance(alice.address);
    const tx = await market.connect(alice).claim();
    const receipt = await tx.wait();
    const gasCost = receipt!.gasUsed * receipt!.gasPrice;
    const after = await ethers.provider.getBalance(alice.address);

    // Alice staked 1 ETH on YES and wins the full 1 ETH NO pool too (minus gas).
    expect(after + gasCost - before).to.equal(ethers.parseEther("2"));
  });

  it("allows a dispute to freeze finalization until admin rules", async () => {
    const { oracle, marketId, resolver, admin, alice } = await deployFixture();
    const now = await time.latest();

    await oracle.createQuestion(marketId, 1, "Was BTC >= $100k at T?", "Resolves per index price at T.", now);

    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence-bundle-v2"));
    await oracle.connect(resolver).proposeResolution(marketId, false, 8200, "Price was below threshold.", evidenceHash);

    await oracle.connect(alice).dispute(marketId);

    await time.increase(60 * 61);
    await expect(oracle.finalize(marketId)).to.be.revertedWith("Verdikt: not finalizable");

    await oracle.connect(admin).adminResolveDispute(marketId, true);
    expect(await oracle.getOutcome(marketId)).to.equal(true);
  });
});
