# API Reference — Proof-of-Reputation DAO Contract

This document provides technical signatures, arguments, and specifications for the public interfaces in `contracts/proof_of_reputation.py`.

---

## State Variables

The contract maintains the following persistent state:
- `user_profiles: TreeMap[str, str]`: User address string -> Serialized profile JSON.
- `usernames: TreeMap[str, str]`: Username (lowercase) -> User address string.
- `user_addresses: DynArray[Address]`: DynArray of all registered user addresses.
- `reputation_scores: TreeMap[str, u32]`: Address string -> Core reputation score (0-100).
- `technical_scores: TreeMap[str, u32]`: Address string -> Technical expertise score (0-100).
- `credibility_scores: TreeMap[str, u32]`: Address string -> Identity credibility score (0-100).
- `scam_probabilities: TreeMap[str, u32]`: Address string -> Sybil risk indicator (0-100).
- `reputation_reports: TreeMap[str, str]`: Address string -> Complete AI audit JSON memo string.
- `user_endorsements: TreeMap[str, bool]`: Endorsement status (`"voter_addr:target_addr:skill"` -> `bool`).
- `skill_endorsement_weights: TreeMap[str, u32]`: Accumulated endorsement weights (`"target_addr:skill"` -> `u32`).
- `proposal_count: u32`: Incremental proposal ID.
- `proposals: TreeMap[u32, str]`: Proposal ID -> Serialized proposal JSON string.
- `voted_proposals: TreeMap[str, bool]`: Voted voters (`"proposal_id:voter_addr"` -> `bool`).

---

## Write Operations (`@gl.public.write`)

### `register_profile`
Registers or updates a user profile on-chain.
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
- **Returns**: `True` if successfully registered, `False` if username is already taken by another address or username is empty.

### `analyze_profile_reputation`
Triggers consensus-backed AI audit of a user's web footprint using `gl.nondet.web.render` and `gl.nondet.exec_prompt`.
```python
def analyze_profile_reputation(self, user: Address) -> bool
```
- **Returns**: `True` if consensus is reached across validators and scores are stored on-chain; `False` if profile is missing or consensus fails.

### `endorse_user_skill`
Endorses a specific skill for a registered developer.
```python
def endorse_user_skill(self, target: Address, skill: str) -> bool
```
- **Returns**: `True` on success. Fails if voter equals target, voter or target has no profile, or duplicate endorsement for skill exists.

### `create_proposal`
Submits a DAO governance proposal.
```python
def create_proposal(self, title: str, description: str) -> i32
```
- **Returns**: Incremental proposal ID (`i32`) or `-1` if caller's reputation score is under the required threshold of 20.

### `vote_proposal`
Casts a vote on an active proposal weighted by the voter's reputation score.
```python
def vote_proposal(self, proposal_id: u32, support: bool) -> bool
```
- **Returns**: `True` if vote recorded, `False` if voter has 0 reputation, proposal inactive, or voter already voted.

---

## View Operations (`@gl.public.view`)

### `get_profile`
Retrieves serialized profile JSON string for a user address.
```python
def get_profile(self, user: Address) -> str
```

### `get_profile_by_username`
Retrieves serialized profile JSON string by registered username.
```python
def get_profile_by_username(self, username: str) -> str
```

### `get_reputation_score`
Returns overall on-chain reputation score (`u32`).
```python
def get_reputation_score(self, user: Address) -> u32
```

### `get_reputation_report`
Retrieves full verified AI report JSON string for a user address.
```python
def get_reputation_report(self, user: Address) -> str
```

### `get_skill_weight`
Returns aggregated endorsement score (`u32`) for a user's skill.
```python
def get_skill_weight(self, user: Address, skill: str) -> u32
```

### `get_proposal`
Retrieves proposal JSON string by proposal ID (`u32`).
```python
def get_proposal(self, proposal_id: u32) -> str
```

### `get_proposal_count`
Returns current total proposal count (`u32`).
```python
def get_proposal_count(self) -> u32
```

### `get_users`
Returns dynamic array of all registered user addresses (`DynArray[Address]`).
```python
def get_users(self) -> DynArray[Address]
```

### `get_badges`
Retrieves comma-separated string list of earned badges (`"Top Tier"`, `"Trusted Developer"`, `"Rising Star"`, `"Sybil Resistant"`).
```python
def get_badges(self, user: Address) -> str
```
