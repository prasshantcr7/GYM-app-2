"use client";

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Dumbbell, Zap, Flame, Scale, LogOut, Activity, Plus, Minus, Check, Bike, Timer } from 'lucide-react';
import { Exercise, updateFitnessGoal, logCardioSession, CardioLog } from '@/actions/workout';
import { authClient } from '@/lib/auth-client';

interface GymDashboardProps {
  initialExercises: Exercise[];
  initialGoal: string;
  initialCardioLogs?: CardioLog[];
}

const MUSCLE_GROUPS = [
  { id: 'legs', label: 'Legs', icon: Dumbbell, color: 'from-[#00F2FE] to-[#4FACFE]' },
  { id: 'shoulders', label: 'Shoulders', icon: Zap, color: 'from-[#9B5DE5] to-[#F15BB5]' },
  { id: 'chest', label: 'Chest', icon: Flame, color: 'from-[#FF2E93] to-[#FF8A00]' },
  { id: 'back', label: 'Back', icon: Dumbbell, color: 'from-[#38EF7D] to-[#11998E]' },
  { id: 'biceps', label: 'Biceps', icon: Flame, color: 'from-[#FF512F] to-[#DD2476]' },
  { id: 'triceps', label: 'Triceps', icon: Zap, color: 'from-[#8E2DE2] to-[#4A00E0]' },
  { id: 'core', label: 'Core / Abs', icon: Activity, color: 'from-[#FF8A00] to-[#E52E71]' },
  { id: 'calves', label: 'Calves', icon: Dumbbell, color: 'from-[#FAD961] to-[#F76B1C]' },
  { id: 'forearms', label: 'Forearms', icon: Zap, color: 'from-[#B5FFFC] to-[#FFDEE9]' },
];

const CARDIO_MACHINES = [
  { id: 'treadmill', label: 'Treadmill', icon: Timer, color: 'from-[#FF2E93] to-[#FF8A00]' },
  { id: 'cycle', label: 'Cycle', icon: Bike, color: 'from-[#00F2FE] to-[#4FACFE]' },
  { id: 'elliptical', label: 'Elliptical', icon: Activity, color: 'from-[#38EF7D] to-[#11998E]' },
];

export default function GymDashboard({ initialExercises, initialGoal, initialCardioLogs = [] }: GymDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'strength' | 'cardio'>('strength');
  const [goal, setGoal] = useState<string>(initialGoal);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [, startTransition] = useTransition();

  // Cardio state
  const [cardioLogs, setCardioLogs] = useState<CardioLog[]>(initialCardioLogs);
  const [cardioType, setCardioType] = useState<string>('treadmill');
  const [duration, setDuration] = useState<number>(20);
  const [calories, setCalories] = useState<number>(150);
  const [isPendingCardio, startCardioTransition] = useTransition();
  const [cardioSuccess, setCardioSuccess] = useState<boolean>(false);

  // Sync prop changes (e.g. from server actions revalidation)
  const [prevInitialCardioLogs, setPrevInitialCardioLogs] = useState<CardioLog[]>(initialCardioLogs);
  if (initialCardioLogs !== prevInitialCardioLogs) {
    setPrevInitialCardioLogs(initialCardioLogs);
    setCardioLogs(initialCardioLogs);
  }

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleGoalChange = (newGoal: string) => {
    setGoal(newGoal);
    startTransition(async () => {
      await updateFitnessGoal(newGoal);
    });
  };

  const adjustDuration = (amount: number) => {
    setDuration((prev) => {
      const val = prev + amount;
      return val < 1 ? 1 : val;
    });
  };

  const adjustCalories = (amount: number) => {
    setCalories((prev) => {
      const val = prev + amount;
      return val < 0 ? 0 : val;
    });
  };

  const handleLogCardio = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPendingCardio) return;

    startCardioTransition(async () => {
      const result = await logCardioSession(cardioType, duration, calories);
      if (result.success) {
        setCardioSuccess(true);
        // Optimistic UI insert while server revalidates
        const tempLog: CardioLog = {
          id: Date.now(),
          userId: '',
          type: cardioType,
          duration,
          calories,
          loggedAt: new Date(),
        };
        setCardioLogs((prev) => [tempLog, ...prev]);

        setTimeout(() => {
          setCardioSuccess(false);
        }, 3000);
      }
    });
  };

  const filteredExercises = useMemo(() => {
    return initialExercises.filter((ex) => {
      const matchesMuscle = selectedMuscle ? ex.muscleGroup === selectedMuscle : true;
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesMuscle && matchesSearch;
    });
  }, [initialExercises, selectedMuscle, searchQuery]);

  const getCardioIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cycle': return <Bike className="w-4 h-4 text-cyan-accent" />;
      case 'elliptical': return <Activity className="w-4 h-4 text-[#38EF7D]" />;
      default: return <Timer className="w-4 h-4 text-rose-accent" />;
    }
  };

  return (
    <div className="flex flex-col w-full px-5 pt-6 pb-8 gap-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-accent via-violet-accent to-rose-accent bg-clip-text text-transparent">
            PULSE
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5">
              v1.1.0 (MOBILE)
            </span>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg bg-white/3 border border-white/5 text-slate-400 hover:text-rose-accent hover:border-rose-500/20 hover:bg-rose-500/5 active:scale-95 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400">Gym PR Tracker & AI Progression Coach</p>
      </div>

      {/* STRENGTH VS CARDIO TABS */}
      <div className="flex p-1 rounded-xl bg-slate-900/80 border border-white/5 relative select-none">
        <button
          onClick={() => setActiveTab('strength')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer relative z-10 ${
            activeTab === 'strength' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          STRENGTH
          {activeTab === 'strength' && (
            <span className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10 shadow-[0_4px_12px_rgba(255,255,255,0.05)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('cardio')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer relative z-10 ${
            activeTab === 'cardio' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          CARDIO
          {activeTab === 'cardio' && (
            <span className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10 shadow-[0_4px_12px_rgba(255,255,255,0.05)]" />
          )}
        </button>
      </div>

      {/* ========================================== */}
      {/* STRENGTH TAB VIEW                          */}
      {/* ========================================== */}
      {activeTab === 'strength' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* FITNESS GOAL SELECTOR */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono tracking-wider text-slate-400">FITNESS GOAL</span>
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-900/80 border border-white/5 relative select-none">
              <button
                onClick={() => handleGoalChange('bulk')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold gap-1 transition-all duration-300 relative z-10 cursor-pointer ${
                  goal === 'bulk' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className={`w-4 h-4 ${goal === 'bulk' ? 'text-orange-500 animate-pulse' : ''}`} />
                Bulk
                {goal === 'bulk' && (
                  <span className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10 shadow-[0_4px_12px_rgba(239,68,68,0.15)]" />
                )}
              </button>

              <button
                onClick={() => handleGoalChange('maintenance')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold gap-1 transition-all duration-300 relative z-10 cursor-pointer ${
                  goal === 'maintenance' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className={`w-4 h-4 ${goal === 'maintenance' ? 'text-cyan-accent' : ''}`} />
                Maintain
                {goal === 'maintenance' && (
                  <span className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10 shadow-[0_4px_12px_rgba(6,182,212,0.15)]" />
                )}
              </button>

              <button
                onClick={() => handleGoalChange('cut')}
                className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold gap-1 transition-all duration-300 relative z-10 cursor-pointer ${
                  goal === 'cut' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className={`w-4 h-4 ${goal === 'cut' ? 'text-[#FF2E93]' : ''}`} />
                Cut
                {goal === 'cut' && (
                  <span className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10 shadow-[0_4px_12px_rgba(255,46,147,0.15)]" />
                )}
              </button>
            </div>
          </div>

          {/* MUSCLE GROUPS GRID */}
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono tracking-wider text-slate-400">MUSCLE GROUPS</span>
              {selectedMuscle && (
                <button
                  onClick={() => setSelectedMuscle(null)}
                  className="text-[10px] font-mono text-cyan-accent hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 select-none">
              {MUSCLE_GROUPS.map((group) => {
                const Icon = group.icon;
                const isSelected = selectedMuscle === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedMuscle(isSelected ? null : group.id)}
                    className={`glass-panel-interactive flex flex-col items-center justify-center p-3 rounded-xl gap-1.5 text-center cursor-pointer relative ${
                      isSelected ? 'border-cyan-accent bg-cyan-accent/5 shadow-[0_0_15px_rgba(0,242,254,0.1)]' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${group.color} bg-opacity-20 text-white`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium text-slate-200">{group.label}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-accent rounded-full animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-mono tracking-wider text-slate-400">
              {selectedMuscle ? `${selectedMuscle.toUpperCase()} EXERCISES` : 'ALL EXERCISES'}
            </span>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* EXERCISES LIST */}
          <div className="flex flex-col gap-2">
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/exercise/${exercise.id}`}
                  className="glass-panel-interactive flex items-center justify-between p-3.5 rounded-xl group"
                >
                  <div className="flex flex-col gap-1 select-none">
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-accent transition-colors">
                      {exercise.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-900 border border-white/5 w-fit">
                      {exercise.muscleGroup}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-accent group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))
            ) : (
              <div className="glass-panel rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                <Dumbbell className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                <span className="text-sm text-slate-400 font-medium">No exercises found</span>
                <span className="text-xs text-slate-500">Try adjusting your search query or filter.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CARDIO TAB VIEW                            */}
      {/* ========================================== */}
      {activeTab === 'cardio' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* CARDIO MACHINE SELECTOR */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono tracking-wider text-slate-400">CARDIO MACHINE</span>
            <div className="grid grid-cols-3 gap-2.5 select-none">
              {CARDIO_MACHINES.map((machine) => {
                const Icon = machine.icon;
                const isSelected = cardioType === machine.id;
                return (
                  <button
                    key={machine.id}
                    type="button"
                    onClick={() => setCardioType(machine.id)}
                    className={`glass-panel-interactive flex flex-col items-center justify-center p-3.5 rounded-xl gap-1.5 text-center cursor-pointer relative ${
                      isSelected ? 'border-cyan-accent bg-cyan-accent/5 shadow-[0_0_15px_rgba(0,242,254,0.1)]' : ''
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${machine.color} bg-opacity-20 text-white`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">{machine.label}</span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-accent rounded-full animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* INPUT FORM */}
          <form onSubmit={handleLogCardio} className="flex flex-col gap-4">
            <span className="text-xs font-mono tracking-wider text-slate-400">LOG CURRENT SESSION</span>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Duration Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-slate-400 text-center tracking-wider uppercase">
                  DURATION (MIN)
                </label>
                <div className="flex items-center justify-between bg-slate-900/60 border border-white/8 rounded-2xl p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => adjustDuration(-5)}
                    className="w-9 h-9 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    className="w-full text-center text-lg font-black text-white focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => adjustDuration(5)}
                    className="w-9 h-9 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Calories Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono text-slate-400 text-center tracking-wider uppercase">
                  CALORIES (KCAL)
                </label>
                <div className="flex items-center justify-between bg-slate-900/60 border border-white/8 rounded-2xl p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => adjustCalories(-25)}
                    className="w-9 h-9 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                    className="w-full text-center text-lg font-black text-white focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => adjustCalories(25)}
                    className="w-9 h-9 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPendingCardio}
              className={`w-full py-3.5 rounded-2xl font-bold tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-300 select-none cursor-pointer ${
                cardioSuccess
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]'
              }`}
            >
              {isPendingCardio ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : cardioSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  SESSION LOGGED SUCCESSFULLY
                </>
              ) : (
                'LOG CARDIO SESSION'
              )}
            </button>
          </form>

          {/* CARDIO HISTORY */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-mono tracking-wider text-slate-400">RECENT CARDIO LOGS</span>
            <div className="flex flex-col gap-2">
              {cardioLogs.length > 0 ? (
                cardioLogs.map((log) => (
                  <div
                    key={log.id}
                    className="glass-panel flex items-center justify-between p-3.5 rounded-xl border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        {getCardioIcon(log.type)}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-white capitalize">{log.type}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(log.loggedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col gap-0.5 select-none">
                      <span className="text-sm font-black text-white leading-none">
                        {log.duration} <span className="text-[10px] font-bold text-slate-400">min</span>
                      </span>
                      <span className="text-[10px] font-semibold text-rose-accent">
                        {log.calories} kcal burned
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-panel rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 border-white/5">
                  <Activity className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                  <span className="text-sm text-slate-400 font-medium">No cardio logged yet</span>
                  <span className="text-xs text-slate-500">Log a session above to start tracking!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
