import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWorkouts } from '@/contexts/workout-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, TextInput, View } from 'react-native';
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

  const renderWorkoutItem = ({ item }: { item: any }) => (
    <Pressable
      className="flex-row items-center justify-between rounded-xl p-4"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      })}
      onPress={() => router.push(`/workout/${item.id}`)}
    >
      <View className="flex-1">
        <ThemedText type="subtitle">{item.name}</ThemedText>
        <ThemedText className="mt-1 text-sm opacity-70">
          {item.exercises.length} exercise
          {item.exercises.length !== 1 ? 's' : ''}
        </ThemedText>
        <ThemedText className="mt-1 text-xs opacity-50">
          {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <Pressable
        className="p-2"
        onPress={() => handleDeleteWorkout(item.id, item.name)}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ThemedView className="flex-1 px-4">
        <View className="mb-5 mt-4 flex-row items-center justify-between">
          <ThemedText type="title">My Workouts</ThemedText>
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
            <TextInput
              className="mb-3 rounded-lg border p-3 text-base"
              style={{ borderColor: primaryColor }}
              placeholder="Workout name"
              placeholderTextColor={textColor + '80'}
              value={newWorkoutName}
              onChangeText={setNewWorkoutName}
              autoFocus
              onSubmitEditing={handleCreateWorkout}
            />
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-lg border p-3"
                style={{ borderColor: primaryColor }}
                onPress={() => {
                  setShowNewWorkoutInput(false);
                  setNewWorkoutName('');
                }}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-lg p-3"
                style={{ backgroundColor: primaryColor }}
                onPress={handleCreateWorkout}
              >
                <ThemedText style={{ color: backgroundColor, fontWeight: '600' }}>
                  Create
                </ThemedText>
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
            <ThemedText className="text-lg font-semibold">
              No workouts yet
            </ThemedText>
            <ThemedText className="text-center text-sm opacity-70">
              Tap the + button to create your first workout
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
