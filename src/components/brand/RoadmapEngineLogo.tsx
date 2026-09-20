import React from 'react';

interface RoadmapEngineLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export const RoadmapEngineLogo: React.FC<RoadmapEngineLogoProps> = ({
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
      {/* Animated Engine Mark SVG */}
      <div
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
        className="relative flex items-center justify-center shrink-0 group cursor-pointer"
      >
        {/* Ambient Glow Aura */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-safira-500/25 via-indigo-600/20 to-ouro-500/20 blur-md ${
            animated ? 'animate-pulse' : ''
          }`}
        />

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="re-track-grad" x1="4" y1="8" x2="60" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>

            <linearGradient id="re-core-grad" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <filter id="re-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Hex-Plate (Obsidian Tech Chassis) */}
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="16"
            fill="#090E1A"
            stroke="#1E293B"
            strokeWidth="1.5"
          />

          {/* Timeline Track 1 (Top Accelerated Curve) */}
          <path
            d="M 12 18 Q 30 18 36 28"
            stroke="url(#re-track-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={animated ? '60' : undefined}
            strokeDashoffset={animated ? '0' : undefined}
            className={animated ? 'animate-[dash_3s_ease-in-out_infinite]' : ''}
          />

          {/* Timeline Track 2 (Forward Thrust Diagonal) */}
          <path
            d="M 14 46 Q 24 46 32 36 L 48 18"
            stroke="url(#re-track-grad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={animated ? '80' : undefined}
            className={animated ? 'animate-[dash_2.5s_ease-in-out_infinite_reverse]' : ''}
          />

          {/* Timeline Track 3 (Lower Support Vector) */}
          <path
            d="M 32 36 L 48 48"
            stroke="url(#re-track-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Pulse Node 1 (Start of Path) */}
          <circle cx="12" cy="18" r="3" fill="#38BDF8" filter="url(#re-glow)">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          {/* Pulse Node 2 (Branch Node) */}
          <circle cx="14" cy="46" r="3" fill="#38BDF8" filter="url(#re-glow)">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>

          {/* Pulse Node 3 (Convergence Milestone) */}
          <circle cx="48" cy="18" r="3.5" fill="#38BDF8" filter="url(#re-glow)" />

          {/* Pulse Node 4 (Delivery Milestone) */}
          <circle cx="48" cy="48" r="3" fill="#818CF8" />

          {/* Engine Core (Central Diamond Gear / Turbine) */}
          <g transform="translate(32, 32)">
            {/* Outer Orbit Ring */}
            <circle
              cx="0"
              cy="0"
              r="10"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.6"
              className={animated ? 'animate-[spin_10s_linear_infinite]' : ''}
            />

            {/* Central Diamond Milestone Core */}
            <rect
              x="-6"
              y="-6"
              width="12"
              height="12"
              rx="2.5"
              fill="url(#re-core-grad)"
              stroke="#FDE68A"
              strokeWidth="1.5"
              transform="rotate(45)"
              filter="url(#re-glow)"
              className="transition-transform group-hover:scale-125 duration-300"
            >
              {animated && (
                <animate
                  attributeName="stroke-opacity"
                  values="0.5;1;0.5"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </rect>

            {/* Inner Core Spark */}
            <circle cx="0" cy="0" r="2" fill="#FFFFFF">
              {animated && (
                <animate
                  attributeName="r"
                  values="1.5;2.5;1.5"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </g>
        </svg>
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className={`font-black tracking-wider text-white uppercase ${iconDimensions.textClass}`}>
              ROADMAP
            </span>
            <span
              className={`font-black tracking-widest bg-gradient-to-r from-safira-400 via-safira-300 to-indigo-400 bg-clip-text text-transparent uppercase ${iconDimensions.textClass}`}
            >
              ENGINE
            </span>
          </div>
          {size !== 'sm' && (
            <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase mt-0.5">
              Executive Timeline Suite
            </span>
          )}
        </div>
      )}
    </div>
  );
};
