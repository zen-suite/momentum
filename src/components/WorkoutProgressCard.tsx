import CheckIcon from '@/components/icons/CheckIcon';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Workout, WorkoutLog } from '@/types/workout';
import { cn } from '@/utils/styles';
import React from 'react';
import { Pressable, View } from 'react-native';

interface WorkoutProgressCardProps {
  workout: Workout;
  log: WorkoutLog | undefined;
  onPress: () => void;
  onCheck: () => void;
}

export function WorkoutProgressCard({
  workout,
  log,
  onPress,
  onCheck,
}: WorkoutProgressCardProps) {
  const totalExercises = workout.exercises.length;
  const completedExercises = log
    ? log.exercises.filter((e) => !!e.completedAt).length
    : 0;
  const isCompleted = !!log?.completedAt;
  const progress = totalExercises > 0 ? completedExercises / totalExercises : 0;

  return (
    <Pressable
      testID={`workout-card-${workout.id}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      onPress={onPress}
    >
      <Card className="gap-3 rounded-2xl p-4">
        <View className="flex-row items-center gap-3">
          <Pressable
            testID={`workout-checkbox-${workout.id}`}
            onPress={onCheck}
            hitSlop={8}
            className={cn(
              'h-7 w-7 items-center justify-center rounded-md',
              isCompleted
                ? 'bg-primary text-secondary'
                : 'border-2 border-primary',
            )}
          >
            {isCompleted ? (
              <CheckIcon size={16} className="text-secondary" />
            ) : null}
          </Pressable>
          <View className="flex-1">
            <Heading size="lg">{workout.name}</Heading>
            {workout.description ? (
              <Text
                testID="workout-description"
                className="mt-0.5 text-sm opacity-60"
              >
                {workout.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold tracking-widest">PROGRESS</Text>
            <Text className="text-xs">
              {completedExercises} of {totalExercises} exercises completed
            </Text>
          </View>
          <View className="h-1 overflow-hidden rounded-full bg-background-100">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
