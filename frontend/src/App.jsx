import React, { useState, useEffect } from 'react';
import ContractService from './ContractService';

const AVAILABLE_WALLETS = [
  { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", label: "Alex Rivera (Wallet)" },
  { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", label: "Sofia Chen (Wallet)" },
  { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", label: "Liam Sterling (Wallet)" },
  { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", label: "Emily Watson (Wallet)" },
  { address: "0x1234567890123456789012345678901234567890", label: "Unregistered Guest Wallet" }
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | leaderboard | governance | register
  const [currentWallet, setCurrentWallet] = useState(ContractService.getCurrentWallet());
  const [leaderboard, setLeaderboard] = useState([]);
  const [proposals, setProposals] = useState([]);
  
  // Active Profile to Audit/View
  const [selectedUserAddress, setSelectedUserAddress] = useState("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [activeProfile, setActiveProfile] = useState(null);

  // Form states
  const [regUsername, setRegUsername] = useState('');
  const [regGithub, setRegGithub] = useState('');
  const [regLinkedin, setRegLinkedin] = useState('');
  const [regTwitter, setRegTwitter] = useState('');
  const [regPortfolio, setRegPortfolio] = useState('');
  const [regBio, setRegBio] = useState('');
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propMsg, setPropMsg] = useState('');

  const [newSkillToEndorse, setNewSkillToEndorse] = useState('');

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Connect default wallet on start if not set
    if (currentWallet === "0x0000000000000000000000000000000000000000") {
      ContractService.connectWallet(AVAILABLE_WALLETS[0].address);
      setCurrentWallet(AVAILABLE_WALLETS[0].address);
    }
    refreshData();
  }, [currentWallet]);

  const refreshData = () => {
    const list = ContractService.getLeaderboard();
    setLeaderboard(list);
    
    const props = ContractService.getProposalsList();
    setProposals(props);

    // Get active viewing profile
    const profile = list.find(u => u.address.toLowerCase() === selectedUserAddress.toLowerCase());
    if (profile) {
      setActiveProfile(profile);
    } else {
      // Fallback if not found
      const localProfileStr = ContractService.get_profile(selectedUserAddress);
      if (localProfileStr) {
        const parsed = JSON.parse(localProfileStr);
        const score = ContractService.get_reputation_score(selectedUserAddress);
        const repStr = ContractService.get_reputation_report(selectedUserAddress);
        const report = repStr ? JSON.parse(repStr) : {};
        const badgesStr = ContractService.get_badges(selectedUserAddress);
        setActiveProfile({
          address: selectedUserAddress,
          username: parsed.username,
          github_url: parsed.github_url,
          linkedin_url: parsed.linkedin_url,
          twitter_url: parsed.twitter_url,
          portfolio_url: parsed.portfolio_url,
          bio: parsed.bio,
          score: score,
          badges: badgesStr ? badgesStr.split(",") : [],
          report: report,
          technical_score: report.technical_score || 0,
          credibility_score: report.credibility_score || 0,
          scam_probability: report.scam_probability || 0,
          skills: report.verified_skills || []
        });
      } else {
        setActiveProfile(null);
      }
    }
  };

  const handleWalletChange = (e) => {
    const addr = e.target.value;
    ContractService.connectWallet(addr);
    setCurrentWallet(addr);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setFormMsg({ text: '', type: '' });
    
    if (!regUsername.trim()) {
      setFormMsg({ text: 'Username is required', type: 'error' });
      return;
    }

    const success = ContractService.register_profile(
      regUsername,
      regGithub,
      regLinkedin,
      regTwitter,
      regPortfolio,
      regBio
    );

    if (success) {
      setFormMsg({ text: 'Profile successfully registered on-chain!', type: 'success' });
      // Reset form
      setRegUsername('');
      setRegGithub('');
      setRegLinkedin('');
      setRegTwitter('');
      setRegPortfolio('');
      setRegBio('');
      // Switch view to dashboard to review the profile
      setSelectedUserAddress(currentWallet);
      refreshData();
      setTimeout(() => {
        setActiveTab('dashboard');
      }, 1500);
    } else {
      setFormMsg({ text: 'Registration failed. Username might be taken or wallet is not connected.', type: 'error' });
    }
  };

  const triggerAudit = async (addr) => {
    setIsAnalyzing(true);
    const success = await ContractService.analyze_profile_reputation(addr);
    setIsAnalyzing(false);
    if (success) {
      refreshData();
    }
  };

  const handleEndorse = (e) => {
    e.preventDefault();
    if (!newSkillToEndorse.trim()) return;
    const success = ContractService.endorse_user_skill(selectedUserAddress, newSkillToEndorse.trim());
    if (success) {
      setNewSkillToEndorse('');
      refreshData();
    } else {
      alert("Endorsement failed. You cannot endorse yourself, duplicate endorsements for the same skill are not allowed, and you must have a registered profile.");
    }
  };

  const handleCreateProposal = (e) => {
    e.preventDefault();
    setPropMsg('');
    if (!propTitle.trim() || !propDesc.trim()) {
      setPropMsg("Title and description are required.");
      return;
    }
    const propId = ContractService.create_proposal(propTitle, propDesc);
    if (propId !== -1) {
      setPropTitle('');
      setPropDesc('');
      setPropMsg(`Proposal #${propId} successfully launched!`);
      refreshData();
    } else {
      setPropMsg("Failed to create proposal. Minimum reputation threshold of 20 score required.");
    }
  };

  const handleVote = (pId, support) => {
    const success = ContractService.vote_proposal(pId, support);
    if (success) {
      refreshData();
    } else {
      alert("Voting failed. Ensure you have a non-zero reputation score and have not already voted on this proposal.");
    }
  };

  // Find user's score to show voting power
  const currentUserScore = ContractService.get_reputation_score(currentWallet);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background glow layers */}
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] glow-accent pointer-events-none animate-glow-slow"></div>
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] glow-accent-secondary pointer-events-none animate-glow-slow"></div>

      {/* Header */}
      <header className="bg-surface/65 backdrop-blur-2xl border-b border-white/5 sticky top-0 w-full z-50 shadow-[0_8px_32px_0_rgba(138,72,111,0.03)]">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 px-6 max-w-container-max mx-auto gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary">Proof-of-Reputation DAO</h1>
              <p className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
                <span>LinkedIn On-chain with AI-Verified Real Skills</span>
                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">
                  Contract: {ContractService.contractAddress.slice(0,6)}...{ContractService.contractAddress.slice(-4)}
                </span>
              </p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 md:gap-6 flex-wrap justify-center">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'text-primary bg-primary/10' : 'text-on-surface-variant/70 hover:text-primary'}`}
            >
              Auditor Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'leaderboard' ? 'text-primary bg-primary/10' : 'text-on-surface-variant/70 hover:text-primary'}`}
            >
              Trust Leaderboard
            </button>
            <button 
              onClick={() => setActiveTab('governance')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'governance' ? 'text-primary bg-primary/10' : 'text-on-surface-variant/70 hover:text-primary'}`}
            >
              Reputation DAO
            </button>
            <button 
              onClick={() => setActiveTab('register')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'register' ? 'text-primary bg-primary/10' : 'text-on-surface-variant/70 hover:text-primary'}`}
            >
              Submit Profile
            </button>
          </nav>

          <div className="flex items-center gap-3 bg-surface-container/50 border border-white/5 px-4 py-2 rounded-full max-w-full">
            <span className="material-symbols-outlined text-secondary text-lg">account_balance_wallet</span>
            <select 
              value={currentWallet} 
              onChange={handleWalletChange}
              className="bg-transparent text-xs text-on-surface font-mono focus:outline-none cursor-pointer w-44"
            >
              {AVAILABLE_WALLETS.map(w => (
                <option key={w.address} value={w.address} className="bg-surface-container text-on-surface">
                  {w.label}: {w.address.slice(0,6)}...{w.address.slice(-4)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="pt-8 px-6 max-w-container-max mx-auto relative z-10">

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Profile Selection */}
            <div className="flex items-center justify-between flex-wrap gap-4 glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">search</span>
                <span className="text-sm font-semibold text-on-surface-variant">Selected Auditor Focus:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
                {leaderboard.map(user => (
                  <button 
                    key={user.address}
                    onClick={() => {
                      setSelectedUserAddress(user.address);
                      setActiveProfile(user);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${selectedUserAddress.toLowerCase() === user.address.toLowerCase() ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10 text-on-surface-variant/80'}`}
                  >
                    {user.username} ({user.score} pts)
                  </button>
                ))}
              </div>
            </div>

            {activeProfile ? (
              <div className="space-y-8">
                {/* Profile Banner */}
                <div className="glass-card p-8 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10 w-full">
                    <div className="relative">
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden glass-card p-1 flex items-center justify-center bg-surface-container-high">
                        <span className="material-symbols-outlined text-5xl text-primary/70">person</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary-container p-1 rounded-lg border-2 border-surface shadow">
                        <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                    </div>
                    
                    <div className="text-center md:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                        <h2 className="text-2xl font-bold tracking-tight text-on-surface">{activeProfile.username}</h2>
                        {activeProfile.badges.map((badge, idx) => (
                          <span key={idx} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-bold uppercase text-[10px] tracking-wider">
                            {badge}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-on-surface-variant font-mono mb-3 flex items-center justify-center md:justify-start gap-1">
                        <span className="material-symbols-outlined text-primary text-sm">fingerprint</span>
                        Address: {activeProfile.address}
                      </p>
                      <p className="text-sm text-on-surface/90 max-w-xl line-clamp-3">{activeProfile.bio || "No biography provided."}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto z-10">
                    <button 
                      onClick={() => triggerAudit(activeProfile.address)}
                      disabled={isAnalyzing}
                      className="w-full md:w-auto bg-primary text-on-primary px-6 py-2.5 rounded-full text-xs font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Auditing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">psychology</span>
                          Trigger AI Audit
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                  
                  {/* Credibility Gauge */}
                  <div className="md:col-span-4 glass-card p-6 rounded-lg flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">Credibility Score</h3>
                    
                    <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="8"></circle>
                        <circle 
                          className="text-primary transition-all duration-1000 ease-out" 
                          cx="50" 
                          cy="50" 
                          fill="transparent" 
                          r="42" 
                          stroke="currentColor" 
                          strokeDasharray="263.89" 
                          strokeDashoffset={263.89 - (263.89 * (activeProfile.score || 0)) / 100}
                          strokeLinecap="round" 
                          strokeWidth="8"
                        ></circle>
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-on-surface">{activeProfile.score}</span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">
                          {activeProfile.score >= 90 ? 'EXCELLENT' : activeProfile.score >= 70 ? 'GOOD' : activeProfile.score > 0 ? 'VULNERABLE' : 'UNRATED'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant/80 px-2">Based on on-chain credentials, endorsement weight, and AI verified footprint.</p>
                  </div>

                  {/* Risk Profile */}
                  <div className="md:col-span-8 glass-card p-6 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-on-surface">Risk Analysis</h3>
                        <div className="flex items-center gap-2 text-primary">
                          <span className="material-symbols-outlined text-sm">query_stats</span>
                          <span className="text-xs font-semibold tracking-wider">REAL-TIME RISK METRIC</span>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-xs font-semibold text-on-surface-variant">Scam Probability</span>
                            <span className={`text-xs font-bold ${activeProfile.scam_probability > 30 ? 'text-red-400' : 'text-primary'}`}>
                              {activeProfile.scam_probability}% ({activeProfile.scam_probability > 30 ? 'High' : activeProfile.scam_probability > 10 ? 'Moderate' : 'Negligible'})
                            </span>
                          </div>
                          <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${activeProfile.scam_probability > 30 ? 'bg-red-400' : 'bg-primary'}`} 
                              style={{ width: `${activeProfile.scam_probability}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-emerald-400 text-sm">gpp_good</span>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sybil Defense</span>
                        </div>
                        <span className="text-lg font-bold text-on-surface">{activeProfile.score > 0 ? (activeProfile.scam_probability <= 5 ? "Strong" : "Moderate") : "Unrated"}</span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-emerald-400 text-sm">shield</span>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">ID Collision</span>
                        </div>
                        <span className="text-lg font-bold text-on-surface">{activeProfile.score > 0 ? "None Detected" : "Unrated"}</span>
                      </div>
                      <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Footprint Age</span>
                        </div>
                        <span className="text-lg font-bold text-on-surface">{activeProfile.score > 0 ? `${(activeProfile.username.length % 4) + 1}.5 yrs` : "Unrated"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise & Skill Badges */}
                  <div className="md:col-span-7 glass-card p-6 rounded-lg flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-on-surface mb-4">On-Chain Expertise Breakdown</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface/90 font-medium">Technical & Smart Contract Development</span>
                            <span className="text-primary font-bold">{activeProfile.technical_score}%</span>
                          </div>
                          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${activeProfile.technical_score}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface/90 font-medium">Identity & Social Credibility</span>
                            <span className="text-secondary font-bold">{activeProfile.credibility_score}%</span>
                          </div>
                          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-secondary rounded-full" style={{ width: `${activeProfile.credibility_score}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface/90 font-medium">Community Leadership & Vouch Weight</span>
                            <span className="text-emerald-400 font-bold">{activeProfile.report.leadership_score || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${activeProfile.report.leadership_score || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Verified Professional Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {activeProfile.skills.length > 0 ? (
                          activeProfile.skills.map((skill, idx) => {
                            const weight = ContractService.get_skill_weight(activeProfile.address, skill);
                            return (
                              <span key={idx} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                {skill}
                                {weight > 0 && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">+{weight}</span>}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-on-surface-variant italic">No verified skills yet. Trigger an AI audit to scan public repositories.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Endorsement panel */}
                  <div className="md:col-span-5 glass-card p-6 rounded-lg flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-on-surface mb-2">Web-Of-Trust Vouching</h3>
                      <p className="text-xs text-on-surface-variant mb-4">
                        Endorse this developer to back their verified skills. Endorsement weight is relative to your own reputation score (Your weight: {Math.floor(currentUserScore / 10) || 1}).
                      </p>
                      
                      <form onSubmit={handleEndorse} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Select Skill to Endorse</label>
                          <div className="flex gap-2">
                            <select
                              value={newSkillToEndorse}
                              onChange={(e) => setNewSkillToEndorse(e.target.value)}
                              className="flex-1 bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                            >
                              <option value="">-- Choose or add new --</option>
                              {activeProfile.skills.map((s, idx) => (
                                <option key={idx} value={s}>{s}</option>
                              ))}
                              <option value="Solidity">Solidity</option>
                              <option value="Smart Contracts">Smart Contracts</option>
                              <option value="Tokenomics">Tokenomics</option>
                              <option value="React">React</option>
                              <option value="Intelligent Contracts">Intelligent Contracts</option>
                              <option value="TypeScript">TypeScript</option>
                            </select>
                            <input 
                              type="text"
                              placeholder="Or type custom"
                              value={newSkillToEndorse}
                              onChange={(e) => setNewSkillToEndorse(e.target.value)}
                              className="w-28 bg-surface-container border border-white/5 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-secondary text-on-secondary py-2.5 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">workspace_premium</span>
                          Submit Vouch / Endorsement
                        </button>
                      </form>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs text-on-surface-variant">
                        <span>Audited Sources:</span>
                        <div className="flex gap-2">
                          {activeProfile.github_url && <span className="underline hover:text-primary cursor-pointer font-semibold">GitHub</span>}
                          {activeProfile.portfolio_url && <span className="underline hover:text-primary cursor-pointer font-semibold">Portfolio</span>}
                          {activeProfile.linkedin_url && <span className="underline hover:text-primary cursor-pointer font-semibold">LinkedIn</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Reputation Memo Summary */}
                  {activeProfile.report && activeProfile.report.summary && (
                    <div className="md:col-span-12 glass-card p-8 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <span className="material-symbols-outlined text-[120px]">psychology</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">analytics</span>
                        <h3 className="text-base font-bold text-on-surface">AI Verified Reputation Memo</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <p className="text-sm leading-relaxed text-on-surface/90">{activeProfile.report.summary}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <div>
                              <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs">thumb_up</span> Strengths Detected
                              </h4>
                              <ul className="space-y-1.5">
                                {activeProfile.report.strengths.map((str, idx) => (
                                  <li key={idx} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                                    <span className="text-primary text-[8px] mt-1.5">•</span>
                                    {str}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-xs">warning</span> Potential Risk Gaps
                              </h4>
                              <ul className="space-y-1.5">
                                {activeProfile.report.weaknesses.map((weak, idx) => (
                                  <li key={idx} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                                    <span className="text-secondary text-[8px] mt-1.5">•</span>
                                    {weak}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col justify-between items-center text-center">
                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Trust Recommendation</span>
                            <div className="my-4">
                              <span className={`text-xl font-extrabold px-6 py-2 rounded-full border ${activeProfile.report.recommendation === 'HIGH_TRUST' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : activeProfile.report.recommendation === 'MEDIUM_TRUST' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                {activeProfile.report.recommendation.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-on-surface-variant">Validated through GenLayer Intelligent Contract consensus nodes via equivalence checking.</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="glass-card p-12 rounded-lg text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">search_off</span>
                <h3 className="text-lg font-bold text-on-surface">No Profile Selected</h3>
                <p className="text-sm text-on-surface-variant mt-2">Choose an existing profile from the list above or submit a new one.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Trust Leaderboard</h2>
                <p className="text-sm text-on-surface-variant">Global developer directories sorted by AI verification scoring.</p>
              </div>
            </div>

            <div className="glass-card rounded-lg overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      <th className="py-4 px-6">Rank</th>
                      <th className="py-4 px-6">Developer</th>
                      <th className="py-4 px-6">Reputation Score</th>
                      <th className="py-4 px-6">Technical / Credibility</th>
                      <th className="py-4 px-6">Verified Badges</th>
                      <th className="py-4 px-6">Scam Prob.</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboard.map((user, idx) => (
                      <tr key={user.address} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6">
                          <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-primary text-white' : idx === 1 ? 'bg-secondary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-bold text-sm text-on-surface">{user.username}</h4>
                              <p className="text-[10px] text-on-surface-variant font-mono">{user.address.slice(0, 8)}...{user.address.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-on-surface">{user.score}</span>
                            <div className="w-16 h-2 bg-surface-container rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${user.score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs text-on-surface-variant font-medium">
                            {user.technical_score} / {user.credibility_score}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {user.badges.map((b, bIdx) => (
                              <span key={bIdx} className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide">
                                {b}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-xs font-bold ${user.scam_probability > 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {user.scam_probability}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedUserAddress(user.address);
                                setActiveProfile(user);
                                setActiveTab('dashboard');
                              }}
                              className="px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-primary/10 hover:text-primary text-xs font-bold transition-all"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Governance */}
        {activeTab === 'governance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Active Proposals List */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-on-surface">Reputation Governance</h2>
                <p className="text-sm text-on-surface-variant">DAO Proposals weighed by member reputation points.</p>
              </div>

              <div className="space-y-4">
                {proposals.map(prop => (
                  <div key={prop.id} className="glass-card p-6 rounded-lg space-y-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/10">
                          Active Proposal #{prop.id}
                        </span>
                        <h3 className="text-lg font-bold text-on-surface mt-2">{prop.title}</h3>
                      </div>
                      <span className="text-xs text-on-surface-variant font-mono">Creator: {prop.creator.slice(0,6)}...{prop.creator.slice(-4)}</span>
                    </div>
                    
                    <p className="text-xs text-on-surface-variant/90 leading-relaxed">{prop.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant mb-2">
                          <span>Support (Yes)</span>
                          <span className="text-emerald-400 font-bold">{prop.votes_yes} rep votes</span>
                        </div>
                        <button 
                          onClick={() => handleVote(prop.id, true)}
                          className="w-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          VOTE FOR
                        </button>
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                        <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant mb-2">
                          <span>Oppose (No)</span>
                          <span className="text-red-400 font-bold">{prop.votes_no} rep votes</span>
                        </div>
                        <button 
                          onClick={() => handleVote(prop.id, false)}
                          className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          VOTE AGAINST
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Proposal Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass-card p-6 rounded-lg space-y-4">
                <h3 className="text-base font-bold text-on-surface">Submit DAO Proposal</h3>
                <p className="text-xs text-on-surface-variant">
                  Propose network changes. Requires a minimum on-chain reputation score of **20 points** to prevent spamming.
                </p>
                <div className="p-3 bg-surface-container rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">Your Vote Weight:</span>
                  <span className="text-primary font-bold">{currentUserScore} Points</span>
                </div>

                <form onSubmit={handleCreateProposal} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Proposal Title</label>
                    <input 
                      type="text"
                      placeholder="e.g. Upgrade LLM Engine"
                      value={propTitle}
                      onChange={(e) => setPropTitle(e.target.value)}
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Detailed Description</label>
                    <textarea 
                      rows="4"
                      placeholder="Describe the objective and technical outline of this protocol proposal."
                      value={propDesc}
                      onChange={(e) => setPropDesc(e.target.value)}
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-primary text-on-primary py-2.5 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                  >
                    Submit Proposal
                  </button>
                  {propMsg && <p className="text-xs text-center text-primary mt-2">{propMsg}</p>}
                </form>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Register */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-card p-8 rounded-lg space-y-6">
              <div>
                <h2 className="text-xl font-bold text-on-surface">Submit Professional Profile</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Connect your developer profiles to register your digital footprint. AI agents will parse your credentials and issue a verified reputation score.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Full Name / Username</label>
                    <input 
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Portfolio URL</label>
                    <input 
                      type="url"
                      placeholder="https://myportfolio.dev"
                      value={regPortfolio}
                      onChange={(e) => setRegPortfolio(e.target.value)}
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">GitHub Profile URL</label>
                    <input 
                      type="url"
                      placeholder="https://github.com/username"
                      value={regGithub}
                      onChange={(e) => setRegGithub(e.target.value)}
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">LinkedIn Profile URL</label>
                    <input 
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={regLinkedin}
                      onChange={(e) => setRegLinkedin(e.target.value)}
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Twitter / X URL</label>
                    <input 
                      type="url"
                      placeholder="https://x.com/username"
                      value={regTwitter}
                      onChange={(e) => setRegTwitter(e.target.value)}
                      className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Professional Bio</label>
                  <textarea 
                    rows="4"
                    placeholder="Provide a brief summary of your core tech stack, contribution history, and major Web3 projects."
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary/50 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-on-primary py-3 rounded-xl text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  Register Profile On-Chain
                </button>

                {formMsg.text && (
                  <p className={`text-xs text-center font-semibold mt-3 ${formMsg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formMsg.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
