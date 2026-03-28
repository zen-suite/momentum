import { useEffect } from 'react';

import { settingsStorage } from '@/storage';
import { DEFAULT_SETTINGS, useSettingsStore } from '@/store/settingsStore';

export function useLoadSettings() {
  const setSettings = useSettingsStore((state) => state.setSettings);

  useEffect(() => {
    settingsStorage.load().then((settings) => {
      setSettings(settings ?? DEFAULT_SETTINGS);
    });
  }, [setSettings]);
}
