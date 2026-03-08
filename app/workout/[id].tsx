import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
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
    deleteExercise,
    addSetToExercise,
    updateSet,
    deleteSet,
  } = useWorkouts();

  const workout = getWorkoutById(id!);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  const colorScheme = useColorScheme() ?? 'light';
  const textColor = colorScheme === 'dark' ? '#ECEDEE' : '#11181C';

  if (!workout) {
    return (
      <ThemedView className="flex-1">
        <ThemedText>Workout not found</ThemedText>
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

  const handleAddSet = (exerciseId: string) => {
    addSetToExercise(workout.id, exerciseId);
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    deleteSet(workout.id, exerciseId, setId);
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string,
  ) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (value !== '' && (isNaN(numValue!) || numValue! < 0)) {
      return;
    }
    updateSet(workout.id, exerciseId, setId, {
      [field]: field === 'reps' ? numValue || 0 : numValue,
    });
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
        <ThemedText type="subtitle">{exercise.name}</ThemedText>
        <Pressable
          onPress={() => handleDeleteExercise(exercise.id, exercise.name)}
        >
          <Ionicons name="trash-outline" size={20} color="red" />
        </Pressable>
      </View>

      {exercise.sets.length === 0 ? (
        <ThemedText className="mb-3 opacity-60">No sets yet</ThemedText>
      ) : (
        <View className="mb-3">
          <View className="mb-2 flex-row px-1">
            <ThemedText className="flex-1 text-center text-xs font-semibold opacity-70">
              Set
            </ThemedText>
            <ThemedText className="flex-1 text-center text-xs font-semibold opacity-70">
              Reps
            </ThemedText>
            <ThemedText className="flex-1 text-center text-xs font-semibold opacity-70">
              Weight (kg)
            </ThemedText>
            <View className="w-6" />
          </View>
          {exercise.sets.map((set, index) => (
            <View key={set.id} className="mb-2 flex-row items-center gap-2">
              <ThemedText
                className="text-center font-semibold"
                style={{ flex: 0.5 }}
              >
                {index + 1}
              </ThemedText>
              <TextInput
                className="flex-1 rounded border p-2 text-center text-[#11181C] dark:text-[#ECEDEE]"
                style={{ borderColor: PRIMARY_COLOR }}
                value={set.reps?.toString() || ''}
                onChangeText={(value) =>
                  handleUpdateSet(exercise.id, set.id, 'reps', value)
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={textColor + '60'}
              />
              <TextInput
                className="flex-1 rounded border p-2 text-center text-[#11181C] dark:text-[#ECEDEE]"
                style={{ borderColor: PRIMARY_COLOR }}
                value={set.weight?.toString() || ''}
                onChangeText={(value) =>
                  handleUpdateSet(exercise.id, set.id, 'weight', value)
                }
                keyboardType="numeric"
                placeholder="Optional"
                placeholderTextColor={textColor + '60'}
              />
              <Pressable
                className="w-6 items-center"
                onPress={() => handleDeleteSet(exercise.id, set.id)}
              >
                <Ionicons name="close-circle" size={20} color="red" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Pressable
        className="flex-row items-center justify-center gap-1.5 rounded-lg border p-3"
        style={{ borderColor: PRIMARY_COLOR }}
        onPress={() => handleAddSet(exercise.id)}
      >
        <Ionicons name="add" size={20} color={PRIMARY_COLOR} />
        <ThemedText style={{ color: PRIMARY_COLOR }}>Add Set</ThemedText>
      </Pressable>
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
            <ThemedText type="title">{workout.name}</ThemedText>
            <ThemedText className="mt-1 text-xs opacity-60">
              Created: {new Date(workout.createdAt).toLocaleDateString()}
            </ThemedText>
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
                  <ThemedText>Cancel</ThemedText>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-lg p-3"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                  onPress={handleAddExercise}
                >
                  <ThemedText style={{ color: 'white', fontWeight: '600' }}>
                    Add
                  </ThemedText>
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
            <ThemedText
              style={{ color: 'white', fontWeight: '600', fontSize: 16 }}
            >
              Add Exercise
            </ThemedText>
          </Pressable>

          {workout.exercises.length === 0 ? (
            <View className="mt-10 items-center gap-3">
              <Ionicons
                name="fitness-outline"
                size={64}
                color={textColor + '40'}
              />
              <ThemedText className="text-lg font-semibold">
                No exercises yet
              </ThemedText>
              <ThemedText className="text-center text-sm opacity-70">
                Add your first exercise to get started
              </ThemedText>
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
