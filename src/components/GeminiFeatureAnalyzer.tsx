import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Cpu, Wand2, Terminal, ArrowRight, ShieldCheck, Check, Lightbulb, Zap, HelpCircle } from 'lucide-react';

interface GeminiFeatureAnalyzerProps {
  featureId: string;
  featureLabel: string;
  featureDesc: string;
  themeColor?: string;
}

interface FeatureAnalysisData {
  purpose: string;
  strategicAdvantage: string;
  executionBlueprint: string[];
  visualIdentityNotes: string;
  performanceTarget: string;
}

const ANALYSIS_MAP: Record<string, FeatureAnalysisData> = {
  'content-ideas': {
    purpose: "Engineered to dismantle standard writer's blocks by computing high-retention viral concept structures, psychological loops, and trigger hook matrices.",
    strategicAdvantage: "Overrides generic topic suggestions with specific curiosity gaps (Open-Loop Psychology) optimized for high retention rates.",
    executionBlueprint: [
      "Launch a 3-part micro-series focusing on single high-friction concepts.",
      "Integrate an interactive viewer feedback checkpoint at the 45-second marker.",
      "Inject strong visual contrast overlays in the opening 2 seconds."
    ],
    visualIdentityNotes: "Stretched grid layout showcasing cascading viral format components.",
    performanceTarget: "45%+ Audience Retention Index"
  },
  'hashtags': {
    purpose: "Designed to parse indexing hierarchies and recommendation pipelines to construct balanced outreach tags spanning reach tiers.",
    strategicAdvantage: "Circumvents algorithm saturation by combining high-volume reach topics with highly intent-specific keywords.",
    executionBlueprint: [
      "Select 3 high-volume macro-indexes containing active audience trends.",
      "Employ 5 medium-difficulty niche category identifiers.",
      "Inject 2 long-tail, highly exact audience queries."
    ],
    visualIdentityNotes: "Interactive horizontal chip conveyor belt grouped by competitive velocity.",
    performanceTarget: "+160% Discoverability Uplink"
  },
  'scripts': {
    purpose: "Narrative drafting console calibrating script paces, visual actions, dramatic prompts, and decisive conversions.",
    strategicAdvantage: "Synthesizes precise 3-second hook variations paired with seamless body retention transitions and logical CTA pathways.",
    executionBlueprint: [
      "Construct a 'Negative Frame' opening hook to immediately engage audience attention.",
      "Deliver value checkpoints every 15 seconds to eliminate drag.",
      "End with an exact singular conversion pathway without secondary distractions."
    ],
    visualIdentityNotes: "Lined teleprompter layout with structured script duration tracking cues.",
    performanceTarget: "75%+ Early Completion Rate"
  },
  'bio': {
    purpose: "Algorithmic positioning portal engineered to synthesize premium profiles, matching core authority signals to niche interests.",
    strategicAdvantage: "Eliminates empty brand taglines by establishing explicit core proofs, structured value statements, and exact actions.",
    executionBlueprint: [
      "Declare an unambiguous target result within the initial 5 words.",
      "Incorporate one authoritative statistic or credibility validation.",
      "Direct attention downward to your single major Link Gateway."
    ],
    visualIdentityNotes: "Clean multi-version visual card carousel format.",
    performanceTarget: "+24% Follower-to-Visitor Conversion"
  },
  'thumbnails': {
    purpose: "Visual psychology architect mapping contrast ratios, emotional layout hubs, text placement, and cognitive friction markers.",
    strategicAdvantage: "Leverages negative-space guidelines and primary visual focal alignments instead of overcrowded custom graphics.",
    executionBlueprint: [
      "Position the primary emotional subject at the exact 1/3 grid intersection.",
      "Apply high-saturation color accents specifically to the single focal item.",
      "Keep text overlay strictly limited to 3 words with bold sans-serif styling."
    ],
    visualIdentityNotes: "Simulated visual quadrant map overlay representation.",
    performanceTarget: "8.5%+ Average Click-Through Rate"
  },
  'competitor-analysis': {
    purpose: "Strategic intelligence terminal constructed to audit competitor content pillars, frequency patterns, and organic traction vectors.",
    strategicAdvantage: "Enables immediate content gap discovery by tracking what topics are underperforming vs rising under competitor feeds.",
    executionBlueprint: [
      "Audit 3 secondary accounts in your immediate follower range.",
      "Identify high-traffic outlier posts that exceed their average views by 2x.",
      "Model their broad topic structure while completely updating the hook and pacing."
    ],
    visualIdentityNotes: "Side-by-side technical pillar comparison grid layout.",
    performanceTarget: "Outperform Niche Average by 1.8x"
  },
  'posting-schedule': {
    purpose: "Temporal logistics compiler computing highest-probability viewer interaction slots cross-checked with active zones.",
    strategicAdvantage: "Exits rigid standard slots to schedule posts 30 minutes prior to major high-activity nodes per timezone.",
    executionBlueprint: [
      "Configure alerts for peak interaction slots between Tuesday and Thursday.",
      "Maintain a consistent daily distribution sequence without gaps.",
      "Monitor sudden momentum anomalies during holiday cycles."
    ],
    visualIdentityNotes: "Chronological schedule blocks with interactive highlight overlays.",
    performanceTarget: "100% Timing Precision Matrix"
  },
  'engagement-calc': {
    purpose: "Mathematical growth sandbox projecting 30-day development plans while tracking interaction ratios.",
    strategicAdvantage: "Translates abstract social metrics into active channel milestones with clear daily tasks.",
    executionBlueprint: [
      "Respond to comments within the initial 30 minutes of uploading.",
      "Pin a constructive question on your thread to drive comment lengths.",
      "Directly reward active advocates with dedicated project shoutouts."
    ],
    visualIdentityNotes: "Digital metric calculator matrix styled with custom bold neon indicators.",
    performanceTarget: "Optimize System Interaction by 3.5x"
  },
  'trending': {
    purpose: "Algorithm tracking radar identifying surging content queries before they reach general saturation points.",
    strategicAdvantage: "Utilizes early velocity indicators to give your scripts primary algorithmic position for emerging trends.",
    executionBlueprint: [
      "Verify trend momentum scores exceed 70 before designing content.",
      "Integrate trending topics as creative metaphors rather than main keywords.",
      "Publish your take within 24 hours of trend detection."
    ],
    visualIdentityNotes: "Interactive real-time momentum graph and glowing hot tickers.",
    performanceTarget: "Capture Surging Algorithmic Traffic"
  },
  'personas': {
    purpose: "Psychographic profiler mapping targeted demographic segments, primary triggers, and visual behaviors.",
    strategicAdvantage: "Replaces basic age/location charts with clear psychological dossiers explaining what drives viewer shares and loyalty.",
    executionBlueprint: [
      "Speak directly to one highly specific viewer archetype per script.",
      "Address their core frustration in the opening sentence.",
      "Use their specific vocabulary and slang tags to establish authority."
    ],
    visualIdentityNotes: "Dossier badge layout reminiscent of highly classified profiles.",
    performanceTarget: "Establish High-LTV Audience Pillars"
  },
  'ruled-book': {
    purpose: "Authentic lined digital canvas designed to provide organic, low-distraction scribing and journaling flow.",
    strategicAdvantage: "Fuses clean, classical note-taking aesthetics with durable automated cloud replication.",
    executionBlueprint: [
      "Use the title fields to catalog specific script sequences.",
      "Structure notes using clear bullet points to match the authentic lines.",
      "Keep a historical record of creative ideas to build custom backlogs."
    ],
    visualIdentityNotes: "Clean white notebook background styled with faint blue ruled sheets.",
    performanceTarget: "Optimize Ideation focus index by 200%"
  },
  'template-library': {
    purpose: "High-conversion blueprint index designed for immediately creating structure-perfect bios and frameworks.",
    strategicAdvantage: "Provides proven social copywriting structures immediately customized to your input niche.",
    executionBlueprint: [
      "Select a baseline strategy matching your immediate business profile.",
      "Apply the generated script outlines directly to your active content list.",
      "Incorporate the custom hook patterns to lift CTR metrics."
    ],
    visualIdentityNotes: "Clean cards library interface showing pre-parsed templates.",
    performanceTarget: "Save Over 12 Hours of Drafting Weekly"
  }
};

const DEFAULT_ANALYSIS: FeatureAnalysisData = {
  purpose: "Advanced cognitive sub-system designed to automate analytical content generation, metadata optimization, and audience retention.",
  strategicAdvantage: "Bypasses standard creative limitations by structuring content directly around verified algorithmic performance metrics.",
  executionBlueprint: [
    "Input your niche context accurately to align intelligence generation.",
    "Export high-quality scripts directly to your Chidon Vault or notebook.",
    "Run periodic optimization passes to keep content completely fresh."
  ],
  visualIdentityNotes: "High-contrast technical grid container layout.",
  performanceTarget: "Establish Algorithmic Dominance"
};

export const GeminiFeatureAnalyzer: React.FC<GeminiFeatureAnalyzerProps> = ({
  featureId,
  featureLabel,
  featureDesc,
  themeColor
}) => {
  const analysis = ANALYSIS_MAP[featureId] || DEFAULT_ANALYSIS;
  const [activeTab, setActiveTab] = useState<'purpose' | 'strategy' | 'blueprint'>('purpose');
  
  // Custom Live Gemini Expert Niche Blueprints state
  const [customNiche, setCustomNiche] = useState('');
  const [liveResult, setLiveResult] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');

  const runLiveAnalysis = async () => {
    if (!customNiche.trim()) return;
    setLiveLoading(true);
    setLiveError('');
    setLiveResult('');
    try {
      const prompt = `Act as an Elite AI Architect of Chidon IQ Workspace.
      Analyze the feature [${featureLabel}] which does: "${featureDesc}".
      Provide a highly customized, bold, and authoritative 3-step creative blueprint specifically for this niche: "${customNiche}".
      Keep response concise (max 100 words), professional, and use bullet points with **bold keys** for extreme tactical value.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Chidon IQ central network timeout or invalid stream.");
      }

      const data = await response.json();
      if (data && data.text) {
        setLiveResult(data.text);
      } else {
        throw new Error("No textual response synthesized by Gemini Core.");
      }
    } catch (err: any) {
      setLiveError(err.message || "Failed to establish bridge to Gemini Central.");
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="card-base p-6 border-2 border-[var(--border-base)] rounded-2xl bg-[var(--bg-card)] shadow-lg relative overflow-hidden flex flex-col gap-6 text-left selection:bg-cyan-500/20">
      {/* Decorative Diagonal Stripes */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 via-transparent to-transparent pointer-events-none -z-10" />
      
      {/* Header and Core Brand Markers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-base)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-primary animate-pulse shrink-0">
            <Brain size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">GOOGLE GEMINI PROTOCOL</span>
              <span className="text-[8px] font-mono bg-cyan-500/15 text-cyan-500 border border-cyan-500/20 px-1.5 py-0.2 rounded font-black uppercase">CORE DEEP DIVE</span>
            </div>
            <h3 className="text-lg font-display font-extrabold text-[var(--text-primary)] tracking-tight">
              Strategic Feature Analysis
            </h3>
          </div>
        </div>

        {/* Tactical target metric bubble */}
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900/60 border border-[var(--border-base)]/60 text-right flex flex-col justify-center">
          <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider block">TARGET RESULT:</span>
          <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-primary">{analysis.performanceTarget}</span>
        </div>
      </div>

      {/* Grid: Pre-Analyzed Tactical Details + Live Consultation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pre-analyzed tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation tabs */}
          <div className="flex border-b border-[var(--border-base)]/60 gap-4">
            {(['purpose', 'strategy', 'blueprint'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 text-xs font-mono uppercase tracking-wider border-b-2 font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-primary'
                    : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
                }`}
              >
                {tab === 'purpose' && '🎯 Operational Purpose'}
                {tab === 'strategy' && '⚡ Strategic Edge'}
                {tab === 'blueprint' && '🛠️ Action Guidelines'}
              </button>
            ))}
          </div>

          {/* Tab content renders */}
          <div className="min-h-[100px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.2 }}
                className="w-full text-sm leading-relaxed text-[var(--text-secondary)]"
              >
                {activeTab === 'purpose' && (
                  <div className="space-y-2">
                    <p className="font-sans font-medium text-[var(--text-primary)]">{analysis.purpose}</p>
                    <p className="text-xs font-mono text-slate-400 mt-2 flex items-center gap-1.5">
                      <Terminal size={12} className="text-cyan-500 shrink-0" /> Unique Appearance: {analysis.visualIdentityNotes}
                    </p>
                  </div>
                )}
                
                {activeTab === 'strategy' && (
                  <p className="font-sans font-medium text-[var(--text-primary)]">
                    {analysis.strategicAdvantage}
                  </p>
                )}

                {activeTab === 'blueprint' && (
                  <ul className="space-y-2 text-xs font-sans font-medium text-[var(--text-primary)]">
                    {analysis.executionBlueprint.map((step, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-primary flex items-center justify-center font-mono text-[9px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="flex-1 mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Live Gemini Expert consultation interface */}
        <div className="lg:col-span-5 p-4 rounded-xl border-2 border-[var(--border-base)]/60 bg-slate-50 dark:bg-zinc-900/30 flex flex-col gap-3 min-h-[160px] relative">
          <div className="flex items-center gap-1.5 justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-cyan-500" />
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[var(--text-primary)]">Live Niche Blueprint</span>
            </div>
            <span className="text-[8px] font-mono text-slate-400 bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded font-bold">API REPLICATED</span>
          </div>

          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-sans font-medium">
            Generate custom tactical advice for your precise niche instantly using Google Gemini.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Vintage Watches, Keto Diet, SaaS Startup"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              className="px-3 py-2 text-xs bg-[var(--bg-card)] border-2 border-[var(--border-base)] rounded-xl focus:outline-none focus:border-cyan-500 flex-1 font-sans font-medium placeholder-slate-400 text-[var(--text-primary)]"
              disabled={liveLoading}
              onKeyDown={(e) => e.key === 'Enter' && runLiveAnalysis()}
            />
            <button
              onClick={runLiveAnalysis}
              disabled={liveLoading || !customNiche.trim()}
              className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.25)] hover:-translate-y-0.5 disabled:opacity-50 disabled:-translate-y-0 disabled:shadow-none shrink-0"
              title="Activate Chidon IQ Gemini Engine"
            >
              {liveLoading ? (
                <Cpu size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
            </button>
          </div>

          {/* Renders Live blueprint response content dynamic container */}
          <AnimatePresence mode="popLayout">
            {liveLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 py-4 text-xs font-mono text-cyan-600 dark:text-cyan-primary font-bold"
              >
                <Cpu size={14} className="animate-spin" />
                <span>Synthesizing custom blueprint...</span>
              </motion.div>
            )}

            {liveResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 text-xs text-[var(--text-primary)] leading-relaxed font-sans font-medium max-h-[140px] overflow-y-auto custom-scrollbar"
              >
                <div className="whitespace-pre-wrap">
                  {liveResult}
                </div>
              </motion.div>
            )}

            {liveError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-2 text-[10px] font-mono text-red-500 font-bold bg-red-100/10 border border-red-500/20 rounded-lg text-center"
              >
                {liveError}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
