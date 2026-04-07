import { AnimatedProgressBar } from '@/components/AnimatedProgressBar';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Exercise, ExerciseLog } from '@/types/workout';
import { getWorkoutCompletionSummary } from '@/utils/workoutCompletion';
import { View } from 'react-native';

interface WorkoutCompletionProgressProps {
  exercises: Exercise[];
  exerciseLogs?: ExerciseLog[];
  testID?: string;
}

export function WorkoutCompletionProgress({
  exercises,
  exerciseLogs,
  testID,
}: WorkoutCompletionProgressProps) {
  const { completionRate, totalSets } = getWorkoutCompletionSummary(
    exercises,
    exerciseLogs,
  );

  if (totalSets === 0) {
    return null;
  }

  return (
    <Card
      testID={testID}
      variant="filled"
      className="mb-6 rounded-2xl px-4 py-4"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-widest opacity-50">
          Completion
        </Text>
        <View className="flex-row items-baseline gap-0.5">
          <Text className="text-base font-black">{completionRate}</Text>
          <Text className="text-sm font-bold uppercase tracking-widest opacity-50">
            %
          </Text>
        </View>
      </View>
      <AnimatedProgressBar
        progress={completionRate / 100}
        fillClassName="bg-typography-950"
      />
    </Card>
  );
}
