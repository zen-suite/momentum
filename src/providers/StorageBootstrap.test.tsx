import { act, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { StorageBootstrap } from './StorageBootstrap';

const mockInitializeStorage = jest.fn();

jest.mock('@/storage', () => ({
  initializeStorage: (...args: unknown[]) => mockInitializeStorage(...args),
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

type BootstrapStatus = 'initializing-storage' | 'migrating-legacy-data';

describe('StorageBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows an initializing message while storage is bootstrapping', async () => {
    let resolveInitialization: (() => void) | null = null;
    mockInitializeStorage.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveInitialization = resolve;
        }),
    );

    render(
      <StorageBootstrap>
        <Text>App Ready</Text>
      </StorageBootstrap>,
    );

    expect(screen.getByText('Initializing storage...')).toBeTruthy();

    act(() => {
      resolveInitialization?.();
    });

    await waitFor(() => {
      expect(screen.getByText('App Ready')).toBeTruthy();
    });
  });

  it('updates loading status to migration while data migration runs', async () => {
    let resolveInitialization: (() => void) | null = null;
    let onStatusChange: ((status: BootstrapStatus) => void) | undefined;

    mockInitializeStorage.mockImplementation(
      (options?: { onStatusChange?: (status: BootstrapStatus) => void }) => {
        onStatusChange = options?.onStatusChange;
        return new Promise<void>((resolve) => {
          resolveInitialization = resolve;
        });
      },
    );

    render(
      <StorageBootstrap>
        <Text>App Ready</Text>
      </StorageBootstrap>,
    );

    act(() => {
      onStatusChange?.('migrating-legacy-data');
    });

    expect(screen.getByText('Migrating data...')).toBeTruthy();

    act(() => {
      resolveInitialization?.();
    });

    await waitFor(() => {
      expect(screen.getByText('App Ready')).toBeTruthy();
    });
  });
});
