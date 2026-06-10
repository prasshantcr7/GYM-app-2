"use server";

import { db } from '@/db';
import { user, session, prLogs, cardioLogs, weightLogs, exercises } from '@/db/schema';
import { count, desc, gte, eq } from 'drizzle-orm';
import { getCurrentUser } from './workout';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ActivitySummary {
  id: string | number;
  userName: string;
  userEmail: string;
  type: 'strength' | 'cardio';
  description: string;
  loggedAt: Date;
}

export interface DAUPoint {
  date: string;
  activeUsers: number;
}

export interface AdminAnalyticsReport {
  totalUsers: number;
  activeSessions: number;
  totalPrs: number;
  totalCardios: number;
  totalWeights: number;
  recentSignups: UserSummary[];
  recentActivities: ActivitySummary[];
  dauData: DAUPoint[];
}

// Secure server action to fetch admin analytics metrics
export async function getAdminAnalytics(): Promise<AdminAnalyticsReport> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Unauthorized: No session found');
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'pradhankarthik7@gmail.com';
  const isAuthorized =
    currentUser.email.toLowerCase() === adminEmail.toLowerCase() ||
    currentUser.email.toLowerCase() === 'admin@pulse.fit' ||
    currentUser.email.toLowerCase() === 'pradhankarthik7@gmail.com';

  if (!isAuthorized) {
    throw new Error('Unauthorized: Access denied');
  }

  // 1. Fetch total counts
  const totalUsersRes = await db.select({ value: count() }).from(user);
  const totalUsers = totalUsersRes[0]?.value || 0;

  const activeSessionsRes = await db.select({ value: count() }).from(session);
  const activeSessions = activeSessionsRes[0]?.value || 0;

  const totalPrsRes = await db.select({ value: count() }).from(prLogs);
  const totalPrs = totalPrsRes[0]?.value || 0;

  const totalCardioRes = await db.select({ value: count() }).from(cardioLogs);
  const totalCardios = totalCardioRes[0]?.value || 0;

  const totalWeightRes = await db.select({ value: count() }).from(weightLogs);
  const totalWeights = totalWeightRes[0]?.value || 0;

  // 2. Fetch recent signups (last 10)
  const recentUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(10);

  // 3. Fetch recent workouts to show in active feed (last 10 strength and last 10 cardio)
  const recentPrs = await db
    .select({
      id: prLogs.id,
      userName: user.name,
      userEmail: user.email,
      exerciseName: exercises.name,
      weight: prLogs.weight,
      reps: prLogs.reps,
      loggedAt: prLogs.loggedAt,
    })
    .from(prLogs)
    .innerJoin(user, eq(prLogs.userId, user.id))
    .innerJoin(exercises, eq(prLogs.exerciseId, exercises.id))
    .orderBy(desc(prLogs.loggedAt))
    .limit(10);

  const recentCardios = await db
    .select({
      id: cardioLogs.id,
      userName: user.name,
      userEmail: user.email,
      type: cardioLogs.type,
      duration: cardioLogs.duration,
      calories: cardioLogs.calories,
      loggedAt: cardioLogs.loggedAt,
    })
    .from(cardioLogs)
    .innerJoin(user, eq(cardioLogs.userId, user.id))
    .orderBy(desc(cardioLogs.loggedAt))
    .limit(10);

  // Combine and sort recent activities by timestamp
  const recentActivities: ActivitySummary[] = [
    ...recentPrs.map(p => ({
      id: `pr-${p.id}`,
      userName: p.userName,
      userEmail: p.userEmail,
      type: 'strength' as const,
      description: `${p.exerciseName}: ${p.weight} kg x ${p.reps} reps`,
      loggedAt: p.loggedAt,
    })),
    ...recentCardios.map(c => ({
      id: `cardio-${c.id}`,
      userName: c.userName,
      userEmail: c.userEmail,
      type: 'cardio' as const,
      description: `${c.type.toUpperCase()}: ${c.duration} mins (${c.calories} kcal)`,
      loggedAt: c.loggedAt,
    }))
  ]
    .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime())
    .slice(0, 10);

  // 4. Calculate Daily Active Users (DAU) for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const prLogsRecent = await db
    .select({ userId: prLogs.userId, loggedAt: prLogs.loggedAt })
    .from(prLogs)
    .where(gte(prLogs.loggedAt, sevenDaysAgo));

  const cardioLogsRecent = await db
    .select({ userId: cardioLogs.userId, loggedAt: cardioLogs.loggedAt })
    .from(cardioLogs)
    .where(gte(cardioLogs.loggedAt, sevenDaysAgo));

  const weightLogsRecent = await db
    .select({ userId: weightLogs.userId, loggedAt: weightLogs.loggedAt })
    .from(weightLogs)
    .where(gte(weightLogs.loggedAt, sevenDaysAgo));

  const sessionsRecent = await db
    .select({ userId: session.userId, loggedAt: session.createdAt })
    .from(session)
    .where(gte(session.createdAt, sevenDaysAgo));

  const dauData: DAUPoint[] = [];
  const isSameDayStr = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (6 - i));
    
    const dateStr = targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const activeUsers = new Set<string>();

    prLogsRecent.forEach(p => {
      if (isSameDayStr(new Date(p.loggedAt), targetDate)) activeUsers.add(p.userId);
    });
    cardioLogsRecent.forEach(c => {
      if (isSameDayStr(new Date(c.loggedAt), targetDate)) activeUsers.add(c.userId);
    });
    weightLogsRecent.forEach(w => {
      if (isSameDayStr(new Date(w.loggedAt), targetDate)) activeUsers.add(w.userId);
    });
    sessionsRecent.forEach(s => {
      if (isSameDayStr(new Date(s.loggedAt), targetDate)) activeUsers.add(s.userId);
    });

    dauData.push({
      date: dateStr,
      activeUsers: activeUsers.size,
    });
  }

  return {
    totalUsers,
    activeSessions,
    totalPrs,
    totalCardios,
    totalWeights,
    recentSignups: recentUsers as UserSummary[],
    recentActivities,
    dauData,
  };
}
