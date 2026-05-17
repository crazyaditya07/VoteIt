# 🗳️ VoteIt — Decentralized Voting Platform

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity" />
  <img src="https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb" />
</p>

> A fully decentralized, trustless voting platform built on the Ethereum blockchain. Create polls, cast votes, and view results — all secured by smart contracts on the Sepolia testnet.

---

## ✨ Features

- 🔐 **Wallet Authentication** — Connect with MetaMask via wagmi + viem
- 📝 **Create Polls** — Deploy polls with custom options and deadlines on-chain
- ✅ **Cast Votes** — Vote on active polls, enforced by smart contracts (no double-voting)
- 📊 **Live Results** — Real-time vote tallies synced from chain events to MongoDB
- 🌐 **Web2 Bridge** — Node.js backend indexes blockchain events into MongoDB for fast reads
- 🎨 **Premium UI** — Glassmorphic design with smooth animations and full responsiveness

---

## 🏗️ Architecture

```
VoteIt/
├── contracts/          # Solidity smart contracts (Voting.sol)
├── scripts/            # Hardhat deployment scripts
├── frontend/           # React + Vite + TypeScript + TailwindCSS
│   └── src/
│       ├── pages/      # Login, Dashboard
│       ├── components/ # CreatePoll, VotingInterface, RegistrationForm
│       ├── contexts/   # Auth context
│       ├── hooks/      # Custom React hooks
│       └── contracts/  # ABI + contract addresses
└── backend/            # Express + TypeScript + MongoDB
    └── src/
        ├── routes/     # /api/auth, /api/polls
        ├── controllers/
        ├── models/     # Mongoose schemas
        ├── middleware/  # JWT auth
        └── utils/      # Ethereum RPC helpers
```

### How It Works

```
User Wallet (MetaMask)
        │
        ▼
  React Frontend  ◄──────────────────────────────────────────┐
  (wagmi + viem)                                             │
        │                                                    │
        ├──── On-chain writes ──► Voting.sol (Sepolia)       │
        │                              │                     │
        │                    emits contract events           │
        │                              │                     │
        │                              ▼                     │
        └──── REST API reads ──► Node.js Backend ────────────┘
                                       │
                                 indexes events
                                       │
                                       ▼
                                   MongoDB
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| npm | ≥ 9 | Package manager |
| MetaMask | Latest | Wallet |
| MongoDB | ≥ 6 | Database |
| Alchemy / Infura account | — | Sepolia RPC |

---

### 1. Clone the Repository

```bash
git clone https://github.com/crazyaditya07/VoteIt.git
cd VoteIt
```

---

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` in the root (used by Hardhat):

```env
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
PRIVATE_KEY="YOUR_DEPLOYER_WALLET_PRIVATE_KEY"
```

Create `backend/.env` (used by the Node.js server):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/voteit
JWT_SECRET=your_jwt_secret_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

Create `frontend/.env` (used by Vite):

```env
VITE_API_URL=http://localhost:5000
VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

> ⚠️ **Never commit `.env` files.** They are already in `.gitignore`.

---

### 3. Install Dependencies

```bash
# Root (Hardhat)
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### 4. Compile & Deploy Smart Contracts

```bash
# From root
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

After deployment, copy the contract address into `frontend/src/contracts/` and update `VITE_CONTRACT_ADDRESS` in `frontend/.env`.

---

### 5. Run the Application

**Backend** (in one terminal):

```bash
cd backend
npm run dev
```

**Frontend** (in another terminal):

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔗 Smart Contract

**Contract:** `Voting.sol`  
**Network:** Ethereum Sepolia Testnet  
**Solidity:** `0.8.24`

Key functions:

| Function | Description |
|----------|-------------|
| `createPoll(title, options[], deadline)` | Deploy a new poll on-chain |
| `vote(pollId, optionIndex)` | Cast a vote (one per wallet, enforced on-chain) |
| `getPoll(pollId)` | Read poll metadata and vote counts |
| `getResults(pollId)` | Get final vote tally per option |

---

## 🛠️ Tech Stack

### Frontend
| Library | Purpose |
|---------|---------|
| React 19 + TypeScript | UI framework |
| Vite 7 | Build tool & dev server |
| TailwindCSS 4 | Styling |
| wagmi + viem | Ethereum wallet connection |
| React Router v7 | Client-side routing |
| TanStack Query | Server state management |
| Lucide React | Icons |

### Backend
| Library | Purpose |
|---------|---------|
| Express 5 | HTTP server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens | Authentication |
| bcrypt | Password hashing |
| ethers.js v6 | Blockchain event indexing |
| TypeScript | Type safety |

### Smart Contracts
| Tool | Purpose |
|------|---------|
| Hardhat | Development & testing framework |
| Solidity 0.8.24 | Smart contract language |
| Hardhat Toolbox | Chai matchers, TypeChain, coverage |
| TypeChain | Auto-generated TypeScript types for contracts |

---

## 📜 Available Scripts

### Root (Smart Contracts)
```bash
npm test                    # Run Hardhat tests
npx hardhat compile         # Compile contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

### Backend
```bash
npm run dev    # Start with nodemon (hot reload)
npm run build  # Compile TypeScript
npm start      # Run compiled output
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

---

## 🔒 Security

- Private keys and API keys are stored in `.env` (never committed)
- `.gitignore` covers all sensitive files, build artifacts, and logs
- JWT-based authentication for all protected API routes
- On-chain voting is enforced by the smart contract (no server-side bypass possible)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Aditya Kumar](https://github.com/crazyaditya07)
