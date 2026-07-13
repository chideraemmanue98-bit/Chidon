import React, { useState } from 'react';
import { Search, Copy, Check, FileText, Globe, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import seoBannerImg from '../assets/images/seo_tool_banner_1783649274905.jpg';

interface SEOKeyword {
  keyword: string;
  searchVolume: string;
}

interface SEOOutline {
  h1: string;
  h2s: string[];
  h3s: string[];
}

interface SEOResultData {
  keywords: SEOKeyword[];
  title: string;
  meta: string;
  outline: SEOOutline;
  checklist: string[];
  tags: string[];
}

export const SEOTool: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('freelance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [result, setResult] = useState<SEOResultData | null>(null);

  // Frontend strict validation
  const validateInputs = (): string | null => {
    const combined = `${keyword} ${niche} ${platform}`.toLowerCase();
    const blockTriggers = [
      'write me a book', 'write a book', 'write book', 'novel', 'story', 'poetry', 'poem', 'essay', 
      'cook', 'recipe', 'general advice', 'life advice', 'how to code', 'coding', 'script writer'
    ];

    for (const trigger of blockTriggers) {
      if (combined.includes(trigger)) {
        return "I can only do real SEO work for Freelance Gigs, Websites, and Blog posts. Try the Content Writing Feature instead.";
      }
    }

    if (!keyword.trim() || keyword.trim().length < 2) {
      return "Please enter a valid target keyword (at least 2 characters).";
    }

    if (!niche.trim() || niche.trim().length < 2) {
      return "Please enter your business niche or category (at least 2 characters).";
    }

    return null;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/features/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, niche, platform }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate SEO optimization.');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" id="seo-tool-container">
      {/* Visual Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 h-48 sm:h-64 bg-slate-950">
        <img 
          src={seoBannerImg} 
          alt="SEO Analytics Vector" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-primary/20 text-cyan-primary border border-cyan-primary/30 w-fit mb-2">
            Professional SEO Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            Chidon IQ SEO Optimizer
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1">
            Generate high-performing keyword research, SEO Titles, Meta Descriptions, Outline templates, and platform-specific checklists.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="md:col-span-5 bg-slate-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between space-y-4">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Primary Keyword
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="e.g. logo design freelance"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Business Niche / Category
              </label>
              <input
                type="text"
                placeholder="e.g. Graphic Design, Digital Agency, SAAS"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-primary transition"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Target Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'freelance', label: 'Freelance', icon: ShoppingBag },
                  { id: 'website', label: 'Website', icon: Globe },
                  { id: 'blog', label: 'Blog Post', icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = platform === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPlatform(item.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition ${
                        isSelected 
                          ? 'bg-cyan-primary/10 border-cyan-primary text-cyan-primary shadow-[0_0_12px_rgba(34,211,238,0.15)]' 
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                      disabled={loading}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-primary to-blue-600 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Algorithms...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Generate SEO Pack
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-[10px] text-slate-500 leading-relaxed font-mono">
            * Note: Chidon IQ operates under strict sandbox boundaries. High-demand requests are optimized via local cache matrices.
          </div>
        </div>

        {/* Right Column: Results Console */}
        <div className="md:col-span-7 bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md min-h-[400px] flex flex-col justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <RefreshCw className="w-8 h-8 text-cyan-primary animate-spin" />
              <div className="text-center">
                <p className="text-sm text-slate-300 font-medium">Querying Global Search Index...</p>
                <p className="text-xs text-slate-500 mt-1">Applying structural on-page guidelines and calculating density</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Keywords Research Box */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-primary mb-3">
                  Keyword Research & Volume
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {result.keywords.map((kw, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-white/5 rounded-xl flex flex-col justify-between">
                      <span className="text-xs text-slate-300 font-semibold truncate">{kw.keyword}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1">{kw.searchVolume} Searches</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Meta Box */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-primary">SEO Title</span>
                    <button 
                      onClick={() => handleCopy(result.title, 'title')}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                    >
                      {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === 'title' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-300 relative">
                    {result.title}
                    <span className="absolute right-3 bottom-1.5 text-[8px] text-slate-500 font-mono">
                      {result.title.length}/60 chars
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-primary">Meta Description</span>
                    <button 
                      onClick={() => handleCopy(result.meta, 'meta')}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                    >
                      {copiedField === 'meta' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedField === 'meta' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-xs leading-relaxed text-slate-400 relative">
                    {result.meta}
                    <span className="absolute right-3 bottom-1.5 text-[8px] text-slate-500 font-mono">
                      {result.meta.length}/155 chars
                    </span>
                  </div>
                </div>
              </div>

              {/* Headings Outline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-primary mb-3">
                  Semantic Outlines (H1-H3 Structure)
                </h3>
                <div className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-3 font-mono text-[11px] text-slate-300">
                  <div className="flex items-start gap-1.5">
                    <span className="text-cyan-primary font-bold">H1:</span>
                    <span>{result.outline.h1}</span>
                  </div>
                  {result.outline.h2s && result.outline.h2s.length > 0 && (
                    <div className="space-y-1.5 pl-3 border-l border-white/5">
                      {result.outline.h2s.map((h2, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-400 font-bold">H2:</span>
                          <span>{h2}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.outline.h3s && result.outline.h3s.length > 0 && (
                    <div className="space-y-1.5 pl-6 border-l border-white/5">
                      {result.outline.h3s.map((h3, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-purple-400 font-bold">H3:</span>
                          <span>{h3}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-primary mb-2.5">
                    SEO Checklist
                  </h3>
                  <div className="space-y-1.5">
                    {result.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                        <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-primary mb-2.5">
                    Freelance/SEO Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {result.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 bg-slate-950 border border-white/5 hover:border-cyan-primary/30 text-slate-300 hover:text-white rounded-lg text-xs font-medium cursor-pointer transition"
                        onClick={() => handleCopy(tag, `tag-${i}`)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
              <Search className="w-12 h-12 text-slate-700" />
              <p className="text-sm text-slate-400">Enter a keyword and niche to begin</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Chidon IQ will evaluate search momentum and outline a high-converting SEO strategy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
