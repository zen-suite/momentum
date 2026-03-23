import React from 'react';

import { useSyncHistoryFromLogs } from '@/hooks/useSyncHistoryFromLogs';

export function WorkoutHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSyncHistoryFromLogs();

  return <>{children}</>;
}
