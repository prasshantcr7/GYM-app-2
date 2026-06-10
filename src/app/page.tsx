import { getExercises, getFitnessGoal, getRecentCardioLogs } from "@/actions/workout";
import GymDashboard from "@/components/GymDashboard";

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  const [exercises, goal, cardioLogs] = await Promise.all([
    getExercises(),
    getFitnessGoal(),
    getRecentCardioLogs(15),
  ]);

  return <GymDashboard initialExercises={exercises} initialGoal={goal} initialCardioLogs={cardioLogs} />;
}
