import { ThemedView } from '@/components/ThemedView';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Exercise } from '@/types/workout';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

const PRIMARY_COLOR = '#0a7ea4';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getWorkoutById,
    addExerciseToWorkout,
    updateExercise,
    deleteExercise,
  } = useWorkouts();

  const workout = getWorkoutById(id!);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  const colorScheme = useColorScheme() ?? 'light';
  const textColor = colorScheme === 'dark' ? '#ECEDEE' : '#11181C';

  if (!workout) {
    return (
      <ThemedView className="flex-1">
        <Text>Workout not found</Text>
      </ThemedView>
    );
  }

  const handleAddExercise = () => {
    if (newExerciseName.trim()) {
      addExerciseToWorkout(workout.id, newExerciseName.trim());
      setNewExerciseName('');
      setShowAddExercise(false);
    }
  };

  const handleDeleteExercise = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete "${exerciseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExercise(workout.id, exerciseId),
        },
      ],
    );
  };

  const handleUpdateExerciseField = (
    exerciseId: string,
    field: 'reps' | 'weight' | 'numberOfSets',
    value: string,
  ) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (value !== '' && (isNaN(numValue!) || numValue! < 0)) {
      return;
    }
    if (field === 'weight') {
      updateExercise(workout.id, exerciseId, { weight: numValue });
    } else {
      updateExercise(workout.id, exerciseId, { [field]: numValue ?? 0 });
    }
  };

  const renderExercise = (exercise: Exercise) => (
    <View
      key={exercise.id}
      className="rounded-xl bg-[#fff] p-4 dark:bg-[#151718]"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Heading size="lg">{exercise.name}</Heading>
        <Pressable
          onPress={() => handleDeleteExercise(exercise.id, exercise.name)}
        >
          <Ionicons name="trash-outline" size={20} color="red" />
        </Pressable>
      </View>

      <View className="mb-3 gap-3">
        <View className="flex-row items-center gap-3">
          <Text className="w-24 text-sm font-semibold opacity-70">Sets</Text>
          <TextInput
            className="flex-1 rounded border p-2 text-center text-[#11181C] dark:text-[#ECEDEE]"
            style={{ borderColor: PRIMARY_COLOR }}
            value={exercise.numberOfSets?.toString()}
            onChangeText={(value) =>
              handleUpdateExerciseField(exercise.id, 'numberOfSets', value)
            }
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor={textColor + '60'}
          />
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="w-24 text-sm font-semibold opacity-70">Reps</Text>
          <TextInput
            className="flex-1 rounded border p-2 text-center text-[#11181C] dark:text-[#ECEDEE]"
            style={{ borderColor: PRIMARY_COLOR }}
            value={exercise.reps.toString()}
            onChangeText={(value) =>
              handleUpdateExerciseField(exercise.id, 'reps', value)
            }
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={textColor + '60'}
          />
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="w-24 text-sm font-semibold opacity-70">
            Weight (kg)
          </Text>
          <TextInput
            className="flex-1 rounded border p-2 text-center text-[#11181C] dark:text-[#ECEDEE]"
            style={{ borderColor: PRIMARY_COLOR }}
            value={exercise.weight?.toString() ?? ''}
            onChangeText={(value) =>
              handleUpdateExerciseField(exercise.id, 'weight', value)
            }
            keyboardType="numeric"
            placeholder="Optional"
            placeholderTextColor={textColor + '60'}
          />
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: workout.name,
          headerBackTitle: 'Back',
        }}
      />
      <ThemedView className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-5">
            <Heading size="2xl">{workout.name}</Heading>
            <Text className="mt-1 text-xs opacity-60">
              Created: {new Date(workout.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {showAddExercise && (
            <View
              className="mb-4 rounded-xl border-2 p-4"
              style={{ borderColor: PRIMARY_COLOR }}
            >
              <TextInput
                className="mb-3 rounded-lg border p-3 text-base text-[#11181C] dark:text-[#ECEDEE]"
                style={{ borderColor: PRIMARY_COLOR }}
                placeholder="Exercise name (e.g., Bench Press)"
                placeholderTextColor={textColor + '80'}
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                autoFocus
                onSubmitEditing={handleAddExercise}
              />
              <View className="flex-row gap-3">
                <Pressable
                  className="flex-1 items-center rounded-lg border p-3"
                  style={{ borderColor: PRIMARY_COLOR }}
                  onPress={() => {
                    setShowAddExercise(false);
                    setNewExerciseName('');
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-lg p-3"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  onPress={handleAddExercise}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>Add</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Pressable
            className="mb-5 flex-row items-center justify-center gap-2 rounded-xl p-4"
            style={{ backgroundColor: PRIMARY_COLOR }}
            onPress={() => setShowAddExercise(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              Add Exercise
            </Text>
          </Pressable>

          {workout.exercises.length === 0 ? (
            <View className="mt-10 items-center gap-3">
              <Ionicons
                name="fitness-outline"
                size={64}
                color={textColor + '40'}
              />
              <Heading size="md">No exercises yet</Heading>
              <Text className="text-center text-sm opacity-70">
                Add your first exercise to get started
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {workout.exercises.map(renderExercise)}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}
