import { useMemo } from 'react';

import { WorkoutLog } from '@/types/workout';

export interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  totalVolumeKg: number;
  thisWeek: number;
  thisMonth: number;
  mostFrequentWorkout: string | null;
  totalSets: number;
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function useWorkoutStats(history: WorkoutLog[]): WorkoutStats {
  return useMemo(() => {
    const completed = history.filter((l) => l.completedAt);

    const totalWorkouts = completed.length;

    const totalSets = history.reduce(
      (sum, log) =>
        sum + log.exercises.reduce((s, e) => s + e.completedSets, 0),
      0,
    );

    const totalVolumeKg = Math.round(
      history.reduce(
        (sum, log) =>
          sum +
          log.exercises.reduce(
            (s, e) =>
              s + (e.exercise.weight ?? 0) * e.exercise.reps * e.completedSets,
            0,
          ),
        0,
      ),
    );

    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgoStart = todayStart - 6 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const thisWeek = completed.filter((l) => {
      const d = startOfDay(l.completedAt!);
      return d >= weekAgoStart && d <= todayStart;
    }).length;

    const thisMonth = completed.filter((l) => {
      return startOfDay(l.completedAt!) >= monthStart;
    }).length;

    // Current streak: consecutive days going backwards from today
    const completedDays = new Set(
      completed.map((l) => startOfDay(l.completedAt!)),
    );
    let streak = 0;
    let day = todayStart;
    while (completedDays.has(day)) {
      streak++;
      day -= 24 * 60 * 60 * 1000;
    }
    // If today has no workout yet, check yesterday to continue a prior streak
    if (streak === 0) {
      const yesterday = todayStart - 24 * 60 * 60 * 1000;
      day = yesterday;
      while (completedDays.has(day)) {
        streak++;
        day -= 24 * 60 * 60 * 1000;
      }
    }

    const workoutCounts = new Map<string, number>();
    completed.forEach((l) => {
      const name = l.workout.name;
      workoutCounts.set(name, (workoutCounts.get(name) ?? 0) + 1);
    });
    let mostFrequentWorkout: string | null = null;
    let maxCount = 0;
    workoutCounts.forEach((count, name) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentWorkout = name;
      }
    });

    return {
      totalWorkouts,
      currentStreak: streak,
      totalVolumeKg,
      thisWeek,
      thisMonth,
      mostFrequentWorkout,
      totalSets,
    };
  }, [history]);
}
