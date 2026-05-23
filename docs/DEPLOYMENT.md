# GenLayer Deployment Guide — Proof-of-Reputation DAO

This guide explains how to compile, deploy, and verify the **Proof-of-Reputation DAO** Intelligent Contract on GenLayer.

---

## Prerequisites

1. Access to the [GenLayer Studio](https://studio.genlayer.com).
2. A Web3 wallet browser extension (optional, as GenLayer Studio provides simulated accounts).
3. The contract files located in `/contracts`:
   - `proof_of_reputation_min.py` (Phase 1)
   - `proof_of_reputation.py` (Phase 2 & 3)

---

## Step-by-Step Deployment Instructions

### Phase 1: Deploying the Minimal Contract

We deploy the minimal contract first to confirm that the GenLayer compiler and compiler parsers successfully read the storage collections.

1. Open **GenLayer Studio**.
2. Create a new file named `proof_of_reputation_min.py` in the Studio workspace.
3. Copy the contents of [proof_of_reputation_min.py](file:///C:/DEV%20Panda/proofgenlayer/contracts/proof_of_reputation_min.py) and paste it into the editor.
4. Click **Compile**. Ensure that the compiler output returns `SUCCESS` and no parser warnings occur.
5. Go to the **Deploy** panel.
6. Click **Deploy Contract**. The transaction will execute and return the deployed contract address.
7. Interact with the methods in the console:
   - Call `register_profile` with test arguments.
   - Call `get_profile` to verify storage retention.

---

### Phase 2 & 3: Deploying the Full AI-Enhanced Contract

Once the environment compatibility is confirmed:

1. Create a new file in GenLayer Studio named `proof_of_reputation.py`.
2. Copy the contents of [proof_of_reputation.py](file:///C:/DEV%20Panda/proofgenlayer/contracts/proof_of_reputation.py) and paste it into the editor.
3. Click **Compile**.
4. Go to the **Deploy** panel and deploy the contract.
5. In the deployed contract UI:
   - **Step A**: Call `register_profile` with a username and your social handles.
   - **Step B**: Call `analyze_profile_reputation` passing the registered user address. This triggers the validator nodes to fetch the profiles, request LLM evaluations, perform consensus verification, and write the final scores on-chain.
   - **Step C**: Call `get_reputation_score` and `get_reputation_report` to verify the AI outputs.
   - **Step D**: Call `endorse_user_skill` from another test account address to vouch for the developer.

---

## Troubleshooting Studio Compilation Errors

- **Error: "Contract Queues/IdlenessPhase/RevealingPhase not found"**
  - *Cause*: The magic depends comment line at the top was missed or altered.
  - *Solution*: Ensure the first two lines of your file match Rule 1 exactly:
    ```python
    # v0.2.16
    # { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
    ```

- **Error: "TreeMap or DynArray not allocated"**
  - *Cause*: Reassigning collections in `__init__` (e.g. `self.users = TreeMap()`).
  - *Solution*: Remove any reassignment from the constructor. Let GenVM handle auto-initialization from the class declarations.
