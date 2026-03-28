import { useShallow } from 'zustand/react/shallow';

import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

export function useWorkoutHistory() {
  return useWorkoutHistoryStore(
    useShallow((state) => ({
      history: state.history,
      isLoaded: state.isLoaded,
    })),
  );
}
