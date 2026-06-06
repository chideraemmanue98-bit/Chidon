import { motion } from 'motion/react';
import { ChidonIqLogo } from './ChidonIqLogo';

interface LoadingOverlayProps {
  title?: string;
  subtitle?: string;
  statusText?: string;
}

export const LoadingOverlay = ({
  title = "CHIDON IQ",
  subtitle = "COMMENCING SECURE PROTOCOL",
  statusText = "Decrypting user node..."
}: LoadingOverlayProps) => {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-primary/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* Animated logo container */}
        <div className="relative mb-6">
          <div className="absolute inset-x-0 -inset-y-2 bg-brand/25 blur-xl rounded-full animate-pulse" />
          <ChidonIqLogo size={64} cropped className="relative z-10 animate-pulse shadow-[0_0_30px_rgba(var(--brand-rgb),0.3)]" />
          {/* Minimal spinning ring around logo */}
          <div 
            className="absolute -inset-2.5 rounded-[22px] border-2 border-t-brand border-r-cyan-primary/50 border-b-transparent border-l-transparent animate-spin" 
            style={{ animationDuration: '1.5s' }} 
          />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[10px] uppercase font-mono text-cyan-primary tracking-[0.2em] mt-1.5 font-semibold animate-pulse">
            {subtitle}
          </p>
        )}
        
        <div className="w-48 bg-white/5 h-[2px] rounded-full overflow-hidden mt-6 relative border border-white/10">
          <motion.div 
            className="bg-gradient-to-r from-brand to-cyan-primary h-full rounded-full"
            initial={{ width: "0%", left: "0%" }}
            animate={{ 
              width: ["0%", "50%", "100%", "50%", "0%"],
              x: ["0%", "50%", "100%", "50%", "0%"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
        
        {statusText && (
          <p className="text-xs text-slate-500 font-medium font-mono tracking-wide mt-4">
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
};
