import { Dumbbell, Plus } from '@/components/icons';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Workout, WorkoutLog } from '@/types/workout';
import { useRouter } from 'expo-router';
import { ChevronRight, Square, SquareCheck } from 'lucide-react-native';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HomeViewProps {
  workouts: Workout[];
  workoutLogs: Record<string, WorkoutLog>;
  onAddWorkout: () => void;
  onWorkoutPress: (id: string) => void;
  onWorkoutCheck: (workout: Workout) => void;
  onRestartRoutine: () => void;
}

function HomeView({
  workouts,
  workoutLogs,
  onAddWorkout,
  onWorkoutPress,
  onWorkoutCheck,
  onRestartRoutine,
}: HomeViewProps) {
  const hasWorkouts = workouts.length > 0;
  const hasAnyProgress = Object.values(workoutLogs).some(
    (log) => log.completedAt || log.exercises.some((e) => !!e.completedAt),
  );

  const handleRestartRoutine = () => {
    Alert.alert(
      'Reset Workout Logs',
      'Are you sure you want to reset all workout logs?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => onRestartRoutine(),
        },
      ],
    );
  };

  const renderFooter = () => (
    <Pressable
      testID="restart-button"
      className="mt-1 items-center rounded-lg bg-primary py-3 disabled:opacity-20"
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      onPress={handleRestartRoutine}
      disabled={!hasAnyProgress}
    >
      <Text className="font-semibold text-secondary-0">Reset</Text>
    </Pressable>
  );

  const renderWorkoutItem = ({ item }: { item: Workout }) => {
    const log = workoutLogs[item.id];
    const isCompleted = !!log?.completedAt;

    return (
      <Pressable
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        onPress={() => onWorkoutPress(item.id)}
      >
        <Card className="flex-row items-center rounded-xl p-4">
          <Pressable
            testID={`checkbox-${item.id}`}
            onPress={() => onWorkoutCheck(item)}
            className="mr-3 text-primary"
            hitSlop={8}
          >
            {isCompleted ? <SquareCheck size={26} /> : <Square size={26} />}
          </Pressable>
          <View className="flex-1 gap-1">
            <Heading
              size="lg"
              className={isCompleted ? 'line-through opacity-50' : ''}
            >
              {item.name}
            </Heading>
            <Text className="text-[13px] opacity-60">
              {item.exercises.length} exercise
              {item.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <ChevronRight size={20} color="#9BA1A6" />
        </Card>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0 py-4">
      <ThemedView className="flex-1 px-4">
        <View className="mb-5 flex-row items-center justify-between">
          <Heading size="2xl">
            {hasWorkouts ? 'My Workouts' : 'Get Started'}
          </Heading>
          <View className="flex-row items-center gap-2">
            {hasWorkouts && (
              <Pressable
                testID="header-add-button"
                className="h-10 w-10 items-center justify-center rounded-full bg-primary"
                onPress={onAddWorkout}
              >
                <Plus size={24} />
              </Pressable>
            )}
          </View>
        </View>

        {!hasWorkouts ? (
          <View className="flex-1 items-center justify-center gap-3">
            <Dumbbell size={72} className="text-primary" />
            <Heading size="lg" className="mt-2">
              No workouts yet
            </Heading>
            <Text className="text-center text-sm opacity-50">
              Create your first workout to get started
            </Text>
            <Pressable
              className="mt-2 flex-row items-center gap-2 rounded-xl bg-primary px-6 py-3.5"
              onPress={onAddWorkout}
            >
              <Plus size={20} />
              <Text className="font-semibold text-secondary-0">
                Add Workout
              </Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

function withHome(Component: typeof HomeView) {
  return function HomeContainer() {
    const { workouts } = useWorkouts();
    const { workoutLogs, toggleWorkoutComplete, restartRoutine } =
      useWorkoutLogs();
    const router = useRouter();

    return (
      <Component
        workouts={workouts}
        workoutLogs={workoutLogs}
        onAddWorkout={() => router.navigate('/(tabs)/workouts')}
        onWorkoutPress={(id) => router.push(`/workout-log/${id}`)}
        onWorkoutCheck={(workout) => toggleWorkoutComplete(workout)}
        onRestartRoutine={restartRoutine}
      />
    );
  };
}

export default withHome(HomeView);
