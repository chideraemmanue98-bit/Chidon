import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Cpu, LayoutGrid, BookOpen, Settings, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChidonLogo } from './ChidonLogo';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  view: string;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  navigateTo: (view: any, feature?: any) => void;
  activeFeature?: string;
  onSignIn?: () => void;
  sidebarContent: React.ReactNode;
  headerTitle: string;
}

/**
 * Production-ready, responsive main application shell.
 * Inspired by modern Stripe / Linear dark interfaces.
 * Centers all content beautifully with max-w-7xl container and responsive grid alignments.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  view,
  isDarkMode,
  setIsDarkMode,
  isMenuOpen,
  setIsMenuOpen,
  navigateTo,
  activeFeature,
  sidebarContent,
  headerTitle
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col font-sans selection:bg-brand/30 selection:text-white overflow-hidden relative text-[var(--text-primary)]">
      
      {/* Premium ambient light spots (hidden or subtle to match aesthetic) */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand/5 dark:bg-brand/10 filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 filter blur-[120px] pointer-events-none" />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* DESKTOP SIDEBAR: Permanent left sidebar on desktop, responsive slide-out on mobile */}
        <aside className={cn(
          "fixed md:sticky top-0 inset-y-0 left-0 z-[100] w-64 bg-[var(--bg-card)] border-r border-[var(--border-base)] flex flex-col transform transition-transform duration-300 md:translate-x-0 h-screen shadow-xl md:shadow-none shrink-0",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-[var(--border-base)]">
            <button 
              onClick={() => {
                navigateTo('dashboard');
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <ChidonLogo size="sm" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all active:scale-95 cursor-pointer"
              title="Close Menu"
            >
              <X size={20} className="text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Sidebar Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {sidebarContent}
          </div>

          {/* Workspace user node footer */}
          <div className="p-4 border-t border-[var(--border-base)]">
            <button 
              onClick={() => {
                navigateTo('auth');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-[var(--border-base)]/40 transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center font-mono font-black text-brand text-xs">
                {user?.email ? user.email.slice(0, 2).toUpperCase() : 'WM'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {user?.displayName || 'Workspace Node'}
                </p>
                <p className="text-[9px] font-mono text-[var(--text-secondary)] truncate">
                  {user?.email || 'Tap to sync credentials'}
                </p>
              </div>
            </button>
          </div>
        </aside>

        {/* MOBILE SLIDEOVER SHADOW BACKDROP */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[90] md:hidden cursor-pointer"
            />
          )}
        </AnimatePresence>

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
          
          {/* STICKY TOP NAVBAR */}
          <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-base)] z-30 sticky top-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 md:hidden text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer"
              >
                <Menu size={20} />
              </button>
              
              <div className="flex items-center gap-2">
                <span className="md:hidden"><ChidonLogo size="xs" iconOnly /></span>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-[var(--text-primary)] truncate">
                  {headerTitle}
                </h2>
              </div>
            </div>

            {/* Quick Actions & Themes Panel */}
            <div className="flex items-center gap-3">
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

              <button 
                onClick={() => navigateTo('tools', 'drafts')}
                className={cn(
                  "p-2 rounded-lg text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand transition-all cursor-pointer",
                  view === 'tools' && activeFeature === 'drafts' && "text-brand bg-brand/5"
                )}
                title="CHIDON Vault"
              >
                <BookOpen size={18} />
              </button>
              
              <button 
                onClick={() => navigateTo('matrix')}
                className={cn(
                  "p-2 rounded-lg text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-brand transition-all cursor-pointer",
                  view === 'matrix' && "text-brand bg-brand/5"
                )}
                title="Matrix Command"
              >
                <Settings size={18} />
              </button>
            </div>
          </header>

          {/* MAIN CONTAINER: Fully Scrollable & Responsive */}
          <main className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col justify-start items-center">
              {children}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};
