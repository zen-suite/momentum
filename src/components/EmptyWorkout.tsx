import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import React from 'react';
import { Pressable, View } from 'react-native';

interface EmptyWorkoutProps {
  onCreateWorkout: () => void;
}

export function EmptyWorkout({ onCreateWorkout }: EmptyWorkoutProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Heading
        size="2xl"
        className="mb-4 text-center font-black tracking-widest"
      >
        START YOUR JOURNEY
      </Heading>
      <Text className="mb-8 text-center text-base leading-relaxed opacity-70">
        The heavy lifting starts with the first entry. Define your routine and
        let the kinetic energy take over.
      </Text>
      <Pressable
        testID="create-first-workout-button"
        onPress={onCreateWorkout}
        className="w-full rounded-2xl bg-primary px-6 py-5"
      >
        <Text className="text-center text-sm font-bold tracking-widest text-secondary-0">
          CREATE YOUR FIRST WORKOUT
        </Text>
      </Pressable>
    </View>
  );
}
