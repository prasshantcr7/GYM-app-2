"use client";

import React from 'react';
import { Award, Calendar, Flame, Zap, Scale } from 'lucide-react';
import { PRLog } from '@/actions/workout';

interface PrHistoryProps {
  logs: PRLog[];
  prLogId: number | null;
}

// Epley 1RM Formula
const calculate1RM = (weight: number, reps: number) => {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

export default function PrHistory({ logs, prLogId }: PrHistoryProps) {
  const getGoalIcon = (goal: string) => {
    switch (goal.toLowerCase()) {
      case 'bulk':
        return <Flame className="w-3 h-3 text-orange-500" />;
      case 'cut':
        return <Zap className="w-3 h-3 text-rose-accent" />;
      default:
        return <Scale className="w-3 h-3 text-cyan-accent" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <span className="text-xs font-mono tracking-wider text-slate-400">HISTORY & LOGS</span>
      
      {logs.length > 0 ? (
        <div className="flex flex-col gap-2">
          {logs.map((log) => {
            const isPr = log.id === prLogId;
            const oneRepMax = calculate1RM(log.weight, log.reps);
            const formattedDate = new Date(log.loggedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={log.id}
                className={`glass-panel p-3.5 rounded-xl flex items-center justify-between transition-all duration-300 ${
                  isPr ? 'border-rose-accent bg-rose-accent/3 shadow-[0_0_15px_rgba(255,46,147,0.06)]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* PR Flag Icon */}
                  {isPr ? (
                    <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-accent">
                      <Award className="w-4 h-4 animate-bounce" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                  )}

                  {/* Weights and Reps */}
                  <div className="flex flex-col gap-0.5 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">
                        {log.weight} kg <span className="text-slate-400 font-normal">x</span> {log.reps}
                      </span>
                      <span className="text-[10px] text-slate-500">reps</span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* 1RM and Goal */}
                <div className="flex flex-col items-end gap-1 select-none">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2 py-0.5 text-[9px] font-mono capitalize text-slate-300">
                    {getGoalIcon(log.goal)}
                    {log.goal}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Est. 1RM: <strong className="text-cyan-accent font-bold">{oneRepMax} kg</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-6 text-center text-slate-500 text-xs">
          No workout sets logged yet. Complete a set above to begin tracking history!
        </div>
      )}
    </div>
  );
}
