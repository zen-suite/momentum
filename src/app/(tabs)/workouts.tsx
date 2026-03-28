import { CreateWorkoutForm } from '@/components/CreateWorkoutForm';
import { TabScreenLayout } from '@/components/TabScreenLayout';
import { WorkoutCard } from '@/components/WorkoutCard';
import Plus from '@/components/icons/Plus';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Workout } from '@/types/workout';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';

export default function WorkoutsScreen() {
  const { workouts, addWorkout, deleteWorkout, reorderWorkouts } =
    useWorkouts();
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

  const handleCancelCreate = () => {
    setShowNewWorkoutInput(false);
    setNewWorkoutName('');
  };

  const handleDeleteWorkout = (item: Workout) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(item.id),
        },
      ],
    );
  };

  const renderWorkoutItem = ({ item, drag }: RenderItemParams<Workout>) => (
    <ScaleDecorator>
      <WorkoutCard
        className="mb-4 overflow-hidden rounded-2xl"
        workout={item}
        onPress={() => router.push(`/workout/${item.id}`)}
        onEdit={() => router.push(`/workout/${item.id}`)}
        onDelete={() => handleDeleteWorkout(item)}
        drag={drag}
      />
    </ScaleDecorator>
  );

  return (
    <TabScreenLayout>
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
        <CreateWorkoutForm
          value={newWorkoutName}
          onChangeText={setNewWorkoutName}
          onSubmit={handleCreateWorkout}
          onCancel={handleCancelCreate}
        />
      )}

      <DraggableFlatList
        data={workouts}
        renderItem={renderWorkoutItem}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => reorderWorkouts(data)}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="mt-8 items-center">
            <Text className="text-center text-sm opacity-50">
              No routines yet. Add your first workout above.
            </Text>
          </View>
        }
      />
    </TabScreenLayout>
  );
}
