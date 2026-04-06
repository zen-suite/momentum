import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  LEGACY_STORAGE_KEY_LIST,
  LEGACY_STORAGE_KEYS,
} from '../async/legacyKeys';
import {
  parseLegacySettings,
  parseLegacyWorkoutHistory,
  parseLegacyWorkoutLogs,
  parseLegacyWorkouts,
} from '../async/legacySerialization';
import {
  StorageBackend,
  StorageInitializationOptions,
} from '../storageBackend';

import { SQLiteSettingsStorage } from './SQLiteSettingsStorage';
import { SQLiteWorkoutHistoryStorage } from './SQLiteWorkoutHistoryStorage';
import { SQLiteWorkoutLogStorage } from './SQLiteWorkoutLogStorage';
import { SQLiteWorkoutStorage } from './SQLiteWorkoutStorage';
import {
  DbClient,
  clearSqliteData,
  getDatabase,
  initializeSchema,
  insertWorkoutHistory,
  insertWorkoutLogs,
  insertWorkouts,
  runInTransaction,
  upsertSettings,
} from './sqliteStorageShared';

const LEGACY_MIGRATION_KEY = 'legacy_json_migrated_v1';

let sqliteInitialized = false;

async function hasLegacyMigrationCompleted(db: DbClient): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM migration_state WHERE key = ?;',
    LEGACY_MIGRATION_KEY,
  );

  return row?.value === '1';
}

async function migrateLegacyDataIfNeeded(
  db: DbClient,
  options?: StorageInitializationOptions,
): Promise<void> {
  if (await hasLegacyMigrationCompleted(db)) {
    return;
  }

  options?.onStatusChange?.('migrating-legacy-data');

  const keyValuePairs = await AsyncStorage.multiGet(LEGACY_STORAGE_KEY_LIST);
  const rawByKey = new Map<string, string | null>(keyValuePairs);

  const workouts = parseLegacyWorkouts(
    rawByKey.get(LEGACY_STORAGE_KEYS.workouts) ?? null,
  );
  const workoutLogs = parseLegacyWorkoutLogs(
    rawByKey.get(LEGACY_STORAGE_KEYS.workoutLogs) ?? null,
  );
  const history = parseLegacyWorkoutHistory(
    rawByKey.get(LEGACY_STORAGE_KEYS.workoutHistory) ?? null,
  );
  const settings = parseLegacySettings(
    rawByKey.get(LEGACY_STORAGE_KEYS.appSettings) ?? null,
  );

  await runInTransaction(db, async () => {
    await clearSqliteData(db, false);
    await insertWorkouts(db, workouts);
    await insertWorkoutLogs(db, workoutLogs);
    await insertWorkoutHistory(db, history);
    await upsertSettings(db, settings);

    await db.runAsync(
      'INSERT OR REPLACE INTO migration_state (key, value) VALUES (?, ?);',
      [LEGACY_MIGRATION_KEY, '1'],
    );
  });

  try {
    await AsyncStorage.multiRemove(LEGACY_STORAGE_KEY_LIST);
  } catch (error) {
    console.error(
      '[storage] SQLite migration succeeded but legacy key cleanup failed.',
      error,
    );
  }
}

export function createSQLiteStorageBackend(): StorageBackend {
  return {
    name: 'sqlite',
    workoutStorage: new SQLiteWorkoutStorage(),
    workoutLogStorage: new SQLiteWorkoutLogStorage(),
    workoutHistoryStorage: new SQLiteWorkoutHistoryStorage(),
    settingsStorage: new SQLiteSettingsStorage(),
    async initialize(options?: StorageInitializationOptions) {
      if (sqliteInitialized) {
        return;
      }

      const db = await getDatabase();
      await initializeSchema(db);
      await migrateLegacyDataIfNeeded(db, options);
      sqliteInitialized = true;
    },
    async clearAll() {
      const db = await getDatabase();
      await initializeSchema(db);
      await runInTransaction(db, async () => {
        await clearSqliteData(db, true);
      });
    },
  };
}
