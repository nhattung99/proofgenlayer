# API Reference — Proof-of-Reputation DAO Contract

This document provides technical signatures, arguments, and specifications for the public interfaces in `proof_of_reputation.py`.

---

## State Variables

The contract maintains the following persistent state:
- `user_profiles: TreeMap[Address, str]`: Serialized profile JSON.
- `usernames: TreeMap[str, Address]`: Username index to address.
- `user_addresses: DynArray[Address]`: Array of all registered user addresses.
- `reputation_scores: TreeMap[Address, int]`: Core on-chain reputation scores (0-100).
- `technical_scores: TreeMap[Address, int]`: AI-verified technical expertise scores (0-100).
- `credibility_scores: TreeMap[Address, int]`: AI-verified identity credibility scores (0-100).
- `scam_probabilities: TreeMap[Address, int]`: AI-verified sybil risk indicators (0-100).
- `reputation_reports: TreeMap[Address, str]`: JSON string representing the complete AI audit report.
- `user_endorsements: TreeMap[str, bool]`: Tracks skill endorsement status ("voter:target:skill").
- `skill_endorsement_weights: TreeMap[str, int]`: Accumulated endorsement weights ("target:skill").
- `proposal_count: int`: Incremental proposal ID.
- `proposals: TreeMap[int, str]`: Active proposals JSON.
- `voted_proposals: TreeMap[str, bool]`: Tracks voted voters ("proposalId:voter").

---

## Write Operations (`@gl.public.write`)

### `register_profile`
Registers or updates a user profile.
```python
def register_profile(
    self, 
    username: str, 
    github_url: str, 
    linkedin_url: str, 
    twitter_url: str, 
    portfolio_url: str, 
    bio: str
) -> bool
```
- **Returns**: `True` if successfully registered, `False` if username is already taken.

### `analyze_profile_reputation`
Triggers consensus-backed AI audit of a user's web footprint.
```python
def analyze_profile_reputation(self, user: Address) -> bool
```
- **Returns**: `True` if audit successfully compiles and records.

### `endorse_user_skill`
Endorses a specific skill for a registered user.
```python
def endorse_user_skill(self, target: Address, skill: str) -> bool
```
- **Returns**: `True` on success. Fails if voter has no profile or has already voted.

### `create_proposal`
Submits a governance proposal.
```python
def create_proposal(self, title: str, description: str) -> int
```
- **Returns**: Incremental proposal ID or `-1` if caller's reputation is under the required threshold (20).

### `vote_proposal`
Casts a vote with reputation-weighted power.
```python
def vote_proposal(self, proposal_id: int, support: bool) -> bool
```

---

## View Operations (`@gl.public.view`)

### `get_profile`
Retrieves serialized profile JSON string.
```python
def get_profile(self, user: Address) -> str
```

### `get_reputation_score`
Returns overall score.
```python
def get_reputation_score(self, user: Address) -> int
```

### `get_reputation_report`
Retrieves verified AI report JSON string.
```python
def get_reputation_report(self, user: Address) -> str
```

### `get_skill_weight`
Returns aggregated endorsement score.
```python
def get_skill_weight(self, user: Address, skill: str) -> int
```

### `get_proposal`
Retrieves proposal details JSON.
```python
def get_proposal(self, proposal_id: int) -> str
```

### `get_badges`
Retrieves comma-separated string list of earned badges.
```python
def get_badges(self, user: Address) -> str
```
