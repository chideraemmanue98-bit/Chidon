import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, AlertTriangle, CheckCircle, HelpCircle, AlertCircle, 
  Search, ShieldCheck, ArrowRight, AlertOctagon, Info
} from 'lucide-react';

interface ShadowbanMitigationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Restricted keywords database matching policy filters
const RESTRICTED_KEYWORD_CATEGORIES = [
  {
    category: "Medical & Health Claims",
    risk: "High",
    description: "Triggers misinformation models targeting unproven medical alternatives, disease prevention, or cures.",
    keywords: ["cure", "cured", "revers", "herb", "dietary", "immortal", "cancer", "diabetes", "doctor warning", "vaccine", "covid", "healing"]
  },
  {
    category: "Deceptive Finance & Earnings",
    risk: "High",
    description: "Triggers spam filters monitoring get-rich-quick schemes, faked ledgers, or passive income loops.",
    keywords: ["glitch", "money glitch", "passive income", "cash block", "earn $", "instant payout", "get rich", "option link", "financial freedom", "risk free"]
  },
  {
    category: "Security Bypass & Hacking",
    risk: "Critical",
    description: "Severe penalty triggers regarding cyber security violations, software cracks, or physical bypasses.",
    keywords: ["hack", "hacked", "bypass", "unauthorized", "surveillance", "unlocked", "generator tool", "cracked", "cheat code"]
  },
  {
    category: "Sensational & Clickbait Triggers",
    risk: "Medium",
    description: "Borderline policy filters that suppress search impression distributions to guard advertiser-friendly indexes.",
    keywords: ["shocking", "mutiny", "streets destroyed", "conspiracy", "government hide", "poison", "fatal", "classified", "censored", "conspiracy"]
  }
];

export const ShadowbanMitigationModal = ({ isOpen, onClose }: ShadowbanMitigationModalProps) => {
  const [inputText, setInputText] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  // Real-time scan logic
  const scanKeywords = () => {
    const textLower = inputText.toLowerCase();
    const flags: Array<{ category: string; risk: string; description: string; matched: string[] }> = [];

    if (!inputText.trim()) return flags;

    RESTRICTED_KEYWORD_CATEGORIES.forEach(cat => {
      const matched = cat.keywords.filter(kw => {
        // Simple search for keyword boundaries or substring
        const regex = new RegExp(`\\b${kw}|${kw}\\b`, 'i');
        return regex.test(textLower);
      });
      
      if (matched.length > 0) {
        flags.push({
          category: cat.category,
          risk: cat.risk,
          description: cat.description,
          matched
        });
      }
    });

    return flags;
  };

  const detectedFlags = scanKeywords();
  const totalMatchesCount = detectedFlags.reduce((sum, f) => sum + f.matched.length, 0);

  // 5 Actionable recovery steps
  const actionableSteps = [
    {
      title: "Cleanse All Metadata (The Metadata Purge)",
      icon: "🧹",
      tagline: "Primary Compliance Alignment",
      description: "Remove any borderline or clickbait words from active search indices. This resets automatic filter tags.",
      points: [
        "Audit titles, tags, and description boxes to remove sensational vocabulary (e.g. 'SECRET', 'WARNING', 'CURE').",
        "Replace unverified claims with descriptive, educational summaries.",
        "Inspect and purge links inside pinned comments; suspicious affiliate links often flag spam crawlers."
      ],
      proTip: "Check your descriptions on a secondary device to verify that custom link parameters haven't triggered local spam redirects."
    },
    {
      title: "Optimize the 30-Second Hook",
      icon: "⏱️",
      tagline: "Audience Retention Correction",
      description: "Early drop-offs are often mistaken by recommendation models as low-quality or clickbait content.",
      points: [
        "Ensure your visual pacing matches the title immediately—no long, generic intros or splash graphics.",
        "State the ultimate value of the video in the first 10 seconds without dramatic exaggeration.",
        "Add visual or auditory breaks every 5 seconds to keep baseline retention indexes above 50%."
      ],
      proTip: "Keep background tracks 15% quieter than standard speech lines to maintain clear, legible sensory streams."
    },
    {
      title: "Execute a compliant Pacing Refresh",
      icon: "🔄",
      tagline: "Systemic Cache Reset",
      description: "A short, structured break breaks continuous negative reinforcement cycles in recommendation models.",
      points: [
        "Take a complete, silent 3-day pause from uploading on the affected channel.",
        "During this time, do not change settings or repeatedly check analytical metrics (this prevents system polling).",
        "Upload a 100% policy-compliant, calm, and conversational video to re-verify indexing safety guidelines."
      ],
      proTip: "Do not attempt to delete and re-upload the same file—crawlers recognize identical binary assets and double-flag duplicate contents."
    },
    {
      title: "Cultivate External Seed Audiences",
      icon: "🌐",
      tagline: "Traffic Index Diversification",
      description: "Bypassing recommendation bottlenecks requires feeding high-retention external signals to feed positive indices.",
      points: [
        "Share the direct link with premium, context-specific communities (Reddit, Discord, newsletters) during the first 2 hours.",
        "Direct traffic bypasses cold algorithmic bottlenecks and seeds positive engagement signals.",
        "Encourage direct discussion in comments to boost organic metadata multipliers."
      ],
      proTip: "Make sure at least 20% of your views come from direct shares to prove organic external engagement to recommendation algorithms."
    },
    {
      title: "Request Human Creator Audit",
      icon: "🧑‍💻",
      tagline: "Systemic Escalation Option",
      description: "If views remain completely flat despite excellent performance, request a manual review from platform managers.",
      points: [
        "Access the Creator Support Panel inside your Dashboard Settings.",
        "State that your content is being incorrectly suppressed on standard metadata terms and request policy validation.",
        "Prepare screenshots of your compliant diagnostic audit and clean standing records."
      ],
      proTip: "Manual evaluations take 2 to 5 days, during which keeping a completely compliant upload catalog is crucial."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="shadowban_mitigation_modal_wrapper">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] text-left"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* LEFT SIDE: Active Action Steps Explorer */}
          <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto border-r border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 uppercase">
                Tactical Recovery Guide
              </span>
            </div>
            <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">
              Shadowban Mitigation Protocol
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Establish healthy algorithmic standings with these 5 actionable recovery steps.
            </p>

            {/* STEP SELECTION LIST */}
            <div className="space-y-3 mb-6">
              {actionableSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex gap-3 cursor-pointer ${
                    activeStep === idx 
                      ? "bg-slate-50 dark:bg-slate-900/40 border-red-500/40 text-slate-900 dark:text-white shadow-sm" 
                      : "bg-transparent border-slate-150 dark:border-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span className="text-2xl mt-0.5">{step.icon}</span>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider block text-slate-400 dark:text-slate-500">
                      Step {idx + 1}: {step.tagline}
                    </span>
                    <span className="text-xs font-bold block">{step.title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* DETAILED ACTIVE STEP PANEL */}
            <div className="p-5 bg-slate-50/65 dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-900 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{actionableSteps[activeStep].icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                    Execution Details - Step {activeStep + 1}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {actionableSteps[activeStep].tagline}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "{actionableSteps[activeStep].description}"
              </p>

              <ul className="space-y-2.5 pl-1">
                {actionableSteps[activeStep].points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-red-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-start text-[11px] text-amber-600 dark:text-amber-400">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold">PRO-TIP:</strong> {actionableSteps[activeStep].proTip}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Compliance Keyword Check */}
          <div className="w-full md:w-2/5 p-6 md:p-8 bg-slate-50 dark:bg-slate-900/20 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center gap-1.5 text-red-500 font-mono text-[9px] uppercase tracking-wider font-extrabold">
                <ShieldCheck size={12} />
                <span>Keyword Policy Auditor</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Metadata Compliance Scan
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Type your proposed titles, video tags, or description copies below. Our engine checks for policy-violating parameters on-the-fly.
                </p>
              </div>

              {/* Input Area */}
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste title or descriptive text here to scan..."
                  className="w-full h-32 px-4 py-3 bg-white dark:bg-[#060a12] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-sans text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500/50 resize-none placeholder-slate-400"
                />
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="absolute bottom-3 right-3 text-[10px] font-mono font-bold text-slate-400 hover:text-slate-600 uppercase"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Dynamic Scan Outcomes */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500 tracking-wider block">
                  Scan Results ({totalMatchesCount} matches)
                </span>

                <AnimatePresence mode="popLayout">
                  {!inputText.trim() ? (
                    <motion.div 
                      key="empty-scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#060a12]/30 flex flex-col items-center justify-center text-center py-6"
                    >
                      <Search size={16} className="text-slate-400 mb-1.5" />
                      <p className="text-[10px] font-medium text-slate-400">Waiting for text input...</p>
                    </motion.div>
                  ) : totalMatchesCount === 0 ? (
                    <motion.div 
                      key="clean-scan"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">100% Policy Clean</span>
                        <span className="text-[10px] leading-normal block mt-0.5 text-slate-500">
                          No restricted keywords or high-risk clickbait patterns detected. Metadata is safe for distribution.
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="flagged-scan"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1"
                    >
                      {detectedFlags.map((flag, idx) => (
                        <div 
                          key={idx}
                          className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl space-y-1.5"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <AlertCircle size={13} className="text-red-500" />
                              {flag.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black font-mono uppercase ${
                              flag.risk === 'Critical' 
                                ? "bg-red-500 text-white" 
                                : flag.risk === 'High' 
                                  ? "bg-amber-500 text-black" 
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                              {flag.risk} Risk
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 leading-normal">
                            {flag.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                            {flag.matched.map((match, mIdx) => (
                              <span 
                                key={mIdx}
                                className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded font-mono text-[9px] font-bold"
                              >
                                {match}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Action Summary Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Risk Scoring Engine</span>
              <span>v1.2 Active</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
