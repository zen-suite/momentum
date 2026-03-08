import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Workout } from '@/types/workout';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onDelete: () => void;
}

export function WorkoutCard({ workout, onPress, onDelete }: WorkoutCardProps) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Card>
      <Pressable
        className="flex-row items-center justify-between"
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          backgroundColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        })}
        onPress={onPress}
      >
        <View className="flex-1">
          <Heading size="lg">{workout.name}</Heading>
          <Text className="mt-1 text-sm opacity-70">
            {workout.exercises.length} exercise
            {workout.exercises.length !== 1 ? 's' : ''}
          </Text>
          <Text className="mt-1 text-xs opacity-50">
            {new Date(workout.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Pressable className="p-2" onPress={onDelete} testID="delete-button">
          <Ionicons name="trash-outline" size={24} color="red" />
        </Pressable>
      </Pressable>
    </Card>
  );
}
