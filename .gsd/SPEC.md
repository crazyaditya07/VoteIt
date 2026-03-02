# SPEC.md — Project Specification

> **Status**: `FINALIZED` (Phase 5 Extension)

## Vision
A production-quality, full-stack decentralized voting platform. Transitioning away from a single-poll application, it allows authenticated users to create securely managed, multi-option cryptographic polls on deployed Smart Contracts and seamlessly share them via unique routing links. Personal off-chain voter information is strictly managed via a traditional protected Node.js backend.

## Goals
1. Provide a single smart contract to handle limitless polls securely (no factory patterns), preventing double voting per poll (mapping `pollId => wallet => bool`).
2. Implement robust user authentication (Node.js/Express, MongoDB, bcrypt, JWT, Email Verification).
3. Securely bind poll creation endpoints tracking the on-chain `pollId` against the user's database `userId`.
4. Provide a stunning and highly responsive frontend experience using React Router for Dashboard viewing and public Vote links (`/vote/:pollId`).

## Non-Goals (Out of Scope)
- Deployment of one contract per poll.
- Complex DAO governance tokens or quadratic voting.
- Storing user names/emails/birthdates on the blockchain.

## Users
- **Creators:** Authenticated users who manage their own dashboard, generate polls with dynamic options, and copy links to distribute.
- **Voters:** Users who connect their wallet to a specific link to vote (does not strictly require email login for voting, only wallet signature, preserving anonymity on the chain layer).

## Architecture Segregation
- **Backend (Web2):** Express + MongoDB handling User Authentication, JWTs, and Poll Metadata (who created what).
- **Frontend (UI):** React + Vite handling protected login routes, user dashboards, creating polls, and providing the voting UI.
- **Smart Contract (Web3):** Maintains `pollCount`, stores voting arrays per pollId, tracks results robustly, and mathematically prevents double voting using `msg.sender`.

## Success Criteria
- [ ] Users can successfully register, verify email, and log in securely.
- [ ] Logged in users can create multi-option polls (contract successfully emits `PollCreated()`).
- [ ] A dynamically generated `/vote/:pollId` handles routing voters to unique polls accurately.
- [ ] Contract successfully rejects any attempts to reuse a wallet on the same `pollId`.
