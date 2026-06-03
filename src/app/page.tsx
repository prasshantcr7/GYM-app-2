import { getExercises, getFitnessGoal } from "@/actions/workout";
import GymDashboard from "@/components/GymDashboard";

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  const [exercises, goal] = await Promise.all([
    getExercises(),
    getFitnessGoal(),
  ]);

  return <GymDashboard initialExercises={exercises} initialGoal={goal} />;
}
