import { Workout } from '@/types/workout';

export interface WorkoutStorage {
  load(): Promise<Workout[]>;
  save(workouts: Workout[]): Promise<void>;
}
