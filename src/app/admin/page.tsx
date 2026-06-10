"use client";

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  ShieldAlert,
  Database,
  ChevronLeft,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { getAdminAnalytics, AdminAnalyticsReport } from '@/actions/admin';
import { authClient } from '@/lib/auth-client';

export default function AdminPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const [report, setReport] = useState<AdminAnalyticsReport | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await getAdminAnalytics();
        setReport(res);
        setIsAuthorized(true);
      } catch (err: unknown) {
        console.error(err);
        setIsAuthorized(false);
        setErrorMsg((err as Error).message || "Failed to fetch analytics metrics.");
      }
    });
  };

  useEffect(() => {
    if (!isSessionLoading) {
      if (!session) {
        setTimeout(() => setIsAuthorized(false), 0);
      } else {
        setTimeout(() => fetchAnalytics(), 0);
      }
    }
  }, [session, isSessionLoading]);

  // Loading skeleton screen
  if (isSessionLoading || (isPending && !report)) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-transparent relative select-none">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/8 animate-pulse text-cyan-accent">
            <Database className="w-8 h-8 animate-spin" />
          </div>
          <span className="text-xs font-mono tracking-widest text-slate-500">LOADING METRICS BASE...</span>
        </div>
      </div>
    );
  }

  // Access Denied Restricted Screen
  if (!isAuthorized) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-transparent relative select-none animate-fadeIn">
        <div className="absolute top-20 left-10 w-36 h-36 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-full max-w-sm glass-panel rounded-3xl p-6 text-center border-rose-500/20 relative shadow-[0_0_30px_rgba(239,68,68,0.05)]">
          <div className="p-3 w-fit mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-accent animate-bounce mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-white tracking-wider mb-2 uppercase">RESTRICTED AREA</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Only verified administrators can access the site usage analytics. If you are the admin, please log in with your authorized email.
          </p>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono justify-center mb-6 bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-bold tracking-wider text-[11px] flex items-center justify-center gap-1.5 hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              LOG IN AS ADMIN
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 font-bold tracking-wider text-[11px] flex items-center justify-center hover:bg-slate-800 transition-all"
            >
              GO BACK HOME
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const maxDau = report ? Math.max(...report.dauData.map(d => d.activeUsers), 1) : 1;

  return (
    <div className="flex flex-col w-full px-5 pt-6 pb-8 gap-6 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            BACK TO APP
          </Link>

          <button
            onClick={fetchAnalytics}
            disabled={isPending}
            className="p-1.5 rounded-lg bg-white/3 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-wider text-white">
            ADMIN PANEL
          </h1>
          <span className="text-[8px] font-mono tracking-widest text-[#FF8A00] bg-[#FF8A00]/10 border border-[#FF8A00]/20 rounded px-1.5 py-0.5 uppercase">
            LIVE ANALYTICS
          </span>
        </div>
        <p className="text-xs text-slate-400">Site traffic metrics, active accounts, and logs</p>
      </div>

      {report && (
        <div className="flex flex-col gap-6">
          {/* STATS OVERVIEW GRID */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-accent/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-cyan-accent" />
              </div>
              <span className="text-2xl font-black text-white leading-none">{report.totalUsers}</span>
              <span className="text-[8px] font-mono text-slate-400">Registered Accounts</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-1.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-violet-accent/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Active Sessions</span>
                <Activity className="w-4 h-4 text-violet-accent animate-pulse" />
              </div>
              <span className="text-2xl font-black text-white leading-none">{report.activeSessions}</span>
              <span className="text-[8px] font-mono text-slate-400">Login Session Tokens</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-1.5 relative overflow-hidden col-span-2 grid grid-cols-3 divide-x divide-white/5 text-center">
              <div className="flex flex-col gap-1 pr-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">STRENGTH SETS</span>
                <span className="text-lg font-black text-white">{report.totalPrs}</span>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">CARDIO RUNS</span>
                <span className="text-lg font-black text-white">{report.totalCardios}</span>
              </div>
              <div className="flex flex-col gap-1 pl-1">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">WEIGHT LOGS</span>
                <span className="text-lg font-black text-white">{report.totalWeights}</span>
              </div>
            </div>
          </div>

          {/* 7-DAY DAU BAR CHART */}
          <div className="glass-panel rounded-3xl p-5 border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center select-none">
              <span className="text-xs font-mono tracking-wider text-slate-400">DAILY ACTIVE USERS (DAU)</span>
              <span className="text-[9px] font-mono text-cyan-accent bg-cyan-accent/5 border border-cyan-accent/10 px-2 py-0.5 rounded-full">
                LAST 7 DAYS
              </span>
            </div>

            {/* Bars container */}
            <div className="flex items-end justify-between h-36 pt-4 px-2 border-b border-white/5 select-none">
              {report.dauData.map((d, index) => {
                const heightPercentage = Math.max((d.activeUsers / maxDau) * 100, 4);
                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-grow group relative">
                    {/* Glowy Bar */}
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className="w-4 rounded-t-md bg-gradient-to-t from-cyan-accent to-violet-accent opacity-90 group-hover:scale-x-110 shadow-[0_0_12px_rgba(0,242,254,0.15)] group-hover:shadow-[0_0_20px_rgba(155,93,229,0.4)] transition-all duration-200"
                    />
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-1 bg-slate-900 border border-white/10 rounded-lg px-2 py-0.5 text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {d.activeUsers} active
                    </div>

                    {/* Date label */}
                    <span className="text-[8px] font-mono text-slate-500">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECENT SIGNUPS */}
          <div className="glass-panel rounded-3xl p-5 border-white/5 flex flex-col gap-3">
            <div className="flex justify-between items-center select-none">
              <span className="text-xs font-mono tracking-wider text-slate-400 font-bold">RECENT SIGNUPS</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">USER INDEX</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {report.recentSignups.length === 0 ? (
                <span className="text-[10px] text-slate-500 italic py-2 text-center">No signups found.</span>
              ) : (
                report.recentSignups.map((u) => (
                  <div key={u.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                    <div className="flex flex-col gap-0.5 select-none">
                      <span className="font-bold text-white leading-tight">{u.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 leading-tight">{u.email}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GLOBAL FEED/ACTIVITIES */}
          <div className="glass-panel rounded-3xl p-5 border-white/5 flex flex-col gap-3">
            <div className="flex justify-between items-center select-none">
              <span className="text-xs font-mono tracking-wider text-slate-400 font-bold">GLOBAL APP ACTIVITY</span>
              <span className="text-[9px] font-mono text-violet-accent bg-violet-accent/5 border border-violet-accent/10 px-2 py-0.5 rounded-full">
                LIVE LOG FEED
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {report.recentActivities.length === 0 ? (
                <span className="text-[10px] text-slate-500 italic py-2 text-center">No recent activity logged.</span>
              ) : (
                report.recentActivities.map((act) => (
                  <div key={act.id} className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white select-none">{act.userName}</span>
                      <div className="flex items-center gap-1.5">
                        {act.type === 'strength' ? (
                          <span className="text-[8px] font-mono text-cyan-accent bg-cyan-accent/5 border border-cyan-accent/10 px-1.5 py-0.5 rounded uppercase font-bold">
                            STRENGTH
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono text-rose-accent bg-rose-accent/5 border border-rose-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                            CARDIO
                          </span>
                        )}
                        <span className="text-[8px] font-mono text-slate-500">
                          {new Date(act.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-300 font-medium">{act.description}</p>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{act.userEmail}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
