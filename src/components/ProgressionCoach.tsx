"use client";

import React, { useState } from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { CoachSuggestion } from '@/actions/workout';

interface ProgressionCoachProps {
  suggestion: CoachSuggestion;
  onApplySuggestion: (weight: number, reps: number) => void;
}

export default function ProgressionCoach({ suggestion, onApplySuggestion }: ProgressionCoachProps) {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApplySuggestion(suggestion.targetWeight, suggestion.targetRepsLow);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#1b1233]/50 to-[#0e172a]/60 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-4.5 flex flex-col gap-4 relative overflow-hidden shadow-[0_4px_30px_rgba(155,93,229,0.1)]">
      {/* Sparkle decorative background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-violet-300">
          <Sparkles className="w-4 h-4 text-violet-accent animate-pulse" />
          AI PROGRESSION COACH
        </span>
        {suggestion.isNewWeight && (
          <span className="text-[9px] font-mono tracking-wider bg-rose-500/20 text-rose-accent border border-rose-500/30 rounded-full px-2 py-0.5 animate-pulse uppercase">
            Overload Target
          </span>
        )}
      </div>

      {/* Suggestion Highlights */}
      <div className="grid grid-cols-2 gap-3.5 mt-1">
        {/* Suggested Weight */}
        <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-white/3 border border-white/5">
          <span className="text-[10px] font-mono text-slate-400">TARGET LOAD</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{suggestion.targetWeight}</span>
            <span className="text-xs font-bold text-slate-400">kg</span>
          </div>
        </div>

        {/* Suggested Reps */}
        <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-white/3 border border-white/5">
          <span className="text-[10px] font-mono text-slate-400">TARGET REPS</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">
              {suggestion.targetRepsLow}
              {suggestion.targetRepsHigh !== suggestion.targetRepsLow && `-${suggestion.targetRepsHigh}`}
            </span>
            <span className="text-xs font-bold text-slate-400">reps</span>
          </div>
        </div>
      </div>

      {/* Coach Commentary */}
      <div className="text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3 font-medium">
        {suggestion.reason}
      </div>

      {/* Auto-Apply Button */}
      <button
        onClick={handleApply}
        disabled={applied}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 ${
          applied
            ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-gradient-to-r from-violet-accent to-cyan-accent text-white shadow-[0_4px_15px_rgba(155,93,229,0.25)] hover:shadow-[0_4px_25px_rgba(0,242,254,0.4)] active:scale-[0.98]'
        }`}
      >
        {applied ? (
          <>
            <Check className="w-4 h-4 text-white" />
            Applied to Input Fields
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5" />
            Apply Suggested Target
            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
          </>
        )}
      </button>
    </div>
  );
}
