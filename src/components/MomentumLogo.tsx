import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Polyline,
  Stop,
} from 'react-native-svg';

interface MomentumLogoProps {
  size?: number;
}

export function MomentumLogo({ size = 32 }: MomentumLogoProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const strokeStart = isDark ? '#C8C8D8' : '#2A2A35';
  const strokeMid = isDark ? '#FFFFFF' : '#07070A';
  const strokeEnd = isDark ? '#E0E0EC' : '#1A1A20';
  const dotFill = isDark ? '#FFFFFF' : '#07070A';
  const dotCenter = isDark ? '#07070A' : '#FFFFFF';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 1024 1024">
        <Defs>
          <LinearGradient
            id="markSheen"
            x1="0.18"
            y1="1"
            x2="0.82"
            y2="0"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0%" stopColor={strokeStart} />
            <Stop offset="48%" stopColor={strokeMid} />
            <Stop offset="100%" stopColor={strokeEnd} />
          </LinearGradient>
        </Defs>
        <Polyline
          points="204,790 512,234 820,790"
          fill="none"
          stroke="url(#markSheen)"
          strokeWidth={112}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={512} cy={234} r={44} fill={dotFill} />
        <Circle cx={512} cy={234} r={20} fill={dotCenter} />
      </Svg>
    </View>
  );
}
