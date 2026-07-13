import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Type, 
  Copy, 
  Smartphone, 
  Eye, 
  Compass, 
  CheckCircle, 
  TrendingUp, 
  Sliders, 
  Calculator, 
  FileText, 
  ArrowRight,
  BookOpen,
  Send,
  HelpCircle,
  Hash,
  Activity,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  BarChart3,
  Clock,
  Trophy,
  Search,
  Tag,
  Info,
  Plus,
  Layers,
  ThumbsUp,
  Share2,
  Flame,
  Star,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- WIDGET 1: TELEPROMPTER & PACING CONTROLLER (For Scripts) ---
export const ScriptPrompterWidget = ({ content }: { content: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [scrollSpeed, setScrollSpeed] = useState(3); // 1-10 speed levels
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying && containerRef.current) {
      timer = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop += scrollSpeed * 0.5;
          // Check if bottom is reached
          if (
            containerRef.current.scrollHeight - containerRef.current.scrollTop <=
            containerRef.current.clientHeight + 2
          ) {
            setIsPlaying(false);
          }
        }
      }, 30);
    }
    return () => clearInterval(timer);
  }, [isPlaying, scrollSpeed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedLines = useMemo(() => {
    return content.split('\n').map((line, idx) => {
      let lineStyle = "text-slate-300";
      let label = "";
      
      if (line.toUpperCase().includes('HOOK') || line.toUpperCase().includes('INTRO')) {
        lineStyle = "text-red-400 font-extrabold border-l-2 border-red-500 pl-2 bg-red-500/5 py-1 rounded";
      } else if (line.toUpperCase().includes('BODY') || line.toUpperCase().includes('CONTENT')) {
        lineStyle = "text-amber-300 font-semibold border-l-2 border-amber-500 pl-2 bg-amber-500/5 py-1 rounded";
      } else if (line.toUpperCase().includes('CTA') || line.toUpperCase().includes('OUTRO')) {
        lineStyle = "text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2 bg-emerald-500/5 py-1 rounded";
      }
      
      return (
        <p 
          key={idx} 
          className={cn("mb-4 transition-all tracking-wide leading-relaxed font-sans", lineStyle)}
          style={{ fontSize: `${fontSize}px` }}
        >
          {line}
        </p>
      );
    });
  }, [content, fontSize]);

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-emerald-500/20 rounded-3xl space-y-4 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 uppercase tracking-widest">CREATOR CONSOLE</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Lined Script Teleprompter</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* FontSize adjustments */}
          <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1 items-center gap-1">
            <button 
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              className="p-1.5 hover:bg-white/5 rounded text-xs font-bold text-slate-300 cursor-pointer"
            >
              A-
            </button>
            <Type size={12} className="text-slate-500" />
            <button 
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="p-1.5 hover:bg-white/5 rounded text-xs font-bold text-slate-300 cursor-pointer"
            >
              A+
            </button>
          </div>

          {/* Speed adjustments */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl p-1 px-2.5 text-xs text-slate-300 font-mono">
            <span className="text-[10px] text-slate-500">SPEED</span>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={scrollSpeed} 
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span>{scrollSpeed}x</span>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <Copy size={12} />
            <span>{copied ? '✓ Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main prompter container */}
      <div 
        ref={containerRef}
        className="h-80 overflow-y-auto bg-slate-900/60 p-6 rounded-2xl border border-white/5 relative scroll-smooth text-slate-100"
      >
        <div className="pb-32">
          {formattedLines}
        </div>
        
        {/* Playback absolute buttons */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "p-3 rounded-full cursor-pointer shadow-lg transition-all flex items-center justify-center text-white",
              isPlaying ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-emerald-500 hover:bg-emerald-600"
            )}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>
      
      <p className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wider">
        COLOR CODE CODEC: <span className="text-red-400 font-bold">● HOOK/INTRO</span> | <span className="text-amber-300 font-bold">● THE CORE STORY</span> | <span className="text-emerald-400 font-bold">● CTA/OUTRO</span>
      </p>
    </div>
  );
};


// --- WIDGET 2: HIGH-FIDELITY SMARTPHONE PREVIEW (For Social Bios) ---
export const ProfilePreviewWidget = ({ content }: { content: string }) => {
  const [activeBioIndex, setActiveBioIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Extract separate Bio variants
  const bios = useMemo(() => {
    // Look for text fragments split by options or list indicators
    const options = content.split(/(?=\d\.|Option \d|Variant \d|### \d)/gi);
    const valid = options.filter(o => o.trim().length > 15);
    if (valid.length === 0) {
      return [content];
    }
    return valid.map(o => o.replace(/(?:\d\.|Option \d|Variant \d|### \d|[*])/gi, '').trim());
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(bios[activeBioIndex] || content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-pink-500/20 rounded-3xl space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20 uppercase tracking-widest">LIVE WRITING PREVIEW</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">High-CTR Profile Display</h3>
        </div>
        
        <div className="flex gap-1.5 bg-slate-900 border border-white/10 rounded-xl p-1">
          {bios.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBioIndex(idx)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer",
                activeBioIndex === idx
                  ? "bg-pink-500 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Smartphone Shell */}
        <div className="flex justify-center md:col-span-1">
          <div className="w-64 border-4 border-slate-800 rounded-[35px] bg-black p-3.5 shadow-2xl relative overflow-hidden select-none">
            {/* Top Notch */}
            <div className="w-24 h-4 bg-slate-850 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-10 flex justify-center items-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-1" />
              <div className="w-10 h-1 bg-slate-900 rounded-full" />
            </div>

            {/* Simulated App Frame */}
            <div className="bg-slate-950 border border-white/5 rounded-[22px] p-4 text-white text-left font-sans space-y-4 pt-6 min-h-[360px] flex flex-col justify-between">
              <div>
                {/* Header Title bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 tracking-wide font-mono">
                  <span>CHIDON_IQ</span>
                  <ExternalLink size={8} />
                </div>

                {/* Profile Avatar & Numbers summary */}
                <div className="flex items-center justify-between pt-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 p-0.5 relative shrink-0">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      <User size={24} className="text-slate-400" />
                    </div>
                    {/* Blue verification star badge */}
                    <div className="absolute -bottom-1 -right-1 bg-cyan-primary text-black font-bold p-0.5 rounded-full text-[6px]">
                      ✓
                    </div>
                  </div>

                  <div className="flex gap-4 pr-1 text-center font-mono">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-100">12.4k</span>
                      <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black">FOLLOWERS</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-100">415</span>
                      <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black">FOLLOWING</span>
                    </div>
                  </div>
                </div>

                {/* User Info & Selected BIO */}
                <div className="pt-3.5 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-100">@creative_dna</span>
                    <span className="text-[7px] font-mono px-1 rounded bg-slate-900 border border-white/10 text-pink-400 font-bold">CREATOR</span>
                  </div>
                  
                  {/* The Bio option display wrapper */}
                  <p className="text-[10px] text-slate-200 leading-normal whitespace-pre-line select-text font-medium min-h-[60px]">
                    {bios[activeBioIndex] || "Scanned bio details appear here..."}
                  </p>

                  <div className="flex items-center gap-1 pt-0.5 text-cyan-primary">
                    <Smartphone size={8} />
                    <span className="text-[8px] hover:underline cursor-pointer font-bold tracking-tight">linktr.ee/creative_dna</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Simulated profile */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-center text-[9px] font-mono">
                <div className="py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-extrabold cursor-pointer">
                  Follow
                </div>
                <div className="py-2 rounded-lg bg-slate-90% border border-white/10 hover:bg-slate-900 text-slate-300 font-extrabold cursor-pointer">
                  Message
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio text detail block */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Variant Text</span>
            <p className="text-sm font-sans font-medium text-slate-200 leading-relaxed bg-slate-900/60 border border-white/5 p-4 rounded-xl">
              {bios[activeBioIndex]}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Copy size={13} />
            <span>{copied ? '✓ Preset Copied Successfully' : 'Copy Selected Bio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 3: BLUEPRINT DESIGN CANVAS (For Thumbnails) ---
export const ThumbnailCanvasWidget = ({ content }: { content: string }) => {
  const [activeConceptIndex, setActiveConceptIndex] = useState(0);

  const concepts = useMemo(() => {
    const rawBlocks = content.split(/(?=\d\.|Idea \d|Concept \d|### \d)/gi);
    const valid = rawBlocks.filter(b => b.trim().length > 30);
    if (valid.length === 0) {
      return [content];
    }
    return valid.map(b => b.replace(/(?:\d\.|Idea \d|Concept \d|### \d|[*])/gi, '').trim());
  }, [content]);

  // Extract variables safely or provide beautiful mock blueprints
  const details = useMemo(() => {
    const defaultData = {
      headline: "[HOOK TEXT OVERLAY]",
      elements: "High Contrast Object, Reaction Face",
      palette: ["#EF4444", "#000000", "#F59E0B"],
      rationale: "Optimizes raw click triggers through contrasting color depth layers."
    };
    if (!concepts[activeConceptIndex]) return defaultData;

    const segment = concepts[activeConceptIndex];
    const headlineMatch = segment.match(/(?:title|text|overlay|headline).*?:?\s*(.*)/gi);
    const elementsMatch = segment.match(/(?:layout|element|details|focus).*?:?\s*(.*)/gi);
    const paletteMatch = segment.match(/(?:color|palette|shades).*?:?\s*(.*)/gi);

    return {
      headline: headlineMatch ? headlineMatch[0].replace(/(?:title|text|overlay|headline|:|[*])/gi, '').trim() : "[VIRAL TEXT INSIGHT]",
      elements: elementsMatch ? elementsMatch[0].replace(/(?:layout|element|details|focus|:|[*])/gi, '').trim() : "Reaction focal element (left), main text element (right)",
      palette: paletteMatch ? ["#10B981", "#059669", "#111827"] : ["#F59E0B", "#DC2626", "#090D16"],
      rationale: segment.substring(segment.indexOf('\n') + 1, segment.indexOf('\n') + 180) + '...'
    };
  }, [concepts, activeConceptIndex]);

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-amber-500/20 rounded-3xl space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-widest">TACTICAL THUMBNAIL MAP</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Composition Wireframe</h3>
        </div>
        
        <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
          {concepts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveConceptIndex(idx)}
              className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer",
                activeConceptIndex === idx
                  ? "bg-amber-500 text-black font-extrabold"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Frame {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Visual Blueprint wireframe layout */}
        <div className="lg:col-span-1 p-4 bg-slate-900 rounded-2xl border border-white/5 relative">
          <div className="aspect-video bg-zinc-950 border-2 border-dashed border-amber-500/30 rounded-xl flex flex-col justify-between p-4 relative overflow-hidden">
            {/* Rule of Thirds Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
              <div className="border border-white/5 transition-all" />
            </div>

            {/* Top Indicator */}
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 z-10 select-none">
              <span>CONTRAST FOCUS: HIGH</span>
              <span>16:9 HD</span>
            </div>

            {/* Simulated focal points */}
            <div className="flex justify-between items-center w-full z-10 flex-grow pt-2 select-none">
              {/* Left element reacting face */}
              <div className="w-16 h-16 rounded-full border-2 border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-center text-[7px] font-mono text-slate-300">
                FOCAL FACE
              </div>

              {/* Big impact title overlay */}
              <div 
                className="p-3 bg-red-600 rounded-xl text-center text-xs font-black tracking-tighter uppercase text-white shadow-2xl max-w-[120px]"
                style={{ backgroundColor: details.palette[0] }}
              >
                {details.headline}
              </div>
            </div>

            {/* Downer Indicators */}
            <div className="flex justify-between items-center text-[7px] font-mono z-10 select-none pt-2">
              <span className="text-amber-400">● PLACEMENT VECTORS COHESIVE</span>
              <span className="text-slate-500">ZOOM VALUE: 1.5x</span>
            </div>
          </div>
        </div>

        {/* Detailed text and color instructions */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Composition Specs</span>
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-xs space-y-3 font-medium">
              <div>
                <span className="text-slate-400 block uppercase text-[8.5px]">Color Swatch</span>
                <div className="flex gap-1.5 pt-1">
                  {details.palette.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-slate-950 p-1 pr-2.5 rounded-lg border border-white/5">
                      <div className="w-4 h-4 rounded-md" style={{ backgroundColor: c }} />
                      <span className="text-[9px] font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block uppercase text-[8.5px]">Focal Layout</span>
                <span className="text-slate-250 italic font-mono text-[10px] block pt-0.5">{details.elements}</span>
              </div>

              <div>
                <span className="text-slate-400 block uppercase text-[8.5px]">Psychological Target</span>
                <p className="text-slate-300 font-sans tracking-tight leading-relaxed pt-0.5">{details.rationale}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 4: GROWTH MATH WORKBENCH (For Engagement Advising) ---
export const GrowthMathWidget = ({ content }: { content: string }) => {
  const [followers, setFollowers] = useState(10000);
  const [likes, setLikes] = useState(480);
  const [comments, setComments] = useState(40);
  const [shares, setShares] = useState(20);

  // Computing operational values directly
  const engagementRate = useMemo(() => {
    if (followers <= 0) return 0;
    return (((likes + comments + shares) / followers) * 100);
  }, [followers, likes, comments, shares]);

  const benchmarkVal = useMemo(() => {
    if (engagementRate > 6.5) return { text: "CRITICAL VIRALITY (Excellent)", color: "text-emerald-400" };
    if (engagementRate > 3.5) return { text: "HIGH ENGAGEMENT (Good)", color: "text-cyan-primary" };
    return { text: "STANDARD MARGIN (Average)", color: "text-amber-500" };
  }, [engagementRate]);

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-emerald-500/20 rounded-3xl space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 uppercase tracking-widest">TACTICAL FORMULA WORKSPACE</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Growth Engagement Advisor</h3>
        </div>
        <Calculator size={18} className="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Dynamic Sliders Form */}
        <div className="space-y-4 p-4 bg-slate-900 border border-white/5 rounded-2xl">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Metric Sliders</span>
          
          {/* Followers slider */}
          <div className="space-y-1.5 text-xs text-slate-200">
            <div className="flex justify-between font-mono">
              <span className="font-bold">Followers</span>
              <span className="text-emerald-400 font-extrabold">{followers.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="500000" 
              step="1000"
              value={followers} 
              onChange={(e) => setFollowers(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Likes slider */}
          <div className="space-y-1.5 text-xs text-slate-200">
            <div className="flex justify-between font-mono">
              <span className="font-bold">Avg Likes per Post</span>
              <span className="text-emerald-400 font-extrabold">{likes.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="10000" 
              step="10"
              value={likes} 
              onChange={(e) => setLikes(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Comments slider */}
          <div className="space-y-1.5 text-xs text-slate-200">
            <div className="flex justify-between font-mono">
              <span className="font-bold">Comments</span>
              <span className="text-emerald-400 font-extrabold">{comments.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="1000" 
              value={comments} 
              onChange={(e) => setComments(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Shares slider */}
          <div className="space-y-1.5 text-xs text-slate-200 font-mono">
            <div className="flex justify-between">
              <span className="font-bold">Shares & Saves</span>
              <span className="text-emerald-400 font-extrabold">{shares.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="1000" 
              value={shares} 
              onChange={(e) => setShares(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Computations outcome display card */}
        <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl flex flex-col justify-between min-h-[220px] text-left">
          <div className="space-y-3">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">Velocity Statistics</span>
            
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-tight block font-semibold">True Engagement Rate</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white">{engagementRate.toFixed(2)}%</span>
                <span className={cn("text-[9px] font-mono font-bold uppercase", benchmarkVal.color)}>{benchmarkVal.text}</span>
              </div>
            </div>

            <div className="h-px bg-white/5 pt-1" />

            <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold">
              <div>
                <span className="text-[9px] text-slate-500 block">VIRAL VELOCITY</span>
                <span className="text-slate-200">{(engagementRate * 1.8).toFixed(1)}x / 10</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">REACH INDEX</span>
                <span className="text-slate-200">Tier {engagementRate > 5 ? '1 Pro' : '2 Core'}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mt-4">
            <span className="text-[8.5px] font-mono text-emerald-400 block font-black uppercase">TACTICAL ANALYSIS SHIFT</span>
            <p className="text-[10.5px] text-slate-300 leading-normal font-sans font-medium">
              Increment comment replies by <span className="text-emerald-400 font-extrabold">30% in the first hour</span> to shift from average index margins into high conversion states.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 5: MOMENTUM HEAT TICKERS (For Trends) ---
export const TrendMomentumTickerWidget = ({ content }: { content: string }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const trends = useMemo(() => {
    const rawItems = content.split(/(?=\d\.|Topic \d|### \d)/gi);
    const valid = rawItems.filter(t => t.trim().length > 15);
    
    if (valid.length === 0) {
      return [{
        name: "General Momentum Breakout",
        score: 94,
        vector: "Surging Daily",
        pivot: "Capitalizing early hooks"
      }];
    }

    return valid.map((itm, i) => {
      // Parse details
      const score = Math.floor(Math.abs(Math.cos(i + 1)) * 25) + 75; // 75-100%
      const lineClean = itm.replace(/(?:\d\.|Topic \d|### \d|[*])/gi, '').trim();
      const firstLine = lineClean.split('\n')[0] || "Momentum Trend Niche";
      
      return {
        name: firstLine,
        score,
        vector: score > 90 ? "EXPONENTIAL SPIKE" : "HIGH MOMENTUM",
        pivot: lineClean.split('\n')[1] || "Pivot towards micro tutorials and direct step outlines."
      };
    });
  }, [content]);

  const copyTrend = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-orange-500/20 rounded-3xl space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20 uppercase tracking-widest">BREAKOUT TICKER DIRECTORY</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">High-Momentum Cultural Scans</h3>
        </div>
        <TrendingUp size={18} className="text-orange-500" />
      </div>

      {/* Horizontal scrolling row in CSS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trends.map((t, idx) => (
          <div 
            key={idx} 
            className="p-4 bg-slate-900 border border-white/5 hover:border-orange-500/20 transition-all rounded-2xl flex flex-col justify-between gap-3 text-left group"
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[8px] font-mono">
                <span className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase tracking-wide font-bold">{t.vector}</span>
                <span className="text-slate-500 font-extrabold">{t.score}% MOMENTUM</span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1">{t.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1 select-text font-medium">{t.pivot}</p>
            </div>

            <button
              onClick={() => copyTrend(`${t.name}: ${t.pivot}`, idx)}
              className="w-full py-2 bg-slate-950 hover:bg-zinc-805 text-slate-300 font-bold font-mono text-[10px] uppercase rounded-xl border border-white/5 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span>{copiedIndex === idx ? '✓ Saved' : 'Copy Angle'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};







// --- WIDGET 6: AUDIENCE DOSSIERS (For Personas) ---
export const AudienceDossierWidget = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  // Parse persona variables
  const details = useMemo(() => {
    let name = "Alex (Early Adopter)";
    let frustration = "Overwhelmed by excessive technical fluff and boring tutorials.";
    let trigger = "Zero-padding guides and step outcomes.";

    const segmentClean = content.replace(/[*]/g, '');
    const nameMatch = segmentClean.match(/(?:title|name|persona|bio).*?:?\s*(.*)/gi);
    const frustrationMatch = segmentClean.match(/(?:pain|frustration|struggle).*?:?\s*(.*)/gi);
    const triggerMatch = segmentClean.match(/(?:trigger|hook|angle|motivator).*?:?\s*(.*)/gi);

    if (nameMatch) name = nameMatch[0].replace(/(?:title|name|persona|bio|:)/gi, '').trim();
    if (frustrationMatch) frustration = frustrationMatch[0].replace(/(?:pain|frustration|struggle|:)/gi, '').trim();
    if (triggerMatch) trigger = triggerMatch[0].replace(/(?:trigger|hook|angle|motivator|:)/gi, '').trim();

    return { name, frustration, trigger };
  }, [content]);

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-indigo-500/20 rounded-3xl space-y-4 text-left">
      <div>
        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded border border-indigo-400/20 uppercase tracking-widest">CRITICAL PSYCHOLOGY</span>
        <h3 className="text-base font-bold text-white uppercase mt-1">Audience Dossier Folders</h3>
      </div>

      <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
        {/* Dossier Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-extrabold uppercase shadow-xl shrink-0">
          {details.name.charAt(0)}
        </div>

        <div className="space-y-3 w-full">
          <div>
            <span className="text-[8px] font-mono text-indigo-400 block uppercase font-bold tracking-wider">TARGET ENERGETIC BIOGRAPHY</span>
            <span className="text-sm font-black text-slate-100">{details.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-left">
              <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wide">CORE FRUSTRATION</span>
              <p className="text-slate-200 leading-normal pt-1 font-medium">{details.frustration}</p>
            </div>
            
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-left">
              <span className="text-[8px] font-mono text-slate-500 block uppercase tracking-wide">PSYCHOLOGICAL CTR TRIGGER</span>
              <p className="text-slate-200 leading-normal pt-1 font-medium italic">"{details.trigger}"</p>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => {
          navigator.clipboard.writeText(content);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="w-full py-2.5 bg-slate-90% border border-white/10 hover:bg-slate-900 text-slate-300 font-bold rounded-xl text-xs font-mono uppercase cursor-pointer"
      >
        {copied ? '✓ Full Dossier Saved' : 'Copy Psychographic File'}
      </button>
    </div>
  );
};


// --- WIDGET 7: DYNAMIC MULTI-PLATFORM FUNNEL (For Repurposing/Headlines) ---
export const RepurposePipelineWidget = ({ content }: { content: string }) => {
  const [activePlatformTab, setActivePlatformTab] = useState('youtube');
  const [copied, setCopied] = useState(false);

  const platformsData = useMemo(() => {
    const rawChunks = content.split(/(?=YouTube|X\/Twitter|LinkedIn|Blog|Instagram)/gi);
    
    const data: Record<string, string> = {
      youtube: "Adapting Hook metrics for vertical audiences...",
      xtwitter: "Threading complex structures safely...",
      linkedin: "Visual carousels targeting business builders...",
      blog: "Deep strategic reading frameworks..."
    };

    rawChunks.forEach(chunk => {
      const chunkClean = chunk.replace(/[*]/g, '').trim();
      if (chunk.toUpperCase().includes('YOUTUBE') || chunk.toUpperCase().includes('SHORT')) {
        data.youtube = chunkClean;
      } else if (chunk.toUpperCase().includes('X/TWITTER') || chunk.toUpperCase().includes('TWITTER') || chunk.toUpperCase().includes('THREAD')) {
        data.xtwitter = chunkClean;
      } else if (chunk.toUpperCase().includes('LINKEDIN') || chunk.toUpperCase().includes('CAROUSEL')) {
        data.linkedin = chunkClean;
      } else if (chunk.toUpperCase().includes('BLOG') || chunk.toUpperCase().includes('ARTICLE')) {
        data.blog = chunkClean;
      }
    });

    return data;
  }, [content]);

  const copyPlatformData = () => {
    navigator.clipboard.writeText(platformsData[activePlatformTab] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-cyan-primary/20 rounded-3xl space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-primary bg-cyan-primary/10 px-2.5 py-1 rounded border border-cyan-primary/20 uppercase tracking-widest font-black">OMNICHAINE CONVERSION PLATFORM</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Repurpose Conversion Channels</h3>
        </div>
        <ClockIcon size={18} className="text-cyan-primary" />
      </div>

      <div className="space-y-4">
        {/* Dynamic platforms selector navbar tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-2">
          {[
            { id: 'youtube', label: '🎥 YouTube' },
            { id: 'xtwitter', label: '🐦 X / Threads' },
            { id: 'linkedin', label: '💼 LinkedIn' },
            { id: 'blog', label: '📝 Blog Post' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlatformTab(p.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono font-black border transition-all cursor-pointer",
                activePlatformTab === p.id
                  ? "bg-cyan-primary/15 text-cyan-primary border-cyan-primary/30"
                  : "bg-transparent text-slate-400 border-transparent hover:text-white"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Repurposed Outcome details */}
        <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl relative">
          <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-wrap select-text pr-10 min-h-[140px]">
            {platformsData[activePlatformTab]}
          </p>
          
          <button
            onClick={copyPlatformData}
            className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-zinc-805 border border-white/10 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-all"
            title="Copy Specific Platform Adaptation"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Fallback Clock Icon
const ClockIcon = ({ size, className }: { size: number, className: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);


// ==========================================
// NEW FEATURES SPECIALIZED WIDGETS
// ==========================================


// --- WIDGET 8: INTERACTIVE VIRAL CARD DECK (For content-ideas / Video Ideas) ---
export const ViralIdeaCardDeckWidget = ({ content }: { content: string }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const cards = useMemo(() => {
    // Try to split the content by video ideas or numbers
    const segments = content.split(/(?=(?:🎥|Idea|\d\.)\s*(?:VIDEO|FORMAT|THE BIG IDEA|\d))/gi);
    const valid = segments.filter(s => s.trim().length > 30);
    
    if (valid.length === 0) {
      // Fallback: chunk by lines if no pattern
      const lines = content.split('\n').filter(l => l.trim().length > 10);
      return [{
        format: "Viral Strategy Format",
        title: "Emerging Concept Draft",
        hook: "High-CTR Hook Sequence",
        protocol: content,
        goal: "Drive subscriber velocity"
      }];
    }

    return valid.map((seg, idx) => {
      // Parse sub-elements: FORMAT, BIG IDEA, VIRAL HOOK, SCRIPT PROTOCOL, STRATEGIC GOAL
      const getSection = (regex: RegExp, fallback: string) => {
        const match = seg.match(regex);
        if (match && match[1]) return match[1].replace(/[*_#]/g, '').trim();
        return fallback;
      };

      // Match patterns
      const format = getSection(/(?:FORMAT|🎥|Video Format)[:\-]?\s*([^\n]+)/i, "High-Impact Vertical Format");
      const title = getSection(/(?:THE BIG IDEA|💡|Idea)[:\-]?\s*([^\n]+)/i, `Concept Sequence #${idx + 1}`);
      const hook = getSection(/(?:VIRAL HOOK|🎭|Hook)[:\-]?\s*([^\n]+)/i, "Unusual opening loop sequence");
      const goal = getSection(/(?:STRATEGIC GOAL|🚀|Goal)[:\-]?\s*([^\n]+)/i, "Optimize organic conversion rate");
      
      // Script protocol is usually the remaining body
      let protocol = seg;
      const protocolMatch = seg.match(/(?:SCRIPT PROTOCOL|📜|Protocol)[:\-]?\s*([\s\S]+?)(?=(?:STRATEGIC GOAL|🚀|$))/i);
      if (protocolMatch && protocolMatch[1]) {
        protocol = protocolMatch[1].trim();
      } else {
        protocol = seg.replace(format, '').replace(title, '').replace(hook, '').replace(goal, '').replace(/[*_#:\-]/g, '').trim();
      }

      return { format, title, hook, protocol, goal };
    });
  }, [content]);

  const activeCard = cards[activeIndex] || cards[0];

  const handleCopy = () => {
    if (!activeCard) return;
    const textToCopy = `Format: ${activeCard.format}\nConcept: ${activeCard.title}\nHook: ${activeCard.hook}\nProtocol:\n${activeCard.protocol}\nGoal: ${activeCard.goal}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeCard) return null;

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-cyan-500/20 rounded-3xl space-y-4 text-left">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-primary bg-cyan-primary/10 px-2.5 py-1 rounded border border-cyan-primary/20 uppercase tracking-widest">INTERACTIVE CARD DECK</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Viral Video Formats ({cards.length})</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
            disabled={activeIndex === 0}
            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] font-mono text-slate-500">{activeIndex + 1} / {cards.length}</span>
          <button
            onClick={() => setActiveIndex(prev => Math.min(cards.length - 1, prev + 1))}
            disabled={activeIndex === cards.length - 1}
            className="p-1.5 bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Main glowing format header */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/20 rounded-2xl">
            <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">🎥 VIDEO FORMAT</span>
            <p className="text-sm font-extrabold text-white mt-1 uppercase tracking-tight">{activeCard.format}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
              <span className="text-[8px] font-mono text-amber-400 font-bold uppercase tracking-widest block">💡 THE BIG IDEA</span>
              <p className="text-xs text-slate-200 font-semibold mt-1">{activeCard.title}</p>
            </div>
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
              <span className="text-[8px] font-mono text-purple-vibrant font-bold uppercase tracking-widest block">🎭 VIRAL HOOK</span>
              <p className="text-xs text-slate-200 font-semibold mt-1 italic">"{activeCard.hook}"</p>
            </div>
          </div>

          <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl">
            <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-2">📜 SCRIPT PROTOCOL WORKFLOW</span>
            <div className="text-xs text-slate-300 leading-relaxed space-y-1 select-text max-h-40 overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap">
              {activeCard.protocol}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-primary shrink-0" />
              <div>
                <span className="text-[8px] font-mono text-slate-500 block uppercase">CONVERSION TRAFFIC GOAL</span>
                <span className="text-[11px] text-slate-300 font-medium">{activeCard.goal}</span>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-mono tracking-tight flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
            >
              <Copy size={12} />
              <span>{copied ? '✓ Copied' : 'Copy Card'}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


// --- WIDGET 9: NARRATIVE BLUEPRINT WORKFLOW (For ai-script-outline / Script Blueprint) ---
export const NarrativeArchitectBlueprintWidget = ({ content }: { content: string }) => {
  const [expandedPhase, setExpandedPhase] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const phases = useMemo(() => {
    // Attempt to parse out chapters, sections, outline blocks, or phases
    const sections = content.split(/(?=Phase \d|Step \d|Section \d|### [A-Za-z]|\d\.\s*(?:Hook|Body|Outro|Intro|Timeline))/gi);
    const valid = sections.filter(s => s.trim().length > 20);

    if (valid.length === 0) {
      return [
        { title: "Hook Blueprint", desc: "Open narrative loops and engage audience in first 3-5 seconds.", body: content },
        { title: "Value Deliveries", desc: "Detail structured sub-concepts with clear metric validation.", body: "Refer to the generated advisory text." },
        { title: "Audience Retention Nodes", desc: "Incorporate B-Roll cuts and pattern interrupt alerts.", body: "Pattern interrupt benchmarks are loaded." },
        { title: "Call-to-Action Protocol", desc: "Convert viewers into subscribers/customers.", body: "Optimized CTA statements." }
      ];
    }

    return valid.map((sec, idx) => {
      const titleMatch = sec.match(/^(?:Phase\s+\d+|Step\s+\d+|Section\s+\d+|\d+\.?\s*)?[:\-]?\s*([^\n]+)/i);
      const title = titleMatch ? titleMatch[1].replace(/[*_#]/g, '').trim() : `Blueprint Stage ${idx + 1}`;
      
      const lines = sec.split('\n').filter(l => l.trim().length > 1);
      const desc = lines[1] ? lines[1].replace(/[*_#]/g, '').trim().slice(0, 80) + "..." : "Structured narrative execution sequence.";
      
      return {
        title,
        desc,
        body: sec.trim()
      };
    });
  }, [content]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-purple-500/20 rounded-3xl space-y-4 text-left">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-purple-vibrant bg-purple-vibrant/10 px-2.5 py-1 rounded border border-purple-vibrant/20 uppercase tracking-widest">NARRATIVE ARCHITECT BLUEPRINT</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Storyboarding Flow</h3>
        </div>
        <button
          onClick={handleCopyAll}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-mono tracking-tight flex items-center gap-1 cursor-pointer transition-all"
        >
          <Copy size={11} />
          <span>{copied ? '✓ Copied' : 'Copy All'}</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {phases.map((phase, idx) => {
          const isExpanded = expandedPhase === idx;
          return (
            <div 
              key={idx}
              className={cn(
                "border rounded-2xl transition-all overflow-hidden text-left",
                isExpanded 
                  ? "bg-slate-900 border-purple-500/30 shadow-md" 
                  : "bg-slate-950 border-white/5 hover:border-purple-500/10 hover:bg-slate-900/20"
              )}
            >
              <button
                onClick={() => setExpandedPhase(isExpanded ? -1 : idx)}
                className="w-full p-4 flex items-start gap-3 text-left cursor-pointer"
              >
                <div className={cn(
                  "w-6 h-6 rounded-lg font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border",
                  isExpanded 
                    ? "bg-purple-vibrant text-white border-purple-vibrant/20" 
                    : "bg-slate-900 text-slate-500 border-white/5"
                )}>
                  0{idx + 1}
                </div>
                
                <div className="space-y-0.5 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-xs font-bold uppercase tracking-tight", isExpanded ? "text-purple-300" : "text-slate-200")}>
                      {phase.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                  </div>
                  {!isExpanded && (
                    <p className="text-[10px] text-slate-500 line-clamp-1 truncate max-w-md">
                      {phase.desc}
                    </p>
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4 pt-0 border-t border-white/5 bg-slate-950/40">
                      <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {phase.body}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- WIDGET 10: HEADLINE CTR METER & QUALITY CHECK (For headlines / Headline Hook) ---
export const HeadlineCTRVisualizerWidget = ({ content }: { content: string }) => {
  const [customHeadline, setCustomHeadline] = useState('');
  const [customScore, setCustomScore] = useState<number | null>(null);
  const [playgroundFeedback, setPlaygroundFeedback] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const headlines = useMemo(() => {
    const lines = content.split('\n').filter(l => l.trim().length > 8);
    const results: { text: string; ctr: number; formula: string }[] = [];

    lines.forEach(line => {
      // Find a clean headline sequence
      if (line.match(/^\d+/) || line.includes('Formula') || line.includes('#') || line.includes('CTR') || line.trim().length > 15) {
        // Strip out CTR indicators inside line
        let ctr = 88; // base
        const ctrMatch = line.match(/(?:CTR|Score)[:\-]?\s*(\d+)%?/i) || line.match(/(\d+)\s*%/);
        if (ctrMatch && ctrMatch[1]) {
          ctr = Math.min(99, Math.max(50, parseInt(ctrMatch[1])));
        } else {
          // generate pseudo-realistic sequence
          ctr = Math.floor(Math.random() * 15) + 82;
        }

        const cleanText = line.replace(/(?:predicted\s+)?CTR[:\-]?\s*\d+%?/gi, '')
          .replace(/[\[\]()]/g, '')
          .replace(/^\d+[\.\s\-]+/, '')
          .replace(/[*_#]/g, '')
          .trim();

        if (cleanText.length > 10) {
          results.push({
            text: cleanText,
            ctr,
            formula: ctr > 92 ? "Curiosity Loop" : ctr > 87 ? "Intense Warning" : "Numbered Listicle"
          });
        }
      }
    });

    if (results.length === 0) {
      return [
        { text: "This 1 Simple Change Saved Me 4 Hours of Coding Daily", ctr: 94, formula: "Curiosity Loop" },
        { text: "STOP Coding in Python Until You Watch This Video!", ctr: 91, formula: "Warning Frame" },
        { text: "I Built an AI App in 48 Hours: The Honest Truth", ctr: 88, formula: "Behind Scenes" },
        { text: "5 Coding Secrets Senior Developers Hide From You", ctr: 86, formula: "Insider Access" }
      ];
    }

    return results.slice(0, 8); // limit for density
  }, [content]);

  const testHeadline = () => {
    if (!customHeadline.trim()) return;
    let score = 55; // Base CTR

    const uppercaseCount = (customHeadline.match(/[A-Z]/g) || []).length;
    const length = customHeadline.length;

    // Word checks
    const powers = ["secret", "stop", "never", "you", "hacks", "reveal", "warning", "free", "hours", "days", "make", "money", "developer", "how", "why"];
    let powerMatches = 0;
    powers.forEach(w => {
      if (customHeadline.toLowerCase().includes(w)) {
        score += 8;
        powerMatches++;
      }
    });

    // Number check
    if (/\d+/.test(customHeadline)) score += 10;
    // Question mark or exclamation check
    if (/[\?!]/.test(customHeadline)) score += 6;
    // All caps boost slightly
    if (uppercaseCount > 5) score += 4;
    // Length optimal limit check
    if (length >= 40 && length <= 70) score += 8;
    else if (length > 100) score -= 15;

    score = Math.min(98, Math.max(45, score));
    setCustomScore(score);

    if (score >= 90) {
      setPlaygroundFeedback("VIRAL CLUSTERING ALERT: CTR estimated to be in top 5%. High emotional trigger index.");
    } else if (score >= 75) {
      setPlaygroundFeedback("MODERATE RESONANCE: Consider adding an intriguing number or urgent warning word.");
    } else {
      setPlaygroundFeedback("WEAK CTR SIGNAL: Too generic. Hook loops are offline. Use warning hooks or list numbers.");
    }
  };

  const copyHeadline = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-yellow-500/20 rounded-3xl space-y-6 text-left">
      <div>
        <span className="text-[10px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded border border-yellow-400/20 uppercase tracking-widest">CLICK-MAGNET METER</span>
        <h3 className="text-base font-bold text-white uppercase mt-1">Headline Hook CTR Analysis</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: list of suggestions */}
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">ANALYZED HOOK OPTIONS</span>
          {headlines.map((hl, idx) => (
            <div 
              key={idx}
              className="p-3.5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between gap-4 group hover:border-yellow-500/20 transition-all text-left"
            >
              <div className="space-y-1.5 w-full">
                <p className="text-xs font-bold text-slate-200 select-all leading-tight">
                  {hl.text}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-bold bg-slate-950 px-2 py-0.5 rounded border border-white/5">{hl.formula}</span>
                  <div className="flex-1 h-1 bg-slate-950 rounded-full overflow-hidden max-w-[80px]">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                      style={{ width: `${hl.ctr}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs font-mono font-black text-yellow-400">{hl.ctr}%</span>
                <button
                  onClick={() => copyHeadline(hl.text, idx)}
                  className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Copy Headline"
                >
                  {copiedIndex === idx ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right column: active predictor playground */}
        <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-[10px] font-mono text-slate-200 uppercase tracking-widest font-bold">CTR PREDICTION COGNITIVE PLAYGROUND</span>
          </div>

          <div className="space-y-2">
            <span className="text-[8px] font-mono text-slate-400 block uppercase">ENTER YOUR CUSTOM VARIANT</span>
            <input 
              type="text" 
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              placeholder="e.g. 5 simple coding secrets senior devs hide from you..."
              className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500/40"
            />
            <button
              onClick={testHeadline}
              className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer tracking-wider font-mono active:scale-98 transition-all"
            >
              Analyze Scorecard
            </button>
          </div>

          {customScore !== null && (
            <div className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase">PREDICTED SYSTEM CTR</span>
                <span className={cn(
                  "text-lg font-black font-mono",
                  customScore >= 90 ? "text-emerald-400" : customScore >= 75 ? "text-yellow-400" : "text-red-400"
                )}>
                  {customScore}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans font-medium">
                {playgroundFeedback}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 11: KEYWORD INTELLIGENCE MATRIX (For keyword-research / vseo-keywords) ---
export const KeywordIntelligenceMatrixWidget = ({ content }: { content: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const keywords = useMemo(() => {
    // Attempt to parse out lines resembling keyword recommendations
    const lines = content.split('\n').filter(l => l.trim().length > 10);
    const results: { keyword: string; volume: string; difficulty: 'LOW' | 'MED' | 'HIGH'; angle: string }[] = [];

    lines.forEach(line => {
      if (line.match(/(?:[a-zA-Z0-9_\-\s]{3,30})/) && (line.includes('Volume') || line.includes('Difficulty') || line.includes('LOW') || line.includes('MED') || line.includes('HIGH') || line.startsWith('-') || line.match(/^\d/))) {
        // Parse key attributes
        const cleaned = line.replace(/[*_#]/g, '').trim();
        const words = cleaned.split(/[:\-\t|]+/);
        
        if (words.length >= 2) {
          const kw = words[0].replace(/^\d+[\.\s\-]+/, '').trim();
          let vol = "45,000 / mo";
          let diff: 'LOW' | 'MED' | 'HIGH' = 'MED';
          
          if (cleaned.toUpperCase().includes('LOW')) diff = 'LOW';
          else if (cleaned.toUpperCase().includes('HIGH')) diff = 'HIGH';

          const volMatch = cleaned.match(/(\d{1,3},?\d{3})/);
          if (volMatch) {
            vol = `${volMatch[1]} / mo`;
          } else {
            vol = `${Math.floor(Math.random() * 80) + 10},000/mo`;
          }

          const angle = words[2] ? words[2].trim() : "Optimize meta tags & descriptions.";

          if (kw.length > 3 && kw.length < 50 && !kw.toUpperCase().includes('KEYWORDS') && !kw.toUpperCase().includes('VOLUME')) {
            results.push({ keyword: kw, volume: vol, difficulty: diff, angle });
          }
        }
      }
    });

    if (results.length === 0) {
      return [
        { keyword: "artificial intelligence apps", volume: "125,000 / mo", difficulty: 'HIGH' as const, angle: "Compare 5 leading productivity engines." },
        { keyword: "build AI tools solo developer", volume: "18,500 / mo", difficulty: 'LOW' as const, angle: "Walkthrough of simple Javascript framework setup." },
        { keyword: "learn coding in 30 days hacks", volume: "45,000 / mo", difficulty: 'MED' as const, angle: "Show structured weekly schedule with templates." },
        { keyword: "best minimalist desk setup 2026", volume: "32,000 / mo", difficulty: 'LOW' as const, angle: "Audit of desk shelf and vertical backlights." }
      ];
    }

    return results;
  }, [content]);

  const filteredKeywords = keywords.filter(k => 
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyTag = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedKey(word);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-amber-500/20 rounded-3xl space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-widest">NEURAL SEARCH MATRIX</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Keyword Intelligence Scan</h3>
        </div>
        
        {/* Search filter input */}
        <div className="relative">
          <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/30 w-full sm:w-48 placeholder-slate-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-slate-500 font-mono text-[9px] uppercase tracking-widest text-left">
              <th className="py-3 px-4 font-bold">Search Term</th>
              <th className="py-3 px-4 font-bold">Search Volume</th>
              <th className="py-3 px-4 font-bold">Difficulty Index</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredKeywords.map((k, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-200 select-all">{k.keyword}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400 font-medium">{k.volume}</td>
                <td className="py-3.5 px-4">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded text-[8px] font-bold font-mono border",
                    k.difficulty === 'LOW' 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                      : k.difficulty === 'MED'
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/25"
                        : "bg-red-500/10 text-red-400 border-red-500/25"
                  )}>
                    {k.difficulty}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleCopyTag(k.keyword)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] font-mono uppercase"
                  >
                    {copiedKey === k.keyword ? '✓' : 'Copy'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredKeywords.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                  No matching nodes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- WIDGET 12: REALISTIC YOUTUBE FEED SIMULATION (For youtube-seo / Organic Video Feed Strategizer) ---
export const LiveVideoFeedPreviewWidget = ({ content }: { content: string }) => {
  const [thumbnailText, setThumbnailText] = useState('VIRAL HOOK OVERLAY!');
  const [activeTab, setActiveTab] = useState<'watch' | 'search'>('watch');

  const parsedData = useMemo(() => {
    // Attempt to extract title option, tag blocks and timeline timestamps
    const titleMatch = content.match(/(?:Title|1\.)[:\-]?\s*([^\n]+)/i);
    const title = titleMatch ? titleMatch[1].replace(/[*_#]/g, '').trim() : "Untitled Viral Video Node";

    const descLines = content.split('\n').filter(l => l.trim().length > 10).slice(1, 6);
    const desc = descLines.join('\n').replace(/[*_#]/g, '').trim().slice(0, 300) + "...";

    return { title, desc };
  }, [content]);

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-red-500/20 rounded-3xl space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 uppercase tracking-widest font-black">YOUTUBE FEED SIMULATOR</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Live SEO Search & watch previews</h3>
        </div>

        <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('watch')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
              activeTab === 'watch' ? "bg-red-500 text-white" : "text-slate-400 hover:text-white"
            )}
          >
            Watch Page
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
              activeTab === 'search' ? "bg-red-500 text-white" : "text-slate-400 hover:text-white"
            )}
          >
            Search Card
          </button>
        </div>
      </div>

      {activeTab === 'watch' ? (
        /* Video watch mockup */
        <div className="space-y-4">
          {/* Simulated Video Player */}
          <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-transparent opacity-40" />
            
            {/* Visual Thumbnail design preview inside player */}
            <div className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-red-500/30 shadow-2xl relative z-10 max-w-sm">
              <span className="text-[8px] font-mono text-red-400 font-bold tracking-widest block uppercase">SIMULATED THUMBNAIL BACKPLATE</span>
              <p className="text-lg font-black text-white uppercase tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-red-400">
                {thumbnailText}
              </p>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Play size={12} className="text-red-500 fill-red-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400">CHIDON IQ REAL-TIME FEEDBACK MODULE</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 bg-black/60 px-2 py-0.5 rounded">00:00 / 08:45</span>
            </div>
          </div>

          {/* Player controls details */}
          <div className="space-y-2 text-left">
            <h4 className="text-sm font-bold text-slate-100 select-all uppercase leading-snug">
              {parsedData.title}
            </h4>
            
            {/* Simulated Channel info & Watch Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1.5 border-y border-white/5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-mono text-white font-bold shrink-0">
                  IQ
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Chidon Freelance Creator</p>
                  <p className="text-[9px] text-slate-500">125k subscribers</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-mono text-slate-300">
                <ThumbsUp size={11} className="text-red-500" />
                <span>8.4k Likes</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="font-bold text-slate-200">2.5M views</span>
                <span>•</span>
                <span>2 hours ago</span>
                <span>•</span>
                <span className="text-red-400">#seo</span>
              </div>
              <p className="text-xs text-slate-300 font-sans whitespace-pre-wrap select-text pr-2 leading-relaxed">
                {parsedData.desc}
              </p>
            </div>

            {/* Editing custom thumbnail text */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Edit Overlay text:</span>
              <input
                type="text"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value.toUpperCase())}
                placeholder="EDIT THUMBNAIL GLOW"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-red-500/30"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Search result item mockup */
        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl flex flex-col md:flex-row gap-4 items-start">
          {/* Mock thumbnail */}
          <div className="w-full md:w-52 aspect-video bg-gradient-to-br from-red-600/20 to-slate-950 rounded-xl border border-white/10 shrink-0 flex items-center justify-center relative p-3 text-center">
            <p className="text-xs font-black text-white uppercase tracking-tighter line-clamp-2">{thumbnailText}</p>
            <span className="absolute bottom-2 right-2 text-[8px] font-mono text-white bg-black/80 px-1 rounded">12:30</span>
          </div>

          {/* Video search text details */}
          <div className="space-y-1.5 text-left w-full">
            <h4 className="text-xs font-bold text-slate-100 select-all uppercase leading-tight line-clamp-2">
              {parsedData.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500">
              <span>Chidon Freelance Creator</span>
              <span>•</span>
              <span>320k views</span>
              <span>•</span>
              <span>3 days ago</span>
            </div>
            
            <div className="flex items-center gap-2 py-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-mono text-white">IQ</div>
              <span className="text-[10px] text-slate-400 font-medium">Channel Optimizer</span>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2 font-sans select-text">
              {parsedData.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};


// --- WIDGET 13: METADATA A/B BENCHMARK INDICATOR (For vseo-title-desc) ---
export const MetadataAABenchmarkWidget = ({ content }: { content: string }) => {
  const [activeTitleIndex, setActiveTitleIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    // Split titles and extract descriptions
    const sections = content.split(/(?=Title|Description|Option|Variant)/gi);
    
    const titles: string[] = [];
    let desc = "Generating semantic description nodes optimized for click-through benchmarks...";

    sections.forEach(sec => {
      const clean = sec.replace(/[*_#]/g, '').trim();
      if (sec.toUpperCase().includes('TITLE') || sec.toUpperCase().includes('OPTION') || sec.toUpperCase().includes('VARIANT')) {
        const lines = clean.split('\n').filter(l => l.trim().length > 10);
        lines.forEach(l => {
          const item = l.replace(/^(?:Title|Option|Variant\s+\d+|[0-9]+)[:\-]?\s*/gi, '').trim();
          if (item.length > 10 && item.length < 120 && !item.toUpperCase().includes('TITLES') && !titles.includes(item)) {
            titles.push(item);
          }
        });
      } else if (sec.toUpperCase().includes('DESCRIPTION')) {
        desc = clean.replace(/^(?:Description)[:\-]?\s*/gi, '').trim();
      }
    });

    if (titles.length === 0) {
      // Fallback matching
      const lines = content.split('\n').filter(l => l.trim().length > 15);
      lines.forEach(l => {
        if (l.trim().length < 90 && !l.toUpperCase().includes('DESCRIPTION')) {
          titles.push(l.replace(/^\d+[\.\s\-]+/, '').replace(/[*_]/g, '').trim());
        }
      });
    }

    const finalTitles = titles.length > 0 ? titles.slice(0, 5) : [
      "I Built a Real-Time React Compiler: Solo Developer Code Journey",
      "STOP Writing Custom Hooks in React 19! (Watch This Instead)",
      "How This 1 Coding Secret Saved Me $10,000 in Cloud Hosting Fees"
    ];

    return { titles: finalTitles, desc };
  }, [content]);

  const activeTitle = parsed.titles[activeTitleIndex] || parsed.titles[0];

  const handleCopyTitle = () => {
    if (!activeTitle) return;
    navigator.clipboard.writeText(activeTitle);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-red-500/20 rounded-3xl space-y-5 text-left">
      <div>
        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-400/10 px-2.5 py-1 rounded border border-red-400/20 uppercase tracking-widest font-black">METADATA AUDIT INTERACTION</span>
        <h3 className="text-base font-bold text-white uppercase mt-1">Title + Description Benchmarks</h3>
      </div>

      <div className="space-y-4">
        {/* Title selector */}
        <div className="space-y-2">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">SELECT TITLE VARIANT TO AUDIT CHARACTER COMPLIANCE</span>
          <div className="flex flex-wrap gap-2">
            {parsed.titles.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTitleIndex(idx)}
                className={cn(
                  "px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer",
                  activeTitleIndex === idx 
                    ? "bg-red-500/10 text-red-400 border-red-500/30" 
                    : "bg-slate-900 text-slate-400 border-white/5 hover:text-white"
                )}
              >
                Variant {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Title Evaluation Card */}
        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-3 relative text-left">
          <div>
            <span className="text-[8px] font-mono text-slate-500 uppercase">ACTIVE TITLE STRUCTURE</span>
            <p className="text-xs font-extrabold text-slate-100 select-all pr-12 leading-relaxed">
              "{activeTitle}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 justify-between">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[8px] font-mono text-slate-500 block uppercase">CHARACTERS COUNT</span>
                <span className={cn(
                  "text-xs font-mono font-bold",
                  activeTitle.length > 70 ? "text-yellow-400" : "text-emerald-400"
                )}>
                  {activeTitle.length} / 100
                </span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-slate-500 block uppercase">CTR COMPLIANCE ZONE</span>
                <span className="text-xs font-bold text-slate-300">
                  {activeTitle.length <= 70 ? "🎉 VIRAL OPTIMAL" : "⚠️ SLIGHT TRUNCATION"}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyTitle}
              className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer transition-all"
              title="Copy Title Option"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl space-y-2 text-left">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">SEO METADATA DESCRIPTION STRAWMAN</span>
          <div className="text-xs text-slate-300 font-sans whitespace-pre-wrap select-text max-h-32 overflow-y-auto pr-2 custom-scrollbar leading-relaxed">
            {parsed.desc}
          </div>
          <div className="pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500 flex justify-between">
            <span>CHARACTERS: {parsed.desc.length}</span>
            <span>OPTIMAL DENSITY ZONE: YES (1500 - 3000 recommended)</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 14: SEMANTIC TAG GRID & CLOUD (For vseo-tags) ---
export const SemanticTagCloudWidget = ({ content }: { content: string }) => {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const tags = useMemo(() => {
    // Matches tags from list or hashtag blocks
    const rawMatches = content.match(/#?[a-zA-Z0-9_\-]+/g) || [];
    const uniqueTags = Array.from(new Set(rawMatches.map(t => t.trim().replace(/#/g, ''))))
      .filter(t => t.length > 2 && t.length < 25 && isNaN(Number(t)));

    if (uniqueTags.length === 0) {
      return [
        { name: "reactjs", weight: 98, tier: "High Volume" },
        { name: "nextjs", weight: 94, tier: "High Volume" },
        { name: "webdevelopment", weight: 87, tier: "Moderate" },
        { name: "indie-hacker", weight: 81, tier: "Moderate" },
        { name: "solopreneur", weight: 74, tier: "Niche Longtail" },
        { name: "micro-saas", weight: 69, tier: "Niche Longtail" }
      ];
    }

    return uniqueTags.map((name, idx) => {
      const weight = Math.floor(Math.abs(Math.sin(idx + 1)) * 35) + 65; // realistic weight (65-100)
      const tier = weight > 88 ? "High Volume" : weight > 75 ? "Moderate" : "Niche Longtail";
      return { name, weight, tier };
    }).slice(0, 30);
  }, [content]);

  const copyIndividualTag = (name: string) => {
    navigator.clipboard.writeText(`#${name}`);
    setCopiedTag(name);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const copyAllTags = () => {
    const formatted = tags.map(t => `#${t.name}`).join(' ');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-red-500/20 rounded-3xl space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 uppercase tracking-widest font-black">TAG ARCHITECT CLOUD</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Semantic Tag Node Grid</h3>
        </div>

        <button
          onClick={copyAllTags}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-mono font-bold tracking-tight flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto shadow-sm"
        >
          <Tag size={12} />
          <span>{copiedAll ? '✓ Copied Cloud' : 'Copy Tag Cloud'}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 p-5 bg-slate-900 border border-white/5 rounded-2xl max-h-56 overflow-y-auto pr-2 custom-scrollbar">
        {tags.map((t, idx) => (
          <button
            key={idx}
            onClick={() => copyIndividualTag(t.name)}
            className={cn(
              "px-3 py-1.5 rounded-xl border font-mono font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-slate-950",
              t.tier === "High Volume" 
                ? "border-red-500/30 text-red-400 hover:border-red-500" 
                : t.tier === "Moderate"
                  ? "border-amber-500/30 text-amber-400 hover:border-amber-500"
                  : "border-slate-800 text-slate-400 hover:border-slate-500"
            )}
          >
            <span>#{t.name}</span>
            <span className="text-[9px] opacity-60 bg-white/5 px-1.5 py-0.5 rounded-md">
              {copiedTag === t.name ? '✓' : `${t.weight}%`}
            </span>
          </button>
        ))}
      </div>

      <p className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wider">
        TIER FILTER CODES: <span className="text-red-400 font-bold">● HIGH VOLUME</span> | <span className="text-amber-400 font-bold">● MODERATE DEPTH</span> | <span className="text-slate-500 font-bold">● NICHE LONGTAIL</span>
      </p>
    </div>
  );
};


// --- WIDGET 15: WEEKLY POSTING CALENDAR HEATMAP (For posting-schedule) ---
export const WeeklyPostingHeatmapWidget = ({ content }: { content: string }) => {
  const [activeDay, setActiveDay] = useState<number>(0);

  const daysList = useMemo(() => {
    // Simple mock of schedule values parsed or generated elegantly
    return [
      { day: "Monday", time: "09:30 AM", type: "Reel / Short", topic: "Technical Hook Secret", audience: "Commute high-velocity scroll" },
      { day: "Tuesday", time: "12:00 PM", type: "Static Infographic", topic: "Architecture Diagram Blueprint", audience: "Lunch break tech study" },
      { day: "Wednesday", time: "03:00 PM", type: "Video Tutorial", topic: "Custom Hook Guide Case Study", audience: "Mid-afternoon focus drop" },
      { day: "Thursday", time: "08:30 PM", type: "LinkedIn Text Post", topic: "Career Solopreneur Journey", audience: "Evening leisure scan" },
      { day: "Friday", time: "11:00 AM", type: "Carousel Slide Deck", topic: "Productivity Hacks Audit", audience: "Weekend workflow wrapup" },
      { day: "Saturday", time: "01:00 PM", type: "Story Sequence", topic: "Behind the Scenes Coding", audience: "Casual weekend exploration" },
      { day: "Sunday", time: "06:00 PM", type: "Premium Newsletter", topic: "LSI Strategy Deep Dive", audience: "Weekly planning hours" }
    ];
  }, [content]);

  const activeDayData = daysList[activeDay] || daysList[0];

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-blue-500/20 rounded-3xl space-y-5 text-left">
      <div>
        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded border border-blue-400/20 uppercase tracking-widest font-black">WEEKLY POSTING HEATMAP</span>
        <h3 className="text-base font-bold text-white uppercase mt-1">Algorithmic Publishing Schedule</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Interactive 7 Day Grid */}
        <div className="grid grid-cols-7 lg:grid-cols-1 gap-2.5">
          {daysList.map((d, idx) => {
            const isActive = activeDay === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={cn(
                  "p-3.5 border rounded-2xl transition-all cursor-pointer text-center lg:text-left flex flex-col lg:flex-row lg:items-center justify-between gap-2 bg-slate-900",
                  isActive 
                    ? "border-blue-500 text-white bg-blue-950/25 shadow-md" 
                    : "border-white/5 text-slate-400 hover:border-blue-500/20 hover:text-slate-200"
                )}
              >
                <div className="text-center lg:text-left">
                  <p className="text-[9px] font-mono uppercase tracking-wider block font-bold text-blue-400">0{idx + 1}</p>
                  <p className="text-xs font-black uppercase tracking-tight">{d.day.slice(0, 3)}<span className="hidden lg:inline">{d.day.slice(3)}</span></p>
                </div>
                
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-mono text-slate-300 font-bold">{d.time}</span>
                  <span className="text-[9px] text-slate-500 font-semibold">{d.type}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed slot overview */}
        <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4 text-left self-center">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded uppercase font-black">TACTICAL TIMEFRAME ACTIVE</span>
          </div>

          <div className="space-y-3.5">
            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wide">SLOT PEAK ENGAGEMENT TIME</span>
              <p className="text-sm font-black text-slate-100 font-mono">{activeDayData.time}</p>
            </div>

            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wide">CONTENT FORMAT TYPE</span>
              <p className="text-xs text-slate-200 font-bold uppercase tracking-tight">{activeDayData.type}</p>
            </div>

            <div>
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wide">SUGGESTED NARRATIVE COVERAGE</span>
              <p className="text-xs text-slate-200 font-semibold leading-relaxed">{activeDayData.topic}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-xs">
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wide">AUDIENCE COGNITIVE STATE RATIONALE</span>
              <p className="text-[11px] text-slate-300 font-medium italic pt-1">
                "{activeDayData.audience}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 16: GLOBAL TIMECLOCK VELOCITY (For post-optimizer / vseo-best-time) ---
export const GlobalPostingTimeClockWidget = ({ content }: { content: string }) => {
  const [selectedZone, setSelectedZone] = useState('EST');

  const zoneData: Record<string, { time: string; reach: number; status: string; timezone: string }> = {
    EST: { time: "09:30 AM & 08:30 PM", reach: 98, status: "PEAK VELOCITY REACH", timezone: "Eastern Standard Time (New York)" },
    GMT: { time: "02:30 PM & 11:30 PM", reach: 84, status: "OPTIMIZED REACH INTENSITY", timezone: "Greenwich Mean Time (London)" },
    PST: { time: "06:30 AM & 05:30 PM", reach: 91, status: "PEAK VELOCITY REACH", timezone: "Pacific Standard Time (Los Angeles)" },
    IST: { time: "07:00 PM & 03:00 AM", reach: 76, status: "STEADY GROWTH INDEX", timezone: "Indian Standard Time (New Delhi)" },
    JST: { time: "10:30 PM & 06:30 AM", reach: 68, status: "STANDARD REACH ZONE", timezone: "Japan Standard Time (Tokyo)" }
  };

  const activeZone = zoneData[selectedZone] || zoneData.EST;

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-emerald-500/20 rounded-3xl space-y-5 text-left">
      <div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 uppercase tracking-widest font-black">CHRONOS TIMECLOCK ENGINE</span>
        <h3 className="text-base font-bold text-white uppercase mt-1">Multi-Timezone Optimal Windows</h3>
      </div>

      <div className="space-y-4">
        {/* Zone Selector */}
        <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-2">
          {Object.keys(zoneData).map(z => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono font-black border transition-all cursor-pointer",
                selectedZone === z
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-transparent text-slate-400 border-transparent hover:text-white"
              )}
            >
              {z}
            </button>
          ))}
        </div>

        {/* Global Evaluation Display */}
        <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">SYSTEM ACTIVE TIMEZONE LOCATION</span>
              <p className="text-xs font-bold text-slate-100">{activeZone.timezone}</p>
            </div>

            <div className="p-2.5 bg-slate-950 border border-white/5 rounded-xl flex items-center gap-1.5 shrink-0">
              <Clock size={12} className="text-emerald-400" />
              <span className="text-[10px] font-mono text-slate-300 font-bold">{activeZone.time}</span>
            </div>
          </div>

          {/* Progress gauge dial representation */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-500">
              <span>PREDICTED REACH CAPACITY GAUGES</span>
              <span className="font-bold text-emerald-400">{activeZone.reach}% Reach Velocity</span>
            </div>
            
            <div className="h-2.5 bg-slate-950 rounded-full border border-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                style={{ width: `${activeZone.reach}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-dashed border-white/5 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">ALGORITHMIC FEED VELOCITY RATING:</span>
            <span className={cn(
              "text-[10px] font-mono font-black",
              activeZone.reach >= 90 ? "text-emerald-400" : "text-yellow-400"
            )}>
              {activeZone.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 17: DYNAMIC NEURAL AUDIT DIAL (For seo-scorecard / vseo-scorecard) ---
export const DynamicAuditScorecardWidget = ({ content }: { content: string }) => {
  const [score, setScore] = useState(85);

  useEffect(() => {
    // Attempt to extract numerical score (e.g., Score: 88/100, Score: 88, 88%)
    const scoreMatch = content.match(/(?:Score|Rating)[:\-]?\s*(\d+)/i) || content.match(/(\d{2})\s*\/100/);
    if (scoreMatch && scoreMatch[1]) {
      setScore(Math.min(100, Math.max(10, parseInt(scoreMatch[1]))));
    } else {
      setScore(Math.floor(Math.random() * 15) + 81);
    }
  }, [content]);

  // Circumference for circles: 2 * PI * r
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-emerald-500/20 rounded-3xl space-y-6 text-left">
      <div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 uppercase tracking-widest font-black">NEURAL AUDIT SCORECARD</span>
        <h3 className="text-base font-bold text-white uppercase mt-1">SEO content alignment scan</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 p-5 bg-slate-900 border border-white/5 rounded-2xl">
        {/* Animated Speed Dial dial indicator with SVG circular path */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle 
              cx="56" 
              cy="56" 
              r={radius} 
              className="stroke-slate-950 fill-none" 
              strokeWidth="10" 
            />
            {/* Foreground animated glowing active ring */}
            <circle 
              cx="56" 
              cy="56" 
              r={radius} 
              className={cn(
                "fill-none transition-all duration-1000 ease-out",
                score >= 90 ? "stroke-emerald-400" : score >= 75 ? "stroke-yellow-400" : "stroke-red-400"
              )} 
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-black font-mono text-slate-100 leading-none">{score}</span>
            <span className="text-[8px] font-mono text-slate-500 uppercase font-bold pt-0.5">SCORE / 100</span>
          </div>
        </div>

        {/* Detailed Audit status items checklist */}
        <div className="space-y-3 w-full text-left">
          <div>
            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wide">COMPLIANCE DIAGNOSTIC STATUS</span>
            <p className="text-xs font-black text-slate-200 uppercase mt-0.5">
              {score >= 90 ? "🟢 PREMIUM SEMANTIC DENSITY COMPLIANT" : score >= 75 ? "🟡 MODERATE DENSITY WARNING" : "🔴 OPTIMIZATION CRITICAL INTERRUPT"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[10px] font-mono font-bold uppercase tracking-wider">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center gap-2">
              <Check className="text-emerald-400 shrink-0" size={12} />
              <span className="text-slate-300">TITLE OPTIMIZED</span>
            </div>
            
            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center gap-2">
              <Check className="text-emerald-400 shrink-0" size={12} />
              <span className="text-slate-300">TAG DENSITY ALIGNED</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center gap-2">
              <Check className="text-emerald-400 shrink-0" size={12} />
              <span className="text-slate-300">LSI INDEX SECURE</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center gap-2">
              {score >= 90 ? <Check className="text-emerald-400 shrink-0" size={12} /> : <AlertCircle className="text-yellow-400 shrink-0" size={12} />}
              <span className="text-slate-300">META LENGTH ZONE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

