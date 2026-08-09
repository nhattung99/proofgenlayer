# test_contracts.py
# Verification script for proof_of_reputation.py logic by mocking GenLayer VM environment.

import sys
import json
from dataclasses import dataclass

# 1. Define GenLayer Type and VM Mocks
class MockSizedInt(int):
    def __new__(cls, val=0):
        return super().__new__(cls, int(val))

class MockU32(MockSizedInt): pass
class MockU256(MockSizedInt): pass
class MockI32(MockSizedInt): pass
class MockBigInt(MockSizedInt): pass

class MockAddress:
    def __init__(self, val):
        self.val = str(val)
    def __str__(self):
        return self.val
    def __repr__(self):
        return f"Address({self.val})"
    def __eq__(self, other):
        return str(self) == str(other)
    def __hash__(self):
        return hash(self.val)

class MockTreeMap:
    __class_getitem__ = classmethod(lambda cls, item: cls)
    def __init__(self):
        self._data = {}
    def __getitem__(self, key):
        return self._data[str(key)]
    def __setitem__(self, key, value):
        self._data[str(key)] = value
    def get(self, key, default=None):
        return self._data.get(str(key), default)
    def __repr__(self):
        return repr(self._data)

class MockDynArray:
    __class_getitem__ = classmethod(lambda cls, item: cls)
    def __init__(self):
        self._data = []
    def append(self, val):
        self._data.append(val)
    def __len__(self):
        return len(self._data)
    def __getitem__(self, idx):
        return self._data[idx]
    def __repr__(self):
        return repr(self._data)

class MockMessage:
    def __init__(self):
        self.sender_address = MockAddress("0xDeployer")

class MockVMReturn:
    def __init__(self, val):
        self.calldata = val

class ConsensusDisagreementError(Exception):
    pass

class MockUserError(Exception):
    pass

class MockVM:
    Return = MockVMReturn
    UserError = MockUserError
    
    def run_nondet(self, leader_fn, validator_fn):
        return self.run_nondet_unsafe(leader_fn, validator_fn)

    def run_nondet_unsafe(self, leader_fn, validator_fn):
        res = leader_fn()
        is_ok = validator_fn(MockVMReturn(res))
        if not is_ok:
            return None
        return res

class MockNondetWeb:
    def render(self, url, mode):
        return f"Mocked web scrape details for {url}"

class MockNondet:
    def __init__(self):
        self.web = MockNondetWeb()
    def exec_prompt(self, prompt, response_format="json"):
        return {
            "reputation_score": 85,
            "technical_score": 88,
            "credibility_score": 82,
            "leadership_score": 80,
            "scam_probability": 3,
            "summary": "Mocked LLM profile assessment showing high competence.",
            "strengths": ["Strong smart contract development history", "Vibrant community presence"],
            "weaknesses": ["Low cross-chain project footprint"],
            "verified_skills": ["Solidity", "Smart Contracts", "Python"],
            "recommendation": "HIGH_TRUST"
        }

class MockPublic:
    def write(self, fn):
        return fn
    def view(self, fn):
        return fn

class MockContractBase:
    pass

class MockGenLayerModule:
    def __init__(self):
        self.message = MockMessage()
        self.vm = MockVM()
        self.nondet = MockNondet()
        self.TreeMap = MockTreeMap
        self.DynArray = MockDynArray
        self.Address = MockAddress
        self.u32 = MockU32
        self.u256 = MockU256
        self.i32 = MockI32
        self.bigint = MockBigInt
        self.Contract = MockContractBase
        self.public = MockPublic()
        self.allow_storage = lambda cls: cls
        self.gl = self

genlayer_mock = MockGenLayerModule()

# Setup module exports for 'from genlayer import *'
sys.modules['genlayer'] = genlayer_mock
genlayer_mock.gl = genlayer_mock

# Inject into global namespace for current file execution
globals()['gl'] = genlayer_mock
globals()['Contract'] = MockContractBase
globals()['TreeMap'] = MockTreeMap
globals()['DynArray'] = MockDynArray
globals()['Address'] = MockAddress
globals()['u32'] = MockU32
globals()['u256'] = MockU256
globals()['i32'] = MockI32
globals()['bigint'] = MockBigInt
globals()['allow_storage'] = genlayer_mock.allow_storage

# 2. Import Contract Code
with open("contracts/proof_of_reputation.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

clean_code = []
for line in lines:
    if line.strip().startswith("# v0.2.16") or line.strip().startswith("# {"):
        clean_code.append("\n")
    else:
        clean_code.append(line)

exec("".join(clean_code), globals())

# 3. Test Suite Implementation
def run_tests():
    print("==========================================")
    print("[+] RUNNING PROOF-OF-REPUTATION CONTRACT TESTS")
    print("==========================================")
    
    contract = Contract()
    
    # Auto-initialize storage collections
    contract.user_profiles = MockTreeMap()
    contract.usernames = MockTreeMap()
    contract.user_addresses = MockDynArray()
    contract.reputation_scores = MockTreeMap()
    contract.technical_scores = MockTreeMap()
    contract.credibility_scores = MockTreeMap()
    contract.scam_probabilities = MockTreeMap()
    contract.reputation_reports = MockTreeMap()
    contract.user_endorsements = MockTreeMap()
    contract.skill_endorsement_weights = MockTreeMap()
    contract.proposals = MockTreeMap()
    contract.voted_proposals = MockTreeMap()
    
    # Test 1: Profile Registration
    print("[>] Test 1: Registering profiles...")
    user1 = MockAddress("0xUser1")
    user2 = MockAddress("0xUser2")
    
    genlayer_mock.message.sender_address = user1
    success1 = contract.register_profile(
        username="alice",
        github_url="https://github.com/alice",
        linkedin_url="https://linkedin.com/in/alice",
        twitter_url="https://x.com/alice",
        portfolio_url="https://alice.dev",
        bio="Senior Solidity dev"
    )
    assert success1 is True, "Alice should register successfully"
    assert len(contract.user_addresses) == 1, "Should have 1 registered address"
    
    # Duplicate username registration attempt
    genlayer_mock.message.sender_address = user2
    success2 = contract.register_profile(
        username="alice",
        github_url="https://github.com/bob",
        linkedin_url="",
        twitter_url="",
        portfolio_url="",
        bio="Imposer of alice"
    )
    assert success2 is False, "Should reject duplicate username registration"
    
    # Register second user with unique username
    success3 = contract.register_profile(
        username="bob",
        github_url="https://github.com/bob",
        linkedin_url="",
        twitter_url="",
        portfolio_url="",
        bio="DeFi enthusiast"
    )
    assert success3 is True, "Bob should register successfully"
    print("[OK] Profiles registered successfully.")

    # Test 2: AI Reputation Assessment
    print("[>] Test 2: Running AI reputation audit...")
    success_audit = contract.analyze_profile_reputation(user1)
    assert success_audit is True, "Audit execution should succeed"
    assert contract.reputation_scores.get(user1) == 85, "Alice score should be 85"
    assert contract.technical_scores.get(user1) == 88, "Alice tech score should be 88"
    print("[OK] AI assessment verified.")

    # Test 3: Vouch & Endorsements
    print("[>] Test 3: Testing endorsements...")
    genlayer_mock.message.sender_address = user2
    
    # Bob reputation is 0, so endorsement weight is 1
    contract.reputation_scores[user2] = MockU32(0)
    success_endorse1 = contract.endorse_user_skill(user1, "Solidity")
    assert success_endorse1 is True, "Bob should endorse Alice successfully"
    assert contract.get_skill_weight(user1, "Solidity") == 1, "Solidity skill weight should be 1"
    
    # Alice reputation boost from 85 -> 86
    assert contract.reputation_scores.get(user1) == 86, "Alice reputation should be boosted to 86"
    
    # Duplicate endorsement check
    success_dup = contract.endorse_user_skill(user1, "Solidity")
    assert success_dup is False, "Duplicate endorsement should fail"
    print("[OK] Endorsements verified.")

    # Test 4: DAO Proposals & Voting
    print("[>] Test 4: Testing DAO proposal submission and voting...")
    genlayer_mock.message.sender_address = user1
    prop_id = contract.create_proposal(
        title="Upgrade compiler version",
        description="We should enforce Solidity 0.8.26 in all future audits"
    )
    assert prop_id == 1, "Should create proposal #1"
    assert contract.get_proposal_count() == 1, "Proposal count should be 1"
    
    # Bob (rep = 0) threshold check (< 20 rep)
    genlayer_mock.message.sender_address = user2
    fail_prop = contract.create_proposal("Bob's idea", "Spam desc")
    assert fail_prop == -1, "Bob should fail proposal threshold check"
    
    # Alice votes yes
    genlayer_mock.message.sender_address = user1
    success_vote = contract.vote_proposal(MockU32(1), True)
    assert success_vote is True, "Alice should vote successfully"
    
    prop_json = json.loads(contract.get_proposal(MockU32(1)))
    assert prop_json["votes_yes"] == 86, "Yes votes should equal Alice's voting weight"
    
    # Duplicate vote check
    success_vote_dup = contract.vote_proposal(MockU32(1), False)
    assert success_vote_dup is False, "Voter cannot vote twice"
    print("[OK] DAO proposals and voting verified.")

    # Test 5: Dynamic Badges
    print("[>] Test 5: Testing dynamic badge issuance...")
    badges = contract.get_badges(user1)
    assert "Rising Star" in badges, "Alice should have Rising Star badge"
    assert "Sybil Resistant" in badges, "Alice should have Sybil Resistant badge"
    assert "Top Tier" not in badges, "Alice should NOT have Top Tier badge"
    
    bob_badges = contract.get_badges(user2)
    assert bob_badges == "", "Bob should have no badges"
    print("[OK] Dynamic badges verified.")

    print("==========================================")
    print("[SUCCESS] ALL TESTS PASSED SUCCESSFULLY!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
