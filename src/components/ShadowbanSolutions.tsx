import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Shield, ShieldAlert, AlertCircle, CheckCircle2, Copy, BookOpen, 
  ArrowLeft, RefreshCcw, FileText, BarChart, HardDrive, 
  HelpCircle, Zap, Upload, Play, Heart, Trash2, Plus, 
  ExternalLink, ChevronRight, Check, AlertTriangle, MessageSquare, Info
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ShadowbanSolutionsProps {
  onGenerate: (prompt: string, displayPrompt?: string) => Promise<any>;
  messages: any[];
  loading: boolean;
  error: string | null;
  onGenerateFeedback: (featureId: string, content: string) => void;
  onSaveDraft: (featureId: string, content: string, title: string) => void;
  feature: {
    id: string;
    label: string;
    description: string;
    themeColor: string;
    glowColor: string;
  };
  onBack: () => void;
}

// SAMPLE CHANNELS PRESETS FOR INCREDIBLE USER EXPERIENCE (No typing 10 videos)
const CHANNEL_PRESETS = [
  {
    name: "Scenario A: High Policy-Risk Channel (Sensitive Topics & Clickbait)",
    url: "https://youtube.com/c/AIFinanceCuresDaily",
    impressions: "450,000",
    ctr: "1.8",
    avd: "0m 45s",
    retention: "18",
    strikes: "1 Warning",
    videos: [
      {
        title: "HOW I RECOVERED 100% SIGHT IN 2 DAYS USING MY SECRET TEA (CURE ALL DISEASE!) 😱🌱",
        thumbnail: "Extreme before/after eyes with medical red syringes and text 'CURED ALL!'",
        description: "Medical advice, home remedy for vision correction, using affiliate link to proprietary herb powder. Tagged with cancer cure, blindness treatment."
      },
      {
        title: "SECRET AI MONEY GLITCH: EARN $15,000 DAILY TONIGHT WITHOUT WORKING! 💸🤖 (NOT CLICKBAIT)",
        thumbnail: "Faked banking ledger with custom arrows showing $100K transfer, neon green theme",
        description: "Get rich quick strategy. Highly sensitive finance keywords. Recommends registering under special binary option link."
      },
      {
        title: "WARNING: THE UNREPORTED MASSIVE MUTINY HAPPENING IN NY STREETS RIGHT NOW (POLITICS UNDER WORLD WAR 3)",
        thumbnail: "Explosion background, military tanks, text 'STREETS DESTROYED!'",
        description: "Highly dramatized sociopolitical commentary. Flags sensitive filter tags: war, riots, global fallout, violence."
      },
      {
        title: "WHY THE GOVERNMENT IS FEEDING YOU PLASTIC: THE SHOCKING TRUTH THE FDA HID FROM YOU",
        thumbnail: "A skull placed inside a food box. Massive glow yellow text 'POISON!'",
        description: "Unverified health claims, conspiracy regarding governmental food supplies. High policy risk."
      },
      {
        title: "THIS COCONUT OIL REVERSES CACHEXIA AND STAGE 4 DEGRADATION IMMEDIATELY (DIETARY DOCTRINE)",
        thumbnail: "A bowl of oil with medical cross sticker, text 'DIABETES AND DECAY KILLER'",
        description: "Unproven health claims violating medical suppression parameters. High spam flags."
      },
      {
        title: "Earn $400 every hour copy-pasting Online Translator files (Easy student method)",
        thumbnail: "A student holding thick cash blocks. Text 'INSTANT PAYOUT'",
        description: "High density of keyword triggers about passive income. Low-quality reuse guide."
      },
      {
        title: "Shocking footage from restricted nuclear military zones (They fired at my drone!)",
        thumbnail: "Explosive drone view under military fire overlay, text 'RECON FOR REAL'",
        description: "Dramatized drone surveillance of unauthorized facilities. Potential violation of safety rules."
      },
      {
        title: "The hidden secret to live to 150 years old from the oldest monk in Tibet",
        thumbnail: "Ancient monk face overlaid with young child glow, text 'RETAIN IMMORTAL'",
        description: "Life-extension and medical pseudo-science claims. Moderately flagged as low scientific accuracy."
      },
      {
        title: "If you don't take this mineral immediately, your liver is decaying (DOCTOR WARNING)",
        thumbnail: "Anatomical liver in yellow warning triangles, text 'FATAL LEAK!'",
        description: "Alarming health hooks. Misleading clickbait triggering sensitive organ filter indexes."
      },
      {
        title: "How I hacked my neighbor's smart security camera using a $10 tool (FOR VALUE EXPOSURE ONLY)",
        thumbnail: "Surveillance split screen showing dark profile inside house. Text 'CAUGHT DIRECT'",
        description: "Security bypass content, borderline encouraging malicious or unauthorized privacy breaches."
      }
    ]
  },
  {
    name: "Scenario B: Safe Content, Extremely Low Performance (Low-Retention & Slow Pace)",
    url: "https://youtube.com/c/CalmGardeningConcepts_100",
    impressions: "12,000",
    ctr: "2.1",
    avd: "3m 30s",
    retention: "15",
    strikes: "None",
    videos: [
      {
        title: "An introduction to gardening and planting organic carrots in your backyard during the spring season",
        thumbnail: "A simple photo of soil in sunlight. Low contrast, no text.",
        description: "Long-form peaceful educational content showing standard soil preparations. Step-by-step planting."
      },
      {
        title: "How to choose a medium-sized shovel at your local hardware store (Review and specifications)",
        thumbnail: "Three shovels leaning against a wooden wall.",
        description: "Detailed analysis of gardening tools and handles, specifications, and costs. Low sensory engagement."
      },
      {
        title: "Pruning tomato vines: An in-depth 45-minute live stream tutorial with questions answered",
        thumbnail: "Red tomatoes in foliage with white text 'Pruning Tomato Vines'",
        description: "A recording of a live garden session with organic, unprompted chatting and garden walks."
      },
      {
        title: "Watering schedules under overcast weather: My personal soil moisture observation diary",
        thumbnail: "Water droplets falling from a black hose.",
        description: "Calm voiceover discussing the daily humidity index and soil physics. No hooks or loops."
      },
      {
        title: "The history of peat moss and organic earth compost mixtures in modern agricultural practices",
        thumbnail: "Sack of generic compost on a wheelbarrow.",
        description: "Academic narrative detailing historical earth compositions and carbon cycles."
      },
      {
        title: "Testing different watering cans (Metal heavy-duty models versus lightweight blue plastics)",
        thumbnail: "A metal can next to a plastic can.",
        description: "Detailed reviews of water discharge speeds and durability of various household products."
      },
      {
        title: "My 30-day organic kale growth progress (Static timelapse recording with instrumental background)",
        thumbnail: "Small green sprouts coming up.",
        description: "No spoken script. Focus is purely on a slow-growing frame compilation with study tunes."
      },
      {
        title: "Addressing snail infestation on backyard cabbage flowers with hand-removal techniques",
        thumbnail: "A garden snail on green lettuce leaf.",
        description: "Slow-paced tutorial explaining how to safely scoop, check, and move garden slugs to a remote compost yard."
      },
      {
        title: "Reorganizing my tool storage shed on a cloudy Saturday afternoon: Let's clean up together!",
        thumbnail: "A cluttered rack of garden forks and rakes.",
        description: "Calm, casual cleaning vlog. Average Pace. Focus is on relaxing organization cues."
      },
      {
        title: "Final harvest compilation: Summarizing everything we planted in our backyard greenhouse this year",
        thumbnail: "A wooden crate full of mixed soil-covered root vegetables.",
        description: "Relaxed review of harvest crops and organic seeds saved for the winter cycle."
      }
    ]
  },
  {
    name: "Scenario C: Optimistic Safe Channel (Standard Organic Content, Low Impressions Drop)",
    url: "https://youtube.com/c/TechTutorWithDave",
    impressions: "95,000",
    ctr: "3.2",
    avd: "1m 50s",
    retention: "38",
    strikes: "None",
    videos: [
      {
        title: "How to clean up your slow Mac in 10 minutes (Easy terminal commands tutorial)",
        thumbnail: "Optimized folder icon over dark slate with cyan arrow, text 'BOOST SPEED'",
        description: "Technical instructions for clean files, cache wiping, and maximizing CPU space."
      },
      {
        title: "I tested every keyboard under $50. Here is the absolute winner for student coding",
        thumbnail: "Split key layouts with high RGB colors, text 'BEST UNDER $50'",
        description: "Tech hardware testing with direct product references. Sound tests and keystroke reviews included."
      },
      {
        title: "Why your PC is overheating in summer 2026 and how to cool it down instantly",
        thumbnail: "Thermal map representation of computer block with exhaust lines, text 'COOL DOWN'",
        description: "Educational hardware setup, fan cleaning tips, thermal paste maintenance recommendations."
      },
      {
        title: "A complete guide to Git branches for absolute beginners (Learn visual workflows)",
        thumbnail: "Flow diagram of Git merge commit blocks on black canvas, text 'GIT BASICS'",
        description: "Step-by-step programming structure tutorial. High organic value tags, clear descriptions."
      },
      {
        title: "The correct way to backup your external hard drives so you never lose crucial data",
        thumbnail: "A warning lock symbol next to an SSD card, text 'NEVER LOSE DATA'",
        description: "Data retention strategies, cloud storage backups, and automated redundant networks."
      },
      {
        title: "These 5 Chrome extensions make writing student essays 10x faster and cleaner",
        thumbnail: "Flipped chrome tabs in visual stack with rating numbers, text '10X FASTER'",
        description: "Productivity extension review for layout, auto-citation, style mapping, and focus timers."
      },
      {
        title: "I built an automatic plant watering device inside my room using Raspberry Pi",
        thumbnail: "Raspberry circuit board water tube feeding a flower, text 'AUTO GARDEN'",
        description: "Creative maker project, hardware coding steps, loop triggers, and terminal scripting guides."
      },
      {
        title: "Is computer science still a solid career choice in 2026? A brutally honest assessment",
        thumbnail: "A laptop screen displaying mock terminal lines, text 'IS CS DEAD?'",
        description: "Detailed industry insights, job market statistics, dynamic developer strategies, and market assessments."
      },
      {
        title: "How to learn SQL in one weekend: My step-by-step study schedule and files list",
        thumbnail: "Coded databases linked by high-contrast neon lines, text 'SQL SUNDAY'",
        description: "Guide mapping query learning, structured exercises, and free sandbox datasets."
      },
      {
        title: "How I configure my dual monitor setup for maximum software engineering focus",
        thumbnail: "Clean desk setup layout with back glows, text 'MY 2026 RUNTIME'",
        description: "Ergonomics, mount brackets, layout setups, and split view software configuration tips."
      }
    ]
  }
];

export const ShadowbanSolutions = ({
  onGenerate,
  messages,
  loading,
  error,
  onGenerateFeedback,
  onSaveDraft,
  feature,
  onBack
}: ShadowbanSolutionsProps) => {
  const [channelUrl, setChannelUrl] = useState('');
  const [impressions, setImpressions] = useState('');
  const [ctr, setCtr] = useState('');
  const [avd, setAvd] = useState('');
  const [retention, setRetention] = useState('');
  const [strikes, setStrikes] = useState('None');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(-1);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'audit' | 'timeline' | 'myths' | 'dossier'>('diagnosis');
  
  // Last 10 videos state
  const [videosList, setVideosList] = useState<any[]>(
    Array.from({ length: 10 }, (_, i) => ({
      title: '',
      thumbnail: '',
      description: ''
    }))
  );

  // Parse last assistant response from messages
  const lastResponse = [...messages].reverse().find(m => m.role === 'assistant');

  // Interactive Checklist states (Saved in localstorage for continuity!)
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('chidon_shadowban_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('chidon_shadowban_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Handle Preset selection
  const selectPreset = (idx: number) => {
    setActivePresetIndex(idx);
    const preset = CHANNEL_PRESETS[idx];
    setChannelUrl(preset.url);
    setImpressions(preset.impressions);
    setCtr(preset.ctr);
    setAvd(preset.avd);
    setRetention(preset.retention);
    setStrikes(preset.strikes);
    setVideosList(preset.videos.map(v => ({ ...v })));
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setUploadedFileName(file.name);
    }
  };

  // Video table updates
  const updateVideoItem = (idx: number, field: string, val: string) => {
    setVideosList(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Clear or edit manually
  const resetForm = () => {
    setChannelUrl('');
    setImpressions('');
    setCtr('');
    setAvd('');
    setRetention('');
    setStrikes('None');
    setUploadedFile(null);
    setUploadedFileName('');
    setActivePresetIndex(-1);
    setVideosList(Array.from({ length: 10 }, (_, i) => ({ title: '', thumbnail: '', description: '' })));
  };

  // Generate Audit
  const triggerAudit = () => {
    const prompt = `You are a YouTube growth + content policy expert. My YouTube channel is getting low views/reach and I suspect a shadowban or limited recommendation. 

**Channel URL**: ${channelUrl || "Not provided"}
**Recent 28 Days Analytics**:
- Impressions count: ${impressions || "Unknown"}
- Click-Through Rate (CTR): ${ctr || "Unknown"}%
- Average View Duration (AVD): ${avd || "Unknown"}
- First 30 Seconds Retention %: ${retention || "Unknown"}%
- Community Guideline Warnings/Strikes Status: ${strikes || "None"}
${uploadedFileName ? `- Attached Analytics Screenshot Diagnostic Index: ${uploadedFileName}` : ''}

**Last 10 Videos Dataset**:
${videosList.map((v, i) => `Video ${i+1}:
- Title: ${v.title || `Untitled ${i+1}`}
- Thumbnail Concept: ${v.thumbnail || `No details`}
- Description & Keywords: ${v.description || `No details`}`).join('\n\n')}

**Your task**:
Write a comprehensive, premium audit report addressing every requirement below. Write in a direct, no-fluff, highly action-oriented coaching tone. Use an energetic, direct mixture of English and standard creator/grower lingo, including direct, motivating Nigerian/English slang (e.g., "no cap", "dey play", "vibe check", "no dulling", "this thing is real") to spark extreme focus and give authoritative growth instructions.

Structure your response into 4 distinct, clean sections matching these headers EXACTLY so they can be parsed by our neural rendering terminal:

## SECTION 1: GLOBAL DIAGNOSIS
Provide an expert diagnosis checking if the channel shows signs of "limited recommendation" under current YouTube recommendation system policies. Explicitly assess:
- Misleading titles & clickable styling safety (clickbait)
- Repeated topics/formats bordering on "repetitive content" rules
- Keywords triggering sensitive topic filters (e.g. medical claims, violent hooks, fast-money flags)
- First 30s audience retention bottlenecks
- Average CTR under 3% symptoms
- Status of community guideline strikes/history
Identify and explicitly bullet point the top 3 critical flags. Conclude this section with a risk indicator score in this exact tag format:
[RISK_SCORE] = XX (where XX is a number between 0 and 100 representing recommendation suppression risk).

## SECTION 2: CONTENT AUDIT TABLE
Generate a structured markdown table reviewing each of the 10 videos under these precise columns:
| Video Title | Risk Level | Why it's risky | How to fix title/thumbnail/description |
Ensure the Risk Level column has values: "Low Risk 🟢", "Medium Risk 🟡", or "High Risk 🔴". Review all 10 videos in detail with specific safety and metric fixes.

## SECTION 3: 30-DAY RECOVERY ACTION PLAN
Outline exactly 7 highly specific, chronological recovery steps in 30 days to reset search indexes and recommendation reach. Cover:
- What sensitive topics to avoid completely for 2 weeks
- Safety rules for writing "safe but highly clickable" hook titles
- Thumbnail visual rules that bypass suppression algorithms
- Upload frequency + platform formats YouTube current engines favor (Shorts vs long-form ratios)
- Step-by-step instructions on checking restrictions using the YouTube Studio "Restrictions" tab.
Ensure each step is clearly labeled with a checkbox format like:
- [ ] Step X: [Task Title] - Detailed specific task strategy...

## SECTION 4: MYTHS VS REALITY PROTOCOL
List 3 common creator myths about shadowbans (with explanations of why they do not trigger reach suppressions) and 3 harsh realities that actually cause limited reach. Keep descriptions sharp, professional, and clear.`;

    onGenerate(prompt, `Deep Channel Audit & Recovery: ${channelUrl || "Custom Channel"}`);
  };

  // Helper parsing of response markdown
  const parseRiskScore = (text: string) => {
    const match = text.match(/\[RISK_SCORE\]\s*=\s*(\d+)/i);
    return match ? parseInt(match[1]) : null;
  };

  const riskScore = lastResponse ? parseRiskScore(lastResponse.content) : null;

  // Extract table rows dynamically for a custom table view!
  const parseTableRows = (text: string) => {
    const lines = text.split('\n');
    const rows: any[] = [];
    let insideTable = false;
    
    for (const line of lines) {
      if (line.includes('|') && line.toLowerCase().includes('risk level')) {
        insideTable = true;
        continue;
      }
      if (insideTable && line.includes('|')) {
        if (line.includes('---')) continue; // Skip separator line
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 4 && !parts[0].toLowerCase().includes('video title')) {
          rows.push({
            title: parts[0],
            risk: parts[1],
            why: parts[2],
            fix: parts[3]
          });
        }
      } else if (insideTable && !line.trim() && rows.length > 0) {
        insideTable = false;
      }
    }
    return rows;
  };

  const parsedTable = lastResponse ? parseTableRows(lastResponse.content) : [];

  // Parse Myths & Reality sections for a custom side-by-side display
  const parseMythsAndRealities = (text: string) => {
    const lines = text.split('\n');
    const myths: string[] = [];
    const realities: string[] = [];
    let state: 'none' | 'myths' | 'realities' = 'none';

    for (const line of lines) {
      // Crude header sensing
      if (line.toLowerCase().includes('myth') && line.toLowerCase().includes('shadowban')) {
        state = 'myths';
        continue;
      }
      if (line.toLowerCase().includes('realit') || line.toLowerCase().includes('harsh realities')) {
        state = 'realities';
        continue;
      }

      if (line.trim().startsWith('-') || line.trim().startsWith('*') || (line.trim() && /^\d+\./.test(line.trim()))) {
        const clean = line.replace(/^[-*\s\d.]+/g, '').trim();
        if (clean) {
          if (state === 'myths') myths.push(clean);
          else if (state === 'realities') realities.push(clean);
        }
      }
    }
    return { myths: myths.slice(0, 3), realities: realities.slice(0, 3) };
  };

  const parsedMyths = lastResponse ? parseMythsAndRealities(lastResponse.content) : { myths: [], realities: [] };

  // Parse chronological recovery steps
  const parseTimelineSteps = (text: string) => {
    const lines = text.split('\n');
    const steps: any[] = [];
    
    for (const line of lines) {
      if (line.trim().startsWith('- [ ]') || line.trim().startsWith('* [ ]') || line.includes('[ ]') || (line.toLowerCase().includes('step') && line.includes(':'))) {
        const clean = line.replace(/^([-*\s[\] ]+)/g, '').trim();
        if (clean) {
          steps.push(clean);
        }
      }
    }
    return steps.length >= 5 ? steps : [
      "Avoid trigger/sensitive keywords for 2 weeks completely.",
      "Rewrite low-retention video metadata metadata into policy-safe configurations.",
      "Re-design thumbnails avoiding extreme red scales, fake elements, or medical graphics.",
      "Integrate high-rebounding loops in the opening 5-10 seconds of long-form guides.",
      "Shift 30% of content distribution into direct organic Shorts to re-link subscribers.",
      "Audit restriction tags inside YouTube Studio 'Restrictions' tab daily.",
      "Review impressions and query paths 14 days following strategy implementation."
    ];
  };

  const parsedTimeline = lastResponse ? parseTimelineSteps(lastResponse.content) : [];

  // Local calculation of checklist completeness
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (parsedTimeline.length || 7)) * 100);

  // Copy blueprint to clipboard
  const copyBlueprint = () => {
    if (!lastResponse) return;
    navigator.clipboard.writeText(lastResponse.content);
    alert("Full Audit Report copied to clipboard!");
  };

  // Save report to Vault draft standard
  const handleSaveToVault = () => {
    if (!lastResponse) return;
    onSaveDraft(
      'shadowban-solutions',
      lastResponse.content,
      `Channel Audit: ${channelUrl ? channelUrl.replace('https://', '') : 'Self-Audit'}`
    );
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            id="shb_back_btn"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 hover:text-cyan-primary transition-colors cursor-pointer uppercase mb-2"
          >
            <ArrowLeft size={12} /> Back to dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center border border-red-500/30 shadow-md">
              <ShieldAlert className="text-red-500 animate-pulse animate-duration-1000" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tight">Shadowban Solutions</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Tactical recommendation safety audit, policy diagnostics and reach recovery blueprints.</p>
            </div>
          </div>
        </div>
        
        {lastResponse && (
          <button 
            id="shb_re_audit_btn"
            onClick={resetForm}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-red-500/30 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center gap-2 text-slate-700 dark:text-slate-300"
          >
            <RefreshCcw size={13} />
            <span>Audit Another Channel</span>
          </button>
        )}
      </div>

      {!lastResponse ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* INPUT FORM (8 cols) */}
          <div className="card-base p-6 lg:col-span-8 space-y-6 relative overflow-hidden">
            {/* GLOW DECORATOR */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/[0.04] pb-4">
              <h3 className="text-sm font-mono font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} className="text-red-400 animate-pulse" />
                <span>Diagnostic Configuration Console</span>
              </h3>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 font-mono">STEP 1 OF 2</p>
            </div>

            {/* PRESETS GRID BOX */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-extrabold uppercase text-slate-500 tracking-wider">Fast-Loading Audit Presets (Recommended)</span>
              <div className="grid grid-cols-1 gap-2">
                {CHANNEL_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    id={`shb_preset_${i}`}
                    onClick={() => selectPreset(i)}
                    className={cn(
                      "p-3.5 rounded-2xl text-left border text-xs font-medium transition-all flex items-start gap-3 cursor-pointer",
                      activePresetIndex === i 
                        ? "bg-red-500/10 border-red-500/30 text-slate-950 dark:text-white" 
                        : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-800 text-slate-700 dark:text-slate-400"
                    )}
                  >
                    <div className="mt-0.5">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        activePresetIndex === i ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                      )}>
                        {activePresetIndex === i && <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                      </div>
                    </div>
                    <div>
                      <span className="font-extrabold block text-slate-800 dark:text-slate-200">{preset.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 block mt-0.5">URL: {preset.url} | Impressions: {preset.impressions} | CTR: {preset.ctr}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN FORMS */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Channel URL */}
                <div className="space-y-1.5">
                  <label htmlFor="shb_url_input" className="text-[10px] font-mono text-slate-650 dark:text-slate-400 uppercase font-black">Channel Link / URL</label>
                  <input
                    id="shb_url_input"
                    type="url"
                    placeholder="E.g. https://youtube.com/c/CreatorName"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                  />
                </div>

                {/* Impressions (28 days) */}
                <div className="space-y-1.5">
                  <label htmlFor="shb_impressions_input" className="text-[10px] font-mono text-slate-650 dark:text-slate-400 uppercase font-black">Impressions Count (Last 28 Days)</label>
                  <input
                    id="shb_impressions_input"
                    type="text"
                    placeholder="E.g. 250,500"
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* CTR */}
                <div className="space-y-1.5">
                  <label htmlFor="shb_ctr_input" className="text-[10px] font-mono text-slate-650 dark:text-slate-400 uppercase font-black">CTR %</label>
                  <input
                    id="shb_ctr_input"
                    type="number"
                    step="0.1"
                    placeholder="E.g. 2.4"
                    value={ctr}
                    onChange={(e) => setCtr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium font-mono"
                  />
                </div>

                {/* AVD */}
                <div className="space-y-1.5">
                  <label htmlFor="shb_avd_input" className="text-[10px] font-mono text-slate-655 dark:text-slate-400 uppercase font-black">Avg View Duration</label>
                  <input
                    id="shb_avd_input"
                    type="text"
                    placeholder="E.g. 1m 15s"
                    value={avd}
                    onChange={(e) => setAvd(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium font-mono"
                  />
                </div>

                {/* First 30s Retention */}
                <div className="space-y-1.5">
                  <label htmlFor="shb_ret_input" className="text-[10px] font-mono text-slate-650 dark:text-slate-400 uppercase font-black">First 30s Retention %</label>
                  <input
                    id="shb_ret_input"
                    type="number"
                    placeholder="E.g. 35"
                    value={retention}
                    onChange={(e) => setRetention(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 outline-none focus:border-red-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium font-mono"
                  />
                </div>

                {/* Guideline Strikes */}
                <div className="space-y-1.5">
                  <label htmlFor="shb_strike_select" className="text-[10px] font-mono text-slate-650 dark:text-slate-400 uppercase font-black">Guideline Warnings/Strikes</label>
                  <select
                    id="shb_strike_select"
                    value={strikes}
                    onChange={(e) => setStrikes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-300 font-mono font-bold outline-none focus:border-red-500 cursor-pointer appearance-none"
                  >
                    <option value="None">NONE (CLEAN RECORD)</option>
                    <option value="1 Warning">1 WARNING (ACTIVE)</option>
                    <option value="1 Strike">1 STRIKE (REDUCED POWER)</option>
                    <option value="2 Strikes or more">2 STRIKES (HIGH THREAT)</option>
                  </select>
                </div>
              </div>

              {/* DRAG AND DROP SCREENSHOT UPLOAD */}
              <div 
                id="shb_drag_drop_zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer select-none",
                  dragActive ? "border-red-500 bg-red-500/5" : "border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/35 hover:border-slate-400 dark:hover:border-slate-700"
                )}
                onClick={() => document.getElementById('shb_file_upload')?.click()}
              >
                <input
                  id="shb_file_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-xl text-slate-500 dark:text-slate-400">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-300">
                      {uploadedFileName ? `Ready: ${uploadedFileName}` : "Audit Analytics Screenshot (Impressions, CTR, Retention map)"}
                    </p>
                    <p className="text-[10px] text-slate-550 dark:text-slate-500 mt-1 font-mono">Supports drag-and-drop or manual click to upload</p>
                  </div>
                </div>
              </div>

              {/* VIDEO METADATA INPUTS SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/[0.04] pb-2">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-black">Video Ledger Config (Last 10 Assets)</span>
                  <button
                    id="shb_toggle_custom_edit"
                    onClick={() => setIsEditingCustom(!isEditingCustom)}
                    className="text-[10px] font-mono text-red-550 dark:text-red-400 hover:text-red-350 dark:hover:text-red-300 underline font-extrabold pb-0.5 cursor-pointer uppercase"
                  >
                    {isEditingCustom ? "[ Collapse Multi-Row View ]" : "[ Expand Custom Multi-Row View ]"}
                  </button>
                </div>

                {isEditingCustom ? (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {videosList.map((video, vIdx) => (
                      <div key={vIdx} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3 relative">
                        <div className="absolute top-3.5 right-4">
                          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-650 font-bold uppercase">Video Asset #{vIdx + 1}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-550 dark:text-slate-500 uppercase font-bold">Video Title</label>
                            <input
                              type="text"
                              value={video.title}
                              onChange={(e) => updateVideoItem(vIdx, 'title', e.target.value)}
                              placeholder={`E.g. Video Hook Title ${vIdx + 1}`}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-350 dark:border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-550 dark:text-slate-500 uppercase font-bold">Thumbnail Visual Psychology Concepts</label>
                            <input
                              type="text"
                              value={video.thumbnail}
                              onChange={(e) => updateVideoItem(vIdx, 'thumbnail', e.target.value)}
                              placeholder="Describe thumbnail elements (e.g. arrows, text, facial cuts)"
                              className="w-full bg-white dark:bg-slate-950 border border-slate-350 dark:border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-red-500 font-medium"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-550 dark:text-slate-500 uppercase font-bold">First lines of Description & Tags</label>
                          <textarea
                            value={video.description}
                            onChange={(e) => updateVideoItem(vIdx, 'description', e.target.value)}
                            placeholder="Provide details about keywords, health/finance statements, links..."
                            rows={2}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-350 dark:border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-5">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs font-bold font-mono">
                        10
                      </div>
                      <div>
                        <span className="text-xs text-slate-850 dark:text-slate-300 font-black block">Last 10 Assets Mounted and Scanned</span>
                        <span className="text-[10px] text-slate-550 dark:text-slate-500 block leading-tight">These titles, description structures and keywords will feed directly into the policy compliance analysis.</span>
                      </div>
                    </div>
                    <button
                      id="shb_open_raw_btn"
                      onClick={() => setIsEditingCustom(true)}
                      className="px-3.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-[10px] font-mono hover:border-slate-400 dark:hover:border-slate-700 text-slate-650 dark:text-slate-400 font-bold uppercase rounded-lg cursor-pointer shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs font-mono font-bold text-red-300">System Execution Fault</p>
                  <p className="text-[11px] text-red-450 mt-1 leading-normal">{error}</p>
                </div>
              </div>
            )}

            {/* ACTION FOOTER */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono flex items-center gap-1.5">
                <Shield size={12} className="text-cyan-primary" /> Supported by Chidon Neural Engine
              </span>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span className="text-[11px] font-mono font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
                  Cost: 4 Credits
                </span>
                <button
                  id="shb_trigger_audit_btn"
                  onClick={triggerAudit}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white hover:bg-red-400 disabled:opacity-50 font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing DNA...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} fill="currentColor" />
                      <span>Run Deep Diagnostics Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* POLICY NOTES RETAILER (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            <div className="card-base p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                <ShieldAlert size={16} />
                <h4 className="text-[10px] font-mono font-black uppercase tracking-wider">Policy Filters Tracker</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">YouTube employs highly sophisticated, real-time Natural Language Processing models scanning titles, thumbnails and automatic voice caps transcripts across these indexes:</p>
              
              <div className="space-y-3.5 pt-2">
                <div className="border-l-2 border-red-500/30 pl-3 space-y-1">
                  <span className="text-[10.5px] font-mono font-extrabold text-slate-800 dark:text-slate-300 uppercase block tracking-tight">YMYL sensitive filters</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 block leading-tight">Your Money or Your Life triggers (unverified health cure claims, fast passive income hacks, radical economic warnings).</span>
                </div>

                <div className="border-l-2 border-red-500/30 pl-3 space-y-1">
                  <span className="text-[10.5px] font-mono font-extrabold text-slate-800 dark:text-slate-300 uppercase block tracking-tight">Misleading Metadata Suppressions</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 block leading-tight">Extreme before/after imagery, fake play buttons overlayed inside thumbnails, mismatch between title hooks and retention data.</span>
                </div>

                <div className="border-l-2 border-red-500/30 pl-3 space-y-1">
                  <span className="text-[10.5px] font-mono font-extrabold text-slate-800 dark:text-slate-300 uppercase block tracking-tight">Low Sensory-Retention Gates</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 block leading-tight">First 30 seconds retention dropping under 25% explicitly pauses organic recommendation algorithms on related asset indices.</span>
                </div>
              </div>
            </div>

            {/* NIGERIAN GROWTH COACH CORNER */}
            <div className="card-base p-5 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-950 dark:to-slate-900 rounded-2xl space-y-3 relative">
              <span className="absolute -top-2.5 right-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded px-2 py-0.5 font-mono text-[8px] font-black tracking-widest uppercase">PRO COACH INSIGHTS</span>
              <h4 className="text-xs font-mono font-black text-slate-800 dark:text-slate-300 uppercase">Don't Get Suppressed!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic pr-2 font-medium">\"Look, YouTube's recommendation engine is completely automated. If your keywords are setting off health warnings, or your CTR is too low, the algorithm will quietly freeze your impressions. Dey play! We have to find exactly where you're failing compliance so you can reclaim your views.\"</p>
            </div>
          </div>
        </div>
      ) : (
        /* AUDIT REPORT VIEW ACTIVE */
        <div className="space-y-6">
          {/* TOP SUMMARY OVERVIEW CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Risk Gauge */}
            <div className="card-base p-5 flex items-center justify-between relative overflow-hidden">
              <div className="space-y-1 z-10 text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Compliance Risk Rating</span>
                <span className="text-3xl font-display font-black text-red-500 tracking-tight block">
                  {riskScore !== null ? `${riskScore}%` : "CALCULATING"}
                </span>
                <span className="text-[10px] font-bold text-red-400/90 block font-mono">
                  {riskScore !== null && riskScore > 60 ? "CRITICAL POLICY ALERT" : riskScore !== null && riskScore > 30 ? "MODERATE ENGAGEMENT FLAG" : "OPTIMAL HEALTH"}
                </span>
              </div>
              <div className="absolute right-3 bottom-0 top-0 flex items-center justify-center opacity-10">
                <ShieldAlert size={80} className="text-red-500" />
              </div>
            </div>

            {/* Impressions Summary */}
            <div className="card-base p-5 relative overflow-hidden">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Analyzed Volume</span>
                <span className="text-2xl font-mono font-black text-slate-900 dark:text-slate-100 tracking-tight block">{impressions || "14.5K"}</span>
                <span className="text-[10px] text-slate-650 dark:text-slate-400 block font-mono">28 Days Net Impressions</span>
              </div>
            </div>

            {/* CTR Summary */}
            <div className="card-base p-5 relative overflow-hidden">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Impression CTR Metric</span>
                <span className={cn(
                  "text-2xl font-mono font-black tracking-tight block",
                  parseFloat(ctr) < 3 ? "text-amber-500" : "text-emerald-400"
                )}>
                  {ctr || "2.1"}%
                </span>
                <span className="text-[10px] text-slate-650 dark:text-slate-400 block font-mono">
                  {parseFloat(ctr) < 3 ? "Suppressing reach thresholds" : "Healthy click distribution"}
                </span>
              </div>
            </div>

            {/* Action Item Progress */}
            <div className="card-base p-5 text-left flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Recovery Execution progress</span>
                <span className="text-2xl font-mono font-black text-cyan-primary block">{progressPercent}%</span>
              </div>
              {/* Micro Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-350 dark:border-white/[0.04]">
                <div 
                  className="h-full bg-cyan-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* TAB CONTROLS NAVIGATION */}
          <div className="flex border-b border-slate-200 dark:border-white/[0.04] gap-1 overflow-x-auto scroller-hidden">
            {[
              { id: 'diagnosis', label: '1. Policy Diagnosis' },
              { id: 'audit', label: '2. Video Audit ' + (parsedTable.length > 0 ? `(${parsedTable.length})` : '') },
              { id: 'timeline', label: '3. 30-Day Recovery Blueprint' },
              { id: 'myths', label: '4. Myths vs Harsh Realities' },
              { id: 'dossier', label: 'Full Diagnostic Dossier' }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`shb_tab_${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "py-3 px-5 text-xs font-mono font-bold tracking-tight uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab.id 
                    ? "border-red-500 text-slate-900 dark:text-white bg-red-500/[0.02]" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS CONTAINER */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'diagnosis' && (
                <motion.div
                  key="diagnosis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
                    {/* PRIMARY DIAGNOSTIC BLOCK */}
                    <div className="lg:col-span-8 card-base p-6 space-y-6">
                      <div className="border-b border-slate-200 dark:border-white/[0.04] pb-4 flex justify-between items-center">
                        <h4 className="text-sm font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                          <ShieldAlert className="text-red-500" size={16} />
                          <span>Channel Algorithmic Diagnostics Report</span>
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 leading-none">STATUS: COMPLETED</span>
                      </div>

                      {/* TEXT INSIGHTS */}
                      <div className="prose prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                        {/* Render first segment of report containing diagnosis details */}
                        <div className="markdown-body p-1 text-slate-800 dark:text-slate-350">
                          <ReactMarkdown>
                            {lastResponse.content.substring(0, lastResponse.content.indexOf('## SECTION 2') || undefined)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS BAR / RECOMMENDATION METRICS (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* UTILITY SHARE / EXPORT BOX */}
                      <div className="card-base p-5 rounded-2xl space-y-4 text-left">
                        <span className="text-[10px] font-mono text-slate-500 font-extrabold uppercase tracking-wide block">Data Management Protocols</span>
                        
                        <div className="grid grid-cols-1 gap-2.5">
                          <button
                            id="shb_save_vault"
                            onClick={handleSaveToVault}
                            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-red-500/30 text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
                          >
                            <BookOpen size={13} className="text-slate-500 dark:text-slate-400" />
                            <span>Save Report to Vault</span>
                          </button>

                          <button
                            id="shb_copy_clipboard"
                            onClick={copyBlueprint}
                            className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-red-500/30 text-[10px] font-mono font-bold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
                          >
                            <Copy size={13} className="text-slate-500 dark:text-slate-400" />
                            <span>Copy Action Raw Data</span>
                          </button>
                        </div>
                      </div>

                      {/* COACH WARNING */}
                      <div className="card-base p-5 bg-red-950/5 dark:bg-red-950/20 border border-red-550/20 dark:border-red-900/30 rounded-2xl space-y-3">
                        <h4 className="text-xs font-mono font-black text-red-650 dark:text-red-400 uppercase tracking-tight flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-500" />
                          <span>COACH ADVICE (IMPORTANT!)</span>
                        </h4>
                        <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed italic">
                          "Oya, this is not the time to be folding hands or giving excuses! The diagnosis is clear. Check the Video Audit tab now to locate which specific items are dragging you down, then run the 7-step blueprint immediately to force a recommendation reset. No stalling!"
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* METADATA ANALYSIS TABLE */}
                  <div className="card-base rounded-3xl overflow-hidden text-left">
                    <div className="p-5 border-b border-slate-250 dark:border-white/[0.04] bg-slate-50/50 dark:bg-slate-950/30">
                      <h4 className="text-sm font-mono font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">
                        Step 2: Interactive Video Action ledger
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">Direct safety threat assessment mapping the YouTube compliance index for each item from your submitted video registry.</p>
                    </div>

                    {parsedTable.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-slate-250 dark:border-white/[0.03] bg-slate-100/50 dark:bg-slate-900/40 text-[9px] font-mono text-slate-600 dark:text-slate-500 uppercase tracking-widest font-black text-left">
                              <th className="p-4 pl-6 w-12 text-slate-500">Index</th>
                              <th className="p-4 min-w-[200px]">Video Title / Assets</th>
                              <th className="p-4 w-32">Risk rating</th>
                              <th className="p-4">Core Violation Cause</th>
                              <th className="p-4 pr-6">Algorithmic Safety Fix</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-white/[0.02]">
                            {parsedTable.map((row, rIdx) => {
                              const isHigh = row.risk?.toLowerCase().includes('high') || row.risk?.includes('🔴');
                              const isMed = row.risk?.toLowerCase().includes('med') || row.risk?.includes('🟡');
                              
                              return (
                                <tr key={rIdx} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/30 transition-colors text-xs">
                                  <td className="p-4 pl-6 font-mono text-slate-500 dark:text-slate-600 font-extrabold">{rIdx + 1}</td>
                                  <td className="p-4">
                                    <span className="font-extrabold text-slate-800 dark:text-slate-200 block max-w-sm line-clamp-2 leading-snug">{row.title}</span>
                                  </td>
                                  <td className="p-4">
                                    <span className={cn(
                                      "px-2.5 py-0.5 rounded-full font-mono text-[9px] font-black tracking-wide inline-block",
                                      isHigh ? "bg-red-500/10 text-red-500" :
                                      isMed ? "bg-amber-500/10 text-amber-500" :
                                      "bg-emerald-500/10 text-emerald-550 dark:text-emerald-400"
                                    )}>
                                      {row.risk || "Evaluating"}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-400 leading-normal font-medium max-w-xs">{row.why}</td>
                                  <td className="p-4 pr-6 text-slate-700 dark:text-slate-300 leading-normal max-w-sm font-semibold">{row.fix}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-left">
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">Our neural parser is currently preparing the high-fidelity table ledger. You can inspect the table layout directly in the full markdown text inside the <strong>"Full Diagnostic Dossier"</strong> tab below.</p>
                        <button
                          id="shb_fall_tab"
                          onClick={() => setActiveTab('dossier')}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-350 dark:border-slate-850 text-xs font-mono font-bold text-red-550 dark:text-red-400 uppercase rounded-xl hover:border-slate-450 dark:hover:border-slate-700 cursor-pointer"
                        >
                          Jump To Dossier Markdown
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* RECOVERY BLUEPRINT SCREEN */}
                  <div className="card-base p-6 rounded-3xl text-left space-y-6">
                    <div>
                      <h4 className="text-sm font-mono font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="text-cyan-primary animate-pulse500" size={16} />
                        <span>Step 3: Tactical 30-Day Recovery Timeline Tracker</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">Tick off these actions chronologically over the next 30 days to reset search crawling indexes and unlock frozen reach.</p>
                    </div>

                    {/* PROGRESS SCALE CARD */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-white/[0.02]">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-550 dark:text-slate-500 uppercase block font-extrabold">Active Status</span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">{completedCount} of {parsedTimeline.length} protocols executed successfully</span>
                      </div>
                      <span className="text-xl font-mono font-black text-cyan-primary">{progressPercent}% DONE</span>
                    </div>

                    {/* TIMELINE STEPS INTERACTIVE CHECKLIST */}
                    <div className="space-y-3">
                      {parsedTimeline.map((step, idx) => {
                        const stepId = `step-${idx}`;
                        const isChecked = !!checklist[stepId];
                        return (
                          <div 
                            key={idx}
                            id={`shb_checklist_item_${idx}`}
                            onClick={() => setChecklist(prev => ({ ...prev, [stepId]: !isChecked }))}
                            className={cn(
                              "p-4 rounded-2xl border text-xs leading-relaxed transition-all flex items-start gap-3.5 cursor-pointer select-none",
                              isChecked 
                                ? "bg-slate-50/50 dark:bg-slate-900/30 border-cyan-500/20 text-slate-400 dark:text-slate-500" 
                                : "bg-white dark:bg-slate-900 border-slate-205 dark:border-slate-850 text-slate-800 dark:text-slate-200 hover:border-slate-405 dark:hover:border-slate-800"
                            )}
                          >
                            <div className="mt-0.5 shrink-0">
                              <div className={cn(
                                "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                                isChecked ? "bg-cyan-primary border-cyan-primary text-black" : "border-slate-300 dark:border-slate-650"
                              )}>
                                {isChecked && <Check size={11} strokeWidth={3} />}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className={cn(
                                "font-mono text-[9px] uppercase tracking-wider font-extrabold block mb-0.5",
                                isChecked ? "text-cyan-primary/50" : "text-cyan-primary"
                              )}>
                                Protocol Phase {idx + 1}
                              </span>
                              <p className={cn(
                                "font-medium leading-relaxed leading-snug",
                                isChecked ? "line-through text-slate-400 dark:text-slate-500" : ""
                              )}>
                                {step}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'myths' && (
                <motion.div
                  key="myths"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    {/* MYTHS (CYAN/MOCK RED ACCENTS) */}
                    <div className="card-base p-6 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                        <HelpCircle size={18} />
                        <h4 className="text-sm font-mono font-black uppercase tracking-wider">Shadowban Myths (Unfounded)</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">These actions or criteria do not trigger systemic reach suppression under current algorithm rules:</p>
                      
                      <div className="space-y-3 pt-2">
                        {parsedMyths.myths.length > 0 ? (
                          parsedMyths.myths.map((myth, mIdx) => (
                            <div key={mIdx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-cyan-primary font-black uppercase">MYTH {mIdx + 1}</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{myth}</p>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-cyan-primary font-black uppercase">Myth 1: Re-uploading Deleted Videos</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">Deleting a video and immediate upload does not trigger a whole channel shadowban; it merely duplicates asset checksums.</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-cyan-primary font-black uppercase">Myth 2: Sub-Genre Swearing</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">Light swearing or regional accents do not penalize recommendation indices unless violently crude or threatening.</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-cyan-primary font-black uppercase">Myth 3: YouTube Hates My Accent</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">Language translation systems optimize accents globally; region suppression is driven by localized viewer retention, not speech accents.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* HARSH REALITIES */}
                    <div className="card-base p-6 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                        <AlertTriangle size={18} />
                        <h4 className="text-sm font-mono font-black uppercase tracking-wider">Harsh Realities (Suppressors)</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">These critical factors are mathematically proven to trigger recommendation blocks across standard social indices:</p>

                      <div className="space-y-3 pt-2">
                        {parsedMyths.realities.length > 0 ? (
                          parsedMyths.realities.map((real, rIdx) => (
                            <div key={rIdx} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-red-500 dark:text-red-400 font-black uppercase">REALITY {rIdx + 1}</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">{real}</p>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-red-500 dark:text-red-400 font-black uppercase">Reality 1: Sensitive Filter Triggers (YMYL)</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">Releasing diet advice remedies or fast-money loops flags automated filters for scientific review, holding recommendations immediately.</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-red-500 dark:text-red-400 font-black uppercase">Reality 2: Drop under 20% Retention</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">If first 30 seconds viewer retention drops below 25%, recommendation loops drop the video feed globally. No cap!</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-250 dark:border-white/[0.01] rounded-xl space-y-1">
                              <span className="text-[10px] font-mono text-red-500 dark:text-red-400 font-black uppercase">Reality 3: Repetitive Metadata Spam</span>
                              <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">Clogging descriptions with hundreds of repeated keyword tags forces algorithmic suppression for malicious SEO manipulation.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'dossier' && (
                <motion.div
                  key="dossier"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card-base p-6 rounded-3xl text-left"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/[0.04] pb-4 mb-5">
                    <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Raw System diagnostic output</span>
                    <button
                      id="shb_copy_dossier"
                      onClick={copyBlueprint}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[9px] font-mono hover:border-slate-400 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase rounded-lg cursor-pointer"
                    >
                      Copy Raw Text
                    </button>
                  </div>

                  <div className="markdown-body p-1 text-slate-800 dark:text-slate-300 space-y-4 text-sm leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown>{lastResponse.content}</ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
