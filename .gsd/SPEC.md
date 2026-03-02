# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A production-quality, decentralized voting application deployed on the Ethereum Sepolia testnet. It provides a visually stunning, responsive interface with a seamless Web3 experience, allowing users to securely cast immutable votes on a single on-chain proposal, strictly enforcing a one-wallet-one-vote mechanism.

## Goals
1. Provide a secure, on-chain voting mechanism on Sepolia with "one wallet = one vote" verification.
2. Deliver a visually stunning, modern, and highly responsive user interface with elegant animations and clear state feedback.
3. Capture basic verifiable user information (name, email, wallet address, optional ID) prior to granting voting access.
4. Ensure votes are immutable and transparent, emitting on-chain events for each cast vote and displaying real-time aggregated results seamlessly.

## Non-Goals (Out of Scope)
- Multiple active proposals per deployment (this iteration focuses on a single central proposal).
- Support for networks other than Ethereum (Sepolia testnet initially, mainnet eventually).
- Off-chain database storage for votes (all votes strictly on-chain).
- Complex DAO governance tokens or quadratic voting (sticking to simple 1-wallet = 1-vote mechanism).

## Users
- **Voters**: Individuals connecting their MetaMask wallets, submitting basic user info, reviewing proposal details (e.g., Yes/No/Abstain), and securely signing a transaction to cast their irrevocable vote.

## Constraints
- **Technical**: Must use React (Vite), TailwindCSS, Wagmi/Viem (Web3 interaction), and Solidity (Hardhat or Foundry for contracts).
- **Blockchain**: Strict enforcement of single-vote per address to prevent Sybil-like behavior at the contract level.
- **UX**: High bar for aesthetics (smooth animations, modern typography, excellent loading/error states during blockchain txns).

## Success Criteria
- [ ] Smart contract successfully deployed to Sepolia, verified, and correctly tallying votes.
- [ ] Users can successfully connect MetaMask, submit info form, cast a vote, and receive confirmation.
- [ ] Attempting to vote twice with the same wallet fails transactionally and visually gracefully.
- [ ] UI displays live total vote counts and percentage bars directly pulled from the smart contract without lag.
