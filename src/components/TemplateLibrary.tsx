import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, UserCircle, BarChart3, ChevronRight, 
  Copy, Check, Download, Send, AlertCircle, RefreshCcw, 
  ArrowLeft, FilePlus2, BookOpen, Laptop, Bookmark, Zap, HelpCircle, FileCheck
} from 'lucide-react';

interface Template {
  id: string;
  label: string;
  description: string;
  structure: string;
  previewExample: string;
}

interface CategoryTemplates {
  id: 'social' | 'bio' | 'competitor';
  label: string;
  icon: any;
  description: string;
  templates: Template[];
}

interface TemplateLibraryProps {
  onBack: () => void;
  onSaveDraft?: (featureId: string, content: string, title: string) => Promise<void>;
  checkAndDeductCredits?: (cost: number, description: string) => Promise<boolean>;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ 
  onBack, 
  onSaveDraft,
  checkAndDeductCredits
}) => {
  const { t, i18n } = useTranslation();
  
  // Selection States
  const [activeCategoryId, setActiveCategoryId] = useState<'social' | 'bio' | 'competitor'>('social');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('pas-formula');
  
  // Form Variables State (unified for ease of management)
  const [variables, setVariables] = useState<Record<string, string>>({
    // Social Posts Vars
    postTopic: 'The future of autonomous AI coding assistants',
    postKeywords: 'AI agency, software development, Antigravity, automations',
    postAudience: 'Tech founders, product managers, developers',
    postTone: 'Bold/Contrarian',
    
    // Bio Vars
    bioBrandName: 'Alex Carter',
    bioNiche: 'Zero-Code SaaS Marketing & Pipeline Specialist',
    bioAchievements: 'Scaled 4 startups to $1M ARR, generated 45M organic views',
    bioCTA: 'Get my free SaaS Scaling Blueprint inside comments',
    bioTone: 'Authoritative & Punchy',
    
    // Competitor Analysis Vars
    compYourBrand: 'CHIDON IQ',
    compIndustry: 'Enterprise workflow automation and prompt layers',
    compName: 'ScribeFlow Corp',
    compWeakness: 'Slow processing queues, lack of localized multi-language caches, high setup fees',
    compFocus: 'Pricing strategy, custom service speeds, brand transparency'
  });

  // Action states
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Template Library definitions
  const CATEGORIES: CategoryTemplates[] = [
    {
      id: 'social',
      label: 'Social Media Posts',
      icon: FileText,
      description: 'High-retention frameworks to stop the scroll and drive conversions.',
      templates: [
        {
          id: 'pas-formula',
          label: 'PAS Persuasion Formula',
          description: 'Agitate a painful niche friction point, then deliver your superior tool as the ultimate response framework.',
          structure: `[PROBLEM]: (Insert target audience problem or frustration)\n\n[AGITATE]: (Explain why ignoring this costs time, money, or scalability)\n\n[SOLVE]: (Introduce your specific solution/feature as the ultimate relief blueprint)\n\n[PROOF / CALL-TO-ACTION]: (Quantified trigger prompting comments, clicks, or signups)`,
          previewExample: `[PROBLEM]: Static dashboards are dead. You waste 4 hours every Monday compiling analytics from five different tabs.\n\n[AGITATE]: While you manually match CSV rows, your competitors deploy fully automated pipeline monitors. They act on signal while you lag on noise. Inaction is bleeding your margins.\n\n[SOLVE]: CHIDON IQ unifies telemetry streams instantly, delivering precise operational matrices via server-side feeds in real-time.\n\n[PROOF / CALL-TO-ACTION]: Tap the comment link to secure an instant, cost-free compliance audit. Let automated proxies handle the metrics.`
        },
        {
          id: 'aida-blueprint',
          label: 'AIDA Conversion Path',
          description: 'Guide the reader through high-interest logic from attention hook to closing action.',
          structure: `[ATTENTION]: (Shocking contrarian statement or impressive statistic hook)\n\n[INTEREST]: (Hook reader deeper with an intriguing mechanism, gap, or secret)\n\n[DESIRE]: (Trigger purchase or loyalty desire by showing perfect transformation results)\n\n[ACTION]: (Urgent direct action statement)`,
          previewExample: `[ATTENTION]: 92% of software systems generate data that nobody ever reads.\n\n[INTEREST]: Most monitoring stacks are configured to output passive alarms. You only discover catastrophic database lags after checkout rates drop by 20%.\n\n[DESIRE]: CHIDON IQ utilizes pre-emptive search-grounded models. It solves performance timeouts *before* they exit sandbox stages, preserving your peak ARR seamlessly.\n\n[ACTION]: Reply with "UPGRADE" below to access our developer preview. Build tomorrow's system, today.`
        },
        {
          id: 'hook-listicle',
          label: 'High-Retention Listicle Thread',
          description: 'Break down complex technical insights into quick, bite-sized value snippets.',
          structure: `[CONTRIAN HOOK]: (Contrarian hook stating the mainstream opinion is wrong)\n\n[PILLAR 1]: (The biggest oversight + tactical fix)\n\n[PILLAR 2]: (An unconventional productivity leverage point + custom metrics)\n\n[PILLAR 3]: (A direct action item the user can run this afternoon)\n\n[ACTION TRIGGER]: (Encourage bookmark, share, and discussion)`,
          previewExample: `[CONTRIAN HOOK]: Stop spending $2,000/month on manual prompt engineers. Here is the exact system we used to automate 95% of our copywriting pipelines with pristine quality:\n\n[PILLAR 1]: Ditch generic placeholders. Standard prompts default to boring corporate jargon. Utilize strict constraints and structural markdown rules instead to force the AI engine into highly tactical language output.\n\n[PILLAR 2]: Streamline your caching. Re-running massive context loads is incredibly slow and expensive. Mount a server-side TanStack query caching layer to reuse static prompt weights instantly.\n\n[PILLAR 3]: Run localized tests directly inside small sandboxes. Optimize tone levels with primitive filters before deploying to production streams.\n\n[ACTION TRIGGER]: Bookmark this thread so you don't lose the roadmap. What is your biggest bottleneck with client prompts today?`
        }
      ]
    },
    {
      id: 'bio',
      label: 'Professional Bios',
      icon: UserCircle,
      description: 'Crisp brand definitions to establish premium authority and drive secondary traffic.',
      templates: [
        {
          id: 'authority-builder',
          label: 'Authority Builder Bio',
          description: 'Establish direct subject authority, niche focus, social proof, and a clear next-step CTA.',
          structure: `[TITLE/VALUE PROP]: (Title + who you serve and what value you deliver)\n[PROOF]: (Quantified achievements, startups scaled, or followers reached)\n[METHODOLOGY]: (Your signature opinion, contrarian angle, or system name)\n[CALL-TO-ACTION]: (Visual finger layout pointing directly to link channel)`,
          previewExample: `Zero-Code SaaS scaling system for ambitious B2B founders.\nScaled 4 startups to $1M+ ARR. 45M organic views generated.\nRealigning marketing channels with high-retention automated content grids.\n👇 Access my free scaling playbook here: alexcarter.com/blueprint`
        },
        {
          id: 'creative-narrative',
          label: 'Creative Storyteller Bio',
          description: 'Quirky, warm, highly relatable copy that turns standard credentials into human adventures.',
          structure: `[HUMOROUS PARADOX]: (A playful contradiction about your specialty)\n[THE JOURNEY]: (Summary of what drives your creative actions)\n[THE CALLING]: (What you do or build for your peers)\n[UPLINK Link]: (Warm invitation to follow or download)`,
          previewExample: `I translate complex product lines into clear visual stories. (And drink too much matcha to cope).\nEx-startup lead who got tired of cookie-cutter templates and automated slop.\nBuilding clean UI frameworks to preserve authentic human craft online.\nJoin our weekly workflow circle: alexcarter.com/join`
        },
        {
          id: 'minimalist-index',
          label: 'Minimalist Professional Index',
          description: 'A sparse, vertical layout using piped dividers and JetBrains Mono vibes to show technical class.',
          structure: `[IDENTIFIER]: (Clean tag line / specialized profile)\n[PIPED COMPETENCIES]: (Competency A | Competency B | Niche Focus)\n[ACTIVE PROJECT]: (Current active project or company)\n[INDEX LINK]: (Short technical action line + link URL placeholder)`,
          previewExample: `Content Architect & Systems Designer\nSaaS Funnels | Pipeline Automation | Brand Strategy\nActive Focus: Refining generative prompt structures for enterprise workflows\nSystem catalog listed: alexcarter.com`
        }
      ]
    },
    {
      id: 'competitor',
      label: 'Competitor Lab Reports',
      icon: BarChart3,
      description: 'Strategic intelligence models to dissect competitors and plan content counter-campaigns.',
      templates: [
        {
          id: 'full-swot',
          label: 'High-Intensity SWOT Matrix',
          description: 'A rigorous four-quadrant analysis identifying structural competitor elements to exploit.',
          structure: `# STRATEGIC INTEL REPORT: [COMPETITOR NAME]\n\n## 1. STRENGTHS (Competitor Leverage)\n- (Leverage A: High brand loyalty, distribution speed, etc.)\n- (Leverage B: Proprietary tooling or deep funds)\n\n## 2. WEAKNESSES (Competitor Exposures)\n- (Exposure A: Gaps in custom service, slow support, high cost, etc.)\n- (Exposure B: Outdated legacy structure, poor localization, etc.)\n\n## 3. OPPORTUNITIES (Exploitable Market Gaps)\n- (Gap A: Target audience cohorts excluded due to pricing/complexity)\n- (Gap B: High demand for lightweight, automated mobile workflows)\n\n## 4. THREATS & COUNTER-ATTACK CAMPAIGN\n- (Our direct offensive content campaign to hijack interest and highlight these exposures)`,
          previewExample: `# STRATEGIC INTEL REPORT: SCRIBEFLOW CORP\n\n## 1. STRENGTHS (Competitor Leverage)\n- Dominant organic rankings for "no-code transcription tools".\n- Massive existing partner ecosystem in Unified Team Channels Hub.\n\n## 2. WEAKNESSES (Competitor Exposures)\n- Customers report catastrophic latency on audio loads over 10 minutes.\n- Lack of support for multi-language context cache translation.\n- Steep $299 upfront licensing fee constraints small creators.\n\n## 3. OPPORTUNITIES (Exploitable Market Gaps)\n- Target self-funded digital creators seeking lightweight pay-as-you-go setups.\n- Position our tool as the high-speed, military-grade localized alternate.\n\n## 4. THREATS & COUNTER-ATTACK CAMPAIGN\n- Deploy educational videos contrasting ScribeFlow lag with our instant, serverless results.\n- Use search key terms to capture people complaining about licensing costs.`
        },
        {
          id: 'differentiation-blueprint',
          label: 'Competitor Gap & Defense Plan',
          description: 'Map out exactly how to position your brand as the obvious premium choice in a saturated tier.',
          structure: `## 1. THE GAP (Unserved Competitor Customers)\n(Define what the competitor is systematically ignoring or getting wrong)\n\n## 2. THE HIGHER STANDARD (Your Brand Solution)\n(Explain how your brand acts as a direct strategic upgrade)\n\n## 3. TACTICAL VALUE OFFERS\n- (Value point 1: Setup speed, transparency, cost clarity)\n- (Value point 2: Design excellence or advanced prompt architectures)\n\n## 4. PLATFORM-WIDE INTERCEPT ACTION PLAN\n- Command 1: (Deploy targeted case studies)\n- Command 2: (Position comparative SEO hooks)`,
          previewExample: `## 1. THE GAP (Unserved Competitor Customers)\nScribeFlow has optimized entirely for rigid, slow enterprise contracts, leaving active social creators completely stranded without flexible, on-demand formatting rules.\n\n## 2. THE HIGHER STANDARD (CHIDON IQ)\nCHIDON IQ operates via clean, instant micro-dashboards. It delivers high-fidelity templates and intelligence-aligned structures within a single viewport, with 0ms server caching delays.\n\n## 3. TACTICAL VALUE OFFERS\n- No contracts required. Simple cloud-synced project vaults accessible on any screen.\n- Built-in multi-lingual translation and immediate social media scheduling queues.\n\n## 4. PLATFORM-WIDE INTERCEPT ACTION PLAN\n- Command 1: Publish comparison case studies on LinkedIn targeting the "hidden costs of ScribeFlow".\n- Command 2: Dominate search queries for alternatives using focused high-CTR hooks.`
        },
        {
          id: 'content-hijack',
          label: 'Content Hijack Offense Guide',
          description: 'Deconstruct their highest-ranking themes and supply superior hook scripts to steal traffic.',
          structure: `## 1. DECONSTRUCTED COMPETITOR PILLARS\n- Pillar A: (Main theme triggering high engagement for them)\n- Pillar B: (Secondary theme triggering steady reach)\n\n## 2. OUR OFFENSIVE CTR HOOKS\n- (superior alternate hook 1 for Pillar A)\n- (superior alternate hook 2 for Pillar B)\n\n## 3. THE HIJACK RETENTION BLUEPRINT\n(Specific content sequence designed to drain viewer loyalty from their video/feed to yours)`,
          previewExample: `## 1. DECONSTRUCTED COMPETITOR PILLARS\n- Pillar A: Simple automation tricks to save 2 hours/day on marketing posts.\n- Pillar B: The ultimate workflow setup for multi-channel video distribution.\n\n## 2. OUR OFFENSIVE CTR HOOKS\n- "Stop wasting 2 hours on marketing templates. Here's how one API call automates the entire process in 5 seconds."\n- "The multi-channel workflow they charge $199 for, built completely for free. Thread below."\n- "Why mainstream social media schedulers are shadowbanning your link setups, and the code to fix it."\n\n## 3. THE HIJACK RETENTION BLUEPRINT\nOpen with their exact premise, immediately declare a shocking downside to their system within 3 seconds, introduce our server-cached replacement, and provide a direct downloadable resource in comments.`
        }
      ]
    }
  ];

  // Helper selectors
  const activeCategory = CATEGORIES.find(c => c.id === activeCategoryId)!;
  const currentTemplates = activeCategory.templates;
  const activeTemplate = currentTemplates.find(t => t.id === selectedTemplateId) || currentTemplates[0];

  // Handle variable change
  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Build the generation prompt dynamically
  const handleGenerateTemplate = async () => {
    if (checkAndDeductCredits) {
      const allowed = await checkAndDeductCredits(2, `Template Engine: ${activeTemplate.label}`);
      if (!allowed) return;
    }
    setIsLoading(true);
    setErrorStatus(null);
    setGeneratedOutput('');
    setIsCopied(false);
    setIsSaved(false);

    // Build specific prompt parameters based on active category
    let paramsSummary = '';
    if (activeCategoryId === 'social') {
      paramsSummary = `
Topic: ${variables.postTopic}
Target Keywords: ${variables.postKeywords}
Target Audience: ${variables.postAudience}
Requested Tone: ${variables.postTone}`;
    } else if (activeCategoryId === 'bio') {
      paramsSummary = `
Brand/Name: ${variables.bioBrandName}
Specialty/Niche: ${variables.bioNiche}
Key Achievements: ${variables.bioAchievements}
Call to Action (CTA): ${variables.bioCTA}
Requested Tone: ${variables.bioTone}`;
    } else if (activeCategoryId === 'competitor') {
      paramsSummary = `
Your Brand/Product: ${variables.compYourBrand}
Industry Details: ${variables.compIndustry}
Competitor Brand/Name: ${variables.compName}
Competitor Known Weaknesses: ${variables.compWeakness}
Key Focus Areas for analysis: ${variables.compFocus}`;
    }

    const currentLang = (i18n.language || 'en').split('-')[0].toLowerCase();
    
    const finalPrompt = `
You are an elite copywriting and conversion specialist inside CHIDON IQ.
Your absolute directive is to populate the user's selected strategic template structure with premium, engaging, and high-performing content based on their input parameters.

### TEMPLATE TYPE TO POPULATE:
${activeTemplate.label}

### TARGET BLANK STRUCTURE (YOU MUST RETAIN THESE STRUCTURAL LABELS OR HEADERS EXACTLY):
${activeTemplate.structure}

### USER'S PROVIDED VARIABLES:
${paramsSummary}

### EXHAUSTIVE GENERATION PARAMETERS:
1. Output in clean Markdown layout. Maintain all matching sections (such as [PROBLEM], [STORY HOOK], or ## WEAKNESSES) with clear typographic dividers.
2. Completely flesh out every single section. Do NOT write generic placeholders or placeholders in brackets (e.g. do not outputs "(ScribeFlow Corp)" inside the actual text, output the actual text beautifully integrated). Use the user's variables creatively.
3. Align the content strictly with the user's requested Tone of Voice. Keep the style bold, authoritative, concise, and focused on high conversion and psychological triggers.
4. Keep paragraphs short and punchy (maximum 2 sentences per paragraph) to stop the scroll on screens.
5. Translate and output the entire block natively in: ${currentLang === 'es' ? 'Spanish' : currentLang === 'zh' ? 'Chinese' : currentLang === 'hi' ? 'Hindi' : currentLang === 'ar' ? 'Arabic' : currentLang === 'fr' ? 'French' : currentLang === 'pt' ? 'Portuguese' : currentLang === 'de' ? 'German' : currentLang === 'ja' ? 'Japanese' : currentLang === 'ru' ? 'Russian' : 'English'}.
6. Do NOT include any introductory chit-chat, notes, or concluding pleasantries. Begin generating the populated template content immediately.
`;

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: finalPrompt, language: i18n.language }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (!data.text) {
        throw new Error("No text response received from Gemini engine proxy.");
      }

      setGeneratedOutput(data.text);
    } catch (err: any) {
      console.error("Template library generation failure:", err);
      setErrorStatus(err.message || 'An internal error occurred during the cognitive generation cycle.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedOutput) return;
    const blob = new Blob([generatedOutput], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chidon_iq_${activeTemplate.id}_export.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveToVault = async () => {
    if (!generatedOutput || !onSaveDraft) return;
    setIsSaved(true);
    try {
      const title = `CHIDON Template: ${activeTemplate.label}`;
      await onSaveDraft('drafts', generatedOutput, title);
    } catch (err) {
      console.error("Failed to save draft:", err);
      setIsSaved(false);
    }
  };

  return (
    <div className="w-full bg-slate-950/20 rounded-2xl border border-[var(--border-base)]/50 backdrop-blur-xl overflow-hidden shadow-xl flex flex-col min-h-[500px]">
      
      {/* Visual Tech Header */}
      <div id="template-header" className="p-6 border-b border-[var(--border-base)] bg-[var(--bg-card)]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            id="template-btn-back"
            onClick={onBack}
            className="p-2 border border-[var(--border-base)]/80 hover:bg-white/5 rounded-xl transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            title="Back to Command Console"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-primary/10 text-cyan-primary border border-cyan-primary/10 tracking-widest uppercase">STATION CORE</span>
              <span className="text-[10px] text-slate-500 font-mono">// SEGMENT: TEMPLATE LIBRARY</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">CHIDON IQ Template Library</h1>
            <p className="text-xs text-[var(--text-secondary)]">Populate strategic copywriting blueprints instantly using automated intelligence modeling.</p>
          </div>
        </div>
        
        {/* Metric indicators */}
        <div id="template-network-metrics" className="flex items-center gap-3 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-xl px-4 py-2 text-xs font-mono">
          <Zap size={14} className="text-cyan-primary animate-pulse" />
          <div className="text-left">
            <p className="text-[10px] text-slate-500 tracking-wider">PROXY ENGINE</p>
            <p className="text-[11px] font-bold text-cyan-primary">Chidon Aether 3.5 Active</p>
          </div>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div id="template-categories" className="px-6 py-4 border-b border-[var(--border-base)]/40 bg-[var(--bg-card)]/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const isSelected = activeCategoryId === cat.id;
          return (
            <button
              id={`cat-tab-${cat.id}`}
              key={cat.id}
              onClick={() => {
                setActiveCategoryId(cat.id);
                // Automatically switch to first template of new category
                const designTemplates = CATEGORIES.find(c => c.id === cat.id)!.templates;
                setSelectedTemplateId(designTemplates[0].id);
                setGeneratedOutput('');
                setErrorStatus(null);
              }}
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected 
                  ? 'border-cyan-primary/40 bg-cyan-primary/5 shadow-md active-pulse-glow' 
                  : 'border-[var(--border-base)]/60 hover:border-cyan-primary/20 hover:bg-white/5 bg-[var(--bg-card)]/40'
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-primary/15 text-cyan-primary' : 'bg-slate-800/40 text-slate-400'}`}>
                <CatIcon size={18} />
              </div>
              <div className="space-y-0.5">
                <h4 className={`text-xs font-bold leading-tight uppercase font-mono tracking-wider ${isSelected ? 'text-cyan-primary' : 'text-[var(--text-primary)]'}`}>
                  {cat.label}
                </h4>
                <p className="text-[10px] leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                  {cat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Two-Column Stage */}
      <div id="template-workspace-stage" className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-base)] bg-[var(--bg-card)]/10">
        
        {/* LEFT COLUMN: Input form and templates catalog (lg:col-span-12 -> 5) */}
        <div id="template-panel-form" className="lg:col-span-5 p-6 overflow-y-auto max-h-[750px] space-y-6">
          
          {/* Templates Catalog Swiper */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <Zap size={11} className="text-cyan-primary" /> Select blueprint variation ({currentTemplates.length})
            </h3>
            <div className="space-y-2.5">
              {currentTemplates.map((tpl) => {
                const isTplSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    id={`tpl-select-${tpl.id}`}
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setGeneratedOutput('');
                      setErrorStatus(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isTplSelected 
                        ? 'border-cyan-primary bg-cyan-primary/5 shadow-inner' 
                        : 'border-[var(--border-base)]/65 hover:bg-slate-800/20 hover:border-slate-700 bg-[var(--bg-card)]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-black uppercase tracking-wider font-mono ${isTplSelected ? 'text-cyan-primary' : 'text-[var(--text-primary)]'}`}>
                        {tpl.label}
                      </span>
                      {isTplSelected && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-primary text-black font-black uppercase tracking-widest leading-none scale-90">Selected</span>}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form variables loader */}
          <div className="border-t border-[var(--border-base)]/40 pt-5 space-y-4">
            <h3 className="text-xs font-bold font-mono text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <FilePlus2 size={12} className="text-cyan-primary" /> Input Content Intelligence variables
            </h3>

            {/* SOCIAL VARIABLES FORUM */}
            {activeCategoryId === 'social' && (
              <div className="space-y-3.5 text-xs">
                <div id="wrapper-social-topic" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Target Topic / Topic Proposition</label>
                  <input 
                    id="input-social-topic"
                    type="text"
                    value={variables.postTopic}
                    onChange={(e) => handleVariableChange('postTopic', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all font-mono text-[11px]"
                    placeholder="e.g., Enterprise automation tactics..."
                  />
                </div>

                <div id="wrapper-social-keywords" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Strategic Keywords (comma-separated)</label>
                  <input 
                    id="input-social-keywords"
                    type="text"
                    value={variables.postKeywords}
                    onChange={(e) => handleVariableChange('postKeywords', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all font-mono text-[11px]"
                    placeholder="e.g., ai, startup metrics, ctc..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div id="wrapper-social-audience" className="space-y-1">
                    <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Target Audience Persona</label>
                    <input 
                      id="input-social-audience"
                      type="text"
                      value={variables.postAudience}
                      onChange={(e) => handleVariableChange('postAudience', e.target.value)}
                      className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                      placeholder="e.g., software engineers"
                    />
                  </div>
                  <div id="wrapper-social-tone" className="space-y-1">
                    <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Desired Tone Pattern</label>
                    <select
                      id="input-social-tone"
                      value={variables.postTone}
                      onChange={(e) => handleVariableChange('postTone', e.target.value)}
                      className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                    >
                      <option value="Bold/Contrarian">Bold/Contrarian</option>
                      <option value="Authoritative">Authoritative & Analytical</option>
                      <option value="Instructional/Guide">Instructional/Guide</option>
                      <option value="Witty & Hyper-Conversational">Witty & Conversational</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* BIO VARIABLES FORUM */}
            {activeCategoryId === 'bio' && (
              <div className="space-y-3.5 text-xs">
                <div id="wrapper-bio-brand" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Subject or Brand Name</label>
                  <input 
                    id="input-bio-brand"
                    type="text"
                    value={variables.bioBrandName}
                    onChange={(e) => handleVariableChange('bioBrandName', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                    placeholder="e.g., Alex Carter"
                  />
                </div>

                <div id="wrapper-bio-niche" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Niche Proposition / Value Specialty</label>
                  <input 
                    id="input-bio-niche"
                    type="text"
                    value={variables.bioNiche}
                    onChange={(e) => handleVariableChange('bioNiche', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                    placeholder="e.g., SaaS Copywriter & Automation special..."
                  />
                </div>

                <div id="wrapper-bio-achievements" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Key Quantifiable Milestone Proofs</label>
                  <input 
                    id="input-bio-achievements"
                    type="text"
                    value={variables.bioAchievements}
                    onChange={(e) => handleVariableChange('bioAchievements', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                    placeholder="e.g., Scaled 4 companies, 15M reach"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div id="wrapper-bio-cta" className="space-y-1">
                    <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Primary Call-to-Action Link Text</label>
                    <input 
                      id="input-bio-cta"
                      type="text"
                      value={variables.bioCTA}
                      onChange={(e) => handleVariableChange('bioCTA', e.target.value)}
                      className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                      placeholder="e.g., Download free blueprint 👇"
                    />
                  </div>
                  <div id="wrapper-bio-tone" className="space-y-1">
                    <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Desired Bio Mood</label>
                    <select
                      id="input-bio-tone"
                      value={variables.bioTone}
                      onChange={(e) => handleVariableChange('bioTone', e.target.value)}
                      className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                    >
                      <option value="Authoritative & Punchy">Authoritative & Punchy</option>
                      <option value="Creative & Witty">Creative & Witty</option>
                      <option value="Ultra-Minimalist">Ultra-Minimalist & Fast</option>
                      <option value="Conversational Storyteller">Conversational Storyteller</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* COMPETITOR ANALYSIS VARIABLES FORUM */}
            {activeCategoryId === 'competitor' && (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div id="wrapper-comp-your" className="space-y-1">
                    <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Your Brand / Project Name</label>
                    <input 
                      id="input-comp-your"
                      type="text"
                      value={variables.compYourBrand}
                      onChange={(e) => handleVariableChange('compYourBrand', e.target.value)}
                      className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all font-mono text-[11px]"
                      placeholder="e.g., CHIDON IQ"
                    />
                  </div>
                  <div id="wrapper-comp-name" className="space-y-1">
                    <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Competitor Unit name</label>
                    <input 
                      id="input-comp-name"
                      type="text"
                      value={variables.compName}
                      onChange={(e) => handleVariableChange('compName', e.target.value)}
                      className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all font-mono text-[11px]"
                      placeholder="e.g., ScribeFlow Corp"
                    />
                  </div>
                </div>

                <div id="wrapper-comp-industry" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Industry Focus & Core Activity</label>
                  <input 
                    id="input-comp-industry"
                    type="text"
                    value={variables.compIndustry}
                    onChange={(e) => handleVariableChange('compIndustry', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                    placeholder="e.g., No-code automation systems"
                  />
                </div>

                <div id="wrapper-comp-weakness" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Competitor Gaps / Weaknesses to target</label>
                  <textarea 
                    id="input-comp-weakness"
                    value={variables.compWeakness}
                    onChange={(e) => handleVariableChange('compWeakness', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] h-16 resize-none transition-all"
                    placeholder="e.g., expensive setup licenses, outdated mobile views, slow queue loops"
                  />
                </div>

                <div id="wrapper-comp-focus" className="space-y-1">
                  <label className="block font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono text-[10px]">Key Focus Analysis Areas</label>
                  <input 
                    id="input-comp-focus"
                    type="text"
                    value={variables.compFocus}
                    onChange={(e) => handleVariableChange('compFocus', e.target.value)}
                    className="w-full bg-[var(--bg-card)]/80 border border-[var(--border-base)] rounded-xl p-2.5 outline-none focus:border-cyan-primary text-[var(--text-primary)] transition-all"
                    placeholder="e.g., pricing limits, brand alignment speed"
                  />
                </div>
              </div>
            )}

            {/* GENERATE ACTION TRIGGER BUTTON */}
            <button
              id="template-action-btn-generate"
              onClick={handleGenerateTemplate}
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-primary text-black font-black text-xs uppercase tracking-wider hover:bg-cyan-primary/90 hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-cyan-primary/20 hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <RefreshCcw size={14} className="animate-spin text-black" />
                  Aligning Cognitive Models...
                </>
              ) : (
                <>
                  <Zap size={14} className="text-black fill-current animate-pulse" />
                  Populate Selected Blueprint
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Blueprint Visual Structure & Live Populate Result (lg:col-span-12 -> 7) */}
        <div id="template-panel-preview" className="lg:col-span-7 p-6 flex flex-col min-h-[450px]">
          
          {/* Header toolbar for results */}
          <div className="flex items-center justify-between border-b border-[var(--border-base)]/40 pb-4 mb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">OUTPUT RESOLUTION</span>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Populate Preview Frame</h3>
            </div>
            
            {/* Action buttons (Copy / Download / Draft) */}
            {generatedOutput && (
              <div id="template-output-toolbar" className="flex items-center gap-2">
                <button
                  id="template-btn-copy"
                  onClick={handleCopy}
                  className="p-2 border border-[var(--border-base)]/80 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-all flex items-center gap-1 text-[11px] font-mono"
                  title="Copy output to clipboard"
                >
                  {isCopied ? (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  id="template-btn-download"
                  onClick={handleDownload}
                  className="p-2 border border-[var(--border-base)]/80 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-all flex items-center gap-1 text-[11px] font-mono"
                  title="Download Markdown Blueprint file"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>

                {onSaveDraft && (
                  <button
                    id="template-btn-save-vault"
                    onClick={handleSaveToVault}
                    disabled={isSaved}
                    className="p-2 border border-brand/20 bg-brand/5 hover:bg-brand/15 rounded-lg text-brand cursor-pointer transition-all flex items-center gap-1 text-[11px] font-bold"
                    title="Archive this template to CHIDON Vault drafts"
                  >
                    {isSaved ? (
                      <>
                        <FileCheck size={13} className="text-emerald-500 animate-pulse" />
                        <span>Saved to Vault</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={13} />
                        <span>Save Draft</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40 border border-[var(--border-base)]/60 rounded-xl overflow-hidden relative">
            
            {/* Loading Indicator Overlay */}
            {isLoading && (
              <div id="template-loading-overlay" className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-primary/20 border-t-cyan-primary animate-spin" />
                  <Zap size={16} className="absolute inset-x-0 inset-y-0 m-auto text-cyan-primary animate-pulse" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-xs font-mono text-cyan-primary tracking-widest uppercase">GENERATING BLUEPRINT</p>
                  <p className="text-xs text-slate-300 font-bold">Aether Intelligence Engine is structuring and compiling your variables into the layout...</p>
                  <p className="text-[10px] text-slate-500 font-mono italic">"Ensuring pristine typography, structured metadata, and scroll-stopping retention..."</p>
                </div>
              </div>
            )}

            {/* Content Switcher */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar select-text text-left">
              <AnimatePresence mode="wait">
                {generatedOutput ? (
                  <motion.div
                    key="content-generated"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5 text-sm dark:text-slate-200 text-slate-800 leading-relaxed font-sans"
                  >
                    {/* Rendered populated template Markdown body */}
                    <div className="prose prose-invert prose-cyan max-w-none prose-sm">
                      {generatedOutput.split('\n\n').map((paragraph, index) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return null;
                        
                        // Render headers or bullet points beautifully
                        if (trimmed.startsWith('# ')) {
                          return <h1 id={`out-h1-${index}`} key={index} className="text-lg font-black tracking-tight text-cyan-primary uppercase font-mono border-b border-cyan-primary/10 pb-1 mt-4">{trimmed.replace('# ', '')}</h1>;
                        }
                        if (trimmed.startsWith('## ')) {
                          return <h2 id={`out-h2-${index}`} key={index} className="text-sm font-bold tracking-tight text-white uppercase mt-4">{trimmed.replace('## ', '')}</h2>;
                        }
                        if (trimmed.startsWith('### ')) {
                          return <h3 id={`out-h3-${index}`} key={index} className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mt-3">{trimmed.replace('### ', '')}</h3>;
                        }
                        
                        // Parse simple label-values pairs like [PROBLEM]: or [HOOK]:
                        const labelMatch = trimmed.match(/^\[(.*?)\]:(.*)/s);
                        if (labelMatch) {
                          const labelHead = labelMatch[1].trim();
                          const labelBody = labelMatch[2].trim();
                          return (
                            <div id={`out-sec-${index}`} key={index} className="p-3 bg-white/5 border-l-2 border-cyan-primary rounded-r-lg space-y-1">
                              <span className="text-[10px] font-black tracking-wider uppercase font-mono text-cyan-primary block">{labelHead}</span>
                              <p className="text-xs leading-relaxed text-slate-100">{labelBody}</p>
                            </div>
                          );
                        }

                        // Parse simple lists starting with -
                        if (trimmed.startsWith('- ')) {
                          return (
                            <ul id={`out-ul-${index}`} key={index} className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                              {trimmed.split('\n').map((line, lidx) => (
                                <li key={lidx} className="text-slate-300">{line.replace(/^-\s*/, '')}</li>
                              ))}
                            </ul>
                          );
                        }

                        return <p id={`out-p-${index}`} key={index} className="text-xs leading-relaxed opacity-90">{trimmed}</p>;
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="content-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4"
                  >
                    <div className="w-10 h-10 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                      <BookOpen size={18} />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">Selected Blueprint Skeleton</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        Below is the static schema for your selected **{activeTemplate.label}** blueprint. Once you hit 'Populate', the intelligence engine will instantly morph your inputs into premium content.
                      </p>
                    </div>

                    {/* Pre-populated visual schema block */}
                    <div className="w-full bg-slate-900/80 rounded-xl border border-slate-800 p-4 font-mono text-[10px] text-slate-400 select-all leading-relaxed whitespace-pre-wrap text-left relative overflow-hidden max-h-[220px] custom-scrollbar">
                      <div className="absolute top-0 right-0 p-1 px-2 rounded-bl bg-slate-800 border-l border-b border-slate-700 uppercase font-black text-[8px] text-cyan-primary">SCHEMA STRUCTURE</div>
                      {activeTemplate.structure}
                    </div>

                    {/* Visual separation with Example preview */}
                    <div className="w-full border-t border-dashed border-slate-800 pt-4 text-left space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Fidelity Example output:</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed italic bg-neutral-100 dark:bg-zinc-900/30 p-3 rounded-lg border border-[var(--border-base)]/50 whitespace-pre-wrap">
                        {activeTemplate.previewExample}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default TemplateLibrary;
