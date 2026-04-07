import { Circle, CircleCheck, Dumbbell } from '@/components/icons';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast';
import { WorkoutCompletionProgress } from '@/components/WorkoutCompletionProgress';
import { WorkoutQuote } from '@/components/WorkoutQuote';
import { WorkoutStats } from '@/components/WorkoutStats';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWorkoutRoutine } from '@/hooks/useWorkoutRoutine';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Exercise, ExerciseLog, Workout, WorkoutLog } from '@/types/workout';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

interface WorkoutLogViewProps {
  workout: Workout;
  log: WorkoutLog | undefined;
  onCompleteExercise: (workout: Workout, exerciseId: string) => void;
  onCompleteSet: (
    workout: Workout,
    exerciseId: string,
    setIndex: number,
  ) => void;
}

function SetRow({
  isCompleted,
  setNumber,
  exercise,
  onComplete,
}: {
  isCompleted: boolean;
  setNumber: number;
  exercise: Exercise;
  onComplete: () => void;
}) {
  const isDone = isCompleted;
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const label = [
    exercise.reps > 0 ? `${exercise.reps} reps` : null,
    exercise.weight ? `${exercise.weight} kg` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onComplete}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      className={`flex-row items-center gap-3 px-4 py-3 ${isDone ? (isDark ? 'bg-white/10' : 'bg-black/10') : ''}`}
    >
      <View
        className={`h-7 w-7 items-center justify-center rounded-full ${isDone ? 'bg-white' : isDark ? 'bg-white/20' : 'bg-black/20'}`}
      >
        <Text
          className={`text-xs font-bold ${isDone ? 'text-black' : isDark ? 'text-white' : 'text-black'}`}
        >
          {setNumber}
        </Text>
      </View>
      <Text
        className={`flex-1 text-sm ${isDone ? 'line-through opacity-50' : 'opacity-80'}`}
      >
        {label || `Set ${setNumber}`}
      </Text>
      {isDone ? (
        <CircleCheck
          className={isDark ? 'text-black' : 'text-white'}
          fill={isDark ? '#ffffff' : '#000000'}
          size={22}
        />
      ) : (
        <Circle
          className={isDark ? 'text-white/40' : 'text-black/30'}
          size={22}
        />
      )}
    </Pressable>
  );
}

function ExerciseRow({
  exercise,
  exerciseLog,
  onCompleteExercise,
  onCompleteSet,
}: {
  exercise: Exercise;
  exerciseLog: ExerciseLog | undefined;
  onCompleteExercise: () => void;
  onCompleteSet: (setIndex: number) => void;
}) {
  const isCompleted = !!exerciseLog?.completedAt;
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return (
    <View>
      <View className="mb-2 flex-row items-center gap-2">
        <Heading
          size="lg"
          className={`${isCompleted ? 'line-through opacity-50' : ''}`}
        >
          {exercise.name}
        </Heading>
        <Pressable
          onPress={onCompleteExercise}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          {isCompleted ? (
            <CircleCheck
              className={isDark ? 'text-black' : 'text-white'}
              fill={isDark ? '#ffffff' : '#000000'}
              size={24}
            />
          ) : (
            <Circle
              className={isDark ? 'text-white/40' : 'text-black/40'}
              size={24}
            />
          )}
        </Pressable>
        <View className="flex-1" />
        {exercise.numberOfSets > 0 && (
          <Text
            className="text-xs font-bold uppercase opacity-50"
            testID={`sets-label-${exercise.id}`}
          >
            {exercise.numberOfSets} Sets
          </Text>
        )}
      </View>

      <View
        className={`overflow-hidden rounded-xl ${isDark ? 'bg-white/8' : 'bg-black/5'}`}
      >
        {Array.from({ length: exercise.numberOfSets }, (_, i) => (
          <View key={i}>
            <SetRow
              isCompleted={i < (exerciseLog?.completedSets ?? 0)}
              setNumber={i + 1}
              exercise={exercise}
              onComplete={() => onCompleteSet(i)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function WorkoutLogView({
  workout,
  log,
  onCompleteExercise,
  onCompleteSet,
}: WorkoutLogViewProps) {
  const router = useRouter();

  const getExerciseLog = (exerciseId: string): ExerciseLog | undefined =>
    log?.exercises.find((e) => e.exercise.id === exerciseId);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Workout Detail',
          headerBackTitle: 'Back',
        }}
      />
      <ThemedView className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-6">
            <Text className="mb-1 text-xs font-bold uppercase opacity-50">
              Primary Focus
            </Text>
            <Heading size="3xl" className="font-black leading-tight">
              {workout.name}
            </Heading>
            <WorkoutQuote className="mt-2 text-left text-sm italic opacity-50" />
          </View>

          {workout.exercises.length === 0 ? (
            <View className="mt-28 items-center gap-6">
              <View
                className={`items-center justify-center rounded-full bg-background-100 p-6`}
              >
                <Dumbbell size={64} />
              </View>
              <View className="items-center gap-3">
                <Heading size="2xl" className="font-black uppercase">
                  No Exercises Yet
                </Heading>
                <Text className="text-center text-sm opacity-70">
                  This workout is looking a bit light. Head over to the Workouts
                  tab to add exercises and build your routine.
                </Text>
              </View>
              <Button
                onPress={() => router.push(`/workout/${workout.id}`)}
                className="h-fit rounded-lg px-6 py-5"
                size="lg"
              >
                <Text className="font-bold uppercase text-typography-0">
                  Add Exercise
                </Text>
              </Button>
            </View>
          ) : (
            <View className="gap-6">
              <WorkoutCompletionProgress
                exercises={workout.exercises}
                exerciseLogs={log?.exercises}
                testID="workout-completion-progress"
              />
              {workout.exercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  exerciseLog={getExerciseLog(exercise.id)}
                  onCompleteExercise={() =>
                    onCompleteExercise(workout, exercise.id)
                  }
                  onCompleteSet={(setIndex) =>
                    onCompleteSet(workout, exercise.id, setIndex)
                  }
                />
              ))}
              <WorkoutStats exercises={workout.exercises} />
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </>
  );
}

function withWorkoutLog(Component: typeof WorkoutLogView) {
  return function WorkoutLogContainer() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getWorkoutById } = useWorkouts();
    const { getLog, completeExercise, completeSet } = useWorkoutRoutine();
    const toast = useToast();
    const previousIsCompletedRef = useRef<boolean | null>(null);

    const workout = getWorkoutById(id!);
    const log = workout ? getLog(workout.id) : undefined;
    const isCompleted = !!log?.completedAt;

    useEffect(() => {
      if (!workout) {
        previousIsCompletedRef.current = null;
        return;
      }

      if (previousIsCompletedRef.current === null) {
        previousIsCompletedRef.current = isCompleted;
        return;
      }

      if (!previousIsCompletedRef.current && isCompleted) {
        toast.show({
          placement: 'top',
          duration: 3200,
          render: ({ id: toastId }) => (
            <Toast nativeID={toastId} action="success">
              <ToastTitle>Workout completed</ToastTitle>
              <ToastDescription>
                {`Great work! You completed ${workout.name} today.`}
              </ToastDescription>
            </Toast>
          ),
        });
      }

      previousIsCompletedRef.current = isCompleted;
    }, [isCompleted, toast, workout]);

    if (!workout) {
      return (
        <ThemedView className="flex-1 items-center justify-center">
          <Text>Workout not found</Text>
        </ThemedView>
      );
    }

    return (
      <Component
        workout={workout}
        log={log}
        onCompleteExercise={completeExercise}
        onCompleteSet={completeSet}
      />
    );
  };
}

export default withWorkoutLog(WorkoutLogView);
