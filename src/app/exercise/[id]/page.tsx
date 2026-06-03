import { notFound } from 'next/navigation';
import {
  getExerciseById,
  getPRLog,
  getRecentLogs,
  getAIProgressionSuggestion,
  getFitnessGoal,
} from '@/actions/workout';
import ExerciseTracker from '@/components/ExerciseTracker';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Ensure we always fetch fresh data

export default async function ExercisePage({ params }: PageProps) {
  // Await params as required by Next.js 15 App Router standard
  const { id } = await params;

  // Fetch all necessary data in parallel on the server
  const [exercise, prLog, recentLogs, coachSuggestion, goal] = await Promise.all([
    getExerciseById(id),
    getPRLog(id),
    getRecentLogs(id, 10),
    getAIProgressionSuggestion(id),
    getFitnessGoal(),
  ]);

  // Handle case where exercise ID doesn't exist
  if (!exercise) {
    notFound();
  }

  return (
    <ExerciseTracker
      exercise={exercise}
      prLog={prLog}
      recentLogs={recentLogs}
      coachSuggestion={coachSuggestion}
      goal={goal}
    />
  );
}
