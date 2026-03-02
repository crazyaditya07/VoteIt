# DECISIONS.md

## ADR 001: Initial Tech Stack
- **Context**: Need a fast, responsive, modern DApp frontend interacting with Sepolia via smart contracts.
- **Decision**: Use React via Vite, TailwindCSS for styling, Wagmi/Viem for Web3 interactions, and Hardhat for smart contracts.
- **Status**: Accepted

## Phase 1 Decisions

**Date:** 2026-03-02

### Scope
- Phase 1 scope is strictly limited to Hardhat project setup, the voting smart contract implementation, unit tests, a deployment script, and deployment to the Sepolia testnet.
- No frontend implementation in this phase.

### Approach
- **Tooling**: Chose Hardhat (JS/TS) over Foundry for better integration with React/wagmi/viem.
- **User Information**: User info (name, email, ID) will NOT be stored on-chain to protect privacy, reduce gas costs, and simplify the contract. The wallet address (`msg.sender`) acts as the sole identity.
- **Proposal Initialization**: The proposal (title, description, choices) will be dynamically initialized via the contract's constructor, ensuring reusability.
- **Smart Contract Rules**: Enforce 1 wallet = 1 vote via `mapping(address => bool) hasVoted`. Revert on invalid option index. Emit `VoteCast(address voter, uint optionIndex)`. Make data public via view functions.

### Constraints
- Must revert gracefully for double voting or invalid options.
- PII must remain completely off-chain.
