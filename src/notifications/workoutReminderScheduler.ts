import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { Linking, Platform } from 'react-native';

import {
  settingsStorage,
  workoutHistoryStorage,
  workoutStorage,
} from '@/storage';
import { AppSettings } from '@/types/settings-types';
import { Workout, WorkoutLog } from '@/types/workout';
import { normalizeSettings } from '@/utils/settings';

import {
  buildWorkoutReminderQueue,
  WORKOUT_REMINDER_CHANNEL_ID,
  WORKOUT_REMINDER_KIND,
  WORKOUT_REMINDER_MINIMUM_REMAINING,
} from './workoutReminderUtils';

export const WORKOUT_REMINDER_BACKGROUND_TASK =
  'momentum.workoutReminderBackgroundRefill';

export interface WorkoutReminderSnapshot {
  settings: AppSettings;
  workouts: Workout[];
  history: WorkoutLog[];
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function isManagedWorkoutReminder(
  request: Notifications.NotificationRequest,
): boolean {
  const data = request.content.data as Record<string, unknown> | null;

  return data?.kind === WORKOUT_REMINDER_KIND;
}

function buildDateTrigger(date: Date): Notifications.DateTriggerInput {
  if (Platform.OS === 'android') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: WORKOUT_REMINDER_CHANNEL_ID,
    };
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
  };
}

export async function ensureWorkoutReminderChannelAsync(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(WORKOUT_REMINDER_CHANNEL_ID, {
    name: 'Workout reminders',
    importance: Notifications.AndroidImportance.HIGH,
    description: 'Scheduled workout reminders from Momentum.',
  });
}

export async function getWorkoutReminderPermissionStatusAsync() {
  return Notifications.getPermissionsAsync();
}

export async function requestWorkoutReminderPermissionsAsync() {
  await ensureWorkoutReminderChannelAsync();

  return Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
}

export async function openWorkoutReminderSettingsAsync(): Promise<void> {
  await Linking.openSettings();
}

export async function getManagedWorkoutReminderRequestsAsync() {
  const requests = await Notifications.getAllScheduledNotificationsAsync();

  return requests.filter(isManagedWorkoutReminder);
}

export async function cancelManagedWorkoutRemindersAsync(): Promise<void> {
  const requests = await getManagedWorkoutReminderRequestsAsync();

  await Promise.all(
    requests.map((request) =>
      Notifications.cancelScheduledNotificationAsync(request.identifier),
    ),
  );
}

export async function buildWorkoutReminderSnapshotFromStorageAsync(): Promise<WorkoutReminderSnapshot> {
  const [settings, workouts, history] = await Promise.all([
    settingsStorage.load(),
    workoutStorage.load(),
    workoutHistoryStorage.load(),
  ]);

  return {
    settings: normalizeSettings(settings),
    workouts,
    history,
  };
}

export async function scheduleWorkoutReminderQueueAsync(
  snapshot: WorkoutReminderSnapshot,
  now: Date = new Date(),
): Promise<string[]> {
  await cancelManagedWorkoutRemindersAsync();

  const reminderQueue = buildWorkoutReminderQueue({
    now,
    workouts: snapshot.workouts,
    history: snapshot.history,
    notifications: snapshot.settings.notifications,
  });

  if (reminderQueue.length === 0) {
    return [];
  }

  await ensureWorkoutReminderChannelAsync();

  const identifiers = await Promise.all(
    reminderQueue.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          data: {
            kind: WORKOUT_REMINDER_KIND,
            workoutName: reminder.workoutName,
            quote: reminder.quote,
            triggerDate: reminder.triggerDate.toISOString(),
          },
        },
        trigger: buildDateTrigger(reminder.triggerDate),
      }),
    ),
  );

  return identifiers;
}

export async function syncWorkoutReminderBackgroundTaskAsync(
  enabled: boolean,
): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    WORKOUT_REMINDER_BACKGROUND_TASK,
  );

  if (!enabled) {
    if (isRegistered) {
      await TaskManager.unregisterTaskAsync(WORKOUT_REMINDER_BACKGROUND_TASK);
    }
    return;
  }

  const status = await BackgroundTask.getStatusAsync();
  if (
    status !== BackgroundTask.BackgroundTaskStatus.Available ||
    isRegistered
  ) {
    return;
  }

  await BackgroundTask.registerTaskAsync(WORKOUT_REMINDER_BACKGROUND_TASK, {
    minimumInterval: 12 * 60,
  });
}

export async function syncWorkoutReminderQueueAsync(
  snapshot: WorkoutReminderSnapshot,
  options?: { topUpOnly?: boolean; now?: Date },
): Promise<number> {
  const permissionStatus = await getWorkoutReminderPermissionStatusAsync();
  const schedulingEnabled =
    snapshot.settings.notifications.enabled &&
    permissionStatus.granted &&
    snapshot.workouts.length > 0;

  await syncWorkoutReminderBackgroundTaskAsync(schedulingEnabled);

  if (!schedulingEnabled) {
    await cancelManagedWorkoutRemindersAsync();
    return 0;
  }

  if (options?.topUpOnly) {
    const existingRequests = await getManagedWorkoutReminderRequestsAsync();
    if (existingRequests.length >= WORKOUT_REMINDER_MINIMUM_REMAINING) {
      return existingRequests.length;
    }
  }

  const identifiers = await scheduleWorkoutReminderQueueAsync(
    snapshot,
    options?.now,
  );

  return identifiers.length;
}

export async function syncWorkoutReminderQueueFromStorageAsync(options?: {
  topUpOnly?: boolean;
  now?: Date;
}): Promise<number> {
  const snapshot = await buildWorkoutReminderSnapshotFromStorageAsync();
  return syncWorkoutReminderQueueAsync(snapshot, options);
}
