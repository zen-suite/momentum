import { useEffect } from 'react';

import { workoutLogStorage } from '@/storage';
import { useWorkoutRoutineStore } from '@/store/workoutRoutineStore';

export function usePersistWorkoutRoutine() {
  const workoutLogs = useWorkoutRoutineStore((state) => state.workoutLogs);
  const isLoaded = useWorkoutRoutineStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) return;
    void workoutLogStorage.save(workoutLogs).catch((error) => {
      console.error('[storage] Failed to persist workout routine logs.', error);
    });
  }, [workoutLogs, isLoaded]);
}
