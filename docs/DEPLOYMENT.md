# GenLayer Deployment Guide — Proof-of-Reputation DAO

This guide explains how to compile, deploy, and test the **Proof-of-Reputation DAO** Intelligent Contract on GenLayer studionet using GenLayer Studio.

---

## Prerequisites

1. Open [GenLayer Studio](https://studio.genlayer.com).
2. Ensure your account in the Studio **Accounts** panel has GEN funds allocated. Click **Get GEN** / Faucet if needed to fund your account before triggering transactions.
3. Access contract files located in `contracts/`:
   - `proof_of_reputation_min.py` (Phase 1: Minimal Baseline)
   - `proof_of_reputation.py` (Phase 2 & 3: Full AI Audit & DAO Contract)

---

## Pre-Deployment Setup & Cleanup

Before compiling or deploying a new version of the contract:
1. Open GenLayer Studio.
2. In the **Storage** panel, click **Reset Storage** and perform a hard refresh (`Ctrl + Shift + R` or `Cmd + Shift + R`) to clear cached state schemas.
3. Ensure no old contract sessions are hanging.

---

## Deployment Steps

### Phase 1: Deploying the Minimal Contract

We deploy the minimal baseline contract first to confirm environment compatibility:

1. Open **GenLayer Studio**.
2. Create a new contract file named `proof_of_reputation_min.py`.
3. Copy the exact code from `contracts/proof_of_reputation_min.py` and paste it into the Studio editor.
4. Click **Compile**. Confirm that the compiler returns **SUCCESS**.
5. Go to the **Deploy** panel and click **Deploy Contract**.
6. Execute test methods:
   - Call `register_profile` with test credentials.
   - Call `get_users` and `get_profile` to verify state storage.

---

### Phase 2 & 3: Deploying the Full AI-Enhanced Contract

Once Phase 1 is validated:

1. Create a new contract file named `proof_of_reputation.py`.
2. Copy the full code from `contracts/proof_of_reputation.py` and paste it into the Studio editor.
3. Click **Compile**. Confirm **SUCCESS**.
4. Click **Deploy Contract**. Record the returned **Contract Address**.
5. Testing contract functions in Studio:
   - **Step A (`register_profile`)**: Call `register_profile` with username, GitHub URL, LinkedIn, Twitter, Portfolio, and Bio.
   - **Step B (`analyze_profile_reputation`)**: Pass the registered user address. The simulator will run the `leader_fn`, execute `gl.nondet.web.render` and `gl.nondet.exec_prompt`, run consensus validation via `validator_fn`, and record verified scores on-chain.
   - **Step C (Read Scores & Memo)**: Call `get_reputation_score`, `get_reputation_report`, and `get_badges`.
   - **Step D (`endorse_user_skill`)**: Switch to a second account address in Studio, register a profile, and endorse the first user's skill.
   - **Step E (`create_proposal` & `vote_proposal`)**: Create a proposal and vote with reputation-weighted power.

---

## Troubleshooting Checklist

- **"Could not load contract schema"**:
  - Ensure `gl.message.sender_address` is **never** called inside `__init__`.
  - Ensure `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }` is present on line 2 with no extra blank lines above.

- **"TreeMap or DynArray not allocated"**:
  - Ensure persistent collection fields are declared as class annotations (`user_profiles: TreeMap[str, str]`) and never reassigned in `__init__`.
