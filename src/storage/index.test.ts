import { AppSettings } from '@/types/settings-types';
import { Workout, WorkoutLog } from '@/types/workout';

import { StorageBackend, StorageInitializationOptions } from './storageBackend';

const createStorageSpies = () => ({
  workoutLoad: jest.fn<Promise<Workout[]>, []>(),
  workoutSave: jest.fn<Promise<void>, [Workout[]]>(),
  workoutLogLoad: jest.fn<Promise<Record<string, WorkoutLog>>, []>(),
  workoutLogSave: jest.fn<Promise<void>, [Record<string, WorkoutLog>]>(),
  historyLoad: jest.fn<Promise<WorkoutLog[]>, []>(),
  historySave: jest.fn<Promise<void>, [WorkoutLog[]]>(),
  settingsLoad: jest.fn<Promise<AppSettings | null>, []>(),
  settingsSave: jest.fn<Promise<void>, [AppSettings]>(),
  initialize: jest.fn<Promise<void>, [StorageInitializationOptions?]>(),
  clearAll: jest.fn<Promise<void>, []>(),
});

const mockSqliteSpies = createStorageSpies();

function mockMakeBackend(
  spies: ReturnType<typeof createStorageSpies>,
): StorageBackend {
  return {
    name: 'sqlite',
    workoutStorage: {
      load: spies.workoutLoad,
      save: spies.workoutSave,
    },
    workoutLogStorage: {
      load: spies.workoutLogLoad,
      save: spies.workoutLogSave,
    },
    workoutHistoryStorage: {
      load: spies.historyLoad,
      save: spies.historySave,
    },
    settingsStorage: {
      load: spies.settingsLoad,
      save: spies.settingsSave,
    },
    initialize: spies.initialize,
    clearAll: spies.clearAll,
  };
}

jest.mock('./sqlite/createSQLiteStorageBackend', () => ({
  createSQLiteStorageBackend: () => mockMakeBackend(mockSqliteSpies),
}));

describe('storage backend initialization', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    mockSqliteSpies.initialize.mockResolvedValue(undefined);
    mockSqliteSpies.clearAll.mockResolvedValue(undefined);

    mockSqliteSpies.workoutLoad.mockResolvedValue([]);
    mockSqliteSpies.workoutLogLoad.mockResolvedValue({});
    mockSqliteSpies.historyLoad.mockResolvedValue([]);
    mockSqliteSpies.settingsLoad.mockResolvedValue(null);

    mockSqliteSpies.workoutSave.mockResolvedValue(undefined);
    mockSqliteSpies.workoutLogSave.mockResolvedValue(undefined);
    mockSqliteSpies.historySave.mockResolvedValue(undefined);
    mockSqliteSpies.settingsSave.mockResolvedValue(undefined);
  });

  it('uses sqlite backend when initialization succeeds', async () => {
    const storage = require('./index') as typeof import('./index');

    await storage.initializeStorage();
    await storage.workoutStorage.load();

    expect(storage.getActiveStorageBackendName()).toBe('sqlite');
    expect(mockSqliteSpies.initialize).toHaveBeenCalledTimes(1);
    expect(mockSqliteSpies.workoutLoad).toHaveBeenCalledTimes(1);
  });

  it('throws when sqlite initialization fails', async () => {
    mockSqliteSpies.initialize.mockRejectedValueOnce(
      new Error('sqlite failed'),
    );
    const storage = require('./index') as typeof import('./index');

    await expect(storage.initializeStorage()).rejects.toThrow('sqlite failed');
  });

  it('emits initialization status updates while bootstrapping storage', async () => {
    const storage = require('./index') as typeof import('./index');
    const statuses: string[] = [];

    await storage.initializeStorage({
      onStatusChange(status) {
        statuses.push(status);
      },
    });

    expect(statuses).toEqual(['initializing-storage']);
  });

  it('clears sqlite backend', async () => {
    const storage = require('./index') as typeof import('./index');

    await storage.clearAllStorage();

    expect(mockSqliteSpies.clearAll).toHaveBeenCalledTimes(1);
  });
});
