"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, Check, Award, Flame, Zap, Scale } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exercise, PRLog, CoachSuggestion, logWorkoutSet } from '@/actions/workout';
import AnatomicalModel from './AnatomicalModel';
import ProgressionCoach from './ProgressionCoach';
import PrHistory from './PrHistory';

interface ExerciseTrackerProps {
  exercise: Exercise;
  prLog: PRLog | null;
  recentLogs: PRLog[];
  coachSuggestion: CoachSuggestion;
  goal: string;
}

export default function ExerciseTracker({
  exercise,
  prLog,
  recentLogs,
  coachSuggestion,
  goal,
}: ExerciseTrackerProps) {
  // Initialize inputs to suggested targets or PR stats, fallback to standard numbers
  const [weight, setWeight] = useState<number>(() => {
    if (coachSuggestion) return coachSuggestion.targetWeight;
    if (prLog) return prLog.weight;
    return 20;
  });
  const [reps, setReps] = useState<number>(() => {
    if (coachSuggestion) return coachSuggestion.targetRepsLow;
    if (prLog) return prLog.reps;
    return 10;
  });

  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [newPrAlert, setNewPrAlert] = useState<boolean>(false);

  const triggerPrConfetti = () => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 200);
  };

  const handleApplySuggestion = (suggestedWeight: number, suggestedReps: number) => {
    setWeight(suggestedWeight);
    setReps(suggestedReps);
  };

  const adjustWeight = (amount: number) => {
    setWeight((prev) => {
      const newVal = prev + amount;
      return newVal < 0 ? 0 : Math.round(newVal * 10) / 10;
    });
  };

  const adjustReps = (amount: number) => {
    setReps((prev) => {
      const newVal = prev + amount;
      return newVal < 1 ? 1 : newVal;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      const result = await logWorkoutSet(exercise.id, weight, reps);
      if (result.success) {
        setSaveSuccess(true);
        if (result.isNewPr) {
          setNewPrAlert(true);
          triggerPrConfetti();
        }
        
        setTimeout(() => {
          setSaveSuccess(false);
          setNewPrAlert(false);
        }, 3000);
      }
    });
  };

  const getGoalIcon = (g: string) => {
    switch (g.toLowerCase()) {
      case 'bulk': return <Flame className="w-3 h-3 text-orange-500" />;
      case 'cut': return <Zap className="w-3 h-3 text-rose-accent" />;
      default: return <Scale className="w-3 h-3 text-cyan-accent" />;
    }
  };

  return (
    <div className="flex flex-col w-full px-5 py-6 gap-6">
      {/* HEADER NAVBAR */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Link
          href="/"
          className="p-2 rounded-xl bg-white/3 border border-white/5 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col items-center text-center">
          <h1 className="text-base font-bold text-white tracking-wide truncate max-w-[200px]">
            {exercise.name}
          </h1>
          <span className="text-[10px] font-mono text-slate-400 capitalize">
            {exercise.muscleGroup}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 border border-white/5 rounded-full px-2.5 py-1 text-[10px] font-mono capitalize text-slate-300">
          {getGoalIcon(goal)}
          {goal}
        </div>
      </div>

      {/* ANATOMICAL HIGHLIGHT MODEL */}
      <AnatomicalModel activeGroup={exercise.muscleGroup} />

      {/* CURRENT PERSONAL RECORD DISPLAY */}
      <div className="w-full glass-panel rounded-2xl p-4 flex items-center justify-between border-rose-accent/10 bg-gradient-to-br from-rose-950/5 to-slate-900/40 relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-accent shadow-[0_0_15px_rgba(255,46,147,0.1)]">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-rose-accent tracking-widest uppercase font-bold">
              CURRENT PR
            </span>
            <span className="text-xs text-slate-400">Last logged personal best</span>
          </div>
        </div>
        
        <div className="text-right">
          {prLog ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-black text-white leading-none">
                {prLog.weight} <span className="text-sm font-bold text-slate-400">kg</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">
                for {prLog.reps} reps
              </span>
            </div>
          ) : (
            <span className="text-xs font-mono text-slate-500 italic">None logged yet</span>
          )}
        </div>
      </div>

      {/* TRACKING INPUT FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <span className="text-xs font-mono tracking-wider text-slate-400">LOG WORKOUT SET</span>
        
        {/* Input Fields Container */}
        <div className="grid grid-cols-2 gap-4">
          {/* Weight Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-slate-400 text-center tracking-wider uppercase">
              WEIGHT (KG)
            </label>
            <div className="flex items-center justify-between bg-slate-900/60 border border-white/8 rounded-2xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => adjustWeight(-2.5)}
                className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full text-center text-xl font-black text-white focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => adjustWeight(2.5)}
                className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reps Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-slate-400 text-center tracking-wider uppercase">
              REPETITIONS
            </label>
            <div className="flex items-center justify-between bg-slate-900/60 border border-white/8 rounded-2xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => adjustReps(-1)}
                className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                className="w-full text-center text-xl font-black text-white focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => adjustReps(1)}
                className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-3.5 rounded-2xl font-bold tracking-wider text-sm flex items-center justify-center gap-2 transition-all duration-300 select-none ${
            newPrAlert 
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(255,46,147,0.4)] animate-bounce'
              : saveSuccess
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]'
          }`}
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : newPrAlert ? (
            <>
              <Award className="w-4 h-4 animate-spin text-white" />
              NEW PR RECORD BEATEN!
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              SET LOGGED SUCCESSFULLY
            </>
          ) : (
            'LOG COMPLETED SET'
          )}
        </button>
      </form>

      {/* AI PROGRESSION COACH CARD */}
      <ProgressionCoach
        suggestion={coachSuggestion}
        onApplySuggestion={handleApplySuggestion}
      />

      {/* HISTORY LIST */}
      <PrHistory logs={recentLogs} prLogId={prLog?.id || null} />
    </div>
  );
}
