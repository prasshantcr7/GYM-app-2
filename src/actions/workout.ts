"use server";

import { db } from '@/db';
import { exercises, prLogs, settings, cardioLogs, weightLogs } from '@/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string | null;
}

export interface CardioLog {
  id: number;
  userId: string;
  type: string;
  duration: number;
  calories: number;
  loggedAt: Date;
}

export interface PRLog {
  id: number;
  userId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  goal: string;
  loggedAt: Date;
}

export interface WeightLog {
  id: number;
  userId: string;
  weight: number;
  loggedAt: Date;
}

export interface AIProgressReport {
  status: string;
  achievements: string;
  fixes: string;
  motivation: string;
  tip: string;
  proteinSupplement: string;
}

export interface CoachSuggestion {
  targetWeight: number;
  targetRepsLow: number;
  targetRepsHigh: number;
  reason: string;
  isNewWeight: boolean;
}

// Helper: Resolve the active user session on the server
export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user || null;
  } catch (error) {
    console.error('Error fetching user session:', error);
    return null;
  }
}

// 1. Get current fitness goal (linked to user)
export async function getFitnessGoal(): Promise<string> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return 'maintenance';

    const goalSetting = await db
      .select()
      .from(settings)
      .where(and(eq(settings.userId, userSession.id), eq(settings.key, 'fitness_goal')))
      .limit(1);
    
    return goalSetting[0]?.value || 'maintenance';
  } catch (error) {
    console.error('Error fetching fitness goal:', error);
    return 'maintenance';
  }
}

// 2. Update fitness goal (linked to user)
export async function updateFitnessGoal(goal: string): Promise<boolean> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return false;

    await db
      .insert(settings)
      .values({ userId: userSession.id, key: 'fitness_goal', value: goal })
      .onConflictDoUpdate({
        target: [settings.userId, settings.key],
        set: { value: goal }
      });
    revalidatePath('/');
    return true;
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    return false;
  }
}

// 3. Get all exercises (global catalog)
export async function getExercises(): Promise<Exercise[]> {
  try {
    return await db.select().from(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
}

// 4. Get exercises by muscle group (global catalog)
export async function getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
  try {
    return await db
      .select()
      .from(exercises)
      .where(eq(exercises.muscleGroup, muscleGroup.toLowerCase()));
  } catch (error) {
    console.error('Error fetching exercises by muscle group:', error);
    return [];
  }
}

// 5. Get exercise details
export async function getExerciseById(id: string): Promise<Exercise | null> {
  try {
    const result = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching exercise by ID:', error);
    return null;
  }
}

// 6. Get PR log (highest weight, scoped to user)
export async function getPRLog(exerciseId: string): Promise<PRLog | null> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return null;

    const result = await db
      .select()
      .from(prLogs)
      .where(and(eq(prLogs.exerciseId, exerciseId), eq(prLogs.userId, userSession.id)))
      .orderBy(desc(prLogs.weight), desc(prLogs.reps))
      .limit(1);
    return (result[0] as PRLog) || null;
  } catch (error) {
    console.error('Error fetching PR log:', error);
    return null;
  }
}

// 7. Get recent logs (scoped to user)
export async function getRecentLogs(exerciseId: string, limit = 10): Promise<PRLog[]> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return [];

    const result = await db
      .select()
      .from(prLogs)
      .where(and(eq(prLogs.exerciseId, exerciseId), eq(prLogs.userId, userSession.id)))
      .orderBy(desc(prLogs.loggedAt))
      .limit(limit);
    return result as PRLog[];
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    return [];
  }
}

// 8. Log a new set (scoped to user)
export async function logWorkoutSet(exerciseId: string, weight: number, reps: number): Promise<{ success: boolean; isNewPr: boolean }> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return { success: false, isNewPr: false };

    const currentGoal = await getFitnessGoal();
    
    // Check if it's a new PR (highest weight) for this user
    const existingPr = await getPRLog(exerciseId);
    const isNewPr = !existingPr || weight > existingPr.weight || (weight === existingPr.weight && reps > existingPr.reps);

    await db.insert(prLogs).values({
      userId: userSession.id,
      exerciseId,
      weight,
      reps,
      goal: currentGoal,
    });

    revalidatePath(`/exercise/${exerciseId}`);
    return { success: true, isNewPr };
  } catch (error) {
    console.error('Error logging workout set:', error);
    return { success: false, isNewPr: false };
  }
}

// Helper: fallback default starting weights if no logs exist
const DEFAULT_BASES: Record<string, { weight: number; reps: number }> = {
  'squat': { weight: 40, reps: 10 },
  'leg-press': { weight: 80, reps: 10 },
  'romanian-deadlift': { weight: 40, reps: 10 },
  'lying-leg-curl': { weight: 20, reps: 12 },
  'calf-raise': { weight: 20, reps: 15 },
  'overhead-press': { weight: 20, reps: 10 },
  'lateral-raise': { weight: 5, reps: 12 },
  'rear-delt-fly': { weight: 5, reps: 12 },
  'face-pull': { weight: 15, reps: 15 },
  'barbell-curl': { weight: 15, reps: 10 },
  'hammer-curl': { weight: 10, reps: 10 },
  'incline-curl': { weight: 8, reps: 10 },
  'tricep-pushdown': { weight: 15, reps: 12 },
  'overhead-extension': { weight: 12, reps: 10 },
  'close-grip-bench': { weight: 30, reps: 10 },
  'pull-up': { weight: 0, reps: 5 }, // 0kg is bodyweight
  'barbell-row': { weight: 30, reps: 10 },
  'lat-pulldown': { weight: 35, reps: 10 },
  'cable-row': { weight: 30, reps: 12 },
  'deadlift': { weight: 60, reps: 8 },
  'bench-press': { weight: 40, reps: 10 },
  'incline-press': { weight: 18, reps: 10 },
  'chest-fly': { weight: 10, reps: 12 },
  'dips': { weight: 0, reps: 8 },
};

// 9. Get AI progression suggestion (scoped to user)
export async function getAIProgressionSuggestion(exerciseId: string): Promise<CoachSuggestion> {
  const goal = await getFitnessGoal();
  const recentLogs = await getRecentLogs(exerciseId, 5);
  const exercise = await getExerciseById(exerciseId);
  const exerciseName = exercise?.name || 'this exercise';

  // Fallback if no history exists
  if (recentLogs.length === 0) {
    const base = DEFAULT_BASES[exerciseId] || { weight: 10, reps: 10 };
    return {
      targetWeight: base.weight,
      targetRepsLow: base.reps,
      targetRepsHigh: base.reps + 2,
      reason: `Starting fresh! For a ${goal} goal, begin with a manageable baseline of ${base.weight}kg for ${base.reps} reps to establish your baseline form.`,
      isNewWeight: false,
    };
  }

  // Use the most recent log as our starting point
  const lastLog = recentLogs[0];
  const lastWeight = lastLog.weight;
  const lastReps = lastLog.reps;

  let targetWeight = lastWeight;
  let targetRepsLow = 8;
  let targetRepsHigh = 10;
  let reason = '';
  let isNewWeight = false;

  // Rule-based core recommendation engine
  if (goal === 'bulk') {
    // Bulking: Progressive overload
    if (lastReps >= 10) {
      // Hit target reps, increase load
      isNewWeight = true;
      const increment = lastWeight < 15 ? 1 : 2.5; // Small increment for light exercises
      targetWeight = lastWeight + increment;
      targetRepsLow = 6;
      targetRepsHigh = 8;
      reason = `You hit ${lastReps} reps last time! Since you are Bulking, we're increasing the weight by ${increment}kg to ${targetWeight}kg to trigger progressive overload. Aim for 6-8 reps.`;
    } else if (lastReps < 7) {
      // Reps are a bit low, focus on building reps at this weight
      targetRepsLow = 6;
      targetRepsHigh = 8;
      reason = `You logged ${lastReps} reps at ${lastWeight}kg. Let's keep the weight the same today and focus on building strength. Aim to hit 8 reps.`;
    } else {
      // In the middle zone (7-9 reps), stay at same weight, push reps
      targetRepsLow = 8;
      targetRepsHigh = 10;
      reason = `Solid effort with ${lastReps} reps at ${lastWeight}kg. Keep the weight at ${lastWeight}kg today, but try to push for 10 reps to qualify for a weight increase!`;
    }
  } else if (goal === 'cut') {
    // Cutting: Maintain strength, focus on volume/fat burn
    targetRepsLow = 10;
    targetRepsHigh = 12;
    if (lastReps >= 12) {
      isNewWeight = true;
      const increment = lastWeight < 15 ? 1 : 2.5;
      targetWeight = lastWeight + increment;
      targetRepsLow = 8;
      targetRepsHigh = 10;
      reason = `Great stamina! Even on a Cut, you hit ${lastReps} reps. Let's step up the weight to ${targetWeight}kg for 8-10 reps to sustain muscle density.`;
    } else if (lastReps < 8) {
      // Fatigue in caloric deficit, drop slightly to keep reps high
      isNewWeight = true;
      const decrement = lastWeight < 15 ? 1 : 2.5;
      targetWeight = Math.max(0, lastWeight - decrement);
      reason = `Caloric deficits can cause temporary fatigue. We've adjusted the weight down to ${targetWeight}kg so you can hit a high volume target of 10-12 reps.`;
    } else {
      reason = `Maintained strength with ${lastReps} reps at ${lastWeight}kg. Stay at ${lastWeight}kg today. Focus on speed, short rest periods (45-60s), and clean form.`;
    }
  } else {
    // Maintenance: Preserve strength
    targetRepsLow = 8;
    targetRepsHigh = 10;
    if (lastReps >= 10) {
      // Focus on perfecting form, maybe slightly increase weight if too easy
      isNewWeight = true;
      const increment = lastWeight < 15 ? 1 : 2.5;
      targetWeight = lastWeight + increment;
      reason = `Form feels solid! Let's challenge your maintenance threshold. Try ${targetWeight}kg for a controlled 8-10 reps.`;
    } else if (lastReps < 6) {
      isNewWeight = true;
      const decrement = lastWeight < 15 ? 1 : 2.5;
      targetWeight = Math.max(0, lastWeight - decrement);
      reason = `Let's drop the weight slightly to ${targetWeight}kg to ensure we maintain complete control and match our baseline rep range.`;
    } else {
      reason = `Maintenance mode active. Keep the weight at ${lastWeight}kg and aim to replicate or slightly exceed last session's ${lastReps} reps with perfect form.`;
    }
  }

  // LLM AI enhancement if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const logsSummary = recentLogs
        .map(l => `- Date: ${l.loggedAt.toLocaleDateString()}, Weight: ${l.weight}kg, Reps: ${l.reps} (${l.goal})`)
        .join('\n');

      const prompt = `You are a legendary gym coach guiding an athlete in their workouts.
Exercise Name: ${exerciseName}
User's Current Goal: ${goal.toUpperCase()}
Recent Set Logs for this exercise (most recent first):
${logsSummary}

Our progression engine has calculated this suggestion:
Target Weight: ${targetWeight}kg
Target Rep Range: ${targetRepsLow}-${targetRepsHigh} reps
Draft reason: ${reason}

Write a highly personalized, motivating, and professional coach tip (1-2 sentences maximum, under 170 characters) explaining why this recommendation makes sense. Do NOT repeat the weight and reps if unnecessary. Address the user directly as a supportive, expert trainer.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 80, temperature: 0.7 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (aiMessage) {
          reason = aiMessage.replace(/^"|"$/g, ''); // strip optional surrounding quotes
        }
      }
    } catch (e) {
      console.error('Failed to enhance coach suggestion with Gemini API:', e);
    }
  }

  return {
    targetWeight,
    targetRepsLow,
    targetRepsHigh,
    reason,
    isNewWeight,
  };
}

// 10. Log a cardio session (scoped to user)
export async function logCardioSession(type: string, duration: number, calories: number): Promise<{ success: boolean }> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return { success: false };

    await db.insert(cardioLogs).values({
      userId: userSession.id,
      type: type.toLowerCase(),
      duration,
      calories,
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error logging cardio session:', error);
    return { success: false };
  }
}

// 11. Get recent cardio logs (scoped to user)
export async function getRecentCardioLogs(limit = 10): Promise<CardioLog[]> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return [];

    const result = await db
      .select()
      .from(cardioLogs)
      .where(eq(cardioLogs.userId, userSession.id))
      .orderBy(desc(cardioLogs.loggedAt))
      .limit(limit);
    return result as CardioLog[];
  } catch (error) {
    console.error('Error fetching recent cardio logs:', error);
    return [];
  }
}

// 12. Log body weight (scoped to user)
export async function logBodyWeight(weight: number): Promise<{ success: boolean }> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return { success: false };

    await db.insert(weightLogs).values({
      userId: userSession.id,
      weight,
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error logging body weight:', error);
    return { success: false };
  }
}

// 13. Get recent body weight logs (scoped to user)
export async function getRecentWeightLogs(limit = 30): Promise<WeightLog[]> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return [];

    const result = await db
      .select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, userSession.id))
      .orderBy(desc(weightLogs.loggedAt))
      .limit(limit);
    return result as WeightLog[];
  } catch (error) {
    console.error('Error fetching recent weight logs:', error);
    return [];
  }
}

// 14. Get all activity logged by the user (PR logs, cardio, and weight)
export async function getAllUserActivity(): Promise<{
  prLogs: (PRLog & { exerciseName: string; muscleGroup: string })[];
  cardioLogs: CardioLog[];
  weightLogs: WeightLog[];
}> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return { prLogs: [], cardioLogs: [], weightLogs: [] };

    const rawPrLogs = await db
      .select({
        id: prLogs.id,
        userId: prLogs.userId,
        exerciseId: prLogs.exerciseId,
        weight: prLogs.weight,
        reps: prLogs.reps,
        goal: prLogs.goal,
        loggedAt: prLogs.loggedAt,
        exerciseName: exercises.name,
        muscleGroup: exercises.muscleGroup,
      })
      .from(prLogs)
      .innerJoin(exercises, eq(prLogs.exerciseId, exercises.id))
      .where(eq(prLogs.userId, userSession.id))
      .orderBy(desc(prLogs.loggedAt));

    const cardios = await db
      .select()
      .from(cardioLogs)
      .where(eq(cardioLogs.userId, userSession.id))
      .orderBy(desc(cardioLogs.loggedAt));

    const weights = await db
      .select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, userSession.id))
      .orderBy(desc(weightLogs.loggedAt));

    return {
      prLogs: rawPrLogs as (PRLog & { exerciseName: string; muscleGroup: string })[],
      cardioLogs: cardios as CardioLog[],
      weightLogs: weights as WeightLog[],
    };
  } catch (error) {
    console.error('Error fetching all user activity:', error);
    return { prLogs: [], cardioLogs: [], weightLogs: [] };
  }
}

// 15. Generate AI Fitness Progress Report (integrates with Gemini model)
export async function generateAIProgressReport(): Promise<{
  success: boolean;
  report?: AIProgressReport;
  error?: string;
}> {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) return { success: false, error: "Unauthorized" };

    const goal = await getFitnessGoal();
    const activity = await getAllUserActivity();
    const currentWeightLog = activity.weightLogs[0];
    const currentWeight = currentWeightLog ? currentWeightLog.weight : 70; // fallback to average baseline weight

    const weightHistorySummary = activity.weightLogs
      .slice(0, 10)
      .map(w => `- Date: ${new Date(w.loggedAt).toLocaleDateString()}, Weight: ${w.weight}kg`)
      .join('\n');

    const strengthSummary = activity.prLogs
      .slice(0, 20)
      .map(p => `- Date: ${new Date(p.loggedAt).toLocaleDateString()}, Exercise: ${p.exerciseName} (${p.muscleGroup}), Weight: ${p.weight}kg, Reps: ${p.reps}`)
      .join('\n');

    const cardioSummary = activity.cardioLogs
      .slice(0, 10)
      .map(c => `- Date: ${new Date(c.loggedAt).toLocaleDateString()}, Type: ${c.type}, Duration: ${c.duration} mins, Calories: ${c.calories} kcal`)
      .join('\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const prompt = `
You are an elite AI personal trainer and fitness coach. Analyze the athlete's workout logs and body weight details to provide a comprehensive feedback report.

Athlete's Fitness Goal: ${goal.toUpperCase()}
Current Weight: ${currentWeight} kg

Weight history (recent first):
${weightHistorySummary || "No weight logs recorded yet."}

Strength Logs (recent first):
${strengthSummary || "No strength sets recorded yet."}

Cardio Logs (recent first):
${cardioSummary || "No cardio sessions recorded yet."}

Generate a report in JSON format. Do NOT wrap it in markdown block tags, just output raw JSON directly. The JSON must match the following structure:
{
  "status": "A concise assessment of how they are doing (e.g. current progress, energy balance, consistency). Keep it under 200 characters.",
  "achievements": "Key achievements they have made (e.g. PR progressions, consistency in cardio, weight changes inline with goal). Keep it under 250 characters.",
  "fixes": "Recommendations for what they need to fix or improve (e.g. hitting target reps, balancing cardio and strength, workout frequency). Keep it under 250 characters.",
  "motivation": "A powerful, brief motivational quote or coaching statement to fire them up. Keep it under 150 characters.",
  "tip": "A highly practical, actionable fitness, form, or nutrition tip. Keep it under 150 characters.",
  "proteinSupplement": "Daily protein recommendation calculated at 1.6 to 2.2 grams of protein per kg of bodyweight (specify the exact range in grams based on their current weight of ${currentWeight} kg) and suggested supplements (e.g., Creatine Monohydrate, Whey, Omega-3s) with brief intake advice. Keep it under 250 characters."
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 1000,
              temperature: 0.7
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (rawJsonText) {
          try {
            const cleanedJson = rawJsonText.replace(/```json|```/g, '').trim();
            const parsedReport = JSON.parse(cleanedJson) as AIProgressReport;
            return {
              success: true,
              report: parsedReport
            };
          } catch (e) {
            console.error("Failed to parse Gemini JSON output:", e, rawJsonText);
          }
        }
      } else {
        console.error("Gemini API returned error status:", response.status, await response.text());
      }
    }

    // Heuristic Fallback report if API Key is missing or if fetch fails
    const lowProtein = Math.round(currentWeight * 1.6);
    const highProtein = Math.round(currentWeight * 2.2);
    
    const strengthCount = activity.prLogs.length;
    const cardioCount = activity.cardioLogs.length;
    const weightCount = activity.weightLogs.length;

    let fallbackStatus = `Doing well with ${strengthCount} strength logs and ${cardioCount} cardio logs tracked. `;
    if (goal === 'bulk') {
      fallbackStatus += `Body weight is currently ${currentWeight}kg. Focus on progressive overload.`;
    } else if (goal === 'cut') {
      fallbackStatus += `Body weight is currently ${currentWeight}kg. Focus on maintaining workout intensity in deficit.`;
    } else {
      fallbackStatus += `Body weight is currently ${currentWeight}kg. Keep eating at maintenance.`;
    }

    let fallbackAchievements = `Logged a total of ${strengthCount + cardioCount} workout sessions. `;
    if (strengthCount > 0) {
      const topPr = activity.prLogs[0];
      fallbackAchievements += `Achieved strength log at ${topPr.weight}kg on ${topPr.exerciseName}! `;
    }
    if (cardioCount > 0) {
      fallbackAchievements += `Logged ${cardioCount} cardio runs/rides.`;
    }

    let fallbackFixes = `Focus on keeping a consistent schedule. `;
    if (strengthCount === 0) {
      fallbackFixes += `Log some strength training sets to unlock progression coaching. `;
    }
    if (cardioCount === 0) {
      fallbackFixes += `Try to incorporate 1-2 low-intensity cardio sessions per week. `;
    }
    if (weightCount === 0) {
      fallbackFixes += `Add a body weight log to start tracking your weight trend.`;
    }

    return {
      success: true,
      report: {
        status: fallbackStatus,
        achievements: fallbackAchievements,
        fixes: fallbackFixes,
        motivation: "Consistency is the ultimate key. Small steps every day build an empire of steel.",
        tip: "Form over weight, always. Keep your tempo controlled (2s eccentric, 1s concentric) for maximum hypertrophy.",
        proteinSupplement: `For your ${currentWeight}kg body weight, consume ${lowProtein}-${highProtein}g of protein daily. Consider 3-5g of Creatine Monohydrate daily and Whey protein to hit your macros.`
      }
    };
  } catch (error) {
    console.error("Error in generateAIProgressReport:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
