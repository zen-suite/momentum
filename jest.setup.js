import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => undefined),
    runAsync: jest.fn(async () => ({ changes: 0, lastInsertRowId: 0 })),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
  })),
}));

jest.mock('expo-notifications', () => {
  let scheduledRequests = [];

  return {
    __resetScheduledNotifications() {
      scheduledRequests = [];
    },
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(async () => null),
    getPermissionsAsync: jest.fn(async () => ({
      granted: true,
      status: 'granted',
    })),
    requestPermissionsAsync: jest.fn(async () => ({
      granted: true,
      status: 'granted',
    })),
    getAllScheduledNotificationsAsync: jest.fn(async () => scheduledRequests),
    scheduleNotificationAsync: jest.fn(async ({ content, trigger }) => {
      const identifier = `scheduled-${scheduledRequests.length + 1}`;
      scheduledRequests = [
        ...scheduledRequests,
        { identifier, content, trigger },
      ];
      return identifier;
    }),
    cancelScheduledNotificationAsync: jest.fn(async (identifier) => {
      scheduledRequests = scheduledRequests.filter(
        (request) => request.identifier !== identifier,
      );
    }),
    SchedulableTriggerInputTypes: {
      DATE: 'date',
    },
    AndroidImportance: {
      HIGH: 6,
    },
  };
});

jest.mock('expo-background-task', () => ({
  getStatusAsync: jest.fn(async () => 2),
  registerTaskAsync: jest.fn(async () => undefined),
  BackgroundTaskStatus: {
    Available: 2,
    Restricted: 1,
  },
  BackgroundTaskResult: {
    Success: 1,
    Failed: 2,
  },
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(async () => false),
  unregisterTaskAsync: jest.fn(async () => undefined),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
