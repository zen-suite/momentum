import { act, renderHook } from '@testing-library/react-native';
import React from 'react';

import { WorkoutProvider, useWorkouts } from '@/contexts/WorkoutContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <WorkoutProvider>{children}</WorkoutProvider>;
}

describe('useWorkouts', () => {
  it('throws when used outside of WorkoutProvider', () => {
    expect(() => renderHook(() => useWorkouts())).toThrow(
      'useWorkouts must be used within a WorkoutProvider',
    );
  });

  it('starts with an empty workout list', () => {
    const { result } = renderHook(() => useWorkouts(), { wrapper });
    expect(result.current.workouts).toEqual([]);
  });

  describe('addWorkout', () => {
    it('adds a workout and returns it', () => {
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      const { result } = renderHook(() => useWorkouts(), { wrapper });

      let id: string;
      act(() => {
        id = result.current.addWorkout('Find Me').id;
      });

      const found = result.current.getWorkoutById(id!);
      expect(found?.name).toBe('Find Me');
    });

    it('returns undefined for an unknown id', () => {
      const { result } = renderHook(() => useWorkouts(), { wrapper });

      expect(result.current.getWorkoutById('nonexistent')).toBeUndefined();
    });
  });

  describe('addExerciseToWorkout', () => {
    it('adds an exercise to the specified workout', () => {
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      expect(workout?.exercises[0].sets).toEqual([]);
    });
  });

  describe('updateExercise', () => {
    it('updates an exercise name', () => {
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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
      const { result } = renderHook(() => useWorkouts(), { wrapper });

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

  describe('addSetToExercise', () => {
    it('adds a set with reps=0 to an exercise', () => {
      const { result } = renderHook(() => useWorkouts(), { wrapper });

      let workoutId: string;
      let exerciseId: string;
      act(() => {
        workoutId = result.current.addWorkout('Strength').id;
        result.current.addExerciseToWorkout(workoutId, 'Bench Press');
      });
      exerciseId = result.current.getWorkoutById(workoutId!)!.exercises[0].id;
      act(() => {
        result.current.addSetToExercise(workoutId!, exerciseId);
      });

      const sets = result.current.getWorkoutById(workoutId!)!.exercises[0].sets;
      expect(sets).toHaveLength(1);
      expect(sets[0].reps).toBe(0);
      expect(sets[0].id).toBeDefined();
    });
  });

  describe('updateSet', () => {
    it('updates reps and weight on a set', () => {
      const { result } = renderHook(() => useWorkouts(), { wrapper });

      let workoutId: string;
      let exerciseId: string;
      let setId: string;
      act(() => {
        workoutId = result.current.addWorkout('Strength').id;
        result.current.addExerciseToWorkout(workoutId, 'Deadlift');
      });
      exerciseId = result.current.getWorkoutById(workoutId!)!.exercises[0].id;
      act(() => {
        result.current.addSetToExercise(workoutId!, exerciseId);
      });
      setId = result.current.getWorkoutById(workoutId!)!.exercises[0].sets[0]
        .id;
      act(() => {
        result.current.updateSet(workoutId!, exerciseId, setId, {
          reps: 5,
          weight: 100,
        });
      });

      const set = result.current.getWorkoutById(workoutId!)!.exercises[0]
        .sets[0];
      expect(set.reps).toBe(5);
      expect(set.weight).toBe(100);
    });
  });

  describe('deleteSet', () => {
    it('removes a set from an exercise', () => {
      const { result } = renderHook(() => useWorkouts(), { wrapper });

      let workoutId: string;
      let exerciseId: string;
      let setId: string;
      act(() => {
        workoutId = result.current.addWorkout('Strength').id;
        result.current.addExerciseToWorkout(workoutId, 'OHP');
      });
      exerciseId = result.current.getWorkoutById(workoutId!)!.exercises[0].id;
      act(() => {
        result.current.addSetToExercise(workoutId!, exerciseId);
      });
      setId = result.current.getWorkoutById(workoutId!)!.exercises[0].sets[0]
        .id;
      act(() => {
        result.current.deleteSet(workoutId!, exerciseId, setId);
      });

      expect(
        result.current.getWorkoutById(workoutId!)!.exercises[0].sets,
      ).toHaveLength(0);
    });
  });
});
