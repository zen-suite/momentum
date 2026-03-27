import { useEffect } from 'react';

import { settingsStorage } from '@/storage';
import { useSettingsStore } from '@/store/settingsStore';

export function usePersistSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const isLoaded = useSettingsStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) return;
    settingsStorage.save(settings);
  }, [settings, isLoaded]);
}
