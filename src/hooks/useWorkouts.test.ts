import { act, renderHook } from '@testing-library/react-native';

import { useWorkouts } from '@/hooks/useWorkouts';
import { useWorkoutStore } from '@/store/workoutStore';

beforeEach(() => {
  useWorkoutStore.setState({ workouts: [], isLoaded: false });
});

describe('useWorkouts', () => {
  it('starts with an empty workout list', () => {
    const { result } = renderHook(() => useWorkouts());
    expect(result.current.workouts).toEqual([]);
  });

  describe('addWorkout', () => {
    it('adds a workout and returns it', () => {
      const { result } = renderHook(() => useWorkouts());

      let workout: ReturnType<typeof result.current.addWorkout>;
      act(() => {
        workout = result.current.addWorkout('Leg Day');
      });

      expect(result.current.workouts).toHaveLength(1);
      expect(result.current.workouts[0].name).toBe('Leg Day');
      expect(result.current.workouts[0].exercises).toEqual([]);
      expect(result.current.workouts[0].id).toBeDefined();
      expect(result.current.workouts[0].createdAt).toBeInstanceOf(Date);
      expect(workout!.name).toBe('Leg Day');
    });

    it('adds multiple workouts', () => {
      const { result } = renderHook(() => useWorkouts());

      act(() => {
        result.current.addWorkout('Push Day');
        result.current.addWorkout('Pull Day');
      });

      expect(result.current.workouts).toHaveLength(2);
      expect(result.current.workouts[0].name).toBe('Push Day');
      expect(result.current.workouts[1].name).toBe('Pull Day');
    });
  });

  describe('updateWorkout', () => {
    it('updates a workout by id', () => {
      const { result } = renderHook(() => useWorkouts());

      let id: string;
      act(() => {
        id = result.current.addWorkout('Old Name').id;
      });
      act(() => {
        result.current.updateWorkout(id!, { name: 'New Name' });
      });

      expect(result.current.workouts[0].name).toBe('New Name');
    });

    it('does not affect other workouts', () => {
      const { result } = renderHook(() => useWorkouts());

      let id1: string;
      act(() => {
        id1 = result.current.addWorkout('Workout A').id;
        result.current.addWorkout('Workout B');
      });
      act(() => {
        result.current.updateWorkout(id1!, { name: 'Updated A' });
      });

      expect(result.current.workouts[0].name).toBe('Updated A');
      expect(result.current.workouts[1].name).toBe('Workout B');
    });
  });

  describe('deleteWorkout', () => {
    it('removes a workout by id', () => {
      const { result } = renderHook(() => useWorkouts());

      let id: string;
      act(() => {
        id = result.current.addWorkout('To Delete').id;
      });
      act(() => {
        result.current.deleteWorkout(id!);
      });

      expect(result.current.workouts).toHaveLength(0);
    });

    it('only removes the targeted workout', () => {
      const { result } = renderHook(() => useWorkouts());

      let id1: string;
      act(() => {
        id1 = result.current.addWorkout('Delete Me').id;
        result.current.addWorkout('Keep Me');
      });
      act(() => {
        result.current.deleteWorkout(id1!);
      });

      expect(result.current.workouts).toHaveLength(1);
      expect(result.current.workouts[0].name).toBe('Keep Me');
    });
  });

  describe('getWorkoutById', () => {
    it('returns the workout with the given id', () => {
      const { result } = renderHook(() => useWorkouts());

      let id: string;
      act(() => {
        id = result.current.addWorkout('Find Me').id;
      });

      const found = result.current.getWorkoutById(id!);
      expect(found?.name).toBe('Find Me');
    });

    it('returns undefined for an unknown id', () => {
      const { result } = renderHook(() => useWorkouts());

      expect(result.current.getWorkoutById('nonexistent')).toBeUndefined();
    });
  });

  describe('addExerciseToWorkout', () => {
    it('adds an exercise to the specified workout', () => {
      const { result } = renderHook(() => useWorkouts());

      let id: string;
      act(() => {
        id = result.current.addWorkout('Strength').id;
      });
      act(() => {
        result.current.addExerciseToWorkout(id!, 'Squat');
      });

      const workout = result.current.getWorkoutById(id!);
      expect(workout?.exercises).toHaveLength(1);
      expect(workout?.exercises[0].name).toBe('Squat');
      expect(workout?.exercises[0].reps).toBe(0);
      expect(workout?.exercises[0].numberOfSets).toBe(1);
    });
  });

  describe('updateExercise', () => {
    it('updates an exercise name', () => {
      const { result } = renderHook(() => useWorkouts());

      let workoutId: string;
      let exerciseId: string;
      act(() => {
        workoutId = result.current.addWorkout('Strength').id;
        result.current.addExerciseToWorkout(workoutId, 'Squat');
      });
      exerciseId = result.current.getWorkoutById(workoutId!)!.exercises[0].id;
      act(() => {
        result.current.updateExercise(workoutId!, exerciseId, {
          name: 'Back Squat',
        });
      });

      const exercise = result.current.getWorkoutById(workoutId!)!.exercises[0];
      expect(exercise.name).toBe('Back Squat');
    });
  });

  describe('deleteExercise', () => {
    it('removes an exercise from a workout', () => {
      const { result } = renderHook(() => useWorkouts());

      let workoutId: string;
      let exerciseId: string;
      act(() => {
        workoutId = result.current.addWorkout('Strength').id;
        result.current.addExerciseToWorkout(workoutId, 'Squat');
      });
      exerciseId = result.current.getWorkoutById(workoutId!)!.exercises[0].id;
      act(() => {
        result.current.deleteExercise(workoutId!, exerciseId);
      });

      expect(result.current.getWorkoutById(workoutId!)!.exercises).toHaveLength(
        0,
      );
    });
  });

  describe('updateExercise fields', () => {
    it('updates reps, weight, and numberOfSets on an exercise', () => {
      const { result } = renderHook(() => useWorkouts());

      let workoutId: string;
      let exerciseId: string;
      act(() => {
        workoutId = result.current.addWorkout('Strength').id;
        result.current.addExerciseToWorkout(workoutId, 'Bench Press');
      });
      exerciseId = result.current.getWorkoutById(workoutId!)!.exercises[0].id;
      act(() => {
        result.current.updateExercise(workoutId!, exerciseId, {
          reps: 8,
          weight: 60,
          numberOfSets: 4,
        });
      });

      const exercise = result.current.getWorkoutById(workoutId!)!.exercises[0];
      expect(exercise.reps).toBe(8);
      expect(exercise.weight).toBe(60);
      expect(exercise.numberOfSets).toBe(4);
    });

    it('adds an exercise with default reps=0 and numberOfSets=1', () => {
      const { result } = renderHook(() => useWorkouts());

      let workoutId: string;
      act(() => {
        workoutId = result.current.addWorkout('Strength').id;
        result.current.addExerciseToWorkout(workoutId, 'Squat');
      });

      const exercise = result.current.getWorkoutById(workoutId!)!.exercises[0];
      expect(exercise.reps).toBe(0);
      expect(exercise.numberOfSets).toBe(1);
      expect(exercise.weight).toBeUndefined();
    });
  });
});
