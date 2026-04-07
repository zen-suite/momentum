import React from 'react';

import { useLoadWorkoutRoutine } from '@/hooks/useLoadWorkoutRoutine';
import { usePersistWorkoutRoutine } from '@/hooks/usePersistWorkoutRoutine';

export function WorkoutRoutineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLoadWorkoutRoutine();
  usePersistWorkoutRoutine();

  return <>{children}</>;
}
