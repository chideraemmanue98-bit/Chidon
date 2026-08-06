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
  ExternalLink
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Reset avatar state when variants switch
  useEffect(() => {
    setAvatarUrl(null);
    setError(null);
  }, [activeBioIndex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(bios[activeBioIndex] || content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAvatar = async () => {
    setGenerating(true);
    setError(null);
    setAvatarUrl(null);
    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `A high-quality minimalist professional social media profile avatar graphic icon. Cohesive design matching identity theme: "${bios[activeBioIndex].slice(0, 150)}". Modern creator portrait or abstract branding symbol, elegant solid background, flat graphic illustration style.`,
          aspectRatio: "1:1"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setAvatarUrl(data.imageUrl);
      } else {
        throw new Error('No avatar concept graphics received from neural renderer.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to synthesize avatar graphic.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-pink-500/20 rounded-3xl space-y-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-pink-500 bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20 uppercase tracking-widest">LIVE WRITING PREVIEW</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">High-CTR Profile Display</h3>
        </div>
        
        <div className="flex gap-1.5 bg-slate-900 border border-white/10 rounded-xl p-1 self-start sm:self-auto">
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
        <div className="flex flex-col items-center justify-center md:col-span-1 space-y-4">
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
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Custom Avatar" 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      ) : generating ? (
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center animate-pulse">
                          <span className="text-[7px] font-mono text-pink-400 font-extrabold animate-pulse">AI...</span>
                        </div>
                      ) : (
                        <User size={24} className="text-slate-400" />
                      )}
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
                <div className="py-2 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-900 text-slate-300 font-extrabold cursor-pointer">
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

          <div className="space-y-2.5">
            <button
              onClick={handleGenerateAvatar}
              disabled={generating}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>✨ {avatarUrl ? 'Regenerate Custom Avatar' : 'Synthesize Custom Avatar'}</span>
            </button>

            {error && (
              <p className="text-[10px] font-mono text-red-400 font-bold bg-red-500/5 p-2 rounded-xl text-center">
                ⚠️ {error}
              </p>
            )}

            <button
              onClick={handleCopy}
              className="w-full py-3 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Copy size={13} />
              <span>{copied ? '✓ Preset Copied Successfully' : 'Copy Selected Bio'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- WIDGET 3: BLUEPRINT DESIGN CANVAS (For Thumbnails) ---
export const ThumbnailCanvasWidget = ({ content }: { content: string }) => {
  const [activeConceptIndex, setActiveConceptIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'blueprint' | 'render'>('blueprint');

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

  // Reset generated image on tab change
  useEffect(() => {
    setImageUrl(null);
    setError(null);
    setViewMode('blueprint');
  }, [activeConceptIndex]);

  const handleGenerateImage = async () => {
    setGenerating(true);
    setError(null);
    setViewMode('render');
    try {
      const response = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `A professional high-quality YouTube creator video thumbnail design concept. High contrast color palette elements: ${details.palette.join(', ')}. Focal visual elements layout: ${details.elements}. High-impact, eye-catching, modern tech creator aesthetics. Clean composition, cinematic lighting. It includes bold title graphic: "${details.headline}"`,
          aspectRatio: "16:9"
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        throw new Error('No design concept graphics received from neural renderer.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect with the AI Studio image generation node.');
      setViewMode('blueprint');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-amber-500/20 rounded-3xl space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-widest">TACTICAL THUMBNAIL MAP</span>
          <h3 className="text-base font-bold text-white uppercase mt-1">Composition Wireframe & Rendering</h3>
        </div>
        
        <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-xl p-1 self-start sm:self-auto">
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
        <div className="lg:col-span-1 p-4 bg-slate-900 rounded-2xl border border-white/5 relative space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Active Viewport</span>
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5 gap-1">
              <button 
                onClick={() => setViewMode('blueprint')}
                className={cn("px-2 py-1 text-[9px] font-mono rounded-md font-bold uppercase transition-all cursor-pointer", viewMode === 'blueprint' ? "bg-slate-800 text-white" : "text-slate-500")}
              >
                Blueprint Map
              </button>
              <button 
                onClick={() => setViewMode('render')}
                disabled={!imageUrl && !generating}
                className={cn("px-2 py-1 text-[9px] font-mono rounded-md font-bold uppercase transition-all cursor-pointer disabled:opacity-30", viewMode === 'render' ? "bg-amber-500 text-black" : "text-slate-500")}
              >
                AI Art Render
              </button>
            </div>
          </div>

          <div className="aspect-video bg-zinc-950 border-2 border-dashed border-amber-500/30 rounded-xl flex flex-col justify-between p-4 relative overflow-hidden">
            {viewMode === 'render' && imageUrl ? (
              <img 
                src={imageUrl} 
                alt="AI Generated Design Concept" 
                className="absolute inset-0 w-full h-full object-cover z-20" 
                referrerPolicy="no-referrer"
              />
            ) : generating ? (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-30">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-[0.2em] animate-pulse">Running Neural Art Model...</span>
              </div>
            ) : (
              <>
                {/* Rule of Thirds Grid overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 z-0">
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
                  <span>16:9 HD WIREFRAME</span>
                </div>

                {/* Simulated focal points */}
                <div className="flex justify-between items-center w-full z-10 flex-grow pt-2 select-none">
                  {/* Left element reacting face */}
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-center text-[7px] font-mono text-slate-300">
                    FOCAL FACE
                  </div>

                  {/* Big impact title overlay */}
                  <div 
                    className="p-3 bg-red-600 rounded-xl text-center text-xs font-black tracking-tighter uppercase text-white shadow-2xl max-w-[120px] truncate"
                    style={{ backgroundColor: details.palette[0] }}
                    title={details.headline}
                  >
                    {details.headline}
                  </div>
                </div>

                {/* Downer Indicators */}
                <div className="flex justify-between items-center text-[7px] font-mono z-10 select-none pt-2">
                  <span className="text-amber-400">● PLACEMENT VECTORS COHESIVE</span>
                  <span className="text-slate-500">ZOOM VALUE: 1.5x</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerateImage}
              disabled={generating}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-black font-mono font-bold text-[10px] tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              <span>✨ {imageUrl ? 'Regenerate Art Concept' : 'Synthesize Design Concept'}</span>
            </button>
            {imageUrl && (
              <a
                href={imageUrl}
                download={`chidon-thumbnail-frame-${activeConceptIndex + 1}.png`}
                className="px-3.5 py-2.5 bg-slate-950 border border-white/10 hover:border-amber-500/30 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                title="Download PNG Graphic"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>
            )}
          </div>

          {error && (
            <p className="text-[10px] font-mono text-red-400 font-bold bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl text-left">
              ⚠️ {error}
            </p>
          )}

        </div>

        {/* Detailed text and color instructions */}
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Composition Specs</span>
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-xs space-y-3 font-medium text-left">
              <div>
                <span className="text-slate-400 block uppercase text-[8.5px]">Color Swatch</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
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


// --- CRAWLER WEB BROWSER WIDGET (Web search grounded high-speed browser) ---
export const ChidonIQCrawlerWidget = () => {
  const [platform, setPlatform] = useState<'all' | 'youtube' | 'tiktok' | 'facebook'>('all');
  const [category, setCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [logsHeightRef, setLogsHeightRef] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    handleCrawl(true);
  }, []);

  const handleCrawl = async (initialRun = false) => {
    setLoading(true);
    setTerminalLogs([]);
    const logs = [
      "[SYS] Initializing Headless Chromium sandbox...",
      "[SYS] Configured user headers for secure sandboxed environment...",
      "[SYS] Loading search crawler database via real-time grounding...",
    ];
    
    // Simulate web browser terminal diagnostics
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setTerminalLogs(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    try {
      const response = await fetch("/api/trends/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          category,
          searchQuery,
          bypassCache: !initialRun
        })
      });

      const data = await response.json();
      
      setTimeout(() => {
        if (data.success && data.videos) {
          setVideos(data.videos);
          setTerminalLogs(prev => [
            ...prev,
            `[SYS] Navigation success: Found ${data.videos.length} breakout assets.`,
            `[SYS] Parsed viewport successfully. Pipeline Synchronized.`
          ]);
        } else {
          throw new Error(data.error || "Failed to crawl target social API indices");
        }
        setLoading(false);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setTimeout(() => {
        setTerminalLogs(prev => [
          ...prev,
          `[FAIL] Browser engine exception: ${err.message}`,
          `[SYS] Triggering failover offline replica index...`
        ]);
        setLoading(false);
      }, 1200);
    }
  };

  const categories = [
    { id: 'general', label: 'General Trends' },
    { id: 'tech', label: 'Tech & Digital' },
    { id: 'productivity', label: 'Productivity & SaaS' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'lifestyle', label: 'Lifestyle & Hot ASMR' },
    { id: 'finance', label: 'Creator Finance & Wealth' }
  ];

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-cyan-500/10 rounded-3xl space-y-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-black text-cyan-primary bg-cyan-primary/10 px-2.5 py-1 rounded border border-cyan-primary/20 uppercase tracking-widest animate-pulse">CRAWLER ONLINE</span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">PORT 3000 / LIVE WEB GROUNDED</span>
          </div>
          <h3 className="text-xl font-display font-black text-white mt-1 uppercase tracking-tight">Universal Crawl Indexer</h3>
          <p className="text-slate-400 text-xs mt-1">Real-time head-scanning system querying YouTube, TikTok, and Facebook Reels daily trending matrices.</p>
        </div>
        
        <button
          onClick={() => handleCrawl(false)}
          disabled={loading}
          className="px-5 py-2.5 bg-cyan-primary text-black hover:bg-cyan-primary/90 disabled:opacity-50 font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin duration-1000"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          )}
          <span>{loading ? "Crawling Web..." : "Refresh Live Index"}</span>
        </button>
      </div>

      {/* SECURE BROWSER ADDRESS CONTAINER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2.5 flex items-center gap-4">
          {/* Browser Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-505/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          {/* Browser Path Bar */}
          <div className="flex-1 bg-slate-950 border border-slate-800 px-4 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono text-slate-400 select-all font-medium relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span className="text-cyan-primary">https://</span>
            <span>chidon-crawler.agency.engine/trending-crawl/{platform}?cat={category}</span>
          </div>
        </div>

        {/* BROWSER SETTINGS & PARAMETERS BAR */}
        <div className="p-4 bg-slate-950 border-b border-white/[0.03] grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Platforms Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-white/5">
            {[
              { id: 'all', label: 'All' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'facebook', label: 'Facebook' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id as any)}
                className={cn(
                  "flex-1 py-1.5 px-3 font-mono font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer text-center",
                  platform === p.id 
                    ? "bg-slate-800 text-white border border-white/10" 
                    : "text-slate-500 hover:text-slate-350"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dropdown for Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 text-xs font-mono text-slate-300 font-bold border border-white/5 px-4 py-2.5 rounded-xl focus:border-cyan-primary outline-none cursor-pointer appearance-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <span className="text-[8px] font-mono">▼</span>
            </div>
          </div>

          {/* Manual Query Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search specific topic keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCrawl(false)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs font-mono text-slate-300 outline-none focus:border-cyan-primary placeholder:text-slate-705"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 text-slate-555"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
        </div>

        {/* SIMULATED WEB BROWSER TERMINAL DIAGNOSTICS SCREEN */}
        <div className="bg-slate-950 p-4 font-mono text-[10px] leading-relaxed border-b border-white/[0.03]">
          <div className="flex justify-between text-slate-555 mb-2 font-black tracking-wider uppercase">
            <span>Terminal Sandbox Diagnostics Launcher</span>
            <span>OS Console</span>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-lg border border-white/[0.02] max-h-24 overflow-y-auto space-y-1 text-left text-cyan-primary/70">
            {terminalLogs.length === 0 && (
              <span className="text-slate-700 font-extrabold">[INFO] Standing by. Ready to execute real-time social crawler.</span>
            )}
            {terminalLogs.map((log, idx) => (
              <div key={idx} className={cn(
                "font-bold",
                log.includes("[FAIL]") ? "text-red-400" : log.includes("[SUCCESS]") || log.includes("success") ? "text-emerald-400" : ""
              )}>
                {log}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-cyan-400 font-black animate-pulse">
                <span>[INFO] Executing live Universal Crawl Indexer query indexing...</span>
              </div>
            )}
          </div>
        </div>

        {/* VIDEOS RESULTS DISPLAY CONTAINER */}
        <div className="p-4 bg-slate-950 min-h-64">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 border-4 border-cyan-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-xs font-mono font-bold text-cyan-primary">CRAWLER RUNNING ACTIVE WINDOWS</p>
                <p className="text-[10px] text-slate-500 font-medium">Scraping daily hot breakout metrics across the web engine...</p>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <span className="text-2xl">🔍</span>
              <p className="text-xs font-mono text-slate-500 font-bold uppercase">No database metrics scanned</p>
              <p className="text-slate-600 text-[10px] max-w-sm mx-auto">Please select your configurations and tap the launch protocol above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {videos.map((vid, idx) => {
                const isYT = vid.platform === 'youtube';
                const isTK = vid.platform === 'tiktok';
                const isFB = vid.platform === 'facebook';
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-5 bg-slate-900 border border-white/5 hover:border-cyan-primary/25 rounded-2xl flex flex-col justify-between gap-5 text-left group transition-all hover:-translate-y-0.5"
                  >
                    <div className="space-y-3.5">
                      {/* Technical Platform Header */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded text-[8px] font-mono font-black border uppercase tracking-wider",
                            isYT ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            isTK ? "bg-pink-505/10 text-pink-400 border-pink-500/20" :
                            "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}>
                            {vid.platform}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 font-bold">{vid.publishedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[9px] font-mono text-slate-400 font-black">{vid.viralityScore}% VIRAL</span>
                        </div>
                      </div>

                      {/* Video Title */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-cyan-primary transition-colors line-clamp-2 leading-snug">
                          {vid.title}
                        </h4>
                        <p className="text-xs font-mono text-indigo-400 font-bold">{vid.creator}</p>
                      </div>

                      {/* Video Summary */}
                      <p className="text-xs text-slate-400 font-medium leading-relaxed leading-snug">
                        {vid.summary}
                      </p>

                      {/* Replicating Tactics Area */}
                      <div className="space-y-1.5 pt-1.5 border-t border-white/[0.04]">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500 font-extrabold">Chidon IQ Replicating Strategy</span>
                        <ul className="space-y-1">
                          {vid.tactics?.map((tac: string, tIdx: number) => (
                            <li key={tIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300 font-medium">
                              <span className="text-cyan-primary text-xs select-none">✓</span>
                              <span className="leading-tight">{tac}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer engagement metric & action button */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-white/[0.04]">
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 uppercase block leading-none">Scanned Engagement</span>
                        <span className="text-xs font-mono font-black text-slate-200">{vid.views}</span>
                      </div>

                      <a
                        href={vid.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="py-1.5 px-3 bg-slate-950 border border-slate-800 hover:border-cyan-primary/30 text-white font-mono font-bold text-[9px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open Original Context</span>
                        <ExternalLink size={10} className="text-slate-400 group-hover:text-cyan-primary" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
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

// --- WIDGET: TREND HEATMAP VISUALIZER (For Trend Detector) ---
export interface HeatmapCell {
  region: string;
  niche: string;
  intensity: number; // 0-100
  growthRate: string; // +250% etc
  primaryChannel: "TikTok" | "YouTube Search" | "Google Trends" | "X / Twitter" | "Reddit Discussions";
  topSubtopic: string;
  velocity: "fading" | "stable" | "surging" | "exploding";
}

export const TrendHeatmapWidget: React.FC = () => {
  const [activeSector, setActiveSector] = useState<'all' | 'tech' | 'creator' | 'ecommerce'>('all');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [scanPulse, setScanPulse] = useState<number>(0);
  const [scanLogs, setScanLogs] = useState<string>("[SYSTEM] Regional crawlers online. Monitoring interest vectors...");

  const regions = [
    "North America",
    "Western Europe",
    "East Asia",
    "South Asia",
    "Latin America",
    "Middle East & Africa"
  ];

  const niches = useMemo(() => {
    switch (activeSector) {
      case 'tech':
        return [
          "Local Business AI Agents",
          "Solopreneur Micro-SaaS",
          "No-Code Workflow Automations",
          "Vertical API Wrappers"
        ];
      case 'creator':
        return [
          "Faceless Audio & Video",
          "Micro-learning Clips",
          "Interactive Live Polls",
          "Sovereign Creator Hubs"
        ];
      case 'ecommerce':
        return [
          "Hyper-local Print On Demand",
          "AI-Assisted Gift Sourcing",
          "Sustainable Packaging Assets",
          "Niche Audio-Book Subscriptions"
        ];
      case 'all':
      default:
        return [
          "Local Business AI Agents",
          "Faceless Audio & Video",
          "Solopreneur Micro-SaaS",
          "Micro-learning Clips",
          "Hyper-local Print On Demand",
          "No-Code Workflow Automations"
        ];
    }
  }, [activeSector]);

  // Generate deterministic/semi-random heatmap cell data
  const gridData = useMemo(() => {
    const data: HeatmapCell[] = [];
    const channels: HeatmapCell['primaryChannel'][] = ["TikTok", "YouTube Search", "Google Trends", "X / Twitter", "Reddit Discussions"];
    
    regions.forEach((region) => {
      niches.forEach((niche) => {
        // Deterministic seeding based on strings
        const hash = region.charCodeAt(0) + niche.charCodeAt(0) + niche.length;
        const baseIntensity = (hash % 60) + 40; // 40-100%
        
        // Add variations
        const intensity = Math.min(100, Math.max(10, baseIntensity));
        const growthValue = Math.floor(intensity * 3.8) + (hash % 45);
        const growthRate = `+${growthValue}%`;
        const primaryChannel = channels[hash % channels.length];
        
        // Dynamic subtopics
        let topSubtopic = "General interest spike";
        if (niche.includes("AI")) topSubtopic = "Local agency SEO setups";
        else if (niche.includes("Faceless")) topSubtopic = "Silent vlog loops & aesthetics";
        else if (niche.includes("Micro-SaaS")) topSubtopic = "Single-purpose billing widgets";
        else if (niche.includes("Micro-learning")) topSubtopic = "Speed-ramped history hooks";
        else if (niche.includes("Print")) topSubtopic = "Eco-themed customizable cups";
        else if (niche.includes("No-Code")) topSubtopic = "Automated email newsletters";

        let velocity: HeatmapCell['velocity'] = "stable";
        if (intensity > 85) velocity = "exploding";
        else if (intensity > 65) velocity = "surging";
        else if (intensity < 45) velocity = "fading";

        data.push({
          region,
          niche,
          intensity,
          growthRate,
          primaryChannel,
          topSubtopic,
          velocity
        });
      });
    });
    return data;
  }, [niches, activeSector]);

  // Simulate scanning updates
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanPulse(prev => (prev + 1) % 4);
      const updates = [
        `[SCAN] Real-time spike detected for "${niches[Math.floor(Math.random() * niches.length)]}" in ${regions[Math.floor(Math.random() * regions.length)]}.`,
        `[PULSE] High-velocity interest spike parsed: +${Math.floor(Math.random() * 200) + 150}% search volume trajectory.`,
        `[CRAWLER] Chromium node logged 4,200 micro-conversions in modern sub-communities.`,
        `[SYS] Updated regional heat indices for selected sector metrics.`
      ];
      setScanLogs(updates[Math.floor(Math.random() * updates.length)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isScanning, niches]);

  const getCellColor = (intensity: number) => {
    // 0-30: Slate default
    // 30-55: Cool Indigo
    // 55-75: Royal Purple
    // 75-90: Deep Amethyst
    // 90-100: Glowing Neon Orange/Amber Spikes (No slop gradients, pure mathematical density colors)
    if (intensity < 45) return "bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-500";
    if (intensity < 65) return "bg-blue-950/40 hover:bg-blue-950/60 border-blue-900/30 text-blue-300";
    if (intensity < 80) return "bg-indigo-950/60 hover:bg-indigo-950/80 border-indigo-800/40 text-indigo-200";
    if (intensity < 90) return "bg-purple-950/80 hover:bg-purple-900 border-purple-700/50 text-purple-200";
    return "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/40 text-amber-400 font-black shadow-lg shadow-amber-500/5";
  };

  const getVelocityTagColor = (vel: HeatmapCell['velocity']) => {
    switch (vel) {
      case 'exploding': return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'surging': return 'text-purple-400 bg-purple-500/10 border border-purple-500/20';
      case 'stable': return 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
      case 'fading': return 'text-slate-500 bg-slate-500/10 border border-slate-500/20';
    }
  };

  return (
    <div className="card-base p-6 bg-slate-950 border-2 border-indigo-500/10 rounded-3xl space-y-6 text-left" id="trend-heatmap-widget-container">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 uppercase tracking-widest">
            Interactive Global Heat Indices
          </span>
          <h3 className="text-lg font-display font-black text-white uppercase mt-1 flex items-center gap-2">
            Regional Niche Interest Spike Heatmap
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
            Real-time visual diagnostic mapping of high-intensity niche trend spikes, computed by regional query velocity, click momentum, and forum conversations.
          </p>
        </div>
        
        {/* Toggle scanning */}
        <button
          onClick={() => setIsScanning(!isScanning)}
          className={cn(
            "px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 border cursor-pointer transition-all self-start sm:self-center",
            isScanning 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
          )}
          id="toggle-heatmap-scanner"
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", isScanning ? "bg-emerald-400 animate-ping" : "bg-slate-500")} />
          {isScanning ? "Active Live Scanning" : "Scanner Paused"}
        </button>
      </div>

      {/* Segment Selector & Live ticker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sectors */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1 border border-slate-850 rounded-2xl" id="heatmap-sector-tabs">
          {[
            { id: 'all', label: 'All Sectors' },
            { id: 'tech', label: 'AI & SaaS Tech' },
            { id: 'creator', label: 'Creator Playbooks' },
            { id: 'ecommerce', label: 'E-Commerce niches' }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSector(sec.id as any);
                setHoveredCell(null);
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-black uppercase tracking-wide transition-all border-none cursor-pointer",
                activeSector === sec.id
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              )}
              id={`sector-tab-${sec.id}`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Live system logs ticker */}
        <div className="flex-1 max-w-md bg-slate-900/40 border border-slate-850 px-3 py-1.5 rounded-xl flex items-center gap-2.5 overflow-hidden">
          <span className="text-[8px] font-mono font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
            Feed
          </span>
          <span className="text-[10px] font-mono text-slate-400 line-clamp-1 select-none leading-none pt-0.5">
            {scanLogs}
          </span>
        </div>
      </div>

      {/* Grid Layout Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="heatmap-grid-root">
        {/* The Matrix Heatmap Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden p-4 relative" id="heatmap-canvas-container">
          
          {/* Heatmap Area Grid */}
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[650px] space-y-2 pb-2">
              {/* Header row: regions */}
              <div className="grid grid-cols-7 gap-2 pb-1 text-center items-center">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-left font-black pr-2">
                  Topic / Niche
                </div>
                {regions.map((reg, idx) => (
                  <div 
                    key={idx} 
                    className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-extrabold"
                  >
                    {reg}
                  </div>
                ))}
              </div>

              {/* Rows matching each niche */}
              {niches.map((niche, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-7 gap-2 items-center">
                  {/* Niche title card */}
                  <div className="text-left py-1 pr-2">
                    <span className="text-[11px] font-bold text-slate-200 line-clamp-2 leading-tight">
                      {niche}
                    </span>
                  </div>

                  {/* Intensity cells */}
                  {regions.map((region, colIdx) => {
                    const cell = gridData.find(c => c.region === region && c.niche === niche);
                    if (!cell) return <div key={colIdx} />;
                    const isHovered = hoveredCell && hoveredCell.region === region && hoveredCell.niche === niche;

                    return (
                      <div
                        key={colIdx}
                        onMouseEnter={() => setHoveredCell(cell)}
                        className={cn(
                          "h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-crosshair select-none text-center p-1",
                          getCellColor(cell.intensity),
                          isHovered ? "ring-2 ring-indigo-500 scale-[1.03] z-10" : ""
                        )}
                        id={`heatmap-cell-${rowIdx}-${colIdx}`}
                      >
                        <span className="text-xs font-mono font-black">{cell.intensity}%</span>
                        <span className="text-[8px] font-mono font-bold opacity-80">{cell.growthRate}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Color bar legend indicator */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900 text-[9px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>Heat Legend:</span>
              <div className="flex items-center rounded-lg overflow-hidden border border-slate-850">
                <span className="px-2 py-0.5 bg-slate-900/60 text-slate-500 font-bold border-r border-slate-850">Stable (&lt;45%)</span>
                <span className="px-2 py-0.5 bg-blue-950/50 text-blue-300 font-bold border-r border-slate-850">Rising (45-65%)</span>
                <span className="px-2 py-0.5 bg-indigo-950/70 text-indigo-200 font-bold border-r border-slate-850">Strong (65-80%)</span>
                <span className="px-2 py-0.5 bg-purple-950 text-purple-200 font-bold border-r border-slate-850">High (80-90%)</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-black">Exploding (&gt;90%)</span>
              </div>
            </div>
            <span>* Hover over cells for tactical niche diagnostic data</span>
          </div>
        </div>

        {/* Live Diagnostic Panel */}
        <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between gap-5 relative overflow-hidden" id="heatmap-diagnostics">
          {/* Subtle decorative background scanner line */}
          {isScanning && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500/40 animate-pulse shadow-md shadow-indigo-500" style={{
              transform: `translateY(${scanPulse * 35}px)`,
              transition: 'transform 1s ease-in-out'
            }} />
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
              <Activity size={14} className="text-indigo-400 animate-pulse" />
              <h4 className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                Live Diagnostics
              </h4>
            </div>

            {hoveredCell ? (
              <div className="space-y-4 text-left animate-in fade-in duration-350" id="hovered-details-container">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest block">Region Location</span>
                  <p className="text-xs font-black text-white uppercase">{hoveredCell.region}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest block">Niche Constellation</span>
                  <p className="text-xs font-extrabold text-slate-200 line-clamp-2 leading-snug">{hoveredCell.niche}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">Spike Heat</span>
                    <span className="text-sm font-mono font-black text-white">{hoveredCell.intensity}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">Growth Trajectory</span>
                    <span className="text-sm font-mono font-black text-emerald-400">{hoveredCell.growthRate}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Spike Velocity</span>
                  <div className="flex">
                    <span className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider", getVelocityTagColor(hoveredCell.velocity))}>
                      {hoveredCell.velocity}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Top Conversion Channel</span>
                  <p className="text-xs font-bold text-slate-300">{hoveredCell.primaryChannel}</p>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-850">
                  <span className="text-[8px] font-mono text-indigo-400 uppercase tracking-wider block font-black">Suggested Playbook action</span>
                  <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-[10px] text-slate-300 leading-relaxed font-sans">
                    Target <strong className="text-white">{hoveredCell.topSubtopic}</strong> specifically on <strong className="text-indigo-300">{hoveredCell.primaryChannel}</strong> to lock early organic SEO placements.
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2" id="heatmap-diagnostics-placeholder">
                <Compass size={22} className="text-slate-700 mx-auto animate-spin" style={{ animationDuration: '6s' }} />
                <p className="font-mono text-[9px] leading-relaxed max-w-[150px] mx-auto uppercase tracking-wider">
                  Hover over any heatmap grid cell to compile deep diagnostic telemetry
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[9px] font-mono text-slate-500 leading-normal text-left">
            <span>Grid indices are updated dynamically based on global micro-volume search alerts inside ChidonIQ nodes.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

