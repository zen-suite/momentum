import { StorageBackend } from '../storageBackend';

import { SQLiteSettingsStorage } from './SQLiteSettingsStorage';
import { SQLiteWorkoutHistoryStorage } from './SQLiteWorkoutHistoryStorage';
import { SQLiteWorkoutLogStorage } from './SQLiteWorkoutLogStorage';
import { SQLiteWorkoutStorage } from './SQLiteWorkoutStorage';
import {
  clearSqliteData,
  getDatabase,
  initializeSchema,
  runInTransaction,
} from './sqliteStorageShared';

let sqliteInitialized = false;

export function createSQLiteStorageBackend(): StorageBackend {
  return {
    name: 'sqlite',
    workoutStorage: new SQLiteWorkoutStorage(),
    workoutLogStorage: new SQLiteWorkoutLogStorage(),
    workoutHistoryStorage: new SQLiteWorkoutHistoryStorage(),
    settingsStorage: new SQLiteSettingsStorage(),
    async initialize() {
      if (sqliteInitialized) {
        return;
      }

      const db = await getDatabase();
      await initializeSchema(db);
      sqliteInitialized = true;
    },
    async clearAll() {
      const db = await getDatabase();
      await initializeSchema(db);
      await runInTransaction(db, async () => {
        await clearSqliteData(db);
      });
    },
  };
}
