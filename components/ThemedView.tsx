import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  className = '',
  style,
  lightColor: _lightColor,
  darkColor: _darkColor,
  ...rest
}: ThemedViewProps) {
  return (
    <View
      className={`bg-[#fff] dark:bg-[#151718] ${className}`}
      style={style}
      {...rest}
    />
  );
}
