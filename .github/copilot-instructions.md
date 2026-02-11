# Coding Standards for Workout Tracker

## Component Architecture

### Pure Components

All React components in this repository **MUST** be pure components by default. This means:

- **No side effects** inside component function bodies
- No data fetching (API calls, database queries)
- No subscriptions or event listeners
- No direct context mutations
- No `useEffect` hooks (unless in HOC)
- Components should only render UI based on props

**Example of a Pure Component:**

```tsx
interface WorkoutListProps {
  workouts: Workout[];
  onWorkoutPress: (id: string) => void;
}

export function WorkoutList({ workouts, onWorkoutPress }: WorkoutListProps) {
  return (
    <View>
      {workouts.map((workout) => (
        <TouchableOpacity
          key={workout.id}
          onPress={() => onWorkoutPress(workout.id)}
        >
          <Text>{workout.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### Higher-Order Components (HOC) for Side Effects

When a component requires side effects, create a **separate HOC component** that:

- Ends with the `HOC` suffix
- Handles all side effects (data fetching, subscriptions, context, etc.)
- Passes data down to the pure component as props

**Naming Convention:**

- Pure Component: `WorkoutList`
- HOC Component: `WorkoutListHOC`

**Example of an HOC Component:**

```tsx
export function WorkoutListHOC() {
  // Side effects are allowed here
  const { workouts, isLoading } = useWorkouts();
  const navigation = useNavigation();

  const handleWorkoutPress = useCallback(
    (id: string) => {
      navigation.navigate("workout", { id });
    },
    [navigation],
  );

  // Fetch data
  useEffect(() => {
    fetchWorkouts();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Pass everything as props to pure component
  return (
    <WorkoutList workouts={workouts} onWorkoutPress={handleWorkoutPress} />
  );
}
```

### Benefits of This Pattern

1. **Testability**: Pure components are easy to test with simple prop inputs
2. **Reusability**: Pure components can be used in different contexts with different data sources
3. **Predictability**: Pure components always render the same output for the same props
4. **Separation of Concerns**: UI logic is separated from data/side effects logic
5. **Performance**: Pure components can be optimized with React.memo more effectively

### Implementation Checklist

When creating a new component:

- [ ] Start with a pure component that accepts all data as props
- [ ] If side effects are needed, create a separate HOC with `HOC` suffix
- [ ] HOC handles: data fetching, subscriptions, navigation, context
- [ ] HOC passes processed data to pure component as props
- [ ] Pure component only contains rendering logic

### Non-Compliance

Code that violates these standards should be refactored before merge:

❌ **Bad** - Side effects in component:

```tsx
export function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetchWorkouts().then(setWorkouts); // Side effect!
  }, []);

  return <View>{/* render */}</View>;
}
```

✅ **Good** - Separated into pure component + HOC:

```tsx
// Pure component
export function WorkoutList({ workouts }: { workouts: Workout[] }) {
  return <View>{/* render */}</View>;
}

// HOC handles side effects
export function WorkoutListHOC() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetchWorkouts().then(setWorkouts);
  }, []);

  return <WorkoutList workouts={workouts} />;
}
```
