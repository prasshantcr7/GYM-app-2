"use client";

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Dumbbell, Zap, Flame, Scale, LogOut } from 'lucide-react';
import { Exercise, updateFitnessGoal } from '@/actions/workout';
import { authClient } from '@/lib/auth-client';

interface GymDashboardProps {
  initialExercises: Exercise[];
  initialGoal: string;
}

const MUSCLE_GROUPS = [
  { id: 'legs', label: 'Legs', icon: Dumbbell, color: 'from-[#00F2FE] to-[#4FACFE]' },
  { id: 'shoulders', label: 'Shoulders', icon: Zap, color: 'from-[#9B5DE5] to-[#F15BB5]' },
  { id: 'chest', label: 'Chest', icon: Flame, color: 'from-[#FF2E93] to-[#FF8A00]' },
  { id: 'back', label: 'Back', icon: Dumbbell, color: 'from-[#38EF7D] to-[#11998E]' },
  { id: 'biceps', label: 'Biceps', icon: Flame, color: 'from-[#FF512F] to-[#DD2476]' },
  { id: 'triceps', label: 'Triceps', icon: Zap, color: 'from-[#8E2DE2] to-[#4A00E0]' },
];

export default function GymDashboard({ initialExercises, initialGoal }: GymDashboardProps) {
  const router = useRouter();
  const [goal, setGoal] = useState<string>(initialGoal);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [, startTransition] = useTransition();

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

  const filteredExercises = useMemo(() => {
    return initialExercises.filter((ex) => {
      const matchesMuscle = selectedMuscle ? ex.muscleGroup === selectedMuscle : true;
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesMuscle && matchesSearch;
    });
  }, [initialExercises, selectedMuscle, searchQuery]);

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
              v1.0.0 (MOBILE)
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

      {/* FITNESS GOAL SELECTOR */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono tracking-wider text-slate-400">FITNESS GOAL</span>
        <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-900/80 border border-white/5 relative">
          {/* Bulk Button */}
          <button
            onClick={() => handleGoalChange('bulk')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold gap-1 transition-all duration-300 relative z-10 ${
              goal === 'bulk' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className={`w-4 h-4 ${goal === 'bulk' ? 'text-orange-500 animate-pulse' : ''}`} />
            Bulk
            {goal === 'bulk' && (
              <span className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10 shadow-[0_4px_12px_rgba(239,68,68,0.15)]" />
            )}
          </button>

          {/* Maintenance Button */}
          <button
            onClick={() => handleGoalChange('maintenance')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold gap-1 transition-all duration-300 relative z-10 ${
              goal === 'maintenance' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className={`w-4 h-4 ${goal === 'maintenance' ? 'text-cyan-accent' : ''}`} />
            Maintain
            {goal === 'maintenance' && (
              <span className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-10 shadow-[0_4px_12px_rgba(6,182,212,0.15)]" />
            )}
          </button>

          {/* Cut Button */}
          <button
            onClick={() => handleGoalChange('cut')}
            className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-xs font-semibold gap-1 transition-all duration-300 relative z-10 ${
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
              className="text-[10px] font-mono text-cyan-accent hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MUSCLE_GROUPS.map((group) => {
            const Icon = group.icon;
            const isSelected = selectedMuscle === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setSelectedMuscle(isSelected ? null : group.id)}
                className={`glass-panel-interactive flex flex-col items-center justify-center p-3 rounded-xl gap-1.5 text-center relative ${
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
  );
}
