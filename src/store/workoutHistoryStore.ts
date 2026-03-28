import { create } from 'zustand';

import { WorkoutLog } from '@/types/workout';

interface WorkoutHistoryState {
  history: WorkoutLog[];
  isLoaded: boolean;
  setHistory: (history: WorkoutLog[]) => void;
}

export const useWorkoutHistoryStore = create<WorkoutHistoryState>((set) => ({
  history: [],
  isLoaded: false,

  setHistory: (history: WorkoutLog[]) => {
    set({ history, isLoaded: true });
  },
}));
