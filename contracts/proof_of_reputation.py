# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

def _addr_str(addr: Address) -> str:
    return str(addr)

class Contract(gl.Contract):
    # Persistent storage collections (TreeMap keys as str per Rule R19)
    user_profiles: TreeMap[str, str] # Address str -> serialized JSON profile
    usernames: TreeMap[str, str] # Username (lowercase) -> Address str
    user_addresses: DynArray[Address] # List of all user addresses
    reputation_scores: TreeMap[str, u32] # Address str -> overall score (0-100)
    
    # Detailed AI Metrics
    technical_scores: TreeMap[str, u32] # Address str -> technical capability
    credibility_scores: TreeMap[str, u32] # Address str -> identity credibility
    scam_probabilities: TreeMap[str, u32] # Address str -> scam likelihood
    reputation_reports: TreeMap[str, str] # Address str -> full AI JSON memo
    
    # Endorsements
    user_endorsements: TreeMap[str, bool] # "voter_addr:target_addr:skill" -> has_endorsed
    skill_endorsement_weights: TreeMap[str, u32] # "target_addr:skill" -> accumulated_weight
    
    # DAO Governance
    proposal_count: u32
    proposals: TreeMap[u32, str] # proposal_id -> serialized JSON proposal
    voted_proposals: TreeMap[str, bool] # "proposal_id:voter_addr" -> has_voted

    def __init__(self):
        # GenVM auto-initializes storage collections. Do not reassign TreeMap/DynArray here.
        self.proposal_count = u32(0)

    @gl.public.write
    def register_profile(self, username: str, github_url: str, linkedin_url: str, twitter_url: str, portfolio_url: str, bio: str) -> bool:
        if len(username.strip()) == 0:
            return False
        
        caller = gl.message.sender_address
        caller_str = _addr_str(caller)
        uname_lower = username.strip().lower()
        
        existing_owner = self.usernames.get(uname_lower)
        if existing_owner is not None and existing_owner != caller_str:
            return False
        
        # Build profile data saving all 6 fields
        profile_data = {
            "username": username.strip(),
            "github_url": github_url.strip(),
            "linkedin_url": linkedin_url.strip(),
            "twitter_url": twitter_url.strip(),
            "portfolio_url": portfolio_url.strip(),
            "bio": bio.strip()
        }
        profile_json = json.dumps(profile_data)
        
        has_profile = self.user_profiles.get(caller_str) is not None
        self.user_profiles[caller_str] = profile_json
        self.usernames[uname_lower] = caller_str
        
        if not has_profile:
            self.user_addresses.append(caller)
            self.reputation_scores[caller_str] = u32(0)
            self.technical_scores[caller_str] = u32(0)
            self.credibility_scores[caller_str] = u32(0)
            self.scam_probabilities[caller_str] = u32(0)
            self.reputation_reports[caller_str] = ""
            
        return True

    @gl.public.write
    def analyze_profile_reputation(self, user: Address) -> bool:
        user_str = _addr_str(user)
        profile_str = self.user_profiles.get(user_str)
        if profile_str is None or len(profile_str) == 0:
            return False
        
        # Read profile JSON from storage prior to nondet execution
        profile = json.loads(profile_str)
        username = profile.get("username", "")
        github_url = profile.get("github_url", "")
        portfolio_url = profile.get("portfolio_url", "")
        linkedin_url = profile.get("linkedin_url", "")
        twitter_url = profile.get("twitter_url", "")
        bio = profile.get("bio", "")

        # Define non-deterministic leader function
        def leader_fn():
            github_content = ""
            if len(github_url) > 0:
                try:
                    github_content = gl.nondet.web.render(github_url, mode="text")
                except Exception:
                    github_content = "GitHub fetch unavailable."

            portfolio_content = ""
            if len(portfolio_url) > 0:
                try:
                    portfolio_content = gl.nondet.web.render(portfolio_url, mode="text")
                except Exception:
                    portfolio_content = "Portfolio fetch unavailable."

            prompt = f"""
            Analyze the following developer profile and technical presence to assess skill and reputational validity:
            Username: {username}
            Bio: {bio}
            GitHub: {github_url}
            LinkedIn: {linkedin_url}
            Twitter: {twitter_url}
            Portfolio Website: {portfolio_url}

            Scraped Web Insights:
            - GitHub sample info: {github_content[:1500]}
            - Portfolio sample info: {portfolio_content[:1500]}

            Provide an evaluation of the user's expertise, consistency, and risk factors. Output a strict JSON structure.
            Your output MUST match this format exactly, with no additional formatting or code fences:
            {{
              "reputation_score": <int 0-100>,
              "technical_score": <int 0-100>,
              "credibility_score": <int 0-100>,
              "leadership_score": <int 0-100>,
              "scam_probability": <int 0-100>,
              "summary": "<2-3 sentence overview>",
              "strengths": ["<strength 1>", "<strength 2>"],
              "weaknesses": ["<weakness 1>", "<weakness 2>"],
              "verified_skills": ["<skill 1>", "<skill 2>"],
              "recommendation": "<HIGH_TRUST | MEDIUM_TRUST | LOW_TRUST>"
            }}
            """
            return gl.nondet.exec_prompt(prompt, response_format="json")

        # Define consensus validator function
        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            
            leader_data = leader_res.calldata
            if not isinstance(leader_data, dict):
                return False
            
            # Check JSON schema compliance
            keys = ["reputation_score", "technical_score", "credibility_score", 
                    "leadership_score", "scam_probability", "summary", 
                    "strengths", "weaknesses", "verified_skills", "recommendation"]
            for k in keys:
                if k not in leader_data:
                    return False
            
            # Check score bounds
            try:
                rep_s = int(leader_data["reputation_score"])
                tech_s = int(leader_data["technical_score"])
                cred_s = int(leader_data["credibility_score"])
                lead_s = int(leader_data["leadership_score"])
                scam_p = int(leader_data["scam_probability"])
            except Exception:
                return False

            if not (0 <= rep_s <= 100 and 0 <= tech_s <= 100 and 0 <= cred_s <= 100 and 0 <= lead_s <= 100 and 0 <= scam_p <= 100):
                return False

            # Independently re-run leader_fn
            try:
                my_data = leader_fn()
                if not isinstance(my_data, dict):
                    return False
                my_rep = int(my_data.get("reputation_score", 0))
            except Exception:
                return False

            # Meaning comparison: tolerance of +-15 on primary score or matching recommendation
            score_diff = abs(my_rep - rep_s)
            if score_diff > 15 and my_data.get("recommendation") != leader_data.get("recommendation"):
                return False

            return True

        # Use gl.vm.run_nondet if present, else fallback to gl.vm.run_nondet_unsafe
        if hasattr(gl.vm, "run_nondet"):
            report_data = gl.vm.run_nondet(leader_fn, validator_fn)
        else:
            report_data = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

        if report_data is None:
            return False

        # Write agreed scores to storage
        self.reputation_scores[user_str] = u32(int(report_data["reputation_score"]))
        self.technical_scores[user_str] = u32(int(report_data["technical_score"]))
        self.credibility_scores[user_str] = u32(int(report_data["credibility_score"]))
        self.scam_probabilities[user_str] = u32(int(report_data["scam_probability"]))
        self.reputation_reports[user_str] = json.dumps(report_data)

        return True

    @gl.public.write
    def endorse_user_skill(self, target: Address, skill: str) -> bool:
        caller_str = _addr_str(gl.message.sender_address)
        target_str = _addr_str(target)

        if caller_str == target_str:
            return False
        
        if self.user_profiles.get(caller_str) is None or self.user_profiles.get(target_str) is None:
            return False
            
        endorsement_key = f"{caller_str}:{target_str}:{skill}"
        if self.user_endorsements.get(endorsement_key, False):
            return False
            
        caller_rep = int(self.reputation_scores.get(caller_str, u32(0)))
        weight = caller_rep // 10
        if weight < 1:
            weight = 1
            
        self.user_endorsements[endorsement_key] = True
        
        skill_key = f"{target_str}:{skill}"
        curr_weight = int(self.skill_endorsement_weights.get(skill_key, u32(0)))
        self.skill_endorsement_weights[skill_key] = u32(curr_weight + weight)
        
        curr_rep = int(self.reputation_scores.get(target_str, u32(0)))
        boost = weight // 2
        if boost < 1:
            boost = 1
        new_rep = min(100, curr_rep + boost)
        self.reputation_scores[target_str] = u32(new_rep)
        
        return True

    @gl.public.write
    def create_proposal(self, title: str, description: str) -> i32:
        caller_str = _addr_str(gl.message.sender_address)
        caller_rep = int(self.reputation_scores.get(caller_str, u32(0)))
        
        if caller_rep < 20:
            return i32(-1)
            
        new_count = int(self.proposal_count) + 1
        self.proposal_count = u32(new_count)
        p_id = u32(new_count)
        
        proposal_data = {
            "id": new_count,
            "title": title,
            "description": description,
            "creator": caller_str,
            "votes_yes": 0,
            "votes_no": 0,
            "status": "Active"
        }
        
        self.proposals[p_id] = json.dumps(proposal_data)
        return i32(new_count)

    @gl.public.write
    def vote_proposal(self, proposal_id: u32, support: bool) -> bool:
        caller_str = _addr_str(gl.message.sender_address)
        voter_rep = int(self.reputation_scores.get(caller_str, u32(0)))
        
        if voter_rep == 0:
            return False
            
        vote_key = f"{int(proposal_id)}:{caller_str}"
        if self.voted_proposals.get(vote_key, False):
            return False
            
        prop_str = self.proposals.get(proposal_id)
        if prop_str is None or len(prop_str) == 0:
            return False
            
        prop = json.loads(prop_str)
        if prop.get("status") != "Active":
            return False
            
        if support:
            prop["votes_yes"] += voter_rep
        else:
            prop["votes_no"] += voter_rep
            
        self.proposals[proposal_id] = json.dumps(prop)
        self.voted_proposals[vote_key] = True
        
        return True

    # View Methods
    @gl.public.view
    def get_profile(self, user: Address) -> str:
        return self.user_profiles.get(_addr_str(user), "")

    @gl.public.view
    def get_profile_by_username(self, username: str) -> str:
        addr_str = self.usernames.get(username.strip().lower())
        if addr_str is None:
            return ""
        return self.user_profiles.get(addr_str, "")

    @gl.public.view
    def get_reputation_score(self, user: Address) -> u32:
        return self.reputation_scores.get(_addr_str(user), u32(0))

    @gl.public.view
    def get_reputation_report(self, user: Address) -> str:
        return self.reputation_reports.get(_addr_str(user), "")

    @gl.public.view
    def get_skill_weight(self, user: Address, skill: str) -> u32:
        skill_key = f"{_addr_str(user)}:{skill}"
        return self.skill_endorsement_weights.get(skill_key, u32(0))

    @gl.public.view
    def get_proposal(self, proposal_id: u32) -> str:
        return self.proposals.get(proposal_id, "")

    @gl.public.view
    def get_proposal_count(self) -> u32:
        return self.proposal_count

    @gl.public.view
    def get_users(self) -> DynArray[Address]:
        return self.user_addresses

    @gl.public.view
    def get_badges(self, user: Address) -> str:
        user_str = _addr_str(user)
        rep = int(self.reputation_scores.get(user_str, u32(0)))
        tech = int(self.technical_scores.get(user_str, u32(0)))
        cred = int(self.credibility_scores.get(user_str, u32(0)))
        scam = int(self.scam_probabilities.get(user_str, u32(0)))
        
        if rep == 0:
            return ""
            
        badges = []
        if rep >= 90:
            badges.append("Top Tier")
        if tech >= 80 and cred >= 85:
            badges.append("Trusted Developer")
        if rep >= 70:
            badges.append("Rising Star")
        if scam <= 5:
            badges.append("Sybil Resistant")
            
        return ",".join(badges)
