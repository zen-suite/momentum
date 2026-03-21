import { ChevronRight, Code, Dumbbell, Home, Send } from '@/components/icons';
import { OpaqueColorValue, type StyleProp, type ViewStyle } from 'react-native';

const MAPPING = {
  'house.fill': Home,
  'figure.strengthtraining.traditional': Dumbbell,
  'paperplane.fill': Send,
  'chevron.left.forwardslash.chevron.right': Code,
  'chevron.right': ChevronRight,
};

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  const Icon = MAPPING[name];
  return <Icon size={size} color={color as string} style={style} />;
}
