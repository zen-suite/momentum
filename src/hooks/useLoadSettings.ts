import { useEffect } from 'react';

import { settingsStorage } from '@/storage';
import { useSettingsStore } from '@/store/settingsStore';
import { DEFAULT_SETTINGS, normalizeSettings } from '@/utils/settings';

export function useLoadSettings() {
  const setSettings = useSettingsStore((state) => state.setSettings);

  useEffect(() => {
    settingsStorage.load().then((settings) => {
      setSettings(settings ? normalizeSettings(settings) : DEFAULT_SETTINGS);
    });
  }, [setSettings]);
}
