import { Exercise, ExerciseLog } from '@/types/workout';

export interface WorkoutCompletionSummary {
  completedSets: number;
  completionRate: number;
  totalSets: number;
}

function clampSetCount(value: number, max: number): number {
  if (value < 0) {
    return 0;
  }

  return Math.min(value, max);
}

export function getWorkoutCompletionSummary(
  exercises: Exercise[],
  exerciseLogs?: ExerciseLog[],
): WorkoutCompletionSummary {
  const totalSets = exercises.reduce((sum, exercise) => {
    return sum + exercise.numberOfSets;
  }, 0);

  if (totalSets === 0) {
    return {
      completedSets: 0,
      completionRate: 0,
      totalSets: 0,
    };
  }

  const completedSetsByExerciseId = new Map<string, number>(
    (exerciseLogs ?? []).map((log) => [log.exercise.id, log.completedSets]),
  );

  const completedSets = exercises.reduce((sum, exercise) => {
    const completed = completedSetsByExerciseId.get(exercise.id) ?? 0;

    return sum + clampSetCount(completed, exercise.numberOfSets);
  }, 0);

  return {
    completedSets,
    completionRate: Math.round((completedSets / totalSets) * 100),
    totalSets,
  };
}
