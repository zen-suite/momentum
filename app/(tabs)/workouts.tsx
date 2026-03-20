import { ThemedView } from '@/components/ThemedView';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Dumbbell } from '@/components/icons';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Workout } from '@/types/workout';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutsScreen() {
  const { workouts, addWorkout, deleteWorkout } = useWorkouts();
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

  const handleDeleteWorkout = (id: string, name: string) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(id),
        },
      ],
    );
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <WorkoutCard
      workout={item}
      onPress={() => router.push(`/workout/${item.id}`)}
      onDelete={() => handleDeleteWorkout(item.id, item.name)}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ThemedView className="flex-1 px-4">
        <View className="mb-5 mt-4 flex-row items-center justify-between">
          <Heading size="2xl">My Workouts</Heading>
          <Button
            className="h-10 w-10 rounded-full p-0"
            onPress={() => setShowNewWorkoutInput(true)}
          >
            <ButtonIcon as={Plus} />
          </Button>
        </View>

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

        {workouts.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3">
            <Text className="text-red">
              <Dumbbell size={64} className="text-primary" />
            </Text>
            <Heading size="md">No workouts yet</Heading>
            <Text className="text-center text-sm opacity-70">
              Tap the + button to create your first workout
            </Text>
          </View>
        ) : (
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              gap: 12,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
