import React from 'react';

import { useLoadSettings } from '@/hooks/useLoadSettings';
import { usePersistSettings } from '@/hooks/usePersistSettings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  useLoadSettings();
  usePersistSettings();

  return <>{children}</>;
}
