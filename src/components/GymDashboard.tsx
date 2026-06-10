"use client";

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronRight,
  Dumbbell,
  Zap,
  Flame,
  Scale,
  LogOut,
  Activity,
  Plus,
  Minus,
  Check,
  Bike,
  Timer,
  ChevronLeft,
  Award,
  TrendingUp,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import {
  Exercise,
  updateFitnessGoal,
  logCardioSession,
  CardioLog,
  logBodyWeight,
  WeightLog,
  PRLog,
  AIProgressReport,
  generateAIProgressReport
} from '@/actions/workout';
import { authClient } from '@/lib/auth-client';

interface GymDashboardProps {
  initialExercises: Exercise[];
  initialGoal: string;
  initialCardioLogs?: CardioLog[];
  initialWeightLogs?: WeightLog[];
  initialPrLogs?: (PRLog & { exerciseName: string; muscleGroup: string })[];
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

export default function GymDashboard({
  initialExercises,
  initialGoal,
  initialCardioLogs = [],
  initialWeightLogs = [],
  initialPrLogs = []
}: GymDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'strength' | 'cardio' | 'progress'>('strength');
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

  // Weight State
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(initialWeightLogs);
  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight : 75;
  const [currentWeightInput, setCurrentWeightInput] = useState<number>(latestWeight);
  const [isPendingWeight, startWeightTransition] = useTransition();
  const [weightSuccess, setWeightSuccess] = useState<boolean>(false);

  // PR Logs State (for calendar display)
  const [prLogs, setPrLogs] = useState<(PRLog & { exerciseName: string; muscleGroup: string })[]>(initialPrLogs);

  // Calendar view state
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  // AI Coach state
  const [aiReport, setAiReport] = useState<AIProgressReport | null>(null);
  const [isPendingAI, startAITransition] = useTransition();
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync prop changes (e.g. from server actions revalidation)
  const [prevInitialCardioLogs, setPrevInitialCardioLogs] = useState<CardioLog[]>(initialCardioLogs);
  if (initialCardioLogs !== prevInitialCardioLogs) {
    setPrevInitialCardioLogs(initialCardioLogs);
    setCardioLogs(initialCardioLogs);
  }
  const [prevInitialWeightLogs, setPrevInitialWeightLogs] = useState<WeightLog[]>(initialWeightLogs);
  if (initialWeightLogs !== prevInitialWeightLogs) {
    setPrevInitialWeightLogs(initialWeightLogs);
    setWeightLogs(initialWeightLogs);
    if (initialWeightLogs.length > 0) {
      setCurrentWeightInput(initialWeightLogs[0].weight);
    }
  }
  const [prevInitialPrLogs, setPrevInitialPrLogs] = useState<(PRLog & { exerciseName: string; muscleGroup: string })[]>(initialPrLogs);
  if (initialPrLogs !== prevInitialPrLogs) {
    setPrevInitialPrLogs(initialPrLogs);
    setPrLogs(initialPrLogs);
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

  const adjustWeightInput = (amount: number) => {
    setCurrentWeightInput((prev) => {
      const val = parseFloat((prev + amount).toFixed(1));
      return val < 10 ? 10 : val;
    });
  };

  const handleLogCardio = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPendingCardio) return;

    startCardioTransition(async () => {
      const result = await logCardioSession(cardioType, duration, calories);
      if (result.success) {
        setCardioSuccess(true);
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

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPendingWeight) return;

    startWeightTransition(async () => {
      const result = await logBodyWeight(currentWeightInput);
      if (result.success) {
        setWeightSuccess(true);
        const tempLog: WeightLog = {
          id: Date.now(),
          userId: '',
          weight: currentWeightInput,
          loggedAt: new Date(),
        };
        setWeightLogs((prev) => [tempLog, ...prev]);

        setTimeout(() => {
          setWeightSuccess(false);
        }, 3000);
      }
    });
  };

  const handleGenerateAIReport = () => {
    if (isPendingAI) return;
    setAiError(null);

    startAITransition(async () => {
      const result = await generateAIProgressReport();
      if (result.success && result.report) {
        setAiReport(result.report);
      } else {
        setAiError(result.error || "Failed to generate report. Please try again.");
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

  // Calendar calculations
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    // Monday start: adjust Sunday (0) to index 6, subtract 1 otherwise
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const isSameDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getDayLogs = (dayDate: Date) => {
    const prs = prLogs.filter(p => isSameDay(p.loggedAt, dayDate));
    const cardios = cardioLogs.filter(c => isSameDay(c.loggedAt, dayDate));
    const weights = weightLogs.filter(w => isSameDay(w.loggedAt, dayDate));
    return { prs, cardios, weights };
  };

  const activeDayLogs = useMemo(() => {
    const prs = prLogs.filter(p => isSameDay(p.loggedAt, selectedDay));
    const cardios = cardioLogs.filter(c => isSameDay(c.loggedAt, selectedDay));
    const weights = weightLogs.filter(w => isSameDay(w.loggedAt, selectedDay));
    return { prs, cardios, weights };
  }, [selectedDay, prLogs, cardioLogs, weightLogs]);

  const renderCalendarCells = () => {
    const cells = [];
    
    // Empty prefix cells
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(
        <div key={`empty-${i}`} className="bg-transparent border border-white/2 min-h-[44px] rounded-lg opacity-10" />
      );
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const { prs, cardios, weights } = getDayLogs(cellDate);
      const isSelected = isSameDay(cellDate, selectedDay);
      const isToday = isSameDay(cellDate, new Date());

      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => setSelectedDay(cellDate)}
          className={`flex flex-col items-center justify-between p-1 rounded-lg border min-h-[44px] cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'border-cyan-accent bg-cyan-accent/10 shadow-[0_0_10px_rgba(0,242,254,0.15)] text-white' 
              : isToday
                ? 'border-violet-accent bg-violet-accent/5 text-white'
                : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-white/10 text-slate-300'
          }`}
        >
          <span className={`text-[10px] font-mono font-bold leading-none ${isToday && !isSelected ? 'text-violet-accent' : ''}`}>
            {day}
          </span>
          
          <div className="flex gap-0.5 justify-center mt-1">
            {prs.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent shadow-[0_0_3px_#00F2FE]" />}
            {cardios.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-accent shadow-[0_0_3px_#FF2E93]" />}
            {weights.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_3px_#34d399]" />}
          </div>
        </button>
      );
    }

    return cells;
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
              v1.2.0 (MOBILE)
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

      {/* THREE TABS SELECTOR */}
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
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer relative z-10 ${
            activeTab === 'progress' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          COACH
          {activeTab === 'progress' && (
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

      {/* ========================================== */}
      {/* COACH & PROGRESS TAB VIEW                  */}
      {/* ========================================== */}
      {activeTab === 'progress' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* BODY WEIGHT TRACKER CARD */}
          <div className="glass-panel rounded-3xl p-5 border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center select-none">
              <span className="text-xs font-mono tracking-wider text-slate-400">BODY WEIGHT TRACKER</span>
              {weightLogs.length > 0 && (
                <span className="text-[10px] font-mono text-cyan-accent bg-cyan-accent/5 border border-cyan-accent/10 px-2 py-0.5 rounded-full">
                  CURRENT: {weightLogs[0].weight} kg
                </span>
              )}
            </div>

            <form onSubmit={handleLogWeight} className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-slate-900/60 border border-white/8 rounded-2xl p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => adjustWeightInput(-0.5)}
                  className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    value={currentWeightInput}
                    onChange={(e) => setCurrentWeightInput(parseFloat(parseFloat(e.target.value).toFixed(1)) || 75)}
                    className="w-24 text-center text-xl font-black text-white focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">KILOGRAMS</span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustWeightInput(0.5)}
                  className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 active:scale-90 transition-all font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isPendingWeight}
                className={`w-full py-3 rounded-xl font-bold tracking-wider text-[11px] flex items-center justify-center gap-1.5 transition-all duration-300 select-none cursor-pointer ${
                  weightSuccess
                    ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-white text-slate-950 hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]'
                }`}
              >
                {isPendingWeight ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : weightSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    WEIGHT RECORDED
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5" />
                    LOG CURRENT WEIGHT
                  </>
                )}
              </button>
            </form>

            {/* Recent weights log history */}
            {weightLogs.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase">WEIGHT HISTORY</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {weightLogs.slice(0, 4).map((w, index) => (
                    <div key={w.id} className="glass-panel p-2 rounded-xl flex flex-col items-center gap-0.5 border-white/5 min-w-[70px] shrink-0 text-center">
                      <span className="text-[10px] font-bold text-white">{w.weight} kg</span>
                      <span className="text-[8px] font-mono text-slate-400">
                        {index === 0 ? 'Latest' : new Date(w.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE CALENDAR */}
          <div className="glass-panel rounded-3xl p-5 border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentCalendarDate(new Date(year, month - 1, 1))}
                  className="p-1 rounded-lg bg-white/3 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black tracking-widest text-white font-mono">
                  {monthNames[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentCalendarDate(new Date(year, month + 1, 1))}
                  className="p-1 rounded-lg bg-white/3 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">ACTIVITY CALENDAR</span>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-col gap-1">
              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 text-center select-none mb-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <span key={i} className="text-[9px] font-mono font-bold text-slate-500 py-1">
                    {day}
                  </span>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarCells()}
              </div>
            </div>

            {/* Selected day activity detail list */}
            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase select-none">
                LOGS FOR {selectedDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>

              <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {activeDayLogs.prs.length === 0 && activeDayLogs.cardios.length === 0 && activeDayLogs.weights.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic py-2 text-center">No logs or workouts recorded on this day.</span>
                ) : (
                  <>
                    {/* Weight log for this day */}
                    {activeDayLogs.weights.map(w => (
                      <div key={w.id} className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs">
                        <div className="flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold text-emerald-300">Recorded Body Weight</span>
                        </div>
                        <span className="font-bold text-white">{w.weight} kg</span>
                      </div>
                    ))}
                    
                    {/* PR logs for this day */}
                    {activeDayLogs.prs.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-xs">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-3.5 h-3.5 text-cyan-accent" />
                          <span className="font-semibold text-slate-200">{p.exerciseName}</span>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          <span className="font-bold text-white">{p.weight} kg x {p.reps} reps</span>
                          <span className="text-[8px] font-mono text-cyan-accent/80 uppercase">{p.goal} target</span>
                        </div>
                      </div>
                    ))}

                    {/* Cardio logs for this day */}
                    {activeDayLogs.cardios.map(c => (
                      <div key={c.id} className="flex justify-between items-center p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs">
                        <div className="flex items-center gap-2">
                          {getCardioIcon(c.type)}
                          <span className="font-semibold text-slate-200 capitalize">{c.type}</span>
                        </div>
                        <div className="text-right flex flex-col gap-0.5">
                          <span className="font-bold text-white">{c.duration} mins</span>
                          <span className="text-[8px] font-mono text-rose-accent uppercase">{c.calories} kcal burned</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* AI COACH REPORT */}
          <div className="glass-panel rounded-3xl p-5 border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center select-none">
              <span className="text-xs font-mono tracking-wider text-slate-400">AI FITNESS COACH</span>
              <span className="text-[10px] font-mono text-violet-accent bg-violet-accent/5 border border-violet-accent/10 px-2 py-0.5 rounded-full">
                AI ANALYSIS
              </span>
            </div>

            {!aiReport ? (
              <div className="flex flex-col gap-3 py-4 items-center text-center">
                <div className="p-3 rounded-2xl bg-violet-accent/10 text-violet-accent border border-violet-accent/20 animate-pulse">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Unlock Personalized Insights</h3>
                  <p className="text-[10px] text-slate-400 max-w-xs px-4">
                    The Coach will analyze your workout consistency, strength PR progression, cardio metrics, and body weight logs to output actionable targets, protein calculations, and direct guidance.
                  </p>
                </div>
                
                {aiError && (
                  <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerateAIReport}
                  disabled={isPendingAI}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-accent to-cyan-accent text-white font-bold tracking-widest text-[10px] flex items-center gap-1.5 hover:shadow-[0_0_20px_rgba(155,93,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none font-mono"
                >
                  {isPendingAI ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      COACH IS ANALYZING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      GENERATE COACH REPORT
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-fadeIn">
                {/* 1. How I'm Doing */}
                <div className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-accent/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-cyan-accent">
                    <Award className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Coach Status Evaluation</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{aiReport.status}</p>
                </div>

                {/* 2. What I Have Achieved */}
                <div className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-accent/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-violet-accent">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Key Achievements</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{aiReport.achievements}</p>
                </div>

                {/* 3. What Needs to Get Fixed */}
                <div className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-accent/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-rose-accent">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Areas to Correct & Fix</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{aiReport.fixes}</p>
                </div>

                {/* 4. Protein & Supplements */}
                <div className="glass-panel p-4 rounded-2xl border-emerald-500/10 bg-emerald-500/2 flex flex-col gap-1.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Macros & Nutrition Guide</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{aiReport.proteinSupplement}</p>
                </div>

                {/* 5. Motivation & Tip */}
                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">COACH&apos;S MOTIVATION</span>
                    <p className="text-xs italic text-slate-300 font-medium leading-relaxed">&quot;{aiReport.motivation}&quot;</p>
                  </div>
                  <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">FITNESS TIP</span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{aiReport.tip}</p>
                  </div>
                </div>

                {/* Regenerate Button */}
                <button
                  type="button"
                  onClick={handleGenerateAIReport}
                  disabled={isPendingAI}
                  className="w-full py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white font-bold tracking-wider text-[10px] flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                >
                  {isPendingAI ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      RE-GENERATE REPORT
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
