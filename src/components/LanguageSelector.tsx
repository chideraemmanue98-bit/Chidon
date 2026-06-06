import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'ru', label: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵' }
];

interface LanguageSelectorProps {
  className?: string;
  isSettingsPage?: boolean;
}

export default function LanguageSelector({ className, isSettingsPage = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Synchronize document dir and html lang
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    const isRtl = currentLang.startsWith('ar');
    
    // Set text direction
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    // Fallback document.dir
    try {
      (document as any).dir = isRtl ? 'rtl' : 'ltr';
    } catch (e) {
      console.warn(e);
    }

    // Set document lang for SEO
    document.documentElement.lang = currentLang;
    try {
      (document as any).lang = currentLang;
    } catch (e) {
      console.warn(e);
    }
  }, [i18n.language]);

  const currentLangObj = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center cursor-pointer select-none transition-all duration-200 border",
          isSettingsPage
            ? "gap-2 px-3 py-2 rounded-xl text-xs font-semibold w-full justify-between bg-white dark:bg-zinc-850 hover:bg-neutral-50 dark:hover:bg-zinc-800 border-neutral-200 dark:border-zinc-800 text-[var(--text-primary)]"
            : "gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-[var(--border-base)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm"
        )}
      >
        <span className="flex items-center gap-1.5">
          <Globe size={isSettingsPage ? 14 : 11} className="text-brand flex-shrink-0 animate-pulse" />
          <span className={isSettingsPage ? "text-sm" : "text-xs"}>{currentLangObj.flag}</span>
          <span className={cn("truncate", !isSettingsPage && "uppercase font-mono text-[10px] font-bold tracking-wider")}>
            {isSettingsPage ? currentLangObj.native : currentLangObj.code}
          </span>
        </span>
        <ChevronDown size={isSettingsPage ? 12 : 9} className={cn("transition-transform duration-300 flex-shrink-0 text-slate-400 dark:text-zinc-500", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-transparent cursor-default"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "absolute z-50 mt-2 w-52 bg-white dark:bg-zinc-905 border border-neutral-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden p-1.5 focus:outline-none",
                // Position properly depending on environment
                isSettingsPage ? "left-0" : "right-0"
              )}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold font-mono text-neutral-400 dark:text-zinc-500 uppercase tracking-widest border-b border-neutral-100 dark:border-zinc-800/60 mb-1">
                Select Language
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
                {LANGUAGES.map((lang) => {
                  const isCurrent = i18n.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer select-none",
                        isCurrent
                          ? "bg-brand/10 text-brand font-bold"
                          : "text-neutral-600 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-zinc-800/80 hover:text-brand"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      {isCurrent && <Check size={14} className="text-brand flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
