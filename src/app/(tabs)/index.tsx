import { EmptyWorkout } from '@/components/EmptyWorkout';
import { TabScreenLayout } from '@/components/TabScreenLayout';
import { WorkoutProgressCard } from '@/components/WorkoutProgressCard';
import { WorkoutQuote } from '@/components/WorkoutQuote';
import { CircleCheck } from '@/components/icons';
import RotateCcw from '@/components/icons/RotateCcw';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkoutRoutine } from '@/hooks/useWorkoutRoutine';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Workout, WorkoutLog } from '@/types/workout';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Alert as RNAlert, View } from 'react-native';

type NavRoute = '/(tabs)/index' | '/(tabs)/workouts';

interface HomeViewProps {
  workouts: Workout[];
  workoutLogs: Record<string, WorkoutLog>;
  todayCompletedWorkoutName: string | null;
  onAddWorkout: () => void;
  onWorkoutPress: (id: string) => void;
  onWorkoutCheck: (workout: Workout) => void;
  onRestartRoutine: () => void;
  onNavigate: (route: NavRoute) => void;
}

function HomeView({
  workouts,
  workoutLogs,
  todayCompletedWorkoutName,
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
    RNAlert.alert(
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

          {todayCompletedWorkoutName ? (
            <Alert
              testID="home-completion-banner"
              action="success"
              className="mb-4"
            >
              <AlertIcon as={CircleCheck} />
              <AlertText className="flex-1 shrink text-sm font-semibold">
                {`Congratulations! You completed ${todayCompletedWorkoutName} today.`}
              </AlertText>
            </Alert>
          ) : null}

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

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function getTodayCompletedWorkoutName(
  workoutLogs: Record<string, WorkoutLog>,
): string | null {
  const todayStart = startOfDay(new Date());
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;

  let latestCompletedAt = 0;
  let latestWorkoutName: string | null = null;

  for (const log of Object.values(workoutLogs)) {
    if (!log.completedAt || !log.workout?.name) {
      continue;
    }

    const completedAt = log.completedAt.getTime();
    const isCompletedToday =
      completedAt >= todayStart && completedAt < tomorrowStart;

    if (isCompletedToday && completedAt >= latestCompletedAt) {
      latestCompletedAt = completedAt;
      latestWorkoutName = log.workout.name;
    }
  }

  return latestWorkoutName;
}

function withHome(Component: typeof HomeView) {
  return function HomeContainer() {
    const { workouts } = useWorkouts();
    const { workoutLogs, toggleWorkoutComplete, restartRoutine } =
      useWorkoutRoutine();
    const router = useRouter();

    return (
      <Component
        workouts={workouts}
        workoutLogs={workoutLogs}
        todayCompletedWorkoutName={getTodayCompletedWorkoutName(workoutLogs)}
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
