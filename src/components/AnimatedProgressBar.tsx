import { cn } from '@/utils/styles';
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

interface AnimatedProgressBarProps {
  fillClassName?: string;
  progress: number;
  testID?: string;
  trackClassName?: string;
}

export function AnimatedProgressBar({
  fillClassName,
  progress,
  testID,
  trackClassName,
}: AnimatedProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const animatedProgress = useRef(new Animated.Value(clampedProgress)).current;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      animatedProgress.setValue(clampedProgress);
      return;
    }

    const animation = Animated.timing(animatedProgress, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
      toValue: clampedProgress,
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedProgress, clampedProgress]);

  const width = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      className={cn(
        'h-2 overflow-hidden rounded-full bg-background-100',
        trackClassName,
      )}
    >
      <Animated.View
        testID={testID}
        className={cn('h-full rounded-full bg-primary', fillClassName)}
        style={{ width }}
      />
    </View>
  );
}
