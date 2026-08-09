# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

def _addr_str(addr: Address) -> str:
    return str(addr)

class Contract(gl.Contract):
    # Persistent storage collections (TreeMap keys as str per Rule R19)
    user_profiles: TreeMap[str, str]
    usernames: TreeMap[str, str]
    user_addresses: DynArray[Address]
    reputation_scores: TreeMap[str, u32]

    def __init__(self):
        pass

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
            
        return True

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
    def get_users(self) -> DynArray[Address]:
        return self.user_addresses
