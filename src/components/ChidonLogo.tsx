import React from 'react';
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
      {/* Scalable Glowing Brand Icon from generated asset */}
      <div className={cn("relative shrink-0 flex items-center justify-center overflow-hidden rounded-[24%] border border-slate-200/10 dark:border-white/10 shadow-lg bg-[#23222d]", iconSizeClass)}>
        <img
          src="/src/assets/images/chidon_iq_logo_1783910164800.jpg"
          alt="Chidon IQ Logo"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Ambient background glow orb */}
        <div className="absolute inset-0 bg-blue-500/10 rounded-full filter blur-xl -z-10 animate-pulse" />
      </div>

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
