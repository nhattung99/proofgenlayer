# Proof-of-Reputation DAO

> "LinkedIn On-chain with AI-Verified Real Skills and Reputation"

**Proof-of-Reputation DAO** is an AI-powered decentralized professional network and reputation protocol built on **GenLayer Intelligent Contracts**. The platform allows software engineers and Web3 builders to register public developer identities (GitHub, LinkedIn, Twitter/X, Portfolios) and receive verifiable, consensus-backed AI credibility scores, sybil-resistance metrics, and skill badges. It also powers a reputation-weighted Web3 governance DAO.

---

## ⚡ Why This Project CANNOT Exist Without GenLayer

Traditional smart contracts on EVM chains are strictly deterministic and isolated from external internet data. They cannot natively fetch GitHub commit histories, analyze portfolio text, or run LLM inference. 

If this platform were built using standard off-chain web servers or centralized AI APIs, the reputation scores could be easily tampered with, fake profiles could be injected, or centralized servers could censor users.

**GenLayer makes Proof-of-Reputation DAO possible on-chain:**
1. **Web Access (`gl.nondet.web.render`)**: Intelligent Contracts fetch public web profiles and repository contents directly during contract execution.
2. **AI Inference (`gl.nondet.exec_prompt`)**: LLMs evaluate code quality, project consistency, and sybil probability natively.
3. **Equivalence Principle & Consensus (`gl.vm.run_nondet`)**: Multiple validator nodes independently fetch the web data, prompt the LLM, and verify the credibility score within tolerance bounds before finalizing state updates on-chain.

---

## 🚀 Deployment & Live Resources

- **GenLayer Network**: Deployed to GenLayer studionet via GenLayer Studio
- **Deployed Intelligent Contract Address**: `0x9d14942991aF4ca901170990134e3Fa7AfDbCBEc`
- **GenLayer Explorer**: [https://genlayer-explorer.vercel.app](https://genlayer-explorer.vercel.app)
- **Live Frontend dApp**: [https://proofgenlayer.vercel.app](https://proofgenlayer.vercel.app)
- **GitHub Repository**: [https://github.com/nhattung99/proofgenlayer](https://github.com/nhattung99/proofgenlayer)

---

## 📐 Technical Architecture & Features

- **Intelligent Contracts** (`contracts/proof_of_reputation.py`):
  - Written in Python (`py-genlayer` v0.2.16 runtime).
  - Uses `gl.nondet.web.render` to extract technical footprint data.
  - Uses `gl.nondet.exec_prompt` with strict JSON schema outputs.
  - Implements custom leader-validator consensus with tolerance checks.
- **Web-of-Trust Endorsements**: Developers endorse each other's verified skills. Endorsement voting weight scales with the endorser's reputation score.
- **Reputation-Weighted Governance**: DAO proposals require a minimum reputation threshold of 20+ to submit. Voting power is 1:1 proportional to on-chain reputation scores.
- **Dynamic Badges**: Automatically issued on-chain (`Top Tier`, `Trusted Developer`, `Rising Star`, `Sybil Resistant`).

---

## 📁 Repository Structure

```
.
├── contracts/
│   ├── proof_of_reputation_min.py  # Phase 1: Minimal Deployable Baseline
│   └── proof_of_reputation.py      # Phase 2 & 3: Full AI Audit & DAO Contract
├── frontend/                       # Vite + React + Tailwind Dashboard App
├── docs/                           # Documentation
│   ├── DEPLOYMENT.md               # GenLayer Studio Deployment Guide
│   └── API.md                      # Contract API Reference
└── scripts/
    └── test_contracts.py           # Python Contract Mock Test Suite
```

---

## 🛠️ Getting Started

### 1. Running the Contract Mock Test Suite
To verify the contract business logic and mock consensus locally:
```bash
python scripts/test_contracts.py
```

### 2. Deploying to GenLayer Studio
Follow the step-by-step instructions in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### 3. Running the Frontend App Locally
```bash
cd frontend
npm install
npm run dev
```
The app will start at `http://localhost:5173`.

---

## 🔒 GenLayer Compatibility Checklist

- [x] **Header Pragma**: `# v0.2.16` and `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }` on line 1-2.
- [x] **No Storage Collection Reassignment**: `TreeMap` and `DynArray` collections declared at class level, never reassigned in `__init__`.
- [x] **Constructor Safety**: `__init__` does not reference `gl.message.sender_address` or storage.
- [x] **Explicit Integer Storage**: Uses `u32` / `i32` for scores, weights, and proposal IDs; no bare `int` or `float`.
- [x] **TreeMap String Keys**: All `TreeMap` collections use `str` keys for schema stability (Rule R19/R20).
- [x] **Equivalence Principle Wrapping**: Non-deterministic operations run inside `leader_fn()` and are verified by `validator_fn()` via `gl.vm.run_nondet`.
