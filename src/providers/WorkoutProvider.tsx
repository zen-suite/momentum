import React from 'react';

import { useLoadWorkouts } from '@/hooks/useLoadWorkouts';
import { usePersistWorkouts } from '@/hooks/usePersistWorkouts';

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  useLoadWorkouts();
  usePersistWorkouts();

  return <>{children}</>;
}
