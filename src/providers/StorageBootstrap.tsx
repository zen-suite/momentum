import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { initializeStorage } from '@/storage';
import LoaderCircle from '@/components/icons/LoaderCircle';
import { ThemedView } from '@/components/ThemedView';
import { Text } from '@/components/ui/text';

type BootstrapStatus = 'initializing-storage' | 'migrating-legacy-data';

export function StorageBootstrap({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<BootstrapStatus>('initializing-storage');

  useEffect(() => {
    let isMounted = true;
    initializeStorage({
      onStatusChange(nextStatus) {
        if (isMounted) {
          setStatus(nextStatus);
        }
      },
    })
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
    const loadingLabel =
      status === 'migrating-legacy-data'
        ? 'Migrating data...'
        : 'Initializing storage...';

    return (
      <ThemedView className="flex-1">
        <View className="flex-1 items-center justify-center px-8">
          <LoaderCircle size={28} className="text-typography-900" />
          <Text className="mt-4 text-base font-semibold text-typography-900">
            {loadingLabel}
          </Text>
          <Text className="mt-2 text-center text-sm text-typography-500">
            Please wait while we prepare your workout data.
          </Text>
        </View>
      </ThemedView>
    );
  }

  return <>{children}</>;
}
