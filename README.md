# Proof-of-Reputation DAO

> "LinkedIn On-chain with AI-Verified Real Skills and Reputation"

**Proof-of-Reputation DAO** is a decentralized protocol built on **GenLayer Intelligent Contracts** that aggregates public developer profiles, scrapes contributions, and utilizes consensus-backed AI agents to verify professional skills and issue trust metrics. It includes an on-chain professional network, web-of-trust endorsements, and a reputation-weighted voting DAO.

---

## Technical Stack & Features

- **Intelligent Contracts**: Written in Python (v0.2.16 runtime) leveraging GenLayer's Equivalence Principle. Uses `gl.nondet.web.render` to retrieve GitHub/Web portfolios and `gl.nondet.exec_prompt` to generate structured credibility memos.
- **Frontend Dashboard**: Bootstrapped with Vite, React, and Tailwind CSS. Employs the high-end light glassmorphism style of the "Luminous Protocol" brand mockup, adapted for an elegant dark UI.
- **DAO Governance**: Proposers and voters interact using on-chain reputation weight. Proposing requires a score of 20+; voting power is proportional to the voter's score.
- **Endorsements (Web-of-Trust)**: Members endorse each other's verified skills. The endorsement weight is derived from the endorser's reputation score.

---

## Directory Structure

```
C:\DEV Panda\proofgenlayer
├── /contracts             # GenLayer Intelligent Contracts
│   ├── proof_of_reputation_min.py  # Phase 1: Minimal Deployable Contract
│   └── proof_of_reputation.py      # Phase 2 & 3: Full AI & DAO Contract
├── /frontend              # React + Tailwind Dashboard Web App
├── /docs                  # Deployment and API documentation
└── /scripts               # Test scripts
```

---

## Getting Started

### 1. Compile & Deploy the Contracts

Refer to the [GenLayer Deployment Guide](file:///C:/DEV%20Panda/proofgenlayer/docs/DEPLOYMENT.md) and [API Reference](file:///C:/DEV%20Panda/proofgenlayer/docs/API.md) inside the `/docs` directory to deploy to **GenLayer Studio**.

---

### 2. Run the Frontend App Locally

To start the local React development server:

```bash
cd frontend
npm install
npm run dev
```

The app will start at `http://localhost:5173`. It runs a fully-featured on-chain simulation matching the contract signatures:
- Switch wallets to act as different developers (e.g. Alex Rivera, Sofia Chen, Liam Sterling).
- Submit new developer profiles.
- Trigger AI audits (simulates the leader-validator consensus cycle).
- Submit endorsements and see skills accumulate weighted points.
- Create and vote on DAO proposals.

---

## GenLayer Compatibility Checklist

1. **Magic Header Comments**: Included on top of files to enforce `v0.2.16` runtime.
2. **Collection Auto-initialization**: No `TreeMap()` or `DynArray()` initialization inside `__init__` constructor.
3. **No Float Types**: Core numbers (scores, probabilities, weights) are handled as integers.
4. **Safe Nondet wrapping**: All rendering and prompting operations are encapsulated in `gl.vm.run_nondet_unsafe` blocks.
5. **Class Naming**: Primary contract inherits from `gl.Contract` and is named `Contract`.
