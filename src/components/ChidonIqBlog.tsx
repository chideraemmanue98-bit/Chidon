import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, Wand2, ArrowLeft, Check, Loader2, 
  Share2, Copy, Save, Calendar, Clock, User, Zap, Brain, 
  Target, ChevronRight, MessageSquare, Terminal, Eye, PenTool,
  Plus, Flame, ThumbsUp, MessageCircle, Heart, Send, Globe, Wifi, Filter, X
} from 'lucide-react';
import { auth } from '../firebase';
import { getSupabaseClient } from '../lib/supabase';

interface ChidonIqBlogProps {
  onSaveDraft?: (featureId: string, content: string, title: string) => Promise<void>;
  onBack?: () => void;
  checkAndDeductCredits?: (cost: number, description: string) => Promise<boolean>;
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
  authorId?: string;
  authorEmail?: string;
  tags: string[];
  likes: number;
  claps: number;
  mindblown: number;
  isUserGenerated?: boolean;
}

interface BlogComment {
  id: string;
  authorName: string;
  authorId: string;
  content: string;
  createdAt: any;
}

const CATEGORIES = [
  { name: 'Growth Hacking', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { name: 'Algorithmic Shifts', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { name: 'Neural Marketing', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { name: 'Creative Capital', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { name: 'Tech & AI Systems', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
];

export const ChidonIqBlog: React.FC<ChidonIqBlogProps> = ({ onSaveDraft, onBack, checkAndDeductCredits }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'synthesizer'>('feed');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Global posts state
  const [globalPosts, setGlobalPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  // Plus Button & Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Growth Hacking');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [uploadPreviewMode, setUploadPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
  const [publishedGlobal, setPublishedGlobal] = useState(false);

  // Consult AI state
  const [consultQuestion, setConsultQuestion] = useState('');
  const [consultAnswer, setConsultAnswer] = useState('');
  const [consultLoading, setConsultLoading] = useState(false);

  // Load Global posts from Supabase
  useEffect(() => {
    async function fetchPosts() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled Global Insight',
            excerpt: item.excerpt || '',
            content: item.content || '',
            category: item.category || 'Growth Hacking',
            readTime: item.read_time || '3 min read',
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
            author: item.author || 'Chidon Global Node',
            authorId: item.author_id,
            authorEmail: item.author_email,
            tags: Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.split(',') : []),
            likes: item.likes || 0,
            claps: item.claps || 0,
            mindblown: item.mindblown || 0,
            isUserGenerated: true
          }));
          setGlobalPosts(formatted);
        }
      } catch (err: any) {
        console.error("Supabase error loading posts:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [supabase]);

  // Sync comments when post is selected from Supabase
  useEffect(() => {
    if (!selectedPost || !supabase) {
      setComments([]);
      return;
    }
    async function fetchComments() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', selectedPost.id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        if (data) {
          setComments(data.map((c: any) => ({
            id: c.id,
            authorName: c.author_name || 'Anonymous Node',
            authorId: c.author_id || '',
            content: c.content || '',
            createdAt: c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
          })));
        }
      } catch (err) {
        console.warn("Could not load comments from Supabase:", err);
      }
    }
    fetchComments();
  }, [selectedPost, supabase]);

  // Handle Publishing a Custom Blog Post to Supabase
  const handleUploadBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !supabase) {
      setUploadError("Title and Main Content are required to broadcast to the network.");
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const words = newContent.trim().split(/\s+/).length;
      const readTimeCalculated = `${Math.max(1, Math.ceil(words / 150))} min read`;
      const tagsArray = newTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const username = auth.currentUser?.email?.split('@')[0] || auth.currentUser?.displayName || 'Chidon Elite User';
      const userMail = auth.currentUser?.email || 'anonymous@chidon.iq';

      const payload = {
        title: newTitle.trim(),
        excerpt: newExcerpt.trim() || (newContent.substring(0, 120) + '...'),
        content: newContent.trim(),
        category: newCategory,
        read_time: readTimeCalculated,
        author: username,
        author_id: auth.currentUser?.uid || 'anonymous',
        author_email: userMail,
        tags: tagsArray,
        likes: 0,
        claps: 0,
        mindblown: 0
      };

      const { data, error } = await supabase.from('posts').insert([payload]).select();
      if (error) throw error;

      if (data && data[0]) {
        const item = data[0];
        const newPost: BlogPost = {
          id: item.id,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          category: item.category,
          readTime: item.read_time,
          date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          author: item.author,
          authorId: item.author_id,
          authorEmail: item.author_email,
          tags: item.tags || [],
          likes: item.likes,
          claps: item.claps,
          mindblown: item.mindblown,
          isUserGenerated: true
        };
        setGlobalPosts(prev => [newPost, ...prev]);
      }

      // Reset Form State
      setNewTitle('');
      setNewExcerpt('');
      setNewContent('');
      setNewTags('');
      setIsUploadOpen(false);
      setUploadPreviewMode(false);
    } catch (err: any) {
      setUploadError(err.message || "Failed to broadcast post to the global database.");
    } finally {
      setUploading(false);
    }
  };

  // React to a blog post in Supabase
  const handleReaction = async (blogId: string, reactionType: 'likes' | 'claps' | 'mindblown') => {
    if (!supabase) return;
    try {
      const { data: current, error: getErr } = await supabase
        .from('posts')
        .select(reactionType)
        .eq('id', blogId)
        .single();
      
      if (getErr) throw getErr;
      const nextVal = (current?.[reactionType] || 0) + 1;

      const { error: updErr } = await supabase
        .from('posts')
        .update({ [reactionType]: nextVal })
        .eq('id', blogId);

      if (updErr) throw updErr;

      // Update local state immediately for pristine feeling
      setGlobalPosts(prev => prev.map(p => p.id === blogId ? { ...p, [reactionType]: nextVal } : p));
      setSelectedPost(prev => prev && prev.id === blogId ? { ...prev, [reactionType]: nextVal } : prev);
    } catch (err) {
      console.error("Failed to update reaction:", err);
    }
  };

  // Submit dynamic comment to Supabase
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost || !supabase) return;

    setSubmittingComment(true);
    try {
      const commentPayload = {
        post_id: selectedPost.id,
        author_name: auth.currentUser?.email?.split('@')[0] || auth.currentUser?.displayName || 'Chidon Reader',
        author_id: auth.currentUser?.uid || 'anonymous',
        content: commentText.trim()
      };

      const { data, error } = await supabase.from('comments').insert([commentPayload]).select();
      if (error) throw error;

      if (data && data[0]) {
        const c = data[0];
        const newComment: BlogComment = {
          id: c.id,
          authorName: c.author_name,
          authorId: c.author_id,
          content: c.content,
          createdAt: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setComments(prev => [...prev, newComment]);
      }
      setCommentText('');
    } catch (err) {
      console.error("Comment submission error:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const triggerSynthesis = async () => {
    if (!synthTopic.trim() || generating) return;
    setGenerating(true);

    if (checkAndDeductCredits) {
      const allowed = await checkAndDeductCredits(3, `AI Blog Post Synthesis: ${synthTopic}`);
      if (!allowed) {
        setGenerating(false);
        return;
      }
    }

    setErrorStatus('');
    setGeneratedBlog('');
    setSavedToVault(false);
    setPublishedGlobal(false);
    
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
        body: JSON.stringify({ 
          prompt,
          userId: auth.currentUser?.uid,
          feature: "Chidon IQ Blog",
          creditsDeductedByClient: true
        }),
      });

      if (!response.ok) {
        throw new Error("Chidon node network timed out or generated empty tokens.");
      }

      const data = await response.json();
      if (data && data.text) {
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

  // Publish AI generated blog straight to Global Database in Supabase
  const publishGeneratedBlogToGlobal = async () => {
    if (!generatedBlog || !generatedTitle || !supabase) return;
    try {
      const words = generatedBlog.trim().split(/\s+/).length;
      const readTimeCalculated = `${Math.max(1, Math.ceil(words / 150))} min read`;
      const username = auth.currentUser?.email?.split('@')[0] || auth.currentUser?.displayName || 'Chidon Expert Node';

      const payload = {
        title: generatedTitle,
        excerpt: `AI Synthesized briefing examining: ${synthTopic}`,
        content: generatedBlog,
        category: 'Tech & AI Systems',
        read_time: readTimeCalculated,
        author: `${username} (AI Synthesized)`,
        author_id: auth.currentUser?.uid || 'anonymous',
        author_email: auth.currentUser?.email || 'anonymous',
        tags: ['AI Synthesized', 'Chidon IQ', synthPlatform.split(' ')[0]],
        likes: 1,
        claps: 3,
        mindblown: 1
      };

      const { data, error } = await supabase.from('posts').insert([payload]).select();
      if (error) throw error;

      if (data && data[0]) {
        const item = data[0];
        const newPost: BlogPost = {
          id: item.id,
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          category: item.category,
          readTime: item.read_time,
          date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          author: item.author,
          authorId: item.author_id,
          authorEmail: item.author_email,
          tags: item.tags || [],
          likes: item.likes,
          claps: item.claps,
          mindblown: item.mindblown,
          isUserGenerated: true
        };
        setGlobalPosts(prev => [newPost, ...prev]);
      }
      setPublishedGlobal(true);
    } catch (err) {
      console.error("Failed to publish AI blog globally:", err);
    }
  };

  const executeConsultation = async (blogPostTitle: string) => {
    if (!consultQuestion.trim() || consultLoading) return;
    setConsultLoading(true);

    if (checkAndDeductCredits) {
      const allowed = await checkAndDeductCredits(2, `Blog Consult: "${consultQuestion.slice(0, 30)}..."`);
      if (!allowed) {
        setConsultLoading(false);
        return;
      }
    }

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
        body: JSON.stringify({ 
          prompt,
          userId: auth.currentUser?.uid,
          feature: "Chidon IQ Blog Consult",
          creditsDeductedByClient: true
        }),
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

  // Combine pre-curated with dynamic user-generated blogs to provide a complete robust list
  const combinedAllBlogs = globalPosts;

  // Filter combined lists by active selection category
  const filteredBlogs = combinedAllBlogs.filter(post => {
    if (selectedCategory === 'All') return true;
    return post.category.toLowerCase().trim() === selectedCategory.toLowerCase().trim();
  });

  return (
    <div className="space-y-6 select-text pb-16">
      
      {/* Real-time Connection Status Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-950 to-purple-950 border border-indigo-500/30 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full filter blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10 text-center md:text-left flex-col md:flex-row">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <Globe size={24} className="animate-spin-slow text-white" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <Wifi size={10} className="animate-pulse" />
                Global Network Linked
              </span>
              <span className="text-[10px] font-mono text-purple-300 uppercase font-bold bg-purple-950/50 border border-purple-500/20 px-2 py-0.5 rounded-full">
                Chidon Live Matrix
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-tight mt-1.5">
              Chidon Blog & Collaborative Network
            </h1>
            <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-xl">
              Upload your own briefings, comment on industry paradigms, react dynamically, and stay interconnected in real-time.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3 shrink-0 relative z-10 w-full md:w-auto justify-center md:justify-end">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-90 active:scale-95 text-white rounded-2xl text-xs font-mono font-black tracking-wide shadow-xl shadow-indigo-500/10 flex items-center gap-2 cursor-pointer transition-all border border-white/10"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Upload Insight</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono font-bold text-slate-200 hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Return to Hub</span>
            </button>
          )}
        </div>
      </div>

      {/* Workspace Menu Tabs */}
      {!selectedPost && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-base)] pb-2">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('feed')}
              className={`pb-3 text-xs font-mono uppercase tracking-widest border-b-2 font-black transition-all cursor-pointer ${
                activeTab === 'feed'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
              }`}
            >
              📬 Global Network Feed ({combinedAllBlogs.length})
            </button>
            <button
              onClick={() => setActiveTab('synthesizer')}
              className={`pb-3 text-xs font-mono uppercase tracking-widest border-b-2 font-black transition-all cursor-pointer ${
                activeTab === 'synthesizer'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 animate-pulse'
                  : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
              }`}
            >
              🧠 Linguistic Optimizer Synthesizer
            </button>
          </div>

          {/* Quick Categories Filter inside feed */}
          {activeTab === 'feed' && (
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto pb-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                All Insights
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
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
              onClick={() => { setSelectedPost(null); setComments([]); setConsultAnswer(''); setConsultQuestion(''); }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-500 hover:underline font-bold pb-2 cursor-pointer"
            >
              <ArrowLeft size={13} /> Return to Global Feed
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Blog Article Core Body */}
              <div className="lg:col-span-8 card-base p-6 md:p-8 border-2 border-[var(--border-base)] bg-[var(--bg-card)] rounded-2xl space-y-6 text-left relative overflow-hidden shadow-xl">
                <Helmet>
                  <title>{`${selectedPost.title} - ChidonIQ Blog`}</title>
                  <meta name="description" content={selectedPost.excerpt} />
                  <meta name="keywords" content={`social media, growth, ${selectedPost.category.toLowerCase()}, ${(selectedPost.tags || []).join(', ')}`} />
                  <meta property="og:title" content={`${selectedPost.title} - ChidonIQ Blog`} />
                  <meta property="og:description" content={selectedPost.excerpt} />
                  <meta name="twitter:title" content={`${selectedPost.title} - ChidonIQ Blog`} />
                  <meta name="twitter:description" content={selectedPost.excerpt} />
                </Helmet>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                
                {/* Meta details */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedPost.category}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-display font-black text-[var(--text-primary)] tracking-tight leading-snug">
                    {selectedPost.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md"><User size={12} className="text-indigo-400" /> {selectedPost.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {selectedPost.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {selectedPost.readTime}</span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-[var(--border-base)]" />

                {/* Main Text Content */}
                <div className="markdown-body text-[var(--text-secondary)]">
                  <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedPost.tags.map(t => (
                    <span key={t} className="text-[9px] font-mono bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md text-slate-400">#{t}</span>
                  ))}
                </div>

                {/* Interactive Reaction & Clap Engine */}
                <div className="border-t border-[var(--border-base)] pt-6 mt-6">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">React to this Insight</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleReaction(selectedPost.id, 'likes')}
                      className="px-4 py-2 bg-pink-500/5 border border-pink-500/15 text-pink-500 rounded-xl hover:bg-pink-500/10 transition-all flex items-center gap-2 cursor-pointer text-xs font-mono font-black"
                    >
                      <Heart size={14} className="fill-pink-500 text-pink-500" />
                      <span>Support ({selectedPost.likes || 0})</span>
                    </button>

                    <button
                      onClick={() => handleReaction(selectedPost.id, 'claps')}
                      className="px-4 py-2 bg-indigo-500/5 border border-indigo-500/15 text-indigo-400 rounded-xl hover:bg-indigo-500/10 transition-all flex items-center gap-2 cursor-pointer text-xs font-mono font-black"
                    >
                      <ThumbsUp size={14} className="text-indigo-400" />
                      <span>Clap ({selectedPost.claps || 0})</span>
                    </button>

                    <button
                      onClick={() => handleReaction(selectedPost.id, 'mindblown')}
                      className="px-4 py-2 bg-yellow-500/5 border border-yellow-500/15 text-yellow-500 rounded-xl hover:bg-yellow-500/10 transition-all flex items-center gap-2 cursor-pointer text-xs font-mono font-black"
                    >
                      <Flame size={14} className="fill-yellow-500 text-yellow-500" />
                      <span>Mind Blown ({selectedPost.mindblown || 0})</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Global Discussion Thread Section */}
                <div className="border-t border-[var(--border-base)] pt-6 mt-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-indigo-500" />
                    <h3 className="text-sm font-mono font-black uppercase tracking-wider text-[var(--text-primary)]">
                      Real-time Global Discussion ({comments.length})
                    </h3>
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Add an insight or drop strategic feedback globally..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-xs text-[var(--text-primary)] font-sans"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      <span className="text-xs font-mono font-bold">Post</span>
                    </button>
                  </form>

                  {/* Comments Thread Viewport */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div 
                          key={comment.id}
                          className="p-3 bg-slate-50 dark:bg-zinc-900/40 border border-[var(--border-base)] rounded-xl text-left text-xs font-sans flex justify-between items-start"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-slate-500 dark:text-slate-300">@{comment.authorName}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-400" />
                              <span className="text-[10px] text-slate-400 font-mono">{comment.createdAt}</span>
                            </div>
                            <p className="text-[var(--text-secondary)] mt-1 whitespace-pre-wrap leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-xs font-mono">
                        💬 No global thoughts added yet. Be the first to share an insight!
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Sidebar consultation interactive segment */}
              <div className="lg:col-span-4 space-y-4">
                <div className="card-base p-5 border-2 border-[var(--border-base)] bg-slate-50 dark:bg-zinc-900/30 rounded-2xl space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <Brain size={18} className="text-indigo-500 shrink-0" />
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
                      className="w-full h-24 p-2.5 text-xs bg-[var(--bg-card)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans resize-none"
                    />
                    
                    <button
                      onClick={() => executeConsultation(selectedPost.title)}
                      disabled={consultLoading || !consultQuestion.trim()}
                      className="w-full py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md disabled:opacity-50"
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
                    <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-xs text-[var(--text-primary)] leading-normal font-sans space-y-2 max-h-[160px] overflow-y-auto">
                      <div className="text-[8px] font-mono text-indigo-500 font-extrabold tracking-widest uppercase">CHIDON ADVICE RESPONSE</div>
                      <p className="whitespace-pre-wrap leading-relaxed">{consultAnswer}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        ) : activeTab === 'feed' ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-16 w-full col-span-full">
              <Loader2 className="animate-spin text-indigo-500 mx-auto" size={36} />
              <p className="text-xs font-mono text-slate-500 mt-4">Syncing feed intelligence node...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-red-500/20 rounded-2xl p-8 max-w-md mx-auto col-span-full">
              <p className="text-sm font-semibold text-red-400">Failed to load</p>
              <p className="text-xs font-mono text-slate-400 mt-2">{error}</p>
            </div>
          ) : (
            /* Show feed of curated industry-grade influence intelligence */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 col-span-full">
              {filteredBlogs.length === 0 ? (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-700/30 rounded-2xl p-8">
                  <p className="text-sm text-slate-400 font-mono">No posts yet. Be the first to write one.</p>
                </div>
              ) : (
                filteredBlogs.map((blog) => (
                  <motion.div
                    key={blog.id}
                    whileHover={{ y: -4 }}
                    className="card-base p-6 border-2 border-[var(--border-base)] bg-[var(--bg-card)] rounded-2xl flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
                    onClick={() => setSelectedPost(blog)}
                  >
                    {/* Visual accent top line representing categories */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-500" />
                    
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {blog.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{blog.readTime}</span>
                      </div>

                      <h3 className="text-base font-display font-extrabold text-[var(--text-primary)] leading-snug tracking-tight group-hover:text-indigo-500 transition-colors">
                        {blog.title}
                      </h3>
                      
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 font-sans font-medium">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-base)]/40 mt-6">
                      {/* Reaction metrics overview inside card */}
                      <div className="flex gap-2.5 mb-3 text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1"><Heart size={11} className="text-pink-500 fill-pink-500/20" /> {blog.likes || 0}</span>
                        <span className="flex items-center gap-1"><ThumbsUp size={11} className="text-indigo-400" /> {blog.claps || 0}</span>
                        <span className="flex items-center gap-1"><Flame size={11} className="text-yellow-500 fill-yellow-500/10" /> {blog.mindblown || 0}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono font-bold max-w-[120px] truncate">
                          @{blog.author}
                        </span>
                        <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Read Intel <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )

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
                <Terminal size={16} className="text-indigo-500" />
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
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
                />
              </div>

              {/* Target Core Platform */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase block">Platform Channel</label>
                  <select
                    value={synthPlatform}
                    onChange={(e) => setSynthPlatform(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
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
                    className="w-full px-2.5 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
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
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
                />
              </div>

              {/* Depth Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase block">Article Depth Target</label>
                <select
                  value={synthLength}
                  onChange={(e) => setSynthLength(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
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
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                {generating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Engaging Chidon Node...</span>
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
            <div className="lg:col-span-8 card-base border-2 border-[var(--border-base)] bg-[var(--bg-card)] rounded-2xl min-h-[440px] flex flex-col justify-stretch overflow-hidden relative shadow-lg">
              <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

              {generatedBlog ? (
                /* Generated results loaded viewport */
                <div className="flex flex-col h-full justify-between flex-1">
                  
                  {/* Result Header actions bar */}
                  <div className="p-4 border-b border-[var(--border-base)] flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">REAL-TIME INTEL SYNTHESIS SUCCESS</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Share globally */}
                      <button
                        onClick={publishGeneratedBlogToGlobal}
                        disabled={publishedGlobal}
                        className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-500 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-1.5 text-xs font-mono font-black cursor-pointer disabled:opacity-55"
                      >
                        <Share2 size={13} />
                        <span>{publishedGlobal ? 'Shared Globally' : 'Share Globally'}</span>
                      </button>

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
                          className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                          title="Commit to Chidon Vault"
                        >
                          <Save size={13} />
                          <span>{savedToVault ? 'Stored in Vault' : 'Store in Vault'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content output container viewport */}
                  <div className="p-8 md:p-10 text-left max-h-[600px] overflow-y-auto custom-scrollbar markdown-body text-[var(--text-secondary)] leading-relaxed">
                    <h1 className="text-2xl md:text-3xl font-display font-black text-[var(--text-primary)] tracking-tight leading-snug border-b pb-4 mb-8">
                      {generatedTitle}
                    </h1>
                    <ReactMarkdown>{generatedBlog}</ReactMarkdown>
                  </div>
                  
                  {publishedGlobal && (
                    <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 text-xs text-emerald-500 font-mono text-center font-bold">
                      ✓ Successfully broadcasted to the Chidon global network! All users can view, react, and comment on your post live.
                    </div>
                  )}

                  {savedToVault && !publishedGlobal && (
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
                      <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono tracking-widest text-indigo-500 uppercase font-black">ALIGNING PARAMETERS</span>
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

      {/* Broadcast / Upload Blog Insight Modal overlay */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-base)] rounded-3xl overflow-hidden shadow-2xl flex flex-col text-left"
            >
              {/* Modal header bar */}
              <div className="p-5 border-b border-[var(--border-base)] flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-indigo-500" />
                  <h3 className="text-sm font-mono font-black uppercase tracking-wider text-[var(--text-primary)]">
                    Broadcast Global Insight
                  </h3>
                </div>
                <button
                  onClick={() => { setIsUploadOpen(false); setUploadPreviewMode(false); }}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={18} className="text-slate-400 hover:text-white" />
                </button>
              </div>

              {/* Form container scroll block */}
              <form onSubmit={handleUploadBlog} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* Mode toggle */}
                <div className="flex border-b border-[var(--border-base)] mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadPreviewMode(false)}
                    className={`pb-2 text-xs font-mono uppercase tracking-widest border-b-2 font-black transition-all px-4 cursor-pointer ${
                      !uploadPreviewMode ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400'
                    }`}
                  >
                    ✏️ Edit Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadPreviewMode(true)}
                    className={`pb-2 text-xs font-mono uppercase tracking-widest border-b-2 font-black transition-all px-4 cursor-pointer ${
                      uploadPreviewMode ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400'
                    }`}
                  >
                    👁️ Markdown Live Preview
                  </button>
                </div>

                {!uploadPreviewMode ? (
                  <>
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase">Insight Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Navigating standard programmatic algorithms in late 2026..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
                      />
                    </div>

                    {/* Excerpt and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase">Category Focus</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase">Short Summary Excerpt</label>
                        <input
                          type="text"
                          placeholder="e.g. Quick overview of algorithmic changes on social graphs."
                          value={newExcerpt}
                          onChange={(e) => setNewExcerpt(e.target.value)}
                          className="w-full px-4 py-2.5 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
                        />
                      </div>
                    </div>

                    {/* Main Markdown Body */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase">Content Body (Markdown Supported)</label>
                      <textarea
                        placeholder="### Hello World&#10;Write detailed strategies here using **Markdown** formatting. You can include tables, lists, and quotes easily."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        required
                        className="w-full h-48 p-4 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans resize-none"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-extrabold text-[var(--text-primary)] uppercase">Pill Tags (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. AI, Growth, Algorithm, Strategy"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-[var(--bg-app)] border-2 border-[var(--border-base)] rounded-xl outline-none focus:border-indigo-500 text-[var(--text-primary)] font-sans"
                      />
                    </div>
                  </>
                ) : (
                  /* Preview Render panel */
                  <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-base)] min-h-[300px] markdown-body text-left">
                    <h1 className="text-xl md:text-2xl font-display font-black text-[var(--text-primary)] tracking-tight mb-4 pb-2 border-b">
                      {newTitle || 'Untitled Preview'}
                    </h1>
                    <div className="text-xs text-slate-400 font-mono mb-4 flex gap-4">
                      <span>Category: {newCategory}</span>
                      <span>Tags: {newTags || 'none'}</span>
                    </div>
                    {newContent ? (
                      <ReactMarkdown>{newContent}</ReactMarkdown>
                    ) : (
                      <p className="text-slate-400 font-mono italic">Start typing content inside the Edit tab to see live preview.</p>
                    )}
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 text-xs font-mono text-red-500 bg-red-100/10 border border-red-500/20 rounded-xl text-center font-bold">
                    {uploadError}
                  </div>
                )}
              </form>

              {/* Action buttons inside modal */}
              <div className="p-4 border-t border-[var(--border-base)] bg-slate-50/50 dark:bg-zinc-900/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsUploadOpen(false); setUploadPreviewMode(false); }}
                  className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadBlog}
                  disabled={uploading}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-mono font-black tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Broadcasting Node...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Publish to Network Feed</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Access Floating Button in corner */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsUploadOpen(true)}
          className="p-4 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 hover:shadow-cyan-500/20 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-2 border-white/20 hover:rotate-90 transition-all duration-300"
          title="Broadcast new blog"
        >
          <Plus size={22} strokeWidth={3} />
        </motion.button>
      </div>

    </div>
  );
};
