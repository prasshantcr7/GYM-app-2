"use client";

import React from 'react';

interface AnatomicalModelProps {
  activeGroup: string; // legs, shoulders, biceps, triceps, back, chest
}

export default function AnatomicalModel({ activeGroup }: AnatomicalModelProps) {
  const normalizedGroup = activeGroup.toLowerCase();

  // Helper to determine styles based on active muscle group
  const getMuscleStyle = (groups: string[]) => {
    const isActive = groups.includes(normalizedGroup);
    return {
      fill: isActive ? 'rgba(255, 46, 147, 0.25)' : 'rgba(255, 255, 255, 0.02)',
      stroke: isActive ? '#FF2E93' : 'rgba(255, 255, 255, 0.12)',
      strokeWidth: isActive ? '1.5' : '1',
      filter: isActive ? 'url(#glow)' : 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const getNeutralStyle = () => ({
    fill: 'rgba(255, 255, 255, 0.01)',
    stroke: 'rgba(255, 255, 255, 0.08)',
    strokeWidth: '0.75',
  });

  return (
    <div className="w-full glass-panel rounded-2xl p-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      {/* Dynamic Background Glow matching the active state */}
      <div className="absolute inset-0 bg-radial at-center from-white/0 via-white/0 to-white/0 pointer-events-none" />
      
      <div className="w-full flex justify-between items-center text-xs font-mono tracking-widest text-slate-400 border-b border-white/5 pb-2 mb-2">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent animate-pulse"></span>
          ANATOMICAL MAP
        </span>
        <span className="text-rose-accent uppercase font-bold">{activeGroup} active</span>
      </div>

      <div className="flex w-full max-w-[280px] justify-between items-center gap-4">
        {/* FRONT VIEW */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">FRONT</span>
          <svg viewBox="0 0 100 150" className="w-full h-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Head & Neck */}
            <circle cx="50" cy="15" r="7" style={getNeutralStyle()} />
            <path d="M47 22 L47 26 L53 26 L53 22 Z" style={getNeutralStyle()} />

            {/* Shoulders (Front) */}
            <path d="M34 27 C30 27 27 29 27 34 L31 36 L36 31 Z" style={getMuscleStyle(['shoulders'])} />
            <path d="M66 27 C70 27 73 29 73 34 L69 36 L64 31 Z" style={getMuscleStyle(['shoulders'])} />

            {/* Chest */}
            <path d="M37 32 L49 32 L49 46 L37 42 Z" style={getMuscleStyle(['chest'])} />
            <path d="M63 32 L51 32 L51 46 L63 42 Z" style={getMuscleStyle(['chest'])} />

            {/* Core / Abs */}
            <path d="M42 48 L58 48 L56 70 L44 70 Z" style={getMuscleStyle(['core'])} />

            {/* Biceps (Front) */}
            <path d="M26 36 C24 39 23 44 25 48 L29 44 L29 36 Z" style={getMuscleStyle(['biceps'])} />
            <path d="M74 36 C76 39 77 44 75 48 L71 44 L71 36 Z" style={getMuscleStyle(['biceps'])} />

            {/* Forearms */}
            <path d="M25 49 L20 64 L24 64 L28 49 Z" style={getMuscleStyle(['forearms'])} />
            <path d="M75 49 L80 64 L76 64 L72 49 Z" style={getMuscleStyle(['forearms'])} />

            {/* Hands */}
            <circle cx="19" cy="67" r="2.5" style={getNeutralStyle()} />
            <circle cx="81" cy="67" r="2.5" style={getNeutralStyle()} />

            {/* Quads / Upper Legs (Front) */}
            <path d="M34 72 L49 72 L47 108 L36 108 Z" style={getMuscleStyle(['legs'])} />
            <path d="M66 72 L51 72 L53 108 L64 108 Z" style={getMuscleStyle(['legs'])} />

            {/* Knees */}
            <circle cx="41.5" cy="112" r="3" style={getNeutralStyle()} />
            <circle cx="58.5" cy="112" r="3" style={getNeutralStyle()} />

            {/* Calves / Shin (Front) */}
            <path d="M37 116 L45 116 L43 140 L39 140 Z" style={getMuscleStyle(['calves'])} />
            <path d="M63 116 L55 116 L57 140 L61 140 Z" style={getMuscleStyle(['calves'])} />
          </svg>
        </div>

        {/* BACK VIEW */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">BACK</span>
          <svg viewBox="0 0 100 150" className="w-full h-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            {/* Head & Neck */}
            <circle cx="50" cy="15" r="7" style={getNeutralStyle()} />
            <path d="M47 22 L47 26 L53 26 L53 22 Z" style={getNeutralStyle()} />

            {/* Traps (Upper Back) */}
            <path d="M50 24 L38 29 L41 35 L50 31 L59 35 L62 29 Z" style={getMuscleStyle(['back'])} />

            {/* Shoulders (Back) */}
            <path d="M34 27 C30 27 27 29 27 34 L31 36 L36 31 Z" style={getMuscleStyle(['shoulders'])} />
            <path d="M66 27 C70 27 73 29 73 34 L69 36 L64 31 Z" style={getMuscleStyle(['shoulders'])} />

            {/* Lats (Back) */}
            <path d="M38 36 L49 36 L49 52 L42 50 Z" style={getMuscleStyle(['back'])} />
            <path d="M62 36 L51 36 L51 52 L58 50 Z" style={getMuscleStyle(['back'])} />

            {/* Lower Back / Spine Core */}
            <path d="M45 53 L55 53 L54 69 L46 69 Z" style={getMuscleStyle(['back'])} />

            {/* Triceps (Back) */}
            <path d="M29 36 L29 46 L25 43 C24 40 25 36 29 36 Z" style={getMuscleStyle(['triceps'])} />
            <path d="M71 36 L71 46 L75 43 C76 40 75 36 71 36 Z" style={getMuscleStyle(['triceps'])} />

            {/* Forearms */}
            <path d="M25 49 L20 64 L24 64 L28 49 Z" style={getMuscleStyle(['forearms'])} />
            <path d="M75 49 L80 64 L76 64 L72 49 Z" style={getMuscleStyle(['forearms'])} />

            {/* Hands */}
            <circle cx="19" cy="67" r="2.5" style={getNeutralStyle()} />
            <circle cx="81" cy="67" r="2.5" style={getNeutralStyle()} />

            {/* Glutes */}
            <path d="M36 70 C36 70 38 82 50 82 C62 82 64 70 64 70 Z" style={getMuscleStyle(['legs'])} />

            {/* Hamstrings / Back Thighs */}
            <path d="M35 83 L49 83 L47 108 L36 108 Z" style={getMuscleStyle(['legs'])} />
            <path d="M65 83 L51 83 L53 108 L64 108 Z" style={getMuscleStyle(['legs'])} />

            {/* Knees */}
            <circle cx="41.5" cy="112" r="3" style={getNeutralStyle()} />
            <circle cx="58.5" cy="112" r="3" style={getNeutralStyle()} />

            {/* Calves (Back) */}
            <path d="M36 116 L46 116 L44 140 L38 140 Z" style={getMuscleStyle(['calves'])} />
            <path d="M64 116 L54 116 L56 140 L62 140 Z" style={getMuscleStyle(['calves'])} />
          </svg>
        </div>
      </div>
      
      {/* Decorative Grid Lines to support HUD aesthetic */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/10 pointer-events-none" />
    </div>
  );
}
