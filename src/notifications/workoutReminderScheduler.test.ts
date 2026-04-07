import * as BackgroundTask from 'expo-background-task';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import {
  cancelManagedWorkoutRemindersAsync,
  scheduleWorkoutReminderQueueAsync,
  syncWorkoutReminderQueueAsync,
  WORKOUT_REMINDER_BACKGROUND_TASK,
  WorkoutReminderSnapshot,
} from '@/notifications/workoutReminderScheduler';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_SETTINGS,
} from '@/utils/settings';

const notificationsMock = Notifications as typeof Notifications & {
  __resetScheduledNotifications: () => void;
};

const sampleSnapshot: WorkoutReminderSnapshot = {
  settings: {
    ...DEFAULT_SETTINGS,
    notifications: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      enabled: true,
      patternAnchorDate: '2026-04-06',
      workoutDays: 3,
      breakDays: 1,
      sendHour: 19,
      sendMinute: 0,
    },
  },
  workouts: [
    {
      id: 'push',
      name: 'Push Day',
      exercises: [],
      createdAt: new Date('2026-04-01T08:00:00.000Z'),
    },
  ],
  history: [],
};

describe('workoutReminderScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationsMock.__resetScheduledNotifications();
    jest
      .mocked(Notifications.getPermissionsAsync)
      .mockResolvedValue({ granted: true, status: 'granted' } as never);
    jest
      .mocked(TaskManager.isTaskRegisteredAsync)
      .mockResolvedValue(false as never);
    jest
      .mocked(BackgroundTask.getStatusAsync)
      .mockResolvedValue(
        BackgroundTask.BackgroundTaskStatus.Available as never,
      );
  });

  it('schedules a queue of reminders and tags them as managed', async () => {
    const identifiers = await scheduleWorkoutReminderQueueAsync(
      sampleSnapshot,
      new Date(2026, 3, 6, 9, 0),
    );

    expect(identifiers.length).toBeGreaterThan(0);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();

    const scheduledRequest = jest.mocked(
      Notifications.scheduleNotificationAsync,
    ).mock.calls[0]?.[0];

    expect(scheduledRequest.content.data).toMatchObject({
      kind: 'workout-reminder',
      workoutName: 'Push Day',
    });
  });

  it('registers the background refill task when scheduling is enabled', async () => {
    await syncWorkoutReminderQueueAsync(sampleSnapshot, {
      now: new Date(2026, 3, 6, 9, 0),
    });

    expect(BackgroundTask.registerTaskAsync).toHaveBeenCalledWith(
      WORKOUT_REMINDER_BACKGROUND_TASK,
      { minimumInterval: 720 },
    );
  });

  it('does not rebuild the queue during top-up when enough reminders remain', async () => {
    jest
      .mocked(Notifications.getAllScheduledNotificationsAsync)
      .mockResolvedValue(
        Array.from({ length: 7 }, (_, index) => ({
          identifier: `scheduled-${index}`,
          content: { data: { kind: 'workout-reminder' } },
        })) as never,
      );

    const count = await syncWorkoutReminderQueueAsync(sampleSnapshot, {
      topUpOnly: true,
      now: new Date(2026, 3, 6, 9, 0),
    });

    expect(count).toBe(7);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels managed reminders when scheduling becomes unavailable', async () => {
    jest
      .mocked(Notifications.getPermissionsAsync)
      .mockResolvedValue({ granted: false, status: 'denied' } as never);
    jest
      .mocked(TaskManager.isTaskRegisteredAsync)
      .mockResolvedValue(true as never);
    jest
      .mocked(Notifications.getAllScheduledNotificationsAsync)
      .mockResolvedValue([
        {
          identifier: 'scheduled-1',
          content: { data: { kind: 'workout-reminder' } },
        },
      ] as never);

    await syncWorkoutReminderQueueAsync(sampleSnapshot);

    expect(TaskManager.unregisterTaskAsync).toHaveBeenCalledWith(
      WORKOUT_REMINDER_BACKGROUND_TASK,
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'scheduled-1',
    );
  });

  it('cancels only managed reminder notifications', async () => {
    jest
      .mocked(Notifications.getAllScheduledNotificationsAsync)
      .mockResolvedValue([
        {
          identifier: 'managed',
          content: { data: { kind: 'workout-reminder' } },
        },
        { identifier: 'other', content: { data: { kind: 'other' } } },
      ] as never);

    await cancelManagedWorkoutRemindersAsync();

    expect(
      Notifications.cancelScheduledNotificationAsync,
    ).toHaveBeenCalledTimes(1);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'managed',
    );
  });
});
