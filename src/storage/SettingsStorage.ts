import { AppSettings } from '@/types/settings-types';

export interface SettingsStorage {
  load(): Promise<AppSettings | null>;
  save(settings: AppSettings): Promise<void>;
}
