import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  className = '',
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? (darkColor ?? '#151718') : (lightColor ?? '#fff');

  return (
    <View
      className={className}
      style={[{ backgroundColor }, style]}
      {...rest}
    />
  );
}
