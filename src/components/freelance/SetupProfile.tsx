import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Shield, Briefcase, FileText, Check, Plus, Trash2, 
  Cpu, Loader2, ArrowRight, RefreshCw, Layers, Image as ImageIcon, Link as LinkIcon 
} from 'lucide-react';

interface SetupProfileProps {
  role: 'buyer' | 'seller';
  onCompleteProfile: (profileData: any, portfolioData?: any) => Promise<void>;
  onSkip: () => void;
  onBack: () => void;
  checkAndDeductCredits?: (cost: number, description: string) => Promise<boolean>;
}

const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];

const SELLER_QUICK_PROMPTS = [
  "Visual video editor specializing in fast-paced CapCut edits and viral TikTok hooks with motion assets.",
  "Instagram Reels organic growth specialist offering full strategy audit and dynamic editing layouts.",
  "Twitter ghostwriter and copywriter focused on translating complex tech topics into highly engaging threads."
];

const BUYER_QUICK_PROMPTS = [
  "Founder of ZenoMedia seeking YouTube Shorts hook editors and scriptwriters with fast turnaround.",
  "E-commerce brand owner hiring TikTok Shop UGC creators to generate daily high-retention video ads.",
  "Fitness influencer looking for an experienced copywriter to maintain a daily engaging Twitter flow."
];

export const SetupProfile: React.FC<SetupProfileProps> = ({ role, onCompleteProfile, onSkip, onBack, checkAndDeductCredits }) => {
  const [setupMode, setSetupMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Form states (manually editable or populated by AI)
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  
  // Portfolio states (Seller only)
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioMediaURL, setPortfolioMediaURL] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleApplyQuickPrompt = (prompt: string) => {
    setAiPrompt(prompt);
  };

  const handleRunChidonAI = async () => {
    if (!aiPrompt.trim()) {
      setErrorText("Please write or select a concept/prompt first.");
      return;
    }

    if (checkAndDeductCredits) {
      const allowed = await checkAndDeductCredits(1, `Freelance Onboarding AI Profile Setup`);
      if (!allowed) return;
    }

    setGenerating(true);
    setErrorText('');
    setAiSuccess(false);

    const systemContext = role === 'buyer' 
      ? `Generate a professional Chidon Freelance BUYER brand profile in valid JSON format only.
         The JSON must contain strictly these keys: "fullName" (string, e.g. a company or brand name), "bio" (string, tailored to what social media assistance they need), and "platforms" (array of strings, selecting from "Instagram", "TikTok", "YouTube", "Twitter").
         Focus on the user input prompt: "${aiPrompt}".`
      : `Generate a professional Chidon Freelance SELLER creator profile and portfolio piece in valid JSON format only.
         The JSON must contain strictly these keys: "fullName" (string, a catchy professional name), "bio" (string, optimized for social marketing bio), "skills" (array of strings, e.g. 3-4 specialized tools or niches), "experienceYears" (number from 1 to 10), and "portfolio" (object containing: "title" [string], "description" [string], "mediaURL" [string, use a real unsplash url related to video/editing/social media workspace], "link" [string, e.g. a tiktok/youtube reference link]).
         Focus on the user input prompt: "${aiPrompt}".`;

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: systemContext, model: "gemini-3.6-flash" }),
      });

      if (!response.ok) {
        throw new Error("Gemini AI API returned a non-ok response status.");
      }

      const data = await response.json();
      let responseText = data.text || "";
      
      // Clean markdown if present
      if (responseText.includes("```json")) {
        responseText = responseText.split("```json")[1].split("```")[0].trim();
      } else if (responseText.includes("```")) {
        responseText = responseText.split("```")[1].split("```")[0].trim();
      }

      const parsed = JSON.parse(responseText.trim());

      // Update state with AI values
      if (parsed.fullName) setFullName(parsed.fullName);
      if (parsed.bio) setBio(parsed.bio);
      
      if (role === 'buyer') {
        if (Array.isArray(parsed.platforms)) {
          setSelectedPlatforms(parsed.platforms.filter((p: string) => PLATFORM_OPTIONS.includes(p)));
        }
      } else {
        if (Array.isArray(parsed.skills)) {
          setSkills(parsed.skills);
        }
        if (typeof parsed.experienceYears === 'number') {
          setExperienceYears(parsed.experienceYears);
        }
        if (parsed.portfolio) {
          if (parsed.portfolio.title) setPortfolioTitle(parsed.portfolio.title);
          if (parsed.portfolio.description) setPortfolioDesc(parsed.portfolio.description);
          if (parsed.portfolio.mediaURL) setPortfolioMediaURL(parsed.portfolio.mediaURL);
          if (parsed.portfolio.link) setPortfolioLink(parsed.portfolio.link);
        }
      }

      setAiSuccess(true);
      setSetupMode('manual'); // Transition to review & save manually
    } catch (err: any) {
      console.error(err);
      setErrorText("Chidon AI was unable to parse structured JSON. Please retry or enter manual parameters.");
    } finally {
      setGenerating(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorText("Full Name / Brand Name is required.");
      return;
    }

    setSaving(true);
    setErrorText('');

    try {
      const profileData = {
        fullName: fullName.trim(),
        bio: bio.trim(),
        role: role,
        avatarURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(fullName)}`,
        rating: 5.0,
        credits: role === 'seller' ? 100 : 250, // Sellers get some seed capital, Buyers get hire capital
        skills: role === 'seller' ? skills : [],
        experienceYears: role === 'seller' ? experienceYears : undefined,
        platforms: role === 'buyer' ? selectedPlatforms : undefined,
        createdAt: new Date()
      };

      let portfolioData = null;
      if (role === 'seller' && portfolioTitle.trim()) {
        portfolioData = {
          title: portfolioTitle.trim(),
          description: portfolioDesc.trim(),
          mediaURL: portfolioMediaURL.trim() || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop',
          link: portfolioLink.trim() || 'https://tiktok.com',
          createdAt: new Date()
        };
      }

      await onCompleteProfile(profileData, portfolioData);
    } catch (err: any) {
      setErrorText(err.message || "Failed to persist profile configuration node. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center p-6 bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-white rounded-3xl border border-gray-200 dark:border-slate-800 text-left overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Skip option */}
      <button
        onClick={onSkip}
        id="btn-profile-skip"
        className="absolute top-6 right-6 text-xs font-mono font-bold tracking-wider text-gray-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer transition-colors"
      >
        Skip AI Setup ⚡
      </button>

      {/* Back button */}
      <button
        onClick={onBack}
        id="btn-profile-back"
        className="absolute top-6 left-6 text-xs font-mono font-bold text-gray-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
      >
        <span>← Back</span>
      </button>

      <div className="max-w-2xl w-full bg-gray-50/80 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 mt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-850 pb-4">
          <div className="space-y-1">
            <span className={`text-[10px] font-mono font-black border px-2.5 py-1 rounded-full uppercase tracking-widest ${
              role === 'buyer' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
            }`}>
              Chidon AI Setup Portal
            </span>
            <h2 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase">
              Configure Your sovereign Profile
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-gray-200 dark:bg-slate-900/80 p-1 rounded-xl">
            <button
              onClick={() => setSetupMode('ai')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase font-black rounded-lg transition-all ${
                setupMode === 'ai' 
                  ? 'bg-white dark:bg-slate-950 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              AI Magic
            </button>
            <button
              onClick={() => setSetupMode('manual')}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase font-black rounded-lg transition-all ${
                setupMode === 'manual' 
                  ? 'bg-white dark:bg-slate-950 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              Manual Review
            </button>
          </div>
        </div>

        {errorText && (
          <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 rounded-xl text-xs text-red-700 dark:text-red-300">
            ⚠️ {errorText}
          </div>
        )}

        <AnimatePresence mode="wait">
          {setupMode === 'ai' ? (
            <motion.div
              key="ai-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-mono font-extrabold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                  Describe what you want to achieve or your primary skills
                </label>
                <textarea
                  placeholder={role === 'buyer' 
                    ? "e.g. I am the director of ZenoMedia, looking for fast-paced viral CapCut editors for our daily lifestyle TikTok brand."
                    : "e.g. I edit fast gaming shorts with neuromorphic sound effects, looking to edit for top content creators."
                  }
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="w-full h-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-cyan-400 transition-all font-sans resize-none leading-relaxed"
                />
              </div>

              {/* Quick Prompt Pills */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">Click a sample concept template:</span>
                <div className="flex flex-col gap-2">
                  {(role === 'buyer' ? BUYER_QUICK_PROMPTS : SELLER_QUICK_PROMPTS).map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyQuickPrompt(p)}
                      className="text-left text-[11px] bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-850 p-2.5 rounded-xl border border-gray-200 dark:border-slate-800/80 hover:border-indigo-500/30 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer font-sans leading-normal"
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRunChidonAI}
                disabled={generating}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-mono font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-500/10"
              >
                {generating ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-white" />
                    <span>Chidon AI Generating Node...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={14} className="text-white animate-pulse" />
                    <span>⚡ Generate Profile & Portfolio with Chidon AI</span>
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="manual-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {aiSuccess && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                    🎉 Profile drafted successfully with Chidon AI! Review and tweak the values below before completing.
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-extrabold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                      {role === 'buyer' ? 'Brand / Company Name' : 'Creator Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-cyan-400 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-extrabold text-gray-700 dark:text-slate-300 uppercase tracking-wide">Professional Bio</label>
                    <textarea
                      placeholder="Biography explaining focus, target channels, views or skills."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="w-full h-24 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-cyan-400 transition-all font-sans resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Buyer specifics */}
                {role === 'buyer' && (
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-mono font-extrabold text-gray-700 dark:text-slate-300 uppercase tracking-wide block">Prioritized platforms</label>
                    <div className="grid grid-cols-2 gap-3">
                      {PLATFORM_OPTIONS.map((platform) => {
                        const isSelected = selectedPlatforms.includes(platform);
                        return (
                          <div
                            key={platform}
                            onClick={() => togglePlatform(platform)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                              isSelected 
                                ? 'bg-cyan-500/10 border-cyan-400 text-cyan-700 dark:text-cyan-300' 
                                : 'bg-white dark:bg-slate-900/60 border-gray-200 dark:border-slate-800/80 text-gray-600 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-bold font-mono">{platform}</span>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              isSelected ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-gray-300 dark:border-slate-600'
                            }`}>
                              {isSelected && <Check size={10} strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Seller specifics */}
                {role === 'seller' && (
                  <div className="space-y-5 pt-2">
                    {/* Skills badges list */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-extrabold text-gray-700 dark:text-slate-300 uppercase tracking-wide block">Skills Offered</label>
                      
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
                          {skills.map(skill => (
                            <span key={skill} className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 px-2 py-0.5 rounded-full">
                              {skill}
                              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 text-gray-500 dark:text-slate-400">
                                <Trash2 size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add custom skill..."
                          value={newSkillInput}
                          onChange={e => setNewSkillInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(newSkillInput); } }}
                          className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-purple-400 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSkill(newSkillInput)}
                          className="px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs flex items-center justify-center cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Experience slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-mono text-gray-700 dark:text-slate-300">
                        <span className="uppercase font-extrabold tracking-wide">Experience level</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">{experienceYears} Years</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={experienceYears}
                        onChange={e => setExperienceYears(parseInt(e.target.value))}
                        className="w-full accent-purple-600 dark:accent-purple-500 bg-gray-200 dark:bg-slate-900 cursor-pointer h-1.5 rounded-full"
                      />
                    </div>

                    {/* Portfolio piece preview card */}
                    <div className="space-y-4 p-4 bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-gray-200 dark:border-slate-800">
                        <Briefcase size={14} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-mono font-black uppercase tracking-wide text-gray-700 dark:text-slate-200">Portfolio Showcase piece</span>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Case Study Title</label>
                          <input
                            type="text"
                            placeholder="e.g. TikTok Retention Overhaul - 1.2M Views"
                            value={portfolioTitle}
                            onChange={e => setPortfolioTitle(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-purple-400 transition-all font-sans"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-gray-500 dark:text-slate-400 uppercase tracking-wider block">Description</label>
                          <textarea
                            placeholder="Describe layout format, editing metrics or growth outcomes..."
                            value={portfolioDesc}
                            onChange={e => setPortfolioDesc(e.target.value)}
                            className="w-full h-16 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-purple-400 transition-all font-sans resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                              <ImageIcon size={10} /> Media Cover URL
                            </label>
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/..."
                              value={portfolioMediaURL}
                              onChange={e => setPortfolioMediaURL(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-purple-400 transition-all text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-gray-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                              <LinkIcon size={10} /> Live Work Link
                            </label>
                            <input
                              type="url"
                              placeholder="https://tiktok.com/@growth/video/1"
                              value={portfolioLink}
                              onChange={e => setPortfolioLink(e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-purple-400 transition-all text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-4 rounded-xl font-mono font-black text-xs uppercase tracking-widest text-white flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    role === 'buyer' 
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/10' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/10'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Saving Profile Node...</span>
                    </>
                  ) : (
                    <span>Accept & Save Profile Node 🚀</span>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
