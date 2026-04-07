import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import {
  syncWorkoutReminderQueueFromStorageAsync,
  WORKOUT_REMINDER_BACKGROUND_TASK,
} from './workoutReminderScheduler';

TaskManager.defineTask(WORKOUT_REMINDER_BACKGROUND_TASK, async () => {
  try {
    await syncWorkoutReminderQueueFromStorageAsync({ topUpOnly: true });
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error(
      '[notifications] Failed to refill workout reminder queue.',
      error,
    );
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
