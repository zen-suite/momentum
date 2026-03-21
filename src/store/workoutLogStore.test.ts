import { act, renderHook } from '@testing-library/react-native';

import { useWorkoutLogStore } from '@/store/workoutLogStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { Workout } from '@/types/workout';

beforeEach(() => {
  useWorkoutLogStore.setState({ workoutLogs: {}, isLoaded: false });
  useWorkoutStore.setState({ workouts: [], isLoaded: false });
});

function makeWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'w1',
    name: 'Push Day',
    exercises: [],
    createdAt: new Date(),
    ...overrides,
  };
}

function makeWorkoutWithExercises(): Workout {
  return makeWorkout({
    exercises: [
      { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3 },
      { id: 'e2', name: 'Squat', reps: 8, numberOfSets: 4 },
    ],
  });
}

describe('workoutLogStore', () => {
  describe('completeExercise', () => {
    it('marks an exercise as completed', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      const log = result.current.getLog('w1');
      expect(log).toBeDefined();
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedAt).toBeInstanceOf(Date);
    });

    it('does not complete the workout if not all exercises are done', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      const log = result.current.getLog('w1');
      expect(log?.completedAt).toBeUndefined();
    });

    it('auto-completes the workout when all exercises are done', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
        result.current.completeExercise(workout, 'e2');
      });

      const log = result.current.getLog('w1');
      expect(log?.completedAt).toBeInstanceOf(Date);
    });

    it('toggles a completed exercise back to incomplete', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
      });
      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedAt).toBeUndefined();
    });

    it('completes all sets when an exercise is completed', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedSets).toBe(3);
    });

    it('clears all sets when an exercise is toggled off', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
      });
      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedSets).toBe(0);
    });

    it('sets completedSets to numberOfSets when exercise is completed', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkout({
        exercises: [{ id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3 }],
      });

      act(() => {
        result.current.completeSet(workout, 'e1', 0);
      });
      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedSets).toBe(3);
    });

    it('clears workout completedAt when an exercise is toggled off', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
        result.current.completeExercise(workout, 'e2');
      });
      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      const log = result.current.getLog('w1');
      expect(log?.completedAt).toBeUndefined();
    });
  });

  describe('completeSet', () => {
    it('marks sets up to and including setIndex as completed', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeSet(workout, 'e1', 1);
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedSets).toBe(2);
    });

    it('auto-completes the exercise when all sets are done', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkout({
        exercises: [{ id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 2 }],
      });

      act(() => {
        result.current.completeSet(workout, 'e1', 0);
        result.current.completeSet(workout, 'e1', 1);
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedAt).toBeInstanceOf(Date);
    });

    it('toggles a set off when already completed', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeSet(workout, 'e1', 0);
        result.current.completeSet(workout, 'e1', 0);
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedSets).toBe(0);
    });

    it('auto-completes exercise when numberOfSets increased after log creation', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workoutV1 = makeWorkout({
        exercises: [{ id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 1 }],
      });
      act(() => {
        result.current.completeSet(workoutV1, 'e1', 0);
      });

      // Simulate user increasing numberOfSets to 3
      const workoutV2 = makeWorkout({
        exercises: [{ id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 3 }],
      });
      act(() => {
        result.current.completeSet(workoutV2, 'e1', 1);
        result.current.completeSet(workoutV2, 'e1', 2);
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e1');
      expect(exerciseLog?.completedSets).toBe(3);
      expect(exerciseLog?.completedAt).toBeInstanceOf(Date);
    });

    it('can complete sets for an exercise added after log creation', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workoutV1 = makeWorkout({
        exercises: [{ id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 1 }],
      });
      act(() => {
        result.current.completeSet(workoutV1, 'e1', 0);
      });

      // Simulate user adding a new exercise to the workout
      const workoutV2 = makeWorkout({
        exercises: [
          { id: 'e1', name: 'Bench Press', reps: 10, numberOfSets: 1 },
          { id: 'e2', name: 'Squat', reps: 8, numberOfSets: 2 },
        ],
      });
      act(() => {
        result.current.completeSet(workoutV2, 'e2', 0);
      });

      const log = result.current.getLog('w1');
      const exerciseLog = log!.exercises.find((e) => e.exercise.id === 'e2');
      expect(exerciseLog?.completedSets).toBe(1);
    });
  });

  describe('toggleWorkoutComplete', () => {
    it('marks all exercises and the workout as complete', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.toggleWorkoutComplete(workout);
      });

      const log = result.current.getLog('w1');
      expect(log?.completedAt).toBeInstanceOf(Date);
      expect(log?.exercises.every((e) => !!e.completedAt)).toBe(true);
    });

    it('clears all completions when called again on a completed workout', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.toggleWorkoutComplete(workout);
      });
      act(() => {
        result.current.toggleWorkoutComplete(workout);
      });

      const log = result.current.getLog('w1');
      expect(log?.completedAt).toBeUndefined();
      expect(log?.exercises.every((e) => !e.completedAt)).toBe(true);
    });
  });

  describe('restartRoutine', () => {
    it('clears all workout logs', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.toggleWorkoutComplete(workout);
      });

      expect(Object.keys(result.current.workoutLogs)).toHaveLength(1);

      act(() => {
        result.current.restartRoutine();
      });

      expect(result.current.workoutLogs).toEqual({});
    });
  });

  describe('getLog', () => {
    it('returns undefined when no log exists for a workout', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      expect(result.current.getLog('nonexistent')).toBeUndefined();
    });

    it('returns the log after a completion action', () => {
      const { result } = renderHook(() => useWorkoutLogStore());
      const workout = makeWorkoutWithExercises();

      act(() => {
        result.current.completeExercise(workout, 'e1');
      });

      expect(result.current.getLog('w1')).toBeDefined();
    });
  });
});
