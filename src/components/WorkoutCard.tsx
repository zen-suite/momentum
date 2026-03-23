import GripVertical from '@/components/icons/GripVertical';
import Pencil from '@/components/icons/Pencil';
import Trash2 from '@/components/icons/Trash2';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Workout } from '@/types/workout';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ACTION_WIDTH = 128;

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  drag?: () => void;
}

export function WorkoutCard({
  workout,
  onPress,
  onEdit,
  onDelete,
  drag,
}: WorkoutCardProps) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = Math.min(0, Math.max(-ACTION_WIDTH, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX < -ACTION_WIDTH / 2) {
        translateX.value = withSpring(-ACTION_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="overflow-hidden rounded-2xl">
      <View
        className="absolute bottom-0 right-0 top-0 flex-row"
        style={{ width: ACTION_WIDTH }}
      >
        <Pressable
          testID="edit-button"
          onPress={onEdit}
          className="flex-1 items-center justify-center bg-background-200"
        >
          <Pencil size={20} className="text-typography-600" />
        </Pressable>
        <Pressable
          testID="delete-button"
          onPress={onDelete}
          className="flex-1 items-center justify-center bg-error-500"
        >
          <Trash2 size={20} className="text-white" />
        </Pressable>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <Card variant="filled" className="rounded-l-2xl rounded-r-none">
            <View className="flex-row items-center gap-4">
              <Pressable
                testID="drag-handle"
                onLongPress={drag}
                delayLongPress={150}
                hitSlop={8}
              >
                <GripVertical size={20} className="text-typography-400" />
              </Pressable>
              <Pressable className="flex-1" onPress={onPress}>
                <Heading size="lg">{workout.name}</Heading>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  <View className="rounded bg-background-200 px-2 py-1">
                    <Text className="text-xs font-semibold uppercase tracking-widest">
                      {workout.exercises.length}{' '}
                      {workout.exercises.length === 1
                        ? 'exercise'
                        : 'exercises'}
                    </Text>
                  </View>
                  {workout.description ? (
                    <View className="rounded bg-background-200 px-2 py-1">
                      <Text className="text-xs font-semibold uppercase tracking-widest">
                        {workout.description}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            </View>
          </Card>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
