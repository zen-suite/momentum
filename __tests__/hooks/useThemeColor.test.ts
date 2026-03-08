import { renderHook } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/useThemeColor';

const mockUseColorScheme = jest.fn();

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('returns the light theme color when scheme is light', () => {
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.light.text);
  });

  it('returns the dark theme color when scheme is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.dark.text);
  });

  it('returns the lightColor prop override when scheme is light', () => {
    const { result } = renderHook(() =>
      useThemeColor({ light: '#aabbcc' }, 'text'),
    );
    expect(result.current).toBe('#aabbcc');
  });

  it('returns the darkColor prop override when scheme is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ dark: '#ddeeff' }, 'text'),
    );
    expect(result.current).toBe('#ddeeff');
  });

  it('falls back to theme color when lightColor prop is not provided but darkColor is (light scheme)', () => {
    const { result } = renderHook(() =>
      useThemeColor({ dark: '#ddeeff' }, 'background'),
    );
    // light scheme → no lightColor prop → use Colors.light.background
    expect(result.current).toBe(Colors.light.background);
  });

  it('falls back to theme color when darkColor prop is not provided but lightColor is (dark scheme)', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#aabbcc' }, 'background'),
    );
    // dark scheme → no darkColor prop → use Colors.dark.background
    expect(result.current).toBe(Colors.dark.background);
  });

  it('defaults to light when useColorScheme returns null/undefined', () => {
    mockUseColorScheme.mockReturnValue(null);
    const { result } = renderHook(() => useThemeColor({}, 'tint'));
    expect(result.current).toBe(Colors.light.tint);
  });

  it('works for all color keys in light mode', () => {
    const colorKeys = Object.keys(
      Colors.light,
    ) as (keyof typeof Colors.light)[];
    colorKeys.forEach((key) => {
      const { result } = renderHook(() => useThemeColor({}, key));
      expect(result.current).toBe(Colors.light[key]);
    });
  });

  it('works for all color keys in dark mode', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const colorKeys = Object.keys(Colors.dark) as (keyof typeof Colors.dark)[];
    colorKeys.forEach((key) => {
      const { result } = renderHook(() => useThemeColor({}, key));
      expect(result.current).toBe(Colors.dark[key]);
    });
  });
});
