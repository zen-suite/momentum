import { useEffect } from 'react';

import { workoutHistoryStorage } from '@/storage';
import { useWorkoutLogStore } from '@/store/workoutLogStore';

export function useSyncHistoryFromLogs() {
  const workoutLogs = useWorkoutLogStore((state) => state.workoutLogs);

  useEffect(() => {
    const logsToSync = Object.values(workoutLogs).filter(
      (log) => log.completedAt || log.exercises.some((e) => e.completedAt),
    );
    if (logsToSync.length === 0) return;

    (async () => {
      const existing = await workoutHistoryStorage.load();
      const map = new Map(existing.map((l) => [l.id, l]));
      logsToSync.forEach((log) => map.set(log.id, log));
      await workoutHistoryStorage.save(Array.from(map.values()));
    })();
  }, [workoutLogs]);
}
