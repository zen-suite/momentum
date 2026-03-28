import { EmptyWorkout } from '@/components/EmptyWorkout';
import { TabScreenLayout } from '@/components/TabScreenLayout';
import { WorkoutProgressCard } from '@/components/WorkoutProgressCard';
import { WorkoutQuote } from '@/components/WorkoutQuote';
import RotateCcw from '@/components/icons/RotateCcw';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Workout, WorkoutLog } from '@/types/workout';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';

type NavRoute = '/(tabs)/index' | '/(tabs)/workouts';

interface HomeViewProps {
  workouts: Workout[];
  workoutLogs: Record<string, WorkoutLog>;
  onAddWorkout: () => void;
  onWorkoutPress: (id: string) => void;
  onWorkoutCheck: (workout: Workout) => void;
  onRestartRoutine: () => void;
  onNavigate: (route: NavRoute) => void;
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
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onRestartRoutine },
      ],
    );
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <WorkoutProgressCard
      workout={item}
      log={workoutLogs[item.id]}
      onPress={() => onWorkoutPress(item.id)}
      onCheck={() => onWorkoutCheck(item)}
    />
  );

  return (
    <TabScreenLayout>
      {!hasWorkouts ? (
        <EmptyWorkout onCreateWorkout={onAddWorkout} />
      ) : (
        <>
          <View className="mb-4">
            <View className="flex-row items-center justify-between">
              <Heading size="2xl">Routine</Heading>
              {hasAnyProgress && (
                <Pressable
                  testID="restart-button"
                  className="flex-row items-center gap-1"
                  onPress={handleRestartRoutine}
                >
                  <RotateCcw size={14} className="text-red-500" />
                  <Text className="text-sm font-semibold text-red-500">
                    Restart Routine
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <Card
                className="mt-6 items-center rounded-2xl p-6"
                variant="filled"
              >
                <WorkoutQuote />
              </Card>
            }
          />
        </>
      )}
    </TabScreenLayout>
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
        onNavigate={(route) => router.navigate(route as never)}
      />
    );
  };
}

export default withHome(HomeView);
