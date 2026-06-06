import React from 'react';

interface ChidonIqLogoProps {
  className?: string;
  size?: number | string;
  withText?: boolean;
  textClass?: string;
  cropped?: boolean;
}

export const ChidonIqLogo: React.FC<ChidonIqLogoProps> = ({
  className = '',
  size = 32,
  withText = false,
  textClass = '',
  cropped = false
}) => {
  // Convert standard size to pixel value if it's a number
  const parsedSize = typeof size === 'number' ? `${size}px` : size;

  const svgContent = (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Modern high-contrast color gradient for the C logo */}
        <linearGradient id="cLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2962ff" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Glow effect filter for the trend line and dots */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradient for the diagonal line */}
        <linearGradient id="lineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Styled letter C with outer and inner arc */}
      <path
        d="M 66,24 C 66,24 60,18, 52,18 C 32,18 18,32 18,52 C 18,72 32,86 52,86 C 60,86 66,80 66,80 L 59,70 C 59,70 55,73 51,73 C 40,73 31,64 31,52 C 31,40 40,31 51,31 C 55,31 59,34 59,34 Z"
        fill="url(#cLogoGrad)"
        className="drop-shadow-lg"
      />

      {/* Trend line through the stylized C */}
      <path
        d="M 43,51 L 52,43 C 54,41 57,41 59,43 L 71,29"
        stroke="url(#lineGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Connected nodes (dots) - glowing teal/cyan */}
      {/* Node 1 */}
      <circle
        cx="43"
        cy="51"
        r="3"
        fill="#22d3ee"
        filter="url(#logoGlow)"
      />
      {/* Node 2 */}
      <circle
        cx="54"
        cy="41"
        r="3"
        fill="#22d3ee"
        filter="url(#logoGlow)"
      />
      {/* Node 3 */}
      <circle
        cx="70"
        cy="30"
        r="4.5"
        fill="#22d3ee"
        filter="url(#logoGlow)"
      />
    </svg>
  );

  // If cropped is requested, render inside a beautifully framed container resembling the user's uploaded image
  if (cropped) {
    return (
      <div 
        className={`flex items-center gap-3 ${className}`}
        style={{ height: parsedSize }}
      >
        <div 
          className="relative rounded-2xl bg-[#1e2230] p-2 flex items-center justify-center shrink-0 border border-[#2b3046]/45 select-none overflow-hidden group shadow-lg"
          style={{ width: parsedSize, height: parsedSize }}
        >
          {/* Subtle soft backdrop radial glow */}
          <div className="absolute inset-x-0 -inset-y-2 bg-[#2962ff]/10 blur-md rounded-full pointer-events-none group-hover:bg-[#2962ff]/15 transition-all" />
          <div className="w-full h-full relative z-10">
            {svgContent}
          </div>
        </div>

        {withText && (
          <div className={`flex items-center text-left ${textClass}`}>
            <span className="font-sans font-black tracking-tight text-white">Chidon</span>
            <span className="font-sans font-black tracking-tight text-brand ml-1">IQ</span>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render only the SVG or direct SVG inline
  if (withText) {
    return (
      <div 
        className={`flex items-center gap-2.5 ${className}`}
        style={{ height: parsedSize }}
      >
        <div className="shrink-0 aspect-square" style={{ width: parsedSize, height: parsedSize }}>
          {svgContent}
        </div>
        <div className={`flex items-center text-left ${textClass}`}>
          <span className="font-sans font-black tracking-tight text-[var(--text-primary)]">Chidon</span>
          <span className="font-sans font-black tracking-tight text-brand ml-1">IQ</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`aspect-square justify-center items-center flex ${className}`}
      style={{ width: parsedSize, height: parsedSize }}
    >
      {svgContent}
    </div>
  );
};
