import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, Wand2, ArrowLeft, Check, Loader2, 
  Share2, Copy, Save, Calendar, Clock, User, Zap, Brain, 
  Target, ChevronRight, MessageSquare, Terminal, Eye, PenTool
} from 'lucide-react';

interface ChidonIqBlogProps {
  onSaveDraft?: (featureId: string, content: string, title: string) => Promise<void>;
  onBack?: () => void;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
}

const PRE_CURATED_BLOGS: BlogPost[] = [
  {
    id: 'intel-1',
    title: 'The 2026 Social Curation Paradox: How Chidon IQ Outpaces Recommendation Graphs',
    excerpt: 'Platform algorithms are undergoing historic structural shifts. Discover how neuromorphic indexing and Chidon IQ allow creators to command feeds natively.',
    category: 'Algorithms & Core Strategy',
    readTime: '4 min read',
    date: 'June 10, 2026',
    author: 'Chief Intelligence Architect',
    tags: ['Algorithms', 'Neuromorphic', 'Feeds', 'CTR'],
    image: '/src/assets/images/shadowban_diagnostic_vector_1783488589558.jpg',
    content: `### The Collapse of the Follower Graph

For over a decade, social platforms thrived on the traditional follower model. You followed a brand, and your feed displayed their content. Today, that graph is virtually dead. It has been replaced by **Interest-based Recommendation Core engines (neuromorphic sorting vectors)**.

Platforms like TikTok, Instagram, and YouTube no longer care who is subscribed to you. Instead, they rank individual pieces of content through dynamic micro-batches:

1. **Phase 1 (Ingress)**: The post is shown to 100 highly active users in your niche folder.
2. **Phase 2 (The 3-Second Filter)**: If the retention curve drops below 40% before the 3-second mark, distribution freezes.
3. **Phase 3 (Amplification)**: If engagement metrics exceed outlier indexes, it matches macro-interest clusters.

### How Chidon IQ Rewrites the Rules

Chidon IQ does not play the saturation game. It actively intervenes in **Phase 2** by compiling high-friction, psychological narrative anchors. Our platform leverages the **Open-Loop Cognitive Formula** to build scripts that require resolution:

*   **Standard Hook**: "Here is how I grew my retail store..." (Fails Phase 2)
*   **Chidon IQ Neuro Hook**: "I watched 400 retailers burn $10,000 before discovering this singular, 12-word bio layout modification..." (Succeeds Phase 2)

By injecting strategic contrast ratios, exact typography guides, and tailored niche briefs immediately based on Advanced AI intelligence, Chidon IQ stabilizes early retention curves, allowing creators to consistently bypass standard algorithmic throttles.`
  },
  {
    id: 'intel-2',
    title: 'Behavioral Hooks: Retaining 72%+ Viewers Within the Critical Attention Gate',
    excerpt: 'Unpack the human eye behavior tracking data. Use psychological triggers to maintain visual tension and dramatic buy-in.',
    category: 'Neuromorphic Growth',
    readTime: '6 min read',
    date: 'June 08, 2026',
    author: 'Visual Cognition Expert',
    tags: ['Psychology', 'Audience Retention', 'Visual Design'],
    image: '/src/assets/images/chidon_iq_strategy_v4_1783388126590.jpg',
    content: `### The Neurological Gatekeepers
    
The modern human attention span does not suffer from simple exhaustion; it has evolved a highly sensitive **redundand-content filter**. The visual cortex processes visual layout cues in less than 80 milliseconds. If it recognizes a standard recycled frame pattern or overproduced corporate format, it forces the user to flick upwards instinctively.

To cross this visual threshold safely, your content must leverage **tactical visual contrast and psychological tension**.

| Metric | Recycled Format | Chidon IQ Synthesized |
| :--- | :---: | :---: |
| **First-Second Bounce** | 68% Dismissal | 12% Dismissal |
| **Middle-Section Completion** | 22% Completion | 64% Completion |
| **Conversion Action Lift** | +12% | +240% |

### The Chidon Cognitive Retention Framework

Our research outlines a three-part structural pillar to resolve attention decay:

#### 1. The Negative Frame Setup
Humans are biologically wired to avoid threat zones rather than seek gains. Always structure early scripts through scarcity or mistake-avoidance layouts. Specify what users will **lose** or **reveal** rather than what they will simply "learn".

#### 2. Pattern Interrupt Matrices
At the 4, 12, and 24-second intervals of an interactive script, inject immediate sensory shifts. This can include precise typographical placement, localized vocabulary accents, or structural questions that demand immediate mental categorization.

#### 3. Single-Link Gateway Systems
A common failure in viral growth is call-to-action dispersion. Requesting likes, follows, comments, and newsletter signups simultaneously fractures cognitive focus. Direct all engagement variables downward into a single, high-fidelity landing zone.`
  },
  {
    id: 'intel-3',
    title: 'The Decentralized Freelance Economy: Building Wealth with the Chidon Earn Portal',
    excerpt: 'Unleashing creative equity. Discover how global creators are packaging content deliverables as elite algorithmic service products.',
    category: 'Creative Capital',
    readTime: '5 min read',
    date: 'June 02, 2026',
    author: 'Freelance Logistics Officer',
    tags: ['Gigs', 'Decentralization', 'Earn', 'Wealth'],
    image: '/src/assets/images/empty_earned_1781319231364.jpg',
    content: `### The Creator Deliverable Redefined

Over 70% of businesses actively seek custom creative positioning, yet they lack the specialized technical knowledge to execute high-retention video formats or SEO matrices themselves. Simply offering to "write captions" or "make posts" is a race to bottom-tier pricing.

The secret to command high-ticket retainer contracts is packaging your output as **Data-Validated Algorithmic Assets**.

### Transitioning to Elite Gig Dispatching

Instead of standard, manual writing, creators using the **Chidon Earn Portal** package their services into strategic capsules:

1.  **Metric-Driven Positioning**: Sell "Retention Script Packs" backed by calculated 30-day psychological targets.
2.  **SEO Title Maps**: Deliver structured comparative keyword briefs built through Chidon IQ's advanced YouTube & platform scraper layers.
3.  **Encapsulated Local Vault Sync**: Share ready-to-use content packages with client networks directly, preventing platform formatting corruption.

By operating with professional, clinical precision rather than guesswork, freelance consultants using Chidon IQ have scaled average contract values by **+180%**, demonstrating that digital assets are the ultimate sovereign equity of today's social economy.`
  }
];

export const ChidonIqBlog: React.FC<ChidonIqBlogProps> = ({ onSaveDraft, onBack }) => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'feed' | 'synthesizer'>('feed');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Synthesizer State
  const [synthTopic, setSynthTopic] = useState('');
  const [synthPlatform, setSynthPlatform] = useState('TikTok & Reels');
  const [synthTone, setSynthTone] = useState('Tactical Blueprint');
  const [synthAudience, setSynthAudience] = useState('SaaS Founders & Creators');
  const [synthLength, setSynthLength] = useState('Comprehensive (~500 words)');
  
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedToVault, setSavedToVault] = useState(false);

  // Consult AI state
  const [consultQuestion, setConsultQuestion] = useState('');
  const [consultAnswer, setConsultAnswer] = useState('');
  const [consultLoading, setConsultLoading] = useState(false);

  const triggerSynthesis = async () => {
    if (!synthTopic.trim()) return;
    setGenerating(true);
    setErrorStatus('');
    setGeneratedBlog('');
    setSavedToVault(false);
    
    try {
      const prompt = `Act as Chidon IQ Principal Social Analyst & Editorial Elite.
      Synthesize a ready-to-publish, top-tier, structured tactical blog post.
      Topic: "${synthTopic}"
      Primary Target Platform: "${synthPlatform}"
      Style/Tone: "${synthTone}"
      Target Audience: "${synthAudience}"
      Target Depth: "${synthLength}"

      Ensure output is written with pristine professional layout:
      1. Include a catchy premium title at the beginning starting with "# Title: [Title]"
      2. Set a modern introductory meta header detailing Category, Read time, and Author: "Category: Social Intelligence | 5 min read | Synthesized by Chidon IQ".
      3. Use structured markdown elements, bold headers, and include at least one beautifully aligned Markdown comparative metric table.
      4. Inject exactly 3 actionable technical guidelines structured with bold key blocks.
      5. Sound highly authoritative, strategic, and practical. Avoid marketing fluff or generic templates. Ensure all contents are localized and clean in direct human prose.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, language: i18n.language }),
      });

      if (!response.ok) {
        throw new Error("Chidon node network timed out or generated empty tokens.");
      }

      const data = await response.json();
      if (data && data.text) {
        // Strip out any # Title prefix to store title separately from core body
        const rawText = data.text;
        let titleLine = `Viral Index: ${synthTopic}`;
        let blogBody = rawText;

        const titleMatch = rawText.match(/#\s*Title:\s*(.*)/i) || rawText.match(/Title:\s*(.*)/i);
        if (titleMatch && titleMatch[1]) {
          titleLine = titleMatch[1].trim();
          blogBody = rawText.replace(titleMatch[0], '').trim();
        }

        setGeneratedTitle(titleLine);
        setGeneratedBlog(blogBody);
      } else {
        throw new Error("Empty token response synthesized by Linguistic Optimizer Core.");
      }
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to align synthesis grid. Check your connection.");
    } finally {
      setGenerating(false);
    }
  };

  const executeConsultation = async (blogPostTitle: string) => {
    if (!consultQuestion.trim()) return;
    setConsultLoading(true);
    setConsultAnswer('');
    
    try {
      const prompt = `Act as Chidon IQ Elite Strategist.
      The user is studying your certified piece of intelligence: "${blogPostTitle}".
      They asked the following question: "${consultQuestion}".
      Provide an immediate, authoritative, 2-bullet tactical response helping them maximize CTR or brand execution immediately on their channel. Be precise, short, and direct. Max 100 words.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, language: i18n.language }),
      });

      if (response.ok) {
        const data = await response.json();
        setConsultAnswer(data.text || "Consultation complete.");
      } else {
        setConsultAnswer("Central node returned empty payload.");
      }
    } catch {
      setConsultAnswer("Failed to establish secure consultation connection.");
    } finally {
      setConsultLoading(false);
    }
  };

  const copyToClipboard = () => {
    const fullText = `# ${generatedTitle}\n\n${generatedBlog}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToChidonVault = async () => {
    if (!onSaveDraft || !generatedBlog) return;
    try {
      await onSaveDraft('ruled-book', `# ${generatedTitle}\n\n${generatedBlog}`, `Blog: ${generatedTitle}`);
      setSavedToVault(true);
    } catch (err) {
      console.error("Failed to commit blog draft:", err);
    }
  };

  return (
    <div className="space-y-6 select-text">
      
      {/* Header and Brand Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-base)] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-primary shrink-0">
            <BookOpen size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase font-extrabold">CHIDON INTEL REPOSITORY</span>
              <span className="text-[8px] font-mono bg-cyan-500/15 text-cyan-500 border border-cyan-500/20 px-1.5 py-0.2 rounded font-black uppercase">LIVE GATEWAY</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-extrabold text-[var(--text-primary)] tracking-tight">
              Chidon IQ Gazette & Strategic Intel
            </h2>
          </div>
        </div>

        {/* Back navigation button */}
        {onBack && (
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900 border border-[var(--border-base)] rounded-xl text-xs font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Hub</span>
          </button>
        )}
      </div>

      {/* Workspace Menu Tabs */}
      {!selectedPost && (
        <div className="flex border-b border-[var(--border-base)] gap-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-3 text-xs font-mono uppercase tracking-widest border-b-2 font-black transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-primary'
                : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
            }`}
          >
            📬 Intelligence Feed
          </button>
          <button
            onClick={() => setActiveTab('synthesizer')}
            className={`pb-3 text-xs font-mono uppercase tracking-widest border-b-2 font-black transition-all cursor-pointer ${
              activeTab === 'synthesizer'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-primary animate-pulse'
                : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
            }`}
          >
            🧠 Linguistic Optimizer Core Synthesizer
          </button>
        </div>
      )}

      {/* Main Panel Area */}
      <div className="min-h-[400px]">
        {selectedPost ? (
          /* View individual blog post detailing social media influence */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <button
              onClick={() => { setSelectedPost(null); setConsultAnswer(''); setConsultQuestion(''); }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-600 dark:text-cyan-primary hover:underline font-bold pb-2 cursor-pointer"
            >
              <ArrowLeft size={13} /> Return to Intel Feed
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Blog Article Core Body */}
              <div className="lg:col-span-8 card-base p-6 md:p-8 border-2 border-[var(--border-base)] bg-[var(--bg-card)] rounded-2xl space-y-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
                
                {/* Beautiful Banner Image */}
                <div className="w-full h-48 rounded-xl overflow-hidden border border-[var(--border-base)] relative group shadow-md mb-4">
                  <img 
                    src={selectedPost.image || "/src/assets/images/seo_analytics_vector_1783490751280.jpg"} 
                    alt={selectedPost.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 bg-slate-950/80 px-2.5 py-0.5 rounded border border-cyan-500/25 uppercase tracking-wider">
                      Neural Analytics Hub Stream
                    </span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-primary bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedPost.category}</span>
                  <h1 className="text-xl md:text-3xl font-display font-black text-[var(--text-primary)] tracking-tight leading-snug">
                    {selectedPost.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1"><User size={12} /> {selectedPost.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {selectedPost.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {selectedPost.readTime}</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-[var(--border-base)]" />

                {/* Main Text Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-[var(--text-secondary)] leading-relaxed space-y-4">
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedPost.tags.map(t => (
                    <span key={t} className="text-[9px] font-mono bg-slate-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md text-slate-400">#{t}</span>
                  ))}
                </div>
              </div>

              {/* Sidebar consultation interactive segment */}
              <div className="lg:col-span-4 space-y-4">
                <div className="card-base p-5 border-2 border-[var(--border-base)] bg-slate-50 dark:bg-zinc-900/30 rounded-2xl space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <Brain size={18} className="text-cyan-500 shrink-0" />
                    <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[var(--text-primary)]">Consult Core Expert</h3>
                  </div>
                  
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    Ask our AI Assistant to translate this article's raw facts into your immediate niche goals.
                  </p>

                  <div className="space-y-2.5">
                    <textarea
                      placeholder="e.g. How do I apply these 3-second neuromorphic hooks if my channel is about luxury espresso coffee?"
                      value={consultQuestion}
                      onChange={(e) => setConsultQuestion(e.target.value)}
                      className="w-full h-24 p-2.5 text-xs bg-[var(--bg-card)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-cyan-500 text-[var(--text-primary)] font-sans resize-none"
                    />
                    
                    <button
                      onClick={() => executeConsultation(selectedPost.title)}
                      disabled={consultLoading || !consultQuestion.trim()}
                      className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md disabled:opacity-50"
                    >
                      {consultLoading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Establishing Link...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={13} />
                          <span>Query Intelligence Advisor</span>
                        </>
                      )}
                    </button>
                  </div>

                  {consultAnswer && (
                    <div className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs text-[var(--text-primary)] leading-normal font-sans space-y-2 max-h-[160px] overflow-y-auto">
                      <div className="text-[8px] font-mono text-cyan-500 font-extrabold tracking-widest uppercase">CHIDON ADVICE RESPONSE</div>
                      <p className="whitespace-pre-wrap leading-relaxed">{consultAnswer}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        ) : activeTab === 'feed' ? (
          
          /* Show feed of curated industry-grade influence intelligence */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRE_CURATED_BLOGS.map((blog) => (
              <motion.div
                key={blog.id}
                whileHover={{ y: -4 }}
                className="card-base border-2 border-[var(--border-base)] bg-[var(--bg-card)] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
                onClick={() => setSelectedPost(blog)}
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="w-full h-32 overflow-hidden border-b border-[var(--border-base)] relative">
                    <img 
                      src={blog.image || "/src/assets/images/seo_analytics_vector_1783490751280.jpg"} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[8px] font-mono font-bold text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/25 uppercase tracking-wider">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{blog.date}</span>
                      <span>{blog.readTime}</span>
                    </div>

                    <h3 className="text-sm font-display font-black text-[var(--text-primary)] leading-snug tracking-tight group-hover:text-cyan-500 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 font-sans font-medium">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[var(--border-base)]/40 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{blog.author}</span>
                  <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Intel <ChevronRight size={14} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        ) : (

          /* Powerful AI Blog Synthesizer console */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Command Config Panel */}
            <div className="lg:col-span-4 card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] rounded-2xl text-left space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-base)]/60">
                <Terminal size={16} className="text-cyan-500" />
                <span className="text-[10px] font-mono font-black text-[var(--text-primary)] uppercase tracking-wider">Synthesis Console</span>
              </div>

              {/* Topic */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase block">Core Topic / Angle</label>
                <input
                  type="text"
                  placeholder="e.g. Why micro-vlogs convert sales"
                  value={synthTopic}
                  onChange={(e) => setSynthTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-cyan-500 text-[var(--text-primary)] font-sans"
                />
              </div>

              {/* Target Core Platform */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase block">Platform Channel</label>
                  <select
                    value={synthPlatform}
                    onChange={(e) => setSynthPlatform(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-cyan-500 text-[var(--text-primary)] font-sans"
                  >
                    <option value="TikTok & Reels">TikTok & Reels</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                    <option value="LinkedIn Post">LinkedIn Core</option>
                    <option value="Substack & Medium">Editorial Substack</option>
                    <option value="X Thread Matrix">X Thread Matrix</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase block">Tone / Voice</label>
                  <select
                    value={synthTone}
                    onChange={(e) => setSynthTone(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-cyan-500 text-[var(--text-primary)] font-sans"
                  >
                    <option value="Tactical Blueprint">Tactical Blueprint</option>
                    <option value="High-Energy Viral">High-Energy Viral</option>
                    <option value="Clinically Professional">Clinical & Professional</option>
                    <option value="Neuromorphic Hacker">Neuromorphic Hacker</option>
                  </select>
                </div>
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase block">Target Audience Segments</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Watch Buyers, Ecom Brand Owners"
                  value={synthAudience}
                  onChange={(e) => setSynthAudience(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-cyan-500 text-[var(--text-primary)] font-sans"
                />
              </div>

              {/* Depth Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase block">Article Depth Target</label>
                <select
                  value={synthLength}
                  onChange={(e) => setSynthLength(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-cyan-500 text-[var(--text-primary)] font-sans"
                >
                  <option value="Concise (~250 words)">Concise (~250 words)</option>
                  <option value="Comprehensive (~500 words)">Comprehensive (~500 words)</option>
                  <option value="In-depth Manual (~800 words)">In-depth Manual (~800 words)</option>
                </select>
              </div>

              {/* Trigger button */}
              <button
                onClick={triggerSynthesis}
                disabled={generating || !synthTopic.trim()}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                {generating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Engaging chidoniq core...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={14} />
                    <span>Synthesize High-Traction Post</span>
                  </>
                )}
              </button>

              {errorStatus && (
                <div className="p-3 text-xs font-mono text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl text-center font-bold">
                  {errorStatus}
                </div>
              )}
            </div>

            {/* Synthesized Output Display Viewport */}
            <div className="lg:col-span-8 card-base border-2 border-[var(--border-base)] bg-[var(--bg-card)] rounded-2xl min-h-[440px] flex flex-col justify-stretch overflow-hidden relative">
              <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

              {generatedBlog ? (
                /* Generated results loaded viewport */
                <div className="flex flex-col h-full justify-between flex-1">
                  
                  {/* Result Header actions bar */}
                  <div className="p-4 border-b border-[var(--border-base)] flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">REAL-TIME INTEL SYNTHESIS SUCCESS</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Copy */}
                      <button
                        onClick={copyToClipboard}
                        className="p-2 bg-slate-100 dark:bg-zinc-800 border border-[var(--border-base)] rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* Store in Vault */}
                      {onSaveDraft && (
                        <button
                          onClick={saveToChidonVault}
                          disabled={savedToVault}
                          className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-600 dark:text-cyan-primary hover:bg-cyan-500/20 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                          title="Commit to Chidon Vault"
                        >
                          <Save size={13} />
                          <span>{savedToVault ? 'Stored in Vault' : 'Store in Vault'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content output container viewport */}
                  <div className="p-6 md:p-8 text-left space-y-4 max-h-[460px] overflow-y-auto custom-scrollbar prose prose-slate dark:prose-invert max-w-none text-sm text-[var(--text-secondary)] leading-relaxed">
                    <h1 className="text-xl md:text-2xl font-display font-black text-[var(--text-primary)] tracking-tight leading-snug border-b pb-4">
                      {generatedTitle}
                    </h1>
                    <ReactMarkdown>{generatedBlog}</ReactMarkdown>
                  </div>
                  
                  {savedToVault && (
                    <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 text-xs text-emerald-500 font-mono text-center font-bold">
                      ✓ Successfully archived inside the Chidon vault index! Select "CHIDON Vault" anytime to view your records offline.
                    </div>
                  )}

                </div>
              ) : (
                /* Empty / Loading generic screen info placeholder */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4">
                  {generating ? (
                    <div className="space-y-3 animate-pulse">
                      <Loader2 className="animate-spin text-cyan-500 mx-auto" size={32} />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-cyan-500 uppercase font-black">ALIGNING PARAMETERS</span>
                        <p className="text-xs font-sans text-slate-500 max-w-xs mx-auto">
                          Asking our AI Engine to research organic benchmarks, psychological retainers, and comparative matrices.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-full bg-slate-50 dark:bg-zinc-800/40 border border-[var(--border-base)] w-14 h-14 flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-600">
                        <Target size={24} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-mono font-black uppercase text-[var(--text-primary)]">Ready for Intelligence Synthesis</h4>
                        <p className="text-xs font-sans text-slate-400 max-w-xs mx-auto">
                          Configure your social topic, tone vectors, and goals in the Left console to align custom neural blogs immediately.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

        )}
      </div>

    </div>
  );
};
