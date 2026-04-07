import React, { useEffect, useRef } from 'react';

import { AppState, AppStateStatus } from 'react-native';

import { syncWorkoutReminderQueueAsync } from '@/notifications/workoutReminderScheduler';
import '@/notifications/workoutReminderBackgroundTask';
import { useSettings } from '@/hooks/useSettings';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useWorkouts } from '@/hooks/useWorkouts';

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, isLoaded: settingsLoaded } = useSettings();
  const { workouts, isLoaded: workoutsLoaded } = useWorkouts();
  const { history, isLoaded: historyLoaded } = useWorkoutHistory();
  const previousAppState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!settingsLoaded || !workoutsLoaded || !historyLoaded) {
      return;
    }

    void syncWorkoutReminderQueueAsync({
      settings,
      workouts,
      history,
    }).catch((error) => {
      console.error('[notifications] Failed to synchronize reminders.', error);
    });
  }, [
    history,
    historyLoaded,
    settings,
    settingsLoaded,
    workouts,
    workoutsLoaded,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const becameActive =
        previousAppState.current !== 'active' && nextState === 'active';

      previousAppState.current = nextState;

      if (
        !becameActive ||
        !settingsLoaded ||
        !workoutsLoaded ||
        !historyLoaded
      ) {
        return;
      }

      void syncWorkoutReminderQueueAsync({
        settings,
        workouts,
        history,
      }).catch((error) => {
        console.error('[notifications] Failed to refresh reminders.', error);
      });
    });

    return () => {
      subscription.remove();
    };
  }, [
    history,
    historyLoaded,
    settings,
    settingsLoaded,
    workouts,
    workoutsLoaded,
  ]);

  return <>{children}</>;
}
