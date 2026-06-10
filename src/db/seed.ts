import { db } from './index';
import { exercises } from './schema';

const INITIAL_EXERCISES = [
  // Legs
  { id: 'squat', name: 'Barbell Back Squat', muscleGroup: 'legs', description: 'Compound lower body exercise targeting quadriceps, glutes, and hamstrings.' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', description: 'Machine press targeting the quadriceps and glutes.' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'legs', description: 'Targets the hamstrings, glutes, and lower back.' },
  { id: 'lying-leg-curl', name: 'Lying Leg Curl', muscleGroup: 'legs', description: 'Isolation exercise targeting the hamstring muscles.' },
  { id: 'calf-raise', name: 'Standing Calf Raise', muscleGroup: 'legs', description: 'Targets the gastrocnemius muscle of the calves.' },

  // Shoulders
  { id: 'overhead-press', name: 'Barbell Overhead Press', muscleGroup: 'shoulders', description: 'Compound overhead press targeting anterior deltoids and triceps.' },
  { id: 'lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', description: 'Isolation exercise targeting the lateral deltoids.' },
  { id: 'rear-delt-fly', name: 'Dumbbell Rear Delt Fly', muscleGroup: 'shoulders', description: 'Isolation exercise targeting the posterior deltoids.' },
  { id: 'face-pull', name: 'Cable Face Pull', muscleGroup: 'shoulders', description: 'Targets the rear delts, rotator cuff, and upper back.' },

  // Biceps
  { id: 'barbell-curl', name: 'Barbell Bicep Curl', muscleGroup: 'biceps', description: 'Classic bicep builder targeting the biceps brachii.' },
  { id: 'hammer-curl', name: 'Dumbbell Hammer Curl', muscleGroup: 'biceps', description: 'Targets the biceps brachii, brachialis, and brachioradialis.' },
  { id: 'incline-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', description: 'Targets the long head of the bicep in a stretched position.' },

  // Triceps
  { id: 'tricep-pushdown', name: 'Cable Tricep Pushdown', muscleGroup: 'triceps', description: 'Isolation movement targeting the lateral and medial heads of the triceps.' },
  { id: 'overhead-extension', name: 'Dumbbell Overhead Extension', muscleGroup: 'triceps', description: 'Targets the long head of the triceps in a stretched position.' },
  { id: 'close-grip-bench', name: 'Close-Grip Bench Press', muscleGroup: 'triceps', description: 'Compound movement targeting the triceps and chest.' },

  // Back
  { id: 'pull-up', name: 'Pull-up', muscleGroup: 'back', description: 'Bodyweight or weighted vertical pull targeting the latissimus dorsi.' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', description: 'Compound horizontal pull targeting the mid-back, lats, and biceps.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', description: 'Machine vertical pull targeting the lats.' },
  { id: 'cable-row', name: 'Seated Cable Row', muscleGroup: 'back', description: 'Horizontal cable pull targeting the upper back and lats.' },
  { id: 'deadlift', name: 'Conventional Deadlift', muscleGroup: 'back', description: 'Heavy compound lift targeting the entire posterior chain.' },

  // Chest
  { id: 'bench-press', name: 'Flat Barbell Bench Press', muscleGroup: 'chest', description: 'Compound horizontal press targeting the pectoralis major, anterior deltoids, and triceps.' },
  { id: 'incline-press', name: 'Incline Dumbbell Press', muscleGroup: 'chest', description: 'Targets the upper portion of the chest (clavicular head).' },
  { id: 'chest-fly', name: 'Dumbbell Chest Fly', muscleGroup: 'chest', description: 'Isolation exercise targeting chest expansion.' },
  { id: 'dips', name: 'Chest Dips', muscleGroup: 'chest', description: 'Weighted or bodyweight exercise targeting the lower chest and triceps.' }
];

async function seed() {
  console.log('Seeding exercises...');
  for (const ex of INITIAL_EXERCISES) {
    await db.insert(exercises).values(ex).onConflictDoUpdate({
      target: exercises.id,
      set: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        description: ex.description
      }
    });
  }
  
  console.log('Database seeded successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
