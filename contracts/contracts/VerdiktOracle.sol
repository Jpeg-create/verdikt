// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VerdiktOracle
/// @notice AI-verified outcome oracle intended as a "designated third-party
///         oracle provider" for X Layer Exchange OS outcome markets.
///         Resolution flow: propose -> dispute window -> finalize.
///         The AI resolution engine runs off-chain and submits its verdict
///         (outcome + confidence + evidence hash) on-chain via proposeResolution.
contract VerdiktOracle {
    enum Category {
        Sports,
        Crypto
    }

    enum Status {
        None,
        Proposed,
        Disputed,
        Finalized
    }

    struct Question {
        Category category;
        string questionText;
        string resolutionCriteria;
        uint256 createdAt;
        uint256 resolveBy; // earliest time a proposal may be made
    }

    struct Resolution {
        bool outcome; // true = YES / event occurred, false = NO
        uint16 confidenceBps; // 0-10000 (basis points), e.g. 9500 = 95.00%
        string justification; // short AI-written rationale
        bytes32 evidenceHash; // hash of the full evidence bundle (off-chain)
        uint256 proposedAt;
        uint256 disputeDeadline;
        Status status;
    }

    /// @notice How long a proposed resolution can be disputed before finalization.
    uint256 public constant DISPUTE_WINDOW = 1 hours;

    /// @notice Address permitted to submit AI-resolved proposals (the oracle engine's signer).
    address public resolver;

    /// @notice Address permitted to rule on disputes (multisig/governance in production).
    address public admin;

    mapping(bytes32 => Question) public questions;
    mapping(bytes32 => Resolution) public resolutions;

    event QuestionCreated(
        bytes32 indexed marketId,
        Category category,
        string questionText,
        string resolutionCriteria,
        uint256 resolveBy
    );

    event ResolutionProposed(
        bytes32 indexed marketId,
        bool outcome,
        uint16 confidenceBps,
        bytes32 evidenceHash,
        uint256 disputeDeadline
    );

    event ResolutionDisputed(bytes32 indexed marketId, address indexed disputer);

    event ResolutionFinalized(bytes32 indexed marketId, bool outcome);

    modifier onlyResolver() {
        require(msg.sender == resolver, "Verdikt: not resolver");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Verdikt: not admin");
        _;
    }

    constructor(address _resolver) {
        resolver = _resolver;
        admin = msg.sender;
    }

    /// @notice Register a new question a market wants Verdikt to resolve.
    function createQuestion(
        bytes32 marketId,
        Category category,
        string calldata questionText,
        string calldata resolutionCriteria,
        uint256 resolveBy
    ) external {
        require(questions[marketId].createdAt == 0, "Verdikt: question exists");
        questions[marketId] = Question({
            category: category,
            questionText: questionText,
            resolutionCriteria: resolutionCriteria,
            createdAt: block.timestamp,
            resolveBy: resolveBy
        });

        emit QuestionCreated(marketId, category, questionText, resolutionCriteria, resolveBy);
    }

    /// @notice Submit the AI-resolved outcome for a question. Only callable by the oracle engine's signer.
    function proposeResolution(
        bytes32 marketId,
        bool outcome,
        uint16 confidenceBps,
        string calldata justification,
        bytes32 evidenceHash
    ) external onlyResolver {
        Question storage q = questions[marketId];
        require(q.createdAt != 0, "Verdikt: unknown question");
        require(block.timestamp >= q.resolveBy, "Verdikt: too early to resolve");
        require(resolutions[marketId].status == Status.None, "Verdikt: already proposed");
        require(confidenceBps <= 10_000, "Verdikt: bad confidence");

        uint256 deadline = block.timestamp + DISPUTE_WINDOW;

        resolutions[marketId] = Resolution({
            outcome: outcome,
            confidenceBps: confidenceBps,
            justification: justification,
            evidenceHash: evidenceHash,
            proposedAt: block.timestamp,
            disputeDeadline: deadline,
            status: Status.Proposed
        });

        emit ResolutionProposed(marketId, outcome, confidenceBps, evidenceHash, deadline);
    }

    /// @notice Anyone can flag a proposed resolution as disputed within the dispute window.
    ///         In this MVP, disputes freeze finalization pending admin review (production
    ///         would replace this with staking/slashing per the standing plan).
    function dispute(bytes32 marketId) external {
        Resolution storage r = resolutions[marketId];
        require(r.status == Status.Proposed, "Verdikt: not disputable");
        require(block.timestamp < r.disputeDeadline, "Verdikt: dispute window closed");

        r.status = Status.Disputed;
        emit ResolutionDisputed(marketId, msg.sender);
    }

    /// @notice Finalize a proposed resolution once its dispute window has passed undisputed.
    function finalize(bytes32 marketId) external {
        Resolution storage r = resolutions[marketId];
        require(r.status == Status.Proposed, "Verdikt: not finalizable");
        require(block.timestamp >= r.disputeDeadline, "Verdikt: dispute window open");

        r.status = Status.Finalized;
        emit ResolutionFinalized(marketId, r.outcome);
    }

    /// @notice Admin resolves a disputed question manually (interim mechanism for the hackathon MVP).
    function adminResolveDispute(bytes32 marketId, bool outcome) external onlyAdmin {
        Resolution storage r = resolutions[marketId];
        require(r.status == Status.Disputed, "Verdikt: not disputed");

        r.outcome = outcome;
        r.status = Status.Finalized;
        emit ResolutionFinalized(marketId, outcome);
    }

    function isFinalized(bytes32 marketId) external view returns (bool) {
        return resolutions[marketId].status == Status.Finalized;
    }

    function getOutcome(bytes32 marketId) external view returns (bool) {
        require(resolutions[marketId].status == Status.Finalized, "Verdikt: not finalized");
        return resolutions[marketId].outcome;
    }

    function setResolver(address _resolver) external onlyAdmin {
        resolver = _resolver;
    }
}
