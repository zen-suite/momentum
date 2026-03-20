import CheckSquare from '@/components/icons/CheckSquare';
import Square from '@/components/icons/Square';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Workout, WorkoutLog } from '@/types/workout';
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
      <Card className="rounded-2xl p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            testID={`workout-checkbox-${workout.id}`}
            onPress={onCheck}
            hitSlop={8}
          >
            {isCompleted ? (
              <CheckSquare size={26} className="text-primary" />
            ) : (
              <Square size={26} className="text-primary" />
            )}
          </Pressable>
          <View className="flex-1">
            <Heading size="lg">{workout.name}</Heading>
            {workout.description ? (
              <Text testID="workout-description" className="text-sm opacity-60 mt-0.5">
                {workout.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold tracking-widest opacity-50">
              PROGRESS
            </Text>
            <Text className="text-xs opacity-60">
              {completedExercises} of {totalExercises} exercises completed
            </Text>
          </View>
          <View className="h-1 rounded-full bg-background-100 overflow-hidden">
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
