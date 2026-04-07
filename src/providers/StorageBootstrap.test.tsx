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

describe('StorageBootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render children while storage is bootstrapping', async () => {
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

    expect(screen.queryByText('App Ready')).toBeNull();

    act(() => {
      resolveInitialization?.();
    });

    await waitFor(() => {
      expect(screen.getByText('App Ready')).toBeTruthy();
    });
  });

  it('renders children even when storage initialization fails', async () => {
    mockInitializeStorage.mockRejectedValueOnce(
      new Error('Initialization failed'),
    );

    render(
      <StorageBootstrap>
        <Text>App Ready</Text>
      </StorageBootstrap>,
    );

    await waitFor(() => {
      expect(screen.getByText('App Ready')).toBeTruthy();
    });
  });
});
