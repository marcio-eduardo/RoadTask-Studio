import React from 'react';

interface RoadTaskLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export const RoadTaskLogo: React.FC<RoadTaskLogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { width: 32, height: 32, textClass: 'text-xs' },
    md: { width: 44, height: 44, textClass: 'text-sm' },
    lg: { width: 64, height: 64, textClass: 'text-lg' },
    xl: { width: 96, height: 96, textClass: 'text-2xl' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Animated 3-Bar Insignia */}
      <div
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
        className="relative flex items-center justify-center shrink-0 group cursor-pointer"
      >
        {/* Ambient Neon Aura */}
        <div
          className={`absolute inset-0 rounded-xl bg-gradient-to-br from-safira-500/25 via-cyan-500/20 to-safira-600/15 blur-md ${
            animated ? 'animate-pulse' : ''
          }`}
        />

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="rt-bar-1" x1="8" y1="12" x2="44" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="rt-bar-2" x1="16" y1="26" x2="52" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            <linearGradient id="rt-bar-3" x1="24" y1="40" x2="60" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="rt-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Obsidian Tech Chassis */}
          <rect
            x="3"
            y="3"
            width="58"
            height="58"
            rx="16"
            fill="#080C16"
            stroke="#1E293B"
            strokeWidth="1.5"
          />

          {/* Bar 1 (Top Road/Task Track - Early Phase) */}
          <g>
            <rect
              x="10"
              y="14"
              width="32"
              height="8"
              rx="4"
              fill="url(#rt-bar-1)"
              filter="url(#rt-glow)"
              className="opacity-95"
            />
            {/* Inner Light Core Pulse */}
            <rect
              x="12"
              y="16.5"
              width="28"
              height="3"
              rx="1.5"
              fill="#E0F2FE"
              opacity="0.8"
            >
              {animated && (
                <animate
                  attributeName="opacity"
                  values="0.4;1;0.4"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>

          {/* Bar 2 (Middle Road/Task Track - Active Execution) */}
          <g>
            <rect
              x="18"
              y="28"
              width="30"
              height="8"
              rx="4"
              fill="url(#rt-bar-2)"
              filter="url(#rt-glow)"
              className="opacity-95"
            />
            {/* Inner Light Core Pulse */}
            <rect
              x="20"
              y="30.5"
              width="26"
              height="3"
              rx="1.5"
              fill="#E0F2FE"
              opacity="0.8"
            >
              {animated && (
                <animate
                  attributeName="opacity"
                  values="0.5;1;0.5"
                  dur="2.4s"
                  begin="0.4s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>

          {/* Bar 3 (Bottom Road/Task Track - Final Delivery / Milestone) */}
          <g>
            <rect
              x="26"
              y="42"
              width="30"
              height="8"
              rx="4"
              fill="url(#rt-bar-3)"
              filter="url(#rt-glow)"
              className="opacity-95"
            />
            {/* Inner Light Core Pulse */}
            <rect
              x="28"
              y="44.5"
              width="26"
              height="3"
              rx="1.5"
              fill="#E0F2FE"
              opacity="0.8"
            >
              {animated && (
                <animate
                  attributeName="opacity"
                  values="0.6;1;0.6"
                  dur="2.4s"
                  begin="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>
        </svg>
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-black tracking-wider text-white uppercase ${iconDimensions.textClass}`}>
              ROADTASK
            </span>
            <span
              className={`font-black tracking-widest bg-gradient-to-r from-safira-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent uppercase ${iconDimensions.textClass}`}
            >
              STUDIO
            </span>
          </div>
          {size !== 'sm' && (
            <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase mt-0.5">
              Executive Timeline Engine
            </span>
          )}
        </div>
      )}
    </div>
  );
};
