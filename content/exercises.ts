export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Exercise = {
  id: string;
  name: string;
  difficulty: Difficulty;
  muscles: string[];
  reps: string;
  duration: string;
  instructions: string[];
  commonMistakes: string[];
  safetyTips: string[];
  /** Placeholder visual — emoji-based demo for MVP */
  visual: string;
  category: "warmup" | "strength" | "cardio" | "core" | "mobility" | "cooldown";
};

export const EXERCISES: Exercise[] = [
  {
    id: "jumping-jacks",
    name: "Jumping Jacks",
    difficulty: "beginner",
    muscles: ["Full body", "Calves", "Shoulders"],
    reps: "30–50 reps",
    duration: "30–45 sec",
    instructions: [
      "Stand tall with feet together and arms at your sides.",
      "Jump while spreading legs shoulder-width and raising arms overhead.",
      "Land softly and return to the starting position in one smooth motion.",
      "Keep a steady rhythm and breathe continuously.",
    ],
    commonMistakes: [
      "Landing with locked knees",
      "Shrugging shoulders up to the ears",
      "Moving too fast without control",
    ],
    safetyTips: [
      "Land softly through the balls of your feet",
      "Modify by stepping side to side instead of jumping",
      "Stop if you feel sharp knee or ankle pain",
    ],
    visual: "🏃",
    category: "cardio",
  },
  {
    id: "bodyweight-squats",
    name: "Bodyweight Squats",
    difficulty: "beginner",
    muscles: ["Quads", "Glutes", "Hamstrings"],
    reps: "12–15 reps",
    duration: "45–60 sec",
    instructions: [
      "Stand with feet shoulder-width apart, toes slightly out.",
      "Push hips back and bend knees to lower as if sitting in a chair.",
      "Keep chest up and knees tracking over toes.",
      "Drive through heels to stand back up.",
    ],
    commonMistakes: [
      "Knees caving inward",
      "Heels lifting off the floor",
      "Rounding the lower back",
    ],
    safetyTips: [
      "Only squat as deep as you can with good form",
      "Keep weight in your heels",
      "Use a chair behind you for confidence if needed",
    ],
    visual: "🦵",
    category: "strength",
  },
  {
    id: "push-ups",
    name: "Push-ups",
    difficulty: "intermediate",
    muscles: ["Chest", "Triceps", "Shoulders", "Core"],
    reps: "8–12 reps",
    duration: "45 sec",
    instructions: [
      "Start in a high plank with hands slightly wider than shoulders.",
      "Lower your chest toward the floor while keeping body in a straight line.",
      "Elbows angle back at about 45 degrees.",
      "Press through palms to return to the start.",
    ],
    commonMistakes: [
      "Hips sagging or piking up",
      "Flaring elbows straight out to the sides",
      "Not going through full range of motion",
    ],
    safetyTips: [
      "Drop to knees or use wall push-ups to modify",
      "Keep core braced throughout",
      "Avoid if you have acute shoulder pain",
    ],
    visual: "💪",
    category: "strength",
  },
  {
    id: "plank",
    name: "Plank",
    difficulty: "beginner",
    muscles: ["Core", "Shoulders", "Glutes"],
    reps: "Hold",
    duration: "30–60 sec",
    instructions: [
      "Place forearms or hands on the floor, elbows under shoulders.",
      "Extend legs back and create a straight line from head to heels.",
      "Brace your core and squeeze glutes.",
      "Breathe steadily without letting hips drop.",
    ],
    commonMistakes: [
      "Hips too high or sagging low",
      "Holding breath",
      "Looking up and straining the neck",
    ],
    safetyTips: [
      "Start with shorter holds and build up",
      "Drop to knees for a modified plank",
      "Stop if you feel lower back strain",
    ],
    visual: "🧘",
    category: "core",
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    difficulty: "beginner",
    muscles: ["Core", "Hip flexors"],
    reps: "10 each side",
    duration: "45 sec",
    instructions: [
      "Lie on your back with arms extended toward the ceiling.",
      "Lift knees to 90 degrees over hips.",
      "Slowly extend opposite arm and leg while keeping lower back pressed down.",
      "Return and alternate sides with control.",
    ],
    commonMistakes: [
      "Lower back arching off the floor",
      "Moving too quickly",
      "Holding breath during the movement",
    ],
    safetyTips: [
      "Move only as far as you can keep your back flat",
      "Exhale as you extend",
      "Reduce range if you feel back discomfort",
    ],
    visual: "🐛",
    category: "core",
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    difficulty: "beginner",
    muscles: ["Glutes", "Hamstrings", "Core"],
    reps: "12–15 reps",
    duration: "45 sec",
    instructions: [
      "Lie on your back with knees bent and feet flat on the floor.",
      "Drive through heels to lift hips until body forms a straight line.",
      "Squeeze glutes at the top for 1–2 seconds.",
      "Lower with control without dropping hips abruptly.",
    ],
    commonMistakes: [
      "Overarching the lower back",
      "Pushing through toes instead of heels",
      "Rushing through reps",
    ],
    safetyTips: [
      "Keep knees hip-width apart",
      "Don't lift hips higher than a straight line",
      "Pause at the top for maximum glute activation",
    ],
    visual: "🌉",
    category: "strength",
  },
  {
    id: "burpees",
    name: "Burpees",
    difficulty: "advanced",
    muscles: ["Full body", "Cardio"],
    reps: "6–10 reps",
    duration: "60 sec",
    instructions: [
      "From standing, squat down and place hands on the floor.",
      "Jump or step feet back into a plank position.",
      "Perform a push-up (optional), then jump feet forward.",
      "Explode up with a jump and clap overhead.",
    ],
    commonMistakes: [
      "Skipping the plank position",
      "Landing hard on joints",
      "Letting hips sag in the plank phase",
    ],
    safetyTips: [
      "Step back instead of jumping if needed",
      "Skip the jump at the top to reduce impact",
      "Build up gradually — this is high intensity",
    ],
    visual: "🔥",
    category: "cardio",
  },
  {
    id: "lunges",
    name: "Walking Lunges",
    difficulty: "intermediate",
    muscles: ["Quads", "Glutes", "Hamstrings"],
    reps: "8 each leg",
    duration: "60 sec",
    instructions: [
      "Stand tall and take a large step forward.",
      "Lower until both knees are at roughly 90 degrees.",
      "Keep front knee over ankle, not past toes.",
      "Push through front heel to step forward into the next lunge.",
    ],
    commonMistakes: [
      "Front knee collapsing inward",
      "Leaning torso too far forward",
      "Short steps that don't allow proper depth",
    ],
    safetyTips: [
      "Use a wall for balance if needed",
      "Keep torso upright",
      "Reduce depth if you feel knee discomfort",
    ],
    visual: "🚶",
    category: "strength",
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    difficulty: "intermediate",
    muscles: ["Core", "Hip flexors", "Shoulders"],
    reps: "20 each leg",
    duration: "30–45 sec",
    instructions: [
      "Start in a high plank position.",
      "Drive one knee toward your chest.",
      "Quickly switch legs, alternating in a running motion.",
      "Keep hips level and core engaged throughout.",
    ],
    commonMistakes: [
      "Hips bouncing up and down",
      "Not bringing knees far enough forward",
      "Holding breath",
    ],
    safetyTips: [
      "Slow down the pace to maintain form",
      "Keep shoulders stacked over wrists",
      "Modify by stepping instead of running",
    ],
    visual: "⛰️",
    category: "cardio",
  },
  {
    id: "cat-cow",
    name: "Cat-Cow Stretch",
    difficulty: "beginner",
    muscles: ["Spine", "Core", "Hip flexors"],
    reps: "10 cycles",
    duration: "30 sec",
    instructions: [
      "Start on hands and knees in a tabletop position.",
      "Inhale: drop belly, lift chest and tailbone (cow).",
      "Exhale: round spine, tuck chin and tailbone (cat).",
      "Flow smoothly between positions with your breath.",
    ],
    commonMistakes: [
      "Moving only the neck, not the whole spine",
      "Rushing through the movement",
      "Locking elbows",
    ],
    safetyTips: [
      "Move within a comfortable range",
      "Keep movements slow and controlled",
      "Great for warm-up or cool-down",
    ],
    visual: "🐱",
    category: "mobility",
  },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getExerciseByName(name: string): Exercise | undefined {
  return EXERCISES.find(
    (e) => e.name.toLowerCase() === name.toLowerCase(),
  );
}

export function getExercisesByCategory(
  category: Exercise["category"],
): Exercise[] {
  return EXERCISES.filter((e) => e.category === category);
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
