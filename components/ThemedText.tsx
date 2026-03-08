import { Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const typeClassNames: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-base leading-6',
  defaultSemiBold: 'text-base leading-6 font-semibold',
  title: 'text-[32px] font-bold leading-8',
  subtitle: 'text-xl font-bold',
  link: 'text-base leading-[30px] text-[#0a7ea4]',
};

export function ThemedText({
  className = '',
  style,
  lightColor: _lightColor,
  darkColor: _darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      className={`text-[#11181C] dark:text-[#ECEDEE] ${typeClassNames[type]} ${className}`}
      style={style}
      {...rest}
    />
  );
}
