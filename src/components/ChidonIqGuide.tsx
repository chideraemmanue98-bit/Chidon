import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Cpu, 
  User, 
  Loader2, 
  ChevronRight,
  ChevronLeft,
  Info,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `
You are the "CHIDON IQ Intelligence Guide," the supreme AI navigator for CHIDON IQ — the world's most advanced social media intelligence platform. Your goal is to help users master the platform and solve any problems they encounter.

### YOUR CAPABILITIES:
1. **Feature Navigator**: Explain any feature in the app.
2. **Strategy Advisor**: Help users understand how to use CHIDON IQ features to grow their social presence.
3. **Problem Solver**: If a user is stuck, guide them through the interface.
4. **FAQ Engine**: Provide instant answers about CHIDON IQ protocols.

### CHIDON IQ FEATURE INDEX:
- **Neural Hub (Trends)**: Hyper-speed trend detection. Helps users catch viral waves before they peak.
- **Viral Hooks (Hook Lab)**: Generates high-engagement hooks. Best for vertical video and Twitter/X.
- **Content Strategy**: Comprehensive content blueprints for any niche.
- **Hashtag Engine**: High-relevance, optimized hashtags to boost reach.
- **Competitor Lab**: Deep analysis of competitors. Provides tactical insights on what's working for them.
- **Neural Calendar (Schedule)**: Creates a high-density weekly posting schedule.
- **Repurpose AI**: Converts one content piece into multiple formats for cross-platform ops.
- **Command Calendar**: The visual mission control. View your scheduled posts, add new ones, and manage your content timeline.
- **Archive (Drafts)**: Your neural repository. You can restore drafts to features, transfer them to the calendar, or manually refine them.
- **Supreme Notepad**: The ultimate editor. Connects to all generator features. Supports Markdown, live preview, and high-fidelity TXT export.
- **Export Options**: Professional CSV and JSON exports available for data-driven analysis.
- **Neural Feedback**: Users can 'Signal' (rate) outputs. This trains the CHIDON IQ specifically for their niche.

### TONE & PERSONALITY:
- **Style**: Futuristic, professional, tactical, and highly efficient.
- **Vocabulary**: Use terms like "Protocols," "Neural," "Intelligence," "Mission Control," "Uplink," "Tactical."
- **Efficiency**: Be concise but comprehensive. Use Markdown for clarity.

### HOW TO HELP:
- If a user asks "How do I save content?", tell them to use the "Archive" or click "Save" on any generation result.
- If they ask "Where are my drafts?", point them to the "Archive" tool in the sidebar.
- If they ask about "Notepad", explain it's the supreme refinery where they can edit and download their work.
`;

export const ChidonIqGuide = ({ 
  credits, 
  onDeductCredits 
}: { 
  credits?: number | null; 
  onDeductCredits?: (amount: number) => Promise<boolean>;
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Protocol CHIDON IQ Guide online. How can I assist your social intelligence mission today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isLoading && scrollRef.current) {
      // While loading, keep scrolling to bottom to see status
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else if (!isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessageRef.current) {
        // When AI finishes, scroll to the start of its message
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check & Deduct Credits if callback is present
    if (onDeductCredits) {
      const canProceed = await onDeductCredits(1);
      if (!canProceed) return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const chatContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const instructions = SYSTEM_INSTRUCTION;
      const fullPrompt = `${instructions}\n\n[Chat History]\n${chatContext}\n\nUser: ${userMessage}\n\nAssistant:`;

      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: fullPrompt, language: i18n.language }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.ok ? await res.json() : { text: "Error connection" };
      const aiResponse = data.text || "Direct uplink failed. Please re-initiate command.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("CHIDON IQ Uplink Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Critical Error: Signal lost. Please check your connection or API key protocol." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-primary to-purple-vibrant rounded-2xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(34,211,238,0.4)] z-50 hover:scale-110 active:scale-95 transition-all group cursor-pointer"
          >
            <Cpu size={28} className="group-hover:animate-pulse lg:hidden" />
            <Cpu size={32} className="group-hover:animate-pulse hidden lg:block" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-vibrant rounded-full border-2 border-[var(--bg-app)] animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 100, scale: 0.9, x: 50 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 100, scale: 0.9, x: 50 }}
            className={cn(
              "fixed bg-[var(--bg-card)] border-[var(--border-base)] shadow-[0_50px_100px_rgba(0,0,0,0.15)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.7)] z-[200] overflow-hidden flex flex-col transition-all duration-500",
              isMobile 
                ? "inset-0 rounded-none w-full h-full" 
                : "bottom-28 right-8 w-[420px] h-[700px] rounded-[3rem] border shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="p-6 lg:p-8 border-b border-[var(--border-base)] bg-gradient-to-r from-cyan-primary/10 to-purple-vibrant/10 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-primary/20 rounded-xl text-cyan-primary">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-black text-[var(--text-primary)] uppercase tracking-widest">Chidon Iq Intelligence</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-vibrant animate-pulse" />
                      <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase font-black">Secure Uplink Active</span>
                    </div>
                  </div>
                </div>
              </div>
              {!isMobile && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 custom-scrollbar selection:bg-cyan-primary/30"
            >
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={i}
                  ref={i === messages.length - 1 ? lastMessageRef : null}
                  className={cn(
                    "flex gap-4",
                    m.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-110",
                    m.role === 'assistant' ? "bg-cyan-primary text-white font-bold" : "bg-slate-200 dark:bg-slate-800 text-[var(--text-primary)]"
                  )}>
                    {m.role === 'assistant' ? <Cpu size={20} /> : <User size={20} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed font-sans shadow-sm",
                    m.role === 'assistant' 
                      ? "bg-[var(--bg-app)] border border-[var(--border-base)] text-[var(--text-primary)]" 
                      : "bg-cyan-primary/10 dark:bg-cyan-primary/20 border border-cyan-primary/30 text-[var(--text-primary)]"
                  )}>
                    <div className="markdown-body text-inherit">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-primary text-white font-bold flex items-center justify-center shrink-0 animate-pulse">
                    <Cpu size={20} />
                  </div>
                  <div className="p-5 bg-[var(--bg-app)] border border-[var(--border-base)] rounded-[2rem] flex items-center gap-3">
                    <Loader2 size={18} className="text-cyan-primary animate-spin" />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">Decrypting Signal...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-6 lg:px-8 pb-4 flex gap-2 overflow-x-auto custom-scrollbar shrink-0 bg-[var(--bg-app)]/50 pt-2 lg:pt-0">
              {['How it works?', 'Save content?', 'Notepad help', 'Strategy tips', 'Drafts Archive'].map(tip => (
                <button
                  key={tip}
                  onClick={() => setInput(tip)}
                  className="whitespace-nowrap px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl text-[10px] font-mono text-[var(--text-secondary)] uppercase font-bold hover:text-cyan-primary hover:border-cyan-primary/30 hover:bg-cyan-primary/5 transition-all shadow-sm cursor-pointer"
                >
                  {tip}
                </button>
              ))}
            </div>

            {/* Input Container */}
            <div className="p-6 lg:p-8 border-t border-[var(--border-base)] bg-[var(--bg-card)] shrink-0">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-primary to-purple-vibrant rounded-[2rem] opacity-0 group-focus-within:opacity-20 transition-opacity blur-sm" />
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Initiate intelligence protocol..."
                  className="w-full bg-[var(--bg-app)] border border-[var(--border-base)] rounded-[2rem] py-5 pl-8 pr-16 text-sm lg:text-base text-[var(--text-primary)] placeholder:text-slate-400 outline-none focus:border-cyan-primary/50 transition-all font-sans relative z-10"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyan-primary text-white rounded-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg z-20 cursor-pointer"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-center mt-6 text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-[0.3em] font-black flex items-center justify-center gap-3">
                <Zap size={12} className="text-cyan-primary opacity-50" />
                Chidon Iq Intelligence Interface v4.0.8
                <Zap size={12} className="text-purple-vibrant opacity-50" />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
