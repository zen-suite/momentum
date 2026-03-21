import { ThemedView } from '@/components/ThemedView';
import { WorkoutCard } from '@/components/WorkoutCard';
import { WorkoutQuote } from '@/components/WorkoutQuote';
import Menu from '@/components/icons/Menu';
import Plus from '@/components/icons/Plus';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Workout } from '@/types/workout';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutsScreen() {
  const { workouts, addWorkout } = useWorkouts();
  const router = useRouter();
  const [showNewWorkoutInput, setShowNewWorkoutInput] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');

  const handleCreateWorkout = () => {
    if (newWorkoutName.trim()) {
      const workout = addWorkout(newWorkoutName.trim());
      setNewWorkoutName('');
      setShowNewWorkoutInput(false);
      router.push(`/workout/${workout.id}`);
    }
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <WorkoutCard
      workout={item}
      onPress={() => router.push(`/workout/${item.id}`)}
      onEdit={() => router.push(`/workout/${item.id}`)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ThemedView className="flex-1 px-4">
        {/* Header */}
        <View className="mb-4 flex-row items-center py-4">
          <Pressable hitSlop={8}>
            <Menu size={24} className="text-primary" />
          </Pressable>
          <Text
            className="absolute left-0 right-0 text-center text-xl font-bold tracking-widest"
            pointerEvents="none"
          >
            KINETIC
          </Text>
          <Pressable
            onPress={() => setShowNewWorkoutInput(true)}
            hitSlop={8}
            className="ml-auto"
          >
            <Plus size={24} className="text-primary" />
          </Pressable>
        </View>

        {/* Title section */}
        <View className="mb-6">
          <Heading size="2xl" className="font-bold">
            Manage Routines
          </Heading>
          <Text className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-50">
            Your Performance Blueprint
          </Text>
        </View>

        {/* Add workout button */}
        <Button
          className="mb-6 h-fit flex-row items-center justify-center gap-3 rounded-2xl py-4"
          onPress={() => setShowNewWorkoutInput(true)}
        >
          <Plus size={24} className="text-typography-0" />
          <Text className="text-sm font-bold uppercase tracking-widest text-typography-0">
            Add Workout
          </Text>
        </Button>

        {/* Inline create form */}
        {showNewWorkoutInput && (
          <Card className="mb-5 p-4">
            <Input className="mb-3">
              <InputField
                placeholder="Workout name"
                value={newWorkoutName}
                onChangeText={setNewWorkoutName}
                autoFocus
                onSubmitEditing={handleCreateWorkout}
              />
            </Input>
            <View className="flex-row gap-3">
              <Button
                className="flex-1"
                variant="outline"
                onPress={() => {
                  setShowNewWorkoutInput(false);
                  setNewWorkoutName('');
                }}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button className="flex-1" onPress={handleCreateWorkout}>
                <ButtonText>Create</ButtonText>
              </Button>
            </View>
          </Card>
        )}

        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="mt-8 items-center">
              <Text className="text-center text-sm opacity-50">
                No routines yet. Add your first workout above.
              </Text>
            </View>
          }
          ListFooterComponent={
            workouts.length > 0 ? (
              <Card
                className="mt-6 items-center rounded-2xl p-6"
                variant="filled"
              >
                <WorkoutQuote />
              </Card>
            ) : null
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}
