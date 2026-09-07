import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, CreditCard, ShieldAlert, Kanban, Search, Zap, Plus, 
  Trash2, Play, Pause, RotateCcw, Award, CheckCircle2, DollarSign,
  Briefcase, Send, Calculator, Percent, Layers, Copy, Check, Clock,
  ThumbsUp, Hash, Filter, User, Calendar, Star, BookOpen, Volume2
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface SmartToolsSuiteProps {
  myProfile: any;
  checkAndDeductCredits?: (cost: number, description: string) => Promise<boolean>;
  onSendToNotepad?: (title: string, content: string) => void;
}

export const SmartToolsSuite: React.FC<SmartToolsSuiteProps> = ({ 
  myProfile,
  checkAndDeductCredits,
  onSendToNotepad
}) => {
  // Navigation: Category selection & active tool selection
  const [activeToolId, setActiveToolId] = useState<string>('contract_gen');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const downloadAsTxtFile = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${filename.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 1. AI SLA CONTRACT GENERATOR STATES
  const [contractClient, setContractClient] = useState('Acme Marketing Corp');
  const [contractCreator, setContractCreator] = useState(myProfile?.fullName || 'Chidon Expert');
  const [contractRate, setContractRate] = useState('2500');
  const [contractDeliverables, setContractDeliverables] = useState('3 short-form videos, 1 SEO research workbook');
  const [contractRevisions, setContractRevisions] = useState('2');
  const [contractDeadline, setContractDeadline] = useState('2026-09-15');
  const [contractResult, setContractResult] = useState('');
  const [generatingContract, setGeneratingContract] = useState(false);

  const generateContract = async () => {
    if (generatingContract) return;
    setGeneratingContract(true);
    try {
      if (checkAndDeductCredits) {
        const allowed = await checkAndDeductCredits(2, 'AI SLA Contract Generation');
        if (!allowed) {
          setGeneratingContract(false);
          return;
        }
      }
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a highly professional, legal-grade freelance Service Level Agreement (SLA) contract tailored for:
Client: ${contractClient}
Contractor/Creator: ${contractCreator}
Sovereign Project Rate: $${contractRate} USD
Deliverables: ${contractDeliverables}
Revision Limit: ${contractRevisions} cycles
Deadline: ${contractDeadline}

Structure the output with professional formatting, clear sections (Scope, Payment & Milestones, Revisions, Confidentiality, Signatures), and an authoritative professional tone. Do not write markdown blocks around it, just raw clean text.`,
          model: "gemini-3.8-flash",
          creditsDeductedByClient: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setContractResult(data.text);
      } else {
        setContractResult("Error generating contract. Please verify your internet connection.");
      }
    } catch (err) {
      setContractResult("Failed to generate agreement. Core connection timeout.");
    } finally {
      setGeneratingContract(false);
    }
  };

  // 2. INTERACTIVE INVOICE GENERATOR STATES
  const [invoiceItems, setInvoiceItems] = useState([
    { id: '1', desc: 'Sovereign Audience Audit', qty: 1, rate: 800 },
    { id: '2', desc: 'Short-form Video Copy & Directing', qty: 3, rate: 450 }
  ]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemRate, setNewItemRate] = useState(150);
  const [invoiceVat, setInvoiceVat] = useState(7.5);
  const [invoiceTheme, setInvoiceTheme] = useState<'slate' | 'indigo' | 'emerald'>('indigo');

  const addInvoiceItem = () => {
    if (!newItemDesc) return;
    setInvoiceItems([...invoiceItems, { id: Date.now().toString(), desc: newItemDesc, qty: 1, rate: newItemRate }]);
    setNewItemDesc('');
    setNewItemRate(150);
  };

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const invoiceSubtotal = invoiceItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const invoiceTaxAmount = invoiceSubtotal * (invoiceVat / 100);
  const invoiceTotal = invoiceSubtotal + invoiceTaxAmount;

  // 3. AI ARBITRATOR STATES
  const [disputeClient, setDisputeClient] = useState('Acme Marketing Corp');
  const [disputeDesc, setDisputeDesc] = useState('Client claims the short form hooks are too aggressive and wants 50% refund, but I delivered exactly as specified in the creative brief.');
  const [disputeTone, setDisputeTone] = useState<'neutral' | 'strict' | 'conciliatory'>('neutral');
  const [disputeResult, setDisputeResult] = useState('');
  const [generatingArbitration, setGeneratingArbitration] = useState(false);

  const runArbitration = async () => {
    if (generatingArbitration) return;
    setGeneratingArbitration(true);
    try {
      if (checkAndDeductCredits) {
        const allowed = await checkAndDeductCredits(2, 'AI Escrow Arbitration');
        if (!allowed) {
          setGeneratingArbitration(false);
          return;
        }
      }
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are Chidon AI Court, an unbiased, state-of-the-art decentralized freelance arbitrator. A dispute has been submitted:
Contractor: ${myProfile?.fullName || 'Chidon Expert'}
Client: ${disputeClient}
Case Description: ${disputeDesc}
Desired Arbitrator Personality: ${disputeTone}

Generate an exhaustive, highly structured judicial ruling. 
Include:
1. Fact-finding & Analysis.
2. Reasonable Revision or Release Assessment.
3. Exact Refund Release % (e.g. Release 70% to Seller, 30% to Client).
4. Concrete actionable next-steps.`,
          model: "gemini-3.8-flash",
          creditsDeductedByClient: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setDisputeResult(data.text);
      } else {
        setDisputeResult("Error during AI trial run. Try again.");
      }
    } catch (err) {
      setDisputeResult("Failed to arbitrate case.");
    } finally {
      setGeneratingArbitration(false);
    }
  };

  // 4. KANBAN BOARD STATES
  const [kanbanTasks, setKanbanTasks] = useState([
    { id: 't1', title: 'Draft visual outline', col: 'todo', category: 'Creative' },
    { id: 't2', title: 'Write hook formulas', col: 'progress', category: 'Copywriting' },
    { id: 't3', title: 'Assemble sound deck', col: 'review', category: 'Audio' },
    { id: 't4', title: 'Compile render final draft', col: 'completed', category: 'Production' }
  ]);
  const [newKanbanTitle, setNewKanbanTitle] = useState('');
  const [newKanbanCat, setNewKanbanCat] = useState('Creative');

  const addKanbanTask = () => {
    if (!newKanbanTitle.trim()) return;
    setKanbanTasks([...kanbanTasks, { id: Date.now().toString(), title: newKanbanTitle, col: 'todo', category: newKanbanCat }]);
    setNewKanbanTitle('');
  };

  const moveKanbanTask = (id: string, col: string) => {
    setKanbanTasks(kanbanTasks.map(t => t.id === id ? { ...t, col } : t));
  };

  const deleteKanbanTask = (id: string) => {
    setKanbanTasks(kanbanTasks.filter(t => t.id !== id));
  };

  // 5. SEO TITLE OPTIMIZER STATES
  const [seoTitle, setSeoTitle] = useState('Short videos for brand awareness');
  const [seoDesc, setSeoDesc] = useState('I will edit 5 videos with viral caption titles and hooks.');
  const [seoResult, setSeoResult] = useState('');
  const [generatingSeo, setGeneratingSeo] = useState(false);

  const runSeoOptimization = async () => {
    if (generatingSeo) return;
    setGeneratingSeo(true);
    try {
      if (checkAndDeductCredits) {
        const allowed = await checkAndDeductCredits(2, 'AI SEO Gig Optimization');
        if (!allowed) {
          setGeneratingSeo(false);
          return;
        }
      }
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Optimize this freelance Gig listing to increase clicks and search visibility on Chidon:
Original Title: ${seoTitle}
Original Description: ${seoDesc}

Generate:
1. 3 highly optimized, high-CTR display titles.
2. Refined, high-retention bullet points.
3. 5 optimized meta search keywords or tags.`,
          model: "gemini-3.8-flash",
          creditsDeductedByClient: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setSeoResult(data.text);
      } else {
        setSeoResult("Error optimizing. Try again.");
      }
    } catch (err) {
      setSeoResult("Network timeout during optimization.");
    } finally {
      setGeneratingSeo(false);
    }
  };

  // 6. MILESTONE PLANNER
  const [milestoneTotal, setMilestoneTotal] = useState(3000);
  const [milestoneSplit, setMilestoneSplit] = useState(3);

  // 7. PRICING CALCULATOR STATES
  const [desiredSalary, setDesiredSalary] = useState(6000);
  const [calcHours, setCalcHours] = useState(30);
  const [calcTax, setCalcTax] = useState(20);
  const [calcExpenses, setCalcExpenses] = useState(800);

  const calcHourlyRate = Math.round((desiredSalary + calcExpenses) / (calcHours * 4));
  const minProjectValue = Math.round(calcHourlyRate * 15);
  const grossYearlyIncome = Math.round((desiredSalary + calcExpenses) * 12 * (1 + calcTax / 100));

  // 8. TAX & VAT ESTIMATOR
  const [estimatedRevenue, setEstimatedRevenue] = useState(12000);
  const [platformFeePercent, setPlatformFeePercent] = useState(3.9);
  const [incomeTaxRate, setIncomeTaxRate] = useState(15);

  const platformCut = estimatedRevenue * (platformFeePercent / 100);
  const localTaxCut = (estimatedRevenue - platformCut) * (incomeTaxRate / 100);
  const netTakeHome = estimatedRevenue - platformCut - localTaxCut;

  // 9. AI CLIENT PROPOSAL/PITCH BUILDER
  const [pitchVibe, setPitchVibe] = useState('Video Editor');
  const [pitchBrief, setPitchBrief] = useState('We need high retention reels with animated headings, SFX, and clean pacing.');
  const [pitchResult, setPitchResult] = useState('');
  const [generatingPitch, setGeneratingPitch] = useState(false);

  const generateProposal = async () => {
    if (generatingPitch) return;
    setGeneratingPitch(true);
    try {
      if (checkAndDeductCredits) {
        const allowed = await checkAndDeductCredits(2, 'AI Proposal Writer');
        if (!allowed) {
          setGeneratingPitch(false);
          return;
        }
      }
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a world-class freelance growth consultant. Write an irresistible project pitch tailored to:
My Specialty: ${pitchVibe}
Client Job Brief: ${pitchBrief}

Draft a highly persuasive, customized proposal. Keep it professional, show deep understanding of audience psychology, address deliverables, and finish with a strong, low-friction call-to-action (CTA).`,
          model: "gemini-3.8-flash",
          creditsDeductedByClient: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setPitchResult(data.text);
      } else {
        setPitchResult("Error writing proposal. Try again.");
      }
    } catch (err) {
      setPitchResult("Failed to create pitch document.");
    } finally {
      setGeneratingPitch(false);
    }
  };

  // 10. CLIENT MOOD BOARD STATES
  const [brandStyle, setBrandStyle] = useState('Cyberpunk High-Contrast Neon Tech');
  const [moodPalette, setMoodPalette] = useState(['#0A0E17', '#1E3A8A', '#06B6D4', '#F43F5E', '#FFFFFF']);

  // 11. SHA-256 DIGITAL SIGNATURES
  const [sigClientName, setSigClientName] = useState('Acme Agency');
  const [sigCreatorName, setSigCreatorName] = useState(myProfile?.fullName || 'Chidon Expert');
  const [isSigApproved, setIsSigApproved] = useState(false);
  const [simulatedBlockHeight, setSimulatedBlockHeight] = useState(849312);

  const contractHash = `sha256-43e58b1f9b3b${sigClientName.length}a92c89f55e0031849a62241e309fbdf580f5a2f58e0a3e817bc`;

  // 12. SKILLS RADAR STATES
  const [radarSkills, setRadarSkills] = useState({
    copywriting: 85,
    videoEditing: 90,
    seoAuditing: 70,
    hookDesign: 95,
    audienceGrowth: 80
  });

  const updateRadarSkill = (skill: keyof typeof radarSkills, val: number) => {
    setRadarSkills({ ...radarSkills, [skill]: val });
  };

  // 13. REVENUE TRACKER GAUGE
  const [targetRevenue, setTargetRevenue] = useState(5000);
  const [currentRevenue, setCurrentRevenue] = useState(2450);

  const revenuePercentage = Math.min(100, Math.round((currentRevenue / targetRevenue) * 100));

  // 14. SCOPE OF WORK (SOW) BUILDER
  const [sowItems, setSowItems] = useState([
    { id: 's1', scope: 'Competitive audit of top 3 rival creators', days: 2, complexity: 'High' },
    { id: 's2', scope: 'Scripting 5 high-hook narrative screenplays', days: 3, complexity: 'Medium' }
  ]);
  const [newSowScope, setNewSowScope] = useState('');
  const [newSowDays, setNewSowDays] = useState(2);
  const [newSowComplexity, setNewSowComplexity] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const addSowItem = () => {
    if (!newSowScope.trim()) return;
    setSowItems([...sowItems, { id: Date.now().toString(), scope: newSowScope, days: newSowDays, complexity: newSowComplexity }]);
    setNewSowScope('');
  };

  const removeSowItem = (id: string) => {
    setSowItems(sowItems.filter(item => item.id !== id));
  };

  // 15. AI REVISION FEEDBACK DECODER
  const [rawFeedback, setRawFeedback] = useState('I like the colors but everything is way too slow, and please make the text stand out way more.');
  const [feedbackResult, setFeedbackResult] = useState('');
  const [generatingDecoder, setGeneratingDecoder] = useState(false);

  const decodeFeedback = async () => {
    if (generatingDecoder) return;
    setGeneratingDecoder(true);
    try {
      if (checkAndDeductCredits) {
        const allowed = await checkAndDeductCredits(2, 'AI Feedback Decoder');
        if (!allowed) {
          setGeneratingDecoder(false);
          return;
        }
      }
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Translate this typical client feedback statement into an actionable checklist of developer tasks:
Client Feedback: "${rawFeedback}"

Generate:
1. Actionable technical steps to fulfill this.
2. Calculated Sentiment Rating (e.g. Neutral-Optimistic).
3. Recommended professional response copy to send back.`,
          model: "gemini-3.8-flash",
          creditsDeductedByClient: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackResult(data.text);
      } else {
        setFeedbackResult("Error decoding. Try again.");
      }
    } catch (err) {
      setFeedbackResult("Failed to decode feedback.");
    } finally {
      setGeneratingDecoder(false);
    }
  };

  // 16. PROOF OF DELIVERY BLOCKCHAIN LEDGER
  const [proofUrl, setProofUrl] = useState('https://chidon-vault.io/proof/creator-3918');
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [signingLedger, setSigningLedger] = useState(false);

  const signLedgerProof = () => {
    setSigningLedger(true);
    setTimeout(() => {
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        url: proofUrl,
        hash: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
        block: Math.floor(849312 + Math.random() * 200)
      };
      setLedgerEntries([newEntry, ...ledgerEntries]);
      setSigningLedger(false);
    }, 1200);
  };

  // 17. SOVEREIGN TALENT DIRECTORY SEARCH
  const [talentSearch, setTalentSearch] = useState('');
  const [liveTalents, setLiveTalents] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    const fetchLiveProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        if (!active) return;
        const list = querySnapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            name: d.fullName || d.username || 'Anonymous Peer',
            role: d.role || 'Content Creator',
            skills: Array.isArray(d.skills) ? d.skills : [],
            rating: typeof d.rating === 'number' ? d.rating : 5.0,
            count: d.experienceYears ? d.experienceYears * 12 : Math.floor(Math.random() * 20) + 10
          };
        });
        if (list.length > 0) {
          setLiveTalents(list);
        }
      } catch (err) {
        console.warn("Failed fetching live profiles from Firestore profiles collection, using native seed database instead.", err);
      }
    };
    fetchLiveProfiles();
    return () => {
      active = false;
    };
  }, []);

  const mockTalents = liveTalents.length > 0 ? liveTalents : [
    { name: 'Chidera Emmanuel', role: 'Full Stack Sovereign', skills: ['TypeScript', 'AI Optimization', 'SEO Auditing'], rating: 5.0, count: 48 },
    { name: 'Zoe Vance', role: 'Short Video Producer', skills: ['CapCut Pro', 'Color Grading', 'Viral Hooks'], rating: 4.9, count: 32 },
    { name: 'Marcus Sterling', role: 'SEO Copywriting Lead', skills: ['SEO Auditing', 'Niche Newsletters', 'B2B Strategy'], rating: 4.8, count: 19 }
  ];

  // 18. QUICK CHAT RESPONSES
  const chatResponses = [
    { label: 'Chasing Late Payment', text: "Hi, I hope your week is going well. I am following up on outstanding Invoice #ID which was due on DATE. Please let me know when payment is routed. Thanks!" },
    { label: 'SLA Deliverable Delivery', text: "Hi there! I am excited to submit the final vetted deliverables. You can review all assets here: [INSERT URL]. Let me know if everything meets your compliance standards." },
    { label: 'Request Revision Clarification', text: "Hi, thanks for the feedback! To ensure I execute this perfectly, could you clarify what you mean by [TERM] or provide a reference example? Let me know!" }
  ];

  // 19. AUTOMATED FOLLOW-UP SCHEDULER
  const [followUpDays, setFollowUpDays] = useState(7);
  const [followUpMsg, setFollowUpMsg] = useState('Hi! Just following up to see how the short form video campaign performed. Ready to plan next month?');
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);

  const scheduleJob = () => {
    setScheduledJobs([...scheduledJobs, { id: Date.now().toString(), days: followUpDays, msg: followUpMsg }]);
    alert(`Automated follow-up scheduled to trigger in ${followUpDays} days!`);
  };

  // 20. CLIENT REVIEW SIMULATOR
  const [simCommRating, setSimCommRating] = useState(5);
  const [simSpeedRating, setSimSpeedRating] = useState(5);
  const [simQualityRating, setSimQualityRating] = useState(5);
  const [simComment, setSimComment] = useState('Incredible attention to visual layout. Highly recommended creator!');

  // 21. POMODORO TIMER STATES
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 mins
  const [timerActive, setTimerActive] = useState(false);
  const [focusIntervalId, setFocusIntervalId] = useState<any>(null);

  useEffect(() => {
    if (timerActive) {
      const id = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            clearInterval(id);
            setTimerActive(false);
            alert(timerMode === 'work' ? "Work block completed! Take a break." : "Break completed! Back to work.");
            return timerMode === 'work' ? 300 : 1500;
          }
          return s - 1;
        });
      }, 1000);
      setFocusIntervalId(id);
    } else {
      if (focusIntervalId) {
        clearInterval(focusIntervalId);
      }
    }
    return () => {
      if (focusIntervalId) clearInterval(focusIntervalId);
    };
  }, [timerActive, timerMode]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(timerMode === 'work' ? 1500 : 300);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Tools catalog list
  const toolsList = [
    { id: 'contract_gen', label: '1. AI Contract Generator', icon: FileText, desc: 'Instantly build legally sound creator contracts.' },
    { id: 'invoice_gen', label: '2. Interactive Invoice Builder', icon: CreditCard, desc: 'Produce elegant, structured invoices with tax tools.' },
    { id: 'arbitrator', label: '3. Escrow AI Arbitrator', icon: ShieldAlert, desc: 'Submit client disputes to the decentralised trial.' },
    { id: 'kanban', label: '4. Scope Kanban Board', icon: Kanban, desc: 'Organise active deliverables with click-drags.' },
    { id: 'seo_opt', label: '5. AI Title & Tag Optimizer', icon: Zap, desc: 'Refine listing metadata for algorithmic visibility.' },
    { id: 'mile_planner', label: '6. Escrow Split Calculator', icon: Percent, desc: 'Compute split-milestone escrow percentages.' },
    { id: 'pricing_calc', label: '7. Rates Pricing Engine', icon: Calculator, desc: 'Determine optimized hourly & project-based targets.' },
    { id: 'tax_est', label: '8. Tax &VAT Ledger Payouts', icon: DollarSign, desc: 'Forecast platform deductions and net earnings.' },
    { id: 'proposal_writer', label: '9. AI Client proposal Builder', icon: Send, desc: 'Generate target-focused outreach and bids.' },
    { id: 'mood_board', label: '10. Brand Vibe Mood Board', icon: Layers, desc: 'Design visual guidelines & aesthetic color palettes.' },
    { id: 'sig_node', label: '11. SHA-256 Digital Signatures', icon: Hash, desc: 'Electronically lock contracts using crypto-hashes.' },
    { id: 'skills_radar', label: '12. Skills Radar Spider-Chart', icon: Award, desc: 'Build highly visual interactive spider-web chart.' },
    { id: 'rev_gauge', label: '13. revenue Monthly Progress Gauge', icon: Clock, desc: 'Real-time speedometer showing target completions.' },
    { id: 'sow_builder', label: '14. Scope of Work (SOW) Builder', icon: Briefcase, desc: 'Compile complex deliverable breakdowns easily.' },
    { id: 'feedback_decoder', label: '15. AI Revision Decoder', icon: ThumbsUp, desc: 'Deconstruct vague client comments into tech steps.' },
    { id: 'blockchain_ledger', label: '16. Proof of Delivery Ledger', icon: LockIcon, desc: 'Register submission proofs on simulation blocks.' },
    { id: 'talent_directory', label: '17. Talent Directory Filter', icon: Search, desc: 'Discover peer professionals with active search grids.' },
    { id: 'chat_templates', label: '18. Instant Chat Templates', icon: Copy, desc: 'Copy-paste persuasive copy blocks instantly.' },
    { id: 'followup_scheduler', label: '19. Automated Followups', icon: Calendar, desc: 'Set post-milestone client repeat-jobs triggers.' },
    { id: 'review_simulator', label: '20. Star Feedback Form Simulator', icon: Star, desc: 'Test communication and quality scoring meters.' },
    { id: 'pomodoro', label: '21. Pomodoro Focus Timer', icon: Clock, desc: 'Interactive session tracker with zensound.' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      
      {/* LEFT SIDEBAR: SELECTOR GRID */}
      <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800 rounded-3xl p-4 md:p-5 h-[calc(100vh-220px)] overflow-y-auto space-y-4">
        <div>
          <h3 className="text-xs font-mono font-black text-indigo-400 uppercase tracking-widest">
            🛡️ CHIDON FREELANCE UTILITY SUITE
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal mt-1">
            Toggle between twenty-one highly integrated micro-features powered by ChidonIQ neural pipelines.
          </p>
        </div>

        <div className="space-y-1.5">
          {toolsList.map((tool) => {
            const IconComp = tool.icon;
            const isSelected = activeToolId === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveToolId(tool.id)}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-white' 
                    : 'border border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-900 text-slate-500'}`}>
                  <IconComp size={12} />
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-mono font-bold block">{tool.label}</span>
                  <span className="text-[9px] text-slate-500 truncate block">{tool.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT DISPLAY PANEL */}
      <div className="lg:col-span-8 bg-slate-950/40 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl relative min-h-[500px] flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          
          {/* TOOL 1: CONTRACT GENERATOR */}
          {activeToolId === 'contract_gen' && (
            <motion.div key="contract_gen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="border-b border-slate-800/80 pb-4">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #1</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Sovereign AI Contract Builder</h4>
                <p className="text-xs text-slate-400 mt-1">Settle clear terms instantly. Generate customized peer-to-peer service agreements using ChidonIQ neural logic.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Client Brand</label>
                  <input type="text" value={contractClient} onChange={e => setContractClient(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Freelance Creator</label>
                  <input type="text" value={contractCreator} onChange={e => setContractCreator(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Rate (USD)</label>
                  <input type="text" value={contractRate} onChange={e => setContractRate(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Completion Deadline</label>
                  <input type="date" value={contractDeadline} onChange={e => setContractDeadline(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Scope Deliverables</label>
                  <textarea rows={2} value={contractDeliverables} onChange={e => setContractDeliverables(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <button onClick={generateContract} disabled={generatingContract} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-2">
                {generatingContract ? <RotateCcw size={12} className="animate-spin" /> : <Zap size={12} />}
                <span>Generate Smart Agreement SLA</span>
              </button>

              {contractResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono text-slate-400">GENERATED CONTRACT SLA</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleCopy(contractResult, 'contract')} 
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        {copiedText === 'contract' ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedText === 'contract' ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onSendToNotepad && (
                        <button 
                          onClick={() => onSendToNotepad(`SLA Contract - ${contractClient}`, contractResult)} 
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer font-bold"
                        >
                          <BookOpen size={13} />
                          <span>Save to Notepad</span>
                        </button>
                      )}

                      <button 
                        onClick={() => downloadAsTxtFile(`Contract_${contractClient}`, contractResult)} 
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        <FileText size={13} />
                        <span>Download TXT</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed text-left">
                    {contractResult}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* TOOL 2: INTERACTIVE INVOICE BUILDER */}
          {activeToolId === 'invoice_gen' && (
            <motion.div key="invoice_gen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #2</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Interactive Invoice Suite</h4>
                <p className="text-xs text-slate-400 mt-1">Interactively add items and calculate exact tax sums for dynamic client billing.</p>
              </div>

              {/* Theme Selector */}
              <div className="flex gap-2 justify-end">
                {['slate', 'indigo', 'emerald'].map((t) => (
                  <button key={t} onClick={() => setInvoiceTheme(t as any)} className={`px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase font-black tracking-wider transition-all cursor-pointer ${invoiceTheme === t ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h5 className="text-[11px] font-mono font-black uppercase text-white">CHIDON FINANCIAL INVOICE</h5>
                    <span className="text-[8px] font-mono text-slate-500">ID: INV-{simulatedBlockHeight}</span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-indigo-400">STATUS: PENDING PAYMENT</span>
                </div>

                <div className="space-y-2">
                  {invoiceItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-slate-800/50">
                      <span className="text-slate-300">{item.desc}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Qty: {item.qty}</span>
                        <span className="text-white font-bold">${item.rate * item.qty}</span>
                        <button onClick={() => removeInvoiceItem(item.id)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Adding new item */}
                <div className="flex gap-2 items-center">
                  <input type="text" placeholder="Item deliverable brief..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" />
                  <input type="number" placeholder="Rate" value={newItemRate} onChange={e => setNewItemRate(Number(e.target.value))} className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" />
                  <button onClick={addInvoiceItem} className="px-3 py-1.5 bg-indigo-600 rounded-lg text-white font-bold text-xs hover:bg-indigo-500">
                    Add
                  </button>
                </div>

                {/* Summary */}
                <div className="space-y-1.5 border-t border-slate-850 pt-2.5 text-right font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="text-slate-300 font-bold">${invoiceSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated VAT ({invoiceVat}%):</span>
                    <span className="text-slate-300 font-bold">${invoiceTaxAmount.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 text-indigo-400 font-black">
                    <span>Total Bill:</span>
                    <span>${invoiceTotal.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 3: AI ARBITRATOR COURT */}
          {activeToolId === 'arbitrator' && (
            <motion.div key="arbitrator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #3</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Escrow AI Dispute Arbitrator</h4>
                <p className="text-xs text-slate-400 mt-1">Simulate judicial arbitration. Submit briefs to determine exact release percentage splits objectively.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Opponent Client Name</label>
                  <input type="text" value={disputeClient} onChange={e => setDisputeClient(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Dispute Statement Brief</label>
                  <textarea rows={3} value={disputeDesc} onChange={e => setDisputeDesc(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Arbitrator Personality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['neutral', 'strict', 'conciliatory'].map((t) => (
                      <button key={t} onClick={() => setDisputeTone(t as any)} className={`py-1.5 rounded-xl text-[10px] font-mono uppercase font-black border transition-all cursor-pointer ${disputeTone === t ? 'bg-purple-500 border-purple-400 text-white' : 'border-slate-800 text-slate-400 hover:text-white'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={runArbitration} disabled={generatingArbitration} className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5">
                {generatingArbitration ? <RotateCcw size={12} className="animate-spin" /> : <ShieldAlert size={12} />}
                <span>Discharge AI Arbitrator Case</span>
              </button>

              {disputeResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono text-slate-400">RULING DOCUMENT</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleCopy(disputeResult, 'dispute')} 
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        {copiedText === 'dispute' ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedText === 'dispute' ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onSendToNotepad && (
                        <button 
                          onClick={() => onSendToNotepad(`Dispute Ruling - ${disputeClient}`, disputeResult)} 
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer font-bold"
                        >
                          <BookOpen size={13} />
                          <span>Save to Notepad</span>
                        </button>
                      )}

                      <button 
                        onClick={() => downloadAsTxtFile(`Dispute_Ruling_${disputeClient}`, disputeResult)} 
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        <FileText size={13} />
                        <span>Download TXT</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed text-left">
                    {disputeResult}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* TOOL 4: KANBAN BOARD */}
          {activeToolId === 'kanban' && (
            <motion.div key="kanban" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #4</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Dynamic Scope Kanban</h4>
                <p className="text-xs text-slate-400 mt-1">Organize creator deliverables into interactive progress states.</p>
              </div>

              <div className="flex gap-2">
                <input type="text" placeholder="New milestone action..." value={newKanbanTitle} onChange={e => setNewKanbanTitle(e.target.value)} className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                <button onClick={addKanbanTask} className="px-4 py-1.5 bg-indigo-600 rounded-xl text-white font-bold text-xs">
                  Create task
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {['todo', 'progress', 'review', 'completed'].map((col) => {
                  const colsTasks = kanbanTasks.filter(t => t.col === col);
                  return (
                    <div key={col} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-2.5 space-y-2 min-h-[180px]">
                      <span className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 block border-b border-slate-800 pb-1">{col}</span>
                      <div className="space-y-1.5">
                        {colsTasks.map((t) => (
                          <div key={t.id} className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-[10px] space-y-1.5">
                            <span className="text-white block font-mono font-semibold">{t.title}</span>
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded">{t.category}</span>
                              <div className="flex gap-1">
                                {col !== 'completed' && (
                                  <button onClick={() => moveKanbanTask(t.id, col === 'todo' ? 'progress' : col === 'progress' ? 'review' : 'completed')} className="text-indigo-400 text-[8px] font-mono hover:underline">
                                    Next
                                  </button>
                                )}
                                <button onClick={() => deleteKanbanTask(t.id)} className="text-red-400">
                                  <Trash2 size={8} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TOOL 5: AI SEO TITLE OPTIMIZER */}
          {activeToolId === 'seo_opt' && (
            <motion.div key="seo_opt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #5</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">AI Gig Title & Tag Optimizer</h4>
                <p className="text-xs text-slate-400 mt-1">Write higher CTR titles, optimized description lists, and rich search tags.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Original Gig Title</label>
                  <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Service Description</label>
                  <textarea rows={2} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
              </div>

              <button onClick={runSeoOptimization} disabled={generatingSeo} className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5">
                {generatingSeo ? <RotateCcw size={12} className="animate-spin" /> : <Zap size={12} />}
                <span>Optimize listing SEO</span>
              </button>

              {seoResult && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">OPTIMIZED RECOMMENDATIONS</span>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed text-left">
                    {seoResult}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* TOOL 6: MILESTONE CALCULATOR */}
          {activeToolId === 'mile_planner' && (
            <motion.div key="mile_planner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #6</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Milestone Split Planner</h4>
                <p className="text-xs text-slate-400 mt-1">Breakdown project budgets into structured percent-weighted deliverables.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Total Contract value ($)</label>
                  <input type="number" value={milestoneTotal} onChange={e => setMilestoneTotal(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Number of Milestones</label>
                  <input type="number" value={milestoneSplit} onChange={e => setMilestoneSplit(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono">
                <span className="text-[10px] font-mono text-indigo-400 font-black uppercase">STRUCTURED MILESTONE DELIVERIES</span>
                <div className="space-y-2">
                  {Array.from({ length: Math.max(1, Math.min(5, milestoneSplit)) }).map((_, idx) => {
                    const weight = idx === 0 ? 40 : idx === 1 ? 35 : 25;
                    const value = milestoneTotal * (weight / 100);
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-800/40 pb-1.5">
                        <span className="text-slate-300">Milestone {idx + 1} ({weight}%)</span>
                        <span className="text-white font-bold">${value.toFixed(0)} USD</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 7: RATES CALCULATOR */}
          {activeToolId === 'pricing_calc' && (
            <motion.div key="pricing_calc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #7</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Rates & Earnings Pricing Engine</h4>
                <p className="text-xs text-slate-400 mt-1">Fine-tune pricing structures based on tax rates, working hours, and expense models.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Target Net Monthly Income ($)</label>
                  <input type="number" value={desiredSalary} onChange={e => setDesiredSalary(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Billable Hours/Week</label>
                  <input type="number" value={calcHours} onChange={e => setCalcHours(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Estimated Business Expenses/mo ($)</label>
                  <input type="number" value={calcExpenses} onChange={e => setCalcExpenses(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Avg Tax Provision (%)</label>
                  <input type="number" value={calcTax} onChange={e => setCalcTax(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-black block">HOURLY RATE</span>
                  <span className="text-lg font-mono font-black text-emerald-400">${calcHourlyRate}/hr</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-black block">MIN PROJECT VALUE</span>
                  <span className="text-lg font-mono font-black text-cyan-400">${minProjectValue}</span>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-black block">ANNUAL GROSS</span>
                  <span className="text-lg font-mono font-black text-indigo-400">${grossYearlyIncome}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 8: TAX & VAT LEDGER ESTIMATOR */}
          {activeToolId === 'tax_est' && (
            <motion.div key="tax_est" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #8</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Tax & VAT Ledger Estimator</h4>
                <p className="text-xs text-slate-400 mt-1">Pre-calculate Stripe/Paystack platform cuts and estimated local tax burdens.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Estimated Project Revenue ($)</label>
                  <input type="number" value={estimatedRevenue} onChange={e => setEstimatedRevenue(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Platform Fee %</label>
                    <input type="number" step="0.1" value={platformFeePercent} onChange={e => setPlatformFeePercent(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Income Tax Burden %</label>
                    <input type="number" value={incomeTaxRate} onChange={e => setIncomeTaxRate(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform Escrow Fee:</span>
                  <span className="text-red-400 font-bold">-${platformCut.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Income Tax:</span>
                  <span className="text-red-400 font-bold">-${localTaxCut.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 text-emerald-400 font-black">
                  <span>Net Sovereign Take-Home:</span>
                  <span>${netTakeHome.toFixed(1)} USD</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 9: AI PROPOSAL WRITER */}
          {activeToolId === 'proposal_writer' && (
            <motion.div key="proposal_writer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #9</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">AI proposal & Pitch Writer</h4>
                <p className="text-xs text-slate-400 mt-1">Formulate highly targeted client pitches based on active job briefs.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Specialty Role</label>
                  <input type="text" value={pitchVibe} onChange={e => setPitchVibe(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Client's Job Requirements</label>
                  <textarea rows={2} value={pitchBrief} onChange={e => setPitchBrief(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
              </div>

              <button onClick={generateProposal} disabled={generatingPitch} className="w-full py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5">
                {generatingPitch ? <RotateCcw size={12} className="animate-spin" /> : <Zap size={12} />}
                <span>Generate Persuasive Outreach Pitch</span>
              </button>

              {pitchResult && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono text-slate-400">OUTREACH COPY DOCUMENT</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleCopy(pitchResult, 'pitch')} 
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        {copiedText === 'pitch' ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedText === 'pitch' ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onSendToNotepad && (
                        <button 
                          onClick={() => onSendToNotepad(`Proposal Pitch - ${pitchVibe}`, pitchResult)} 
                          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer font-bold"
                        >
                          <BookOpen size={13} />
                          <span>Save to Notepad</span>
                        </button>
                      )}

                      <button 
                        onClick={() => downloadAsTxtFile(`Pitch_${pitchVibe}`, pitchResult)} 
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        <FileText size={13} />
                        <span>Download TXT</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed text-left">
                    {pitchResult}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* TOOL 10: BRAND MOOD BOARD */}
          {activeToolId === 'mood_board' && (
            <motion.div key="mood_board" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #10</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Aesthetic Brand Mood Board</h4>
                <p className="text-xs text-slate-400 mt-1">Formulate styling guides and recommended color palettes for social networks.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Brand Target Aesthetic Vibe</label>
                <input type="text" value={brandStyle} onChange={e => setBrandStyle(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">RECOMMENDED PALETTE HEX SWATCHES</span>
                <div className="grid grid-cols-5 gap-2">
                  {moodPalette.map((hex, idx) => (
                    <div key={idx} className="space-y-1.5 text-center">
                      <div className="h-14 rounded-xl border border-slate-800 shadow-inner" style={{ backgroundColor: hex }} />
                      <span className="text-[8px] font-mono text-slate-400 block">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 11: SHA-256 DIGITAL SIGNATURES */}
          {activeToolId === 'sig_node' && (
            <motion.div key="sig_node" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #11</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Cryptographic SLA Signatures</h4>
                <p className="text-xs text-slate-400 mt-1">Digitally lock peer agreements with simulated SHA-256 validation ledgers.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Client Signee</label>
                  <input type="text" value={sigClientName} onChange={e => setSigClientName(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Creator Signee</label>
                  <input type="text" value={sigCreatorName} onChange={e => setSigCreatorName(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>LEDGER HASH COUPLING:</span>
                  <span className="text-indigo-400 truncate max-w-xs">{contractHash}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VALIDATOR BLOCK:</span>
                  <span className="text-cyan-400 font-bold">#{simulatedBlockHeight}</span>
                </div>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span>STATUS:</span>
                  <button onClick={() => {
                    setIsSigApproved(!isSigApproved);
                    setSimulatedBlockHeight(h => h + 1);
                  }} className={`px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer ${isSigApproved ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {isSigApproved ? '🔒 Contract Signed' : '✍️ Sign Agreement'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 12: SKILLS RADAR SPIDER-CHART */}
          {activeToolId === 'skills_radar' && (
            <motion.div key="skills_radar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #12</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Interactive Skills Radar spider-web</h4>
                <p className="text-xs text-slate-400 mt-1">Fine-tune skill slider values to render a custom interactive SVG radar chart.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-2 font-mono text-xs text-slate-400">
                  {(Object.keys(radarSkills) as Array<keyof typeof radarSkills>).map((skill) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="uppercase">{skill}</span>
                        <span className="text-indigo-400">{radarSkills[skill]}%</span>
                      </div>
                      <input type="range" min="30" max="100" value={radarSkills[skill]} onChange={e => updateRadarSkill(skill, Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                    </div>
                  ))}
                </div>

                {/* SVG Radar Visualization */}
                <div className="flex items-center justify-center p-2.5">
                  <svg viewBox="0 0 120 120" className="w-32 h-32 text-indigo-500/20">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1E293B" strokeWidth="1" />
                    <circle cx="60" cy="60" r="35" fill="none" stroke="#1E293B" strokeWidth="1" />
                    <circle cx="60" cy="60" r="20" fill="none" stroke="#1E293B" strokeWidth="1" />
                    {/* Render Polygon based on sliders */}
                    <polygon points={`
                      60,${60 - (radarSkills.copywriting / 100) * 50}
                      ${60 + (radarSkills.videoEditing / 100) * 50},60
                      ${60 + (radarSkills.hookDesign / 100) * 35},${60 + (radarSkills.hookDesign / 100) * 35}
                      ${60 - (radarSkills.seoAuditing / 100) * 35},${60 + (radarSkills.seoAuditing / 100) * 35}
                      ${60 - (radarSkills.audienceGrowth / 100) * 50},60
                    `} fill="rgba(99, 102, 241, 0.25)" stroke="#6366F1" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 13: REVENUE MONTHLY PROGRESS GAUGE */}
          {activeToolId === 'rev_gauge' && (
            <motion.div key="rev_gauge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #13</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Revenue Monthly Progress Gauge</h4>
                <p className="text-xs text-slate-400 mt-1">Interactively set goals and log client payouts to watch your gauge speedometer fill.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Monthly Income Goal ($)</label>
                  <input type="number" value={targetRevenue} onChange={e => setTargetRevenue(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Completed Earnings ($)</label>
                  <input type="number" value={currentRevenue} onChange={e => setCurrentRevenue(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
                  <div className="absolute top-0 w-36 h-36 rounded-full border-[10px] border-slate-800" />
                  <div className="absolute top-0 w-36 h-36 rounded-full border-[10px] border-indigo-500 transform origin-center transition-transform duration-500" style={{ transform: `rotate(${(revenuePercentage / 100) * 180 - 180}deg)` }} />
                  <div className="z-10 text-center pb-2">
                    <span className="text-2xl font-mono font-black text-white">{revenuePercentage}%</span>
                    <span className="text-[8px] font-mono text-slate-400 block uppercase">GOAL PROGRESS</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-mono">You need another <span className="text-indigo-400">${targetRevenue - currentRevenue} USD</span> to satisfy your monthly core threshold.</p>
              </div>
            </motion.div>
          )}

          {/* TOOL 14: SCOPE OF WORK (SOW) BUILDER */}
          {activeToolId === 'sow_builder' && (
            <motion.div key="sow_builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #14</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Scope of Work (SOW) Compiler</h4>
                <p className="text-xs text-slate-400 mt-1">Interactively list milestone deliverables with estimated turnaround times.</p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3.5">
                <div className="space-y-2">
                  {sowItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs font-mono py-1.5 border-b border-slate-800/40">
                      <div>
                        <span className="text-white block font-semibold">{item.scope}</span>
                        <span className="text-[9px] text-indigo-400">Time estimate: {item.days} production days</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest font-black ${item.complexity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{item.complexity}</span>
                        <button onClick={() => removeSowItem(item.id)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2.5">
                  <input type="text" placeholder="Deliverable outline description..." value={newSowScope} onChange={e => setNewSowScope(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="Est. Days" value={newSowDays} onChange={e => setNewSowDays(Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />
                    <select value={newSowComplexity} onChange={e => setNewSowComplexity(e.target.value as any)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none">
                      <option value="Low">Low Complexity</option>
                      <option value="Medium">Medium Complexity</option>
                      <option value="High">High Complexity</option>
                    </select>
                  </div>
                  <button onClick={addSowItem} className="w-full py-1.5 bg-indigo-600 rounded-xl text-white font-bold text-xs uppercase tracking-wide">
                    Compile scope line
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 15: AI REVISION FEEDBACK DECODER */}
          {activeToolId === 'feedback_decoder' && (
            <motion.div key="feedback_decoder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #15</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">AI Client Revision feedback Decoder</h4>
                <p className="text-xs text-slate-400 mt-1">Unpack subjective or vague client comments into an absolute technical checklist.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Subjective Client Comment</label>
                <textarea rows={3} value={rawFeedback} onChange={e => setRawFeedback(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>

              <button onClick={decodeFeedback} disabled={generatingDecoder} className="w-full py-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5">
                {generatingDecoder ? <RotateCcw size={12} className="animate-spin" /> : <Zap size={12} />}
                <span>Decode subjective feedback</span>
              </button>

              {feedbackResult && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">DECODED TECHNICAL STEPS</span>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed text-left">
                    {feedbackResult}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* TOOL 16: IMMUTABLE DELIVERABLES LEDGER */}
          {activeToolId === 'blockchain_ledger' && (
            <motion.div key="blockchain_ledger" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #16</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Proof of Delivery Immutable Ledger</h4>
                <p className="text-xs text-slate-400 mt-1">Register submission asset URLs on a cryptographic timeline.</p>
              </div>

              <div className="flex gap-2">
                <input type="text" value={proofUrl} onChange={e => setProofUrl(e.target.value)} className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                <button onClick={signLedgerProof} disabled={signingLedger} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold text-xs">
                  {signingLedger ? 'Signing...' : 'Register Proof'}
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">LEDGER TRANSACTION CHRONOLOGY</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {ledgerEntries.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4 font-mono">No proofs registered yet. Input URL above to commit to block.</p>
                  ) : (
                    ledgerEntries.map((e) => (
                      <div key={e.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl font-mono text-[10px] space-y-1">
                        <div className="flex justify-between text-indigo-400">
                          <span>BLOCK #{e.block}</span>
                          <span>{e.timestamp}</span>
                        </div>
                        <p className="text-white truncate">{e.url}</p>
                        <p className="text-[8px] text-slate-500 truncate">{e.hash}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 17: TALENT SEARCH */}
          {activeToolId === 'talent_directory' && (
            <motion.div key="talent_directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #17</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Sovereign Creator Directory Search</h4>
                <p className="text-xs text-slate-400 mt-1">Search through high-competence peers for collaboration opportunities.</p>
              </div>

              <input type="text" placeholder="Search skills, names, or titles..." value={talentSearch} onChange={e => setTalentSearch(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white" />

              <div className="space-y-2">
                {mockTalents
                  .filter(t => t.name.toLowerCase().includes(talentSearch.toLowerCase()) || t.role.toLowerCase().includes(talentSearch.toLowerCase()) || t.skills.some(s => s.toLowerCase().includes(talentSearch.toLowerCase())))
                  .map((t, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="text-white font-bold block">{t.name}</span>
                        <span className="text-[10px] text-indigo-400 font-mono block">{t.role}</span>
                        <div className="flex gap-1.5 pt-1">
                          {t.skills.map((s, sIdx) => (
                            <span key={sIdx} className="text-[8px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-yellow-400 font-bold block flex items-center justify-end gap-1">★ {t.rating.toFixed(1)}</span>
                        <span className="text-[9px] text-slate-500">{t.count} completed gigs</span>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* TOOL 18: CHAT TEMPLATES */}
          {activeToolId === 'chat_templates' && (
            <motion.div key="chat_templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #18</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Instant Persuasive Chat Templates</h4>
                <p className="text-xs text-slate-400 mt-1">One-click copy highly structured email responses to resolve common client roadblocks.</p>
              </div>

              <div className="space-y-3">
                {chatResponses.map((res, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 font-black uppercase">{res.label}</span>
                      <button onClick={() => handleCopy(res.text, `template_${idx}`)} className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer">
                        {copiedText === `template_${idx}` ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedText === `template_${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl text-left">
                      {res.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TOOL 19: AUTOMATED FOLLOW-UPS */}
          {activeToolId === 'followup_scheduler' && (
            <motion.div key="followup_scheduler" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #19</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Automated Client Follow-up Scheduler</h4>
                <p className="text-xs text-slate-400 mt-1">Schedule automatic notifications to check in with past buyers for repeat opportunities.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Wait Interval (Days)</label>
                  <input type="number" value={followUpDays} onChange={e => setFollowUpDays(Number(e.target.value))} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Follow-up Message Template</label>
                  <textarea rows={2} value={followUpMsg} onChange={e => setFollowUpMsg(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none" />
                </div>
              </div>

              <button onClick={scheduleJob} className="w-full py-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-mono font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5">
                <Calendar size={12} />
                <span>Schedule Automated trigger</span>
              </button>

              {scheduledJobs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">SCHEDULED CRON TRIGGERS</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {scheduledJobs.map((j) => (
                      <div key={j.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono flex justify-between items-center">
                        <span className="text-white truncate max-w-xs">In {j.days} days: "{j.msg}"</span>
                        <span className="text-indigo-400">STATUS: SCHEDULED</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TOOL 20: CLIENT REVIEW SIMULATOR */}
          {activeToolId === 'review_simulator' && (
            <motion.div key="review_simulator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #20</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Star Feedback Form Simulator</h4>
                <p className="text-xs text-slate-400 mt-1">Review performance parameters on speed, communication, and final deliverable quality.</p>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase">COMMUNICATION STAR RATIO</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setSimCommRating(s)} className={`text-sm cursor-pointer ${s <= simCommRating ? 'text-yellow-400' : 'text-slate-700'}`}>★</button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase">SPEED & COMPLIANCE RATIO</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setSimSpeedRating(s)} className={`text-sm cursor-pointer ${s <= simSpeedRating ? 'text-yellow-400' : 'text-slate-700'}`}>★</button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase">QUALITY & RESOLUTION RATIO</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setSimQualityRating(s)} className={`text-sm cursor-pointer ${s <= simQualityRating ? 'text-yellow-400' : 'text-slate-700'}`}>★</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 block">Feedback commentary</label>
                  <textarea rows={1} value={simComment} onChange={e => setSimComment(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* TOOL 21: POMODORO TIMER */}
          {activeToolId === 'pomodoro' && (
            <motion.div key="pomodoro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[8px] font-mono font-black bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">FEATURE #21</span>
                <h4 className="text-sm font-mono font-black text-white uppercase tracking-wide mt-1">Pomodoro Focus Timer</h4>
                <p className="text-xs text-slate-400 mt-1">Track billable creator hours with standard Pomodoro cycles and ambient click noise.</p>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4 py-3">
                <div className="text-4xl font-mono font-black text-white tracking-widest bg-slate-900 border border-slate-800 px-8 py-3 rounded-3xl shadow-inner">
                  {formatTimer(timerSeconds)}
                </div>

                <div className="flex gap-3">
                  <button onClick={toggleTimer} className={`px-4 py-1.5 rounded-xl text-xs font-mono font-black uppercase transition-all cursor-pointer ${timerActive ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {timerActive ? <Pause size={12} className="inline mr-1" /> : <Play size={12} className="inline mr-1" />}
                    {timerActive ? 'Pause' : 'Start Focus'}
                  </button>
                  <button onClick={resetTimer} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer">
                    <RotateCcw size={12} className="inline mr-1" />
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* BOTTOM METADATA BAR */}
        <div className="border-t border-slate-850 pt-3.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldAlert size={10} className="text-indigo-400" />
            <span>Sovereign Security Gate v2.0 Activated</span>
          </div>
          <span>Active User: @{myProfile?.fullName || 'Chidon Member'}</span>
        </div>
      </div>

    </div>
  );
};

// Simple Fallback Lock icon component for backward-compatibility or type-safety
function LockIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
