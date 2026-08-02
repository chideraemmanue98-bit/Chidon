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
  HelpCircle,
  ArrowRight
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
    { role: 'assistant', content: "Protocol CHIDON IQ Guide online. I am your specialized intelligence navigator. How can I assist your social strategy or platform navigation today?" }
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else if (!isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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

      const data = await res.json();
      const aiResponse = data.text || "Direct uplink failed. Please re-initiate command.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error("CHIDON IQ Uplink Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Critical Error: Signal lost. Please check your connection or API key protocol." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (topic: string) => {
    setInput(topic);
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
            className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-brand to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand/20 z-50 hover:scale-110 active:scale-95 transition-all group border-4 border-white dark:border-slate-900 cursor-pointer"
            id="chidon-intelligence-trigger"
          >
            <Cpu size={26} className="group-hover:animate-pulse" />
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 80, scale: 0.95 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 80, scale: 0.95 }}
            className={cn(
              "fixed bg-white/95 dark:bg-[#090d16]/95 border border-slate-200/80 dark:border-white/10 shadow-2xl z-[200] overflow-hidden flex flex-col transition-all duration-300 backdrop-blur-xl",
              isMobile 
                ? "inset-0 rounded-none w-full h-full" 
                : "bottom-24 right-8 w-[420px] h-[680px] rounded-[2rem] border"
            )}
            id="chidon-intelligence-panel"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-slate-50/50 to-indigo-50/20 dark:from-indigo-950/10 dark:to-transparent flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand/10 dark:bg-brand/20 rounded-xl text-brand">
                  <Cpu size={18} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-display font-black text-slate-800 dark:text-white uppercase tracking-wider">Chidon IQ Intelligence</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Secure Uplink Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                title="Minimize panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-transparent selection:bg-brand/10"
            >
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  ref={i === messages.length - 1 ? lastMessageRef : null}
                  className={cn(
                    "flex gap-3.5",
                    m.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                    m.role === 'assistant' 
                      ? "bg-brand/10 border-brand/20 text-brand dark:bg-brand/25" 
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  )}>
                    {m.role === 'assistant' ? <Cpu size={16} /> : <User size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4.5 rounded-2xl text-xs sm:text-sm leading-relaxed font-sans shadow-sm text-left",
                    m.role === 'assistant' 
                      ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200" 
                      : "bg-brand text-white border border-brand"
                  )}>
                    <div className="markdown-body text-inherit">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand/10 dark:bg-brand/25 border border-brand/20 text-brand flex items-center justify-center shrink-0 animate-pulse">
                    <Cpu size={16} />
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3 shadow-sm">
                    <Loader2 size={14} className="text-brand animate-spin" />
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest animate-pulse">Decrypting Signal...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-6 pb-4 flex gap-2 overflow-x-auto custom-scrollbar shrink-0 pt-2 bg-slate-50/50 dark:bg-transparent border-t border-slate-100 dark:border-white/5">
              {[
                'How to save content?', 
                'Tell me about Competitor Lab', 
                'Notepad help', 
                'Hashtag Engine guide', 
                'What is Neural Hub?'
              ].map(tip => (
                <button
                  key={tip}
                  onClick={() => handleQuickAction(tip)}
                  className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-white/10 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase font-bold transition-all shadow-sm flex items-center gap-1 hover:text-brand dark:hover:text-white cursor-pointer"
                >
                  <span>{tip}</span>
                  <ArrowRight size={10} className="opacity-40" />
                </button>
              ))}
            </div>

            {/* Input Form Tray */}
            <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#090d16]/40 shrink-0">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question or request guidance..."
                  className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-xl py-3.5 pl-5 pr-14 text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-brand/50 dark:focus:border-brand/40 transition-all font-sans"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 p-2 bg-brand text-white rounded-lg hover:bg-brand/95 transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer disabled:pointer-events-none"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-center mt-3.5 text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5">
                <Zap size={10} className="text-brand opacity-65" />
                Chidon IQ Tactical Intelligence Hub v4.1.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
