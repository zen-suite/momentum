/* eslint-disable @typescript-eslint/no-require-imports */

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

const mockLegacySpies = createStorageSpies();
const mockSqliteSpies = createStorageSpies();

function mockMakeBackend(
  name: StorageBackend['name'],
  spies: ReturnType<typeof createStorageSpies>,
): StorageBackend {
  return {
    name,
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

jest.mock('./async/createLegacyStorageBackend', () => ({
  createLegacyStorageBackend: () =>
    mockMakeBackend('legacy-json', mockLegacySpies),
}));

jest.mock('./sqlite/createSQLiteStorageBackend', () => ({
  createSQLiteStorageBackend: () => mockMakeBackend('sqlite', mockSqliteSpies),
}));

describe('storage backend selection', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    mockLegacySpies.initialize.mockResolvedValue(undefined);
    mockSqliteSpies.initialize.mockResolvedValue(undefined);
    mockLegacySpies.clearAll.mockResolvedValue(undefined);
    mockSqliteSpies.clearAll.mockResolvedValue(undefined);

    mockLegacySpies.workoutLoad.mockResolvedValue([]);
    mockSqliteSpies.workoutLoad.mockResolvedValue([]);
    mockLegacySpies.workoutLogLoad.mockResolvedValue({});
    mockSqliteSpies.workoutLogLoad.mockResolvedValue({});
    mockLegacySpies.historyLoad.mockResolvedValue([]);
    mockSqliteSpies.historyLoad.mockResolvedValue([]);
    mockLegacySpies.settingsLoad.mockResolvedValue(null);
    mockSqliteSpies.settingsLoad.mockResolvedValue(null);

    mockLegacySpies.workoutSave.mockResolvedValue(undefined);
    mockSqliteSpies.workoutSave.mockResolvedValue(undefined);
    mockLegacySpies.workoutLogSave.mockResolvedValue(undefined);
    mockSqliteSpies.workoutLogSave.mockResolvedValue(undefined);
    mockLegacySpies.historySave.mockResolvedValue(undefined);
    mockSqliteSpies.historySave.mockResolvedValue(undefined);
    mockLegacySpies.settingsSave.mockResolvedValue(undefined);
    mockSqliteSpies.settingsSave.mockResolvedValue(undefined);
  });

  it('uses sqlite backend when sqlite initialization succeeds', async () => {
    const storage = require('./index') as typeof import('./index');

    await storage.initializeStorage();
    await storage.workoutStorage.load();

    expect(storage.getActiveStorageBackendName()).toBe('sqlite');
    expect(mockSqliteSpies.initialize).toHaveBeenCalledTimes(1);
    expect(mockSqliteSpies.workoutLoad).toHaveBeenCalledTimes(1);
    expect(mockLegacySpies.workoutLoad).not.toHaveBeenCalled();
  });

  it('falls back to legacy backend when sqlite initialization fails', async () => {
    mockSqliteSpies.initialize.mockRejectedValueOnce(
      new Error('sqlite failed'),
    );
    const storage = require('./index') as typeof import('./index');

    await storage.initializeStorage();
    await storage.workoutStorage.load();

    expect(storage.getActiveStorageBackendName()).toBe('legacy-json');
    expect(mockLegacySpies.initialize).toHaveBeenCalledTimes(1);
    expect(mockLegacySpies.workoutLoad).toHaveBeenCalledTimes(1);
    expect(mockSqliteSpies.workoutLoad).not.toHaveBeenCalled();
  });

  it('emits initialization status updates while bootstrapping storage', async () => {
    mockSqliteSpies.initialize.mockImplementation(async (options) => {
      options?.onStatusChange?.('migrating-legacy-data');
    });
    const storage = require('./index') as typeof import('./index');
    const statuses: string[] = [];

    await storage.initializeStorage({
      onStatusChange(status) {
        statuses.push(status);
      },
    });

    expect(statuses).toEqual(['initializing-storage', 'migrating-legacy-data']);
  });

  it('clears both backends', async () => {
    const storage = require('./index') as typeof import('./index');

    await storage.clearAllStorage();

    expect(mockLegacySpies.clearAll).toHaveBeenCalledTimes(1);
    expect(mockSqliteSpies.clearAll).toHaveBeenCalledTimes(1);
  });
});
