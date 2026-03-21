import { Dumbbell, Plus, Trash2 } from '@/components/icons';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Exercise } from '@/types/workout';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getWorkoutById,
    addExerciseToWorkout,
    updateExercise,
    updateWorkout,
    deleteExercise,
  } = useWorkouts();
  const workout = getWorkoutById(id!);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editingWorkoutName, setEditingWorkoutName] = useState(false);
  const [workoutNameInput, setWorkoutNameInput] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null,
  );
  const [editingExerciseName, setEditingExerciseName] = useState('');
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});

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
    const numValue =
      value === ''
        ? undefined
        : field === 'weight'
          ? parseFloat(value)
          : parseInt(value, 10);
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
    <Card
      key={exercise.id}
      className="rounded-xl bg-[#fff] p-4 dark:bg-[#151718]"
    >
      <View className="mb-3 flex-row items-center justify-between">
        {editingExerciseId === exercise.id ? (
          <Input className="mr-3 flex-1" variant="underlined">
            <InputField
              value={editingExerciseName}
              onChangeText={setEditingExerciseName}
              autoFocus
              onBlur={() => {
                if (editingExerciseName.trim()) {
                  updateExercise(workout.id, exercise.id, {
                    name: editingExerciseName.trim(),
                  });
                }
                setEditingExerciseId(null);
              }}
              onSubmitEditing={() => {
                if (editingExerciseName.trim()) {
                  updateExercise(workout.id, exercise.id, {
                    name: editingExerciseName.trim(),
                  });
                }
                setEditingExerciseId(null);
              }}
            />
          </Input>
        ) : (
          <Pressable
            onPress={() => {
              setEditingExerciseId(exercise.id);
              setEditingExerciseName(exercise.name);
            }}
            className="mr-3 flex-1"
          >
            <Heading size="lg">{exercise.name}</Heading>
          </Pressable>
        )}
        <Pressable
          onPress={() => handleDeleteExercise(exercise.id, exercise.name)}
        >
          <Trash2 size={20} color="red" />
        </Pressable>
      </View>

      <View className="mb-3 gap-3">
        <View className="flex-row items-center gap-3">
          <Text className="w-24 text-sm font-semibold opacity-70">Sets</Text>
          <Input className="flex-1">
            <InputField
              value={exercise.numberOfSets?.toString()}
              onChangeText={(value: string) =>
                handleUpdateExerciseField(exercise.id, 'numberOfSets', value)
              }
              keyboardType="numeric"
              placeholder="1"
            />
          </Input>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="w-24 text-sm font-semibold opacity-70">Reps</Text>
          <Input className="flex-1">
            <InputField
              value={exercise.reps.toString()}
              onChangeText={(value: string) =>
                handleUpdateExerciseField(exercise.id, 'reps', value)
              }
              keyboardType="numeric"
              placeholder="0"
            />
          </Input>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="w-24 text-sm font-semibold opacity-70">
            Weight (kg)
          </Text>
          <Input className="flex-1">
            <InputField
              value={weightInputs[exercise.id] ?? exercise.weight?.toString() ?? ''}
              onChangeText={(value: string) => {
                if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
                setWeightInputs((prev) => ({ ...prev, [exercise.id]: value }));
                handleUpdateExerciseField(exercise.id, 'weight', value);
              }}
              keyboardType="decimal-pad"
              placeholder="Optional"
            />
          </Input>
        </View>
      </View>
    </Card>
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
            {editingWorkoutName ? (
              <Input variant="underlined">
                <InputField
                  value={workoutNameInput}
                  onChangeText={setWorkoutNameInput}
                  autoFocus
                  style={{ fontSize: 24, fontWeight: 'bold' }}
                  onBlur={() => {
                    if (workoutNameInput.trim()) {
                      updateWorkout(workout.id, {
                        name: workoutNameInput.trim(),
                      });
                    }
                    setEditingWorkoutName(false);
                  }}
                  onSubmitEditing={() => {
                    if (workoutNameInput.trim()) {
                      updateWorkout(workout.id, {
                        name: workoutNameInput.trim(),
                      });
                    }
                    setEditingWorkoutName(false);
                  }}
                />
              </Input>
            ) : (
              <Pressable
                onPress={() => {
                  setWorkoutNameInput(workout.name);
                  setEditingWorkoutName(true);
                }}
              >
                <Heading size="2xl">{workout.name}</Heading>
              </Pressable>
            )}
            <Text className="mt-1 text-xs opacity-60">
              Created: {new Date(workout.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {showAddExercise && (
            <Card className="mb-5">
              <Input className="mb-3">
                <InputField
                  placeholder="Exercise name (e.g., Bench Press)"
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  autoFocus
                  onSubmitEditing={handleAddExercise}
                />
              </Input>
              <View className="flex-row gap-3">
                <Pressable
                  className="flex-1 items-center rounded-lg border border-primary p-3"
                  onPress={() => {
                    setShowAddExercise(false);
                    setNewExerciseName('');
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-lg bg-primary p-3"
                  onPress={handleAddExercise}
                >
                  <Text onPrimary>Add</Text>
                </Pressable>
              </View>
            </Card>
          )}

          <Pressable
            className="mb-5 flex-row items-center justify-center gap-2 rounded-xl bg-primary p-4"
            onPress={() => setShowAddExercise(true)}
          >
            <Plus size={20} />
            <Text onPrimary>Add Exercise</Text>
          </Pressable>

          {workout.exercises.length === 0 ? (
            <View className="mt-10 items-center gap-3">
              <Dumbbell size={64} color={textColor + '40'} />
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
