import { WorkoutLog } from '@/types/workout';

export interface WorkoutHistoryStorage {
  load(): Promise<WorkoutLog[]>;
  save(logs: WorkoutLog[]): Promise<void>;
}
