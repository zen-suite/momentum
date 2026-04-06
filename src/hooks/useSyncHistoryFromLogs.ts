import { useEffect } from 'react';

import { workoutHistoryStorage } from '@/storage';
import { useWorkoutHistoryStore } from '@/store/workoutHistoryStore';
import { useWorkoutRoutineStore } from '@/store/workoutRoutineStore';

export function useSyncHistoryFromLogs() {
  const workoutLogs = useWorkoutRoutineStore((state) => state.workoutLogs);
  const setHistory = useWorkoutHistoryStore((state) => state.setHistory);

  useEffect(() => {
    const logsToSync = Object.values(workoutLogs).filter(
      (log) => log.completedAt || log.exercises.some((e) => e.completedAt),
    );
    if (logsToSync.length === 0) return;

    void (async () => {
      const existing = await workoutHistoryStorage.load();
      const map = new Map(existing.map((l) => [l.id, l]));
      logsToSync.forEach((log) => map.set(log.id, log));
      const merged = Array.from(map.values());
      await workoutHistoryStorage.save(merged);
      setHistory(merged);
    })().catch((error) => {
      console.error(
        '[storage] Failed to sync workout history from logs.',
        error,
      );
    });
  }, [workoutLogs, setHistory]);
}
