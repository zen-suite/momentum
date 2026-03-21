import AsyncStorage from '@react-native-async-storage/async-storage';

import { Workout } from '@/types/workout';

import { WorkoutStorage } from './WorkoutStorage';

type SerializedWorkout = Omit<Workout, 'createdAt' | 'completedAt'> & {
  createdAt: string;
  completedAt?: string;
};

export class AsyncStorageWorkout implements WorkoutStorage {
  private readonly key = 'workouts';

  async load(): Promise<Workout[]> {
    const raw = await AsyncStorage.getItem(this.key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SerializedWorkout[];
    return parsed.map((w) => ({
      ...w,
      createdAt: new Date(w.createdAt),
      completedAt: w.completedAt ? new Date(w.completedAt) : undefined,
    }));
  }

  async save(workouts: Workout[]): Promise<void> {
    await AsyncStorage.setItem(this.key, JSON.stringify(workouts));
  }
}
