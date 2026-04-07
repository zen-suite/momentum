import { createSQLiteStorageBackend } from './sqlite/createSQLiteStorageBackend';
import { SettingsStorage } from './SettingsStorage';
import {
  StorageInitializationOptions,
  StorageInitializationStatus,
} from './storageBackend';
import { WorkoutHistoryStorage } from './WorkoutHistoryStorage';
import { WorkoutLogStorage } from './WorkoutLogStorage';
import { WorkoutStorage } from './WorkoutStorage';

const sqliteBackend = createSQLiteStorageBackend();

let initializePromise: Promise<void> | null = null;
let isInitialized = false;
let currentStatus: StorageInitializationStatus = 'initializing-storage';
const statusListeners = new Set<
  NonNullable<StorageInitializationOptions['onStatusChange']>
>();

async function withStorageBackend<T>(work: () => Promise<T>): Promise<T> {
  await initializeStorage();
  return work();
}

function notifyStatus(status: StorageInitializationStatus) {
  currentStatus = status;
  for (const onStatusChange of statusListeners) {
    onStatusChange(status);
  }
}

export type { WorkoutStorage as IWorkoutStorage };
export type { WorkoutLogStorage as IWorkoutLogStorage };
export type { WorkoutHistoryStorage as IWorkoutHistoryStorage };
export type { SettingsStorage as ISettingsStorage };

export async function initializeStorage(
  options?: StorageInitializationOptions,
): Promise<void> {
  const onStatusChange = options?.onStatusChange;

  if (onStatusChange && !isInitialized) {
    statusListeners.add(onStatusChange);
    if (initializePromise) {
      onStatusChange(currentStatus);
    }
  }

  if (initializePromise) {
    return initializePromise.finally(() => {
      if (onStatusChange) {
        statusListeners.delete(onStatusChange);
      }
    });
  }

  initializePromise = (async () => {
    try {
      notifyStatus('initializing-storage');
      await sqliteBackend.initialize();
    } finally {
      isInitialized = true;
      statusListeners.clear();
    }
  })();

  return initializePromise.finally(() => {
    if (onStatusChange) {
      statusListeners.delete(onStatusChange);
    }
  });
}

export function getActiveStorageBackendName(): 'sqlite' {
  return sqliteBackend.name;
}

export async function clearAllStorage(): Promise<void> {
  await sqliteBackend.clearAll();
}

export const workoutStorage: WorkoutStorage = {
  load() {
    return withStorageBackend(() => sqliteBackend.workoutStorage.load());
  },
  save(workouts) {
    return withStorageBackend(() =>
      sqliteBackend.workoutStorage.save(workouts),
    );
  },
};

export const workoutLogStorage: WorkoutLogStorage = {
  load() {
    return withStorageBackend(() => sqliteBackend.workoutLogStorage.load());
  },
  save(logs) {
    return withStorageBackend(() => sqliteBackend.workoutLogStorage.save(logs));
  },
};

export const workoutHistoryStorage: WorkoutHistoryStorage = {
  load() {
    return withStorageBackend(() => sqliteBackend.workoutHistoryStorage.load());
  },
  save(logs) {
    return withStorageBackend(() =>
      sqliteBackend.workoutHistoryStorage.save(logs),
    );
  },
};

export const settingsStorage: SettingsStorage = {
  load() {
    return withStorageBackend(() => sqliteBackend.settingsStorage.load());
  },
  save(settings) {
    return withStorageBackend(() =>
      sqliteBackend.settingsStorage.save(settings),
    );
  },
};
