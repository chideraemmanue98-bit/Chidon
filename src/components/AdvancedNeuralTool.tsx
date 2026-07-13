import { useState, useEffect, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
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
  Trash2
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
import { cn, getCleanFeatureLabel } from '../lib/utils';
import { BookContext } from '../lib/contexts';

import { 
  ScriptPrompterWidget, 
  ProfilePreviewWidget, 
  ThumbnailCanvasWidget, 
  GrowthMathWidget, 
  TrendMomentumTickerWidget, 
  AudienceDossierWidget, 
  RepurposePipelineWidget,
  ViralIdeaCardDeckWidget,
  NarrativeArchitectBlueprintWidget,
  HeadlineCTRVisualizerWidget,
  KeywordIntelligenceMatrixWidget,
  LiveVideoFeedPreviewWidget,
  MetadataAABenchmarkWidget,
  SemanticTagCloudWidget,
  WeeklyPostingHeatmapWidget,
  GlobalPostingTimeClockWidget,
  DynamicAuditScorecardWidget
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

// --- FEATURE DYNAMIC IMAGES MAPPING ---
const FEATURE_IMAGES: Record<string, { src: string, alt: string, badge: string, subtitle: string }> = {
  'keyword-research': {
    src: '/src/assets/images/keyword_intel_radar_1783488604768.jpg',
    alt: 'Keyword Intel Radar Core',
    badge: 'Radar Nodes Sync Active',
    subtitle: 'Volumetric Keyword Vector Map'
  },
  'vseo-keywords': {
    src: '/src/assets/images/keyword_intel_radar_1783488604768.jpg',
    alt: 'Keyword Intel Radar Core',
    badge: 'Radar Nodes Sync Active',
    subtitle: 'Volumetric Keyword Vector Map'
  },
  'content-ideas': {
    src: '/src/assets/images/chidon_iq_dashboard_v4_1783388097105.jpg',
    alt: 'Creative Analytics Node Map',
    badge: 'Creative Engine Link Live',
    subtitle: 'High-Velocity Format Synthesizer'
  },
  'scripts': {
    src: '/src/assets/images/template_wireframe_1783490763717.jpg',
    alt: 'Script Outline Matrix Block',
    badge: 'Script Matrix Synthesizer',
    subtitle: 'Pattern-Interrupted Script Architecture'
  },
  'ai-script-outline': {
    src: '/src/assets/images/template_wireframe_1783490763717.jpg',
    alt: 'Script Outline Matrix Block',
    badge: 'Script Matrix Synthesizer',
    subtitle: 'Pattern-Interrupted Script Architecture'
  },
  'bio': {
    src: '/src/assets/images/chidon_iq_strategy_v4_1783388126590.jpg',
    alt: 'Audience Psychographics Vector Map',
    badge: 'Bio Converter Protocol',
    subtitle: 'Identity Matrix Positioning Core'
  },
  'personas': {
    src: '/src/assets/images/chidon_iq_strategy_v4_1783388126590.jpg',
    alt: 'Audience Psychographics Vector Map',
    badge: 'Psychographic Ingress Active',
    subtitle: 'Fictional Persona Matrix Constructor'
  },
  'thumbnails': {
    src: '/src/assets/images/chidon_iq_engine_v4_1783388111932.jpg',
    alt: 'High-Contrast Thumbnail Layout Preview',
    badge: 'Visual Psychology Core',
    subtitle: 'Click-Friction Concept Canvas'
  },
  'vseo-scorecard': {
    src: '/src/assets/images/chidon_iq_engine_v4_1783388111932.jpg',
    alt: 'High-Contrast Thumbnail Layout Preview',
    badge: 'Visual Psychology Core',
    subtitle: 'Click-Friction Concept Canvas'
  },
  'competitor-analysis': {
    src: '/src/assets/images/seo_analytics_vector_1783490751280.jpg',
    alt: 'Global Node Market Matrix Analytics',
    badge: 'Market Lab Monitor',
    subtitle: 'Strategic Pillar Positioning Map'
  },
  'hashtags': {
    src: '/src/assets/images/chidon_iq_dashboard_1783387455047.jpg',
    alt: 'Global Hashtag Rank Tiers Scanner',
    badge: 'Linguistic Engine Ingress',
    subtitle: 'Reach Tiers Compression Matrix'
  },
  'vseo-tags': {
    src: '/src/assets/images/chidon_iq_dashboard_1783387455047.jpg',
    alt: 'Global Hashtag Rank Tiers Scanner',
    badge: 'Linguistic Engine Ingress',
    subtitle: 'Reach Tiers Compression Matrix'
  },
  'repurposing': {
    src: '/src/assets/images/chidon_iq_engine_1783387464624.jpg',
    alt: 'Multi-Platform Repurpose Signal Matrix',
    badge: 'Signal Splitter Synced',
    subtitle: 'Multi-Channel Narrative Transformer'
  },
  'posting-schedule': {
    src: '/src/assets/images/empty_scheduler_1781319203016.jpg',
    alt: 'Temporal Optimization Dispatch Calendar',
    badge: 'Temporal Grid Synthesizer',
    subtitle: 'Optimized Content Dispersion Matrix'
  },
  'vseo-best-time': {
    src: '/src/assets/images/empty_scheduler_1781319203016.jpg',
    alt: 'Temporal Optimization Dispatch Calendar',
    badge: 'Temporal Grid Synthesizer',
    subtitle: 'Optimized Content Dispersion Matrix'
  },
  'engagement-calc': {
    src: '/src/assets/images/chidon_iq_strategy_1783387475441.jpg',
    alt: 'Sovereign Creator Growth Calculator Map',
    badge: 'Growth Calculus Model',
    subtitle: '30-Day Conversion Acceleration Curve'
  },
  'headlines': {
    src: '/src/assets/images/dashboard_hero_banner_1783488577319.jpg',
    alt: 'Catchy Headlines Click Matrix',
    badge: 'Attention Core Ingress',
    subtitle: 'Friction-Based Click Magnet Hook Formulas'
  },
  'shadowban-solutions': {
    src: '/src/assets/images/shadowban_diagnostic_vector_1783488589558.jpg',
    alt: 'Anti-Shadowban Diagnostics Shield',
    badge: 'Shield Diagnostics Active',
    subtitle: 'Compliance Scan Visualizer Node'
  }
};

// --- MAIN UNIFIED COMPONENT ---
export default function AdvancedNeuralTool({ feature, onGenerate, messages, loading, error, onGenerateFeedback, onSaveDraft, onBack, onDeleteMessage, onClearAllChatData }: any) {
  const { t } = useTranslation();
  const bookContext = useContext(BookContext);
  
  // Retrieve config schema
  const schema = SCHEMAS[feature.id] || {
    p1Label: 'Neural Directive',
    p2Label: 'Additional Context',
    p1Placeholder: `Describe your target for ${getCleanFeatureLabel(feature.label).toLowerCase()}...`,
    p2Placeholder: 'Optional tactical focus notes...',
    suggestions: [],
    buildPrompt: (p1, p2) => `Analyze and provide expert social media advice for: "${p1}" in the context of ${getCleanFeatureLabel(feature.label)}. Additional detail: "${p2}".`
  };

  const [input1, setInput1] = useState(() => {
    try {
      return localStorage.getItem(`chidon_draft_input1_${feature.id}`) || '';
    } catch {
      return '';
    }
  });
  const [input2, setInput2] = useState(() => {
    try {
      return localStorage.getItem(`chidon_draft_input2_${feature.id}`) || '';
    } catch {
      return '';
    }
  });
  const [input3, setInput3] = useState(() => {
    try {
      return localStorage.getItem(`chidon_draft_input3_${feature.id}`) || '';
    } catch {
      return '';
    }
  });
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | 'tier1' | 'tier2' | 'tier3'>('all');
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Load states on feature switch
  useEffect(() => {
    try {
      const saved1 = localStorage.getItem(`chidon_draft_input1_${feature.id}`) || '';
      const saved2 = localStorage.getItem(`chidon_draft_input2_${feature.id}`) || (schema.p2Type === 'select' && schema.p2Options ? schema.p2Options[0] : '');
      const saved3 = localStorage.getItem(`chidon_draft_input3_${feature.id}`) || (schema.p3Type === 'select' && schema.p3Options ? schema.p3Options[0] : '');
      setInput1(saved1);
      setInput2(saved2);
      setInput3(saved3);
    } catch (e) {
      console.error(e);
    }
  }, [feature.id]);

  // Periodic Auto-Save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(`chidon_draft_input1_${feature.id}`, input1);
        localStorage.setItem(`chidon_draft_input2_${feature.id}`, input2);
        localStorage.setItem(`chidon_draft_input3_${feature.id}`, input3);
        
        setIsAutoSaving(true);
        const timer = setTimeout(() => setIsAutoSaving(false), 2000);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error("AdvancedNeuralTool auto-save failed:", e);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [input1, input2, input3, feature.id]);

  const handleClearInputs = () => {
    setInput1('');
    setInput2(schema.p2Type === 'select' && schema.p2Options ? schema.p2Options[0] : '');
    setInput3(schema.p3Type === 'select' && schema.p3Options ? schema.p3Options[0] : '');
    try {
      localStorage.removeItem(`chidon_draft_input1_${feature.id}`);
      localStorage.removeItem(`chidon_draft_input2_${feature.id}`);
      localStorage.removeItem(`chidon_draft_input3_${feature.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = () => {
    if (!input1.trim()) return;
    let prompt = schema.buildPrompt(input1, input2, input3);
    prompt += FORMATTING_PROTOCOL;
    onGenerate(prompt, `${getCleanFeatureLabel(feature.label)} scan for: ${input1.slice(0, 30)}...`);
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
        onClick={() => onSaveDraft(feature.id, msg.content, `${getCleanFeatureLabel(feature.label)}: ${input1.slice(0, 20)}`)}
        className={cn("flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all text-[10px] uppercase tracking-[0.2em] font-black cursor-pointer")}
      >
        <BookOpen size={14} /> Vault
      </button>
    </>
  );

  const lastResponse = messages && messages.slice().reverse().find((m: any) => m.role === 'assistant');

  // Group messages into pairs (User query + Assistant response)
  const chatSessions = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    const sessions: { id: string; userMsg: any; assistantMsg: any }[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'user') {
        const next = messages[i + 1];
        if (next && next.role === 'assistant') {
          sessions.push({
            id: next.id,
            userMsg: messages[i],
            assistantMsg: next
          });
        } else {
          sessions.push({
            id: messages[i].id,
            userMsg: messages[i],
            assistantMsg: null
          });
        }
      }
    }
    return sessions.reverse();
  }, [messages]);

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
        <span className={cn("text-[9px] font-mono uppercase tracking-[0.2em]", feature.themeColor)}>
          {feature.persona || 'ChidonIQ Artificial Strategist'}
        </span>
      </div>
      
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
                <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">{getCleanFeatureLabel(feature.label)}</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-mono tracking-wider">NODE CONTROL</p>
              </div>
            </div>

            {/* Feature Banner Image */}
            {feature.imageUrl && (
              <div className="w-full h-32 rounded-2xl overflow-hidden border border-[var(--border-base)] relative group shadow-inner shrink-0">
                <img 
                  src={feature.imageUrl} 
                  alt={getCleanFeatureLabel(feature.label)} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-3">
                  <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest bg-black/70 px-2 py-0.5 rounded border border-white/10">
                    {feature.persona}
                  </span>
                </div>
              </div>
            )}

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

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                {isAutoSaving ? (
                  <span className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span>Auto-saved progress</span>
                  </span>
                ) : (
                  <span>Auto-saves every 30s</span>
                )}
              </span>
              {(input1 || input2 || input3) && (
                <button
                  type="button"
                  onClick={handleClearInputs}
                  className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors font-bold cursor-pointer uppercase text-[9px] tracking-wider"
                >
                  Clear Draft
                </button>
              )}
            </div>
          </div>

          {FEATURE_IMAGES[feature.id] && (
            <div className="rounded-3xl overflow-hidden border border-[var(--border-base)] shadow-sm bg-slate-900 aspect-[4/3] relative group">
              <img 
                src={FEATURE_IMAGES[feature.id].src} 
                alt={FEATURE_IMAGES[feature.id].alt} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5 text-left">
                <div className="space-y-1">
                  <span className={cn(
                    "text-[9px] font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded border uppercase tracking-wider",
                    feature.themeColor,
                    feature.themeColor.replace('text-', 'border-').concat('/25')
                  )}>
                    {FEATURE_IMAGES[feature.id].badge}
                  </span>
                  <p className="text-[10px] text-slate-300 font-medium">{FEATURE_IMAGES[feature.id].subtitle}</p>
                </div>
              </div>
            </div>
          )}

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
              <CpuIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
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
              {feature.id === 'content-ideas' && <ViralIdeaCardDeckWidget content={lastResponse.content} />}
              {feature.id === 'ai-script-outline' && <NarrativeArchitectBlueprintWidget content={lastResponse.content} />}
              {feature.id === 'headlines' && <HeadlineCTRVisualizerWidget content={lastResponse.content} />}
              {(feature.id === 'keyword-research' || feature.id === 'vseo-keywords') && <KeywordIntelligenceMatrixWidget content={lastResponse.content} />}
              {feature.id === 'youtube-seo' && <LiveVideoFeedPreviewWidget content={lastResponse.content} />}
              {feature.id === 'vseo-title-desc' && <MetadataAABenchmarkWidget content={lastResponse.content} />}
              {feature.id === 'vseo-tags' && <SemanticTagCloudWidget content={lastResponse.content} />}
              {feature.id === 'posting-schedule' && <WeeklyPostingHeatmapWidget content={lastResponse.content} />}
              {(feature.id === 'post-optimizer' || feature.id === 'vseo-best-time') && <GlobalPostingTimeClockWidget content={lastResponse.content} />}
              {(feature.id === 'seo-scorecard' || feature.id === 'vseo-scorecard') && <DynamicAuditScorecardWidget content={lastResponse.content} />}

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
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-base)] mb-6">
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">Advisory Notes transcription</span>
                  <div className="flex items-center gap-2">
                    {actions(lastResponse)}
                    {bookContext?.onSendToBook && (
                      <button 
                        onClick={() => bookContext.onSendToBook?.(lastResponse.content, `${getCleanFeatureLabel(feature.label)}: ${input1.slice(0, 15)}`)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-[var(--border-base)] rounded-lg text-[var(--text-secondary)] hover:text-brand transition-all cursor-pointer"
                        title="Send to Ruled Book"
                      >
                        <BookOpen size={14} />
                      </button>
                    )}
                    {onDeleteMessage && (
                      <button 
                        onClick={() => onDeleteMessage(feature.id, lastResponse.id)}
                        className="p-2 bg-slate-50 hover:bg-red-500/10 hover:text-red-500 dark:bg-slate-800 dark:hover:bg-red-500/10 border border-[var(--border-base)] rounded-lg text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                        title="Delete this chat session"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="markdown-body prose dark:prose-invert prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed font-sans max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                  <ReactMarkdown>{lastResponse.content}</ReactMarkdown>
                </div>
              </div>

              {/* Saved History & Previous Sessions Section */}
              {chatSessions.length > 1 && (
                <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl shadow-sm space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-base)]">
                    <div className="flex items-center gap-2">
                      <HistoryIcon size={16} className={feature.themeColor} />
                      <h3 className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">Saved Session Logs ({chatSessions.length - 1} saved)</h3>
                    </div>
                    {onClearAllChatData && (
                      <button
                        onClick={() => onClearAllChatData(feature.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-500 rounded-xl text-[10px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Wipe all saved chats for this feature to free up space"
                      >
                        <Trash2 size={12} />
                        <span>Clear All Data</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {chatSessions.slice(1).map((session) => {
                      const timestampStr = session.userMsg.timestamp instanceof Date 
                        ? session.userMsg.timestamp.toLocaleString() 
                        : new Date(session.userMsg.timestamp).toLocaleString();

                      return (
                        <div key={session.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-[var(--border-base)] rounded-2xl space-y-3 relative group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-slate-400 block">{timestampStr}</span>
                              <p className="text-xs font-semibold text-[var(--text-primary)] leading-normal italic">
                                &ldquo;{session.userMsg.content}&rdquo;
                              </p>
                            </div>
                            {onDeleteMessage && (
                              <button
                                onClick={() => onDeleteMessage(feature.id, session.assistantMsg?.id || session.userMsg.id)}
                                className="p-1.5 bg-slate-100 hover:bg-red-500 dark:bg-slate-800 dark:hover:bg-red-500 text-slate-400 hover:text-white border border-[var(--border-base)] rounded-lg transition-all cursor-pointer shadow-sm"
                                title="Delete this session from history"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {session.assistantMsg && (
                            <div className="pt-3 border-t border-[var(--border-base)]/60">
                              <div className="markdown-body prose dark:prose-invert prose-xs max-w-none text-[var(--text-secondary)] leading-relaxed font-sans max-h-48 overflow-y-auto pr-1.5 custom-scrollbar">
                                <ReactMarkdown>{session.assistantMsg.content}</ReactMarkdown>
                              </div>
                              
                              {/* Mini actions for previous session */}
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border-base)]/40">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(session.assistantMsg.content);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all text-[9px] font-mono uppercase tracking-wider font-bold cursor-pointer border border-white/5"
                                >
                                  <Copy size={10} /> Copy
                                </button>
                                <button
                                  onClick={() => onSaveDraft(feature.id, session.assistantMsg.content, `${getCleanFeatureLabel(feature.label)}: ${session.userMsg.content.slice(0, 20)}`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all text-[9px] font-mono uppercase tracking-wider font-bold cursor-pointer border border-white/5"
                                >
                                  <BookOpen size={10} /> Vault
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

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

function CpuIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M20 9h3" />
      <path d="M20 15h3" />
      <path d="M1 9h3" />
      <path d="M1 15h3" />
    </svg>
  );
}
