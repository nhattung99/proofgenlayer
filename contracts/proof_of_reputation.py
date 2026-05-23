# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

class Contract(gl.Contract):

    user_profiles: TreeMap[Address, str]
    usernames: TreeMap[str, Address]
    user_addresses: DynArray[Address]
    reputation_scores: TreeMap[Address, u256]

    admin: Address
    proposal_count: u256

    def __init__(self):
        # Bắt buộc KHÔNG được gọi gl.message.sender_address ở đây để tránh crash load schema!
        self.proposal_count = u256(0)

    @gl.public.write
    def register_profile(
        self,
        username: str,
        github_url: str,
        linkedin_url: str,
        twitter_url: str,
        portfolio_url: str,
        bio: str
    ) -> bool:

        profile_data = username + "|" + github_url + "|" + linkedin_url

        self.user_profiles[gl.message.sender_address] = profile_data
        self.usernames[username] = gl.message.sender_address
        self.user_addresses.append(gl.message.sender_address)
        self.reputation_scores[gl.message.sender_address] = u256(50)

        return True

    @gl.public.view
    def get_users(self) -> DynArray[Address]:
        return self.user_addresses
