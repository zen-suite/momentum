import AsyncStorage from '@react-native-async-storage/async-storage';

import { ExerciseLog, WorkoutLog } from '@/types/workout';

import { WorkoutHistoryStorage } from './WorkoutHistoryStorage';

type SerializedExerciseLog = Omit<ExerciseLog, 'completedAt'> & {
  completedAt?: string;
};

type SerializedWorkoutLog = Omit<WorkoutLog, 'exercises' | 'completedAt' | 'workout'> & {
  workout: Omit<WorkoutLog['workout'], 'createdAt' | 'completedAt'> & {
    createdAt: string;
    completedAt?: string;
  };
  exercises: SerializedExerciseLog[];
  completedAt?: string;
};

export class AsyncStorageWorkoutHistory implements WorkoutHistoryStorage {
  private readonly key = 'workoutHistory';

  async load(): Promise<WorkoutLog[]> {
    const raw = await AsyncStorage.getItem(this.key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SerializedWorkoutLog[];
    return parsed.map((log) => ({
      ...log,
      completedAt: log.completedAt ? new Date(log.completedAt) : undefined,
      workout: {
        ...log.workout,
        createdAt: new Date(log.workout.createdAt),
        completedAt: log.workout.completedAt
          ? new Date(log.workout.completedAt)
          : undefined,
      },
      exercises: log.exercises.map((e) => ({
        ...e,
        completedAt: e.completedAt ? new Date(e.completedAt) : undefined,
      })),
    }));
  }

  async save(logs: WorkoutLog[]): Promise<void> {
    await AsyncStorage.setItem(this.key, JSON.stringify(logs));
  }
}
