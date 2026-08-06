import { useState, useEffect, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  BookOpen, 
  Activity, 
  Microscope, 
  TrendingUp, 
  Lightbulb, 
  Hash, 
  PenTool, 
  UserCircle, 
  Image as ImageIcon, 
  BarChart3, 
  Calendar, 
  Calculator, 
  Users, 
  Zap, 
  Share2, 
  Activity as AuditIcon,
  ShieldAlert,
  ChevronLeft,
  Copy,
  Check,
  History as HistoryIcon,
  Trash2,
  Clock,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { BookContext } from '../context/BookContext';
import HistorySidebar from './HistorySidebar';

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
} from './SpecializedWidgets';

// --- FORMATTING PROTOCOL ---
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

// --- MULTI-FEATURE SCHEMATIC MAP ---
const SCHEMAS: Record<string, {
  p1Label: string;
  p2Label: string;
  p3Label?: string;
  p1Placeholder: string;
  p2Placeholder: string;
  p3Placeholder?: string;
  p2Type?: 'text' | 'textarea' | 'select';
  p3Type?: 'text' | 'textarea' | 'select';
  p2Options?: string[];
  p3Options?: string[];
  suggestions: { label: string; p1: string; p2: string; p3?: string }[];
  buildPrompt: (p1: string, p2: string, p3: string) => string;
}> = {
  'content-ideas': {
    p1Label: 'Niche / Topic',
    p2Label: 'Target Platform',
    p3Label: 'Generation Tone',
    p1Placeholder: 'e.g. AI Productivity, Luxury Cars...',
    p2Placeholder: 'Select platform',
    p3Placeholder: 'Select tone',
    p2Type: 'select',
    p2Options: ['YouTube & TikTok', 'Instagram Reels', 'LinkedIn Narrative', 'Twitter/X Post', 'Premium Newsletter'],
    p3Type: 'select',
    p3Options: ['Viral Hook & Intense', 'Informative & Scientific', 'Playful & Funny', 'Bold & Thought-Provoking'],
    suggestions: [
      { label: 'AI Productivity', p1: 'AI Productivity Hacks', p2: 'YouTube & TikTok', p3: 'Viral Hook & Intense' },
      { label: 'SaaS Side Hustles', p1: 'SaaS Side Hustles', p2: 'YouTube & TikTok', p3: 'Viral Hook & Intense' },
      { label: 'Minimalist Tech', p1: 'Minimalist Tech Setup', p2: 'Instagram Reels', p3: 'Informative & Scientific' }
    ],
    buildPrompt: (p1, p2, p3) => `Act as a Viral Video Producer. Generate 5 high-impact ${p2.toUpperCase()} content strategies for the niche: "${p1}". 
    The tone of voice configuration should be strictly optimized for: "${p3}".
    For each video idea, strictly provide:
    1. 🎥 VIDEO FORMAT
    2. 💡 THE BIG IDEA
    3. 🎭 VIRAL HOOK
    4. 📜 SCRIPT PROTOCOL
    5. 🚀 STRATEGIC GOAL`
  },
  'hashtags': {
    p1Label: 'Core Topic / Niche',
    p2Label: 'Distribution Intensity',
    p1Placeholder: 'Enter core topic...',
    p2Placeholder: 'Select focus',
    p2Type: 'select',
    p2Options: ['Broad reach and growth vector', 'Dense local/hyper-niche conversions', 'High risk high reward viral hashtags'],
    suggestions: [
      { label: 'Web3 Tech', p1: 'Web3 Tech Dev', p2: 'Broad reach and growth vector' },
      { label: 'Quiet Luxury', p1: 'Quiet Luxury Living', p2: 'Broad reach and growth vector' },
      { label: 'Solo Creator', p1: 'Solo Indie Creator', p2: 'Dense local/hyper-niche conversions' }
    ],
    buildPrompt: (p1, p2) => `Perform deep hashtag research for the topic: "${p1}" optimized specifically for campaign focus: "${p2}". 
    Provide exactly 30 ranked hashtags organized into Reach Tiers:
    - Tier 1: Low Competition (Under 100k posts)
    - Tier 2: Medium Growth (100k - 1M posts)
    - Tier 3: Viral Authority (1M+ posts)

    For each hashtag, provide a "Relevance Score" and "Competition Level".
    
    IMPORTANT: Every single hashtag must be on its own line with a clear vertical gap between them.
    Format as a structured table-like list representing a deep-scan analysis.`
  },
  'scripts': {
    p1Label: 'Video Topic / Hook',
    p2Label: 'Target Duration',
    p3Label: 'Script Tone',
    p1Placeholder: 'e.g., How to double your productivity...',
    p2Placeholder: 'Select duration',
    p3Placeholder: 'Select tone',
    p2Type: 'select',
    p2Options: ['Short (30-60s)', 'Medium (2-5m)', 'Long (10m+)'],
    p3Type: 'select',
    p3Options: ['High Energy & Hype', 'Calm & Educational', 'Story-driven', 'Direct & Bold'],
    suggestions: [
      { label: 'Productivity Guide', p1: '3 simple habits that save 2 hours a day', p2: 'Short (30-60s)', p3: 'High Energy & Hype' },
      { label: 'My SaaS Journey', p1: 'How I built an AI app in 2 weeks as a solo dev', p2: 'Medium (2-5m)', p3: 'Story-driven' }
    ],
    buildPrompt: (p1, p2, p3) => `Write a complete script and caption for: "${p1}". 
    Target Duration: ${p2}. Tone of voice: ${p3}.
    Provide platform-specific variants (YouTube, TikTok, Instagram). 
    Include:
    - Hook
    - Body (Bullet points)
    - Call to Action
    - Platform-specific caption with hashtags.
    Give me short, medium, and long versions.`
  },
  'bio': {
    p1Label: 'Brand Details / Bio Focus',
    p2Label: 'Primary Platform',
    p3Label: 'Brand Tone',
    p1Placeholder: 'e.g., Software engineer building AI tools in public...',
    p2Placeholder: 'Select platform',
    p3Placeholder: 'Select tone',
    p2Type: 'select',
    p2Options: ['Instagram', 'TikTok', 'Twitter/X', 'LinkedIn'],
    p3Type: 'select',
    p3Options: ['Minimal & Clean', 'Quirky & Funny', 'Authority & Metric-driven', 'Aesthetic & Creative'],
    suggestions: [
      { label: 'Indie Hacker', p1: 'Indie developer building web tools in public. Reached $2k MRR.', p2: 'Twitter/X', p3: 'Authority & Metric-driven' },
      { label: 'Fitness Coach', p1: 'Personal trainer helping busy professionals lose weight in 12 weeks.', p2: 'Instagram', p3: 'Minimal & Clean' }
    ],
    buildPrompt: (p1, p2, p3) => `Generate 3 high-conversion Instagram/Twitter/LinkedIn bios for: "${p1}".
    Target Platform: ${p2}. Brand Tone layout: ${p3}.
    Include strategy explanations for each and exact character counts.`
  },
  'thumbnails': {
    p1Label: 'Video Title or Concept',
    p2Label: 'Visual Theme / Style',
    p1Placeholder: 'e.g., Stop coding in Python!',
    p2Placeholder: 'Select visual direction',
    p2Type: 'select',
    p2Options: ['Neon High-Contrast', 'Minimal & Elegant', 'Dramatic & High-Depth', 'Bento-Grid layout'],
    suggestions: [
      { label: 'Coding Choice', p1: 'Stop coding in Python! (Learn Rust instead)', p2: 'Neon High-Contrast' },
      { label: 'Minimal Desk', p1: 'The ultimate $5,000 minimal productivity setup', p2: 'Minimal & Elegant' }
    ],
    buildPrompt: (p1, p2) => `Design 5 visual thumbnail concept briefs for: "${p1}".
    Aesthetic Direction requested: ${p2}.
    For each, provide:
    - Layout description
    - Primary Color Palette
    - Visual Hook
    - Psychology explanation for why it will get clicks.`
  },
  'competitor-analysis': {
    p1Label: 'Target Competitor Handle',
    p2Label: 'Analysis Core Focus',
    p1Placeholder: 'Competitor username...',
    p2Placeholder: 'Select analytical focus',
    p2Type: 'select',
    p2Options: ['Deep UX & Content Hook Breakdown', 'SEO Keyword & Meta Alignment', 'Product Offer & conversion flow Analysis'],
    suggestions: [
      { label: '@mrbeast', p1: '@mrbeast', p2: 'Deep UX & Content Hook Breakdown' },
      { label: '@hubermanlab', p1: '@hubermanlab', p2: 'Deep UX & Content Hook Breakdown' },
      { label: '@naval', p1: '@naval', p2: 'SEO Keyword & Meta Alignment' }
    ],
    buildPrompt: (p1, p2) => `Perform a deep strategic analysis of the competitor / reference creator: "${p1}" with selective analytical emphasis on: "${p2}". 
    Provide a multi-layered Intelligence Report:
    1. "Core Content Pillars": Identify their 3 most successful content types with engagement benchmarks.
    2. "Tactical Strengths": Why their audience converts (Visual style, Hook strategy, Pacing).
    3. "Market Gaps & Vulnerabilities": Specific content angles they are missing that you can exploit.
    4. "Audience Sentiment Scan": Typical community response patterns and triggers.
    5. "The Counter-Strike Protocol": A 3-step plan to outrank and outperform their top content.
    
    Format with structured tables and tactical H3 headers.`
  },
  'posting-schedule': {
    p1Label: 'Market Niche / Industry',
    p2Label: 'Frequency Strategy',
    p1Placeholder: 'Niche topic context...',
    p2Placeholder: 'Select posting frequency',
    p2Type: 'select',
    p2Options: ['Daily Consistency (7 days)', 'Steady Growth (3-5 times / week)', 'Aggressive Burst Strategy (14 slots)'],
    suggestions: [
      { label: 'SaaS Coding', p1: 'SaaS Coding Tutorials', p2: 'Daily Consistency (7 days)' },
      { label: 'Personal Finance', p1: 'Fintech & personal investing hacks', p2: 'Steady Growth (3-5 times / week)' }
    ],
    buildPrompt: (p1, p2) => `Develop a comprehensive optimized posting schedule for the niche: "${p1}" scaled to frequency intensity: "${p2}". 
    Format the primary output as a structured Markdown Table representing a calendar grid.
    
    Include:
    - DAY (Mon-Sun)
    - PEAK TIME (AM/PM spikes adjusted to your frequency)
    - CONTENT TYPE (Reel, Carousel, Story sequence, Static, Article)
    - TOPIC FOCUS (The core category for that slot)
    - AUDIENCE STATE (Why they are active at this time)
    
    After the table, provide 3 "Tactical Growth Maneuvers" specifically for this schedule.`
  },
  'engagement-calc': {
    p1Label: 'Followers / Subscribers Count',
    p2Label: 'Average Interaction metrics',
    p1Placeholder: 'e.g., 10,000...',
    p2Placeholder: 'e.g., 200 likes, 15 comments per post...',
    suggestions: [
      { label: 'Standard Profile', p1: '10,000', p2: '350 likes, 22 comments' }
    ],
    buildPrompt: (p1, p2) => `The user wants an engagement rate advisor for a profile with: "${p1}" followers and active metrics: "${p2}".
    Compute a hypothetical engagement rate based on the details provided.
    Benchmark it against platform averages.
    Deliver a 30-day growth improvement plan.
    Format as a professional report.`
  },
  'trending': {
    p1Label: 'Core Niche / Category',
    p2Label: 'Minimum Momentum Velocity',
    p1Placeholder: 'e.g., AI Web Development...',
    p2Placeholder: 'Select filter strength',
    p2Type: 'select',
    p2Options: ['Super-Spike (Top 10%)', 'Growing Steadily (Top 25%)', 'All Emerging Topics'],
    suggestions: [
      { label: 'Web3 Tech', p1: 'Web3 Tech Dev', p2: 'Super-Spike (Top 10%)' }
    ],
    buildPrompt: (p1, p2) => `Surface 20 high-momentum trending topics for the niche: "${p1}" filtered by momentum depth: "${p2}".
    Assign each a "Momentum Score" (0-100).
    Provide content angle suggestions and "Urgency Labels" (Hot, Growing, Saturated).`
  },
  'personas': {
    p1Label: 'Core Offer or Channel Focus',
    p2Label: 'Primary Target Demographic',
    p1Placeholder: 'e.g., Fitness app for busy remote workers...',
    p2Placeholder: 'Select focus tier',
    p2Type: 'select',
    p2Options: ['Gen Z & Tech Leaning', 'Millennials & Career-focused', 'Experienced Professionals', 'General Audience'],
    suggestions: [
      { label: 'Remote Fit', p1: 'Fitness app for busy remote workers', p2: 'Millennials & Career-focused' }
    ],
    buildPrompt: (p1, p2) => `Construct a detailed fictional audience persona for: "${p1}" targeting "${p2}".
    Include:
    - Fictional Name & Bio
    - Pain Points
    - Goals
    - Psychological Triggers
    - Content Preferences.`
  },
  'headlines': {
    p1Label: 'Content Topic / Theme',
    p2Label: 'Click-Magnet Hook Style',
    p1Placeholder: 'e.g., Why Next.js is better than React...',
    p2Placeholder: 'Select formula style',
    p2Type: 'select',
    p2Options: ['Curiosity Loop', 'Intense Threat/Warning', 'Numbered Listicle', 'Secret / Insider Leak'],
    suggestions: [
      { label: 'Next.js vs React', p1: 'Why Next.js is better than React', p2: 'Secret / Insider Leak' }
    ],
    buildPrompt: (p1, p2) => `Generate 10 viral hook formulas and headline alternatives for: "${p1}".
    Incorporate the "${p2}" psychological framework.
    For each, assign a "Predicted CTR Score" and explain why it works.`
  },
  'repurposing': {
    p1Label: 'Source Content Details',
    p2Label: 'Format Focus Strategy',
    p1Placeholder: 'Paste source script or video topic detail...',
    p2Placeholder: 'Select pipeline setup',
    p2Type: 'select',
    p2Options: ['Video to Threads & Reels', 'Blog to Carousel & X Posts', 'Podcast to Short-Form snippets', 'Newsletter to LinkedIn Posts'],
    suggestions: [
      { label: 'Deep Work Guide', p1: 'A 15-minute explanation of deep work habits and dopamine detoxing', p2: 'Video to Threads & Reels' }
    ],
    buildPrompt: (p1, p2) => `Create a full content repurposing plan starting from this core content: "${p1}".
    Target transformation focus strategy: ${p2}.
    Plan across 4 target platforms (e.g., YouTube, Blog, X/Twitter, Instagram).
    Describe specific adaptations for each.`
  },
  'youtube-seo': {
    p1Label: 'Video Title or Concept',
    p2Label: 'Primary Target Keywords',
    p1Placeholder: 'e.g., Custom React compiler tutorial...',
    p2Placeholder: 'e.g., react compile, advanced react, custom hook...',
    suggestions: [
      { label: 'React Tutorial', p1: 'Advanced React 19 Custom Hooks Deep-Dive', p2: 'react hooks, react 19, web development' }
    ],
    buildPrompt: (p1, p2) => `Perform comprehensive YouTube Video SEO optimization for Title/Outline: "${p1}".
    Target keywords to naturally embed: "${p2}".
    Provide:
    1. 3 optimized high-CTR video titles.
    2. Full semantic description draft.
    3. 15 relevant tags.
    4. Strategic timeline stamps.`
  },
  'seo-scorecard': {
    p1Label: 'Target Keywords',
    p2Label: 'Full Metadata to Audit (Title, Desc, Tags)',
    p3Label: 'Audit Depth',
    p1Placeholder: 'e.g. AI SEO, Digital Marketing...',
    p2Placeholder: 'Paste title, description, and tags...',
    p3Placeholder: 'Select scan depth',
    p3Type: 'select',
    p3Options: ['Standard Performance Scan', 'Deep LSI & Entity Scan'],
    suggestions: [
      { label: 'General AI SEO', p1: 'AI SEO, Digital Marketing', p2: 'Title: How AI is Changing SEO Forever\nDescription: Explore the future of search engines...', p3: 'Standard Performance Scan' }
    ],
    buildPrompt: (p1, p2, p3) => `You are a Senior SEO Content Auditor. Target Keywords: ${p1}. Content to Audit: "${p2}". Analysis Mode: "${p3}".
    Provide Keyword Resonance Matrix, Neural Optimization Breakdown, High-Impact Fixes, and LSI Expansion Map.`
  },
  'keyword-research': {
    p1Label: 'Seed Keyword',
    p2Label: 'Target Audience Intent',
    p1Placeholder: 'e.g., AI Content Marketing...',
    p2Placeholder: 'Select profiling intent',
    p2Type: 'select',
    p2Options: ['Informational search intent', 'Commercial value & High purchase intent'],
    suggestions: [
      { label: 'Workspaces', p1: 'Minimalist workspaces', p2: 'Informational search intent' },
      { label: 'Kubernetes', p1: 'Kubernetes cluster setups', p2: 'Informational search intent' }
    ],
    buildPrompt: (p1, p2) => `You are a Neural Keyword Research specialist. Seed Keyword: ${p1}. Intent profiling focus: "${p2}".
    Provide Search Intent Profile, Neural Strategy Matrix (10 keywords with Vol, Difficulty, Angle), Competitor Node Scan, Semantic Expansion, and Strategic Content Brief.`
  },
  'post-optimizer': {
    p1Label: 'Draft Caption / Post text',
    p2Label: 'Platform Context',
    p1Placeholder: 'Write or paste caption...',
    p2Placeholder: 'Select platform context',
    p2Type: 'select',
    p2Options: ['LinkedIn Algorithm', 'Instagram Reels Hook', 'Twitter/X Viral Post', 'Facebook Feed'],
    suggestions: [
      { label: 'Job Hiring', p1: 'We are hiring software developers! Apply today.', p2: 'LinkedIn Algorithm' }
    ],
    buildPrompt: (p1, p2) => `Optimize the following draft caption: "${p1}" specifically for ${p2}.
    Focus on: Hook power, Line spacing and readability, CTA visibility, and organic algorithm distribution markers.`
  },
  'shadowban-solutions': {
    p1Label: 'Account issues description',
    p2Label: 'Platform affected',
    p1Placeholder: 'e.g. Zero views on last 5 Reels, hashtags completely dry...',
    p2Placeholder: 'Select platform',
    p2Type: 'select',
    p2Options: ['TikTok', 'Instagram', 'YouTube Shorts', 'Twitter/X'],
    suggestions: [
      { label: 'Zero views TikTok', p1: 'Zero views on last 5 posts, hashtags completely dry', p2: 'TikTok' }
    ],
    buildPrompt: (p1, p2) => `Formulate a shadowban recovery diagnostic report and plan for: "${p1}" on platform ${p2}.
    Provide: Diagnostic Checklist, Immediate Algorithmic Recovery steps, Policy Compliance violations check, and a 14-day Content Reset strategy.`
  },
  'vseo-title-desc': {
    p1Label: 'Core Topic / Concept',
    p2Label: 'Target Keywords (comma separated)',
    p1Placeholder: 'e.g. Next.js server actions...',
    p2Placeholder: 'Keywords to integrate...',
    suggestions: [
      { label: 'Server Actions', p1: 'Next.js 15 Server Actions Deep-Dive Guide', p2: 'nextjs, server actions, react 19, web dev' },
      { label: 'Micro-SaaS', p1: 'How I Built an AI Micro-SaaS to $10k MRR in 30 Days', p2: 'saas, indie hacker, build in public, solo founder' }
    ],
    buildPrompt: (p1, p2) => `Act as a Master Video Growth Strategist. Generate 10 high-CTR YouTube titles and 3 professionally optimized, high-conversion descriptions for: "${p1}". 
    Relevant Keywords to integrate: ${p2}. 
    
    For Titles, utilize:
    - Curiosity Gaps (The "Open Loop" technique)
    - Emotional Power Words
    - Specificity and Numerical anchors
    
    For Descriptions, ensure:
    - The first 2 lines are optimized for SEO and CTR snippets.
    - Strategic keyword density without stuffing.
    - Clear timestamps/chapters (simulated).
    - High-impact Call to Action (CTA).`
  },
  'vseo-tags': {
    p1Label: 'Video Title or Description',
    p2Label: 'Niche Context (e.g., Tech, Comedy)',
    p1Placeholder: 'e.g. How to scale nextjs apps...',
    p2Placeholder: 'Niche details...',
    suggestions: [
      { label: 'Tech Niche', p1: 'Scaling Next.js to 1 Million Users', p2: 'Software development, nextjs, devops' }
    ],
    buildPrompt: (p1, p2) => `Extract and generate 30 high-performing SEO tags for: "${p1}". Niche: ${p2}. 
    Sort tags by predicted volume and competition.`
  },
  'vseo-scorecard': {
    p1Label: 'Full Metadata (Title, Desc, Tags)',
    p2Label: 'Target Audience / Goal',
    p1Placeholder: 'Title: ...\nDescription: ...',
    p2Placeholder: 'Target audience details...',
    suggestions: [],
    buildPrompt: (p1, p2) => `Provide a Video SEO Score (1-100) for the following metadata: "${p1}". Target: ${p2}.
    Analyze title strength, description optimization, tag relevance, and keyword density.
    Provide 5 clear improvements for a perfect 100 score.`
  },
  'vseo-keywords': {
    p1Label: 'Target Topic / Keyword',
    p2Label: 'Negative Keywords or Competitive Focus',
    p1Placeholder: 'e.g. AI agents...',
    p2Placeholder: 'Keywords to avoid or focus details...',
    suggestions: [],
    buildPrompt: (p1, p2) => `Perform a comprehensive YouTube Keyword Research scan for: "${p1}". Context/Constraints: ${p2}.
    Generate the result in a clean, readable data format including:
    1. "Neural Search Volume": Provide an estimated monthly search volume tier.
    2. "Competition Score": A percentage-based difficulty rating (0-100%) with low/medium/high.
    3. "Trend Analysis": Rising, stable, or seasonal?
    4. "High-Volume Related Keywords": Table of 10 related keywords with reach potential.
    5. "Strategic Content Angle": Frame to outrank competitors.`
  },
  'vseo-best-time': {
    p1Label: 'Your Timezone',
    p2Label: 'Primary Audience Region',
    p1Placeholder: 'e.g. EST (UTC-5)...',
    p2Placeholder: 'e.g. North America, India...',
    suggestions: [],
    buildPrompt: (p1, p2) => `Analyze the best time to post for a creator in "${p1}" targeting "${p2}".
    Provide a heat-map style recommendation (Markdown table) and explain the cultural/algorithmic rationale.`
  },
  'trending-topics': {
    p1Label: 'Your Core Niche',
    p2Label: 'Recent Successful Video Topic',
    p1Placeholder: 'e.g. fitness...',
    p2Placeholder: 'e.g. 5-minute morning abs routine...',
    suggestions: [
      { label: 'AI Developers', p1: 'AI Engineering & LLM Orchestration', p2: 'Highlight new LangChain updates and developer setups' },
      { label: 'Creative Design', p1: 'Tailwind CSS v4 & Next-Gen Workspaces', p2: 'Focus on local setup workflows and design tokens' }
    ],
    buildPrompt: (p1, p2) => `Act as a Global Trend Intelligence Officer. Identify the top 15 high-momentum trending topics for the niche: "${p1}". 
    Contextual Insights: ${p2}.
    
    For each topic, provide:
    - Neural Momentum Score (1-100)
    - Velocity Vector (How fast it is moving)
    - The "Viral Pivot" (The specific angle that makes it click)
    - Execution Strategy (How to outrank current results).`
  },
  'daily-ideas': {
    p1Label: 'Channel Description / Focus',
    p2Label: 'Current Goal',
    p1Placeholder: 'Channel niche focus...',
    p2Placeholder: 'Subscribers vs Views focus details...',
    suggestions: [
      { label: 'Productivity Niche', p1: 'Productivity workflows, calendar guides, Workspace Productivity Vault templates', p2: 'Target maximum subscriber retention & click CTR' },
      { label: 'Minimal Lifestyle', p1: 'Quiet luxury desk setups, mechanical keyboards, audio gear', p2: 'Target hyper-engaged high-retention views' }
    ],
    buildPrompt: (p1, p2) => `Generate 10 hyper-specific video topic ideas for: "${p1}". Primary Objective: ${p2}.
    These ideas must leverage recent search behavior and curiosity gap psychology. 
    Include a "Click-Magnet" headline for each idea.`
  },
  'trend-alerts': {
    p1Label: 'Keyword to Monitor',
    p2Label: 'Sensitivity Level',
    p1Placeholder: 'Keyword...',
    p2Placeholder: 'High/Medium/Low...',
    suggestions: [],
    buildPrompt: (p1, p2) => `SIMULATION: Execute a Neural Trend Spike Alert for the keyword constellation around: "${p1}". 
    Sensitivity Protocol: ${p2}.
    
    Generate a "Spike Intelligence Report":
    1. Alert Confidence Tier (High/Medium/Low)
    2. Estimated Traffic Volume Increase (%)
    3. Algorithm Reach Expansion Potential
    4. Content Response Matrix: Exact steps to take in the next 4 hours to dominate this spike.`
  },
  'ai-script-outline': {
    p1Label: 'Video Concept / Headline',
    p2Label: 'Target Duration (minutes)',
    p1Placeholder: 'Headline details...',
    p2Placeholder: 'Duration value...',
    suggestions: [
      { label: 'Time Management', p1: '3 Morning Habits That Saved Me 20 Hours Every Week', p2: '10' },
      { label: 'Tech Deep Dive', p1: 'What Actually Happens inside a Neural Network Model', p2: '15' }
    ],
    buildPrompt: (p1, p2) => `Generate a high-authority video script blueprint for: "${p1}". Target Duration: ${p2} minutes.
    Breakdown into:
    - Visual Hook
    - Narrative Pacing (Segment by segment)
    - Engagement Checkpoints
    - Hard Call-to-Action.`
  }
};

// --- DYNAMIC GRAPH COMPONENT ---
const KeywordTrendGraph = ({ difficulty }: { difficulty: number }) => {
  const data = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      month: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'][i],
      score: Math.max(20, Math.min(100, difficulty + (Math.sin(i) * 15) + (Math.random() * 8 - 4)))
    }));
  }, [difficulty]);

  return (
    <div className="h-48 w-full mt-4 card-base p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
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
            <linearGradient id="colorScoreUnified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
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
            stroke="#0ea5e9" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorScoreUnified)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN UNIFIED COMPONENT ---
export default function AdvancedNeuralTool({
  feature,
  onGenerate,
  messages,
  loading,
  error,
  onGenerateFeedback,
  onSaveDraft,
  onBack,
  credits = null,
  activeDocId = null,
  chatMessages = [],
  loadingHistory = false,
  onLoadHistoryItem,
  onWrapUpMessage,
  onDeleteMessage,
  onNewChat
}: any) {
  const { t } = useTranslation();
  const bookContext = useContext(BookContext);
  
  // Retrieve config schema
  const schema = SCHEMAS[feature.id] || {
    p1Label: 'Neural Directive',
    p2Label: 'Additional Context',
    p1Placeholder: `Describe your target for ${feature.label.toLowerCase()}...`,
    p2Placeholder: 'Optional tactical focus notes...',
    suggestions: [],
    buildPrompt: (p1, p2) => `Analyze and provide expert social media advice for: "${p1}" in the context of ${feature.label}. Additional detail: "${p2}".`
  };

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all');
  const [followUpInput, setFollowUpInput] = useState('');

  // History & Wrap-Up states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWrapping, setIsWrapping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeductionAnim, setShowDeductionAnim] = useState(false);

  const currentMessageFromHistory = useMemo(() => {
    if (!activeDocId || !chatMessages) return null;
    return chatMessages.find((m: any) => m.id === activeDocId) || null;
  }, [activeDocId, chatMessages]);

  const handleCopyAction = () => {
    const lastResponse = messages && messages.slice().reverse().find((m: any) => m.role === 'assistant');
    if (!lastResponse?.content) return;
    navigator.clipboard.writeText(lastResponse.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWrapUpAction = async () => {
    const lastResponse = messages && messages.slice().reverse().find((m: any) => m.role === 'assistant');
    if (!activeDocId || !lastResponse?.content) return;
    setIsWrapping(true);
    setShowDeductionAnim(true);
    setTimeout(() => setShowDeductionAnim(false), 2000);

    try {
      await onWrapUpMessage(feature.id, activeDocId, lastResponse.content, credits);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWrapping(false);
    }
  };

  // Reset states on feature switch
  useEffect(() => {
    setInput1('');
    setInput2(schema.p2Type === 'select' && schema.p2Options ? schema.p2Options[0] : '');
    setInput3(schema.p3Type === 'select' && schema.p3Options ? schema.p3Options[0] : '');
    setFollowUpInput('');
  }, [feature.id]);

  const handleAction = () => {
    if (!input1.trim()) return;
    let prompt = schema.buildPrompt(input1, input2, input3);
    prompt += FORMATTING_PROTOCOL;
    onGenerate(prompt, `${feature.label} scan for: ${input1.slice(0, 30)}...`);
  };

  const handleFollowUpSend = (customPrompt?: string) => {
    const queryText = customPrompt || followUpInput.trim();
    if (!queryText) return;

    // Construct clean list of prior messages
    const chatContext = (messages || []).map((m: any) => {
      const roleStr = m.role === 'user' ? 'USER' : 'AI (' + (feature.persona || 'ChidonIQ Agent') + ')';
      return `${roleStr}: ${m.content}`;
    }).join('\n\n');

    const finalPrompt = `You are continuing an interactive conversational dialogue session as the specialized authority "${feature.persona || 'ChidonIQ Artificial Strategist'}".
Below is the history of this session's conversation. Review it to understand previous context and answers.

--- CONVERSATION HISTORY ---
${chatContext}

--- NEW USER DIRECTIVE OR FOLLOW-UP ---
${queryText}

Please respond to the new user directive directly and fully. Sound highly authoritative, technical, and strategic. Keep your response in appropriate language. Maintain the following formatting protocol:
${FORMATTING_PROTOCOL}`;

    onGenerate(finalPrompt, `Dialogue: ${queryText.slice(0, 30)}...`);
    setFollowUpInput('');
  };

  const actions = (msg: any) => (
    <>
      <button 
        onClick={() => onGenerateFeedback(feature.id, msg.content)}
        className={cn("flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all text-[10px] uppercase tracking-[0.2em] font-black cursor-pointer")}
      >
        <MessageSquare size={14} /> Profile
      </button>
      <button 
        onClick={() => onSaveDraft(feature.id, msg.content, `${feature.label}: ${input1.slice(0, 20)}`)}
        className={cn("flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all text-[10px] uppercase tracking-[0.2em] font-black cursor-pointer")}
      >
        <BookOpen size={14} /> Vault
      </button>
    </>
  );

  const lastResponse = messages && messages.slice().reverse().find((m: any) => m.role === 'assistant');

  // Hashtag specific parser helper
  const tagsList = useMemo(() => {
    if (feature.id !== 'hashtags' || !lastResponse) return [];
    const text = lastResponse.content;
    const rawMatches = text.match(/#[a-zA-Z0-9_]+/g) || [];
    const uniqueTags = Array.from(new Set(rawMatches.map((t: string) => t.trim())));
    
    return uniqueTags.map((tag: string, index: number) => {
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
  }, [lastResponse, feature.id]);

  const copyIndividualHashtag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const copySelectedHashtagsGroup = (tier?: number) => {
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
    <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto px-4 md:px-0">
      
      {/* Top Breadcrumb Header for context */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors group font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit protocol</span>
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-brand transition-all font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 border border-[var(--border-base)] rounded-xl hover:border-brand/20 shadow-sm"
          >
            <HistoryIcon size={12} className="text-brand" />
            <span>History ({chatMessages?.length || 0})</span>
          </button>
          
          <span className={cn("text-[9px] font-mono uppercase tracking-[0.2em] hidden sm:inline", feature.themeColor)}>
            {feature.persona || 'ChidonIQ Artificial Strategist'}
          </span>
        </div>
      </div>

      {feature.id === 'trending' && <ChidonIQCrawlerWidget />}
      {feature.id === 'trending' && (
        <div className="mb-6">
          <TrendHeatmapWidget />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* INPUT PANEL CARD */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl space-y-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-1 h-full", feature.themeColor.replace('text-', 'bg-'))} />
            
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800", feature.themeColor)}>
                <feature.icon size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{feature.label}</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono tracking-wider">NODE CONTROL</p>
              </div>
            </div>

            {/* Field 1 */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)] font-bold">{schema.p1Label}</label>
              <textarea 
                placeholder={schema.p1Placeholder}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] rounded-2xl px-4 py-3.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all text-sm font-sans text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                value={input1}
                onChange={(e) => setInput1(e.target.value)}
              />
            </div>

            {/* Field 2 */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)] font-bold">{schema.p2Label}</label>
              {schema.p2Type === 'select' ? (
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] rounded-2xl px-4 py-3.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all text-sm font-sans text-[var(--text-primary)] appearance-none cursor-pointer"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                  >
                    {schema.p2Options?.map(opt => (
                      <option key={opt} value={opt} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{opt}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <textarea 
                  placeholder={schema.p2Placeholder}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] rounded-2xl px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all text-sm font-sans text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                  value={input2}
                  onChange={(e) => setInput2(e.target.value)}
                />
              )}
            </div>

            {/* Field 3 */}
            {schema.p3Label && (
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)] font-bold">{schema.p3Label}</label>
                {schema.p3Type === 'select' ? (
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] rounded-2xl px-4 py-3.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all text-sm font-sans text-[var(--text-primary)] appearance-none cursor-pointer"
                    value={input3}
                    onChange={(e) => setInput3(e.target.value)}
                  >
                    {schema.p3Options?.map(opt => (
                      <option key={opt} value={opt} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{opt}</option>
                    ))}
                  </select>
                ) : (
                  <textarea 
                    placeholder={schema.p3Placeholder}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] rounded-2xl px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all text-sm font-sans text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                    value={input3}
                    onChange={(e) => setInput3(e.target.value)}
                  />
                )}
              </div>
            )}

            {/* Suggestions */}
            {schema.suggestions && schema.suggestions.length > 0 && (
              <div className="space-y-2 text-left pt-3 border-t border-[var(--border-base)]">
                <label className="text-[9px] font-mono uppercase tracking-[0.15em] text-[var(--text-secondary)] block font-bold">Dynamic Presets</label>
                <div className="flex flex-col gap-1.5">
                  {schema.suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInput1(item.p1);
                        if (item.p2) setInput2(item.p2);
                        if (item.p3) setInput3(item.p3);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-[var(--border-base)] text-[11px] text-[var(--text-secondary)] hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-all text-left truncate cursor-pointer font-sans font-medium"
                    >
                      💡 {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1 text-[11px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500">
              <span>Required Energy</span>
              <span className="text-brand dark:text-cyan-400">
                Cost: {
                  feature.id === 'ai-script-outline' ? 5 :
                  feature.id === 'shadowban-solutions' ? 4 :
                  ['scripts', 'competitor-analysis', 'trending', 'trending-topics', 'trend-alerts'].includes(feature.id) ? 3 :
                  ['content-ideas', 'thumbnails', 'daily-ideas'].includes(feature.id) ? 2 : 1
                } Credits
              </span>
            </div>

            <button 
              onClick={handleAction} 
              disabled={loading || !input1.trim()}
              className={cn(
                "w-full py-4 rounded-2xl text-white font-bold text-xs tracking-[0.15em] uppercase transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer disabled:opacity-40 disabled:pointer-events-none disabled:transform-none disabled:shadow-none",
                feature.themeColor.replace('text-', 'bg-')
              )}
            >
              {loading ? 'Synthesizing...' : `EXECUTE MODULE`}
            </button>
          </div>

          {feature.id === 'keyword-research' && input1 && (
            <KeywordTrendGraph difficulty={55} />
          )}
        </div>

        {/* RESULTS PANEL */}
        <div className="md:col-span-2 space-y-6 text-left">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl space-y-4 animate-pulse shadow-sm">
              <LoaderCircleIcon className={cn("w-10 h-10 animate-spin", feature.themeColor)} />
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--text-secondary)] font-bold">Processing Neural Pipeline...</p>
            </div>
          )}

          {!loading && !lastResponse && (
            <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)] border border-dashed border-[var(--border-base)] rounded-3xl text-center p-6 shadow-sm">
              <ZapIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
              <h4 className="text-[var(--text-primary)] font-bold text-sm mb-1 uppercase tracking-wide">Aether-Core Ready</h4>
              <p className="text-[var(--text-secondary)] text-xs max-w-sm leading-relaxed">
                Provide directive specifications in the left controller console and select execute to trigger neural analysis stream.
              </p>
            </div>
          )}

          {error && (
            <div className="p-5 bg-red-500/5 border border-red-500/15 rounded-2xl text-red-500 text-xs flex gap-3 items-start shadow-sm">
              <ShieldAlert className="shrink-0 mt-0.5" size={14} />
              <div>
                <p className="font-bold mb-1">System Interrupt Occurred</p>
                <p>{error.message || String(error)}</p>
              </div>
            </div>
          )}

          {lastResponse && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Specialized Widgets Integration */}
              {feature.id === 'scripts' && <ScriptPrompterWidget content={lastResponse.content} />}
              {feature.id === 'bio' && <ProfilePreviewWidget content={lastResponse.content} />}
              {feature.id === 'thumbnails' && <ThumbnailCanvasWidget content={lastResponse.content} />}
              {feature.id === 'engagement-calc' && <GrowthMathWidget content={lastResponse.content} />}
              {feature.id === 'trending' && <TrendMomentumTickerWidget content={lastResponse.content} />}
              {feature.id === 'personas' && <AudienceDossierWidget content={lastResponse.content} />}
              {feature.id === 'repurposing' && <RepurposePipelineWidget content={lastResponse.content} />}

              {/* Hashtag custom directory layout */}
              {feature.id === 'hashtags' && tagsList.length > 0 && (
                <div className="p-6 md:p-8 space-y-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-base)]">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-vibrant bg-purple-vibrant/10 px-2.5 py-1 rounded border border-purple-vibrant/20 uppercase tracking-widest">REAL-TIME HASHTAG DIRECTORY</span>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase mt-1">Arranged Viral Clusters ({tagsList.length} tags)</h3>
                    </div>
                    
                    <button
                      onClick={() => copySelectedHashtagsGroup()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto shadow-sm hover:shadow active:scale-98"
                    >
                      <Hash size={13} />
                      <span>{copiedAll ? '✓ All Copied' : 'Copy All'}</span>
                    </button>
                  </div>

                  <div className="flex bg-slate-50 dark:bg-slate-900 border border-[var(--border-base)] rounded-xl p-1 gap-1">
                    {['all', 'tier3', 'tier2', 'tier1'].map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setActiveTierFilter(tier as any)}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                          activeTierFilter === tier 
                            ? "bg-purple-vibrant text-white shadow-sm" 
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {tier === 'all' ? 'All' : tier === 'tier3' ? 'Viral' : tier === 'tier2' ? 'Growth' : 'Low Comp'}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {filteredTags.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyIndividualHashtag(t.tag)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-[var(--border-base)] hover:border-purple-500/30 text-xs font-mono font-bold text-[var(--text-primary)] hover:text-brand transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{t.tag}</span>
                        <span className="text-[9px] text-[var(--text-secondary)] bg-white/10 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          {copiedTag === t.tag ? '✓' : `${t.score}%`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Advisory transcription */}
              <div className="p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--border-base)] mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">Advisory Notes transcription</span>
                    {activeDocId && (
                      <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-semibold">Saved ✓</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Wrap Up Button */}
                    {activeDocId && (
                      <div className="relative">
                        <button
                          onClick={handleWrapUpAction}
                          disabled={isWrapping || !!currentMessageFromHistory?.wrappedUp}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border cursor-pointer transition-all disabled:opacity-50",
                            currentMessageFromHistory?.wrappedUp
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-brand/10 text-brand border-brand/20 hover:bg-brand/20"
                          )}
                        >
                          {isWrapping ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : currentMessageFromHistory?.wrappedUp ? (
                            <Check size={12} />
                          ) : (
                            <Zap size={11} />
                          )}
                          <span>{currentMessageFromHistory?.wrappedUp ? 'Wrapped Up' : 'Wrap Up (0.5c)'}</span>
                        </button>

                        <AnimatePresence>
                          {showDeductionAnim && (
                            <motion.span
                              initial={{ opacity: 0, y: 10, scale: 0.8 }}
                              animate={{ opacity: 1, y: -25, scale: 1.1 }}
                              exit={{ opacity: 0 }}
                              className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[9px] font-black text-red-500 font-mono tracking-wider pointer-events-none whitespace-nowrap bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded"
                            >
                              -0.5 CREDITS
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={handleCopyAction}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-[var(--border-base)] rounded-lg text-[10px] uppercase tracking-wider font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copied ? 'Copied ✓' : 'Copy'}</span>
                    </button>

                    {/* New Chat Button */}
                    <button
                      onClick={onNewChat}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-[var(--border-base)] rounded-lg text-[10px] uppercase tracking-wider font-bold text-red-500 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>New Chat</span>
                    </button>

                    {/* Original Actions */}
                    {actions(lastResponse)}

                    {bookContext?.onSendToBook && (
                      <button 
                        onClick={() => bookContext.onSendToBook?.(lastResponse.content, `${feature.label}: ${input1.slice(0, 15)}`)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-[var(--border-base)] rounded-lg text-[var(--text-secondary)] hover:text-brand transition-all cursor-pointer"
                        title="Send to Ruled Book"
                      >
                        <BookOpen size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Wrapped Up Bullet points display */}
                {currentMessageFromHistory?.wrappedUp && (
                  <div className="p-5 mb-6 bg-brand/5 border border-brand/10 rounded-2xl shadow-sm text-left relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="absolute top-0 right-0 p-3">
                      <Zap size={16} className="text-brand animate-pulse" />
                    </div>
                    <h4 className="text-xs font-mono font-bold text-brand uppercase tracking-[0.2em] mb-2.5">✓ 3-Bullet Strategic Wrap-Up</h4>
                    <ul className="space-y-2.5 font-sans text-xs text-[var(--text-secondary)]">
                      {currentMessageFromHistory.wrappedUp.split('\n').filter(l => l.trim()).slice(0, 3).map((bullet: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-1.5" />
                          <span>{bullet.replace(/^-\s*/, '').replace(/^\*\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="prose dark:prose-invert prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed font-sans max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                  <ReactMarkdown>{lastResponse.content}</ReactMarkdown>
                </div>
              </div>

              {/* --- NEURAL DIALOGUE HUB --- */}
              <div className="p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm relative overflow-hidden space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-base)]">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20 uppercase tracking-widest font-bold">Linguistic Co-Pilot Terminal</span>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase mt-1">Dialogue with {feature.persona || 'ChidonIQ Artificial Strategist'}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Live Feedback Link</span>
                  </div>
                </div>

                {/* Chat Message Thread */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {(messages || []).map((msg: any, idx: number) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div 
                        key={msg.id || idx} 
                        className={cn(
                          "flex gap-3 text-xs leading-relaxed max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                          isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        {/* Avatar bubble */}
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                          isUser 
                            ? "bg-slate-100 dark:bg-slate-800 border-[var(--border-base)] text-[var(--text-primary)]" 
                            : cn("bg-slate-50 dark:bg-slate-900 border-[var(--border-base)]", feature.themeColor)
                        )}>
                          {isUser ? <UserCircle size={14} /> : <feature.icon size={13} />}
                        </div>

                        {/* Text bubble */}
                        <div className={cn(
                          "p-3.5 rounded-2xl border text-left space-y-2 relative overflow-hidden shadow-sm w-full",
                          isUser 
                            ? "bg-slate-50 dark:bg-slate-900/50 border-[var(--border-base)] text-[var(--text-primary)] rounded-tr-none" 
                            : "bg-white dark:bg-[#0c1221] border-[var(--border-base)] text-[var(--text-secondary)] rounded-tl-none"
                        )}>
                          <div className="flex items-center justify-between gap-6 mb-1 border-b border-black/5 dark:border-white/5 pb-1">
                            <span className="font-mono text-[9px] uppercase tracking-wider font-bold">
                              {isUser ? 'Co-Pilot Directive' : (feature.persona || 'ChidonIQ Agent')}
                            </span>
                            <span className="text-[8px] text-slate-400 font-mono">
                              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          
                          <div className="prose dark:prose-invert prose-xs max-w-none">
                            {isUser && msg.content.includes(FORMATTING_PROTOCOL) ? (
                              <p className="font-mono text-[10px] text-brand/80">🚀 Initialized {feature.label} directive protocol with preset configurations.</p>
                            ) : (
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Response Suggestions */}
                <div className="space-y-1.5 text-left">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Refinement presets</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Make it punchier & shorten it",
                      "Translate the entire output to Spanish",
                      "Add high-CTR psychological triggers",
                      "Convert to TikTok & Reels script structure",
                      "Explain the key strategy behind this"
                    ].map((presetText) => (
                      <button
                        key={presetText}
                        type="button"
                        onClick={() => handleFollowUpSend(presetText)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-[var(--border-base)] hover:border-brand/30 hover:bg-brand/5 hover:text-brand text-[10px] text-[var(--text-secondary)] transition-all cursor-pointer font-sans font-medium"
                      >
                        ✨ {presetText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Control Box */}
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <textarea
                      placeholder={`Instruct ${feature.persona || 'AI'} to refine or customize...`}
                      rows={1}
                      className="flex-1 bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] rounded-xl px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand/15 transition-all text-xs font-sans text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleFollowUpSend();
                        }
                      }}
                    />
                    <button
                      onClick={() => handleFollowUpSend()}
                      disabled={loading || !followUpInput.trim()}
                      className={cn(
                        "px-4 rounded-xl text-white font-bold text-xs uppercase transition-all shadow-sm flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer gap-1.5",
                        feature.themeColor.replace('text-', 'bg-')
                      )}
                    >
                      <MessageSquare size={14} />
                      <span>Send</span>
                    </button>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase text-right tracking-wider pr-1">
                    Dialogue Run Cost: {
                      feature.id === 'ai-script-outline' ? 5 :
                      feature.id === 'shadowban-solutions' ? 4 :
                      ['scripts', 'competitor-analysis', 'trending', 'trending-topics', 'trend-alerts'].includes(feature.id) ? 3 :
                      ['content-ideas', 'thumbnails', 'daily-ideas'].includes(feature.id) ? 2 : 1
                    } Credits
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* History Sidebar Integration */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        messages={chatMessages}
        loading={loadingHistory}
        onSelect={onLoadHistoryItem}
        onWrapUp={(msg: any) => onWrapUpMessage(feature.id, msg.id, msg.result, credits)}
        onDelete={onDeleteMessage}
        credits={credits}
      />

    </div>
  );
}

// Simple fallback icons
function LoaderCircleIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ZapIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
