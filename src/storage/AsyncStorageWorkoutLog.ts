import AsyncStorage from '@react-native-async-storage/async-storage';

import { ExerciseLog, WorkoutLog } from '@/types/workout';

import { WorkoutLogStorage } from './WorkoutLogStorage';

type SerializedExerciseLog = Omit<ExerciseLog, 'completedAt'> & {
  completedAt?: string;
};

type SerializedWorkoutLog = Omit<
  WorkoutLog,
  'exercises' | 'completedAt' | 'workout'
> & {
  workout: Omit<WorkoutLog['workout'], 'createdAt' | 'completedAt'> & {
    createdAt: string;
    completedAt?: string;
  };
  exercises: SerializedExerciseLog[];
  completedAt?: string;
};

export class AsyncStorageWorkoutLog implements WorkoutLogStorage {
  private readonly key = 'workoutLogs';

  async load(): Promise<Record<string, WorkoutLog>> {
    const raw = await AsyncStorage.getItem(this.key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SerializedWorkoutLog>;
    const result: Record<string, WorkoutLog> = {};
    for (const [id, log] of Object.entries(parsed)) {
      result[id] = {
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
      };
    }
    return result;
  }

  async save(logs: Record<string, WorkoutLog>): Promise<void> {
    await AsyncStorage.setItem(this.key, JSON.stringify(logs));
  }
}
