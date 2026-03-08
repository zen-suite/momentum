import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { ThemedView } from '@/components/ThemedView';

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

describe('ThemedView', () => {
  it('renders children', () => {
    render(<ThemedView>{/* children rendered inside */}</ThemedView>);
    // Component renders without errors
  });

  it('applies the light background color by default', () => {
    render(<ThemedView testID="view" />);
    const element = screen.getByTestId('view');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    // Colors.light.background
    expect(flatStyle.backgroundColor).toBe('#fff');
  });

  it('overrides background color via lightColor prop', () => {
    render(<ThemedView testID="view" lightColor="#123456" />);
    const element = screen.getByTestId('view');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.backgroundColor).toBe('#123456');
  });

  it('merges extra style with the generated background style', () => {
    render(<ThemedView testID="view" style={{ padding: 16 }} />);
    const element = screen.getByTestId('view');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.padding).toBe(16);
  });

  it('applies the dark background color when scheme is dark', () => {
    jest.resetModules();
    jest.mock('@/hooks/useColorScheme', () => ({
      useColorScheme: () => 'dark',
    }));
    // Re-import after remocking so the new mock takes effect
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ThemedView: ThemedViewDark } = require('@/components/ThemedView');
    render(<ThemedViewDark testID="view" />);
    const element = screen.getByTestId('view');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    // Colors.dark.background
    expect(flatStyle.backgroundColor).toBe('#151718');
  });
});
