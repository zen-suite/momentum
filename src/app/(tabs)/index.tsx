import { EmptyWorkout } from '@/components/EmptyWorkout';
import { SideDrawer } from '@/components/SideDrawer';
import { ThemedView } from '@/components/ThemedView';
import { WorkoutProgressCard } from '@/components/WorkoutProgressCard';
import Menu from '@/components/icons/Menu';
import Plus from '@/components/icons/Plus';
import RotateCcw from '@/components/icons/RotateCcw';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkoutLogs } from '@/hooks/useWorkoutLogs';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Workout, WorkoutLog } from '@/types/workout';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavRoute = '/(tabs)/index' | '/(tabs)/workouts';

interface HomeViewProps {
  workouts: Workout[];
  workoutLogs: Record<string, WorkoutLog>;
  drawerOpen: boolean;
  onAddWorkout: () => void;
  onWorkoutPress: (id: string) => void;
  onWorkoutCheck: (workout: Workout) => void;
  onRestartRoutine: () => void;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
  onNavigate: (route: NavRoute) => void;
}

function HomeView({
  workouts,
  workoutLogs,
  drawerOpen,
  onAddWorkout,
  onWorkoutPress,
  onWorkoutCheck,
  onRestartRoutine,
  onOpenDrawer,
  onCloseDrawer,
  onNavigate,
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
    <SafeAreaView className="flex-1 bg-background-0">
      <ThemedView className="flex-1 px-4">
        {/* Header */}
        <View className="mb-4 flex-row items-center py-4">
          <Pressable
            testID="hamburger-button"
            onPress={onOpenDrawer}
            hitSlop={8}
          >
            <Menu size={24} className="text-primary" />
          </Pressable>
          <Text
            className="absolute left-0 right-0 text-center text-xl font-bold tracking-widest"
            pointerEvents="none"
          >
            KINETIC
          </Text>
          {hasWorkouts && (
            <Pressable
              testID="header-add-button"
              onPress={onAddWorkout}
              hitSlop={8}
              className="ml-auto"
            >
              <Plus size={24} className="text-primary" />
            </Pressable>
          )}
        </View>

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
            />
          </>
        )}
      </ThemedView>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={onCloseDrawer}
        onNavigate={onNavigate}
      />
    </SafeAreaView>
  );
}

function withHome(Component: typeof HomeView) {
  return function HomeContainer() {
    const { workouts } = useWorkouts();
    const { workoutLogs, toggleWorkoutComplete, restartRoutine } =
      useWorkoutLogs();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
      <Component
        workouts={workouts}
        workoutLogs={workoutLogs}
        drawerOpen={drawerOpen}
        onAddWorkout={() => router.navigate('/(tabs)/workouts')}
        onWorkoutPress={(id) => router.push(`/workout-log/${id}`)}
        onWorkoutCheck={(workout) => toggleWorkoutComplete(workout)}
        onRestartRoutine={restartRoutine}
        onOpenDrawer={() => setDrawerOpen(true)}
        onCloseDrawer={() => setDrawerOpen(false)}
        onNavigate={(route) => router.navigate(route as never)}
      />
    );
  };
}

export default withHome(HomeView);
