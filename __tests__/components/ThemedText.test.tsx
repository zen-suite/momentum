import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';

// Provide a stable color scheme so tests don't depend on the system setting
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

describe('ThemedText', () => {
  it('renders children correctly', () => {
    render(<ThemedText>Hello World</ThemedText>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('applies the default type by default', () => {
    render(<ThemedText testID="text">Default</ThemedText>);
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.fontSize).toBe(16);
    expect(flatStyle.lineHeight).toBe(24);
  });

  it('applies the title type', () => {
    render(
      <ThemedText testID="text" type="title">
        Title
      </ThemedText>,
    );
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.fontSize).toBe(32);
    expect(flatStyle.fontWeight).toBe('bold');
  });

  it('applies the defaultSemiBold type', () => {
    render(
      <ThemedText testID="text" type="defaultSemiBold">
        Semi Bold
      </ThemedText>,
    );
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.fontWeight).toBe('600');
  });

  it('applies the subtitle type', () => {
    render(
      <ThemedText testID="text" type="subtitle">
        Subtitle
      </ThemedText>,
    );
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.fontSize).toBeDefined();
  });

  it('applies the link type', () => {
    render(
      <ThemedText testID="text" type="link">
        Link
      </ThemedText>,
    );
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.color).toBeDefined();
  });

  it('uses the light theme text color by default', () => {
    render(<ThemedText testID="text">Colored</ThemedText>);
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    // Colors.light.text
    expect(flatStyle.color).toBe('#11181C');
  });

  it('overrides color via lightColor prop', () => {
    render(
      <ThemedText testID="text" lightColor="#ff0000">
        Red Text
      </ThemedText>,
    );
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.color).toBe('#ff0000');
  });

  it('merges extra style with generated styles', () => {
    render(
      <ThemedText testID="text" style={{ letterSpacing: 2 }}>
        Spaced
      </ThemedText>,
    );
    const element = screen.getByTestId('text');
    const style = element.props.style as object[];
    const flatStyle = Object.assign({}, ...style.filter(Boolean));
    expect(flatStyle.letterSpacing).toBe(2);
  });
});
