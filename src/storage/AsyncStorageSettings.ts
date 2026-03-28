import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppSettings } from '@/types/settings-types';

import { SettingsStorage } from './SettingsStorage';

export class AsyncStorageSettings implements SettingsStorage {
  private readonly key = 'app_settings';

  async load(): Promise<AppSettings | null> {
    const raw = await AsyncStorage.getItem(this.key);
    if (!raw) return null;
    return JSON.parse(raw) as AppSettings;
  }

  async save(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(this.key, JSON.stringify(settings));
  }
}
