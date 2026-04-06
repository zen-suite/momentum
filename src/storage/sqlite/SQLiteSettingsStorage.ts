import { SettingsStorage } from '../SettingsStorage';

import { AppSettings } from '@/types/settings-types';

import {
  SettingsRow,
  getDatabase,
  runSerializedWrite,
  upsertSettings,
} from './sqliteStorageShared';

export class SQLiteSettingsStorage implements SettingsStorage {
  async load(): Promise<AppSettings | null> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<SettingsRow>(
      `SELECT
        theme,
        exercise_defaults_reps,
        exercise_defaults_sets,
        exercise_defaults_weight
      FROM app_settings
      WHERE id = 1;`,
    );

    if (!row) {
      return null;
    }

    return {
      theme: row.theme,
      exerciseDefaults: {
        reps: row.exercise_defaults_reps,
        sets: row.exercise_defaults_sets,
        weight: row.exercise_defaults_weight ?? undefined,
      },
    };
  }

  async save(settings: AppSettings): Promise<void> {
    const db = await getDatabase();
    await runSerializedWrite(() => upsertSettings(db, settings));
  }
}
