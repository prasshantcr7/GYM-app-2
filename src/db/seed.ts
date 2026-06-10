import { db } from './index';
import { exercises } from './schema';

const INITIAL_EXERCISES = [
  // ==========================================
  // Chest (12 Exercises)
  // ==========================================
  { id: 'bench-press', name: 'Barbell Bench Press', muscleGroup: 'chest', description: 'Flat barbell bench press targeting the overall chest, front delts, and triceps.' },
  { id: 'incline-barbell-bench-press', name: 'Incline Barbell Bench Press', muscleGroup: 'chest', description: 'Incline press emphasizing the upper head of the pectorals.' },
  { id: 'decline-barbell-bench-press', name: 'Decline Barbell Bench Press', muscleGroup: 'chest', description: 'Decline press focusing on the lower pectorals.' },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', muscleGroup: 'chest', description: 'Flat dumbbell press allowing for greater range of motion and stabilizer activation.' },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', muscleGroup: 'chest', description: 'Incline dumbbell press targeting upper chest stabilizers.' },
  { id: 'decline-dumbbell-press', name: 'Decline Dumbbell Press', muscleGroup: 'chest', description: 'Decline dumbbell press targeting lower chest definition.' },
  { id: 'chest-press-machine', name: 'Chest Press Machine', muscleGroup: 'chest', description: 'Guided chest press focusing on pectoral hypertrophy.' },
  { id: 'smith-machine-bench-press', name: 'Smith Machine Bench Press', muscleGroup: 'chest', description: 'Fixed path bench press for safe execution near failure.' },
  { id: 'weighted-dips', name: 'Weighted Dips', muscleGroup: 'chest', description: 'Dips emphasizing lower chest, front shoulders, and triceps.' },
  { id: 'pec-deck-fly', name: 'Pec Deck Fly', muscleGroup: 'chest', description: 'Machine fly isolation targeting the inner chest chest.' },
  { id: 'cable-fly', name: 'Cable Fly', muscleGroup: 'chest', description: 'Pectoral fly using cables for constant muscle tension.' },
  { id: 'dumbbell-fly', name: 'Dumbbell Fly', muscleGroup: 'chest', description: 'Flat dumbbell fly to stretch and isolate the pectorals.' },

  // ==========================================
  // Back (12 Exercises)
  // ==========================================
  { id: 'deadlift', name: 'Conventional Deadlift', muscleGroup: 'back', description: 'Compound posterior chain exercise targeting lower back, hamstrings, and traps.' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', description: 'Compound horizontal pull targeting the mid-back and lats.' },
  { id: 'pendlay-row', name: 'Pendlay Row', muscleGroup: 'back', description: 'Strict horizontal pull starting from the floor on each rep.' },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'back', description: 'Chest-supported or landmine row targeting mid-back thickness.' },
  { id: 'cable-row', name: 'Seated Cable Row', muscleGroup: 'back', description: 'Horizontal cable pull targeting the mid-back and lats.' },
  { id: 'machine-row', name: 'Machine Row', muscleGroup: 'back', description: 'Guided machine pull for isolating back muscles.' },
  { id: 'one-arm-dumbbell-row', name: 'One-Arm Dumbbell Row', muscleGroup: 'back', description: 'Unilateral row targeting lat activation and core stability.' },
  { id: 'weighted-pull-up', name: 'Weighted Pull-Up', muscleGroup: 'back', description: 'Vertical pull-up with external resistance targeting the upper lats.' },
  { id: 'weighted-chin-up', name: 'Chin-Up (Weighted)', muscleGroup: 'back', description: 'Underhand vertical pull-up targeting lats and biceps.' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'back', description: 'Machine vertical pull targeting the latissimus dorsi.' },
  { id: 'straight-arm-pulldown', name: 'Straight Arm Pulldown', muscleGroup: 'back', description: 'Cable pull isolation exercise focusing entirely on lats.' },
  { id: 'rack-pull', name: 'Rack Pull', muscleGroup: 'back', description: 'Partial deadlift focusing on the upper and lower back development.' },

  // ==========================================
  // Legs (14 Exercises)
  // ==========================================
  { id: 'squat', name: 'Barbell Back Squat', muscleGroup: 'legs', description: 'Heavy compound lower body exercise targeting quadriceps, glutes, and hamstrings.' },
  { id: 'front-squat', name: 'Front Squat', muscleGroup: 'legs', description: 'Barbell squat focusing load on the quadriceps and core.' },
  { id: 'smith-machine-squat', name: 'Smith Machine Squat', muscleGroup: 'legs', description: 'Fixed path squat for isolating the quad fibers.' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', description: 'Heavy machine press targeting the quadriceps and glutes.' },
  { id: 'hack-squat', name: 'Hack Squat', muscleGroup: 'legs', description: 'Quad-focused machine squat with back support.' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'legs', description: 'Targets the hamstrings, glutes, and hip hinge movement.' },
  { id: 'stiff-leg-deadlift', name: 'Stiff Leg Deadlift', muscleGroup: 'legs', description: 'Deadlift variation stretching and loading the hamstrings.' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'legs', description: 'Unilateral leg squat targeting quads, glutes, and balance.' },
  { id: 'walking-lunges', name: 'Walking Lunges', muscleGroup: 'legs', description: 'Dynamic movement loading quads, hamstrings, and glutes.' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroup: 'legs', description: 'Machine isolation exercise targeting the quadriceps.' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'legs', description: 'Machine isolation exercise targeting the hamstrings.' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'legs', description: 'Weighted hip extension targeting the gluteus maximus.' },
  { id: 'glute-bridge', name: 'Glute Bridge', muscleGroup: 'legs', description: 'Floored bridge targeting glute activation.' },
  { id: 'sumo-deadlift', name: 'Sumo Deadlift', muscleGroup: 'legs', description: 'Wide-stance deadlift targeting adductors, glutes, and hips.' },

  // ==========================================
  // Shoulders (13 Exercises)
  // ==========================================
  { id: 'overhead-press', name: 'Barbell Overhead Press', muscleGroup: 'shoulders', description: 'Compound overhead press targeting anterior deltoids and triceps.' },
  { id: 'seated-dumbbell-shoulder-press', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'shoulders', description: 'Seated shoulder press isolating the front and lateral delts.' },
  { id: 'standing-dumbbell-shoulder-press', name: 'Standing Dumbbell Shoulder Press', muscleGroup: 'shoulders', description: 'Dumbbell shoulder press requiring core stabilization.' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'shoulders', description: 'Dumbbell press with rotation to hit all three deltoid heads.' },
  { id: 'push-press', name: 'Push Press', muscleGroup: 'shoulders', description: 'Explosive shoulder press utilizing leg drive.' },
  { id: 'machine-shoulder-press', name: 'Machine Shoulder Press', muscleGroup: 'shoulders', description: 'Guided shoulder press for high-intensity delt sets.' },
  { id: 'lateral-raise', name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', description: 'Isolation exercise targeting the lateral delts for width.' },
  { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', muscleGroup: 'shoulders', description: 'Cable lateral raise for constant side-delt tension.' },
  { id: 'front-raise', name: 'Front Raise', muscleGroup: 'shoulders', description: 'Isolation targeting the anterior/front deltoids.' },
  { id: 'upright-row', name: 'Upright Row', muscleGroup: 'shoulders', description: 'Barbell or cable pull targeting lateral delts and traps.' },
  { id: 'rear-delt-fly', name: 'Dumbbell Rear Delt Fly', muscleGroup: 'shoulders', description: 'Isolation exercise targeting the posterior deltoids.' },
  { id: 'face-pull', name: 'Cable Face Pull', muscleGroup: 'shoulders', description: 'Targets the rear delts, rotator cuff, and upper back.' },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', muscleGroup: 'shoulders', description: 'Machine fly isolation targeting the rear delts.' },

  // ==========================================
  // Biceps (10 Exercises)
  // ==========================================
  { id: 'barbell-curl', name: 'Barbell Bicep Curl', muscleGroup: 'biceps', description: 'Classic bicep builder targeting the biceps brachii.' },
  { id: 'ez-bar-curl', name: 'EZ Bar Curl', muscleGroup: 'biceps', description: 'Curled bar curl reducing wrist strain while targeting biceps.' },
  { id: 'dumbbell-curl', name: 'Dumbbell Bicep Curl', muscleGroup: 'biceps', description: 'Classic dumbbell curl focusing on bicep supination.' },
  { id: 'hammer-curl', name: 'Dumbbell Hammer Curl', muscleGroup: 'biceps', description: 'Targets the biceps brachii, brachialis, and brachioradialis.' },
  { id: 'incline-curl', name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', description: 'Targets the long head of the bicep in a stretched position.' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroup: 'biceps', description: 'Strict bicep isolation preventing shoulder assist.' },
  { id: 'concentration-curl', name: 'Concentration Curl', muscleGroup: 'biceps', description: 'Seated curl isolating the peak of the bicep brachii.' },
  { id: 'cable-curl', name: 'Cable Curl', muscleGroup: 'biceps', description: 'Constant cable tension curl for high bicep hypertrophy.' },
  { id: 'rope-hammer-curl', name: 'Rope Hammer Curl', muscleGroup: 'biceps', description: 'Hammer curl on cables targeting brachialis and forearms.' },
  { id: 'spider-curl', name: 'Spider Curl', muscleGroup: 'biceps', description: 'Incline bench curl targeting the short head of the bicep.' },

  // ==========================================
  // Triceps (9 Exercises)
  // ==========================================
  { id: 'skull-crushers', name: 'Skull Crushers', muscleGroup: 'triceps', description: 'EZ-bar extension targeting the long head of the triceps.' },
  { id: 'close-grip-bench', name: 'Close-Grip Bench Press', muscleGroup: 'triceps', description: 'Compound movement targeting the triceps and chest.' },
  { id: 'tricep-pushdown', name: 'Cable Tricep Pushdown', muscleGroup: 'triceps', description: 'Isolation movement targeting the lateral and medial heads of the triceps.' },
  { id: 'rope-pushdown', name: 'Rope Pushdown', muscleGroup: 'triceps', description: 'Cable pushdown allowing flare at bottom for extra contraction.' },
  { id: 'overhead-extension', name: 'Dumbbell Overhead Extension', muscleGroup: 'triceps', description: 'Targets the long head of the triceps in a stretched position.' },
  { id: 'dumbbell-tricep-extension', name: 'Dumbbell Tricep Extension', muscleGroup: 'triceps', description: 'Unilateral tricep extension for fixing imbalances.' },
  { id: 'weighted-bench-dips', name: 'Bench Dips (Weighted)', muscleGroup: 'triceps', description: 'Dips executed between benches with weights on lap.' },
  { id: 'weighted-tricep-dips', name: 'Weighted Dips (Tricep)', muscleGroup: 'triceps', description: 'Vertical dips with upright posture to isolate tricep press.' },
  { id: 'machine-tricep-extension', name: 'Machine Tricep Extension', muscleGroup: 'triceps', description: 'Guided tricep extension machine.' },

  // ==========================================
  // Core / Abs (8 Exercises)
  // ==========================================
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'core', description: 'Kneeling cable crunch to overload the rectus abdominis.' },
  { id: 'weighted-sit-up', name: 'Weighted Sit-Up', muscleGroup: 'core', description: 'Sit-ups with plate/dumbbell held on chest.' },
  { id: 'weighted-decline-sit-up', name: 'Weighted Decline Sit-Up', muscleGroup: 'core', description: 'Decline board sit-ups adding gravity and resistance.' },
  { id: 'weighted-hanging-leg-raise', name: 'Hanging Leg Raise (Weighted)', muscleGroup: 'core', description: 'Hanging bar leg raises with resistance between feet.' },
  { id: 'weighted-russian-twist', name: 'Russian Twist (Weighted)', muscleGroup: 'core', description: 'Seated torso twist targeting internal and external obliques.' },
  { id: 'ab-crunch-machine', name: 'Ab Crunch Machine', muscleGroup: 'core', description: 'Machine crunch loading the core directly.' },
  { id: 'weighted-plank', name: 'Weighted Plank', muscleGroup: 'core', description: 'Static plank with weight plates loaded on the lower back.' },
  { id: 'medicine-ball-sit-up', name: 'Medicine Ball Sit-Up', muscleGroup: 'core', description: 'Sit-ups throwing or holding a weighted medicine ball.' },

  // ==========================================
  // Calves (6 Exercises)
  // ==========================================
  { id: 'calf-raise', name: 'Standing Calf Raise', muscleGroup: 'calves', description: 'Targets the gastrocnemius muscle of the calves.' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', muscleGroup: 'calves', description: 'Isolation exercise targeting the soleus muscle.' },
  { id: 'leg-press-calf-raise', name: 'Leg Press Calf Raise', muscleGroup: 'calves', description: 'Calf raises on a leg press sled.' },
  { id: 'smith-machine-calf-raise', name: 'Smith Machine Calf Raise', muscleGroup: 'calves', description: 'Standing calf raise using the smith machine bar.' },
  { id: 'donkey-calf-raise', name: 'Donkey Calf Raise', muscleGroup: 'calves', description: 'Bent-over calf raises.' },
  { id: 'single-leg-calf-raise', name: 'Single Leg Calf Raise', muscleGroup: 'calves', description: 'Unilateral raise targeting ankle stability and calves.' },

  // ==========================================
  // Forearms / Grip (6 Exercises)
  // ==========================================
  { id: 'wrist-curl', name: 'Wrist Curl', muscleGroup: 'forearms', description: 'Underhand wrist flexions targeting the forearm flexor muscles.' },
  { id: 'reverse-wrist-curl', name: 'Reverse Wrist Curl', muscleGroup: 'forearms', description: 'Overhand wrist flexions targeting the forearm extensor muscles.' },
  { id: 'farmers-walk', name: 'Farmer\'s Walk', muscleGroup: 'forearms', description: 'Heavy loaded carry targeting overall grip strength and core.' },
  { id: 'plate-pinch-hold', name: 'Plate Pinch Hold', muscleGroup: 'forearms', description: 'Pinching plates together to target finger and pinch grip strength.' },
  { id: 'weighted-dead-hang', name: 'Dead Hang (Weighted)', muscleGroup: 'forearms', description: 'Hanging from a bar with weight targeting forearm endurance.' },
  { id: 'wrist-roller', name: 'Wrist Roller', muscleGroup: 'forearms', description: 'Rolling a weight up and down using a forearm roller bar.' }
];

async function seed() {
  console.log('Seeding master list of exercises...');
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
  console.log('Database seeded with 86 exercises successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
