import { Exercise, ExerciseLog } from '@/types/workout';
import { getWorkoutCompletionSummary } from '@/utils/workoutCompletion';

const exercises: Exercise[] = [
  { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3 },
  { id: 'e2', name: 'Deadlift', reps: 5, numberOfSets: 2 },
];

describe('getWorkoutCompletionSummary', () => {
  it('returns zero progress when there are no logs', () => {
    expect(getWorkoutCompletionSummary(exercises)).toEqual({
      completedSets: 0,
      completionRate: 0,
      totalSets: 5,
    });
  });

  it('calculates completion based on sets', () => {
    const logs: ExerciseLog[] = [
      {
        id: 'l1',
        exercise: exercises[0],
        completedSets: 3,
      },
      {
        id: 'l2',
        exercise: exercises[1],
        completedSets: 1,
      },
    ];

    expect(getWorkoutCompletionSummary(exercises, logs)).toEqual({
      completedSets: 4,
      completionRate: 80,
      totalSets: 5,
    });
  });

  it('clamps completion to the workout set count', () => {
    const logs: ExerciseLog[] = [
      {
        id: 'l1',
        exercise: exercises[0],
        completedSets: 99,
      },
      {
        id: 'l2',
        exercise: exercises[1],
        completedSets: 99,
      },
    ];

    expect(getWorkoutCompletionSummary(exercises, logs)).toEqual({
      completedSets: 5,
      completionRate: 100,
      totalSets: 5,
    });
  });
});
