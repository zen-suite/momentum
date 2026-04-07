import Animated from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

export function HelloWave() {
  return (
    <Animated.Text
      className="mt-[-6px] text-[28px] leading-8"
      style={styles.wave}
    >
      👋
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  wave: {
    animationName: {
      '50%': { transform: [{ rotate: '25deg' }] },
    },
    animationIterationCount: 4,
    animationDuration: '300ms',
  },
});
