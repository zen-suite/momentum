import { renderHook } from '@testing-library/react-native';

import { WorkoutLog } from '@/types/workout';
import { useWorkoutStats } from './useWorkoutStats';

const base = new Date('2026-01-01T10:00:00Z');

function makeLog(
  id: string,
  workoutName: string,
  completedAt: Date | undefined,
  exercises: {
    weight?: number;
    reps: number;
    sets: number;
    completedSets: number;
  }[] = [],
): WorkoutLog {
  return {
    id,
    workout: {
      id,
      name: workoutName,
      exercises: exercises.map((e, i) => ({
        id: `e${i}`,
        name: `Exercise ${i}`,
        reps: e.reps,
        numberOfSets: e.sets,
        weight: e.weight,
      })),
      createdAt: base,
    },
    exercises: exercises.map((e, i) => ({
      id: `el${i}`,
      exercise: {
        id: `e${i}`,
        name: `Exercise ${i}`,
        reps: e.reps,
        numberOfSets: e.sets,
        weight: e.weight,
      },
      completedSets: e.completedSets,
      completedAt: e.completedSets === e.sets ? completedAt : undefined,
    })),
    completedAt,
  };
}

describe('useWorkoutStats', () => {
  it('returns zeroed stats for empty history', () => {
    const { result } = renderHook(() => useWorkoutStats([]));
    expect(result.current.totalWorkouts).toBe(0);
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.totalVolumeKg).toBe(0);
    expect(result.current.thisWeek).toBe(0);
    expect(result.current.thisMonth).toBe(0);
    expect(result.current.mostFrequentWorkout).toBeNull();
    expect(result.current.totalSets).toBe(0);
  });

  it('counts only completed workouts for totalWorkouts', () => {
    const history: WorkoutLog[] = [
      makeLog('1', 'Chest', new Date()),
      makeLog('2', 'Back', undefined),
    ];
    const { result } = renderHook(() => useWorkoutStats(history));
    expect(result.current.totalWorkouts).toBe(1);
  });

  it('computes totalSets across all logs', () => {
    const history: WorkoutLog[] = [
      makeLog('1', 'A', new Date(), [{ reps: 10, sets: 3, completedSets: 3 }]),
      makeLog('2', 'B', new Date(), [{ reps: 8, sets: 4, completedSets: 2 }]),
    ];
    const { result } = renderHook(() => useWorkoutStats(history));
    expect(result.current.totalSets).toBe(5);
  });

  it('computes totalVolumeKg (skips exercises without weight)', () => {
    const history: WorkoutLog[] = [
      makeLog('1', 'A', new Date(), [
        { weight: 60, reps: 10, sets: 3, completedSets: 3 },
        { reps: 12, sets: 3, completedSets: 3 },
      ]),
    ];
    // 60 * 10 * 3 = 1800
    const { result } = renderHook(() => useWorkoutStats(history));
    expect(result.current.totalVolumeKg).toBe(1800);
  });

  it('identifies the most frequent workout', () => {
    const history: WorkoutLog[] = [
      makeLog('1', 'Chest', new Date()),
      makeLog('2', 'Chest', new Date()),
      makeLog('3', 'Back', new Date()),
    ];
    const { result } = renderHook(() => useWorkoutStats(history));
    expect(result.current.mostFrequentWorkout).toBe('Chest');
  });

  it('returns null mostFrequentWorkout for empty history', () => {
    const { result } = renderHook(() => useWorkoutStats([]));
    expect(result.current.mostFrequentWorkout).toBeNull();
  });
});
