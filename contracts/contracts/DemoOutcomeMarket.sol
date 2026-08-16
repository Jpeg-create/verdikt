// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { VerdiktOracle } from "./VerdiktOracle.sol";

/// @title DemoOutcomeMarket
/// @notice Minimal stake-and-settle YES/NO market used to demonstrate that a
///         real market can consume Verdikt's verdict end-to-end: stake -> oracle
///         resolves -> payout. This mirrors (in miniature) the shape of an
///         Exchange OS outcome market venue.
contract DemoOutcomeMarket {
    VerdiktOracle public immutable oracle;
    bytes32 public immutable marketId;

    mapping(address => uint256) public yesStake;
    mapping(address => uint256) public noStake;
    uint256 public totalYes;
    uint256 public totalNo;

    bool public settled;
    bool public outcome;

    mapping(address => bool) public claimed;

    event Staked(address indexed user, bool side, uint256 amount);
    event Settled(bool outcome);
    event Claimed(address indexed user, uint256 amount);

    constructor(address _oracle, bytes32 _marketId) {
        oracle = VerdiktOracle(_oracle);
        marketId = _marketId;
    }

    function stakeYes() external payable {
        require(!settled, "Market: already settled");
        require(msg.value > 0, "Market: zero stake");
        yesStake[msg.sender] += msg.value;
        totalYes += msg.value;
        emit Staked(msg.sender, true, msg.value);
    }

    function stakeNo() external payable {
        require(!settled, "Market: already settled");
        require(msg.value > 0, "Market: zero stake");
        noStake[msg.sender] += msg.value;
        totalNo += msg.value;
        emit Staked(msg.sender, false, msg.value);
    }

    /// @notice Pull the finalized verdict from Verdikt and settle this market.
    function settle() external {
        require(!settled, "Market: already settled");
        require(oracle.isFinalized(marketId), "Market: oracle not finalized");

        outcome = oracle.getOutcome(marketId);
        settled = true;
        emit Settled(outcome);
    }

    function claim() external {
        require(settled, "Market: not settled");
        require(!claimed[msg.sender], "Market: already claimed");

        uint256 winningPool = outcome ? totalYes : totalNo;
        uint256 losingPool = outcome ? totalNo : totalYes;
        uint256 userStake = outcome ? yesStake[msg.sender] : noStake[msg.sender];

        require(userStake > 0, "Market: no winning stake");
        claimed[msg.sender] = true;

        // Winner gets back their stake plus a pro-rata share of the losing pool.
        uint256 payout = userStake + (losingPool * userStake) / winningPool;

        emit Claimed(msg.sender, payout);
        (bool ok, ) = msg.sender.call{ value: payout }("");
        require(ok, "Market: payout failed");
    }
}
