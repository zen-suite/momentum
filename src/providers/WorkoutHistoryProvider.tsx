import React from 'react';

import { useLoadWorkoutHistory } from '@/hooks/useLoadWorkoutHistory';
import { useSyncHistoryFromLogs } from '@/hooks/useSyncHistoryFromLogs';

export function WorkoutHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLoadWorkoutHistory();
  useSyncHistoryFromLogs();

  return <>{children}</>;
}
