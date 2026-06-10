import { getExercises, getFitnessGoal, getAllUserActivity } from "@/actions/workout";
import GymDashboard from "@/components/GymDashboard";

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  const [exercises, goal, activity] = await Promise.all([
    getExercises(),
    getFitnessGoal(),
    getAllUserActivity(),
  ]);

  return (
    <GymDashboard
      initialExercises={exercises}
      initialGoal={goal}
      initialCardioLogs={activity.cardioLogs}
      initialWeightLogs={activity.weightLogs}
      initialPrLogs={activity.prLogs}
    />
  );
}
