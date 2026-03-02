# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Single proposal voting smart contract (Hardhat/Foundry workflow).
- [ ] User information capture form acting as a gatekeeper.
- [ ] Visually polished interactive frontend with Wagmi/Viem.
- [ ] Dynamic on-chain result display (total counts and percentage bars).
- [ ] Sybil-resistant basic implementation (1 wallet = 1 vote).

## Phases

### Phase 1: Smart Contract Foundation
**Status**: ✅ Complete
**Objective**: Build, test, and deploy the Solidity smart contract handling the single proposal voting logic.
**Requirements**: REQ-01, REQ-02, REQ-03, REQ-08

### Phase 2: Web3 Frontend Scaffold & Form Gatekeeper
**Status**: ✅ Complete
**Objective**: Setup React + Vite + Tailwind project, integrate Wagmi/MetaMask, and implement the initial user information form.
**Requirements**: REQ-04, REQ-05, REQ-06

### Phase 3: Voting Interface & Blockchain Integration
**Status**: ✅ Complete
**Objective**: Create the main voting dashboard containing the proposal details, voting actions, transaction feedback, and confirmation state.
**Requirements**: REQ-05, REQ-06, REQ-07

### Phase 4: Data Visualization & Polish
**Status**: ✅ Complete
**Objective**: Develop real-time data visualization (percentage bars) and apply stunning micro-animations, loading states, and responsive design polish.
**Requirements**: REQ-05, REQ-07

### Phase 5: Multi-Poll Smart Contract & Full-Stack Expansion
**Status**: ✅ Complete
**Objective**: Transform the project from a single-proposal DApp to a multi-poll platform. Refactor contracts, build Node.js authentication/API layer, and wire frontend React boundaries to securely authenticate, create polls, and route users.
**Requirements**: Multi-Poll Contract Refactor, MongoDB Setup, JWT Web2 Integration, React Router Integration.

### Phase 6: Relational Smart Contract Binding
**Status**: ✅ Complete
**Objective**: Create a secure trust-boundary enforcing transactional synchronization between on-chain PollCreated events and backend MongoDB records via Server-side RPC verification strictly prohibiting decoupled Web3 optimistic writes.
**Requirements**: Secure Auth binding, Ethers event decoding, API synchronization routes, strict UI race-condition isolation.
