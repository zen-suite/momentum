import React from 'react';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useSettings } from '@/hooks/useSettings';

export function GluestackProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  return (
    <GluestackUIProvider mode={settings.theme}>{children}</GluestackUIProvider>
  );
}
