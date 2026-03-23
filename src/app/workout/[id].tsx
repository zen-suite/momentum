import { Dumbbell, Plus, Trash2 } from '@/components/icons';
import { ThemedView } from '@/components/ThemedView';
import { WorkoutStats } from '@/components/WorkoutStats';
import { Button } from '@/components/ui/button';
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
    <Card key={exercise.id} variant="filled" className="rounded-2xl p-5">
      {/* Exercise name row */}
      <View className="mb-5 flex-row items-start justify-between">
        {editingExerciseId === exercise.id ? (
          <Input className="mr-3 flex-1" variant="underlined">
            <InputField
              value={editingExerciseName}
              onChangeText={setEditingExerciseName}
              autoFocus
              style={{ fontSize: 18, fontWeight: '600' }}
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
          hitSlop={8}
          className="mt-0.5"
        >
          <Trash2 size={20} className="text-error-600" />
        </Pressable>
      </View>

      {/* Metrics — 3 columns: Sets | Reps | Weight(KG) */}
      <View className="flex-row">
        {/* Sets */}
        <View className="flex-1 items-center">
          <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
            Sets
          </Text>
          <Input variant="underlined" className="w-full">
            <InputField
              value={exercise.numberOfSets?.toString()}
              onChangeText={(value: string) =>
                handleUpdateExerciseField(exercise.id, 'numberOfSets', value)
              }
              keyboardType="numeric"
              placeholder="0"
              style={{ fontSize: 36, fontWeight: '800', textAlign: 'center' }}
            />
          </Input>
        </View>

        {/* Reps */}
        <View className="flex-1 items-center">
          <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
            Reps
          </Text>
          <Input variant="underlined" className="w-full">
            <InputField
              value={exercise.reps.toString()}
              onChangeText={(value: string) =>
                handleUpdateExerciseField(exercise.id, 'reps', value)
              }
              keyboardType="numeric"
              placeholder="0"
              style={{ fontSize: 36, fontWeight: '800', textAlign: 'center' }}
            />
          </Input>
        </View>

        {/* Weight (KG) */}
        <View className="flex-1 items-center">
          <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
            KG
          </Text>
          <Input variant="underlined" className="w-full">
            <InputField
              value={
                weightInputs[exercise.id] ?? exercise.weight?.toString() ?? ''
              }
              onChangeText={(value: string) => {
                if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
                setWeightInputs((prev) => ({
                  ...prev,
                  [exercise.id]: value,
                }));
                handleUpdateExerciseField(exercise.id, 'weight', value);
              }}
              keyboardType="decimal-pad"
              placeholder="—"
              style={{ fontSize: 36, fontWeight: '800', textAlign: 'center' }}
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
          title: '',
          headerBackTitle: 'Back',
        }}
      />
      <ThemedView className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Workout name — Headline-LG editorial */}
          <View className="mb-8">
            {editingWorkoutName ? (
              <Input variant="underlined">
                <InputField
                  value={workoutNameInput}
                  onChangeText={setWorkoutNameInput}
                  autoFocus
                  style={{ fontSize: 30, fontWeight: '800' }}
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
                <Heading size="3xl" className="font-extrabold">
                  {workout.name}
                </Heading>
                <Text className="mt-1 text-xs font-bold uppercase tracking-widest opacity-50">
                  {workout.exercises.length}{' '}
                  {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Add exercise CTA */}
          <Button
            className="mb-8 h-fit flex-row items-center justify-center gap-3 rounded-2xl py-4"
            onPress={() => setShowAddExercise(true)}
          >
            <Plus size={24} className="text-typography-0" />
            <Text className="text-sm font-bold uppercase tracking-widest text-typography-0">
              Add Exercise
            </Text>
          </Button>

          {/* Inline add exercise form */}
          {showAddExercise && (
            <Card variant="filled" className="mb-8 rounded-2xl p-5">
              <Text className="mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
                Exercise Name
              </Text>
              <Input variant="underlined" className="mb-6">
                <InputField
                  placeholder="e.g. Bench Press"
                  value={newExerciseName}
                  onChangeText={setNewExerciseName}
                  autoFocus
                  style={{ fontSize: 20, fontWeight: '600' }}
                  onSubmitEditing={handleAddExercise}
                />
              </Input>
              <View className="flex-row gap-3">
                <Pressable
                  className="flex-1 items-center py-3"
                  onPress={() => {
                    setShowAddExercise(false);
                    setNewExerciseName('');
                  }}
                >
                  <Text className="text-sm font-bold uppercase tracking-widest opacity-50">
                    Cancel
                  </Text>
                </Pressable>
                <Button
                  className="flex-1 rounded-xl"
                  size="lg"
                  onPress={handleAddExercise}
                >
                  <Text className="text-sm font-bold uppercase tracking-widest text-typography-0">
                    Add
                  </Text>
                </Button>
              </View>
            </Card>
          )}

          {/* Exercise list */}
          {workout.exercises.length === 0 ? (
            <View className="mt-12 items-center gap-4">
              <Dumbbell size={56} color={textColor + '1A'} />
              <Heading
                size="md"
                className="font-bold uppercase tracking-widest"
              >
                No exercises yet
              </Heading>
              <Text className="text-center text-xs font-semibold uppercase tracking-widest opacity-40">
                Add your first exercise above
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {workout.exercises.map(renderExercise)}
              <WorkoutStats exercises={workout.exercises} />
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}
