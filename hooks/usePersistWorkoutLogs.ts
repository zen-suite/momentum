import { useEffect } from 'react';

import { workoutLogStorage } from '@/storage';
import { useWorkoutLogStore } from '@/store/workoutLogStore';

export function usePersistWorkoutLogs() {
  const workoutLogs = useWorkoutLogStore((state) => state.workoutLogs);
  const isLoaded = useWorkoutLogStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) return;
    workoutLogStorage.save(workoutLogs);
  }, [workoutLogs, isLoaded]);
}
