import React from 'react';

interface AlphaAgentLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const AlphaAgentLogo: React.FC<AlphaAgentLogoProps> = ({
  className = '',
  size,
  glow = false,
}) => {
  const defaultSizeClass = !size && !className ? 'w-8 h-8' : className;
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${defaultSizeClass}`} style={style}>
      {glow && (
        <div className="absolute inset-0 bg-emerald-500/25 blur-md rounded-full pointer-events-none -z-10" />
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="cableGradEmerald" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="cableGradCyan" x1="30" y1="40" x2="90" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <filter id="alphaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#10b981" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* --- 1. Outer Cable Frame forming Capital 'A' Arch --- */}
        <path
          d="M 22 84 L 38 18 C 40 13 46 10 52 10 C 58 10 64 13 66 18 L 80 84"
          stroke="url(#cableGradEmerald)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#alphaGlow)"
        />

        {/* --- 2. Main Horizontal Crossbar Cable --- */}
        <path
          d="M 33 52 L 70 52"
          stroke="url(#cableGradCyan)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Secondary Parallel Conduit / Accent Cross Line */}
        <path
          d="M 37 60 L 67 60"
          stroke="#06b6d4"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* --- 3. Right Looping Cable Branch with Terminal Node Jack --- */}
        {/* Curving out from the crossbar rightward and curving up like an audio/data probe */}
        <path
          d="M 68 52 C 78 52 82 54 86 48 C 89 43 86 36 82 34"
          stroke="url(#cableGradCyan)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Terminal Jack / Node Circle on Right Branch */}
        <circle cx="82" cy="34" r="5" fill="#0B0F19" stroke="#38bdf8" strokeWidth="3" />
        <circle cx="82" cy="34" r="1.5" fill="#38bdf8" />

        {/* --- 4. Downward Hanging Cable (Terminal Drop) with Node --- */}
        <path
          d="M 66 60 L 68 83"
          stroke="#06b6d4"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="68" cy="88" r="5" fill="#0B0F19" stroke="#06b6d4" strokeWidth="2.5" />
        <circle cx="68" cy="88" r="1.5" fill="#38bdf8" />

      </svg>
    </div>
  );
};

export default AlphaAgentLogo;
