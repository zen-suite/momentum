import React from 'react';

import { useLoadWorkoutLogs } from '@/hooks/useLoadWorkoutLogs';
import { usePersistWorkoutLogs } from '@/hooks/usePersistWorkoutLogs';

export function WorkoutLogProvider({ children }: { children: React.ReactNode }) {
  useLoadWorkoutLogs();
  usePersistWorkoutLogs();

  return <>{children}</>;
}
