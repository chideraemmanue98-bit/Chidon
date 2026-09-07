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
  AlertTriangle,
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
  ShoppingBag,
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
  ShieldCheck,
  Youtube,
  Instagram,
  Copy,
  Check,
  Coins,
  Briefcase,
  Database,
  Crown,
  CreditCard,
  Lock,
  Sun,
  Moon,
  Upload
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
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { exportToJSON, exportToCSV, exportToTXT } from './lib/exportUtils';
import { getRobotsMetaForView } from './lib/robotsGenerator';
import { extractSEOFromAIContent, ExtractedSEO } from './lib/seoGenerator';
import { Tooltip } from './components/Tooltip';
import { ChidonLogo } from './components/ChidonLogo';
import { WelcomePage } from './components/WelcomePage';
import { SecureSplashCover } from './components/SecureSplashCover';
import { getSupabaseClient } from './lib/supabase';
import { getStorageKey } from './lib/userStorage';
const getSupabaseAuthClient = getSupabaseClient;

// PERF: Lazy load heavy overlays and non-critical modular sub-components to reduce initial load times and optimize bundle sizing
const FeedbackModal = lazy(() => import('./components/FeedbackModal').then(m => ({ default: m.FeedbackModal })));
const PostScheduler = lazy(() => import('./components/PostScheduler').then(m => ({ default: m.PostScheduler })));
const ChidonVault = lazy(() => import('./components/ChidonVault').then(m => ({ default: m.ChidonVault })));
const ChidonIqGuide = lazy(() => import('./components/ChidonIqGuide').then(m => ({ default: m.ChidonIqGuide })));
const RuledBook = lazy(() => import('./components/RuledBook').then(m => ({ default: m.RuledBook })));
const DownbaseFooter = lazy(() => import('./components/DownbaseFooter').then(m => ({ default: m.DownbaseFooter })));
const TemplateLibrary = lazy(() => import('./components/TemplateLibrary').then(m => ({ default: m.TemplateLibrary })));

import { ShadowbanSolutions } from './components/ShadowbanSolutions';
import AdvancedNeuralTool from './components/AdvancedNeuralTool';
import ChidonPricing from './components/ChidonPricing';
import ChidonCreditDashboard from './components/ChidonCreditDashboard';
import { useChatHistory } from './hooks/useChatHistory';
import HistorySidebar from './components/HistorySidebar';
import { LightDesignAnalytics } from './components/LightDesignAnalytics';

import { 
  ScriptPrompterWidget, 
  ProfilePreviewWidget, 
  ThumbnailCanvasWidget, 
  GrowthMathWidget, 
  TrendMomentumTickerWidget, 
  AudienceDossierWidget, 
  RepurposePipelineWidget,
  ChidonIQCrawlerWidget,
  TrendHeatmapWidget
} from './components/SpecializedWidgets';

import { BookContext } from './context/BookContext';
import { cn } from './lib/utils';
import { clearAllNotesLocal, saveNoteLocal } from './lib/idb';
import { useOfflineSync } from './hooks/useOfflineSync';
import LanguageSelector, { LANGUAGES } from './components/LanguageSelector';
import { ChidonFreelanceEarn } from './components/ChidonFreelanceEarn';
import { ChidonIqBlog } from './components/ChidonIqBlog';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { DailyContentGoal } from './components/DailyContentGoal';
import SupabaseAuthPage from './components/SupabaseAuthPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { useAccess } from './hooks/useAccess';
import { PaywallGate } from './components/PaywallGate';
import { NotificationBell } from './components/NotificationBell';
import { NotificationsPage } from './components/NotificationsPage';
import { ToastNotification } from './components/ToastNotification';
import { useNotifications, triggerNotification } from './hooks/useNotifications';
import { useFcm } from './hooks/useFcm';

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
  getDocs,
  getDoc,
  increment,
  Timestamp,
  where,
  runTransaction
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut,
  User 
} from 'firebase/auth';
import { db, auth, app } from './firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
  const errMsg = error instanceof Error ? error.message : String(error);
  const isBenignIdleDisconnect = errMsg.includes('CANCELLED') || errMsg.includes('Disconnecting idle stream') || errMsg.includes('idle stream');

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
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
  if (isBenignIdleDisconnect) {
    console.debug('Firestore Idle Stream Disconnected (self-healing):', JSON.stringify(errInfo));
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  }
};

// --- TYPES ---

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
  originalPrompt?: string;
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
  | 'ai-script-outline'
  | 'shadowban-solutions';

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

export const cleanFeatureText = (text: string | undefined | null): string => {
  if (!text) return '';
  return text.replace(/^features\./i, '').replace(/^Feature\./i, '').replace(/Feature\./gi, '');
};

export const getFeatureLabel = (f: { id: string; label: string }, t: any): string => {
  const key = `features.${f.id}.label`;
  const resolved = t(key);
  const label = (resolved && resolved !== key) ? resolved : f.label;
  return cleanFeatureText(label);
};

export const getFeatureDesc = (f: { id: string; description: string }, t: any): string => {
  const key = `features.${f.id}.desc`;
  const resolved = t(key);
  const desc = (resolved && resolved !== key) ? resolved : f.description;
  return cleanFeatureText(desc);
};

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
    label: 'NOTEPAD SAVE', 
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
    icon: Zap, 
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
    label: 'Organic Video Feed Strategizer', 
    icon: Trophy, 
    description: 'Viral metadata optimization and ranking strategy.', 
    category: 'Core',
    themeColor: 'text-red-500',
    glowColor: 'bg-red-500/20',
    persona: 'Organic Quality Architect AI'
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
  { 
    id: 'shadowban-solutions', 
    label: 'Shadowban Solutions', 
    icon: AlertCircle, 
    description: 'Audit channel health, check sensitive policy risk indicators and trace 30-day view recovery action steps.', 
    category: 'Core',
    themeColor: 'text-red-500',
    glowColor: 'bg-red-500/20',
    persona: 'YouTube Policy Expert AI'
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

const useHybridAI = (geminiKey: string | null, hfKey: string | null, geminiModel?: string, userId?: string | null) => {
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
        body: JSON.stringify({ 
          prompt, 
          language: i18n.language, 
          model: geminiModel, 
          feature: featureLabel,
          userId: userId || (window as any).__chidon_active_user_id || null,
          creditsDeductedByClient: true
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const geminiText = data.text;
      if (!geminiText) throw new Error("No response from Gemini.");

      setLoading(false);
      return geminiText;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
      setLoading(false);
      return null;
    }
  };

  return { generate, loading, error, setLoading };
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

function ShareButton({ text, title }: { text: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-insight.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Chidon IQ - ${title}`,
          text: text.substring(0, 500) + '...',
        });
        setIsOpen(false);
      } catch (err) {
        console.warn("Native share failed:", err);
      }
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary h-8 py-0 px-3 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-200 cursor-pointer text-[var(--text-secondary)] hover:text-brand"
      >
        <Share2 size={12} />
        <span>Share</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-1.5 w-48 rounded-xl bg-[var(--bg-card)] border border-[var(--border-base)] shadow-lg overflow-hidden z-55 p-1 space-y-0.5"
          >
            <button
              onClick={handleCopy}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer text-[var(--text-primary)]"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-[var(--text-secondary)]" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Full Insight'}</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer text-[var(--text-primary)]"
            >
              <Download size={12} className="text-[var(--text-secondary)]" />
              <span>Download Markdown</span>
            </button>
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer text-[var(--text-primary)]"
              >
                <Share2 size={12} className="text-[var(--text-secondary)]" />
                <span>Share Externally</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const GeminiLiveEngineHub = () => {
  const [stage, setStage] = useState(0);
  const activeModel = localStorage.getItem('active_gemini_model') || 'gemini-3.8-flash';
  const modelLabel = activeModel.includes('pro') ? "3.1-PRO" : activeModel.includes('3.8') ? "3.8-FLASH" : "3.7-FLASH";

  const stages = [
    `Establishing dynamic connection with ChidonIQ Core ${modelLabel} Deep Pipeline...`,
    "Retrieving neural search markers & digital audience vectors...",
    "Running real-time structural code compliance check...",
    "Optimizing vocabulary formulas for high-retention performance...",
    "Parsing output text blocks into aligned workspace layouts..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="w-full flex flex-col space-y-4 p-6 border border-slate-200/80 dark:border-indigo-500/10 rounded-2xl bg-slate-50/50 dark:bg-[#07080F]/90 shadow-2xl text-left theme-transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping" />
            <span className="absolute inset-1.5 rounded-full bg-purple-500/20" />
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#22D3EE] via-[#6366F1] to-[#A78BFA] flex items-center justify-center text-white text-[9px] font-black">
              ✦
            </div>
          </div>
          <div>
            <span className="text-[9px] font-mono font-black text-[#6366F1] tracking-widest block uppercase">NEURAL PIPELINE ACTIVE</span>
            <span className="text-[11px] font-serif font-bold text-slate-800 dark:text-zinc-200 block">
              ChidonIQ Core is distilling high-fidelity intelligence...
            </span>
          </div>
        </div>
        
        {/* Real-time sound wave thinking simulator */}
        <div className="flex items-end gap-1.5 h-6">
          <span className="w-1 h-3 rounded-full bg-[#22D3EE] animate-bounce animate-duration-1000" style={{ animationDelay: '0.1s' }} />
          <span className="w-1 h-5 rounded-full bg-[#6366F1] animate-bounce animate-duration-800" style={{ animationDelay: '0.2s' }} />
          <span className="w-1 h-4 rounded-full bg-[#A78BFA] animate-bounce animate-duration-1200" style={{ animationDelay: '0.35s' }} />
          <span className="w-1 h-6 rounded-full bg-[#EC4899] animate-bounce animate-duration-900" style={{ animationDelay: '0.15s' }} />
          <span className="w-1 h-3.5 rounded-full bg-[#F59E0B] animate-bounce animate-duration-1300" style={{ animationDelay: '0.25s' }} />
        </div>
      </div>

      {/* Modern thin timeline loader */}
      <div className="w-full bg-slate-200 dark:bg-zinc-800/50 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-[#22D3EE] via-[#6366F1] to-[#EC4899] h-full rounded-full"
          style={{
            width: "85%",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{stages[stage]}</span>
        </span>
        <span className="text-[9px] uppercase font-black text-slate-400 select-none">{modelLabel}</span>
      </div>
    </div>
  );
};

const FeatureLayout = ({ 
  feature, 
  children, 
  messages, 
  actions, 
  onBack,
  onGenerate,
  loading
}: { 
  feature: Feature, 
  children: React.ReactNode, 
  messages?: ChatMessage[], 
  actions?: (msg: ChatMessage) => React.ReactNode, 
  onBack?: () => void,
  onGenerate?: (prompt: string, displayPrompt?: string) => void,
  loading?: boolean
}) => {
  const { t } = useTranslation();
  const { onSendToBook } = useContext(BookContext);

  const [userId, setUserId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const sb = getSupabaseClient();
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event: string, session: any) => {
      const u = session?.user || null;
      if (u) {
        setUserId(u.id);
      } else {
        setUserId(null);
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setSavedIds([]);
      return;
    }

    const favsRef = collection(db, 'users', userId, 'favorites');
    const unsubscribe = onSnapshot(favsRef, (snapshot) => {
      const ids: string[] = [];
      snapshot.forEach((doc) => {
        ids.push(doc.id);
      });
      setSavedIds(ids);
    }, (error) => {
      console.error("Failed to load favorites in FeatureLayout:", error);
    });
    return () => unsubscribe();
  }, [userId]);

  const toggleFavorite = async (msg: ChatMessage) => {
    if (!userId) {
      toast.error("Please log in to save favorites.");
      return;
    }
    
    const savedSandbox = localStorage.getItem("chidon_sandbox_session");
    const isSaved = savedIds.includes(msg.id);

    if (savedSandbox) {
      const localFavsKey = getStorageKey('guest_favorites');
      const localFavs = localStorage.getItem(localFavsKey) || '[]';
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(localFavs);
      } catch {
        parsed = [];
      }

      if (isSaved) {
        parsed = parsed.filter((f: any) => f.id !== msg.id);
        localStorage.setItem(localFavsKey, JSON.stringify(parsed));
        setSavedIds(prev => prev.filter(id => id !== msg.id));
        toast.success("Removed from favorites");
      } else {
        parsed.unshift({
          id: msg.id,
          featureId: feature.id,
          title: getFeatureLabel(feature, t),
          content: msg.content,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(localFavsKey, JSON.stringify(parsed));
        setSavedIds(prev => [...prev, msg.id]);
        toast.success("Saved to favorites");
      }
      return;
    }
    
    const path = `users/${userId}/favorites/${msg.id}`;
    
    try {
      if (isSaved) {
        await deleteDoc(doc(db, 'users', userId, 'favorites', msg.id));
        toast.success("Removed from favorites");
      } else {
        await setDoc(doc(db, 'users', userId, 'favorites', msg.id), {
          id: msg.id,
          featureId: feature.id,
          title: getFeatureLabel(feature, t),
          content: msg.content,
          createdAt: serverTimestamp()
        });
        toast.success("Saved to favorites");
      }
    } catch (err) {
      handleFirestoreError(err, isSaved ? OperationType.DELETE : OperationType.WRITE, path);
    }
  };

  const downloadAsPDF = (msg: ChatMessage) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const title = getFeatureLabel(feature, t);
      
      // Set font
      doc.setFont('helvetica', 'normal');
      
      // Title
      doc.setFontSize(18);
      doc.setTextColor(33, 33, 33);
      doc.text(title, 14, 20);
      
      // Divider
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 25, 196, 25);
      
      // Body Content
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      
      const lines = msg.content.split('\n');
      let y = 32;
      const pageHeight = doc.internal.pageSize.height;
      
      lines.forEach(line => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        
        if (line.startsWith('### ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          const text = line.replace('### ', '');
          const wrappedLines = doc.splitTextToSize(text, 182);
          wrappedLines.forEach((wl: string) => {
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.text(wl, 14, y);
            y += 6;
          });
          y += 2;
        } else if (line.startsWith('## ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          const text = line.replace('## ', '');
          const wrappedLines = doc.splitTextToSize(text, 182);
          wrappedLines.forEach((wl: string) => {
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.text(wl, 14, y);
            y += 7;
          });
          y += 2;
        } else if (line.startsWith('# ')) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(15);
          const text = line.replace('# ', '');
          const wrappedLines = doc.splitTextToSize(text, 182);
          wrappedLines.forEach((wl: string) => {
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.text(wl, 14, y);
            y += 8;
          });
          y += 3;
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const wrappedLines = doc.splitTextToSize(line, 182);
          wrappedLines.forEach((wl: string) => {
            if (y > pageHeight - 20) { doc.addPage(); y = 20; }
            doc.text(wl, 14, y);
            y += 5.5;
          });
        }
      });
      
      doc.save(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${msg.id}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Tool Header */}
      <div className="space-y-6">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-brand transition-all group pointer-events-auto cursor-pointer"
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
              {getFeatureLabel(feature, t)}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{getFeatureDesc(feature, t)}</p>
          </div>
        </div>
      </div>

    <div className="space-y-8 pb-32">
        {/* Tool Interface (Inputs) - Rendered at the Top */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          {children}
        </motion.div>

        {/* Chat History & AI Results - Rendered beautifully underneath at the Bottom in Gemini AI style */}
        <span className="block border-t border-slate-200 dark:border-white/5 my-8 h-px" />
        
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {messages && messages.map((msg, idx) => {
              const findPrecedingUserMsg = () => {
                for (let i = idx - 1; i >= 0; i--) {
                  if (messages[i].role === 'user') {
                    return messages[i];
                  }
                }
                return null;
              };
              const userMsg = findPrecedingUserMsg();
              const originalPrompt = userMsg?.originalPrompt || userMsg?.content;
              const isUser = msg.role === 'user';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 110, 
                    damping: 16,
                    delay: Math.min(idx * 0.08, 0.45)
                  }}
                  className="w-full flex flex-col space-y-3 p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/40 dark:bg-[#08080C]/75 text-left shadow-md hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                  id={`chat-board-row-${msg.id}`}
                >
                  {/* AI Studio Developer Code/System Header Interface */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      {isUser ? (
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-300 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-[9px] font-mono leading-none tracking-tight font-black">U</span>
                          <span className="text-[10px] font-mono font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">USER PROMPT WORKSPACE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#22D3EE] via-[#6366F1] to-[#A78BFA] text-white flex items-center justify-center text-[10px] leading-none font-sans font-black">✦</span>
                          <span className="text-[10px] font-mono font-black tracking-widest text-[#6366F1] bg-gradient-to-r from-[#22D3EE] via-[#6366F1] to-[#A78BFA] bg-clip-text text-transparent uppercase">MODEL COMPREHENSIVE OUTPUT</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[8px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-black font-semibold">
                      {isUser ? (
                        <span>PAYLOAD SIZE: {msg.content.length}b</span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span>TEMP: 0.35</span>
                          <span>•</span>
                          <span>FILTER: AUTO_VEIL</span>
                        </span>
                      )}
                      <span>•</span>
                      <span>TIME: {new Date().toUTCString().slice(17, 25)} UTC</span>
                    </div>
                  </div>

                  {/* Body Content Container */}
                  <div className="py-1">
                    {isUser ? (
                      <div className="text-xs text-slate-705 dark:text-zinc-300 bg-slate-100 dark:bg-[#030305]/80 p-4 rounded-xl border border-slate-205 dark:border-white/5 font-mono select-all whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="markdown-body leading-relaxed text-sm text-[var(--text-primary)]">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  {!isUser && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-dashed border-slate-200 dark:border-white/5">
                      {actions && actions(msg)}
                      <CopyButton text={msg.content} />
                      <ShareButton text={msg.content} title={getFeatureLabel(feature, t)} />
                      
                      <button
                        onClick={() => toggleFavorite(msg)}
                        className={cn(
                          "btn-secondary h-8 py-0 px-3 rounded-lg font-mono text-[10px] uppercase font-black tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-200 cursor-pointer border border-slate-200 dark:border-white/5",
                          savedIds.includes(msg.id) ? "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30 dark:border-rose-500/30" : "text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/5"
                        )}
                        title={savedIds.includes(msg.id) ? "Remove from favorites" : "Save to favorites"}
                      >
                        <Heart size={12} fill={savedIds.includes(msg.id) ? "currentColor" : "none"} />
                        <span>{savedIds.includes(msg.id) ? "Saved" : "Save"}</span>
                      </button>

                      <button
                        onClick={() => downloadAsPDF(msg)}
                        className="btn-secondary h-8 py-0 px-3 rounded-lg font-mono text-[10px] uppercase font-black tracking-widest transition-colors flex items-center justify-center gap-1.5 active:scale-95 duration-200 cursor-pointer text-[var(--text-secondary)] hover:text-indigo-400 hover:bg-indigo-500/5 border border-slate-200 dark:border-white/5"
                        title="Download as a formatted PDF"
                      >
                        <Download size={12} />
                        <span>PDF</span>
                      </button>

                      {onGenerate && originalPrompt && (
                        <button
                          onClick={() => onGenerate(originalPrompt, userMsg?.content !== originalPrompt ? userMsg?.content : undefined)}
                          disabled={loading}
                          className="btn-secondary h-8 py-0 px-3 rounded-lg font-mono text-[10px] uppercase font-black tracking-widest transition-colors flex items-center justify-center gap-1.5 active:scale-95 duration-200 cursor-pointer text-[var(--text-secondary)] hover:text-brand disabled:opacity-50 border border-slate-200 dark:border-white/5"
                          title="Regenerate this direction response"
                        >
                          <RefreshCcw size={12} className={cn(loading ? "animate-spin text-brand" : "")} />
                          <span>Retry</span>
                        </button>
                      )}

                      {onSendToBook && (
                        <button 
                          onClick={() => onSendToBook(msg.content, getFeatureLabel(feature, t))}
                          className="btn-primary h-8 py-0 px-3 rounded-lg font-mono text-[10px] uppercase font-black tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95 duration-200 cursor-pointer text-white"
                        >
                          <Book size={12} />
                          <span>Send to NOTEPAD SAVE</span>
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {loading && (
              <motion.div
                key="gemini-live-loading"
                initial={{ opacity: 0, y: 35, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -25, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="w-full pt-4"
              >
                <GeminiLiveEngineHub />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
      onGenerate={onGenerate}
      loading={loading}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        <GlowingCard className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Niche / Topic</label>
            <textarea 
              placeholder="e.g. AI Productivity, Luxury Cars..."
              className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
              rows={2}
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

        {parsedCards.length > 0 ? (
          <div className="space-y-6 pt-6 border-t border-[var(--border-base)]/25">
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
                Clear Topic
              </button>
            </div>

            {/* Carousel display deck */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card List Sidebar for Quick Toggle */}
              <motion.div layout className="space-y-3 md:col-span-1 text-left">
                {parsedCards.map((c, idx) => (
                  <motion.button
                    key={idx}
                    layout
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setCurrentCardIndex(idx)}
                    className={cn(
                      "w-full p-4 text-left rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col space-y-1 select-none relative overflow-hidden",
                      currentCardIndex === idx
                        ? "border-cyan-primary/30 text-white"
                        : "bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900 hover:border-white/10"
                    )}
                  >
                    {currentCardIndex === idx && (
                      <motion.div
                        layoutId="activeBentoCard"
                        className="absolute inset-0 bg-cyan-primary/10 border border-cyan-primary/30 rounded-2xl -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 text-[9px] font-mono font-black text-cyan-primary tracking-widest uppercase">VIRAL TRACK {idx + 1}</span>
                    <span className="relative z-10 text-sm font-bold line-clamp-1">{c.title}</span>
                  </motion.button>
                ))}
              </motion.div>

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
      onGenerate={onGenerate}
      loading={loading}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Core Topic / Niche</label>
            <textarea 
              placeholder="Enter core topic..."
              className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
              rows={2}
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
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-[var(--border-base)] rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                >
                  Reset List
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
            <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTags.map((item) => (
                <motion.div
                  key={item.tag}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
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
            </motion.div>

            {/* Explanatory insights in very brief form */}
            <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/40 text-left space-y-2">
              <span className="text-[8px] font-mono text-purple-vibrant font-black uppercase tracking-widest block">TACTICAL USE</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                Combine exactly <span className="text-purple-300 font-black">2 of Tier 3</span> tags (high traffic authority), <span className="text-purple-300 font-black">4 of Tier 2</span> tags (targeted velocity metrics), and <span className="text-purple-300 font-black">4 of Tier 1</span> tags (highly searchable low competition niches) in your descriptions to trigger the highest early indexing CTR.
              </p>
            </div>

          </motion.div>
        ) : null}

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
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack} onGenerate={onGenerate} loading={loading}>
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
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack} onGenerate={onGenerate} loading={loading}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Environment</label>
            <textarea 
              placeholder="Market niche..."
              className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
              rows={2}
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
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack} onGenerate={onGenerate} loading={loading}>
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
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack} onGenerate={onGenerate} loading={loading}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Niche</label>
              <textarea 
                placeholder="e.g. Gaming, Beauty..."
                className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
                rows={2}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Region Node</label>
              <textarea 
                placeholder="e.g. USA, UK, Global..."
                className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
                rows={2}
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
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack} onGenerate={onGenerate} loading={loading}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Target Keywords</label>
            <textarea 
              placeholder="e.g. AI SEO, Digital Marketing..."
              className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
              rows={2}
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
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack} onGenerate={onGenerate} loading={loading}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Seed Keyword</label>
            <textarea 
              placeholder="e.g. AI Content Marketing..."
              className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
              rows={2}
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

const LegacyAdvancedNeuralTool = ({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack }: any) => {
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
          { label: 'Productivity Niche', p1: 'Productivity workflows, calendar guides, Workspace Productivity Vault templates', p2: 'Target maximum subscriber retention & click CTR' },
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
    <FeatureLayout feature={feature} messages={messages} actions={actions} onBack={onBack} onGenerate={onGenerate} loading={loading}>
      <div className="max-w-2xl mx-auto space-y-8">
        <GlowingCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{placeholders.p1}</label>
            <textarea 
              placeholder={`Enter ${placeholders.p1.toLowerCase()}...`}
              className="input-base w-full py-4 text-lg min-h-[100px] resize-y leading-relaxed font-black"
              rows={2}
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
    <div className="relative py-10 px-6 sm:px-10 bg-[var(--bg-app)] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Control Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border-base)]/60 relative">
          <div className="space-y-2.5 text-left">
            {onBack && (
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand transition-all group mb-2.5 w-fit font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Orbit</span>
              </button>
            )}
            <h1 className="text-3xl font-display font-black tracking-tight text-[var(--text-primary)] uppercase flex items-center gap-3">
              <span>{t('common.neuralHub') || 'Intelligence Command'}</span>
              <span className="text-[10px] bg-brand/10 text-brand px-2.5 py-1 rounded-full font-mono font-bold tracking-widest uppercase">Console v4.1</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm max-w-2xl font-medium leading-relaxed">
              {t('common.specializedProtocols') || 'Access elite strategic and generative engines to optimize your digital workspace and viral trajectory.'}
            </p>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-[var(--border-base)]/80 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">Livelink Synchronized</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Protocols Grid */}
          <div className="lg:col-span-3 space-y-12">
            {categories.map((cat) => (
              <div key={cat} className="space-y-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-[11px] font-mono font-black text-[var(--text-secondary)] uppercase tracking-[0.25em]">
                    {t(`categories.${cat}`) || cat} Protocol
                  </h3>
                  <div className="h-[1px] flex-1 bg-[var(--border-base)]/60" />
                </div>
                
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.03
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
                        hidden: { opacity: 0, y: 10, scale: 0.98 },
                        visible: { 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          transition: { type: "spring", stiffness: 220, damping: 22 }
                        }
                      }}
                      whileHover={{ 
                        y: -3, 
                        scale: 1.01,
                        boxShadow: "0 12px 24px -10px rgba(0,0,0,0.08)",
                        transition: { duration: 0.15 }
                      }}
                      whileTap={{ scale: 0.99 }}
                      className="group p-5 rounded-2xl border border-[var(--border-base)]/80 bg-[var(--bg-card)] hover:border-brand/40 dark:hover:border-brand/50 transition-all text-left flex items-start gap-4.5 relative overflow-hidden cursor-pointer shadow-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105 border border-transparent group-hover:border-brand/10",
                        f.glowColor,
                        f.themeColor
                      )}>
                        <f.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0 pr-2 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1 group-hover:text-brand transition-colors uppercase tracking-tight">
                            {getFeatureLabel(f, t)}
                          </h4>
                          <span className="text-[8px] font-mono text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest">LAUNCH</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {getFeatureDesc(f, t)}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 dark:text-slate-600 group-hover:text-brand mt-1 transition-all group-hover:translate-x-0.5" />
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Right Monitoring Panel */}
          <aside className="space-y-6">
            
            {/* System Pulse Card */}
            <div className="p-6 rounded-3xl border border-[var(--border-base)]/80 bg-[var(--bg-card)] shadow-sm space-y-5 text-left">
              <div className="flex items-center gap-2.5 text-brand pb-3 border-b border-[var(--border-base)]/40">
                <Cpu size={16} />
                <h4 className="text-[11px] font-mono font-black uppercase tracking-wider">COGNITIVE METRICS</h4>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)] font-mono">Neural Core Link</span>
                    <span className="text-emerald-500 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      STABLE
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[94%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)] font-mono">Optimizer Core</span>
                    <span className="text-brand font-bold">ACTIVE</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand w-[88%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/45 border border-[var(--border-base)]/60 rounded-xl">
                    <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">LATENCY</p>
                    <p className="text-sm font-black text-[var(--text-primary)] mt-0.5">14ms</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/45 border border-[var(--border-base)]/60 rounded-xl">
                    <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">SYNC RATE</p>
                    <p className="text-sm font-black text-emerald-500 mt-0.5">100%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Upgrade Display card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-900 text-white relative overflow-hidden shadow-md space-y-4 flex flex-col justify-between h-56 text-left border border-indigo-500/10">
              <Zap className="absolute -right-6 -top-6 w-28 h-28 text-white/10 rotate-12 animate-pulse" />
              <div className="space-y-1.5 relative z-10">
                <div className="bg-white/10 border border-white/25 w-fit px-2.5 py-0.5 rounded-full text-[8px] font-mono tracking-widest uppercase font-bold">PRO COCKPIT</div>
                <h4 className="text-lg font-black tracking-tight uppercase">Strategic Control</h4>
                <p className="text-xs text-indigo-100/80 leading-relaxed font-sans font-medium">
                  Gain hyper-speed API optimization, trend alerts, and advanced competitive scraping arrays.
                </p>
              </div>
              <button 
                onClick={() => onSelectFeature('template-library' as any)}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-indigo-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all relative z-10 cursor-pointer active:scale-98"
              >
                Access Blueprint Vault
              </button>
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
      onGenerate={onGenerate}
      loading={loading}
    >
      <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
        {feature.id === 'trending' && <ChidonIQCrawlerWidget />}
        {feature.id === 'trending' && <TrendHeatmapWidget />}
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
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-opacity-50 transition-all text-base font-sans font-medium text-white text-center placeholder:text-slate-700 resize-none shadow-inner"
                value={val}
                onChange={(e) => setVal(e.target.value)}
              />
            </div>
            <Button onClick={handleAction} loading={loading} className={cn("w-full py-6 text-navy-black font-black text-[11px] tracking-[0.3em] rounded-2xl shadow-2xl transition-all", feature.themeColor.replace('text-', 'bg-'))}>
              EXECUTE {feature.label.toUpperCase()} PROTOCOL
            </Button>
          </div>
        </GlowingCard>

        {lastResponse && (
          <div className="space-y-6">
            {/* Interactive Custom Widget Selection based on feature ID */}
            {feature.id === 'scripts' && <ScriptPrompterWidget content={lastResponse.content} />}
            {feature.id === 'bio' && <ProfilePreviewWidget content={lastResponse.content} />}
            {feature.id === 'thumbnails' && <ThumbnailCanvasWidget content={lastResponse.content} />}
            {feature.id === 'engagement-calc' && <GrowthMathWidget content={lastResponse.content} />}
            {feature.id === 'trending' && <TrendMomentumTickerWidget content={lastResponse.content} />}
            {feature.id === 'personas' && <AudienceDossierWidget content={lastResponse.content} />}
            {feature.id === 'repurposing' && <RepurposePipelineWidget content={lastResponse.content} />}

            {/* Standard advisory notes transcript rendering */}
            <div className="p-8 bg-slate-900/50 border border-white/5 rounded-3xl text-left shadow-lg">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black block mb-4 border-b border-white/5 pb-2">Neural Advice Transcription</span>
              <div className="text-sm text-slate-300 max-h-[600px] overflow-y-auto pr-3 select-text font-sans markdown-body">
                <ReactMarkdown>{lastResponse.content}</ReactMarkdown>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setVal('');
                }}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all"
              >
                Reset Directive
              </button>
            </div>
          </div>
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
  onNavigate: (view: any, feature?: FeatureId) => void, 
  geminiActive: boolean,
  systemLanguage: string,
  generationTone: string,
  experienceLevel: string,
  user: User | null,
  onSignIn: () => void
}) => {
  const { t } = useTranslation();
  const [qualities, setQualities] = useState<any[]>(STATIC_QUALITIES);
  const { notifications, unreadCount, markAsRead } = useNotifications();

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
          <div className="flex flex-wrap items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] uppercase tracking-wider font-bold"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              {t("dashboard.systemLive") || "System Live: ACTIVE"}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => onNavigate('notifications')}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 hover:text-indigo-350 text-[10px] uppercase tracking-wider font-bold font-mono cursor-pointer transition-all active:scale-95 duration-200"
              title="Open Notifications Centre"
            >
              <Bell size={10} className={unreadCount > 0 ? "animate-bounce text-indigo-400" : "text-slate-400"} />
              <span>{unreadCount > 0 ? `${unreadCount} Alerts Pending` : "No Alerts"}</span>
              {unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </motion.button>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
            Social Media Analytics <br />
            <span className="text-brand">+ Professional Marketplace</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-lg leading-relaxed">
            ChidonIQ is the ultimate SaaS platform to analyze Instagram, TikTok, and Twitter analytics AND hire professional social media managers, influencers & creators worldwide.
          </p>


        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto shrink-0">
          {/* Command Center Card */}
          <motion.div
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1, duration: 0.4 }}
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
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2, duration: 0.4 }}
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
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3, duration: 0.4 }}
             whileHover={{ y: -6, scale: 1.02 }}
             className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-950/20 border-2 border-yellow-500/40 hover:border-yellow-400/80 w-full md:w-64 cursor-pointer group flex flex-col justify-between relative overflow-hidden transition-all duration-300"
             style={{
               boxShadow: "0 4px 25px rgba(234, 179, 8, 0.1)"
             }}
             onClick={() => onNavigate('earn')}
          >
             {/* Premium gold tag */}
             <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-950 font-mono text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-xl shadow-md">
               PREMIUM GIGS 👑
             </div>

             <div>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shrink-0 shadow-lg">
                     <Briefcase size={20} strokeWidth={2.5} />
                   </div>
                   <div>
                     <h3 className="text-xs font-black text-amber-500 dark:text-yellow-400 uppercase tracking-wider">Chidon Freelance</h3>
                     <p className="text-slate-400 text-[9px] font-mono font-bold">Secure Sovereign Escrow</p>
                   </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal mb-4">
                   Deliver high-quality work, bid on active job boards, list service gigs, and secure transactions through built-in escrow accounts.
                </p>
             </div>
             <Button className="w-full text-xs py-1.5 mt-auto border border-yellow-400/30 text-slate-950 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 font-extrabold uppercase tracking-wider shadow-md">
               Launch Workspace <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform inline-block ml-1" />
             </Button>
          </motion.div>
        </div>
      </div>

      <DailyContentGoal user={user} />

      <LightDesignAnalytics />

      {/* Global SEO Core Value Propositions Section */}
      <section className="space-y-8 py-8 border-t border-[var(--border-color)] text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-brand font-black uppercase tracking-widest bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
            Worldwide Social Hub & Analyzer Suite
          </span>
          <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
            Our Core Ecosystem Capabilities
          </h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
            ChidonIQ bridges the gap between deep algorithmic social intelligence and secure global professional outsourcing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="card-base p-6 border border-[var(--border-color)] hover:border-brand/40 transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <BarChart3 size={20} />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Track Social Media Analytics
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Unlock actionable intelligence for Instagram, TikTok, Twitter, and YouTube. Measure real-time engagement rate ratios, follow velocity charts, hashtag performance metrics, and automated competitor comparisons.
              </p>
            </div>
            <div className="pt-2">
              <div className="h-28 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/15 flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-black animate-pulse z-10">Live Metrics Terminal</span>
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80" 
                  alt="social media analytics dashboard" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-base p-6 border border-[var(--border-color)] hover:border-brand/40 transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Users size={20} />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Hire Social Media Professionals
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Connect and outsource marketing workloads directly to handpicked professionals. Recruit verified social media managers, SEO specialists, campaign copywriters, and verified creative designers.
              </p>
            </div>
            <div className="pt-2">
              <div className="h-28 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15 flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent)] pointer-events-none" />
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black animate-pulse z-10">Talent Network Active</span>
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80" 
                  alt="hire influencer marketplace" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-base p-6 border border-[var(--border-color)] hover:border-brand/40 transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Briefcase size={20} />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Marketplace for Creators
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                A seamless gig hub built specifically for digital creators, micro-influencers, and brands. Secure creative briefs with integrated, automated escrow contracts, verified milestone payments, and zero-fee setup.
              </p>
            </div>
            <div className="pt-2">
              <div className="h-28 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/15 flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent)] pointer-events-none" />
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-black animate-pulse z-10">Sovereign Escrow Locked</span>
                <img 
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80" 
                  alt="social media marketplace for creators" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
  activeGeminiModel,
  setActiveGeminiModel,
  user,
  onClearDatabase
}: any) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'security'>('profile');
  
  // Profile settings state
  const userId = user?.uid || user?.id || 'guest';
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [contactEmail, setContactEmail] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // 11 new advanced creator settings
  const [semanticAccent, setSemanticAccent] = useState(() => localStorage.getItem(`chidon_sett_semantic_${userId}`) || 'Balanced');
  const [emojiDensity, setEmojiDensity] = useState(() => localStorage.getItem(`chidon_sett_emojis_${userId}`) || 'Standard');
  const [cacheRetention, setCacheRetention] = useState(() => localStorage.getItem(`chidon_sett_retention_${userId}`) || 'Forever');
  const [keywordDensity, setKeywordDensity] = useState(() => localStorage.getItem(`chidon_sett_keywords_${userId}`) || 'Standard');
  const [hookAnchor, setHookAnchor] = useState(() => localStorage.getItem(`chidon_sett_hooks_${userId}`) || 'Double Hook');
  const [labPrecision, setLabPrecision] = useState(() => localStorage.getItem(`chidon_sett_precision_${userId}`) || 'Deep-Audit');
  const [pipelineIntent, setPipelineIntent] = useState(() => localStorage.getItem(`chidon_sett_intent_${userId}`) || 'Viral Feed');
  const [chimeAcoustic, setChimeAcoustic] = useState(() => localStorage.getItem(`chidon_sett_chime_${userId}`) || 'Retro Sine');
  const [workspaceAccent, setWorkspaceAccent] = useState(() => localStorage.getItem(`chidon_sett_accent_${userId}`) || 'Sovereign Blue');
  const [creditGuardThreshold, setCreditGuardThreshold] = useState(() => localStorage.getItem(`chidon_sett_credit_guard_${userId}`) || '3 Credits');
  const [exportProtocol, setExportProtocol] = useState(() => localStorage.getItem(`chidon_sett_export_${userId}`) || 'JSON');

  // Load profile state on mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(`chidon_profile_name_${userId}`) || user?.displayName || user?.email?.split('@')[0] || 'Operator';
      const savedPhoto = localStorage.getItem(`chidon_profile_photo_${userId}`) || null;
      const savedBio = localStorage.getItem(`chidon_profile_bio_${userId}`) || 'Social Media Strategist & Creator';
      const savedPlatform = localStorage.getItem(`chidon_profile_platform_${userId}`) || 'instagram';
      const savedEmail = localStorage.getItem(`chidon_profile_contact_email_${userId}`) || user?.email || '';
      const savedHandle = localStorage.getItem(`chidon_profile_social_handle_${userId}`) || '';

      setDisplayName(savedName);
      setAvatarUrl(savedPhoto);
      setBio(savedBio);
      setPlatform(savedPlatform);
      setContactEmail(savedEmail);
      setSocialHandle(savedHandle);
    } catch (e) {
      console.warn("Failed to load profile state inside Matrix settings:", e);
    }
  }, [userId, user]);

  // Handle local photo gallery upload & FileReader parsing
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        if (base64String) {
          setAvatarUrl(base64String);
          try {
            localStorage.setItem(`chidon_profile_photo_${userId}`, base64String);
            window.dispatchEvent(new CustomEvent('chidon_profile_photo_updated', { 
              detail: { userId, avatarUrl: base64String } 
            }));
            toast.success("Profile photo uploaded from gallery successfully!");
          } catch (err) {
            toast.error("Image file is too large for storage sandbox. Please compression-resize.");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = () => {
    setAvatarUrl(null);
    try {
      localStorage.removeItem(`chidon_profile_photo_${userId}`);
      window.dispatchEvent(new CustomEvent('chidon_profile_photo_updated', { 
        detail: { userId, avatarUrl: null } 
      }));
      toast.success("Profile photo removed.");
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSaveProfile = () => {
    setProfileSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem(`chidon_profile_name_${userId}`, displayName);
        localStorage.setItem(`chidon_profile_bio_${userId}`, bio);
        localStorage.setItem(`chidon_profile_platform_${userId}`, platform);
        localStorage.setItem(`chidon_profile_contact_email_${userId}`, contactEmail);
        localStorage.setItem(`chidon_profile_social_handle_${userId}`, socialHandle);
        
        // Persist 11 advanced creator settings
        localStorage.setItem(`chidon_sett_semantic_${userId}`, semanticAccent);
        localStorage.setItem(`chidon_sett_emojis_${userId}`, emojiDensity);
        localStorage.setItem(`chidon_sett_retention_${userId}`, cacheRetention);
        localStorage.setItem(`chidon_sett_keywords_${userId}`, keywordDensity);
        localStorage.setItem(`chidon_sett_hooks_${userId}`, hookAnchor);
        localStorage.setItem(`chidon_sett_precision_${userId}`, labPrecision);
        localStorage.setItem(`chidon_sett_intent_${userId}`, pipelineIntent);
        localStorage.setItem(`chidon_sett_chime_${userId}`, chimeAcoustic);
        localStorage.setItem(`chidon_sett_accent_${userId}`, workspaceAccent);
        localStorage.setItem(`chidon_sett_credit_guard_${userId}`, creditGuardThreshold);
        localStorage.setItem(`chidon_sett_export_${userId}`, exportProtocol);

        window.dispatchEvent(new CustomEvent('chidon_profile_updated', { 
          detail: { userId, displayName, bio, platform } 
        }));
        
        toast.success("All identity & advanced settings synced with Chidon Core successfully!");
      } catch (err) {
        toast.error("Error saving profile configurations.");
      }
      setProfileSaving(false);
    }, 600);
  };

  const handleBack = () => {
    onBack?.();
  };

  return (
    <div className="font-sans min-h-[80vh] flex flex-col p-6 md:p-10 animate-in fade-in duration-300 relative text-left bg-slate-50 rounded-[2.5rem] border border-zinc-200">
      
      {/* Header section with Exit link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em] block">CHIDON CORE MATRIX</span>
            <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[8px] font-mono rounded uppercase font-black tracking-wider">
              Secure Session Active
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black text-zinc-950 uppercase tracking-tight">
            Settings Console
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
            Configure display parameters, customize your creator bio card, adjust AI semantic settings, and audit system telemetries safely.
          </p>
        </div>

        <div>
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-950 rounded-xl transition-all font-mono shadow-sm cursor-pointer"
          >
            <ChevronLeft size={15} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              Exit Settings
            </span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-zinc-200 mb-8 overflow-x-auto gap-1 scrollbar-none shrink-0 bg-zinc-100/50 p-1 rounded-2xl">
        {[
          { id: 'profile', label: 'Identity Profile', icon: UserCircle },
          { id: 'ai', label: 'Cognitive AI Settings', icon: Cpu },
          { id: 'security', label: 'Strategy Hub & Security', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-[10px] uppercase tracking-wider font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer",
                activeTab === tab.id
                  ? "bg-white text-brand shadow-sm border border-zinc-200/80"
                  : "text-zinc-500 hover:text-zinc-900 bg-transparent"
              )}
            >
              <Icon size={13} className={activeTab === tab.id ? "text-brand animate-pulse" : "text-zinc-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Configurations Body */}
      <div className="flex-1 w-full max-w-5xl mx-auto bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: IDENTITY PROFILE */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile_tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid md:grid-cols-12 gap-8 items-start"
            >
              {/* Profile Image & Handle card */}
              <div className="md:col-span-4 bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] text-center space-y-5">
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest block font-black">CREATOR IDENTITY CARD</span>
                
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full border-2 border-zinc-200 bg-white overflow-hidden mx-auto relative flex items-center justify-center shadow-inner">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile avatar" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserCircle className="w-14 h-14 text-zinc-300" />
                    )}
                  </div>
                  
                  <label className="absolute bottom-0 right-0 p-2 bg-brand text-white rounded-full hover:bg-brand/90 transition-all cursor-pointer shadow-lg shadow-brand/20 border border-white">
                    <Upload size={13} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-zinc-950 text-base font-mono uppercase tracking-tight">{displayName || 'Anonymous'}</h4>
                  <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-none">{socialHandle ? `@${socialHandle.replace('@', '')}` : 'No Handle Synced'}</p>
                </div>

                <div className="h-[1px] bg-zinc-200 w-full" />

                <div className="text-left space-y-2">
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest text-center">Credentials</p>
                  <div className="text-[10px] text-zinc-600 bg-white border border-zinc-200 px-3 py-2 rounded-xl text-center break-all font-mono">
                    {user?.email || 'guest_anonymous_sandbox'}
                  </div>
                </div>

                {avatarUrl && (
                  <button
                    onClick={handleDeletePhoto}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer"
                  >
                    Delete photo
                  </button>
                )}
              </div>

              {/* Profile details form */}
              <div className="md:col-span-8 space-y-6">
                <div className="border-b border-zinc-100 pb-2">
                  <h3 className="text-zinc-950 font-black text-lg font-mono uppercase tracking-tight">Identity Configurations</h3>
                  <p className="text-xs text-zinc-500">Configure your public facing branding properties inside the Chidon IQ universe.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Operator Name"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">Primary Target Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none"
                    >
                      <option value="instagram">Instagram Organic</option>
                      <option value="tiktok">TikTok Video Hub</option>
                      <option value="youtube">YouTube Growth Channels</option>
                      <option value="twitter">X / Twitter Ingress</option>
                      <option value="linkedin">LinkedIn Professional Network</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">Social Channel Handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">@</span>
                      <input
                        type="text"
                        value={socialHandle}
                        onChange={(e) => setSocialHandle(e.target.value)}
                        placeholder="chidon_iq"
                        className="w-full pl-7 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">Professional Inbox Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="hello@chidoniq.com.ng"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">Creator Bio & Mission Statement</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your social niche, content themes, or portfolio skills..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-900 transition-all outline-none leading-relaxed resize-none font-sans"
                  />
                </div>

                <div className="border-t border-zinc-100 pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="px-6 py-3 bg-brand hover:bg-brand/95 text-white font-mono text-[9px] uppercase tracking-widest font-black rounded-xl hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md shadow-brand/10"
                  >
                    {profileSaving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Deploy Profile Sync</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: COGNITIVE AI PREFERENCES */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai_tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-8"
            >
              <div className="border-b border-zinc-100 pb-2">
                <h3 className="text-zinc-950 font-black text-lg font-mono uppercase tracking-tight">AI Preferences</h3>
                <p className="text-xs text-zinc-500">Fine-tune the generative tone, developer levels, and automatic indexing parameters.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Tone settings */}
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">Active Semantic Tone Flavor</label>
                    <select
                      value={generationTone}
                      onChange={(e) => setGenerationTone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-brand rounded-xl text-xs text-zinc-950 transition-all outline-none"
                    >
                      <option value="Professional / Analytical">Professional / Analytical (Formal & Detailed)</option>
                      <option value="Clickbait / Viral Index">Clickbait / Viral Index (High Conversion / Punchy)</option>
                      <option value="Humorous & Relatable">Humorous & Relatable (Funny & Casual)</option>
                      <option value="Edu-Tainment Focus">Edu-Tainment Focus (Informative & Engaging)</option>
                      <option value="Ultra Minimalist / Socratic">Ultra Minimalist / Socratic (Clean & Academic)</option>
                    </select>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-1">
                      This model profile controls the vocabulary level, structural phrasing, and emoji-density generated by Chidon IQ modules.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase block tracking-wider font-bold">Creator Competency Level</label>
                    <div className="flex gap-2">
                      {['Novice', 'Strategist', 'Architect'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setExperienceLevel(level)}
                          className={cn(
                            "flex-1 py-2.5 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer border",
                            experienceLevel === level
                              ? "bg-brand border-brand text-white shadow-sm font-bold"
                              : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-300"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-1">
                      Configures the detail complexity of the script layouts, competitor reports, and workflow briefs.
                    </p>
                  </div>
                </div>

                {/* Optimizations & switches */}
                <div className="space-y-5 bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex flex-col justify-between">
                  <div className="space-y-5">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">Automated Optimizers</p>
                    
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Real-time SEO Overrides</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">Automatically update browser titles, OpenGraph, and JSON-LD metadata dynamically on content success.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input 
                          type="checkbox" 
                          checked={autoOptimize} 
                          onChange={(e) => setAutoOptimize(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Dynamic Metric Soundings</h4>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">Trigger subtle chime sound feedback and local browser system messages during successful generations.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input 
                          type="checkbox" 
                          checked={!!neuralNotifications} 
                          onChange={(e) => setNeuralNotifications(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand" />
                      </label>
                    </div>
                  </div>

                  <div className="text-[9px] text-zinc-400 font-mono text-center pt-4 border-t border-zinc-200">
                    * Parameters synced globally across active browser state context.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SECURITY & TELEMETRIES */}
          {activeTab === 'security' && (
            <motion.div
              key="security_tab"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid md:grid-cols-12 gap-8"
            >
              {/* Security Statement card */}
              <div className="md:col-span-8 space-y-6">
                <div className="border-b border-zinc-100 pb-2">
                  <h3 className="text-zinc-950 font-black text-lg font-mono uppercase tracking-tight">Advanced Strategy Hub</h3>
                  <p className="text-xs text-zinc-500">Configure 11 ultra-customizable intelligence parameters to match your creative pipeline.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5 text-left">
                  {/* 1 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">1. Semantic Accent Weighting</label>
                    <select
                      value={semanticAccent}
                      onChange={(e) => setSemanticAccent(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="Balanced">Balanced Mix (Default)</option>
                      <option value="Highly Pragmatic">Highly Pragmatic (Analytical & Direct)</option>
                      <option value="Highly Creative">Highly Creative (Expansive Narrative)</option>
                      <option value="Poetic">Poetic (Refined & Artistic)</option>
                    </select>
                  </div>

                  {/* 2 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">2. Emoji Injector Density</label>
                    <select
                      value={emojiDensity}
                      onChange={(e) => setEmojiDensity(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="None">None (Zero Icons)</option>
                      <option value="Standard">Standard (2-3 per block)</option>
                      <option value="Sparkly">Sparkly (High Engagement Icons)</option>
                      <option value="Heavy">Heavy Visual Elements</option>
                    </select>
                  </div>

                  {/* 3 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">3. Draft Cache Retention Horizon</label>
                    <select
                      value={cacheRetention}
                      onChange={(e) => setCacheRetention(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="7 Days">7 Days (Eco-Clean)</option>
                      <option value="30 Days">30 Days (Standard Cycle)</option>
                      <option value="90 Days">90 Days (Long-term Backups)</option>
                      <option value="Forever">Forever (No Automatic Cleanup)</option>
                    </select>
                  </div>

                  {/* 4 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">4. Keyword Sowing Density</label>
                    <select
                      value={keywordDensity}
                      onChange={(e) => setKeywordDensity(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="Sparsely Sown">Sparsely Sown (Organic Focus)</option>
                      <option value="Standard Balanced">Standard Balanced Mix</option>
                      <option value="Densely Optimized">Densely Optimized (Maximum Crawling)</option>
                    </select>
                  </div>

                  {/* 5 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">5. Autoregress Hook Anchor</label>
                    <select
                      value={hookAnchor}
                      onChange={(e) => setHookAnchor(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="Hook at 0s">Initial Frame (0s)</option>
                      <option value="Double Hook">Double Hooks (0s & 3s)</option>
                      <option value="Story-led Hook">Story-led Hook (10s)</option>
                      <option value="Smart Dynamic Hooking">Smart Dynamic Anchor</option>
                    </select>
                  </div>

                  {/* 6 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">6. Competitor Lab Crawl Precision</label>
                    <select
                      value={labPrecision}
                      onChange={(e) => setLabPrecision(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="Light Checklist">Light Checklists</option>
                      <option value="Structural Overview">Structural Overview</option>
                      <option value="Deep-Audit">Deep-Intelligence Audit (Comprehensive)</option>
                    </select>
                  </div>

                  {/* 7 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">7. Traffic Pipeline Objective</label>
                    <select
                      value={pipelineIntent}
                      onChange={(e) => setPipelineIntent(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="Viral Feed">Viral Video Feed Optimization</option>
                      <option value="Search SEO">Search Crawler & Index Optimization</option>
                    </select>
                  </div>

                  {/* 8 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">8. Acoustic Notification Profile</label>
                    <select
                      value={chimeAcoustic}
                      onChange={(e) => setChimeAcoustic(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="Lo-Fi Sparkle">Lo-Fi Sparkle Chime</option>
                      <option value="Retro Sine">Retro Sine Bubble</option>
                      <option value="Ambient Bell">Warm Ambient Bell</option>
                      <option value="Haptic Tick">Gentle Haptic Tick</option>
                    </select>
                  </div>

                  {/* 9 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">9. Workspace Interface Accent</label>
                    <select
                      value={workspaceAccent}
                      onChange={(e) => setWorkspaceAccent(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="Sovereign Blue">Sovereign Blue (Default)</option>
                      <option value="Cyber Crimson">Cyber Crimson</option>
                      <option value="Midnight Gold">Midnight Gold</option>
                      <option value="Warm Emerald">Warm Emerald Forest</option>
                    </select>
                  </div>

                  {/* 10 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">10. Dynamic Smart Credit Guard</label>
                    <select
                      value={creditGuardThreshold}
                      onChange={(e) => setCreditGuardThreshold(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="2 Credits">Warn over 2 Credits</option>
                      <option value="3 Credits">Warn over 3 Credits</option>
                      <option value="5 Credits">Warn over 5 Credits</option>
                      <option value="Never">Never Warn / Speed Focus</option>
                    </select>
                  </div>

                  {/* 11 */}
                  <div className="space-y-1 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 sm:col-span-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">11. Local Blueprint Export Protocol</label>
                    <select
                      value={exportProtocol}
                      onChange={(e) => setExportProtocol(e.target.value)}
                      className="w-full bg-white border border-zinc-200 text-xs p-2 rounded-xl text-zinc-900 outline-none"
                    >
                      <option value="JSON">Standard JSON Data Object</option>
                      <option value="Markdown">Readable Markdown Plaintext</option>
                      <option value="Binary">Compressed Hex Binary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Side controls - Security and System actions */}
              <div className="md:col-span-4 space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-[2rem] space-y-3">
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    Secure Sandbox Guarantee
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                    Chidon IQ strictly adheres to enterprise-grade security protocols. **We never expose API keys, database credentials, or sensitive service role details to the client browser.** 
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                    Instead, all intelligence analysis, creative generations, and payment operations are proxied server-side. This protects your session credentials dynamically.
                  </p>
                </div>

                {/* Core system action */}
                <div className="p-5 border border-zinc-200 bg-white rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-red-600 uppercase font-mono tracking-wider">System Purge</h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Instantly purge local script drafts, saved hashtag reports, cache indices, and restore initial local user settings to zero state.
                  </p>
                  <button
                    onClick={onClearDatabase}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Purge Cognitive State Caches</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <div className="mt-8 text-center text-zinc-400 font-mono text-[9px] tracking-wider">
        CHIDON INTELLIGENT WORKSPACE ENGINE v3.5 • PORT 3000 INGRESS SECURE
      </div>
    </div>
  );
};

export default function App() {
  const { t, i18n } = useTranslation();

  // JSON-LD SCHEMA FOR SEO
  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ChidonIQ",
    "url": "https://chidoniq.com.ng",
    "applicationCategory": "SocialMediaAnalytics",
    "operatingSystem": "Web",
    "description": "AI-powered social media analyzer for tracking engagement, followers and competitor performance",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  };

  const jsonLdMarketplace = {
    "@context": "https://schema.org",
    "@type": "Marketplace",
    "name": "ChidonIQ Marketplace",
    "url": "https://chidoniq.com.ng/marketplace",
    "description": "Professional social media marketplace to hire influencers, creators and social media managers worldwide"
  };

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return false;
  });

  const [systemLanguage, setSystemLanguage] = useState<string>(() => {
    return localStorage.getItem('system_language') || 'English';
  });

  const [activeGeminiModel, setActiveGeminiModel] = useState<string>(() => {
    return localStorage.getItem('active_gemini_model') || 'gemini-3.8-flash';
  });

  useEffect(() => {
    localStorage.setItem('active_gemini_model', activeGeminiModel);
    document.cookie = `active_gemini_model=${activeGeminiModel};path=/;max-age=31536000;samesite=lax`;
  }, [activeGeminiModel]);

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    if (user) {
      (window as any).__chidon_active_user_id = user.uid || user.id;
    } else {
      (window as any).__chidon_active_user_id = null;
    }
  }, [user]);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      const userId = user.uid || user.id || 'guest';
      const completed = localStorage.getItem(`chidon_onboarding_completed_${userId}`);
      setShowOnboarding(!completed);
    } else {
      setShowOnboarding(false);
    }
  }, [user]);

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

  const [authLoading, setAuthLoading] = useState(true);
  const [showSplashCover, setShowSplashCover] = useState<boolean>(true);
  const [splashLoading, setSplashLoading] = useState(false);
  const [creatorEmail, setCreatorEmail] = useState<string>('chideraemmanue98@gmail.com');
  const [view, setView] = useState<'dashboard' | 'tools' | 'hub' | 'matrix' | 'earn' | 'blog' | 'auth' | 'pricing' | 'notifications' | 'credits'>('dashboard');
  
  const [trialExpiredModalOpen, setTrialExpiredModalOpen] = useState(false);
  const [activeGeneratedSEO, setActiveGeneratedSEO] = useState<ExtractedSEO | null>(null);
  const [ledgerTransactions, setLedgerTransactions] = useState<any[]>([]);
  const [isCreditsLoading, setIsCreditsLoading] = useState<boolean>(true);
  
  // Real-time synchronization of the transactions list
  useEffect(() => {
    if (!user) {
      setLedgerTransactions([]);
      setIsCreditsLoading(false);
      return;
    }

    setIsCreditsLoading(true);

    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      const loadLocalTransactions = () => {
        try {
          const raw = localStorage.getItem("chidon_local_transactions") || "[]";
          const parsed = JSON.parse(raw);
          setLedgerTransactions(parsed);
        } catch (e) {
          console.warn("Failed to load local transactions:", e);
          setLedgerTransactions([]);
        }
        setIsCreditsLoading(false);
      };

      loadLocalTransactions();

      const handleLocalUpdate = () => {
        loadLocalTransactions();
      };
      window.addEventListener("chidon_local_credits_updated", handleLocalUpdate);
      window.addEventListener("storage", handleLocalUpdate);

      return () => {
        window.removeEventListener("chidon_local_credits_updated", handleLocalUpdate);
        window.removeEventListener("storage", handleLocalUpdate);
      };
    } else {
      try {
        const txsRef = collection(db, 'users', user.uid, 'transactions');
        const q = query(txsRef, orderBy('createdAt', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snap) => {
          const items: any[] = [];
          snap.forEach((docSnap) => {
            items.push({
              id: docSnap.id,
              ...docSnap.data()
            });
          });
          setLedgerTransactions(items);
          setIsCreditsLoading(false);
        }, (error) => {
          console.warn("Firestore transactions subscription failed:", error);
          setIsCreditsLoading(false);
        });
        return unsubscribe;
      } catch (e) {
        console.error("Failed to setup transactions snapshot:", e);
        setIsCreditsLoading(false);
      }
    }
  }, [user?.uid]);

  const [userCredits, setUserCredits] = useState<number>(0);
  const [dailyCreditsActive, setDailyCreditsActive] = useState<number>(0);
  const [dailyCreditsExpiresAt, setDailyCreditsExpiresAt] = useState<string | null>(null);
  const [welcomeGranted, setWelcomeGranted] = useState<boolean>(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState<boolean>(false);
  const [neededCredits, setNeededCredits] = useState<number>(0);
  const { sendPushNotification } = useFcm();
  const hasCheckedRenewal = useRef(false);

  const [isResetting, setIsResetting] = useState(false);

  const handleSystemHardReset = async () => {
    const confirmReset = window.confirm(
      "⚠️ WARNING: This will completely WIPE the entire database clean!\n\n" +
      "1. All registered user emails and profiles will be deleted from Supabase & Firebase.\n" +
      "2. All transaction histories, invoices, and saved results will be purged.\n" +
      "3. You will be signed out and local cache will be cleared so you can register freshly with a 5 credits starting balance.\n\n" +
      "Do you want to proceed with this fresh restart?"
    );
    if (!confirmReset) return;

    setIsResetting(true);
    const toastId = toast.loading("Executing pristine master reset... Purging Supabase & Firebase databases...");
    try {
      const resp = await fetch("/api/admin/clean-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await resp.json();
      
      if (resp.ok && data.success) {
        // Clear all localized credits/daily renewal/dismissal keys in localStorage
        const savedTheme = localStorage.getItem('theme');
        const savedLang = localStorage.getItem('system_language');
        
        localStorage.clear();
        sessionStorage.clear();
        
        if (savedTheme) localStorage.setItem('theme', savedTheme);
        if (savedLang) localStorage.setItem('system_language', savedLang);

        // Sign out user from Supabase and Firebase client auth
        try {
          const sb = getSupabaseClient();
          if (sb && sb.auth && typeof sb.auth.signOut === 'function') {
            await sb.auth.signOut();
          }
        } catch (sbSignOutErr) {
          console.warn("Supabase signout failed during reset:", sbSignOutErr);
        }
        if (auth.currentUser) {
          await auth.signOut();
        }

        toast.success("💥 Database cleared and restarted freshly! All previous registered emails have been removed.", { id: toastId, duration: 6000 });
        
        // Force fully reloading/resetting client state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(data.error || data.message || "Failed to reset credit databases");
      }
    } catch (err: any) {
      console.error("Critical hard reset failure:", err);
      toast.error(`Hard reset error: ${err.message || String(err)}`, { id: toastId });
    } finally {
      setIsResetting(false);
    }
  };

  const { 
    hasAccess, 
    isTrialing, 
    trialEndsIn, 
    loading: accessLoading,
    trialEndsAt,
    status: accessStatus
  } = useAccess();

  // Initialize offline sync monitor
  const { isOnline, isSyncing } = useOfflineSync(user ? user.uid : null);

  const [activeFeature, setActiveFeature] = useState<FeatureId>('keyword-research');

  // Auto-reset custom generated SEO metadata on view/feature transitions to prevent visual bleed
  useEffect(() => {
    setActiveGeneratedSEO(null);
  }, [view, activeFeature]);
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
    // Dynamically retrieve Creator Email configured in the Secrets Zone with resilient retry
    let retries = 3;
    const fetchCreatorConfig = () => {
      fetch("/api/config/creator")
        .then(res => {
          if (!res.ok) throw new Error(`HTTP status ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data && data.creatorEmail) {
            setCreatorEmail(data.creatorEmail.toLowerCase().trim());
          }
        })
        .catch(err => {
          if (retries > 0) {
            retries--;
            setTimeout(fetchCreatorConfig, 1500);
          } else {
            // Silently fallback to default to keep app functioning flawlessly
            setCreatorEmail('chideraemmanue98@gmail.com');
          }
        });
    };
    fetchCreatorConfig();

    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool') as FeatureId;
    if (toolParam) {
      const match = FEATURES.find(f => f.id === toolParam);
      if (match) {
        setView('tools');
        setActiveFeature(toolParam);
      }
    }

    const reference = params.get('reference') || params.get('trxref');
    if (reference) {
      setView('pricing');
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

  // Subscription and 3-day Free Trial states
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>("Enterprise Sovereign Pack");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>("active");
  const [userCreatedAt, setUserCreatedAt] = useState<any>(null);

  const getTrialStatus = () => {
    return {
      hasTrial: false,
      isExpired: false,
      daysLeft: 9999,
      endsIn: "unlimited"
    };
  };

  const trialStatus = getTrialStatus();

  const SIMPLE_FEATURES = ['content-ideas', 'hashtags', 'bio', 'ruled-book', 'template-library'];
  const PRO_FEATURES = [
    ...SIMPLE_FEATURES,
    'scripts',
    'thumbnails',
    'competitor-analysis',
    'posting-schedule',
    'youtube-seo',
    'seo-scorecard',
    'keyword-research',
    'post-optimizer',
    'drafts',
    'vseo-title-desc',
    'vseo-tags',
    'vseo-scorecard',
    'vseo-keywords',
    'vseo-best-time'
  ];

  const hasAccessToFeature = (featureId: FeatureId) => {
    return hasAccess;
  };
  
  // Real-time Cloud settings and Subscription sync hook
  useEffect(() => {
    if (!user) return;
    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      const storedCreditsStr = localStorage.getItem("chidon_local_credits");
      let currentCredits = storedCreditsStr !== null ? Number(storedCreditsStr) : 5; // starting welcome bonus balance

      const lastRefillTimeStr = localStorage.getItem("chidon_local_last_refill_time");
      const activeDailyStr = localStorage.getItem("chidon_local_daily_active");
      let activeDaily = activeDailyStr !== null ? Number(activeDailyStr) : 2;

      const now = Date.now();

      if (!lastRefillTimeStr) {
        // First-time sandbox/guest user initialization
        const initialTotal = currentCredits + 2; // welcome (5) + daily (2) = 7
        localStorage.setItem("chidon_local_last_refill_time", String(now));
        localStorage.setItem("chidon_local_daily_active", "2");
        localStorage.setItem("chidon_local_credits", String(initialTotal));
        setUserCredits(initialTotal);
      } else {
        const lastRefillTime = Number(lastRefillTimeStr);
        const elapsed = now - lastRefillTime;

        if (elapsed >= 24 * 60 * 60 * 1000) {
          // EXPIRE previous daily credits if unused (forced non-rollover)
          const expiredAmount = Math.min(currentCredits, activeDaily);
          currentCredits = Math.max(0, currentCredits - expiredAmount);

          // ALLOCATE fresh 2 daily credits
          currentCredits += 2;
          activeDaily = 2;

          localStorage.setItem("chidon_local_last_refill_time", String(now));
          localStorage.setItem("chidon_local_daily_active", String(activeDaily));
          localStorage.setItem("chidon_local_credits", String(currentCredits));

          toast.success("🌞 Daily login activated: +2 credits allocated (unspent daily credits expired)!");
        } else {
          // Check if active daily credits should be expired passively in the background since last load
          // Wait, if 24 hours have not elapsed, we keep the existing active credits as is.
        }
        setUserCredits(currentCredits);
      }

      setSubscriptionStatus("active");
      setSubscriptionPlan("Enterprise Sovereign Pack");
      return;
    }
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
        if (data.credits !== undefined) {
          setUserCredits(Number(data.credits));
        }
        if (data.dailyCreditsActive !== undefined) {
          setDailyCreditsActive(Number(data.dailyCreditsActive));
        }
        if (data.dailyCreditsExpiresAt !== undefined) {
          setDailyCreditsExpiresAt(data.dailyCreditsExpiresAt);
        }
        if (data.welcomeGranted !== undefined) {
          setWelcomeGranted(Boolean(data.welcomeGranted));
        }

        setSubscriptionStatus("active");
        setSubscriptionPlan("Enterprise Sovereign Pack");
        if (data.createdAt !== undefined) {
          setUserCreatedAt(data.createdAt);
        }
      } else {
        // Document does not exist: Initialize user document with active trial
        const now = Timestamp.now();
        const trialEndAt = Timestamp.fromMillis(now.toMillis() + 365 * 100 * 24 * 60 * 60 * 1000);
        setSubscriptionPlan("Enterprise Sovereign Pack");
        setSubscriptionStatus("active");
        setDoc(userDocRef, {
          email: user.email || '',
          displayName: user.displayName || '',
          createdAt: serverTimestamp(),
          credits: 5,
          welcomeGranted: true,
          dailyCreditsActive: 0,
          dailyCreditsExpiresAt: "",
          trialStartAt: now,
          trialEndAt: trialEndAt,
          subscription: {
            status: "active",
            package: "enterprise",
            currentPeriodEnd: trialEndAt
          },
          subscriptionPlan: "Enterprise Sovereign Pack",
          subscriptionStatus: "active"
        }, { merge: true })
          .catch(err => console.error("Failed to initialize user document:", err));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });
    return () => unsubscribe();
    }, [user?.uid]);

  // Global fetch interceptor to handle credit deduction for local/guest/sandbox users upon SUCCESSFUL generation
  useEffect(() => {
    const originalFetch = window.fetch;
    const interceptor = async function (input: any, init?: any) {
      const response = await originalFetch(input, init);
      
      const url = typeof input === 'string' ? input : (input as any).url || '';
      if (response.ok && (url.includes('/api/gemini/generate') || url.includes('/api/gemini/generate-image'))) {
        const activeUserId = (window as any).__chidon_active_user_id;
        if (activeUserId && (activeUserId.startsWith('local_') || activeUserId === 'sandbox' || activeUserId.startsWith('guest'))) {
          try {
            let cost = 2; // default cost
            let description = "AI Content Generation";
            if (init && init.body) {
              const bodyData = JSON.parse(init.body as string);
              const feature = bodyData.feature || '';
              description = feature ? `Chidon IQ Module: ${feature.toUpperCase()}` : "AI Content Synthesis";
              
              // Map costs dynamically (strictly capped to range from 1 to 3 credits):
              // Small - 2 credits
              // Big - 3 credits
              // Large - 3 credits (max per requirement)
              const featureId = feature.toLowerCase().replace(/\s+/g, '-');
              
              if (
                featureId.includes('script-outline') || 
                featureId.includes('shadowban-solutions') || 
                featureId.includes('video-scripts') || 
                featureId.includes('sla-contract') ||
                featureId.includes('arbitration')
              ) {
                cost = 3; // Capped to range 1-3 per requirement
              }
              // BIG (3)
              else if (
                featureId.includes('script') || 
                featureId.includes('competitor') || 
                featureId.includes('trending') || 
                featureId.includes('thumbnail') || 
                featureId.includes('youtube-seo') || 
                featureId.includes('seo-scorecard') || 
                featureId.includes('keyword-research') || 
                featureId.includes('title-desc') || 
                featureId.includes('scorecard') || 
                featureId.includes('template') || 
                featureId.includes('repurpose') || 
                featureId.includes('persona') ||
                featureId.includes('blog')
              ) {
                cost = 3;
              }
              // SMALL (2)
              else {
                cost = 2;
              }
            }
            
            const storedCredits = Number(localStorage.getItem("chidon_local_credits") || "7");
            const newBalance = Math.max(0, storedCredits - cost);
            localStorage.setItem("chidon_local_credits", String(newBalance));
            
            const activeDailyStr = localStorage.getItem("chidon_local_daily_active");
            let activeDaily = activeDailyStr !== null ? Number(activeDailyStr) : 2;
            const dailyConsumed = Math.min(activeDaily, cost);
            const nextDailyActive = Math.max(0, activeDaily - dailyConsumed);
            localStorage.setItem("chidon_local_daily_active", String(nextDailyActive));

            setUserCredits(newBalance);
            
            // Add transactions for guest users in localStorage
            const localTransactionsStr = localStorage.getItem("chidon_local_transactions") || "[]";
            try {
              const txs = JSON.parse(localTransactionsStr);
              txs.unshift({
                id: `tx_${Date.now()}`,
                type: 'debit',
                amount: cost,
                description,
                createdAt: new Date().toISOString()
              });
              localStorage.setItem("chidon_local_transactions", JSON.stringify(txs.slice(0, 50)));
            } catch (e) {
              console.error("Local tx error:", e);
            }

            // Dispatch local credits updated event to trigger live transaction logs updates in UI
            window.dispatchEvent(new Event("chidon_local_credits_updated"));

            console.log(`[Local Credit Deductor] Successfully deducted ${cost} credits for ${activeUserId} (New balance: ${newBalance})`);
          } catch (err) {
            console.error("[Local Credit Deductor] Error parsing fetch body or deducting:", err);
          }
        }
      }
      return response;
    };

    try {
      Object.defineProperty(window, 'fetch', {
        value: interceptor,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      console.warn("[Local Credit Deductor] Cannot redefine window.fetch with Object.defineProperty. Falling back to direct assignment.", e);
      try {
        (window as any).fetch = interceptor;
      } catch (err) {
        console.error("[Local Credit Deductor] Critical: All interceptor strategies failed.", err);
      }
    }

    return () => {
      try {
        Object.defineProperty(window, 'fetch', {
          value: originalFetch,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch (e) {
        try {
          (window as any).fetch = originalFetch;
        } catch (err) {
          console.error("[Local Credit Deductor] Failed to restore original fetch.", err);
        }
      }
    };
  }, [user]);

  // Live Low-Credit Toast Alert
  useEffect(() => {
    if (user && userCredits !== undefined && userCredits > 0 && userCredits < 10) {
      toast.error(
        (t) => (
          <div className="flex flex-col gap-1 text-left font-mono">
            <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">⚡ CRITICAL RESOURCE WARNING</span>
            <span className="text-xs text-slate-800 dark:text-zinc-100">
              Your fuel balance is critically low ({userCredits} cr). Acquire credit packages to avoid system disruption.
            </span>
          </div>
        ),
        {
          duration: 6000,
          id: 'low-credit-warning',
          icon: '⚠️'
        }
      );
    }
  }, [userCredits, user?.uid]);

  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const {
    messages: chatMessages,
    loadingHistory,
    subscribeToHistory,
    saveMessage,
    wrapUpMessage,
    deleteMessage
  } = useChatHistory(user ? user.uid : null);

  // Real-time chat history subscription for active feature
  useEffect(() => {
    if (!user || !activeFeature) return;
    const unsubscribe = subscribeToHistory(activeFeature);
    return () => unsubscribe();
  }, [user?.uid, activeFeature]);

  const handleLoadHistoryItem = (item: any) => {
    const userMsg = {
      id: `${item.id}-user`,
      role: 'user' as const,
      content: item.prompt,
      timestamp: item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt)
    };
    const aiMsg = {
      id: `${item.id}-ai`,
      role: 'assistant' as const,
      content: item.result,
      timestamp: item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt)
    };
    
    setFeatureResults(prev => ({
      ...prev,
      [item.feature]: [userMsg, aiMsg]
    }));
    setActiveDocId(item.id);
  };

  const handleNewChat = () => {
    setFeatureResults(prev => ({
      ...prev,
      [activeFeature]: []
    }));
    setActiveDocId(null);
  };

  // Sync state helpers
  const saveUserSetting = async (key: string, value: any) => {
    if (!user?.uid) return;
    try {
      const userRef = doc(db, 'users', user.uid);
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
    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
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
    const sb = getSupabaseClient();
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event: string, session: any) => {
      const sbUser = session?.user || null;
      if (sbUser) {
        setUser({
          uid: sbUser.id,
          id: sbUser.id,
          email: sbUser.email,
          displayName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
          isSupabase: true
        });

        // Securely attempt Daily Credits auto-claim upon successful Supabase Auth login
        try {
          const functionsInstance = getFunctions(app);
          const claimDaily = httpsCallable(functionsInstance, 'claimDailyCredits');
          claimDaily()
            .then((res: any) => {
              if (res.data && res.data.success) {
                toast.success(`🌞 Daily +2 Credits Claimed! (Balance: ${res.data.newBalance})`);
              } else if (res.data && res.data.message) {
                toast.success(`📅 ${res.data.message}`);
              }
            })
            .catch((err) => {
              console.log("Callable functions auto-claim bypassed in sandboxed development environment. Triggering elegant local fallback simulation...", err);
              // Fallback daily claim logic for local testing using the Supabase User ID (no Firebase Auth)
              const claimKey = `chidon_firebase_daily_claim_${sbUser.id}`;
              const lastClaim = localStorage.getItem(claimKey);
              const todayStr = new Date().toLocaleDateString('en-US', { timeZone: 'Africa/Lagos' });
              
              if (lastClaim !== todayStr) {
                localStorage.setItem(claimKey, todayStr);
                
                const userDocRef = doc(db, 'users', sbUser.id);
                getDoc(userDocRef).then((snap) => {
                  if (snap.exists()) {
                    const data = snap.data();
                    const currentVal = Number(data.credits || 0);
                    const newVal = currentVal + 2;
                    
                    setDoc(userDocRef, { 
                      credits: newVal,
                      lastDailyClaim: todayStr
                    }, { merge: true }).then(() => {
                      const txsRef = collection(db, 'users', sbUser.id, 'transactions');
                      const newTxRef = doc(txsRef);
                      setDoc(newTxRef, {
                        id: newTxRef.id,
                        amount: 2,
                        type: 'daily',
                        reason: 'Daily Login Bonus',
                        createdAt: serverTimestamp()
                      }).then(() => {
                        toast.success("🌞 Daily Login activated: +2 credits allocated!");
                      });
                    });
                  }
                });
              }
            });
        } catch (funcErr) {
          console.warn("Firebase Functions initialization failed:", funcErr);
        }
      } else {
        // Fallback check for local guest session
        const localSessionStr = localStorage.getItem("chidon_sandbox_session");
        if (localSessionStr) {
          try {
            const localSession = JSON.parse(localSessionStr);
            setUser({
              uid: localSession.uid || 'local_user_id',
              id: localSession.uid || 'local_user_id',
              email: localSession.email,
              displayName: localSession.displayName || localSession.email.split('@')[0],
              isLocalGuest: true
            });
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setAuthLoading(false);
    });

    const handleStorageChange = () => {
      const localSessionStr = localStorage.getItem("chidon_sandbox_session");
      if (localSessionStr) {
        try {
          const localSession = JSON.parse(localSessionStr);
          setUser({
            uid: localSession.uid || 'local_user_id',
            id: localSession.uid || 'local_user_id',
            email: localSession.email,
            displayName: localSession.displayName || localSession.email.split('@')[0],
            isLocalGuest: true
          });
        } catch {}
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // High-fidelity self-healing sync of user profile
  useEffect(() => {
    if (!user) return;
    
    let active = true;
    const syncUserProfile = async () => {
      try {
        const sb = getSupabaseClient();
        if (!sb || typeof sb.from !== 'function') return;

        const { data: profile, error: fetchErr } = await sb
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .maybeSingle();

        if (fetchErr) {
          console.warn("Could not query Supabase profile for sync:", fetchErr);
          return;
        }

        if (!active) return;

        if (!profile) {
          // Provision missing profile rows immediately in Supabase (with role, bio, etc. but NO credit sync)
          const name = user.displayName || user.email?.split('@')[0] || 'Chidon Creator';
          await sb.from('profiles').insert([{
            id: user.uid,
            role: 'buyer',
            full_name: name,
            bio: 'Strategic Intel Analyst in Chidon Matrix.',
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
            skills: ['Growth', 'TikTok SEO'],
            experience_years: 3,
            is_verified: true,
            rating: 5.0,
            platforms: ['TikTok', 'Instagram', 'YouTube']
          }]);
        }

        // Secure Daily Auto-Renewal and Reconciliation inside Firebase/Supabase
        // We always invoke the backend reconciliation on page load/login state sync to ensure 
        // starting welcome credits and daily credits are fully aligned and persistent across refreshes.
        try {
          const resp = await fetch("/api/credits/daily-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.uid })
          });
          const data = await resp.json();
          if (resp.ok && data.success) {
            if (data.claimed) {
              if (data.welcomeNewlyGranted) {
                toast.success("🎁 Welcome Bonus Activated! +5 Credits have been credited to your balance!");
                triggerNotification(user.uid, {
                  type: 'credit',
                  title: 'Welcome Gift Active! 🎁',
                  body: 'You have been granted a one-time welcome gift of +5 credits on signup!',
                  link: '/credits'
                }).catch(err => console.error("Welcome claim notice failed", err));
              }
              if (data.dailyGranted) {
                toast.success("🌞 Daily login activated: +2 credits allocated!");
                triggerNotification(user.uid, {
                  type: 'credit',
                  title: 'Daily Refill Notice ⚡',
                  body: 'Daily +2 cognitive credits have been deposited automatically. Spend them today!',
                  link: '/credits'
                }).catch(err => console.error("Auto claim notice failed", err));

                sendPushNotification(
                  'Daily Credits Refreshed ⚡',
                  'Daily +2 cognitive credits have been deposited automatically. Spend them today!'
                );
              }

              // Secure client-side sync fallback when backend lacks write permissions
              if (data.firebaseSyncRequired && db) {
                try {
                  const userRef = doc(db, 'users', user.uid);
                  await setDoc(userRef, {
                    credits: data.credits,
                    lastDailyRenewal: new Date().toISOString(),
                    updatedAt: serverTimestamp()
                  }, { merge: true });

                  // Log daily transaction under client-sync context
                  const txRef = doc(collection(db, 'users', user.uid, 'transactions'));
                  await setDoc(txRef, {
                    type: "credit",
                    amount: data.welcomeNewlyGranted ? 5 : 2,
                    description: data.welcomeNewlyGranted ? "Welcome Promo Gift (Client Ledger)" : "Automated Daily Login Bonus (Client Ledger)",
                    createdAt: serverTimestamp()
                  });
                  console.log("[Firebase Client Sync] Synced credits fallback successfully.");
                } catch (syncErr) {
                  console.warn("[Firebase Client Sync] Client-side fallback synchronization caught a safe delay:", syncErr);
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to claim/reconcile credits via API:", e);
        }
      } catch (err) {
        console.warn("Credit sync hook caught a safe boundary warning:", err);
      }
    };

    syncUserProfile();

    const interval = setInterval(syncUserProfile, 8000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.uid, userCredits]);

  const handleSendToBook = (content: string, title?: string) => {
    setPreFilledContent(prev => ({
      ...prev,
      ['ruled-book']: content,
      ['ruled-book-title']: title || ''
    }));
    navigateTo('tools', 'ruled-book');
  };

  const handleSignIn = () => {
    setView('auth');
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("chidon_sandbox_session");
      const sb = getSupabaseClient();
      await sb.auth.signOut();
      await auth.signOut();
      setUser(null);
      navigateTo('dashboard');
    } catch (err) {
      console.error("Sign out error:", err);
    }
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
        await clearAllNotesLocal();
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
  const [navigationHistory, setNavigationHistory] = useState<{view: 'dashboard' | 'tools' | 'hub' | 'matrix' | 'earn' | 'blog' | 'auth' | 'pricing' | 'notifications', feature: FeatureId}[]>([]);
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

  // Scroll to top on feature/view change
  useEffect(() => {
    const scrollToTop = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    };

    scrollToTop();

    // Use multiple phases to guarantee scroll success even if DOM finishes rendering late
    const timer = setTimeout(scrollToTop, 0);
    const timerDelayed = setTimeout(scrollToTop, 50);
    const timerDelayedMore = setTimeout(scrollToTop, 150);
    return () => {
      clearTimeout(timer);
      clearTimeout(timerDelayed);
      clearTimeout(timerDelayedMore);
    };
  }, [activeFeature, view]);

  const { generate, loading, error, setLoading } = useHybridAI(activeGeminiKey || null, activeHfKey || null, activeGeminiModel, user?.uid || null);

  const navigateTo = (newView: 'dashboard' | 'tools' | 'hub' | 'matrix' | 'earn' | 'blog' | 'auth' | 'pricing' | 'notifications' | 'credits', newFeature?: FeatureId) => {
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

  const handleSaveDraft = async (featureId: string, content: string, title: string, preventRedirect?: boolean) => {
    setIsSaving(true);
    try {
      const uId = user?.uid || 'guest_operator';

      // Offline Recovery Caching logic
      if (!navigator.onLine) {
        const offlineId = 'offline_' + Math.random().toString(36).substring(2, 11);
        
        // 1. Cache draft locally with sync flag
        await saveNoteLocal({
          id: offlineId,
          featureId,
          content: content.slice(0, 9999),
          title: title.slice(0, 199),
          createdAt: new Date().toISOString(),
          userId: uId,
          isUnsynced: true,
          syncType: 'draft'
        });

        // 2. Cache note locally with sync flag
        await saveNoteLocal({
          id: 'note_' + offlineId,
          title: `${title} - Neural Result`,
          content,
          userId: uId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
          isUnsynced: true,
          syncType: 'note'
        });

        toast.success(
          (t) => (
            <div className="flex flex-col gap-1 text-left font-mono">
              <span className="text-[10px] font-black tracking-widest text-violet-500 uppercase">💾 OFFLINE RECOVERY CACHED</span>
              <span className="text-xs text-slate-800 dark:text-zinc-100">
                You are currently offline. Draft cached locally; will auto-sync when network returns!
              </span>
            </div>
          ),
          { duration: 6000, id: 'offline-save-success', icon: '📡' }
        );
        if (!preventRedirect) navigateTo('tools', 'drafts');
        return;
      }

      if (!user || user.isLocalGuest) {
        // 1. Save draft locally
        const localDraftsKey = getStorageKey('guest_chidon_vault_drafts');
        const localDrafts = localStorage.getItem(localDraftsKey) || '[]';
        let parsedDrafts: any[] = [];
        try {
          parsedDrafts = JSON.parse(localDrafts);
        } catch {
          parsedDrafts = [];
        }
        const newDraft = {
          id: 'draft_' + Math.random().toString(36).substring(2, 11),
          featureId,
          content: content.slice(0, 9999),
          title: title.slice(0, 199),
          createdAt: new Date().toISOString(),
          userId: uId
        };
        parsedDrafts.unshift(newDraft);
        localStorage.setItem(localDraftsKey, JSON.stringify(parsedDrafts));

        // 2. Save note page locally
        const localPagesKey = getStorageKey('guest_ruled_pages');
        const localPages = localStorage.getItem(localPagesKey) || '[]';
        let parsedPages: any[] = [];
        try {
          parsedPages = JSON.parse(localPages);
        } catch {
          parsedPages = [];
        }
        const newPage = {
          id: 'note_' + Math.random().toString(36).substring(2, 11),
          title: `${title} - Neural Result`,
          content,
          userId: uId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false
        };
        parsedPages.unshift(newPage);
        localStorage.setItem(localPagesKey, JSON.stringify(parsedPages));
        
        if (!preventRedirect) navigateTo('tools', 'drafts');
        return;
      }

      const draftData: any = {
        featureId,
        content: content.slice(0, 9999),
        createdAt: serverTimestamp(),
        title: title.slice(0, 199)
      };
      
      if (user?.uid) {
        draftData.userId = user.uid;
      }
      
      await addDoc(collection(db, 'drafts'), draftData);
      
      if (user?.uid) {
        await addDoc(collection(db, 'notes'), {
          title: `${title} - Neural Result`,
          content,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isPinned: false
        });
      }
      
      if (!preventRedirect) navigateTo('tools', 'drafts');
    } catch (err) {
      console.error("Error saving to Vault:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const getFeatureCreditCost = (featureId: FeatureId | string): number => {
    switch (featureId) {
      // LARGE TOOLS / FEATURES - 5 Credits
      case 'ai-script-outline':
      case 'shadowban-solutions':
        return 5;

      // BIG TOOLS / FEATURES - 3 Credits
      case 'scripts':
      case 'competitor-analysis':
      case 'trending':
      case 'trending-topics':
      case 'thumbnails':
      case 'youtube-seo':
      case 'seo-scorecard':
      case 'keyword-research':
      case 'vseo-title-desc':
      case 'vseo-scorecard':
      case 'vseo-keywords':
      case 'template-library':
      case 'repurposing':
      case 'personas':
        return 3;

      // SMALL TOOLS / FEATURES - 2 Credits
      case 'content-ideas':
      case 'hashtags':
      case 'bio':
      case 'posting-schedule':
      case 'engagement-calc':
      case 'headlines':
      case 'post-scheduler':
      case 'drafts':
      case 'ruled-book':
      case 'post-optimizer':
      case 'vseo-tags':
      case 'vseo-best-time':
      case 'daily-ideas':
      case 'trend-alerts':
      default:
        return 2;
    }
  };

  const checkAndDeductCredits = async (cost: number, description: string): Promise<boolean> => {
    if (!user) {
      toast.error(`Authentication required: Please sign in or register to get 5 free credits and run "${description}".`);
      setView('auth');
      return false;
    }
    
    // Check balance in our local userCredits state
    if (userCredits < cost) {
      setNeededCredits(cost);
      setShowNoCreditsModal(true);
      return false;
    }
    
    // For sandbox and local guest users, pre-flight check is sufficient (deduction happens on fetch response success)
    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      return true;
    }

    // For registered users, we verify current Firestore balance first (Pre-flight check)
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      let currentCredits = 5;
      if (snap.exists()) {
        const data = snap.data();
        currentCredits = data.credits !== undefined ? Number(data.credits) : 5;
      }

      if (currentCredits < cost) {
        setNeededCredits(cost);
        setShowNoCreditsModal(true);
        return false;
      }

      // Pre-flight check passes! Return true. Actual deduction happens server-side on generation success,
      // avoiding upfront loss if the generation fails.
      return true;
    } catch (err) {
      console.warn("Firestore credit pre-flight check failed:", err);
    }
    return false;
  };

  const hasEnoughCredits = async (cost: number): Promise<boolean> => {
    if (!user) {
      toast.error(`Authentication required: Please sign in or register to get 5 free credits.`);
      setView('auth');
      return false;
    }
    
    // Quick client-side check
    if (userCredits < cost) {
      setNeededCredits(cost);
      setShowNoCreditsModal(true);
      return false;
    }

    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      return true;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentCredits = data.credits !== undefined ? Number(data.credits) : 5;
        if (currentCredits < cost) {
          setNeededCredits(cost);
          setShowNoCreditsModal(true);
          return false;
        }
        return true;
      }
    } catch (err) {
      console.warn("Firestore credit check failed, fallback to client state:", err);
    }
    return userCredits >= cost;
  };

  const deductCredits = async (cost: number, description: string): Promise<boolean> => {
    if (!user) return false;
    // Bypassed for all users here, as deduction is handled cleanly server-side for registered users
    // and via the global successful fetch interceptor for guest/sandbox users.
    return true;
  };

  const refundCredits = async (amount: number, description: string): Promise<void> => {
    if (!user) return;
    if (user.isSandbox || user.isLocalGuest || user.uid.startsWith("local_")) {
      const storedCredits = Number(localStorage.getItem("chidon_local_credits") || "7");
      const newBalance = storedCredits + amount;
      localStorage.setItem("chidon_local_credits", String(newBalance));
      setUserCredits(newBalance);

      // Log transaction locally for guest/sandbox users
      const localTransactionsStr = localStorage.getItem("chidon_local_transactions") || "[]";
      try {
        const txs = JSON.parse(localTransactionsStr);
        txs.unshift({
          id: `tx_${Date.now()}`,
          type: 'credit',
          amount: amount,
          description: `REFUND: ${description}`,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem("chidon_local_transactions", JSON.stringify(txs.slice(0, 50)));
      } catch (e) {
        console.error("Local refund tx log error:", e);
      }

      // Dispatch event to update transaction history view in real-time
      window.dispatchEvent(new Event("chidon_local_credits_updated"));
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: increment(amount),
        updatedAt: serverTimestamp()
      });

      // Log transaction in Firestore
      const txRef = doc(collection(db, 'users', user.uid, 'transactions'));
      await setDoc(txRef, {
        type: 'credit',
        amount: amount,
        description: `REFUND: ${description}`,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Firestore-only credit refund failed:", err);
    }
  };

  const handleGenerate = async (prompt: string, displayPrompt?: string) => {
    if (loading) return;
    setLoading(true);
    
    const cost = getFeatureCreditCost(activeFeature);
    
    let hasEnough = false;
    try {
      hasEnough = await hasEnoughCredits(cost);
    } catch (err) {
      console.error("Credit verification crashed:", err);
    }
    
    if (!hasEnough) {
      setLoading(false);
      return; // Insufficient credits, stop generation
    }

    const userMsg: ChatMessage = {
      id: `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`,
      role: 'user',
      content: displayPrompt || prompt,
      timestamp: new Date(),
      language: i18n.language || 'en',
      originalPrompt: prompt
    };

    setFeatureResults(prev => ({
      ...prev,
      [activeFeature]: [...(prev[activeFeature] || []), userMsg]
    }));

    let finalPrompt = prompt;
    if (generationTone) {
      finalPrompt = `${prompt}\n\n[STYLE PROTOCOL: Generate response in a highly distinct '${generationTone.toUpperCase()}' default writing tone.]`;
    }

    let result = null;
    try {
      result = await generate(finalPrompt, activeFeature);
    } catch (err: any) {
      console.error("AI pipeline error during generation:", err);
      toast.error(err.message || "An error occurred during generation.");
      setLoading(false);
      return;
    }
    
    if (result) {
      // Note user credit must only be deducted if an Ai response has been Generated or the Chidon Iq has responded only
      try {
        await deductCredits(cost, `Ran intelligence analysis on ${activeFeature.toUpperCase().replace('-', ' ')}`);
      } catch (err) {
        console.error("Post-generation credit deduction failed:", err);
      }

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

      // Extract high-performance SEO attributes from generated content automatically
      try {
        const seoExtracted = extractSEOFromAIContent(result, activeFeature);
        setActiveGeneratedSEO(seoExtracted);
      } catch (seoErr) {
        console.error("AI SEO Content extraction failed:", seoErr);
      }

      // Auto-save to Firestore history
      const savedId = await saveMessage(activeFeature, displayPrompt || prompt, result, cost);
      if (savedId) {
        setActiveDocId(savedId);
      }

      // Real-time Chidon IQ notification trigger
      if (user) {
        let featureLabel = "AI Generation";
        if (activeFeature === 'keyword-research') featureLabel = "Market DNA";
        else if (activeFeature === 'trending') featureLabel = "Engagement / Trending Detector";
        else if (activeFeature === 'content-ideas') featureLabel = "Creative Video Ideas";
        else if (activeFeature === 'personas') featureLabel = "Brand Voice Alignment";

        triggerNotification(user.uid, {
          type: 'ai_result',
          title: `Chidon IQ: ${featureLabel} Analysis Complete`,
          body: `High-fidelity neural results prepared successfully.`,
          link: `/tools?tool=${activeFeature}`
        }).catch(err => console.error("Notification dispatch failed", err));
      }
    } else {
      toast.error("Generation pipeline encountered a bottleneck. No credits were deducted.");
    }
  };

  const renderActiveContent = () => {
    if (view === 'dashboard') {
      return (
        <PaywallGate
          hasAccess={hasAccess}
          isTrialing={isTrialing}
          trialEndsIn={trialEndsIn}
          loading={accessLoading}
          user={user}
          onRedirectToPricing={() => setView('pricing')}
          onShowExpiredModal={() => setTrialExpiredModalOpen(true)}
        >
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
        </PaywallGate>
      );
    }

    if (view === 'hub') {
      return (
        <PaywallGate
          hasAccess={hasAccess}
          isTrialing={isTrialing}
          trialEndsIn={trialEndsIn}
          loading={accessLoading}
          user={user}
          onRedirectToPricing={() => setView('pricing')}
          onShowExpiredModal={() => setTrialExpiredModalOpen(true)}
        >
          <NeuralHub onSelectFeature={(id) => navigateTo('tools', id)} onBack={goBack} />
        </PaywallGate>
      );
    }

    if (view === 'matrix') {
      return (
        <PaywallGate
          hasAccess={hasAccess}
          isTrialing={isTrialing}
          trialEndsIn={trialEndsIn}
          loading={accessLoading}
          user={user}
          onRedirectToPricing={() => setView('pricing')}
          onShowExpiredModal={() => setTrialExpiredModalOpen(true)}
        >
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
            activeGeminiModel={activeGeminiModel}
            setActiveGeminiModel={setActiveGeminiModel}
            user={user}
            onClearDatabase={() => setIsResetConfirmOpen(true)}
          />
        </PaywallGate>
      );
    }

    if (view === 'earn') {
      return (
        <PaywallGate
          hasAccess={hasAccess}
          isTrialing={isTrialing}
          trialEndsIn={trialEndsIn}
          loading={accessLoading}
          user={user}
          onRedirectToPricing={() => setView('pricing')}
          onShowExpiredModal={() => setTrialExpiredModalOpen(true)}
        >
          <ChidonFreelanceEarn 
            onBack={goBack}
            user={user}
            onSignIn={handleSignIn}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            checkAndDeductCredits={checkAndDeductCredits}
            onSendToNotepad={(title, content) => {
              setPreFilledContent(prev => ({
                ...prev,
                ['ruled-book']: content,
                ['ruled-book-title']: title
              }));
              navigateTo('tools', 'ruled-book');
            }}
          />
        </PaywallGate>
      );
    }

    if (view === 'blog') {
      return (
        <PaywallGate
          hasAccess={hasAccess}
          isTrialing={isTrialing}
          trialEndsIn={trialEndsIn}
          loading={accessLoading}
          user={user}
          onRedirectToPricing={() => setView('pricing')}
          onShowExpiredModal={() => setTrialExpiredModalOpen(true)}
        >
          <ChidonIqBlog
            onSaveDraft={handleSaveDraft}
            onBack={goBack}
            checkAndDeductCredits={checkAndDeductCredits}
          />
        </PaywallGate>
      );
    }

    if (view === 'notifications') {
      return (
        <NotificationsPage 
          onBack={goBack}
          onNavigateToMessages={() => setView('earn')}
        />
      );
    }

    if (view === 'pricing') {
      return (
        <ChidonPricing 
          user={user}
          onBack={goBack}
          db={db}
          showTrialEndedModal={trialExpiredModalOpen}
          onCloseTrialEndedModal={() => setTrialExpiredModalOpen(false)}
          onNavigate={navigateTo}
        />
      );
    }

    if (view === 'credits') {
      const mappedTransactions = ledgerTransactions.map(tx => ({
        id: tx.id || `tx_${Math.random()}`,
        amount: tx.amount || 2,
        type: ((tx.type === 'credit' || tx.type === 'deposit') ? 'credit' : 'deduction') as 'credit' | 'deduction',
        reason: tx.reason || tx.description || 'Cognitive Compute Resource Charge',
        createdAt: tx.createdAt
      }));

      return (
        <ChidonCreditDashboard 
          balance={userCredits}
          isLoading={isCreditsLoading}
          onBuyCredits={() => navigateTo('pricing')}
          onSpendCredits={() => navigateTo('hub')}
          transactions={mappedTransactions}
          onBack={goBack}
        />
      );
    }


    if (view === 'auth') {
      setView('dashboard');
      return null;
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
      onBack: goBack,
      activeDocId,
      chatMessages,
      loadingHistory,
      onLoadHistoryItem: handleLoadHistoryItem,
      onWrapUpMessage: async (fId: string, mId: string, text: string) => {
        return wrapUpMessage(fId, mId, text, checkAndDeductCredits);
      },
      onDeleteMessage: deleteMessage,
      onNewChat: handleNewChat,
      checkAndDeductCredits: checkAndDeductCredits
    };

    const renderFeature = () => {
      switch (activeFeature) {
        case 'content-ideas':
        case 'hashtags':
        case 'competitor-analysis':
        case 'posting-schedule':
        case 'youtube-seo':
        case 'seo-scorecard':
        case 'keyword-research':
        case 'post-optimizer':
        case 'vseo-title-desc':
        case 'vseo-tags':
        case 'vseo-scorecard':
        case 'vseo-keywords':
        case 'vseo-best-time':
        case 'trending-topics':
        case 'daily-ideas':
        case 'trend-alerts':
        case 'ai-script-outline':
        case 'shadowban-solutions':
          return <AdvancedNeuralTool {...commonProps} />;
          
        case 'post-scheduler': return (
          <Suspense fallback={<ComponentLoader />}>
            <PostScheduler 
              initialCaption={preFilledContent['post-scheduler']} 
              onClearPreFill={() => setPreFilledContent(prev => ({ ...prev, ['post-scheduler']: '' }))} 
              feature={commonProps.feature} 
              onBack={commonProps.onBack} 
              user={user}
              checkAndDeductCredits={checkAndDeductCredits}
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
              checkAndDeductCredits={checkAndDeductCredits}
            />
          </Suspense>
        );
        default: 
          return <AdvancedNeuralTool {...commonProps} />;
      }
    };

    const content = hasAccessToFeature(activeFeature) ? (
      renderFeature()
    ) : (
      <div className="max-w-md mx-auto p-8 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-2xl shadow-xl text-center space-y-6 my-12">
        <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
          <Lock size={32} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
            {trialStatus.isExpired ? 'Trial Expired' : 'Access Restricted'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {trialStatus.isExpired ? (
              "Your 3-Day Free Trial has expired. Please subscribe to a monthly pack to reactivate all workspace tools."
            ) : !subscriptionStatus || subscriptionStatus !== 'active' ? (
              `You are currently on a 3-Day Free Trial! You only have access to Simple Features. To unlock the '${FEATURES.find(f => f.id === activeFeature)?.label || activeFeature}' tool, please subscribe to a premium plan.`
            ) : (
              `Your current subscription plan ('${subscriptionPlan}') does not include access to the '${FEATURES.find(f => f.id === activeFeature)?.label || activeFeature}' tool. Please upgrade to a higher tier plan.`
            )}
          </p>
        </div>
        
        {trialStatus.hasTrial && (
          <div className="py-2.5 px-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            ⏱️ {trialStatus.daysLeft} Days remaining on free trial
          </div>
        )}
        
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => setView('pricing')}
            className="w-full py-3 bg-brand hover:bg-brand/90 text-white font-black text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow-md shadow-brand/10 cursor-pointer"
          >
            View Subscription Packs
          </button>
          <button
            onClick={goBack}
            className="w-full py-3 bg-[var(--bg-app)] hover:bg-slate-100 dark:hover:bg-slate-850 text-[var(--text-secondary)] font-bold text-xs font-mono uppercase tracking-widest rounded-xl border border-[var(--border-base)] transition-all cursor-pointer"
          >
            Back to Terminal
          </button>
        </div>
      </div>
    );

    return (
      <PaywallGate
        hasAccess={hasAccess}
        isTrialing={isTrialing}
        trialEndsIn={trialEndsIn}
        loading={accessLoading}
        user={user}
        onRedirectToPricing={() => setView('pricing')}
        onShowExpiredModal={() => setTrialExpiredModalOpen(true)}
      >
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
             {content}
          </motion.div>

          {/* Global Footer Status during Tools usage */}
          <div className="pt-10 opacity-30 pointer-events-none group-hover:opacity-100 transition-opacity">
             <SystemStatus activeNodes={0} />
          </div>
        </div>
      </PaywallGate>
    );
  };

  const currentFeature = FEATURES.find(f => f.id === activeFeature);

  if (showSplashCover) {
    return <SecureSplashCover onComplete={() => setShowSplashCover(false)} />;
  }

  if (authLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col font-sans items-center justify-center p-4 relative overflow-hidden">
        <AppBackground />
        <SupabaseAuthPage 
          onSuccess={(u) => {
            setUser(u);
            setAuthLoading(false);
          }}
          onBypass={() => {
            setUser({
              uid: 'guest_fallback_chidon_iq',
              id: 'guest_fallback_chidon_iq',
              email: 'guest@chidon.iq',
              displayName: 'Chidon Guest',
              isLocalGuest: true
            });
            setAuthLoading(false);
          }}
        />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        user={user}
        onComplete={(profileData) => {
          setShowOnboarding(false);
          if (profileData?.displayName) {
            setUser((prev: any) => ({
              ...prev,
              displayName: profileData.displayName,
              avatarUrl: profileData.avatarUrl
            }));
          }
          if (user?.uid) {
            triggerNotification(user.uid, {
              type: 'system',
              title: 'Welcome to Chidon IQ',
              body: 'Welcome to Chidon IQ. Start exploring your premium features today!',
              link: '/dashboard'
            });
          }
        }} 
      />
    );
  }

  // Dynamic SEO metadata based on current view
  let seoTitle = "ChidonIQ - AI Social Media Analytics & Professional Marketplace";
  let seoDesc = "The all-in-one platform for social media. Analyze Instagram, TikTok, Twitter analytics AND hire professional social media managers, influencers & creators worldwide.";
  
  if (view === 'earn') {
    seoTitle = "Hire Freelance Social Media Managers & Creators - ChidonIQ Marketplace";
    seoDesc = "Connect with top verified influencers, social media managers, content creators, and expert ad designers worldwide on ChidonIQ Marketplace.";
  } else if (view === 'tools') {
    seoTitle = "AI Social Media Analytics & Optimization Tools - ChidonIQ";
    seoDesc = "Unlock deep insights into followers, engagement rate, hashtags, and competitors for Instagram, TikTok, Twitter, and YouTube with ChidonIQ.";
  } else if (view === 'blog') {
    seoTitle = "Social Media Growth Insights & Algorithmic Trends - ChidonIQ Blog";
    seoDesc = "Explore the latest expert insights, shadowban solutions, organic algorithms, and growth trends on the ChidonIQ Blog.";
  } else if (view === 'pricing') {
    seoTitle = "Choose Your Growth Plan & Get Credits - ChidonIQ";
    seoDesc = "Unlock high-speed social performance tracking, AI engines, and marketplace transactions by choosing a standard or daily credits plan.";
  }
  
  // Override base metadata with dynamic high-performance AI generated insights if present
  if (activeGeneratedSEO) {
    seoTitle = activeGeneratedSEO.title;
    seoDesc = activeGeneratedSEO.description;
  }

  const robotsConfig = getRobotsMetaForView(view);

  return (
    <BookContext.Provider value={{ onSendToBook: handleSendToBook }}>
      <Helmet>
        {/* BASIC SEO */}
        <html lang="en" />
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content="social media analytics, social media marketplace, instagram analytics, tiktok analytics, hire influencer, competitor analysis, chidoniq" />
        <meta name="robots" content={robotsConfig.content} />
        {robotsConfig.hasCanonical && (
          <link rel="canonical" href={activeGeneratedSEO ? activeGeneratedSEO.canonicalUrl : "https://chidoniq.com.ng"} />
        )}
        
        {/* OPEN GRAPH */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://chidoniq.com.ng" />
        <meta property="og:site_name" content="ChidonIQ" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:image" content="https://chidoniq.com.ng/og-image.png" />
        <meta property="og:locale" content="en_US" />

        {/* TWITTER */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ChidonIQ" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLdSoftware)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdMarketplace)}</script>
      </Helmet>
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col font-sans selection:bg-brand/30 selection:text-white overflow-hidden relative">
      <AppBackground />
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
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all border text-left cursor-pointer shadow-lg",
                  (view as string) === 'earn'
                    ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 border-yellow-350 shadow-yellow-500/40"
                    : "bg-gradient-to-r from-amber-500/15 to-yellow-500/5 hover:from-amber-500/25 hover:to-yellow-500/15 text-amber-500 dark:text-yellow-400 border-amber-500/30 hover:border-amber-400/60"
                )}
                style={{
                  boxShadow: (view as string) === 'earn' ? '0 0 15px rgba(234, 179, 8, 0.4)' : 'none'
                }}
              >
                <Briefcase size={15} className={(view as string) === 'earn' ? "text-slate-950" : "text-amber-500 dark:text-yellow-400 animate-pulse"} />
                <span className="font-extrabold uppercase tracking-widest text-[10px]">Chidon Freelance Earn 👑</span>
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
                <span>Chidon Blog</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('pricing');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer",
                  view === 'pricing'
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm animate-pulse-glow"
                    : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text-primary)] border-transparent"
                )}
              >
                <Crown size={15} className="text-amber-500" />
                <span>Chidon Pricing</span>
              </button>

              <button
                onClick={() => {
                  navigateTo('credits');
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left cursor-pointer",
                  view === 'credits'
                    ? "bg-brand/10 text-brand border-brand/20 shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--text-primary)] border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Coins size={15} className="text-brand" />
                  <span>Chidon Credit</span>
                </div>
                {userCredits !== undefined && (
                  <span className="text-[9px] font-mono font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded-md">
                    {userCredits}
                  </span>
                )}
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
                const labelMatch = getFeatureLabel(f, t).toLowerCase().includes(toolSearchQuery.toLowerCase());
                const descMatch = getFeatureDesc(f, t).toLowerCase().includes(toolSearchQuery.toLowerCase());
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
                          <span className="truncate">{getFeatureLabel(f, t)}</span>

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
              const labelMatch = getFeatureLabel(f, t).toLowerCase().includes(toolSearchQuery.toLowerCase());
              const descMatch = getFeatureDesc(f, t).toLowerCase().includes(toolSearchQuery.toLowerCase());
              return f.category === cat && (labelMatch || descMatch);
            }).length === 0) && (
              <div className="px-3 py-6 text-center text-xs text-[var(--text-secondary)] space-y-1">
                <p className="font-semibold">{t('common.noToolsFound')}</p>
                <p className="opacity-70">{t('common.tryModifyingQuery')}</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[var(--border-base)]">
            {user && subscriptionStatus !== 'active' && (
              <div className="mb-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1 font-mono">
                    <Clock size={11} className="animate-pulse" />
                    {trialStatus.isExpired ? "Trial Expired" : "Free Trial"}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-500">
                    {trialStatus.isExpired ? "Expired" : trialStatus.endsIn}
                  </span>
                </div>
                <div className="relative w-full h-1 bg-amber-500/10 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${trialStatus.isExpired ? 0 : trialEndsAt ? Math.min(100, ((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) * 100) : 100}%` }} 
                    className="absolute h-full left-0 top-0 bg-amber-500 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">Simple Features only</span>
                  <button
                    onClick={() => {
                      setView('pricing');
                      setIsMenuOpen(false);
                    }}
                    className="text-[9px] font-mono font-bold text-amber-500 hover:text-amber-400 transition-colors uppercase tracking-widest cursor-pointer hover:underline"
                  >
                    Upgrade →
                  </button>
                </div>
              </div>
            )}
            {user ? (
              <div className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-[var(--border-base)]/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCircle className="w-8 h-8 text-cyan-500 shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {user.displayName || 'Operator'}
                    </p>
                    <p className="text-[9px] font-mono text-[var(--text-secondary)] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-[var(--border-base)]/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserCircle className="w-8 h-8 text-slate-400 shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                      Guest Operator
                    </p>
                    <p className="text-[9px] font-mono text-[var(--text-secondary)] truncate">
                      Sign in to save work
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignIn}
                  className="p-2 text-brand hover:bg-brand/5 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Sign In"
                >
                  <LogIn size={14} />
                </button>
              </div>
            )}
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
                <span>{view === 'dashboard' ? t('common.overview') : (view as string) === 'earn' ? "CHIDON Earn Portal" : view === 'blog' ? "Chidon Blog" : view === 'pricing' ? "Chidon Pricing Matrix" : view === 'credits' ? "CHIDON CREDIT Ledger" : view === 'matrix' ? t('common.commandMatrix') : (currentFeature ? getFeatureLabel(currentFeature, t) : '')}</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg" title="Toggle Theme">
                  <button 
                    onClick={() => setIsDarkMode(false)} 
                    className={cn("p-1.5 rounded-md transition-all cursor-pointer", !isDarkMode ? "bg-white dark:bg-gray-700 text-brand shadow-sm font-bold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
                    title="Switch to Light Mode"
                  >
                    <Sun size={14} className="text-amber-500 font-extrabold animate-spin-slow" />
                  </button>
                  <button 
                    onClick={() => setIsDarkMode(true)} 
                    className={cn("p-1.5 rounded-md transition-all cursor-pointer", isDarkMode ? "bg-white dark:bg-gray-700 text-brand shadow-sm font-bold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}
                    title="Switch to Dark Mode"
                  >
                    <Moon size={14} className="text-indigo-400 font-extrabold" />
                  </button>
               </div>

               <div className="h-6 w-[1px] bg-[var(--border-base)] mx-1" />

               {view !== 'dashboard' && (
                 <NotificationBell 
                   onNavigateToNotifications={() => setView('notifications')}
                   onNavigateToMessages={() => setView('earn')}
                 />
               )}

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
        <ChidonIqGuide user={user} checkAndDeductCredits={checkAndDeductCredits} />
      </Suspense>

      {/* Insufficient Credits Modal Alert Overlay */}
      <AnimatePresence>
        {showNoCreditsModal && (
          <div 
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-[4px]"
            onClick={() => setShowNoCreditsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />

              <button
                onClick={() => setShowNoCreditsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none"
              >
                <X size={16} />
              </button>

              <div className="p-6 md:p-8 space-y-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl shrink-0">
                    <AlertTriangle size={24} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase leading-none">
                      INSUFFICIENT FUNDS
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tight pt-1 leading-tight uppercase font-sans">
                      Purchase Credits
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    You need <strong className="text-amber-400">{neededCredits} credits</strong> to run this high-fidelity cognitive engine, but you only have <strong className="text-white">{userCredits} credits</strong> remaining in your secure wallet.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Purchase credits instantly using our secure Paystack payments gateway to unlock professional features.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNoCreditsModal(false);
                      setView('pricing');
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-brand to-indigo-600 hover:from-brand/90 hover:to-indigo-600/90 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Purchase Credits</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNoCreditsModal(false);
                    }}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastNotification />
      </div>
    </BookContext.Provider>
  );
}
