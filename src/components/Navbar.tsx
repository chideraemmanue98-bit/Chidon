import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChidonLogo } from './ChidonLogo';
import { LayoutGrid, Cpu, BookOpen, Settings, Zap, ArrowRight, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  user: any;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onMenuToggle: () => void;
  onNavigate: (view: any, feature?: any) => void;
  activeView: string;
}

/**
 * Premium, sticky layout top-navigation header.
 * High-contrast layout optimized for responsive screen densities.
 */
export const Navbar: React.FC<NavbarProps> = ({
  user,
  isDarkMode,
  setIsDarkMode,
  onMenuToggle,
  onNavigate,
  activeView
}) => {
  const { t } = useTranslation();

  return (
    <nav className="h-16 shrink-0 w-full bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-base)] z-30 sticky top-0 flex items-center justify-between px-4 sm:px-6 md:px-8">
      {/* Left side brand identification and mobile toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 md:hidden text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer text-left"
        >
          <ChidonLogo size="sm" />
          <span className="hidden sm:inline-block font-sans font-extrabold text-sm uppercase tracking-wider text-[var(--text-primary)]">
            Chidon<span className="text-brand font-black ml-0.5">IQ</span>
          </span>
        </button>
      </div>

      {/* Center dynamic routing links (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-1.5 bg-gray-100/60 dark:bg-gray-800/40 p-1 rounded-xl border border-[var(--border-base)]/50">
        <button
          onClick={() => onNavigate('dashboard')}
          className={cn(
            "px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
            activeView === 'dashboard' 
              ? "bg-white dark:bg-gray-700 text-brand shadow-sm font-black" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          {t('common.overview') || "Overview"}
        </button>
        <button
          onClick={() => onNavigate('hub')}
          className={cn(
            "px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
            activeView === 'hub' 
              ? "bg-white dark:bg-gray-700 text-brand shadow-sm font-black" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          {t('common.centralCommand') || "Command Center"}
        </button>

      </div>

      {/* Right side core action elements */}
      <div className="flex items-center gap-3">
        {/* Workspace state indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-brand/5 border border-brand/10 rounded-full font-mono text-[9px] font-black uppercase text-brand tracking-widest">
          <Zap size={10} className="text-brand animate-pulse" />
          Node Active
        </div>

        {/* Theme configuration toggle selector */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button 
            onClick={() => setIsDarkMode(false)} 
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer", 
              !isDarkMode ? "bg-white dark:bg-gray-700 text-brand shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            title="Light Mode"
          >
            <LayoutGrid size={14} />
          </button>
          <button 
            onClick={() => setIsDarkMode(true)} 
            className={cn(
              "p-1.5 rounded-md transition-all cursor-pointer", 
              isDarkMode ? "bg-white dark:bg-gray-700 text-brand shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            title="Dark Mode"
          >
            <Cpu size={14} />
          </button>
        </div>

        <div className="h-6 w-[1px] bg-[var(--border-base)] mx-1" />

        {/* Dynamic User Profile Indicator */}
        <button 
          onClick={() => onNavigate('auth')}
          className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border-base)]/80 hover:border-brand/30 bg-[var(--bg-card)] rounded-xl transition-all hover:shadow-sm cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center font-mono font-bold text-brand text-[9px] shrink-0">
            {user?.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-tight">
            {user?.displayName ? user.displayName.split(' ')[0] : 'Workspace Node'}
          </span>
        </button>
      </div>
    </nav>
  );
};
