import AsyncStorage from '@react-native-async-storage/async-storage';

import { Workout } from '@/types/workout';

const STORAGE_KEY = 'workouts';

type SerializedWorkout = Omit<Workout, 'createdAt' | 'completedAt'> & {
  createdAt: string;
  completedAt?: string;
};

function deserializeWorkouts(json: string): Workout[] {
  const parsed = JSON.parse(json) as SerializedWorkout[];
  return parsed.map((w) => ({
    ...w,
    createdAt: new Date(w.createdAt),
    completedAt: w.completedAt ? new Date(w.completedAt) : undefined,
  }));
}

export async function loadWorkouts(): Promise<Workout[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return deserializeWorkouts(raw);
}

export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}
