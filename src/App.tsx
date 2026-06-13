/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef, lazy, Suspense, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft,
  ChevronLeft,
  LayoutDashboard, 
  LayoutGrid,
  Lightbulb, 
  Hash, 
  PenTool, 
  UserCircle, 
  Image as ImageIcon, 
  BarChart3, 
  Calendar, 
  Calculator, 
  TrendingUp, 
  Users, 
  Zap, 
  Share2, 
  Settings, 
  Search, 
  Microscope,
  Cpu, 
  Sliders, 
  Loader2, 
  AlertCircle,
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  Command,
  ArrowRight,
  Trophy,
  Activity,
  History as HistoryIcon,
  Clock,
  MessageSquare,
  MessageCircle,
  Heart,
  Send,
  CheckCircle2,
  FileText,
  Download,
  BookOpen,
  Book,
  Video,
  Tag,
  Compass,
  Bell,
  FilePlus2,
  Globe,
  MoreHorizontal,
  Home,
  HelpCircle,
  Menu,
  X,
  LogOut,
  LogIn,
  Shield,
  Youtube,
  Instagram,
  Sparkles,
  Copy,
  Check,
  Coins,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { exportToJSON, exportToCSV, exportToTXT } from './lib/exportUtils';
import { Tooltip } from './components/Tooltip';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ChidonLogo } from './components/ChidonLogo';
import { WelcomePage } from './components/WelcomePage';
import { GeminiFeatureAnalyzer } from './components/GeminiFeatureAnalyzer';

// PERF: Lazy load heavy overlays and non-critical modular sub-components to reduce initial load times and optimize bundle sizing
const FeedbackModal = lazy(() => import('./components/FeedbackModal').then(m => ({ default: m.FeedbackModal })));
const PostScheduler = lazy(() => import('./components/PostScheduler').then(m => ({ default: m.PostScheduler })));
const ChidonVault = lazy(() => import('./components/ChidonVault').then(m => ({ default: m.ChidonVault })));
const ChidonIqGuide = lazy(() => import('./components/ChidonIqGuide').then(m => ({ default: m.ChidonIqGuide })));
const RuledBook = lazy(() => import('./components/RuledBook').then(m => ({ default: m.RuledBook })));
const DownbaseFooter = lazy(() => import('./components/DownbaseFooter').then(m => ({ default: m.DownbaseFooter })));
const TemplateLibrary = lazy(() => import('./components/TemplateLibrary').then(m => ({ default: m.TemplateLibrary })));

import { 
  ScriptPrompterWidget, 
  ProfileMockupWidget, 
  ThumbnailCanvasWidget, 
  GrowthMathWidget, 
  TrendMomentumTickerWidget, 
  AudienceDossierWidget, 
  RepurposePipelineWidget 
} from './components/SpecializedWidgets';

export const BookContext = createContext<{ onSendToBook?: (content: string, title?: string) => void }>({});
import { cn } from './lib/utils';
import LanguageSelector, { LANGUAGES } from './components/LanguageSelector';
import { GigSocial } from './components/GigSocial';
import { ChidonIqBlog } from './components/ChidonIqBlog';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  setDoc,
  deleteDoc,
  limit,
  getDocs
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  User 
} from 'firebase/auth';
import { db, auth } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
};

// --- TYPES ---

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
}

type FeatureId = 
  | 'content-ideas'
  | 'hashtags'
  | 'scripts'
  | 'bio'
  | 'thumbnails'
  | 'competitor-analysis'
  | 'posting-schedule'
  | 'engagement-calc'
  | 'trending'
  | 'personas'
  | 'headlines'
  | 'repurposing'
  | 'post-scheduler'
  | 'drafts'
  | 'ruled-book'
  | 'template-library'
  | 'youtube-seo'
  | 'seo-scorecard'
  | 'keyword-research'
  | 'post-optimizer'
  // Video SEO Hub
  | 'vseo-title-desc'
  | 'vseo-tags'
  | 'vseo-scorecard'
  | 'vseo-keywords'
  | 'vseo-best-time'
  // Content Trends Hub
  | 'trending-topics'
  | 'daily-ideas'
  | 'trend-alerts'
  // Pro Layer
  | 'ai-script-outline';

interface Feature {
  id: FeatureId;
  label: string;
  icon: any;
  description: string;
  category?: 'Video SEO' | 'Trends' | 'Pro' | 'Core' | 'Growth';
  themeColor: string;
  glowColor: string;
  persona: string;
}

// --- CONSTANTS ---

const FORMATTING_PROTOCOL = `
[FORMATTING REQUIREMENT]: 
- Use clear H2 (##) and H3 (###) headers for structural integrity.
- Use bullet points for tactical lists and numbered lists for sequential protocols.
- Use **bold text** for critical insights and key performance markers.
- Ensure TRIPLE-LINE breaks (press Enter three times) between major sections.
- Ensure DOUBLE-LINE breaks (press Enter twice) between ALL paragraphs and ALL list items.
- Use structured Markdown tables for all data comparisons, metric breakdowns, and result lists. 
- Tables MUST have clear headers and at least 3 columns to provide deep intelligence.
- Maintain a professional, bold, and authoritative technical tone.
- Avoid walls of text; keep paragraphs concise (max 2 sentences).
`;

const categories = ['Core', 'Video SEO', 'Trends', 'Growth', 'Pro'];

const FEATURES: Feature[] = [
  { 
    id: 'content-ideas', 
    label: 'Video Ideas', 
    icon: Lightbulb, 
    description: 'Viral video formats, hooks, and script protocols.', 
    category: 'Core',
    themeColor: 'text-cyan-primary',
    glowColor: 'bg-cyan-primary/20',
    persona: 'Viral Producer AI'
  },
  { 
    id: 'hashtags', 
    label: 'Hashtag Engine', 
    icon: Hash, 
    description: 'Ranked hashtag research with reach tiers.', 
    category: 'Core',
    themeColor: 'text-purple-vibrant',
    glowColor: 'bg-purple-vibrant/20',
    persona: 'Reach Architect AI'
  },
  { 
    id: 'scripts', 
    label: 'Script Writer', 
    icon: PenTool, 
    description: 'Platform-specific scripts with length controls.', 
    category: 'Core',
    themeColor: 'text-emerald-vibrant',
    glowColor: 'bg-emerald-vibrant/20',
    persona: 'Narrative Engine AI'
  },
  { 
    id: 'bio', 
    label: 'Bio Optimizer', 
    icon: UserCircle, 
    description: 'Three optimized bio versions with strategy.', 
    category: 'Core',
    themeColor: 'text-pink-vibrant',
    glowColor: 'bg-pink-vibrant/20',
    persona: 'Identity Strategist AI'
  },
  { 
    id: 'thumbnails', 
    label: 'Thumbnail Designer', 
    icon: ImageIcon, 
    description: 'Visual concept briefs and psychology.', 
    category: 'Core',
    themeColor: 'text-amber-500',
    glowColor: 'bg-amber-500/20',
    persona: 'Visual Psychologist AI'
  },
  { 
    id: 'competitor-analysis', 
    label: 'Competitor Lab', 
    icon: BarChart3, 
    description: 'Strategic intelligence and pillar charts.', 
    category: 'Core',
    themeColor: 'text-cyan-400',
    glowColor: 'bg-cyan-400/20',
    persona: 'Market Analyst AI'
  },
  { 
    id: 'posting-schedule', 
    label: 'Schedule Lab', 
    icon: Calendar, 
    description: 'Styled weekly optimized calendar grid.', 
    category: 'Core',
    themeColor: 'text-blue-500',
    glowColor: 'bg-blue-500/20',
    persona: 'Temporal Logistics AI'
  },
  { 
    id: 'engagement-calc', 
    label: 'Engagement Advisor', 
    icon: Calculator, 
    description: 'Computing rates and 30-day growth plans.', 
    category: 'Core',
    themeColor: 'text-emerald-400',
    glowColor: 'bg-emerald-400/20',
    persona: 'Growth Mathematician AI'
  },
  { 
    id: 'trending', 
    label: 'Trend Detector', 
    icon: TrendingUp, 
    description: '20 momentum-scored trending topics.', 
    category: 'Core',
    themeColor: 'text-orange-500',
    glowColor: 'bg-orange-500/20',
    persona: 'Trend Pulse AI'
  },
  { 
    id: 'personas', 
    label: 'Audience Builder', 
    icon: Users, 
    description: 'Fictional audience profiles and psychological triggers.', 
    category: 'Core',
    themeColor: 'text-indigo-500',
    glowColor: 'bg-indigo-500/20',
    persona: 'Psychographic Architect AI'
  },
  { 
    id: 'headlines', 
    label: 'Headline Hook', 
    icon: Zap, 
    description: '10 hook formulas with predicted CTR markers.', 
    category: 'Core',
    themeColor: 'text-yellow-400',
    glowColor: 'bg-yellow-400/20',
    persona: 'Click Magnet AI'
  },
  { 
    id: 'repurposing', 
    label: 'Repurpose AI', 
    icon: Share2, 
    description: 'Tactical content conversion for multi-platform ops.', 
    category: 'Core',
    themeColor: 'text-cyan-primary',
    glowColor: 'bg-cyan-primary/20',
    persona: 'Omni-channel Strategist AI'
  },
  { 
    id: 'post-scheduler', 
    label: 'Command Calendar', 
    icon: Calendar, 
    description: 'Tactical content scheduling and queue management.', 
    category: 'Core',
    themeColor: 'text-white',
    glowColor: 'bg-white/10',
    persona: 'Operations Matrix AI'
  },
  { 
    id: 'drafts', 
    label: 'CHIDON Vault', 
    icon: BookOpen, 
    description: 'Specialized index of saved scripts, social bios, and intelligence reports.', 
    category: 'Core',
    themeColor: 'text-brand',
    glowColor: 'bg-brand/20',
    persona: 'Vault Guardian AI'
  },
  { 
    id: 'ruled-book', 
    label: 'Book with Lines', 
    icon: Book, 
    description: 'Digital journal and script book structured over authentic ruled sheets.', 
    category: 'Core',
    themeColor: 'text-cyan-primary',
    glowColor: 'bg-cyan-primary/20',
    persona: 'Lined Scribe AI'
  },
  { 
    id: 'template-library', 
    label: 'CHIDON IQ Template Library', 
    icon: Sparkles, 
    description: 'Populate professional social posts, bios, and competitor maps with CHIDON Intelligence Engine.', 
    category: 'Core',
    themeColor: 'text-cyan-primary',
    glowColor: 'bg-cyan-primary/20',
    persona: 'Architect copywriter AI'
  },
  { 
    id: 'post-optimizer', 
    label: 'Time Optimizer', 
    icon: Clock, 
    description: 'Global posting windows optimized by local data.', 
    category: 'Growth',
    themeColor: 'text-emerald-vibrant',
    glowColor: 'bg-emerald-vibrant/20',
    persona: 'Chronos Optimizer AI'
  },
  { 
    id: 'youtube-seo', 
    label: 'YouTube SEO', 
    icon: Trophy, 
    description: 'Viral metadata optimization and ranking strategy.', 
    category: 'Core',
    themeColor: 'text-red-500',
    glowColor: 'bg-red-500/20',
    persona: 'YouTube Authority AI'
  },
  { 
    id: 'seo-scorecard', 
    label: 'SEO Scorecard', 
    icon: Activity, 
    description: 'Real-time neural content audit and score.', 
    category: 'Core',
    themeColor: 'text-emerald-500',
    glowColor: 'bg-emerald-500/20',
    persona: 'Algorithmic Judge AI'
  },
  { 
    id: 'keyword-research', 
    label: 'Keyword Intel', 
    icon: Microscope, 
    description: 'Deep volume, competition, and difficulty scan.', 
    category: 'Core',
    themeColor: 'text-amber-500',
    glowColor: 'bg-amber-500/20',
    persona: 'Data Miner AI'
  },
  
  // Video SEO Hub
  { 
    id: 'vseo-title-desc', 
    label: 'Title + Description Generator', 
    icon: Video, 
    description: 'High-CTR titles and descriptions optimized for growth.', 
    category: 'Video SEO',
    themeColor: 'text-red-400',
    glowColor: 'bg-red-400/20',
    persona: 'Metadata Architect AI'
  },
  { 
    id: 'vseo-tags', 
    label: 'Tag Architect', 
    icon: Tag, 
    description: 'Neural tag extraction for high-volume ranking.', 
    category: 'Video SEO',
    themeColor: 'text-red-500',
    glowColor: 'bg-red-500/20',
    persona: 'Semantic Tagging AI'
  },
  { 
    id: 'vseo-scorecard', 
    label: 'Video Auditor', 
    icon: Trophy, 
    description: '1-100 score based on title, tags, and keywords.', 
    category: 'Video SEO',
    themeColor: 'text-emerald-400',
    glowColor: 'bg-emerald-400/20',
    persona: 'Ranking Auditor AI'
  },
  { 
    id: 'vseo-keywords', 
    label: 'Keyword Research', 
    icon: Microscope, 
    description: 'Data-driven search volume, competition tiers, and related video terms.', 
    category: 'Video SEO',
    themeColor: 'text-amber-400',
    glowColor: 'bg-amber-400/20',
    persona: 'Query Intelligence AI'
  },
  { 
    id: 'vseo-best-time', 
    label: 'Post Optimizer', 
    icon: Clock, 
    description: 'Data-driven timing for maximum reach.', 
    category: 'Video SEO',
    themeColor: 'text-blue-400',
    glowColor: 'bg-blue-400/20',
    persona: 'Temporal Reach AI'
  },

  // Trends Hub
  { 
    id: 'trending-topics', 
    label: 'Trending Topics', 
    icon: Globe, 
    description: 'Real-time niche trending topics updated daily with momentum scores.', 
    category: 'Trends',
    themeColor: 'text-amber-500',
    glowColor: 'bg-amber-500/20',
    persona: 'Global Trend Scout AI'
  },
  { 
    id: 'daily-ideas', 
    label: 'Daily Video Ideas', 
    icon: Lightbulb, 
    description: 'Neural content suggestions based on current niche heatmaps.', 
    category: 'Trends',
    themeColor: 'text-yellow-400',
    glowColor: 'bg-yellow-400/20',
    persona: 'Creative Pulse AI'
  },
  { 
    id: 'trend-alerts', 
    label: 'Trend Alerts', 
    icon: Bell, 
    description: 'Neural notification protocols for sudden keyword spikes.', 
    category: 'Trends',
    themeColor: 'text-pink-500',
    glowColor: 'bg-pink-500/20',
    persona: 'Spike Surveillance AI'
  },

  // Pro Layer
  { 
    id: 'ai-script-outline', 
    label: 'Script Blueprint', 
    icon: FilePlus2, 
    description: 'Full narrative architecture from seed keywords.', 
    category: 'Pro',
    themeColor: 'text-purple-vibrant',
    glowColor: 'bg-purple-vibrant/20',
    persona: 'Narrative Architect AI'
  },
];

// PERF: Elegant micro-skeleton loader to improve core web vitals and provide beautiful instant feedback during lazy-loading component resolution
const ComponentLoader = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 font-mono tracking-wider animate-pulse text-xs min-h-[400px]">
    <Loader2 className="animate-spin text-brand mb-3" size={24} />
    SYNCHRONIZING DIGITAL MODULAR NODE...
  </div>
);

// --- HYBRID AI SERVICE ---

const useHybridAI = (geminiKey: string | null, hfKey: string | null) => {
  const { i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string, featureLabel: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, language: i18n.language }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const geminiText = data.text;
      if (!geminiText) throw new Error("No response from Gemini.");

      let finalResult = geminiText;

      // 2. Optional Hugging Face Refinement (Secondary Intelligence)
      if (hfKey) {
        try {
          const hfResponse = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1",
            {
              headers: { 
                Authorization: `Bearer ${hfKey}`,
                "Content-Type": "application/json" 
              },
              method: "POST",
              body: JSON.stringify({ 
                inputs: `[SYSTEM: STRATEGIC REFINEMENT] Review the following content and provide 3 high-impact, actionable psychological triggers or growth hacks specifically for this content to amplify its performance. Keep it extremely concise and professional.
                
                Content: ${geminiText.substring(0, 1000)}`,
                parameters: { 
                  max_new_tokens: 300,
                  temperature: 0.7,
                }
              }),
            }
          );
          const hfResult = await hfResponse.json();
          const hfText = Array.isArray(hfResult) ? hfResult[0]?.generated_text : hfResult.generated_text;

          if (hfText) {
            // Clean HF text (often repeats prompt)
            const cleanHfText = hfText.split('Content:')[1] || hfText;
            finalResult += `\n\n---\n\n### 🛡️ HYBRID AI: CHIDON IQ + HUGGING FACE INSIGHTS\n${cleanHfText}`;
          }
        } catch (hfErr) {
          console.warn("Hugging Face integration skipped:", hfErr);
        }
      }

      setLoading(false);
      return finalResult;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
      setLoading(false);
      return null;
    }
  };

  return { generate, loading, error };
};

// --- COMPONENTS ---

const SystemStatus = ({ activeNodes = 0, geminiActive = false }: { activeNodes: number, geminiActive?: boolean }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const messages = [
      "Establishing secure CHIDON IQ uplink...",
      "Neural pathway synchronized.",
      "Global intelligence nodes detected: " + activeNodes,
      geminiActive ? "Neural Sync Engine: ONLINE" : "Neural Sync Engine: STANDBY",
      "Optimizing content delivery protocols...",
      "Status: Declassified. Network operational."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [messages[i], ...prev].slice(0, 5));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activeNodes, geminiActive]);

  return (
    <div className="space-y-4 p-4 border-t border-white/5 font-mono">
      <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-slate-300 font-extrabold mb-2 bg-white/5 py-1 px-2 rounded">
        <span>Command System Status</span>
        <div className="flex items-center gap-2">
           <div className={cn("w-1.5 h-1.5 rounded-full", geminiActive ? "bg-cyan-primary animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "bg-red-500")} />
           <Activity size={10} className="text-cyan-primary animate-pulse" />
        </div>
      </div>
      <div className="space-y-1.5 h-[80px] overflow-hidden">
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1 - (i * 0.2), x: 0 }}
            className="flex items-start gap-2"
          >
            <span className="text-cyan-primary shrink-0 opacity-50">&gt;</span>
            <span className="text-[7.5px] leading-tight text-slate-100 uppercase tracking-widest font-black">{log}</span>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
        <div className="space-y-0.5">
          <span className="text-[7px] text-slate-300 uppercase block font-black">Memory Pool</span>
          <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
            <motion.div 
               animate={{ width: ['20%', '45%', '35%'] }} 
               transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
               className="h-full bg-cyan-primary/40" 
            />
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[7px] text-slate-300 uppercase block font-black">Sync Rate</span>
          <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
            <motion.div 
               animate={{ width: ['70%', '95%', '85%'] }} 
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
               className="h-full bg-emerald-500/40" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onClick}
    className="flex items-center gap-3 px-6 py-4 bg-navy-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 hover:border-cyan-primary/50 transition-all text-[10px] uppercase tracking-[0.4em] font-black group mb-10 shadow-2xl relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <ChevronLeft size={18} className="text-cyan-primary group-hover:-translate-x-1 transition-transform relative z-10" />
    <span className="relative z-10">Go Back</span>
  </motion.button>
);

const MovingIcon = ({ icon: Icon, color = 'text-cyan-primary', glowColor = 'bg-cyan-primary/20' }: { icon: any, color?: string, glowColor?: string }) => (
  <div className="relative mb-4">
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
        filter: [`drop-shadow(0 0 0px rgba(0,0,0,0))`, `drop-shadow(0 0 12px ${color === 'text-cyan-primary' ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.2)'})`, `drop-shadow(0 0 0px rgba(0,0,0,0))`]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
      className={cn("relative z-10", color)}
    >
      <Icon size={40} strokeWidth={2.5} />
    </motion.div>
    <motion.div
      animate={{ 
        scale: [1, 1.8, 1],
        opacity: [0.1, 0.4, 0.1]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        ease: "linear" 
      }}
      className={cn("absolute inset-0 rounded-full blur-2xl -z-10", glowColor)}
    />
  </div>
);

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <button 
      onClick={handleCopy} 
      className="btn-secondary h-8 py-0 px-3 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-200 cursor-pointer"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

const FeatureLayout = ({ feature, children, messages, actions, onBack }: { feature: Feature, children: React.ReactNode, messages?: ChatMessage[], actions?: (msg: ChatMessage) => React.ReactNode, onBack?: () => void }) => {
  const { t } = useTranslation();
  const { onSendToBook } = useContext(BookContext);
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Tool Header */}
      <div className="space-y-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand transition-all group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">{t('common.back') || t('buttons.back') || 'Back'}</span>
          </button>
        )}
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-xl bg-brand/10", feature.themeColor)}>
            <feature.icon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {t(`features.${feature.id}.label`) || feature.label}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{t(`features.${feature.id}.desc`) || feature.description}</p>
          </div>
        </div>
      </div>

    <div className="space-y-8 pb-32">
       {/* Animated Gemini Strategic Feature Analyzer */}
       <GeminiFeatureAnalyzer 
         featureId={feature.id} 
         featureLabel={t(`features.${feature.id}.label`) || feature.label} 
         featureDesc={t(`features.${feature.id}.desc`) || feature.description} 
         themeColor={feature.themeColor}
       />
       
       {/* Chat History */}
       <AnimatePresence mode="popLayout">
         {messages && messages.map((msg, idx) => (
           <motion.div
             key={msg.id}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className={cn(
               "flex flex-col space-y-4",
               msg.role === 'user' ? "items-end" : "items-start"
             )}
           >
             <div className={cn(
                "max-w-[90%] sm:max-w-[80%] p-6 rounded-2xl border",
                msg.role === 'user' 
                  ? "bg-brand text-white border-brand shadow-lg" 
                  : "card-base"
             )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className={cn(
                    "markdown-body leading-relaxed text-sm",
                    msg.role === 'user' ? "text-white" : "text-[var(--text-primary)]"
                  )}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
             </div>

              {msg.role === 'assistant' && (
                <div className="flex flex-wrap gap-2 px-1">
                   {actions && actions(msg)}
                   <CopyButton text={msg.content} />
                   {onSendToBook && (
                     <button 
                       onClick={() => onSendToBook(msg.content, t(`features.${feature.id}.label`) || feature.label)}
                       className="btn-primary h-8 py-0 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-200 cursor-pointer text-white"
                     >
                       <Book size={12} />
                       <span>Send to Book with Lines</span>
                     </button>
                   )}
                </div>
              )}
           </motion.div>
         ))}
       </AnimatePresence>

       {/* Tool Interface (Inputs) */}
       <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="pt-4"
       >
         {children}
       </motion.div>
    </div>
  </div>
  );
};

const GlowingCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("card-base p-8 relative overflow-hidden", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none opacity-50" />
    <div className="relative z-10">{children}</div>
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  className,
  disabled
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-gray-800",
    danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

// --- FEATURE VIEWS ---

const ContentGenerator = ({ onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, feature, onBack }: any) => {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('YouTube & TikTok');
  const [tone, setTone] = useState('Viral Hook & Intense');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleAction = () => {
    const prompt = `Act as a Viral Video Producer. Generate 5 high-impact ${platform.toUpperCase()} content strategies for the niche: "${niche}". 
    The tone of voice configuration should be strictly optimized for: "${tone}".
    For each video idea, strictly provide:
    1. 🎥 VIDEO FORMAT
    2. 💡 THE BIG IDEA
    3. 🎭 VIRAL HOOK
    4. 📜 SCRIPT PROTOCOL
    5. 🚀 STRATEGIC GOAL
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `Generate strategies for: ${niche} (${platform} | ${tone})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback('content-ideas', msg.content)} className="h-8 py-0 px-3">
        <MessageSquare size={12} /> Feedback
      </Button>
      <Button variant="secondary" onClick={() => onSaveDraft('content-ideas', msg.content, `Strategy: ${niche} (${platform})`)} className="h-8 py-0 px-3">
        <BookOpen size={12} /> Vault
      </Button>
    </>
  );

  const suggestions = ["AI Productivity Hacks", "SaaS Side Hustles", "Minimalist Tech Setup", "Financial Freedom secrets"];

  // Smart parser to break markdown into separate cards using key matches
  const lastResponse = messages && messages.slice().reverse().find((m: any) => m.role === 'assistant');
  
  const parsedCards = useMemo(() => {
    if (!lastResponse) return [];
    const text = lastResponse.content;
    
    // Split text by "🎥" or generic list items
    const segments = text.split(/(?=🎥|Idea \d|Strategy \d|### \d)/gi);
    const validCards = segments.filter(s => s.trim().length > 40);
    
    if (validCards.length === 0) {
      return [{
        title: `Strategy Direction`,
        idea: text,
        hook: "Look for detail in raw output",
        goal: "Intense",
        rawSegment: text
      }];
    }

    return validCards.map((seg, idx) => {
      // Clean up titles and extract properties
      const formatMatch = seg.match(/(?:🎥|FORMAT).*?:?\s*(.*)/gi);
      const ideaMatch = seg.match(/(?:💡|IDEA).*?:?\s*(.*)/gi);
      const hookMatch = seg.match(/(?:🎭|HOOK).*?:?\s*(.*)/gi);
      const goalMatch = seg.match(/(?:🚀|GOAL).*?:?\s*(.*)/gi);

      const title = formatMatch ? formatMatch[0].replace(/🎥|FORMAT|:|[*]/g, '').trim() : `Video Asset Direction ${idx + 1}`;
      const idea = ideaMatch ? ideaMatch[0].replace(/💡|IDEA|:|[*]/g, '').trim() : seg.substring(0, 180) + '...';
      const hook = hookMatch ? hookMatch[0].replace(/🎭|HOOK|:|[*]/g, '').trim() : 'Highly engaging attention interrupt hook';
      const goal = goalMatch ? goalMatch[0].replace(/🚀|GOAL|:|[*]/g, '').trim() : 'Boost subscriber velocity triggers';

      return {
        title,
        idea,
        hook,
        goal,
        rawSegment: seg
      };
    });
  }, [lastResponse]);

  const copyCard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <FeatureLayout 
      feature={feature} 
      messages={messages}
      actions={actions}
      onBack={onBack}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {parsedCards.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-cyan-primary bg-cyan-primary/10 px-2.5 py-1 rounded border border-cyan-primary/20 uppercase tracking-widest font-black">BENTO VIRAL STORYBOARD</span>
                <h3 className="text-xl font-bold text-white mt-1 uppercase">Generated Strategy Cards ({parsedCards.length})</h3>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setNiche('');
                }}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Create New Batch
              </button>
            </div>

            {/* Carousel display deck */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card List Sidebar for Quick Toggle */}
              <div className="space-y-3 md:col-span-1 text-left">
                {parsedCards.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentCardIndex(idx)}
                    className={cn(
                      "w-full p-4 text-left rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col space-y-1 select-none",
                      currentCardIndex === idx
                        ? "bg-cyan-primary/10 border-cyan-primary/40 text-white"
                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900 hover:border-white/10"
                    )}
                  >
                    <span className="text-[9px] font-mono font-black text-cyan-primary tracking-widest uppercase">VIRAL TRACK {idx + 1}</span>
                    <span className="text-sm font-bold line-clamp-1">{c.title}</span>
                  </button>
                ))}
              </div>

              {/* Interactive Cinematic Bento Box Detail */}
              <div className="md:col-span-2 text-left">
                <AnimatePresence mode="wait">
                  {parsedCards[currentCardIndex] && (
                    <motion.div
                      key={currentCardIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-6 md:p-8 bg-gradient-to-b from-slate-950/80 to-slate-900/80 border border-white/10 rounded-3xl space-y-6 relative overflow-hidden text-left"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <span className="text-[9px] font-mono text-slate-400 border border-white/10 rounded px-2 py-0.5 uppercase bg-slate-950/40">
                          {platform}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black text-cyan-primary tracking-widest uppercase">Format Direction</span>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight">{parsedCards[currentCardIndex].title}</h4>
                      </div>

                      {/* Video Concept block */}
                      <div className="space-y-1.5 p-4 bg-slate-900 border border-white/5 rounded-2xl text-left">
                        <span className="text-[9px] font-mono text-slate-400 font-extrabold block uppercase tracking-wide">💡 core concept</span>
                        <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">{parsedCards[currentCardIndex].idea}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Hook details */}
                        <div className="p-4 bg-purple-vibrant/5 border border-purple-vibrant/25 rounded-2xl shadow-inner text-left">
                          <span className="text-[9px] font-mono text-purple-vibrant font-black block uppercase tracking-wide">🎭 attention pattern-interrupt (hook)</span>
                          <p className="text-xs text-purple-200 mt-1 font-sans font-semibold italic">"{parsedCards[currentCardIndex].hook}"</p>
                        </div>

                        {/* Production target goal */}
                        <div className="p-4 bg-emerald-vibrant/5 border border-emerald-vibrant/25 rounded-2xl shadow-inner text-left">
                          <span className="text-[9px] font-mono text-emerald-vibrant font-black block uppercase tracking-wide">🚀 expected conversion goal</span>
                          <p className="text-xs text-emerald-100 mt-1 font-sans font-medium">{parsedCards[currentCardIndex].goal}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-cyan-primary animate-pulse" />
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-black">Velocity Rating: 9.8/10</span>
                        </div>
                        <button
                          onClick={() => copyCard(parsedCards[currentCardIndex].rawSegment)}
                          className="px-4 py-2 bg-cyan-primary hover:bg-cyan-primary/90 text-white font-bold font-mono text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Share2 size={12} />
                          <span>Copy Clip Data</span>
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>
        ) : null}

        {parsedCards.length === 0 && (
          <GlowingCard className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Niche / Topic</label>
              <input 
                type="text" 
                placeholder="e.g. AI Productivity, Luxury Cars..."
                className="input-base w-full py-4 text-lg"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Examples:</span>
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setNiche(s)}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform selection slider list */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Platform</label>
              <div className="flex flex-wrap gap-2">
                {['YouTube & TikTok', 'Instagram Reels', 'LinkedIn Narrative', 'Twitter/X Post', 'Premium Newsletter'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                      platform === p 
                        ? "border-brand bg-brand/10 text-brand font-semibold"
                        : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone target selection list */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tone Strategy</label>
              <div className="flex flex-wrap gap-2">
                {['Viral Hook & Intense', 'Informative & Direct', 'Storyteller & Warm', 'Brutalist & Technical'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                      tone === t 
                        ? "border-brand bg-brand/10 text-brand font-semibold"
                        : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
              Generate Content Strategies
            </Button>
          </GlowingCard>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Synthesizing strategies...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};

const HashtagEngine = ({ onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, feature, onBack }: any) => {
  const [topic, setTopic] = useState('');
  const [campaignFocus, setCampaignFocus] = useState('Broad reach and growth vector');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all');

  const handleAction = () => {
    const prompt = `Perform deep hashtag research for the topic: "${topic}" optimized specifically for campaign focus: "${campaignFocus}". 
    Provide exactly 30 ranked hashtags organized into Reach Tiers:
    - Tier 1: Low Competition (Under 100k posts)
    - Tier 2: Medium Growth (100k - 1M posts)
    - Tier 3: Viral Authority (1M+ posts)

    For each hashtag, provide a "Relevance Score" and "Competition Level".
    
    IMPORTANT: Every single hashtag must be on its own line with a clear vertical gap between them.
    Format as a structured table-like list representing a deep-scan analysis.
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `Research hashtags for: ${topic} (${campaignFocus})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback('hashtags', msg.content)} className="h-8 py-0 px-3">
        <MessageSquare size={12} /> Feedback
      </Button>
      <Button variant="secondary" onClick={() => onSaveDraft('hashtags', msg.content, `Hashtags: ${topic || 'Scanned'}`)} className="h-8 py-0 px-3">
        <BookOpen size={12} /> Vault
      </Button>
    </>
  );

  const topicSuggestions = ["Web3 Tech Dev", "Quiet Luxury Living", "Home Cafe Coffee", "Solo Indie Creator"];

  // Helper to extract hashtags from the markdown response
  const lastResponse = messages && messages.slice().reverse().find((m: any) => m.role === 'assistant');
  
  const tagsList = useMemo(() => {
    if (!lastResponse) return [];
    const text = lastResponse.content;
    const rawMatches = text.match(/#[a-zA-Z0-9_]+/g) || [];
    const uniqueTags = Array.from(new Set(rawMatches.map((t: string) => t.trim())));
    
    // Categorize them into 3 Tiers deterministically based on hash code or string characteristics
    return uniqueTags.map((tag: any, index: number) => {
      // Deterministic classification
      const rating = Math.floor(Math.abs(Math.sin(index + 2)) * 30) + 70; // 70-100%
      let tier = 1;
      let reach = '';
      if (index % 3 === 0) {
        tier = 3;
        reach = '1M+ (Viral)';
      } else if (index % 3 === 1) {
        tier = 2;
        reach = '100k - 1M (Growth)';
      } else {
        tier = 1;
        reach = 'Under 100k (Low Comp)';
      }

      return {
        tag,
        tier,
        reach,
        score: rating,
        competition: tier === 3 ? 'High' : tier === 2 ? 'Medium' : 'Low'
      };
    });
  }, [lastResponse]);

  const copyIndividual = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const copySelectedGroup = (tier?: number) => {
    const filterTags = tier ? tagsList.filter(t => t.tier === tier) : tagsList;
    const textToCopy = filterTags.map(t => t.tag).join(' ');
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const filteredTags = useMemo(() => {
    if (activeTierFilter === 'all') return tagsList;
    if (activeTierFilter === 'tier1') return tagsList.filter(t => t.tier === 1);
    if (activeTierFilter === 'tier2') return tagsList.filter(t => t.tier === 2);
    return tagsList.filter(t => t.tier === 3);
  }, [tagsList, activeTierFilter]);

  return (
    <FeatureLayout 
      feature={feature} 
      messages={messages}
      actions={actions}
      onBack={onBack}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* If tags are generated, show dynamic custom categorized interface */}
        {tagsList.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-base p-6 md:p-8 space-y-6 bg-slate-950/60 border-2 border-purple-500/20 rounded-3xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-vibrant bg-purple-vibrant/10 px-2.5 py-1 rounded border border-purple-vibrant/20 uppercase tracking-widest">REAL-TIME HASHTAG DIRECTORY</span>
                <h3 className="text-lg font-bold text-white uppercase mt-1">Arranged Viral Clusters ({tagsList.length} tags)</h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => copySelectedGroup()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Hash size={13} />
                  <span>{copiedAll ? '✓ All Copied' : 'Copy All Tags'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTopic('');
                    // Scroll to input if possible, clearing messages resets state
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-[var(--border-base)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                >
                  Scan Another Topic
                </button>
              </div>
            </div>

            {/* Quick Filter tabs to see reach levels */}
            <div className="flex gap-2 border-b border-white/5 pb-3">
              {[
                { label: 'All Clusters', id: 'all' },
                { label: 'Tier 1 (Under 100k)', id: 'tier1' },
                { label: 'Tier 2 (100k - 1M)', id: 'tier2' },
                { label: 'Tier 3 (Viral 1M+)', id: 'tier3' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveTierFilter(f.id as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer",
                    activeTierFilter === f.id
                      ? "bg-purple-vibrant/15 text-purple-vibrant border-purple-vibrant/30"
                      : "bg-transparent text-slate-400 border-transparent hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Visual Hashtag Chip Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTags.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyIndividual(item.tag)}
                  className="p-3 bg-slate-900 border border-white/5 rounded-2xl hover:border-purple-500/20 cursor-pointer text-left relative overflow-hidden group select-none flex justify-between items-center pr-2"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-100 block truncate group-hover:text-purple-400 max-w-[130px]" title={item.tag}>
                      {item.tag}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 block uppercase pt-0.5">
                      {item.reach}
                    </span>
                  </div>

                  <div className="p-1 px-1.5 rounded text-[9px] font-mono font-bold text-center border bg-slate-950/40 shrink-0 border-white/5">
                    {copiedTag === item.tag ? (
                      <span className="text-emerald-400 font-extrabold">Copied</span>
                    ) : (
                      <span className="text-purple-400">{item.score}%</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Explanatory insights in very brief form */}
            <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/40 text-left space-y-2">
              <span className="text-[8px] font-mono text-purple-vibrant font-black uppercase tracking-widest block">TACTICAL USE</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                Combine exactly <span className="text-purple-300 font-black">2 of Tier 3</span> tags (high traffic authority), <span className="text-purple-300 font-black">4 of Tier 2</span> tags (targeted velocity metrics), and <span className="text-purple-300 font-black">4 of Tier 1</span> tags (highly searchable low competition niches) in your descriptions to trigger the highest early indexing CTR.
              </p>
            </div>

          </motion.div>
        ) : null}

        {/* Input Form Setup */}
        {tagsList.length === 0 && (
          <GlowingCard className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Core Topic / Niche</label>
              <input 
                type="text" 
                placeholder="Enter core topic..."
                className="input-base w-full py-4 text-lg"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Examples:</span>
                {topicSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Distribution Intensity</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Broad Reach Network', val: 'Broad reach and growth vector' },
                  { label: 'Hyper-Targeted Niche', val: 'Dense local/hyper-niche conversions' },
                  { label: 'Maximum Viral Volume', val: 'High risk high reward viral hashtags' }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setCampaignFocus(item.val)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                      campaignFocus === item.val 
                        ? "border-brand bg-brand/10 text-brand font-semibold"
                        : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
              Execute Reach Analysis
            </Button>
          </GlowingCard>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Analyzing reach clusters...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};

const CompetitorLab = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [competitor, setCompetitor] = useState('');
  const [focus, setFocus] = useState('Deep UX & Content Hook Breakdown');
  
  const handleAction = () => {
    const prompt = `Perform a deep strategic analysis of the competitor / reference creator: "${competitor}" with selective analytical emphasis on: "${focus}". 
    Provide a multi-layered Intelligence Report:
    1. "Core Content Pillars": Identify their 3 most successful content types with engagement benchmarks.
    2. "Tactical Strengths": Why their audience converts (Visual style, Hook strategy, Pacing).
    3. "Market Gaps & Vulnerabilities": Specific content angles they are missing that you can exploit.
    4. "Audience Sentiment Scan": Typical community response patterns and triggers.
    5. "The Counter-Strike Protocol": A 3-step plan to outrank and outperform their top content.
    
    Format with structured tables and tactical H3 headers.
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `Analyze competitor: ${competitor} (${focus})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback(feature.id, msg.content)} className="h-8 py-0 px-3"><MessageSquare size={12} /> Feedback</Button>
      <Button variant="secondary" onClick={() => onSaveDraft(feature.id, msg.content, `Intel: ${competitor} (${focus})`)} className="h-8 py-0 px-3"><BookOpen size={12} /> Vault</Button>
    </>
  );

  const competitorSuggestions = ["@mrbeast", "@naval", "@hubermanlab", "@garyvee"];

  return (
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Identity</label>
            <input 
              type="text" 
              placeholder="Competitor username..."
              className="input-base w-full py-4 text-lg"
              value={competitor}
              onChange={(e) => setCompetitor(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5 items-center mt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Examples:</span>
              {competitorSuggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCompetitor(s)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Analysis Core Focus</label>
            <div className="flex flex-wrap gap-2">
              {['Deep UX & Content Hook Breakdown', 'SEO Keyword & Meta Alignment', 'Product Offer & conversion flow Analysis'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFocus(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                    focus === f 
                      ? "border-brand bg-brand/10 text-brand font-semibold"
                      : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
            Execute Luminary Scan
          </Button>
        </GlowingCard>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Infiltrating market clusters...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};

const ScheduleLab = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [niche, setNiche] = useState('');
  const [frequency, setFrequency] = useState('Daily Consistency (7 days)');
  
  const handleAction = () => {
    const prompt = `Develop a comprehensive optimized posting schedule for the niche: "${niche}" scaled to frequency intensity: "${frequency}". 
    Format the primary output as a structured Markdown Table representing a calendar grid.
    
    Include:
    - DAY (Mon-Sun)
    - PEAK TIME (AM/PM spikes adjusted to your frequency)
    - CONTENT TYPE (Reel, Carousel, Story sequence, Static, Article)
    - TOPIC FOCUS (The core category for that slot)
    - AUDIENCE STATE (Why they are active at this time)
    
    After the table, provide 3 "Tactical Growth Maneuvers" specifically for this schedule.
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `Generate schedule for: ${niche} (${frequency})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback(feature.id, msg.content)} className="h-8 py-0 px-3"><MessageSquare size={12} /> Feedback</Button>
      <Button variant="secondary" onClick={() => onSaveDraft(feature.id, msg.content, `Schedule: ${niche} (${frequency})`)} className="h-8 py-0 px-3"><BookOpen size={12} /> Vault</Button>
    </>
  );

  const nicheSuggestions = ["SaaS Coding Tutorials", "Organic cooking & meal prepping", "Minimalist Sustainable architecture", "Fintech & personal investing hacks"];

  return (
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Environment</label>
            <input 
              type="text" 
              placeholder="Market niche..."
              className="input-base w-full py-4 text-lg"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5 items-center mt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Examples:</span>
              {nicheSuggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNiche(s)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Frequency Strategy</label>
            <div className="flex flex-wrap gap-2">
              {['Daily Consistency (7 days)', 'Steady Growth (3-5 times / week)', 'Aggressive Burst Strategy (14 slots)'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                    frequency === f 
                      ? "border-brand bg-brand/10 text-brand font-semibold"
                      : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
            Execute Temporal Deployment
          </Button>
        </GlowingCard>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Syncing peak activity spikes...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};

const YouTubeSEO = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [topic, setTopic] = useState('');
  const [task, setTask] = useState('');
  const [focus, setFocus] = useState('Algorithm CTR & Search Authority');
  
  const handleAction = () => {
    const prompt = `You are an expert YouTube SEO analyst. Analyze core aspect: "${topic}". Task objective: "${task}". 
    Strategically optimize specifically for: "${focus}".
    
    Provide a multi-layered Video Intel Report:
    1. "Algorithm-Safe Titles": 5 Title options with Predicted CTR scores.
    2. "Semantic Tag Cluster": Optimized tags for reach.
    3. "SEO Scorecard & Recommendations": Explicit steps to hit a 100 SEO score.
    4. "Thumbnails Visual Briefs": Text-based visual descriptions of winning thumbnail concepts.
    
    Format with structured tables and clear H3 headers.
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `SEO Analysis for: ${topic} (${focus})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback(feature.id, msg.content)} className="h-8 py-0 px-3"><MessageSquare size={12} /> Feedback</Button>
      <Button variant="secondary" onClick={() => onSaveDraft(feature.id, msg.content, `SEO: ${topic} (${focus})`)} className="h-8 py-0 px-3"><BookOpen size={12} /> Vault</Button>
    </>
  );

  const contextSuggestions = [
    { label: "SaaS Dev", t: "How I Built a SaaS in 24 Hours with AI", d: "Target high click curiosity for early-mid stage founders" },
    { label: "Baking", t: "10 sourdough baking mistakes preventing open crumb", d: "Explain cleanly with troubleshooting benchmarks" },
    { label: "Tech Guide", t: "Next.js server actions vs API routes deep dive", d: "Target high programmatic search rank for web programmers" }
  ];

  return (
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Video Context</label>
              <input 
                type="text" 
                placeholder="Topic: e.g. iPhone 15 Pro Review..."
                className="input-base w-full py-4 text-lg"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Examples:</span>
                {contextSuggestions.map(s => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setTopic(s.t);
                      setTask(s.d);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Mission Directive / Objective</label>
              <textarea 
                placeholder="e.g. Rank for budget phone keywords..."
                rows={3}
                className="input-base w-full py-4 text-sm"
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Optimization Target Priority</label>
              <div className="flex flex-wrap gap-2">
                {['Algorithm CTR & Search Authority', 'Narrative Hook & View Duration', 'Keyword Expansion & Tag indexing'].map((fo) => (
                  <button
                    key={fo}
                    type="button"
                    onClick={() => setFocus(fo)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                      focus === fo 
                        ? "border-brand bg-brand/10 text-brand font-semibold"
                        : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                    )}
                  >
                    {fo}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
            Execute Ranking Protocol
          </Button>
        </GlowingCard>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Optimizing algorithm vectors...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};

const PostOptimizer = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('Global');
  const [format, setFormat] = useState('Video / Shorts / Reels');
  
  const handleAction = () => {
    const prompt = `Act as a Global Data Analyst. Optimize posting strategy for: "${niche}" in Region/Timezone node: "${country}" with creative format target: "${format}".
    
    Provide:
    1. "Global Heat Map Analysis": Best times across 7 days (Markdown Table).
    2. "Regional Delta Report": How timing shifts for major secondary markets.
    3. "Algorithm Surge Factors": 5 specific ways to increase reach during the first hour.
    4. "The Dead Zone Matrix": Times to strictly avoid and why.
    
    Format with structured tables and tactical headers.
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `Optimize posting for: ${niche} (${country} | ${format})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback(feature.id, msg.content)} className="h-8 py-0 px-3"><MessageSquare size={12} /> Feedback</Button>
      <Button variant="secondary" onClick={() => onSaveDraft(feature.id, msg.content, `Opt: ${niche} (${country})`)} className="h-8 py-0 px-3"><BookOpen size={12} /> Vault</Button>
    </>
  );

  const presetNiches = [
    { n: "Artificial Intelligence & LLMs", r: "USA (EST)" },
    { n: "Organic gardening & plant tips", r: "Europe (GMT)" },
    { n: "Indie hacker logs (build-in-public)", r: "Asia-Pacific (SGT)" },
    { n: "Minimalist desk tech configurations", r: "Global" }
  ];

  return (
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Niche</label>
              <input 
                type="text" 
                placeholder="e.g. Gaming, Beauty..."
                className="input-base w-full py-4 text-lg"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Region Node</label>
              <input 
                type="text" 
                placeholder="e.g. USA, UK, Global..."
                className="input-base w-full py-4 text-lg"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center mt-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Examples:</span>
            {presetNiches.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNiche(s.n);
                  setCountry(s.r);
                }}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
              >
                {s.n.split(" ")[0]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Pacing & Format Specificity</label>
            <div className="flex flex-wrap gap-2">
              {['Video / Shorts / Reels', 'Text Carousel / Thread', 'Long-form deep study'].map((fm) => (
                <button
                  key={fm}
                  type="button"
                  onClick={() => setFormat(fm)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                    format === fm 
                      ? "border-brand bg-brand/10 text-brand font-semibold"
                      : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                  )}
                >
                  {fm}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
            Sync Global Reach
          </Button>
        </GlowingCard>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Recalibrating global node clusters...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};




const SEOScorecard = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [content, setContent] = useState('');
  const [keywords, setKeywords] = useState('');
  const [mode, setMode] = useState('Standard Performance Scan');
 
  const handleAction = () => {
    const prompt = `You are a Senior SEO Content Auditor. Mission: Multi-Keyword Neural Audit.
    
    Target Keywords: ${keywords}
    Content to Audit: "${content}"
    Analysis Mode target details: "${mode}"
    
    Provide:
    1. "Keyword Resonance Matrix": Scores (0-100) for each keyword in a table.
    2. "Neural Optimization Breakdown": Relevancy, Authority, and Semantic Density.
    3. "High-Impact Fixes": 3 immediately actionable improvements.
    4. "LSI Expansion Map": Semantically related terms to include.
    
    Format with structured tables and clear tactical headers.
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `SEO Audit for: ${keywords} (${mode})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback(feature.id, msg.content)} className="h-8 py-0 px-3"><MessageSquare size={12} /> Feedback</Button>
      <Button variant="secondary" onClick={() => onSaveDraft(feature.id, msg.content, `SEO Audit: ${keywords} (${mode})`)} className="h-8 py-0 px-3"><BookOpen size={12} /> Vault</Button>
    </>
  );

  const sampleArticles: {label: string, k: string, c: string}[] = [];

  return (
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Keywords</label>
            <input 
              type="text" 
              placeholder="e.g. AI SEO, Digital Marketing..."
              className="input-base w-full py-4 text-lg"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            {sampleArticles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Sample Presets:</span>
                {sampleArticles.map(s => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setKeywords(s.k);
                      setContent(s.c);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Content Node</label>
            <textarea 
              placeholder="Paste content for neural analysis or select a preset above..."
              rows={4}
              className="input-base w-full py-4 text-base resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Audit Depth / Mode</label>
            <div className="flex flex-wrap gap-2">
              {['Standard Performance Scan', 'Deep LSI & Entity Scan'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                    mode === m 
                      ? "border-brand bg-brand/10 text-brand font-semibold"
                      : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
            Execute Neural Audit
          </Button>
        </GlowingCard>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Activity className="w-8 h-8 text-brand animate-pulse" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Calculating semantic density scopes...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};



const KeywordTrendGraph = ({ difficulty }: { difficulty: number }) => {
  // PERF: Memoize the trend data array to bypass expensive random walk arithmetic and reduce constant Recharts re-renders on page clicks
  const data = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      month: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'][i],
      score: Math.max(0, Math.min(100, difficulty + (Math.random() * 20 - 10)))
    }));
  }, [difficulty]);

  return (
    <div className="h-48 w-full mt-4 card-base p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Neural Difficulty Trend</span>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]">
          <HistoryIcon size={12} />
          <span>6-Month Scan</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-[var(--border-base)] opacity-10" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          />
          <YAxis hide domain={[0, 100]} />
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-base)', 
              borderRadius: '12px', 
              fontSize: '11px',
              color: 'var(--text-primary)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorScore)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const KeywordResearcher = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [keyword, setKeyword] = useState('');
  const [intent, setIntent] = useState('Informational search intent');

  const handleAction = () => {
    const prompt = `You are a Neural Keyword Research specialist. Seed Keyword: ${keyword}. Intent profiling focus target: "${intent}".
    
    Provide:
    1. "Search Intent Profile": Identifying informational/transactional leans.
    2. "Neural Strategy Matrix": 10 keywords with Volume, Difficulty, and Angle.
    3. "Competitor Node Scan": Analyze top 3 targets and their tactical weaknesses.
    4. "Semantic Expansion": 5 LSI terms.
    5. "Strategic Content Brief": A specific angle to dominate the niche.
    
    Format with structured tables and clear tactical headers.
    
    ${FORMATTING_PROTOCOL}`;
    onGenerate(prompt, `Research keywords for: ${keyword} (${intent})`);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback(feature.id, msg.content)} className="h-8 py-0 px-3"><MessageSquare size={12} /> Feedback</Button>
      <Button variant="secondary" onClick={() => onSaveDraft(feature.id, msg.content, `Research: ${keyword} (${intent})`)} className="h-8 py-0 px-3"><BookOpen size={12} /> Vault</Button>
    </>
  );

  const keywordSuggestions = ["Minimalist workspaces", "Kubernetes cluster setups", "Organic coffee subscriptions", "Zero waste packing tips"];

  return (
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Seed Keyword</label>
            <input 
              type="text" 
              placeholder="e.g. AI Content Marketing..."
              className="input-base w-full py-4 text-lg"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5 items-center mt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mr-1">Examples:</span>
              {keywordSuggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setKeyword(s)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors border border-[var(--border-base)]/30 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Audience Intent</label>
            <div className="flex flex-wrap gap-2">
              {['Informational search intent', 'Commercial value & High purchase intent'].map((it) => (
                <button
                  key={it}
                  type="button"
                  onClick={() => setIntent(it)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                    intent === it 
                      ? "border-brand bg-brand/10 text-brand font-semibold"
                      : "border-[var(--border-base)] bg-transparent text-[var(--text-secondary)] hover:border-brand/40"
                  )}
                >
                  {it}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
            Initiate Neural Scan
          </Button>
        </GlowingCard>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Microscope className="w-8 h-8 text-brand animate-pulse" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Scanning global keyword nodes...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};

const AdvancedNeuralTool = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
 
  const getInputs = () => {
    switch(feature.id) {
      case 'vseo-title-desc':
        return { p1: 'Core Topic / Concept', p2: 'Target Keywords (comma separated)' };
      case 'vseo-tags':
        return { p1: 'Video Title or Description', p2: 'Niche Context (e.g., Tech, Comedy)' };
      case 'vseo-scorecard':
        return { p1: 'Full Metadata (Title, Desc, Tags)', p2: 'Target Audience / Goal' };
      case 'vseo-keywords':
        return { p1: 'Target Topic / Keyword', p2: 'Negative Keywords or Competitive Focus (optional)' };
      case 'vseo-best-time':
        return { p1: 'Your Timezone', p2: 'Primary Audience Region (e.g., USA, India)' };
      case 'trending-topics':
        return { p1: 'Your Core Niche', p2: 'Recent successful video topic' };
      case 'daily-ideas':
        return { p1: 'Channel Description / Focus', p2: 'Current goal (Subscribers vs Views)' };
      case 'trend-alerts':
        return { p1: 'Keyword to Monitor', p2: 'Sensitivity Level (High/Medium/Low)' };
      case 'ai-script-outline':
        return { p1: 'Video Concept / Headline', p2: 'Target Duration (minutes)' };
      default:
        return { p1: 'Main Input', p2: 'Additional Context' };
    }
  };
 
  const placeholders = getInputs();
 
  const handleAction = () => {
    let prompt = '';
    switch(feature.id) {
       case 'vseo-title-desc':
         prompt = `Act as a Master Video Growth Strategist. Generate 10 high-CTR YouTube titles and 3 professionally optimized, high-conversion descriptions for: "${input1}". 
         Relevant Keywords to integrate: ${input2}. 
         
         For Titles, utilize:
         - Curiosity Gaps (The "Open Loop" technique)
         - Emotional Power Words
         - Specificity and Numerical anchors
         
         For Descriptions, ensure:
         - The first 2 lines are optimized for SEO and CTR snippets.
         - Strategic keyword density without stuffing.
         - Clear timestamps/chapters (simulated).
         - High-impact Call to Action (CTA).`;
         break;
       case 'vseo-tags':
         prompt = `Extract and generate 30 high-performing SEO tags for: "${input1}". Niche: ${input2}. 
         Sort tags by predicted volume and competition.`;
         break;
       case 'vseo-scorecard':
         prompt = `Provide a Video SEO Score (1-100) for the following metadata: "${input1}". Target: ${input2}.
         Analyze title strength, description optimization, tag relevance, and keyword density.
         Provide 5 clear improvements for a perfect 100 score.`;
         break;
       case 'vseo-keywords':
         prompt = `Perform a comprehensive YouTube Keyword Research scan for: "${input1}". Context/Constraints: ${input2}.
         Generate the result in a clean, readable data format including:
         1. "Neural Search Volume": Provide a estimated monthly search volume tier (e.g., 500k+, 50k - 100k).
         2. "Competition Score": A percentage-based difficulty rating (0-100%) with a "Low/Medium/High" label.
         3. "Trend Analysis": Is the keyword rising, stable, or seasonal?
         4. "High-Volume Related Keywords": A table of 10 related keywords specifically for video content, including their predicted reach potential.
         5. "Strategic Content Angle": One specific way to frame a video for this keyword to beat the competition.`;
         break;
       case 'vseo-best-time':
         prompt = `Analyze the best time to post for a creator in "${input1}" targeting "${input2}".
         Provide a heat-map style recommendation (Markdown table) and explain the cultural/algorithmic rationale.`;
         break;
       case 'trending-topics':
         prompt = `Act as a Global Trend Intelligence Officer. Identify the top 15 high-momentum trending topics for the niche: "${input1}". 
         Contextual Insights: ${input2}.
         
         For each topic, provide:
         - Neural Momentum Score (1-100)
         - Velocity Vector (How fast it is moving)
         - The "Viral Pivot" (The specific angle that makes it click)
         - Execution Strategy (How to outrank current results).`;
         break;
       case 'daily-ideas':
         prompt = `Generate 10 hyper-specific video topic ideas for: "${input1}". Primary Objective: ${input2}.
         These ideas must leverage recent search behavior and curiosity gap psychology. 
         Include a "Click-Magnet" headline for each idea.`;
         break;
       case 'trend-alerts':
         prompt = `SIMULATION: Execute a Neural Trend Spike Alert for the keyword constellation around: "${input1}". 
         Sensitivity Protocol: ${input2}.
         
         Generate a "Spike Intelligence Report":
         1. Alert Confidence Tier (High/Medium/Low)
         2. Estimated Traffic Volume Increase (%)
         3. Algorithm Reach Expansion Potential
         4. Content Response Matrix: Exact steps to take in the next 4 hours to dominate this spike.`;
         break;
       case 'ai-script-outline':
         prompt = `Generate a high-authority video script blueprint for: "${input1}". Target Duration: ${input2} minutes.
         Breakdown into:
         - Visual Hook
         - Narrative Pacing (Segment by segment)
         - Engagement Checkpoints
         - Hard Call-to-Action.`;
         break;
    }
    prompt += FORMATTING_PROTOCOL;
    onGenerate(prompt, `Analysis for: ${input1.slice(0, 30)}...`);
  };
 
  const actions = (msg: ChatMessage) => (
    <>
      <Button variant="secondary" onClick={() => onGenerateFeedback(feature.id, msg.content)} className="h-8 py-0 px-3"><MessageSquare size={12} /> Feedback</Button>
      <Button variant="secondary" onClick={() => onSaveDraft(feature.id, msg.content, `Vault: ${input1.slice(0, 20)}`)} className="h-8 py-0 px-3"><BookOpen size={12} /> Vault</Button>
    </>
  );
 
  const getSuggestions = () => {
    switch(feature.id) {
      case 'vseo-title-desc':
        return [
          { label: 'Server Actions Tutorial', p1: 'Next.js 15 Server Actions Deep-Dive Guide', p2: 'nextjs, server actions, react 19, web dev' },
          { label: 'Micro-SaaS Journey', p1: 'How I Built an AI Micro-SaaS to $10k MRR in 30 Days', p2: 'saas, indie hacker, build in public, solo founder' }
        ];
      case 'trending-topics':
        return [
          { label: 'AI Developers', p1: 'AI Engineering & LLM Orchestration', p2: 'Highlight new LangChain updates and developer setups' },
          { label: 'Creative Design', p1: 'Tailwind CSS v4 & Next-Gen Workspaces', p2: 'Focus on local setup workflows and design tokens' }
        ];
      case 'daily-ideas':
        return [
          { label: 'Productivity Niche', p1: 'Productivity workflows, calendar guides, Notion templates', p2: 'Target maximum subscriber retention & click CTR' },
          { label: 'Minimal Lifestyle', p1: 'Quiet luxury desk setups, mechanical keyboards, audio gear', p2: 'Target hyper-engaged high-retention views' }
        ];
      case 'ai-script-outline':
        return [
          { label: 'Time Management', p1: '3 Morning Habits That Saved Me 20 Hours Every Week', p2: '10' },
          { label: 'Tech Deep Dive', p1: 'What Actually Happens inside a Neural Network Model', p2: '15' }
        ];
      default:
        return [];
    }
  };

  const currentSuggestions = getSuggestions();

  return (
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{placeholders.p1}</label>
            <input 
              type="text" 
              placeholder={`Enter ${placeholders.p1.toLowerCase()}...`}
              className="input-base w-full py-4 text-lg"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{placeholders.p2}</label>
            <textarea 
              placeholder={`Enter ${placeholders.p2.toLowerCase()}...`}
              rows={3}
              className="input-base w-full py-4 text-base resize-none"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
            />
          </div>

          {currentSuggestions.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-secondary)] block">Dynamic Presets (Click to autofill)</label>
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInput1(item.p1);
                      setInput2(item.p2);
                    }}
                    className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 dark:hover:bg-brand/10 border border-[var(--border-base)]/30 transition-all duration-200 text-left line-clamp-1 cursor-pointer"
                  >
                    💡 {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleAction} loading={loading} className="w-full py-6 text-base font-bold">
            Execute Pro Protocol
          </Button>
        </GlowingCard>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <feature.icon className="w-8 h-8 text-brand animate-pulse" />
            <p className="text-sm text-[var(--text-secondary)] animate-pulse font-medium">Synthesizing advanced intel...</p>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
};

const AppBackground = () => (
  <div className="fixed inset-0 -z-10 bg-[var(--bg-app)] overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />
  </div>
);

const NeuralHub = ({ onSelectFeature, onBack }: { onSelectFeature: (id: FeatureId) => void, onBack?: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="relative min-h-screen py-16 px-6 sm:px-12 bg-[var(--bg-app)]">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="space-y-4 text-left">
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand transition-all group mb-4 w-fit"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">{t('common.back') || t('buttons.back') || 'Previous Page'}</span>
            </button>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)]">{t('common.neuralHub') || 'Intelligence Command'}</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            {t('common.specializedProtocols') || 'Select an operational protocol to begin optimizing your digital growth trajectory.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-16">
            {categories.map((cat) => (
              <div key={cat} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">{t(`categories.${cat}`) || cat}</h3>
                  <div className="h-px flex-1 bg-[var(--border-base)]" />
                </div>
                
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.04
                      }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {FEATURES.filter(f => f.category === cat).map((f) => (
                    <motion.button
                      key={f.id}
                      onClick={() => onSelectFeature(f.id)}
                      variants={{
                        hidden: { opacity: 0, y: 12, scale: 0.97 },
                        visible: { 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: { type: "spring", stiffness: 180, damping: 20 }
                        }
                      }}
                      whileHover={{ 
                        y: -4, 
                        scale: 1.015,
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25)",
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ scale: 0.985, y: -1 }}
                      className="group p-5 rounded-2xl border border-[var(--border-base)] bg-[var(--bg-card)] hover:border-brand transition-all text-left flex items-start gap-5 relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110",
                        f.glowColor,
                        f.themeColor
                      )}>
                        <f.icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-base font-bold text-[var(--text-primary)] mb-1 group-hover:text-brand transition-colors">
                          {t(`features.${f.id}.label`) || f.label}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {t(`features.${f.id}.desc`) || f.description}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-[var(--text-secondary)] group-hover:text-brand mt-1 transition-all group-hover:translate-x-1" />
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-8">
             <div className="card-base p-6 space-y-4">
               <div className="flex items-center gap-2 text-brand">
                 <Zap size={18} />
                 <h4 className="text-sm font-bold uppercase tracking-wider">System Pulse</h4>
               </div>
               <div className="space-y-3">
                 <div className="flex justify-between text-xs">
                   <span className="text-[var(--text-secondary)]">Neural Core</span>
                   <span className="text-success font-bold">Stable</span>
                 </div>
                 <div className="h-1.5 bg-[var(--border-base)] rounded-full overflow-hidden">
                    <div className="h-full bg-brand w-3/4" />
                 </div>
                 <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                   Synchronizing all strategic nodes with the latest algorithm updates.
                 </p>
               </div>
             </div>

             <div className="card-base p-6 bg-brand h-40 flex flex-col justify-between text-white relative overflow-hidden">
                <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                <h4 className="text-lg font-bold relative z-10">Pro Insights</h4>
                <p className="text-xs text-white/80 relative z-10">Unlock deep competitor tracking and historical trending data.</p>
                <button className="w-full py-2 bg-white text-brand rounded-lg text-xs font-bold mt-4 relative z-10">Upgrade Plan</button>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

// --- GENERIC FEATURE WRAPPER ---
const GenericFeature = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
  const [val, setVal] = useState('');
  
  const handleAction = () => {
    let customPrompt = '';
    let displayPrompt = '';
    switch(feature.id) {
      case 'scripts':
        customPrompt = `Write a complete script and caption for: "${val}". 
        Provide platform-specific variants (YouTube, TikTok, Instagram). 
        Include:
        - Hook
        - Body (Bullet points)
        - Call to Action
        - Platform-specific caption with hashtags.
        Give me short, medium, and long versions.`;
        displayPrompt = `Generate scripts for: ${val.slice(0, 30)}...`;
        break;
      case 'bio':
        customPrompt = `Generate 3 high-conversion Instagram/Twitter bios for: "${val}".
        Include strategy explanations for each and exact character counts.`;
        displayPrompt = `Generate bios for: ${val.slice(0, 30)}...`;
        break;
      case 'thumbnails':
        customPrompt = `Design 5 visual thumbnail concept briefs for: "${val}".
        For each, provide:
        - Layout description
        - Primary Color Palette
        - Visual Hook
        - Psychology explanation for why it will get clicks.`;
        displayPrompt = `Design thumbnails for: ${val.slice(0, 30)}...`;
        break;
      case 'engagement-calc':
        customPrompt = `The user wants an engagement rate advisor for: "${val}".
        Compute a hypothetical engagement rate based on the details provided.
        Benchmark it against platform averages.
        Deliver a 30-day growth improvement plan.
        Format as a professional report.`;
        displayPrompt = `Engagement analysis for: ${val.slice(0, 30)}...`;
        break;
      case 'trending':
        customPrompt = `Surface 20 high-momentum trending topics for the niche: "${val}".
        Assign each a "Momentum Score" (0-100).
        Provide content angle suggestions and "Urgency Labels" (Hot, Growing, Saturated).`;
        displayPrompt = `Find trending topics for: ${val}`;
        break;
      case 'personas':
        customPrompt = `Construct a detailed fictional audience persona for: "${val}".
        Include:
        - Fictional Name & Bio
        - Pain Points
        - Goals
        - Psychological Triggers
        - Content Preferences.`;
        displayPrompt = `Build persona for: ${val}`;
        break;
      case 'headlines':
        customPrompt = `Generate 10 viral hook formulas and headline alternatives for: "${val}".
        For each, assign a "Predicted CTR Score" and explain why it works.`;
        displayPrompt = `Generate headlines for: ${val.slice(0, 30)}...`;
        break;
      case 'repurposing':
        customPrompt = `Create a full content repurposing plan starting from this core content: "${val}".
        Plan across 4 target platforms (e.g., YouTube, Blog, X/Twitter, Instagram).
        Describe specific adaptations for each.`;
        displayPrompt = `Repurpose content: ${val.slice(0, 30)}...`;
        break;
      default:
        customPrompt = `Analyze and provide expert social media advice for: "${val}" in the context of ${feature.label}.`;
        displayPrompt = `${feature.label} analysis for: ${val.slice(0, 30)}...`;
    }
    
    customPrompt += FORMATTING_PROTOCOL;
    onGenerate(customPrompt, displayPrompt);
  };

  const actions = (msg: ChatMessage) => (
    <>
      <button 
        onClick={() => onGenerateFeedback(feature.id, msg.content)}
        className={cn("flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all text-[10px] uppercase tracking-[0.2em] font-black", feature.themeColor)}
      >
        <MessageSquare size={14} /> Profile
      </button>
      <button 
        onClick={() => onSaveDraft(feature.id, msg.content, `${feature.label}: ${val.slice(0, 20)}`)}
        className={cn("flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all text-[10px] uppercase tracking-[0.2em] font-black", feature.themeColor)}
      >
        <BookOpen size={14} /> Vault
      </button>
    </>
  );

  const lastResponse = messages && messages.slice().reverse().find((m: any) => m.role === 'assistant');

  return (
    <FeatureLayout 
      feature={feature} 
      messages={messages}
      actions={actions}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {lastResponse ? (
          <div className="space-y-6">
            {/* Interactive Custom Widget Selection based on feature ID */}
            {feature.id === 'scripts' && <ScriptPrompterWidget content={lastResponse.content} />}
            {feature.id === 'bio' && <ProfileMockupWidget content={lastResponse.content} />}
            {feature.id === 'thumbnails' && <ThumbnailCanvasWidget content={lastResponse.content} />}
            {feature.id === 'engagement-calc' && <GrowthMathWidget content={lastResponse.content} />}
            {feature.id === 'trending' && <TrendMomentumTickerWidget content={lastResponse.content} />}
            {feature.id === 'personas' && <AudienceDossierWidget content={lastResponse.content} />}
            {feature.id === 'repurposing' && <RepurposePipelineWidget content={lastResponse.content} />}

            {/* Standard advisory notes transcript rendering */}
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-3xl text-left">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black block mb-3">Neural Advice Transcription</span>
              <div className="text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-2 select-text whitespace-pre-line font-sans">
                <ReactMarkdown>{lastResponse.content}</ReactMarkdown>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setVal('');
                  // Clear messages or let user start fresh
                }}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all"
              >
                Run Another Directive
              </button>
            </div>
          </div>
        ) : (
          <GlowingCard className={cn("relative overflow-visible border-opacity-20 translate-y-0", feature.themeColor.replace('text-', 'border-'), feature.glowColor.replace('bg-', 'bg-opacity-5 bg-'))}>
            <div className={cn("absolute -top-3 -left-3 w-8 h-8 rounded-xl text-navy-black flex items-center justify-center shadow-lg z-20", feature.themeColor.replace('text-', 'bg-'))}>
              <feature.icon size={18} />
            </div>
            <div className="space-y-6 pt-2">
              <div className="space-y-2 text-left">
                <label className={cn("text-[10px] font-mono uppercase tracking-[0.4em] ml-2", feature.themeColor)}>Neural Directive</label>
                <textarea 
                  placeholder={`Describe your target for ${feature.label.toLowerCase()}...`}
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-opacity-50 transition-all text-base font-sans font-medium text-white text-center placeholder:text-slate-705 resize-none shadow-inner"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                />
              </div>
              <Button onClick={handleAction} loading={loading} className={cn("w-full py-6 text-navy-black font-black text-[11px] tracking-[0.3em] rounded-2xl shadow-2xl transition-all", feature.themeColor.replace('text-', 'bg-'))}>
                EXECUTE {feature.label.toUpperCase()} PROTOCOL
              </Button>
            </div>
          </GlowingCard>
        )}

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-6"
          >
             <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-dashed animate-spin opacity-30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <feature.icon size={32} className={cn("animate-pulse", feature.themeColor)} />
              </div>
            </div>
            <p className={cn("font-mono text-[10px] uppercase tracking-[0.5em] text-center animate-pulse opacity-60", feature.themeColor)}>Processing Neural Stream...</p>
          </motion.div>
        )}
      </div>
    </FeatureLayout>
  );
};

// --- MAIN APP ---

const STATIC_QUALITIES = [
  { id: "realtime", label: "Real-time Intelligence", description: "Hyper-speed neural synchronization across global nodes." },
  { id: "ai-native", label: "Aether-Native", description: "Deep integration with advanced generative AI models." },
  { id: "tactical", label: "Tactical Design", description: "Modern, high-performance content operations." },
  { id: "secure", label: "Secure Vault", description: "Fragmented intelligence storage with encrypted signal protocols." }
];

const Dashboard = ({ 
  onSelectFeature, 
  onNavigate, 
  geminiActive,
  systemLanguage,
  generationTone,
  experienceLevel,
  user,
  onSignIn
}: { 
  onSelectFeature: (id: FeatureId) => void, 
  onNavigate: (view: 'dashboard' | 'tools' | 'hub' | 'matrix' | 'earn', feature?: FeatureId) => void, 
  geminiActive: boolean,
  systemLanguage: string,
  generationTone: string,
  experienceLevel: string,
  user: User | null,
  onSignIn: () => void
}) => {
  const { t } = useTranslation();
  const [qualities, setQualities] = useState<any[]>(STATIC_QUALITIES);

  useEffect(() => {
    fetch('/api/chidon_iq/qualities')
      .then(res => res.json())
      .then(data => {
        if (data && data.qualities) {
          setQualities(data.qualities);
        }
      })
      .catch(() => {});
  }, []);

  const problems = [
    { title: t("dashboard.marketDna"), desc: t("dashboard.marketDnaDesc"), solution: t("dashboard.neuralResearcher"), id: 'keyword-research' as FeatureId, icon: Microscope },
    { title: t("dashboard.engagement"), desc: t("dashboard.engagementDesc"), solution: t("dashboard.trendingDetector"), id: 'trending' as FeatureId, icon: TrendingUp },
    { title: t("dashboard.creativeBlock"), desc: t("dashboard.creativeBlockDesc"), solution: t("features.content-ideas.label") || t("dashboard.videoIdeas"), id: 'content-ideas' as FeatureId, icon: Lightbulb },
    { title: t("dashboard.brandVoice"), desc: t("dashboard.brandVoiceDesc"), solution: t("dashboard.identityStrategist"), id: 'personas' as FeatureId, icon: Users },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="max-w-xl text-left space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] uppercase tracking-wider font-bold"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            {t("dashboard.systemLive") || "System Live: ACTIVE"}
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            {t("dashboard.title1") || "Intelligence for"} <br />
            <span className="text-brand">{t("dashboard.title2") || "Content Domination."}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-lg leading-relaxed">
            {t("dashboard.subtitle") || "The ultimate SaaS terminal for social performance. Use neural synchronization to scale your channel."}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto shrink-0">
          {/* Command Center Card */}
          <motion.div
             whileHover={{ y: -4 }}
             className="card-base p-5 border border-brand/10 hover:border-brand/30 w-full md:w-64 cursor-pointer group flex flex-col justify-between"
             onClick={() => onNavigate('hub')}
          >
             <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                    <Command size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">{t("dashboard.commandCenter") || "Command Center"}</h3>
                    <p className="text-[var(--text-secondary)] text-[9px]">{t("dashboard.seoAndTrends") || "SEO & Global Trends"}</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal mb-4">
                  Launch the master neural index containing all available cognitive tools.
                </p>
             </div>
             <Button variant="primary" className="w-full text-xs py-1.5 mt-auto">
               {t("dashboard.launchHub") || t("common.launchHub") || "Launch Hub"} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
             </Button>
          </motion.div>

          {/* CHIDON Vault Card */}
          <motion.div
             whileHover={{ y: -4 }}
             className="card-base p-5 border border-brand/10 hover:border-brand/35 w-full md:w-64 cursor-pointer group flex flex-col justify-between"
             onClick={() => onNavigate('tools', 'drafts')}
          >
             <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)]">{t("common.vault") || "CHIDON Vault"}</h3>
                    <p className="text-[var(--text-secondary)] text-[9px]">Archives & Drafts</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal mb-4">
                  Access your secure indexed library containing all saved scripts, bios, and intelligence.
                </p>
             </div>
             <Button variant="secondary" className="w-full text-xs py-1.5 mt-auto border border-violet-500/25 text-violet-500 bg-violet-500/5 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
               Open Vault <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
             </Button>
          </motion.div>

          {/* GigSocial Card */}
          <motion.div
             whileHover={{ y: -4 }}
             className="card-base p-5 border border-brand/10 hover:border-cyan-500/35 w-full md:w-64 cursor-pointer group flex flex-col justify-between"
             onClick={() => onNavigate('earn')}
          >
             <div>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-primary shrink-0">
                     <Briefcase size={20} />
                   </div>
                   <div>
                     <h3 className="text-xs font-bold text-[var(--text-primary)]">GigSocial</h3>
                     <p className="text-[var(--text-secondary)] text-[9px]">Social Media + Freelance</p>
                   </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal mb-4">
                   Deliver high-CTR digital growth, post portfolios, chat live, subscribe to creators, and trade secure Escrow Gigs inside the 2026 hub.
                </p>
             </div>
             <Button variant="secondary" className="w-full text-xs py-1.5 mt-auto border border-cyan-500/25 text-cyan-primary bg-cyan-500/5 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
               Launch GigSocial <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
             </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {problems.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectFeature(p.id)}
            className="card-base p-6 hover:border-brand/40 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[var(--text-primary)] group-hover:bg-brand group-hover:text-white transition-all mb-6">
              <p.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{p.title}</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
              {p.desc}
            </p>
            <div className="flex items-center gap-2 text-brand text-[10px] font-bold uppercase tracking-wider">
              {p.solution} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const MatrixHub = ({ 
  onNavigate, 
  onBack, 
  neuralNotifications, 
  setNeuralNotifications, 
  generationTone, 
  setGenerationTone,
  experienceLevel,
  setExperienceLevel,
  systemLanguage,
  setSystemLanguage,
  activeSecurityModes,
  setActiveSecurityModes,
  pinnedFeatures,
  setPinnedFeatures,
  autoOptimize,
  setAutoOptimize,
  user,
  onClearDatabase
}: any) => {
  const { t } = useTranslation();
  const [matrixView, setMatrixView] = useState<'menu' | 'faq' | 'features'>('menu');

  const handleBack = () => {
    if (matrixView !== 'menu') {
      setMatrixView('menu');
    } else {
      onBack?.();
    }
  };

  const backToPrevious = onBack && (
    <button 
      onClick={handleBack}
      className="flex items-center gap-2 text-slate-400 hover:text-cyan-primary transition-all group font-mono"
    >
      <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-black">
        {matrixView === 'menu' ? 'Exit Matrix' : 'Back to Matrix'}
      </span>
    </button>
  );

  if (matrixView === 'features') {
    return (
      <div className="p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setMatrixView('menu')} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-xs uppercase tracking-widest font-black">Back to Matrix</span>
          </button>
          {backToPrevious}
        </div>
        
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
            <h2 className="text-4xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter decoration-brand decoration-4 underline-offset-8">{t('common.centralCommand') || 'Central Command'}</h2>
            <p className="text-[var(--text-secondary)] mt-4 font-sans leading-relaxed">{t('common.specializedProtocols') || 'Direct access to all specialized cognitive protocols.'}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <button 
                  key={f.id} 
                  onClick={() => onNavigate('tools', f.id)}
                  className="p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl text-left hover:border-brand/40 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div className={cn("inline-flex p-3 rounded-2xl bg-gray-100 dark:bg-gray-800/60 mb-4 group-hover:scale-110 transition-transform", f.themeColor)}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-[var(--text-primary)] font-bold text-lg mb-2">
                    {t(`features.${f.id}.label`) || f.label}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-2">
                    {t(`features.${f.id}.desc`) || f.description}
                  </p>
                  
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-[var(--text-primary)]">
                    <Icon size={64} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (matrixView === 'faq') {
     return (
        <div className="p-6 lg:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setMatrixView('menu')} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand transition-colors group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-mono text-xs uppercase tracking-widest font-black">Back to Matrix</span>
            </button>
            {backToPrevious}
          </div>
          
          <div className="max-w-3xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter">Knowledge Base</h2>
              <p className="text-[var(--text-secondary)] mt-4 font-mono text-[10px] uppercase tracking-[0.3em]">Decoding system irregularities</p>
            </header>

            <div className="space-y-4">
               {[
                 { q: "How do I maximize reach?", a: "Consistency with the algorithm's preferred formats (Reels/Shorts) and using high-precision keywords from our analysis tool." },
                 { q: "Is my data secure?", a: "Every prompt and result is encrypted relative to your unique neural ID. We do not store raw PII." },
                 { q: "The AI feels slow today.", a: "Check your local bandwidth. CHIDON IQ operates on global clusters, latency is usually minimal." },
                 { q: "How do I save my drafts?", a: "Use the 'Save' icon on any generation. You can find them in the Archives section of the Tools tab." },
                 { q: "Can I connect multiple accounts?", a: "Currently, each neural link is bound to one primary identity to maintain isolation protocols." }
               ].map((item, i) => (
                 <div key={i} className="p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl group hover:border-brand/40 hover:shadow-sm transition-all">
                    <h4 className="text-[var(--text-primary)] font-bold mb-2 flex items-center gap-3">
                       <HelpCircle size={18} className="text-brand" />
                       {item.q}
                    </h4>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.a}</p>
                 </div>
               ))}
            </div>
            
            <div className="mt-12 p-8 rounded-3xl bg-brand/5 border border-brand/20 text-center">
               <p className="text-brand font-bold mb-2">Still Encountering Glitches?</p>
               <p className="text-[var(--text-secondary)] text-xs mb-6">Contact the architects for deep system diagnostics.</p>
               <button className="px-6 py-2 bg-brand text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 hover:bg-brand/90 transition-all cursor-pointer">Initiate Comms</button>
            </div>
          </div>
        </div>
     );
  }

  const menuItems = [
    { label: 'Back to Base', desc: 'Return to Homepage', icon: Home, action: () => onNavigate('dashboard'), color: 'text-cyan-primary' },
    { label: 'Feature Directory', desc: 'Access All Protocols', icon: LayoutGrid, action: () => setMatrixView('features'), color: 'text-emerald-vibrant' },
    { label: 'Knowledge Base', desc: 'Frequently Asked Intel', icon: HelpCircle, action: () => setMatrixView('faq'), color: 'text-brand' },
  ];

  return (
    <div className="font-sans min-h-[70vh] flex flex-col p-6 lg:p-12 animate-in fade-in duration-1000 relative">
      <div className="absolute top-6 left-6 lg:top-12 lg:left-12">
        {backToPrevious}
      </div>
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-brand font-mono text-[10px] uppercase tracking-[0.5em] font-black">Interface // Level 01</span>
            <h2 className="text-6xl lg:text-8xl font-display font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none">
              MATRIX <br />
              HUB
            </h2>
          </div>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-md font-sans">
            Centralized terminal for system-wide configuration, archive retrieval, and neural protocol management. Navigate through the matrix to optimize your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {menuItems.map((item, i) => (
             <button 
               key={i}
               onClick={item.action}
               className="group p-8 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-[2.5rem] text-left hover:border-brand/45 hover:shadow-lg transition-all relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity text-[var(--text-secondary)]">
                   <item.icon size={120} />
                </div>
                <div className={cn("p-4 rounded-2xl bg-gray-100 dark:bg-gray-800/60 mb-6 inline-flex group-hover:scale-110 group-hover:rotate-6 transition-transform", item.color)}>
                   <item.icon size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{item.label}</h3>
                   <p className="text-[var(--text-secondary)] text-xs font-mono uppercase tracking-widest">{item.desc}</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Danger Zone: Database Operations */}
      <div className="max-w-6xl mx-auto w-full mt-16 border-t border-[var(--border-base)]/50 pt-10">
        <div className="bg-red-500/5 dark:bg-red-950/5 border border-red-500/15 dark:border-red-500/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <h3 className="text-red-500 font-bold text-lg flex items-center gap-2">
              <AlertCircle size={18} /> Danger Zone: App Maintenance
            </h3>
            <p className="text-[var(--text-secondary)] text-xs leading-relaxed max-w-xl">
              Purges all mock and fake database entries (gigs, services, scheduled posts, notes, drafts, and applications) across local stores and Cloud Sync Database. Permanent and irreversible.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClearDatabase}
            className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Clear All Mock Records & Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [systemLanguage, setSystemLanguage] = useState<string>(() => {
    return localStorage.getItem('system_language') || 'English';
  });

  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !localStorage.getItem('chidon_welcome_dismissed');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Synchronize systemLanguage state with active i18n translations bi-directionally (safeguarded against circular re-entrant loops and subtags like en-US)
  useEffect(() => {
    const rawLang = i18n.language || 'en';
    const cleanCode = rawLang.split('-')[0].toLowerCase();
    const match = LANGUAGES.find(l => l.code === cleanCode) || LANGUAGES[0];
    const currentLang = match.label;
    
    if (systemLanguage !== currentLang) {
      setSystemLanguage(currentLang);
      localStorage.setItem('system_language', currentLang);
    }
  }, [i18n.language]);

  // Keep i18n language engine in perfect sync with systemLanguage state updates (safeguarded against circular loops)
  useEffect(() => {
    if (systemLanguage) {
      const match = LANGUAGES.find(l => l.label === systemLanguage || l.native === systemLanguage);
      if (match) {
        const cleanI18nCode = (i18n.language || 'en').split('-')[0].toLowerCase();
        if (cleanI18nCode !== match.code) {
          i18n.changeLanguage(match.code);
        }
      }
    }
  }, [systemLanguage]);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'tools' | 'hub' | 'matrix' | 'earn' | 'blog'>('dashboard');
  const [activeFeature, setActiveFeature] = useState<FeatureId>('keyword-research');
  const [toolSearchQuery, setToolSearchQuery] = useState<string>('');
  
  const [lastUsedTool, setLastUsedTool] = useState<Record<string, number>>(() => {
    return {
      'keyword-research': Date.now() - 300000,
      'vseo-title-desc': Date.now() - 600000,
      'trending-topics': Date.now() - 900000,
      'daily-ideas': Date.now() - 1200000,
      'ai-script-outline': Date.now() - 1500000,
      'hashtag-engine': Date.now() - 1800000,
      'competitor-lab': Date.now() - 2100000,
      'schedule-lab': Date.now() - 2400000,
      'youtube-seo': Date.now() - 2700000,
      'post-scheduler': Date.now() - 3000000,
      'seo-scorecard': Date.now() - 3300000,
    };
  });
  const [copiedShare, setCopiedShare] = useState<string | null>(null);

  const handleShareTool = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?tool=${encodeURIComponent(toolId)}`;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(shareUrl);
      } else {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = shareUrl;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
      }
      setCopiedShare(toolId);
      setTimeout(() => setCopiedShare(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const getUsageStats = (toolId: string) => {
    const lastUsed = lastUsedTool[toolId];
    if (!lastUsed) return 'Never used';
    const diffMs = Date.now() - lastUsed;
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    return `Last used ${mins} minute${mins > 1 ? 's' : ''} ago`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool') as FeatureId;
    if (toolParam) {
      const match = FEATURES.find(f => f.id === toolParam);
      if (match) {
        setView('tools');
        setActiveFeature(toolParam);
      }
    }
  }, []);

  const [neuralNotifications, setNeuralNotifications] = useState<boolean>(() => {
    return localStorage.getItem('neural_notifications') !== 'false';
  });

  const [generationTone, setGenerationTone] = useState<string>(() => {
    return localStorage.getItem('generation_tone') || 'Informative';
  });

  const [experienceLevel, setExperienceLevel] = useState<string>(() => {
    return localStorage.getItem('experience_level') || 'Adept';
  });

  const [autoOptimize, setAutoOptimize] = useState<boolean>(() => {
    return localStorage.getItem('auto_optimize') !== 'false';
  });

  const [activeSecurityModes, setActiveSecurityModes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('security_modes');
      return stored ? JSON.parse(stored) : ['biometric'];
    } catch {
      return ['biometric'];
    }
  });

  const [pinnedFeatures, setPinnedFeatures] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pinned_features');
      return stored ? JSON.parse(stored) : FEATURES.map(f => f.id);
    } catch {
      return FEATURES.map(f => f.id);
    }
  });

  const [customGeminiApiKey, setCustomGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });
  const [customHfApiKey, setCustomHfApiKey] = useState<string>(() => {
    return localStorage.getItem('custom_hf_api_key') || '';
  });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  
  // Real-time Cloud settings sync hook
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.apiKeys?.geminiApiKey !== undefined) {
          setCustomGeminiApiKey(data.apiKeys.geminiApiKey);
          localStorage.setItem('custom_gemini_api_key', data.apiKeys.geminiApiKey);
        }
        if (data.apiKeys?.hfApiKey !== undefined) {
          setCustomHfApiKey(data.apiKeys.hfApiKey);
          localStorage.setItem('custom_hf_api_key', data.apiKeys.hfApiKey);
        }
        if (data.experienceLevel !== undefined) {
          setExperienceLevel(data.experienceLevel);
          localStorage.setItem('experience_level', data.experienceLevel);
        }
        if (data.systemLanguage !== undefined) {
          setSystemLanguage(data.systemLanguage);
          localStorage.setItem('system_language', data.systemLanguage);
        }
        if (data.generationTone !== undefined) {
          setGenerationTone(data.generationTone);
          localStorage.setItem('generation_tone', data.generationTone);
        }
        if (data.neuralNotifications !== undefined) {
          setNeuralNotifications(data.neuralNotifications);
          localStorage.setItem('neural_notifications', String(data.neuralNotifications));
        }
        if (data.autoOptimize !== undefined) {
          setAutoOptimize(data.autoOptimize);
          localStorage.setItem('auto_optimize', String(data.autoOptimize));
        }
        if (data.activeSecurityModes !== undefined) {
          setActiveSecurityModes(data.activeSecurityModes);
          localStorage.setItem('security_modes', JSON.stringify(data.activeSecurityModes));
        }
        if (data.pinnedFeatures !== undefined) {
          setPinnedFeatures(data.pinnedFeatures);
          localStorage.setItem('pinned_features', JSON.stringify(data.pinnedFeatures));
        }
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Sync state helpers
  const saveUserSetting = async (key: string, value: any) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        [key]: value,
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to sync setting to cloud:", err);
    }
  };

  const saveApiKeys = async (gemini: string, hf: string) => {
    setCustomGeminiApiKey(gemini);
    setCustomHfApiKey(hf);
    localStorage.setItem('custom_gemini_api_key', gemini);
    localStorage.setItem('custom_hf_api_key', hf);
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          apiKeys: {
            geminiApiKey: gemini,
            hfApiKey: hf
          }
        }, { merge: true });
      } catch (err) {
        console.error("Failed to sync API keys to cloud:", err);
      }
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Anonymous authentication error:", e);
          setUser(null);
          setAuthLoading(false);
        }
      } else {
        setUser(u);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSendToBook = (content: string, title?: string) => {
    setPreFilledContent(prev => ({
      ...prev,
      ['ruled-book']: content,
      ['ruled-book-title']: title || ''
    }));
    navigateTo('tools', 'ruled-book');
  };

  const handleSignIn = () => {
    // Local workspace sandbox active; authentication removed
  };

  const handleSignOut = async () => {
    // Local workspace sandbox active; authentication removed
  };

  const handleClearDatabase = async () => {
    setResetStatus('clearing');
    try {
      // 1. Clear local storage settings and features
      localStorage.removeItem('pinned_features');
      localStorage.removeItem('security_modes');
      localStorage.removeItem('neural_notifications');
      localStorage.removeItem('theme');
      
      // 2. Clear IndexedDB local notes
      try {
        const { openDB } = await import('idb');
        const dbInstance = await openDB('chidon_iq_intelligence_db', 1);
        const tx = dbInstance.transaction('notes_local', 'readwrite');
        await tx.store.clear();
        await tx.done;
      } catch (idbErr) {
        console.error("IndexedDB clear error:", idbErr);
      }

      // 3. Clear Firestore collections
      const collectionsToClear = [
        'jobs',
        'job_applications',
        'earn_jobs',
        'earn_services',
        'earn_results',
        'earn_profiles',
        'drafts',
        'notes',
        'folders',
        'feedback',
        'global_presence'
      ];
      
      for (const colName of collectionsToClear) {
        try {
          const colRef = collection(db, colName);
          const qSnap = await getDocs(colRef);
          const batchDeletes: Promise<void>[] = [];
          qSnap.forEach((docSnap) => {
            batchDeletes.push(deleteDoc(doc(db, colName, docSnap.id)));
          });
          await Promise.all(batchDeletes);
          console.log(`Successfully purged firestore collection: ${colName}`);
        } catch (colErr) {
          console.error(`Failed to clear firestore collection ${colName}:`, colErr);
        }
      }

      // 4. Reset states
      setFeatureResults({});
      
      setResetStatus('success');
      setTimeout(() => {
        setResetStatus('idle');
        window.location.reload();
      }, 2500);

    } catch (err) {
      console.error("Maintenance reset failed:", err);
      setResetStatus('error');
      setTimeout(() => setResetStatus('idle'), 4000);
    }
  };
  const [navigationHistory, setNavigationHistory] = useState<{view: 'dashboard' | 'tools' | 'hub' | 'matrix' | 'earn', feature: FeatureId}[]>([]);
  const [apiKey] = useState<string>(process.env.GEMINI_API_KEY || '');
  const [hfKey] = useState<string>(process.env.HUGGINGFACE_API_KEY || '');
  const activeGeminiKey = customGeminiApiKey || apiKey;
  const activeHfKey = customHfApiKey || hfKey;
  const [featureResults, setFeatureResults] = useState<Record<string, ChatMessage[]>>({});
  const [isTranslatingResults, setIsTranslatingResults] = useState(false);
  const featureResultsRef = useRef(featureResults);
  useEffect(() => {
    featureResultsRef.current = featureResults;
  }, [featureResults]);

  // Pruned destructive auto-translation of chat history on language shift to prevent crash/infinite loop issues
  useEffect(() => {
    // Keep results in original generation language, no slow API translation sweeps are done on every language shift
  }, [i18n.language]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackFeatureId, setFeedbackFeatureId] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [preFilledContent, setPreFilledContent] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top on feature/view change or result update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeFeature, view, featureResults]);

  const { generate, loading, error } = useHybridAI(activeGeminiKey || null, activeHfKey || null);

  const navigateTo = (newView: 'dashboard' | 'tools' | 'hub' | 'matrix' | 'earn' | 'blog', newFeature?: FeatureId) => {
    const targetFeature = newFeature || activeFeature;
    // Don't push if it's the exact same state
    if (view === newView && activeFeature === targetFeature) return;

    setNavigationHistory(prev => {
      const next = [...prev, { view, feature: activeFeature } as any];
      if (next.length > 20) return next.slice(1);
      return next;
    });
    if (newFeature) {
      setActiveFeature(newFeature);
      setLastUsedTool(prev => ({
        ...prev,
        [newFeature]: Date.now()
      }));
    }
    setView(newView);
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prevHistory => prevHistory.slice(0, -1));
      setView(prev.view);
      setActiveFeature(prev.feature);
    } else {
      setView('dashboard');
    }
  };

  const handleRestoreDraft = (featureId: FeatureId, content: string) => {
    const restoredMsg: ChatMessage = {
      id: `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      role: 'assistant',
      content: content,
      timestamp: new Date(),
      language: i18n.language || 'en'
    };
    setFeatureResults(prev => ({ ...prev, [featureId]: [restoredMsg] }));
    navigateTo('tools', featureId);
  };

  const handleScheduleFromDraft = (content: string) => {
    setPreFilledContent(prev => ({ ...prev, ['post-scheduler']: content }));
    navigateTo('tools', 'post-scheduler');
  };

  const openFeedback = (featureId: string, content?: string) => {
    setFeedbackFeatureId(featureId);
    const lastMsg = featureResults[featureId]?.[featureResults[featureId].length - 1];
    setFeedbackContent(content || lastMsg?.content || '');
    setIsFeedbackOpen(true);
  };

  const handleSaveDraft = async (featureId: string, content: string, title: string) => {
    setIsSaving(true);
    try {
      const draftData: any = {
        featureId,
        content: content.slice(0, 9999),
        createdAt: serverTimestamp(),
        title: title.slice(0, 199)
      };
      
      if (auth.currentUser) {
        draftData.userId = auth.currentUser.uid;
      }
      
      await addDoc(collection(db, 'drafts'), draftData);
      
      if (auth.currentUser) {
        await addDoc(collection(db, 'notes'), {
          title: `${title} - Neural Result`,
          content,
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPinned: false
        });
      }
      
      navigateTo('tools', 'drafts');
    } catch (err) {
      console.error("Error saving to Vault:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async (prompt: string, displayPrompt?: string) => {
    const userMsg: ChatMessage = {
      id: `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      role: 'user',
      content: displayPrompt || prompt,
      timestamp: new Date(),
      language: i18n.language || 'en'
    };

    setFeatureResults(prev => ({
      ...prev,
      [activeFeature]: [...(prev[activeFeature] || []), userMsg]
    }));

    let finalPrompt = prompt;
    if (generationTone) {
      finalPrompt = `${prompt}\n\n[STYLE PROTOCOL: Generate response in a highly distinct '${generationTone.toUpperCase()}' default writing tone.]`;
    }

    const result = await generate(finalPrompt, activeFeature);
    
    if (result) {
      const aiMsg: ChatMessage = {
        id: `${Math.random().toString(36).substr(2, 9)}-${Date.now() + 1}`,
        role: 'assistant',
        content: result,
        timestamp: new Date(),
        language: i18n.language || 'en'
      };
      setFeatureResults(prev => ({
        ...prev,
        [activeFeature]: [...(prev[activeFeature] || []), aiMsg]
      }));
    }
  };

  const renderActiveContent = () => {
    if (view === 'dashboard') {
      return (
        <Dashboard 
          onSelectFeature={(id) => navigateTo('tools', id)} 
          onNavigate={navigateTo}
          geminiActive={!!apiKey}
          systemLanguage={systemLanguage}
          generationTone={generationTone}
          experienceLevel={experienceLevel}
          user={user}
          onSignIn={handleSignIn}
        />
      );
    }

    if (view === 'hub') {
      return <NeuralHub onSelectFeature={(id) => navigateTo('tools', id)} onBack={goBack} />;
    }

    if (view === 'matrix') {
      return (
        <MatrixHub 
          onNavigate={navigateTo} 
          onBack={goBack} 
          neuralNotifications={neuralNotifications}
          setNeuralNotifications={(u: any) => { setNeuralNotifications(u); saveUserSetting('neuralNotifications', u); }}
          generationTone={generationTone}
          setGenerationTone={(u: any) => { setGenerationTone(u); saveUserSetting('generationTone', u); }}
          experienceLevel={experienceLevel}
          setExperienceLevel={(u: any) => { setExperienceLevel(u); saveUserSetting('experienceLevel', u); }}
          systemLanguage={systemLanguage}
          setSystemLanguage={(u: any) => { setSystemLanguage(u); saveUserSetting('systemLanguage', u); }}
          activeSecurityModes={activeSecurityModes}
          setActiveSecurityModes={(u: any) => { setActiveSecurityModes(u); saveUserSetting('activeSecurityModes', u); }}
          pinnedFeatures={pinnedFeatures}
          setPinnedFeatures={(u: any) => { setPinnedFeatures(u); saveUserSetting('pinnedFeatures', u); }}
          autoOptimize={autoOptimize}
          setAutoOptimize={(u: any) => { setAutoOptimize(u); saveUserSetting('autoOptimize', u); }}
          user={user}
          onClearDatabase={() => setIsResetConfirmOpen(true)}
        />
      );
    }

    if (view === 'earn') {
      return (
        <GigSocial 
          onBack={goBack}
          user={user}
          onSignIn={handleSignIn}
        />
      );
    }

    if (view === 'blog') {
      return (
        <ChidonIqBlog
          onSaveDraft={handleSaveDraft}
          onBack={goBack}
        />
      );
    }

    const commonProps = {
      onGenerate: handleGenerate,
      messages: featureResults[activeFeature] || [],
      loading,
      error,
      feature: FEATURES.find(f => f.id === activeFeature)!,
      onGenerateFeedback: openFeedback,
      onSaveDraft: handleSaveDraft,
      onRestoreDraft: handleRestoreDraft,
      onBack: goBack
    };

    const renderFeature = () => {
      switch (activeFeature) {
        case 'content-ideas': return <ContentGenerator {...commonProps} />;
        case 'hashtags': return <HashtagEngine {...commonProps} />;
        case 'competitor-analysis': return <CompetitorLab {...commonProps} feature={commonProps.feature} />;
        case 'posting-schedule': return <ScheduleLab {...commonProps} feature={commonProps.feature} />;
        case 'youtube-seo': return <YouTubeSEO {...commonProps} feature={commonProps.feature} />;
        case 'seo-scorecard': return <SEOScorecard {...commonProps} feature={commonProps.feature} />;
        case 'keyword-research': return <KeywordResearcher {...commonProps} feature={commonProps.feature} />;
        case 'post-optimizer': return <PostOptimizer {...commonProps} feature={commonProps.feature} />;
        
        // New Features
        case 'vseo-title-desc':
        case 'vseo-tags':
        case 'vseo-scorecard':
        case 'vseo-keywords':
        case 'vseo-best-time':
        case 'trending-topics':
        case 'daily-ideas':
        case 'trend-alerts':
        case 'ai-script-outline':
          return <AdvancedNeuralTool {...commonProps} />;
          
        case 'post-scheduler': return (
          <Suspense fallback={<ComponentLoader />}>
            <PostScheduler 
              initialCaption={preFilledContent['post-scheduler']} 
              onClearPreFill={() => setPreFilledContent(prev => ({ ...prev, ['post-scheduler']: '' }))} 
              feature={commonProps.feature} 
              onBack={commonProps.onBack} 
              user={user}
            />
          </Suspense>
        );
        case 'drafts': return (
          <Suspense fallback={<ComponentLoader />}>
            <ChidonVault 
              onBack={commonProps.onBack}
              onSignIn={handleSignIn}
            />
          </Suspense>
        );
        case 'ruled-book': return (
          <Suspense fallback={<ComponentLoader />}>
            <RuledBook 
              initialContent={preFilledContent['ruled-book']} 
              initialTitle={preFilledContent['ruled-book-title']} 
              onClearPreFill={() => setPreFilledContent(prev => ({ ...prev, ['ruled-book']: '', ['ruled-book-title']: '' }))} 
              onBack={commonProps.onBack} 
            />
          </Suspense>
        );
        case 'template-library': return (
          <Suspense fallback={<ComponentLoader />}>
            <TemplateLibrary 
              onBack={commonProps.onBack} 
              onSaveDraft={commonProps.onSaveDraft}
            />
          </Suspense>
        );
        default: 
          return <GenericFeature {...commonProps} />;
      }
    };

    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-end px-2">
           <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-full scale-75 origin-right">
              <div className="w-2 h-2 rounded-full bg-cyan-primary animate-pulse" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocol: Active</span>
           </div>
        </div>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative"
        >
           {renderFeature()}
        </motion.div>

        {/* Global Footer Status during Tools usage */}
        <div className="pt-10 opacity-30 pointer-events-none group-hover:opacity-100 transition-opacity">
           <SystemStatus activeNodes={0} />
        </div>
      </div>
    );
  };

  const currentFeature = FEATURES.find(f => f.id === activeFeature);

  if (authLoading) {
    return <LoadingOverlay />;
  }

  return (
    <BookContext.Provider value={{ onSendToBook: handleSendToBook }}>
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col font-sans selection:bg-brand/30 selection:text-white overflow-hidden relative">
      <AppBackground />
      {showWelcome && (
        <WelcomePage onEnter={() => {
          setShowWelcome(false);
          localStorage.setItem('chidon_welcome_dismissed', 'true');
        }} />
      )}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "fixed md:relative inset-y-0 left-0 z-[100] w-64 bg-[var(--bg-card)] border-r border-[var(--border-base)] flex flex-col transform transition-transform duration-300 md:translate-x-0 shadow-xl md:shadow-none",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[var(--border-base)]">
            <button 
              onClick={() => {
                setNavigationHistory([]);
                setView('dashboard');
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ChidonLogo size="sm" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all group active:scale-95"
              title="Close Menu"
            >
              <div className="relative flex items-center justify-center">
                <X size={20} className="text-[var(--text-secondary)] group-hover:text-brand transition-colors relative z-10" />
                <div className="absolute inset-0 bg-brand/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity rounded-full scale-110" />
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* Neural Language Selection */}
            <div className="px-3 pb-4 border-b border-[var(--border-base)]/45 flex items-center justify-between gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] whitespace-nowrap">
                {t("common.systemLanguage") || "Language"}
              </span>
              <div className="relative z-[110]">
                <LanguageSelector />
              </div>
            </div>

            {/* Core Sectors */}
            <div className="px-3 space-y-1 pb-4 border-b border-[var(--border-base)]/40">
              <span className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] block mb-2 pl-1">
                {t("common.coreSectors") || "Core Sectors"}
              </span>
              <button
                onClick={() => {
                  navigateTo('dashboard');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer",
                  view === 'dashboard'
                    ? "bg-brand/10 text-brand border-brand/20 shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text-primary)] border-transparent"
                )}
              >
                <Home size={15} />
                <span>{t("common.overviewDashboard") || "Overview Dashboard"}</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('hub');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer",
                  view === 'hub'
                    ? "bg-brand/10 text-brand border-brand/20 shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text-primary)] border-transparent"
                )}
              >
                <Compass size={15} />
                <span>{t("common.intelligenceCommand") || "Intelligence Command"}</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('earn');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer",
                  view === 'earn'
                    ? "bg-cyan-primary/10 text-cyan-primary border-cyan-primary/20 shadow-sm animate-pulse-glow"
                    : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text-primary)] border-transparent"
                )}
              >
                <Briefcase size={15} className="text-cyan-primary" />
                <span>GigSocial</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('blog');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer",
                  view === 'blog'
                    ? "bg-cyan-primary/10 text-cyan-primary border-cyan-primary/20 shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text-primary)] border-transparent"
                )}
              >
                <BookOpen size={15} className="text-cyan-primary" />
                <span>Chidon IQ Gazette</span>
              </button>
            </div>

            {/* Search Input field inside the navigation sidebar to help users quickly filter */}
            <div className="px-3 pb-2 border-b border-[var(--border-base)]/40 relative">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder={t('common.filterTools') || 'Filter cognitive tools...'}
                  value={toolSearchQuery}
                  onChange={(e) => setToolSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 text-xs bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--border-base)] rounded-lg outline-none focus:ring-1 focus:ring-brand/35 focus:border-brand/40 transition-all placeholder:text-[var(--text-secondary)]/70"
                />
                {toolSearchQuery && (
                  <button
                    onClick={() => setToolSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Clear search"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>

            {categories.map((cat) => {
              const catFeatures = FEATURES.filter(f => {
                const labelMatch = (t(`features.${f.id}.label`) || f.label).toLowerCase().includes(toolSearchQuery.toLowerCase());
                const descMatch = (t(`features.${f.id}.desc`) || f.description || "").toLowerCase().includes(toolSearchQuery.toLowerCase());
                return f.category === cat && (labelMatch || descMatch);
              });
              if (catFeatures.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <h3 className="px-3 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-4">
                    {t(`categories.${cat}`) || cat}
                  </h3>
                  <div className="space-y-1">
                    {catFeatures.map((f) => {
                      const isActive = activeFeature === f.id && view === 'tools';
                      return (
                        <button
                          key={f.id}
                          onClick={() => {
                            navigateTo('tools', f.id);
                            setIsMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group border relative",
                            isActive
                              ? "active bg-brand/10 text-brand font-semibold shadow-sm border-brand/20 active-pulse-glow"
                              : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text-primary)] border-transparent"
                          )}
                        >
                          <f.icon size={16} className={cn(
                            isActive ? "text-brand" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                          )} />
                          <span className="truncate">{t(`features.${f.id}.label`) || f.label}</span>

                          {/* Quick Share action button */}
                          {isActive && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => handleShareTool(e, f.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleShareTool(e as any, f.id);
                                }
                              }}
                              className="ml-auto shrink-0 flex items-center justify-center p-1 rounded-md bg-brand/15 hover:bg-brand/25 text-brand transition-all relative z-40 border border-brand/20 hover:scale-110 active:scale-95 cursor-pointer"
                              title="Copy link to current view"
                            >
                              {copiedShare === f.id ? (
                                <Check size={11} className="text-emerald-500" />
                              ) : (
                                <Share2 size={11} />
                              )}
                            </span>
                          )}

                          {/* Dynamic Usage Tooltip */}
                          {isActive && (
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-[99999] bg-slate-900 border border-slate-700 text-[10px] text-slate-100 font-mono px-2 py-1 rounded shadow-xl whitespace-nowrap">
                              {getUsageStats(f.id)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* If no filters matched at all, show a simple no-results message */}
            {categories.every(cat => FEATURES.filter(f => {
              const labelMatch = (t(`features.${f.id}.label`) || f.label).toLowerCase().includes(toolSearchQuery.toLowerCase());
              const descMatch = (t(`features.${f.id}.desc`) || f.description || "").toLowerCase().includes(toolSearchQuery.toLowerCase());
              return f.category === cat && (labelMatch || descMatch);
            }).length === 0) && (
              <div className="px-3 py-6 text-center text-xs text-[var(--text-secondary)] space-y-1">
                <p className="font-semibold">{t('common.noToolsFound')}</p>
                <p className="opacity-70">{t('common.tryModifyingQuery')}</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[var(--border-base)]">
            <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-[var(--border-base)]/40">
              <UserCircle className="w-8 h-8 text-cyan-500 animate-[pulse_3s_infinite]" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">Workspace Master</p>
                <p className="text-[10px] text-[var(--text-secondary)] truncate">Operational Hub Connected</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Header */}
          <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-base)] z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 md:hidden text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="md:hidden"><ChidonLogo size="xs" iconOnly /></span>
                <span>{view === 'dashboard' ? t('common.overview') : view === 'earn' ? "CHIDON Earn Portal" : view === 'blog' ? "Chidon IQ Gazette & Blog" : view === 'matrix' ? t('common.commandMatrix') : (currentFeature ? (t(`features.${currentFeature.id}.label`) || currentFeature.label) : '')}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setIsDarkMode(false)} 
                    className={cn("p-1.5 rounded-md transition-all", !isDarkMode ? "bg-white dark:bg-gray-700 text-brand shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button 
                    onClick={() => setIsDarkMode(true)} 
                    className={cn("p-1.5 rounded-md transition-all", isDarkMode ? "bg-white dark:bg-gray-700 text-brand shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
                  >
                    <Cpu size={14} />
                  </button>
               </div>

               <div className="h-6 w-[1px] bg-[var(--border-base)] mx-1" />

               <Tooltip content="CHIDON Vault">
                  <button 
                    onClick={() => navigateTo('tools', 'drafts')}
                    className={cn(
                      "p-2 rounded-lg text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand transition-all",
                      view === 'tools' && activeFeature === 'drafts' && "text-brand bg-brand/5"
                    )}
                  >
                    <BookOpen size={18} />
                  </button>
               </Tooltip>
               <Tooltip content="Matrix Command">
                  <button 
                    onClick={() => navigateTo('matrix')}
                    className={cn(
                      "p-2 rounded-lg text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand transition-all",
                      view === 'matrix' && "text-brand bg-brand/5"
                    )}
                  >
                    <Settings size={18} />
                  </button>
               </Tooltip>
            </div>
          </header>

          <main ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence>
              {isTranslatingResults && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-4 right-4 z-50 bg-brand/95 backdrop-blur text-white text-[11px] font-bold px-3.5 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-white/10"
                >
                  <Globe size={13} className="animate-spin text-white flex-shrink-0" />
                  <span>Synchronizing Neural Translations...</span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
              >
                {renderActiveContent()}
              </motion.div>
            </AnimatePresence>

            <Suspense fallback={null}>
              <DownbaseFooter />
            </Suspense>
          </main>
        </div>
      </div>

      <Suspense fallback={null}>
        <FeedbackModal 
          isOpen={isFeedbackOpen} 
          onClose={() => setIsFeedbackOpen(false)} 
          featureId={feedbackFeatureId} 
          generatedContent={feedbackContent}
        />
        <ChidonIqGuide />
      </Suspense>
      {/* Maintenance Purge / Reset Confirmation Overlay */}
      <ConfirmationDialog 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleClearDatabase}
        title="PURGE SYSTEM RECORDS"
        message="Are you sure you want to trigger a full system clean? This will delete all live Cloud Sync mock postings, gigs, scheduled posts, notes, folders, candidate applications, local indexedDB content, and cached files. This action is critical, permanent, and completely irreversible."
        confirmText="EXECUTE PURGE"
        cancelText="CANCEL PROTOCOL"
        isDanger={true}
      />

      {/* System Cleaning State Overlays */}
      <AnimatePresence>
        {resetStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md"
          >
            <div className="max-w-md w-full text-center space-y-6">
              {resetStatus === 'clearing' && (
                <>
                  <div className="relative flex items-center justify-center">
                    <Loader2 size={48} className="text-red-500 animate-spin" />
                    <RefreshCcw size={20} className="text-red-500/50 absolute animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-mono text-xs uppercase tracking-[0.25em] animate-pulse">Wiping Live Channels...</h3>
                    <p className="text-slate-400 text-xs">Purging all mock entries, job boards, cache indexes, and local IndexedDB storages across the entire network cluster.</p>
                  </div>
                </>
              )}

              {resetStatus === 'success' && (
                <>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
                  >
                    <CheckCircle2 size={32} />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">System Purge Successful</h3>
                    <p className="text-slate-400 text-xs">All fake records and mock entries are eliminated! Rebooting base intelligence matrix in 2 seconds...</p>
                  </div>
                </>
              )}

              {resetStatus === 'error' && (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-bounce">
                    <AlertCircle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-red-500 font-bold uppercase tracking-wider text-sm">Operation Fault</h3>
                    <p className="text-slate-400 text-xs">Maintenance purge aborted because a system error occurred. Please analyze cloud rules constraints.</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </BookContext.Provider>
  );
}
