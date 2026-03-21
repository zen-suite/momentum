import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Workout } from '@/types/workout';
import GripVertical from '@/components/icons/GripVertical';
import Pencil from '@/components/icons/Pencil';
import { Pressable, View } from 'react-native';

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onEdit: () => void;
}

export function WorkoutCard({ workout, onPress, onEdit }: WorkoutCardProps) {
  return (
    <Card variant="filled" className="rounded-2xl">
      <Pressable className="flex-row items-center gap-4" onPress={onPress}>
        <GripVertical size={20} className="text-typography-400" />
        <View className="flex-1">
          <Heading size="lg">{workout.name}</Heading>
          <View className="mt-2 flex-row flex-wrap gap-2">
            <View className="rounded bg-background-200 px-2 py-1">
              <Text className="text-xs font-semibold uppercase tracking-widest">
                {workout.exercises.length}{' '}
                {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
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
        </View>
        <Pressable testID="edit-button" onPress={onEdit} hitSlop={8}>
          <Pencil size={18} className="text-typography-400" />
        </Pressable>
      </Pressable>
    </Card>
  );
}
