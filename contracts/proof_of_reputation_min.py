# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class Contract(gl.Contract):
    # Persistent storage collections (automatically initialized by GenVM)
    user_profiles: TreeMap[Address, str]
    usernames: TreeMap[str, Address]
    user_addresses: DynArray[Address]
    reputation_scores: TreeMap[Address, int]

    @gl.public.write
    def register_profile(self, username: str, github_url: str, linkedin_url: str, twitter_url: str, portfolio_url: str, bio: str) -> bool:
        # Basic validation
        if len(username) == 0:
            return False
        
        caller = gl.message.sender_address
        
        # Check username availability
        existing_owner = self.usernames.get(username)
        if existing_owner is not None and existing_owner != caller:
            return False
        
        # Build profile JSON string
        profile_data = {
            "username": username,
            "github_url": github_url,
            "linkedin_url": linkedin_url,
            "twitter_url": twitter_url,
            "portfolio_url": portfolio_url,
            "bio": bio
        }
        profile_json = json.dumps(profile_data)
        
        # Check if user is already registered to avoid duplicates in list
        has_profile = self.user_profiles.get(caller) is not None
        
        # Save profile mapping
        self.user_profiles[caller] = profile_json
        self.usernames[username] = caller
        
        if not has_profile:
            self.user_addresses.append(caller)
            self.reputation_scores[caller] = 0 # Default score
            
        return True

    @gl.public.view
    def get_profile(self, user: Address) -> str:
        profile = self.user_profiles.get(user)
        if profile is None:
            return ""
        return profile

    @gl.public.view
    def get_profile_by_username(self, username: str) -> str:
        user_addr = self.usernames.get(username)
        if user_addr is None:
            return ""
        return self.get_profile(user_addr)

    @gl.public.view
    def get_reputation_score(self, user: Address) -> int:
        # Default to 0 if not set
        return self.reputation_scores.get(user, 0)

    @gl.public.view
    def get_users(self) -> DynArray[Address]:
        return self.user_addresses
