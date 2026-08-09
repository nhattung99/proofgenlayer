// ContractService.js
// Simulates the GenLayer Contract State Engine to run locally without a node.
// Maps 1:1 to the public view/write methods defined in proof_of_reputation.py

const PREPOPULATED_PROFILES = {
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8": {
    username: "Alex Rivera",
    github_url: "https://github.com/alexrivera-eth",
    linkedin_url: "https://linkedin.com/in/alex-rivera-web3",
    twitter_url: "https://x.com/alexrivera_eth",
    portfolio_url: "https://alexrivera.dev",
    bio: "Lead Smart Contract Architect at Luminous Protocol. Designing secure Solidity infrastructure and DeFi yield optimization engines since 2021."
  },
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC": {
    username: "Sofia Chen",
    github_url: "https://github.com/sofia-chen-ai",
    linkedin_url: "https://linkedin.com/in/sofia-chen-ai",
    twitter_url: "https://x.com/sofia_chen_ai",
    portfolio_url: "https://sofiachen.io",
    bio: "AI Research Scientist & Protocol Engineer. Bridging machine learning agents with intelligent smart contracts. Contributor to decentralized AI frameworks."
  },
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906": {
    username: "Liam Sterling",
    github_url: "https://github.com/liamsterling",
    linkedin_url: "https://linkedin.com/in/liamsterling-tokenomics",
    twitter_url: "https://x.com/liam_sterling",
    portfolio_url: "https://sterling-tokenomics.xyz",
    bio: "Tokenomics Architect & Cryptoeconomic Researcher. Specializing in game-theoretic mechanism design, dynamic bonding curves, and DAO incentive structures."
  },
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65": {
    username: "Emily Watson",
    github_url: "https://github.com/emilyw-dev",
    linkedin_url: "https://linkedin.com/in/emily-watson-dev",
    twitter_url: "https://x.com/emilyw_dev",
    portfolio_url: "https://emilywatson.tech",
    bio: "Fullstack Web3 Developer and open-source enthusiast. Building responsive React frontends for dApps and integrating rust-based smart contracts."
  }
};

const PREPOPULATED_SCORES = {
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8": {
    reputation: 92,
    technical: 95,
    credibility: 90,
    scam: 1,
    report: {
      reputation_score: 92,
      technical_score: 95,
      credibility_score: 90,
      leadership_score: 88,
      scam_probability: 1,
      summary: "Alex Rivera demonstrates exceptional smart contract architecture skills. His commit history reflects high-standard coding style, extensive test suites, and participation in multiple top-tier audits.",
      strengths: ["Clean code standards", "Thorough unit testing", "Audit-ready architectural design"],
      weaknesses: ["Mainly focused on EVM ecosystems", "Limited Rust/CosmWasm footprint"],
      verified_skills: ["Solidity", "Smart Contracts", "Hardhat/Foundry", "DeFi Security"],
      recommendation: "HIGH_TRUST"
    }
  },
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC": {
    reputation: 95,
    technical: 97,
    credibility: 93,
    scam: 0,
    report: {
      reputation_score: 95,
      technical_score: 97,
      credibility_score: 93,
      leadership_score: 92,
      scam_probability: 0,
      summary: "Sofia Chen is a prominent builder in the decentralized AI space. Her work on running LLM inferences within zero-knowledge environments and sandboxed runtimes is peerless and widely cited.",
      strengths: ["Decentralized AI leadership", "Robust Python and Rust skills", "Active academic research history"],
      weaknesses: ["Sparse activity on frontend ecosystems", "Low volume of minor social posts"],
      verified_skills: ["Python", "Rust", "Machine Learning", "Zero Knowledge", "Intelligent Contracts"],
      recommendation: "HIGH_TRUST"
    }
  },
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906": {
    reputation: 81,
    technical: 80,
    credibility: 83,
    scam: 3,
    report: {
      reputation_score: 81,
      technical_score: 80,
      credibility_score: 83,
      leadership_score: 82,
      scam_probability: 3,
      summary: "Liam Sterling is a highly competent economic modeling engineer. He has designed token models for over six launched DeFi projects and has structured complex governance setups.",
      strengths: ["DeFi mechanism design", "Excellent documentation and whitepapers", "Active in governance forums"],
      weaknesses: ["Fewer public repositories with production code", "Frequent project consulting shifts"],
      verified_skills: ["Tokenomics", "Economic Simulation", "DeFi Modeling", "DAO Governance"],
      recommendation: "HIGH_TRUST"
    }
  },
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65": {
    reputation: 88,
    technical: 86,
    credibility: 89,
    scam: 2,
    report: {
      reputation_score: 88,
      technical_score: 86,
      credibility_score: 89,
      leadership_score: 85,
      scam_probability: 2,
      summary: "Emily Watson exhibits strong fullstack development abilities. Her Github repos show steady web development patterns, high-fidelity responsive design skills, and modular React structuring.",
      strengths: ["Modern frontend stack mastery", "Active open-source UI libraries contributions", "Clean component modularity"],
      weaknesses: ["Less deep-level smart contract auditing experience", "Fewer complex backend architectures"],
      verified_skills: ["React", "TailwindCSS", "Next.js", "Ethers.js/Viem", "dApp Development"],
      recommendation: "HIGH_TRUST"
    }
  }
};

const PREPOPULATED_PROPOSALS = [
  {
    id: 1,
    title: "Upgrade AI Evaluation Model to Llama 3 70B",
    description: "Upgrade the reputation analysis runner from the base model to Llama 3 70B in order to improve accuracy in parsing Github contribution patterns and detecting sybil networks.",
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    votes_yes: 173,
    votes_no: 12,
    status: "Active"
  },
  {
    id: 2,
    title: "Integrate Gitcoin Passport Score in Credibility Weights",
    description: "Introduce Gitcoin Passport as a secondary on-chain identity weight. This increases the credibility score for verified profiles by up to 10 points.",
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    votes_yes: 215,
    votes_no: 0,
    status: "Active"
  }
];

class ContractService {
  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "0xCd44E5C4cdf8572aD03354b88ce9299E0465D484";
    console.log("Proof-of-Reputation DAO GenLayer Contract Address:", this.contractAddress);
    
    // Check if there is data in localStorage, otherwise initialize with prepopulated datasets
    if (!localStorage.getItem("pgl_initialized_v2")) {
      localStorage.clear(); // Clear any old format
      
      const stringifiedProfiles = {};
      Object.keys(PREPOPULATED_PROFILES).forEach(addr => {
        stringifiedProfiles[addr] = JSON.stringify(PREPOPULATED_PROFILES[addr]);
      });
      localStorage.setItem("pgl_user_profiles", JSON.stringify(stringifiedProfiles));
      
      const usernames = {};
      Object.keys(PREPOPULATED_PROFILES).forEach(addr => {
        usernames[PREPOPULATED_PROFILES[addr].username.toLowerCase()] = addr;
      });
      localStorage.setItem("pgl_usernames", JSON.stringify(usernames));
      localStorage.setItem("pgl_user_addresses", JSON.stringify(Object.keys(PREPOPULATED_PROFILES)));
      
      localStorage.setItem("pgl_reputation_scores", JSON.stringify(
        Object.fromEntries(Object.keys(PREPOPULATED_SCORES).map(addr => [addr, PREPOPULATED_SCORES[addr].reputation]))
      ));
      localStorage.setItem("pgl_technical_scores", JSON.stringify(
        Object.fromEntries(Object.keys(PREPOPULATED_SCORES).map(addr => [addr, PREPOPULATED_SCORES[addr].technical]))
      ));
      localStorage.setItem("pgl_credibility_scores", JSON.stringify(
        Object.fromEntries(Object.keys(PREPOPULATED_SCORES).map(addr => [addr, PREPOPULATED_SCORES[addr].credibility]))
      ));
      localStorage.setItem("pgl_scam_probabilities", JSON.stringify(
        Object.fromEntries(Object.keys(PREPOPULATED_SCORES).map(addr => [addr, PREPOPULATED_SCORES[addr].scam]))
      ));
      localStorage.setItem("pgl_reputation_reports", JSON.stringify(
        Object.fromEntries(Object.keys(PREPOPULATED_SCORES).map(addr => [addr, JSON.stringify(PREPOPULATED_SCORES[addr].report)]))
      ));
      
      localStorage.setItem("pgl_user_endorsements", JSON.stringify({}));
      localStorage.setItem("pgl_skill_endorsement_weights", JSON.stringify({
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8:Solidity": 18,
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8:Smart Contracts": 25,
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC:Intelligent Contracts": 35,
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC:Rust": 12,
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906:Tokenomics": 14,
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65:React": 8
      }));
      
      localStorage.setItem("pgl_proposal_count", PREPOPULATED_PROPOSALS.length.toString());
      localStorage.setItem("pgl_proposals", JSON.stringify(
        Object.fromEntries(PREPOPULATED_PROPOSALS.map(p => [p.id, JSON.stringify(p)]))
      ));
      localStorage.setItem("pgl_voted_proposals", JSON.stringify({}));
      localStorage.setItem("pgl_initialized_v2", "true");
    }
  }

  // Helper storage fetchers
  _getData(key) {
    return JSON.parse(localStorage.getItem(key) || "{}");
  }

  _setData(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // Simulation Wallet Manager
  getCurrentWallet() {
    return localStorage.getItem("pgl_current_wallet") || "0x0000000000000000000000000000000000000000";
  }

  connectWallet(address) {
    localStorage.setItem("pgl_current_wallet", address);
    window.dispatchEvent(new Event("walletChanged"));
  }

  // --- CONTRACT METHODS (matching proof_of_reputation.py) ---

  // Write Method
  register_profile(username, github_url, linkedin_url, twitter_url, portfolio_url, bio) {
    if (!username) return false;
    const caller = this.getCurrentWallet();
    if (caller === "0x0000000000000000000000000000000000000000") return false;

    const usernames = this._getData("pgl_usernames");
    const existingOwner = usernames[username.toLowerCase()];
    if (existingOwner && existingOwner !== caller) {
      return false;
    }

    const profiles = this._getData("pgl_user_profiles");
    const profileData = {
      username,
      github_url,
      linkedin_url,
      twitter_url,
      portfolio_url,
      bio
    };

    profiles[caller] = JSON.stringify(profileData);
    usernames[username.toLowerCase()] = caller;

    this._setData("pgl_user_profiles", profiles);
    this._setData("pgl_usernames", usernames);

    const userAddresses = JSON.parse(localStorage.getItem("pgl_user_addresses") || "[]");
    if (!userAddresses.includes(caller)) {
      userAddresses.push(caller);
      localStorage.setItem("pgl_user_addresses", JSON.stringify(userAddresses));

      const repScores = this._getData("pgl_reputation_scores");
      repScores[caller] = 0;
      this._setData("pgl_reputation_scores", repScores);

      const techScores = this._getData("pgl_technical_scores");
      techScores[caller] = 0;
      this._setData("pgl_technical_scores", techScores);

      const credScores = this._getData("pgl_credibility_scores");
      credScores[caller] = 0;
      this._setData("pgl_credibility_scores", credScores);

      const scamProbs = this._getData("pgl_scam_probabilities");
      scamProbs[caller] = 0;
      this._setData("pgl_scam_probabilities", scamProbs);

      const reports = this._getData("pgl_reputation_reports");
      reports[caller] = "";
      this._setData("pgl_reputation_reports", reports);
    }
    return true;
  }

  // Write Method (AI Simulation runner)
  async analyze_profile_reputation(userAddress) {
    const profiles = this._getData("pgl_user_profiles");
    const profileStr = profiles[userAddress];
    if (!profileStr) return false;

    const profile = JSON.parse(profileStr);
    
    // Simulate web render and LLM call (AI execution consensus wait)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Determine deterministic scores based on the input features
    const seed = profile.username.length + profile.bio.length;
    const baseRep = 50 + (seed % 40);
    const techScore = 40 + ((seed * 7) % 55);
    const credScore = 60 + ((seed * 3) % 36);
    const scamProb = (seed * 9) % 15;
    const verifiedSkills = [];
    if (profile.github_url) verifiedSkills.push("Git", "Open Source");
    if (profile.bio.toLowerCase().includes("solidity")) verifiedSkills.push("Solidity", "Smart Contracts");
    if (profile.bio.toLowerCase().includes("react")) verifiedSkills.push("React", "Frontend");
    if (profile.bio.toLowerCase().includes("ai") || profile.bio.toLowerCase().includes("learning")) verifiedSkills.push("Machine Learning", "AI");
    if (profile.bio.toLowerCase().includes("token")) verifiedSkills.push("Tokenomics", "Defi Design");
    if (verifiedSkills.length === 0) verifiedSkills.push("DApp Architecture", "Web3");

    const reportData = {
      reputation_score: baseRep,
      technical_score: techScore,
      credibility_score: credScore,
      leadership_score: Math.round((baseRep + credScore) / 2),
      scam_probability: scamProb,
      summary: `AI Reputation assessment for ${profile.username}. Analyzed public contributions and social presence. Displays high consistency in contributions. Verified professional record.`,
      strengths: [`Consistent digital footprint`, `High quality open source contributions`, `Clear skill alignment`],
      weaknesses: [`Limited cross-chain experience`, `Early-stage protocol interaction`],
      verified_skills: verifiedSkills,
      recommendation: baseRep >= 80 ? "HIGH_TRUST" : baseRep >= 55 ? "MEDIUM_TRUST" : "LOW_TRUST"
    };

    // Update States
    const repScores = this._getData("pgl_reputation_scores");
    repScores[userAddress] = reportData.reputation_score;
    this._setData("pgl_reputation_scores", repScores);

    const techScores = this._getData("pgl_technical_scores");
    techScores[userAddress] = reportData.technical_score;
    this._setData("pgl_technical_scores", techScores);

    const credScores = this._getData("pgl_credibility_scores");
    credScores[userAddress] = reportData.credibility_score;
    this._setData("pgl_credibility_scores", credScores);

    const scamProbs = this._getData("pgl_scam_probabilities");
    scamProbs[userAddress] = reportData.scam_probability;
    this._setData("pgl_scam_probabilities", scamProbs);

    const reports = this._getData("pgl_reputation_reports");
    reports[userAddress] = JSON.stringify(reportData);
    this._setData("pgl_reputation_reports", reports);

    return true;
  }

  // Write Method
  endorse_user_skill(target, skill) {
    const caller = this.getCurrentWallet();
    if (caller === "0x0000000000000000000000000000000000000000" || caller === target) return false;

    const profiles = this._getData("pgl_user_profiles");
    if (!profiles[caller] || !profiles[target]) return false;

    const endorsements = this._getData("pgl_user_endorsements");
    const endKey = `${caller}:${target}:${skill}`;
    if (endorsements[endKey]) return false; // Already endorsed

    const repScores = this._getData("pgl_reputation_scores");
    const callerRep = repScores[caller] || 0;
    
    // Weight calculations
    let weight = Math.floor(callerRep / 10);
    if (weight < 1) weight = 1;

    endorsements[endKey] = true;
    this._setData("pgl_user_endorsements", endorsements);

    const skillWeights = this._getData("pgl_skill_endorsement_weights");
    const skillKey = `${target}:${skill}`;
    skillWeights[skillKey] = (skillWeights[skillKey] || 0) + weight;
    this._setData("pgl_skill_endorsement_weights", skillWeights);

    // Boost reputation score
    const targetRep = repScores[target] || 0;
    let boost = Math.floor(weight / 2);
    if (boost < 1) boost = 1;
    let newRep = targetRep + boost;
    if (newRep > 100) newRep = 100;
    repScores[target] = newRep;
    this._setData("pgl_reputation_scores", repScores);

    return true;
  }

  // Write Method
  create_proposal(title, description) {
    const caller = this.getCurrentWallet();
    const repScores = this._getData("pgl_reputation_scores");
    const callerRep = repScores[caller] || 0;

    // Minimum reputation threshold
    if (callerRep < 20) return -1;

    const count = parseInt(localStorage.getItem("pgl_proposal_count") || "0");
    const newCount = count + 1;
    localStorage.setItem("pgl_proposal_count", newCount.toString());

    const proposals = this._getData("pgl_proposals");
    const pData = {
      id: newCount,
      title,
      description,
      creator: caller,
      votes_yes: 0,
      votes_no: 0,
      status: "Active"
    };

    proposals[newCount] = JSON.stringify(pData);
    this._setData("pgl_proposals", proposals);

    return newCount;
  }

  // Write Method
  vote_proposal(proposalId, support) {
    const caller = this.getCurrentWallet();
    const repScores = this._getData("pgl_reputation_scores");
    const voterRep = repScores[caller] || 0;

    if (voterRep === 0) return false;

    const votedProposals = this._getData("pgl_voted_proposals");
    const voteKey = `${proposalId}:${caller}`;
    if (votedProposals[voteKey]) return false; // Already voted

    const proposals = this._getData("pgl_proposals");
    const propStr = proposals[proposalId];
    if (!propStr) return false;

    const prop = JSON.parse(propStr);
    if (prop.status !== "Active") return false;

    if (support) {
      prop.votes_yes += voterRep;
    } else {
      prop.votes_no += voterRep;
    }

    proposals[proposalId] = JSON.stringify(prop);
    votedProposals[voteKey] = true;

    this._setData("pgl_proposals", proposals);
    this._setData("pgl_voted_proposals", votedProposals);

    return true;
  }

  // --- VIEWS ---

  get_profile(userAddress) {
    const profiles = this._getData("pgl_user_profiles");
    return profiles[userAddress] || "";
  }

  get_profile_by_username(username) {
    const usernames = this._getData("pgl_usernames");
    const addr = usernames[username.toLowerCase()];
    if (!addr) return "";
    return this.get_profile(addr);
  }

  get_reputation_score(userAddress) {
    const repScores = this._getData("pgl_reputation_scores");
    return repScores[userAddress] || 0;
  }

  get_reputation_report(userAddress) {
    const reports = this._getData("pgl_reputation_reports");
    return reports[userAddress] || "";
  }

  get_skill_weight(userAddress, skill) {
    const skillWeights = this._getData("pgl_skill_endorsement_weights");
    const skillKey = `${userAddress}:${skill}`;
    return skillWeights[skillKey] || 0;
  }

  get_proposal(proposalId) {
    const proposals = this._getData("pgl_proposals");
    return proposals[proposalId] || "";
  }

  get_proposal_count() {
    return parseInt(localStorage.getItem("pgl_proposal_count") || "0");
  }

  get_users() {
    return JSON.parse(localStorage.getItem("pgl_user_addresses") || "[]");
  }

  get_badges(userAddress) {
    const repScores = this._getData("pgl_reputation_scores");
    const techScores = this._getData("pgl_technical_scores");
    const credScores = this._getData("pgl_credibility_scores");
    const scamProbs = this._getData("pgl_scam_probabilities");

    const rep = repScores[userAddress] || 0;
    const tech = techScores[userAddress] || 0;
    const cred = credScores[userAddress] || 0;
    const scam = scamProbs[userAddress] || 0;

    if (rep === 0) return "";

    const badges = [];
    if (rep >= 90) badges.push("Top Tier");
    if (tech >= 80 && cred >= 85) badges.push("Trusted Developer");
    if (rep >= 70) badges.push("Rising Star");
    if (scam <= 5) badges.push("Sybil Resistant");

    return badges.join(",");
  }

  // Custom Frontend Helper: returns structured statistics for the dashboard list
  getLeaderboard() {
    const users = this.get_users();
    const list = users.map(addr => {
      const profileStr = this.get_profile(addr);
      const profile = profileStr ? JSON.parse(profileStr) : {};
      const score = this.get_reputation_score(addr);
      const reportStr = this.get_reputation_report(addr);
      const report = reportStr ? JSON.parse(reportStr) : {};
      const badgesStr = this.get_badges(addr);
      
      return {
        address: addr,
        username: profile.username || "Unknown",
        github_url: profile.github_url || "",
        linkedin_url: profile.linkedin_url || "",
        twitter_url: profile.twitter_url || "",
        portfolio_url: profile.portfolio_url || "",
        bio: profile.bio || "",
        score: score,
        technical_score: this._getData("pgl_technical_scores")[addr] || 0,
        credibility_score: this._getData("pgl_credibility_scores")[addr] || 0,
        scam_probability: this._getData("pgl_scam_probabilities")[addr] || 0,
        badges: badgesStr ? badgesStr.split(",") : [],
        skills: report.verified_skills || [],
        report: report
      };
    });

    // Sort by reputation score descending
    return list.sort((a, b) => b.score - a.score);
  }

  getProposalsList() {
    const count = this.get_proposal_count();
    const list = [];
    for (let i = 1; i <= count; i++) {
      const propStr = this.get_proposal(i);
      if (propStr) {
        list.push(JSON.parse(propStr));
      }
    }
    return list;
  }
}

export default new ContractService();
