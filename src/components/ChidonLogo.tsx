import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface ChidonLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  iconOnly?: boolean;
  className?: string;
}

export const ChidonLogo: React.FC<ChidonLogoProps> = ({
  size = 'md',
  iconOnly = false,
  className,
}) => {
  const [logoExists, setLogoExists] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Detect dark mode from html element class
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Check if logo-light.png and logo-dark.png exist
    const img = new Image();
    img.src = '/logo-light.png';
    img.onload = () => setLogoExists(true);
    img.onerror = () => setLogoExists(false);

    return () => observer.disconnect();
  }, []);

  // Determine pixel sizes for the icon and typography container
  let iconSizeClass = 'h-8 w-8';
  let textClass = 'text-lg';
  let gapClass = 'gap-3';

  if (typeof size === 'number') {
    iconSizeClass = `h-[${size}px] w-[${size}px]`;
    textClass = size > 40 ? 'text-2xl' : size > 30 ? 'text-lg' : 'text-sm';
  } else {
    switch (size) {
      case 'xs':
        iconSizeClass = 'h-6 w-6';
        textClass = 'text-sm';
        gapClass = 'gap-2';
        break;
      case 'sm':
        iconSizeClass = 'h-7 w-7';
        textClass = 'text-base';
        gapClass = 'gap-2.5';
        break;
      case 'md':
        iconSizeClass = 'h-9 w-9';
        textClass = 'text-lg';
        gapClass = 'gap-3';
        break;
      case 'lg':
        iconSizeClass = 'h-12 w-12';
        textClass = 'text-2xl';
        gapClass = 'gap-4';
        break;
      case 'xl':
        iconSizeClass = 'h-24 w-24';
        textClass = 'text-4xl';
        gapClass = 'gap-6';
        break;
    }
  }

  return (
    <div className={cn("flex items-center select-none font-sans", gapClass, className)}>
      {logoExists ? (
        <img
          src={isDark ? '/logo-dark.png' : '/logo-light.png'}
          alt="Chidon Logo"
          className={cn(iconSizeClass, "object-contain")}
          referrerPolicy="no-referrer"
        />
      ) : (
        /* Scalable Glowing SVG Icon with dark mode CSS filter invert fallback */
        <div className={cn("relative shrink-0 flex items-center justify-center transition-all", iconSizeClass, isDark ? "invert" : "")}>
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Definitions for Gradients and Filters */}
            <defs>
              {/* C Logo Main Gradient (Blue to Indigo-Violet) */}
              <linearGradient id="c-gradient" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>

              {/* Glowing Trend Line Gradient (Cyan to Sky Blue) */}
              <linearGradient id="trend-line-gradient" x1="40" y1="65" x2="90" y2="15" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Glowing filter for nodes */}
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Styled C Path (Custom thick round ring segment with custom inner terminals) */}
            <path
              d="M 76,28 
                 A 34,34 0 1,0 76,72 
                 L 61,60.5 
                 A 16.5,16.5 0 1,1 61,39.5 
                 Z"
              fill="url(#c-gradient)"
            />

            {/* Glowing Diagonal Trend Line with accurate angles & intersections */}
            <path
              d="M 41,55 
                 L 48,48 
                 L 58,45 
                 L 72,35 
                 L 86,22"
              stroke="url(#trend-line-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Data Nodes (Glowing interactive points) */}
            {/* Node 1 - Lower middle */}
            <circle
              cx="58"
              cy="45"
              r="4.5"
              fill="#22d3ee"
              filter="url(#neon-glow)"
              className="animate-pulse"
            />
            <circle cx="58" cy="45" r="3" fill="#ffffff" />

            {/* Node 2 - Upper middle */}
            <circle
              cx="72"
              cy="35"
              r="4.5"
              fill="#22d3ee"
              filter="url(#neon-glow)"
            />
            <circle cx="72" cy="35" r="3" fill="#ffffff" />

            {/* Node 3 - Apex point right edge */}
            <circle
              cx="86"
              cy="22"
              r="5"
              fill="#38bdf8"
              filter="url(#neon-glow)"
            />
            <circle cx="86" cy="22" r="3.5" fill="#ffffff" />
          </svg>

          {/* Ambient background glow orb */}
          <div className="absolute inset-0 bg-blue-500/10 rounded-full filter blur-xl -z-10 animate-pulse" />
        </div>
      )}

      {/* Brand Typography */}
      {!iconOnly && (
        <span className={cn("font-black tracking-tight select-none flex items-center leading-none uppercase", textClass)}>
          <span className="text-slate-950 dark:text-white transition-colors duration-200">Chidon</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 ml-2 font-black tracking-widest drop-shadow-[0_2px_10px_rgba(34,211,238,0.4)]">IQ</span>
        </span>
      )}
    </div>
  );
};
