import React, { useEffect, useState } from 'react';

import { initializeStorage } from '@/storage';

export function StorageBootstrap({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    initializeStorage()
      .catch((error) => {
        console.error('[storage] Failed to initialize storage.', error);
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
