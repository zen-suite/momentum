import { useEffect } from 'react';

import { workoutHistoryStorage } from '@/storage';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';

export function useLoadWorkoutHistory() {
  const setHistory = useWorkoutHistoryStore((state) => state.setHistory);

  useEffect(() => {
    workoutHistoryStorage.load().then(setHistory);
  }, [setHistory]);
}
