import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Copy, Check, FileText, Globe, ShoppingBag, AlertCircle, 
  RefreshCw, Sparkles, Wand2, Target, Briefcase, BookOpen, MessageSquare, Send
} from 'lucide-react';
import { SEOTool } from '../SEOTool';

// Import newly generated high-fidelity asset images
import contentWritingBannerImg from '../../assets/images/content_writing_banner_1783649293057.jpg';
import portfolioBannerImg from '../../assets/images/portfolio_case_study_banner_1783649308111.jpg';

interface ChidonIqToolsViewProps {
  onBack?: () => void;
}

export const ChidonIqToolsView: React.FC<ChidonIqToolsViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'seo' | 'writing' | 'gig' | 'portfolio' | 'chat'>('seo');

  // --- 2. CONTENT WRITING FEATURE STATE ---
  const [writingTopic, setWritingTopic] = useState('');
  const [writingAudience, setWritingAudience] = useState('');
  const [writingTone, setWritingTone] = useState('persuasive');
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingError, setWritingError] = useState<string | null>(null);
  const [writingResult, setWritingResult] = useState<{
    hook: string;
    benefits: string[];
    cta: string;
    content: string;
  } | null>(null);

  // --- 3. GIG DESCRIPTION FEATURE STATE ---
  const [gigName, setGigName] = useState('');
  const [gigNiche, setGigNiche] = useState('');
  const [gigUsp, setGigUsp] = useState('');
  const [gigLoading, setGigLoading] = useState(false);
  const [gigError, setGigError] = useState<string | null>(null);
  const [gigResult, setGigResult] = useState<{
    problem: string;
    solution: string;
    whatsIncluded: string[];
    whyMe: string[];
    cta: string;
    fullDescription: string;
  } | null>(null);

  // --- 4. PORTFOLIO CASE STUDY STATE ---
  const [portfolioName, setPortfolioName] = useState('');
  const [portfolioNiche, setPortfolioNiche] = useState('');
  const [portfolioRole, setPortfolioRole] = useState('');
  const [portfolioOverview, setPortfolioOverview] = useState('');
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [portfolioResult, setPortfolioResult] = useState<{
    title: string;
    problem: string;
    solution: string;
    result: string;
    toolsUsed: string[];
    bulletPoints: string[];
  } | null>(null);

  // --- 5. CHAT/ASSISTANT FEATURE STATE ---
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Hi! I am your official ChidonFreelance support companion. Ask me any question about setting up profiles, posting Gigs, managing Paystack orders, or Escrow contracts!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Copy success indicator
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- HANDLERS ---
  const handleContentWritingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWritingError(null);
    setWritingResult(null);

    // Front-end strict validation
    const checkString = `${writingTopic} ${writingAudience} ${writingTone}`.toLowerCase();
    const blockTriggers = ['seo article', 'blog post', 'code', 'javascript', 'python', 'email', 'book', 'story', 'novel'];
    for (const trigger of blockTriggers) {
      if (checkString.includes(trigger)) {
        setWritingError("I can only do marketing content (Ads, Product descriptions, Gig descriptions). Try the SEO Feature or Gig Description Feature instead.");
        return;
      }
    }

    if (!writingTopic.trim() || writingTopic.trim().length < 2) {
      setWritingError("Topic/Product Name is required.");
      return;
    }

    setWritingLoading(true);
    try {
      const response = await fetch('/api/features/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: writingTopic, targetAudience: writingAudience, tone: writingTone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setWritingResult(data.data);
    } catch (err: any) {
      setWritingError(err.message || "An error occurred.");
    } finally {
      setWritingLoading(false);
    }
  };

  const handleGigDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGigError(null);
    setGigResult(null);

    const checkString = `${gigName} ${gigNiche} ${gigUsp}`.toLowerCase();
    const blockTriggers = ['blog post', 'blog article', 'seo article', 'code', 'story', 'novel', 'write a book'];
    for (const trigger of blockTriggers) {
      if (checkString.includes(trigger)) {
        setGigError("I can only do high-converting Fiverr/Upwork Gig descriptions. Try the SEO Feature or Content Writing Feature instead.");
        return;
      }
    }

    if (!gigName.trim() || gigName.trim().length < 2) {
      setGigError("Service Name/Title is required.");
      return;
    }

    setGigLoading(true);
    try {
      const response = await fetch('/api/features/gig-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName: gigName, niche: gigNiche, uniqueSellingPoint: gigUsp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGigResult(data.data);
    } catch (err: any) {
      setGigError(err.message || "An error occurred.");
    } finally {
      setGigLoading(false);
    }
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPortfolioError(null);
    setPortfolioResult(null);

    const checkString = `${portfolioName} ${portfolioNiche} ${portfolioRole} ${portfolioOverview}`.toLowerCase();
    const blockTriggers = ['write html', 'write css', 'react component', 'portfolio code', 'build website', 'coding', 'book', 'story'];
    for (const trigger of blockTriggers) {
      if (checkString.includes(trigger)) {
        setPortfolioError("I can only generate Portfolio project case studies from user inputs. Try the Content Writing Feature instead.");
        return;
      }
    }

    if (!portfolioName.trim()) {
      setPortfolioError("Project Name is required.");
      return;
    }

    setPortfolioLoading(true);
    try {
      const response = await fetch('/api/features/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: portfolioName, niche: portfolioNiche, role: portfolioRole, projectOverview: portfolioOverview }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPortfolioResult(data.data);
    } catch (err: any) {
      setPortfolioError(err.message || "An error occurred.");
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleSendChat = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const questionToSend = customQuestion || chatQuestion;
    if (!questionToSend.trim()) return;

    setChatError(null);
    if (!customQuestion) setChatQuestion('');

    // Append user message
    setChatHistory(prev => [...prev, { sender: 'user', text: questionToSend }]);
    setChatLoading(true);

    try {
      const response = await fetch('/api/features/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionToSend }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process question.");
      }

      setChatHistory(prev => [...prev, { sender: 'assistant', text: data.data.response }]);
    } catch (err: any) {
      setChatError(err.message);
      setChatHistory(prev => [...prev, { sender: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left" id="chidon-iq-tools-view">
      
      {/* 1. HORIZONTAL NAVIGATION TABS FOR ALL 5 SPECIALIZED CHIDON IQ TOOLS */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
        {[
          { id: 'seo', label: 'SEO Optimizer', icon: Search },
          { id: 'writing', label: 'Content Marketing', icon: Wand2 },
          { id: 'gig', label: 'Gig Builder', icon: Target },
          { id: 'portfolio', label: 'Portfolio Studies', icon: BookOpen },
          { id: 'chat', label: 'Platform Assistant', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive 
                  ? 'bg-white dark:bg-slate-950 text-slate-950 dark:text-cyan-primary shadow-sm border border-slate-200/50 dark:border-white/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. DYNAMIC WORKSPACE PANEL BASED ON THE SELECTED TIER */}
      <div className="bg-slate-50 dark:bg-slate-950/20 p-1 rounded-2xl">
        <AnimatePresence mode="wait">
          {activeTab === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Load refactored SEO Suite */}
              <SEOTool />
            </motion.div>
          )}

          {activeTab === 'writing' && (
            <motion.div
              key="writing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Content Writing Custom Visual Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 h-48 bg-slate-950">
                <img 
                  src={contentWritingBannerImg} 
                  alt="Content Writing Banner" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 w-fit mb-2">
                    Direct-Response copy
                  </div>
                  <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                    Direct Response Copywriter
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl mt-1">
                    Only write marketing content (Ads, Product descriptions, Gig descriptions) focused on hooks, core benefits, and a call-to-action between 150-300 words.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 bg-slate-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-4">
                  <form onSubmit={handleContentWritingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Product / Topic / Service
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Minimalist Productivity Planner"
                        value={writingTopic}
                        onChange={(e) => setWritingTopic(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={writingLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Remote creators and busy software devs"
                        value={writingAudience}
                        onChange={(e) => setWritingAudience(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={writingLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Writing Tone
                      </label>
                      <select
                        value={writingTone}
                        onChange={(e) => setWritingTone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={writingLoading}
                      >
                        <option value="persuasive">Persuasive & Punchy</option>
                        <option value="luxury">Luxury & Highly Sophisticated</option>
                        <option value="educational">Educational & Technical</option>
                        <option value="bold">Bold & Playful</option>
                      </select>
                    </div>

                    {writingError && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{writingError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={writingLoading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      {writingLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Synthesizing Copy...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate Copy
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="md:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md min-h-[300px] flex flex-col justify-center">
                  {writingLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12">
                      <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                      <div className="text-center">
                        <p className="text-sm text-slate-300 font-medium">Crafting direct response hooks...</p>
                        <p className="text-xs text-slate-500 mt-1">Applying psychological triggers and CTA rules</p>
                      </div>
                    </div>
                  ) : writingResult ? (
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Magnetic Hook</span>
                          <button 
                            onClick={() => handleCopy(writingResult.hook, 'hook')}
                            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                          >
                            {copiedField === 'hook' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === 'hook' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="p-3.5 bg-slate-950 border border-white/5 rounded-xl text-sm font-semibold text-slate-200">
                          "{writingResult.hook}"
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Core Benefits Matrix</span>
                        <div className="space-y-1.5">
                          {writingResult.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Irresistible Copy Body (150-300 Words)</span>
                          <button 
                            onClick={() => handleCopy(writingResult.content, 'copy-body')}
                            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                          >
                            {copiedField === 'copy-body' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === 'copy-body' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="p-4 bg-slate-950 border border-white/5 rounded-xl text-xs leading-relaxed text-slate-400 font-mono whitespace-pre-wrap">
                          {writingResult.content}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Call To Action</span>
                          <button 
                            onClick={() => handleCopy(writingResult.cta, 'cta')}
                            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                          >
                            {copiedField === 'cta' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === 'cta' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl text-xs font-bold">
                          {writingResult.cta}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                      <Wand2 className="w-12 h-12 text-slate-700" />
                      <p className="text-sm text-slate-400">Enter a topic and target audience to generate copy</p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Direct-response copywriters use strict word counts to optimize readability.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'gig' && (
            <motion.div
              key="gig"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Gig Description Visual Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 h-44 bg-slate-950">
                <img 
                  src={portfolioBannerImg} 
                  alt="Gig Description Banner" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-teal-500/20 text-teal-400 border border-teal-500/30 w-fit mb-2">
                    Fiverr & Upwork Optimizer
                  </div>
                  <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                    High-Converting Gig Description Builder
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl mt-1">
                    Only write gig descriptions outlining Problem, Solution, What's Included, Why Me, and CTA. Strictly blocks generic blog content.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 bg-slate-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-4">
                  <form onSubmit={handleGigDescriptionSubmit} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Freelance Service Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Build Custom React SaaS Web Apps"
                        value={gigName}
                        onChange={(e) => setGigName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={gigLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Niche / Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Web Development & Programming"
                        value={gigNiche}
                        onChange={(e) => setGigNiche(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={gigLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Unique Selling Point (USP)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 100% clean TypeScript code, ultra fast delivery"
                        value={gigUsp}
                        onChange={(e) => setGigUsp(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={gigLoading}
                      />
                    </div>

                    {gigError && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{gigError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={gigLoading}
                      className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      {gigLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Structuring Pitch...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4" />
                          Build Gig Description
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="md:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md min-h-[300px] flex flex-col justify-center">
                  {gigLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12">
                      <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                      <div className="text-center">
                        <p className="text-sm text-slate-300 font-medium">Framing buyer solutions...</p>
                        <p className="text-xs text-slate-500 mt-1">Avoiding keyword stuffing and establishing trust structures</p>
                      </div>
                    </div>
                  ) : gigResult ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 bg-slate-950 border border-white/5 rounded-xl">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Buyer's Problem</span>
                          <p className="text-xs text-slate-300 leading-relaxed">"{gigResult.problem}"</p>
                        </div>
                        <div className="p-3.5 bg-slate-950 border border-white/5 rounded-xl">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-green-400 mb-1">Your Solution</span>
                          <p className="text-xs text-slate-300 leading-relaxed">"{gigResult.solution}"</p>
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">What is Included in Your Service</span>
                        <div className="space-y-1.5 pl-3 border-l border-white/5">
                          {gigResult.whatsIncluded.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">Why Hire Me?</span>
                        <div className="space-y-1.5 pl-3 border-l border-white/5">
                          {gigResult.whyMe.map((item, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Full Description Copy</span>
                          <button 
                            onClick={() => handleCopy(gigResult.fullDescription, 'gig-full')}
                            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                          >
                            {copiedField === 'gig-full' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === 'gig-full' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="p-4 bg-slate-950 border border-white/5 rounded-xl text-xs leading-relaxed text-slate-400 font-mono whitespace-pre-wrap">
                          {gigResult.fullDescription}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                      <Target className="w-12 h-12 text-slate-700" />
                      <p className="text-sm text-slate-400">Enter freelance service details to start</p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        High-converting Gigs highlight exact deliverables and concrete trust matrices clearly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Portfolio Case Studies Visual Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 h-44 bg-slate-950">
                <img 
                  src={portfolioBannerImg} 
                  alt="Portfolio Case Study Banner" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 w-fit mb-2">
                    Case Study Architect
                  </div>
                  <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                    Structured Case Study Generator
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-xl mt-1">
                    Generate highly professional case studies with problem, solution, result, tools, and exactly 3 metrics. Strictly blocks writing website HTML/code.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 bg-slate-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md space-y-4">
                  <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Decentralized Escrow Node"
                        value={portfolioName}
                        onChange={(e) => setPortfolioName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={portfolioLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Project Niche / Industry
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Web3 Payments, FinTech"
                        value={portfolioNiche}
                        onChange={(e) => setPortfolioNiche(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={portfolioLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Your Role / Position
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Full-Stack Blockchain Architect"
                        value={portfolioRole}
                        onChange={(e) => setPortfolioRole(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                        disabled={portfolioLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                        Brief Project Overview
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. We built a zero-trust multi-sig digital escrow contract using React, Tailwind and Solidity to secure marketplace transactions..."
                        value={portfolioOverview}
                        onChange={(e) => setPortfolioOverview(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition resize-none"
                        disabled={portfolioLoading}
                      />
                    </div>

                    {portfolioError && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{portfolioError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={portfolioLoading}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      {portfolioLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Assembling Case Study...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4" />
                          Generate Case Study
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="md:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md min-h-[300px] flex flex-col justify-center">
                  {portfolioLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      <div className="text-center">
                        <p className="text-sm text-slate-300 font-medium">Processing case study matrices...</p>
                        <p className="text-xs text-slate-500 mt-1">Refusing code templates and writing human-readable outcomes</p>
                      </div>
                    </div>
                  ) : portfolioResult ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Case Study Title</span>
                          <button 
                            onClick={() => handleCopy(portfolioResult.title, 'port-title')}
                            className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                          >
                            {copiedField === 'port-title' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedField === 'port-title' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <h4 className="text-md font-bold text-white leading-snug">{portfolioResult.title}</h4>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-slate-950 border border-white/5 rounded-xl">
                          <span className="block font-bold text-amber-400 uppercase tracking-wider mb-1 text-[9px]">The Challenge</span>
                          <p className="text-slate-300 leading-relaxed">{portfolioResult.problem}</p>
                        </div>
                        <div className="p-3 bg-slate-950 border border-white/5 rounded-xl">
                          <span className="block font-bold text-amber-400 uppercase tracking-wider mb-1 text-[9px]">The Solution Architecture</span>
                          <p className="text-slate-300 leading-relaxed">{portfolioResult.solution}</p>
                        </div>
                        <div className="p-3 bg-slate-950 border border-white/5 rounded-xl">
                          <span className="block font-bold text-amber-400 uppercase tracking-wider mb-1 text-[9px]">Business Results</span>
                          <p className="text-slate-300 leading-relaxed">{portfolioResult.result}</p>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">3 Core Achievement Metrics</span>
                        <div className="space-y-1.5 pl-3 border-l border-amber-500/20">
                          {portfolioResult.bulletPoints.map((bullet, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span>{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">Technologies Used</span>
                        <div className="flex flex-wrap gap-1.5">
                          {portfolioResult.toolsUsed.map((tool, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-950 border border-white/5 rounded text-[10px] font-mono text-slate-300">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                      <BookOpen className="w-12 h-12 text-slate-700" />
                      <p className="text-sm text-slate-400">Enter project metrics to build portfolio</p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        A structured case study helps prospective hiring clients see exact real-world business outcomes.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Chat Support Header Panel */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-primary" />
                    ChidonIQ Platform Support
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Authorized helpdesk assistant strictly focused on ChidonFreelance navigation and operations.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-cyan-primary/10 border border-cyan-primary/20 text-cyan-primary uppercase tracking-wider">
                  Operational Core
                </span>
              </div>

              {/* Chat Thread Container */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 bg-slate-950 border border-white/10 rounded-2xl p-4 h-[350px] flex flex-col justify-between">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/5">
                    {chatHistory.map((msg, i) => {
                      const isAI = msg.sender === 'assistant';
                      return (
                        <div key={i} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                          <div className={`p-3 max-w-[85%] rounded-2xl text-xs leading-relaxed ${
                            isAI 
                              ? 'bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none' 
                              : 'bg-cyan-primary/10 border border-cyan-primary/20 text-white rounded-tr-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="p-3 bg-slate-900 border border-white/5 text-slate-500 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                          <RefreshCw className="w-3 h-3 animate-spin text-cyan-primary" />
                          Consulting system guidelines...
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={(e) => handleSendChat(e)} className="relative mt-3">
                    <input
                      type="text"
                      placeholder="Ask how profile onboarding, gigs, or Paystack escrow works..."
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      className="w-full pl-4 pr-12 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-primary transition"
                      disabled={chatLoading}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatQuestion.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-primary/20 hover:bg-cyan-primary/30 text-cyan-primary rounded-lg transition disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Quick Interactive Sandbox Questions */}
                <div className="md:col-span-4 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                      Frequently Asked Questions
                    </h4>
                    <div className="space-y-1.5">
                      {[
                        { q: "How do I setup my freelancer profile?", l: "Profile Setup" },
                        { q: "How do Escrow Orders work?", l: "Escrow Rules" },
                        { q: "What is Paystack escrow payment?", l: "Paystack Checkouts" },
                        { q: "How can I post and sell Gigs?", l: "Post a Gig" },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendChat(undefined, item.q)}
                          disabled={chatLoading}
                          className="w-full p-2.5 bg-slate-950/60 border border-white/5 hover:border-cyan-primary/20 rounded-xl text-left text-xs text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <span className="block font-semibold text-[9px] text-cyan-primary/80 uppercase tracking-wider mb-0.5">{item.l}</span>
                          {item.q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono leading-relaxed bg-white/5 p-2 rounded-lg">
                    * The Chat Support system strictly rejects general queries (e.g. coding help, writing requests, math) in compliance with security guidelines.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
