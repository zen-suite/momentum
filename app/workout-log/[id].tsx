import { ThemedView } from '@/components/ThemedView';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useWorkoutLogs, useWorkouts } from '@/contexts/WorkoutContext';
import {
  Exercise,
  ExerciseLog,
  SetLog,
  Workout,
  WorkoutLog,
} from '@/types/workout';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  ChevronDown,
  Dumbbell,
  Square,
  SquareCheck,
} from 'lucide-react-native';
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
  setLog,
  setNumber,
  onComplete,
}: {
  setLog: SetLog | undefined;
  setNumber: number;
  onComplete: () => void;
}) {
  const isDone = !!setLog?.completedAt;
  return (
    <Pressable
      className="flex-row items-center gap-3 px-4 py-2 text-primary"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      onPress={onComplete}
    >
      {isDone ? <SquareCheck size={20} /> : <Square size={20} />}
      <Text
        className={`text-sm ${isDone ? 'line-through opacity-50' : 'opacity-80'}`}
      >
        Set {setNumber}
      </Text>
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

  const setsLabel = [
    exercise.numberOfSets > 0 ? `${exercise.numberOfSets} sets` : null,
    exercise.reps > 0 ? `${exercise.reps} reps` : null,
    exercise.weight ? `${exercise.weight} kg` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Accordion
      type="multiple"
      variant="unfilled"
      className="overflow-hidden rounded-lg border border-outline-100"
    >
      <AccordionItem value={exercise.id}>
        <AccordionHeader>
          <AccordionTrigger className="px-4 py-3 text-primary">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onCompleteExercise();
              }}
              hitSlop={8}
            >
              {isCompleted ? (
                <SquareCheck size={26} style={{ marginRight: 12 }} />
              ) : (
                <Square size={26} style={{ marginRight: 12 }} />
              )}
            </Pressable>
            <View className="flex-1 gap-1">
              <Heading
                size="md"
                className={isCompleted ? 'line-through opacity-50' : ''}
              >
                {exercise.name}
              </Heading>
              {setsLabel ? (
                <Text className="text-[13px] opacity-60">{setsLabel}</Text>
              ) : null}
            </View>
            <AccordionIcon as={ChevronDown} size="xl" className="ml-2" />
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent className="px-0 pb-2 pt-0">
          {Array.from({ length: exercise.numberOfSets }, (_, i) => (
            <SetRow
              key={i}
              setLog={exerciseLog?.sets?.find((s) => s.setIndex === i)}
              setNumber={i + 1}
              onComplete={() => onCompleteSet(i)}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function WorkoutLogView({
  workout,
  log,
  onCompleteExercise,
  onCompleteSet,
}: WorkoutLogViewProps) {
  const completedCount = log
    ? log.exercises.filter((e) => !!e.completedAt).length
    : 0;
  const totalCount = workout.exercises.length;

  const getExerciseLog = (exerciseId: string): ExerciseLog | undefined =>
    log?.exercises.find((e) => e.exercise.id === exerciseId);

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
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-sm font-semibold opacity-60">
              {completedCount} / {totalCount} exercises completed
            </Text>
          </View>

          {workout.exercises.length === 0 ? (
            <View className="mt-10 items-center gap-3">
              <Dumbbell size={64} color="#9BA1A6" />
              <Heading size="md">No exercises yet</Heading>
              <Text className="text-center text-sm opacity-70">
                Add exercises in the Workouts tab
              </Text>
            </View>
          ) : (
            <View className="gap-3">
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
    const { getLog, completeExercise, completeSet } = useWorkoutLogs();

    const workout = getWorkoutById(id!);

    if (!workout) {
      return (
        <ThemedView className="flex-1 items-center justify-center">
          <Text>Workout not found</Text>
        </ThemedView>
      );
    }

    const log = getLog(workout.id);

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
