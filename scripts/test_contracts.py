# test_contracts.py
# A python script to verify the business logic of proof_of_reputation.py by mocking GenLayer VM internals.

import sys
import json

# 1. Define GenLayer Mocks so we can import the contract natively in standard Python
class MockAddress:
    def __init__(self, val):
        self.val = val
    def __str__(self):
        return self.val
    def __repr__(self):
        return f"Address({self.val})"
    def __eq__(self, other):
        return str(self) == str(other)
    def __hash__(self):
        return hash(self.val)

class MockTreeMap:
    def __init__(self):
        self._data = {}
    def __getitem__(self, key):
        return self._data[key]
    def __setitem__(self, key, value):
        self._data[key] = value
    def get(self, key, default=None):
        return self._data.get(key, default)
    def __repr__(self):
        return repr(self._data)

class MockDynArray:
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

class MockVM:
    Return = MockVMReturn
    def run_nondet_unsafe(self, leader_fn, validator_fn):
        # Run leader function locally
        res = leader_fn()
        # Verify using validator
        is_ok = validator_fn(MockVMReturn(res))
        if not is_ok:
            raise ValueError("Consensus disagreement in mock VM simulation!")
        return res

class MockNondetWeb:
    def render(self, url, mode):
        return f"Mocked web scrape details for {url}"

class MockNondet:
    def __init__(self):
        self.web = MockNondetWeb()
    def exec_prompt(self, prompt, response_format):
        # Mock LLM return dictionary
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

class MockGenLayerModule:
    def __init__(self):
        self.message = MockMessage()
        self.vm = MockVM()
        self.nondet = MockNondet()
        
        # Generic storage classes
        self.TreeMap = MockTreeMap
        self.DynArray = MockDynArray
        self.Address = MockAddress
        
    class Contract:
        pass
        
    def public(self):
        pass

# Setup dynamic module mocks
genlayer_mock = MockGenLayerModule()
sys.modules['genlayer'] = genlayer_mock

# Add mock decorations to simulate GenLayer decorators
class MockPublic:
    def write(self, fn):
        return fn
    def view(self, fn):
        return fn

genlayer_mock.public = MockPublic()

# 2. Import the contract classes to run tests
# Read the file and strip rule header comment lines so it compiles cleanly in local Python
with open("contracts/proof_of_reputation.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Filter out lines starting with "# v0.2.16" or "# {" (Rule 1 annotations which aren't standard python comments)
clean_code = []
for line in lines:
    if line.strip().startswith("# v0.2.16") or line.strip().startswith("# {"):
        clean_code.append("\n")
    else:
        clean_code.append(line)

exec("".join(clean_code), globals())

# 3. Define the Test Suite
def run_tests():
    print("==========================================")
    print("🚀 RUNNING PROOF-OF-REPUTATION CONTRACT TESTS")
    print("==========================================")
    
    # Instantiate contract
    contract = Contract()
    
    # Auto-initialize storage collections (Simulating GenVM's automated storage layout setup)
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
    
    # Test 1: Register Profile
    print("👉 Test 1: Registering profiles...")
    user1 = MockAddress("0xUser1")
    user2 = MockAddress("0xUser2")
    
    # Simulate user 1 caller
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
    
    # Simulate duplicate username registration
    genlayer_mock.message.sender_address = user2
    success2 = contract.register_profile(
        username="alice", # taken
        github_url="https://github.com/bob",
        linkedin_url="",
        twitter_url="",
        portfolio_url="",
        bio="Imposer of alice"
    )
    assert success2 is False, "Should fail duplicate username registration"
    
    # Register user 2 successfully with unique username
    success3 = contract.register_profile(
        username="bob",
        github_url="https://github.com/bob",
        linkedin_url="",
        twitter_url="",
        portfolio_url="",
        bio="DeFi enthusiast"
    )
    assert success3 is True, "Bob should register successfully"
    print("✅ Profiles registered successfully.")

    # Test 2: AI Reputation Assessment
    print("👉 Test 2: Running AI reputation audit...")
    success_audit = contract.analyze_profile_reputation(user1)
    assert success_audit is True, "Audit execution should succeed"
    assert contract.reputation_scores.get(user1) == 85, "Alice score should be set by LLM mock"
    assert contract.technical_scores.get(user1) == 88, "Alice tech score should be set by LLM mock"
    print("✅ AI assessment verified.")

    # Test 3: Vouch & Endorsements
    print("👉 Test 3: Testing endorsements...")
    # Bob endorses Alice for Solidity
    genlayer_mock.message.sender_address = user2
    
    # Bob reputation is 0, so endorsement weight is 1 (minimum weight)
    contract.reputation_scores[user2] = 0
    success_endorse1 = contract.endorse_user_skill(user1, "Solidity")
    assert success_endorse1 is True, "Bob should endorse Alice successfully"
    assert contract.get_skill_weight(user1, "Solidity") == 1, "Solidity skill weight should be 1"
    
    # Check reputation boost (min boost is 1)
    # Alice base reputation was 85, now should be 86
    assert contract.reputation_scores[user1] == 86, "Alice reputation should be boosted by endorsement"
    
    # Try duplicate endorsement
    success_dup = contract.endorse_user_skill(user1, "Solidity")
    assert success_dup is False, "Duplicate endorsement should fail"
    print("✅ Endorsements verified.")

    # Test 4: DAO Proposals & Voting
    print("👉 Test 4: Testing DAO proposal submission and voting...")
    # Alice (rep = 86) creates a proposal
    genlayer_mock.message.sender_address = user1
    prop_id = contract.create_proposal(
        title="Upgrade compiler version",
        description="We should enforce Solidity 0.8.26 in all future audits"
    )
    assert prop_id == 1, "Should create proposal #1"
    assert contract.get_proposal_count() == 1, "Proposal count should be 1"
    
    # Bob (rep = 0) tries to create a proposal (fails threshold of 20)
    genlayer_mock.message.sender_address = user2
    fail_prop = contract.create_proposal("Bob's idea", "Spam desc")
    assert fail_prop == -1, "Bob should fail proposal creation threshold"
    
    # Alice votes yes on proposal #1
    genlayer_mock.message.sender_address = user1
    success_vote = contract.vote_proposal(1, True)
    assert success_vote is True, "Alice should vote successfully"
    
    prop_json = json.loads(contract.get_proposal(1))
    assert prop_json["votes_yes"] == 86, "Yes votes should equal Alice's voting weight (reputation score)"
    
    # Alice tries to vote again (fails duplicate)
    success_vote_dup = contract.vote_proposal(1, False)
    assert success_vote_dup is False, "Voter cannot vote twice"
    print("✅ DAO proposals and voting verified.")

    # Test 5: Dynamic Badges
    print("👉 Test 5: Testing dynamic badge issuance...")
    # Alice has rep=86, tech=88, cred=82, scam=3
    # Badges for Alice should include "Rising Star" (rep >= 70) and "Sybil Resistant" (scam <= 5)
    badges = contract.get_badges(user1)
    assert "Rising Star" in badges, "Alice should have Rising Star badge"
    assert "Sybil Resistant" in badges, "Alice should have Sybil Resistant badge"
    assert "Top Tier" not in badges, "Alice should NOT have Top Tier badge (rep < 90)"
    
    # Check Bob (rep=0) - no badges
    bob_badges = contract.get_badges(user2)
    assert bob_badges == "", "Bob should have no badges"
    print("✅ Dynamic badges verified.")

    print("==========================================")
    print("🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
