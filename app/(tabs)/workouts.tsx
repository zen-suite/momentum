import { ThemedView } from '@/components/ThemedView';
import { WorkoutCard } from '@/components/WorkoutCard';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkouts } from '@/contexts/WorkoutContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Workout } from '@/types/workout';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Input, InputField } from '@/components/ui/input';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutsScreen() {
  const { workouts, addWorkout, deleteWorkout } = useWorkouts();
  const router = useRouter();
  const [showNewWorkoutInput, setShowNewWorkoutInput] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');

  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

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
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1 px-4">
        <View className="mb-5 mt-4 flex-row items-center justify-between">
          <Heading size="2xl">My Workouts</Heading>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor }}
            onPress={() => setShowNewWorkoutInput(true)}
          >
            <Ionicons name="add" size={24} color={backgroundColor} />
          </Pressable>
        </View>

        {showNewWorkoutInput && (
          <View
            className="mb-5 rounded-xl border-2 p-4"
            style={{ borderColor: primaryColor }}
          >
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
              <Pressable
                className="flex-1 items-center rounded-lg border p-3"
                style={{ borderColor: primaryColor }}
                onPress={() => {
                  setShowNewWorkoutInput(false);
                  setNewWorkoutName('');
                }}
              >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-lg p-3"
                style={{ backgroundColor: primaryColor }}
                onPress={handleCreateWorkout}
              >
                <Text style={{ color: backgroundColor, fontWeight: '600' }}>
                  Create
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {workouts.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3">
            <Ionicons
              name="barbell-outline"
              size={64}
              color={textColor + '40'}
            />
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
