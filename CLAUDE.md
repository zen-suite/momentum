# Workout Tracker — Claude Instructions

## Project

React Native app built with Expo Router (file-based routing). TypeScript throughout.

**Key directories:**

- `app/` — screens and layouts (Expo Router)
- `app/(tabs)/` — tab screens
- `components/` — shared UI components
- `constants/theme.ts` — colors and fonts
- `hooks/` — custom hooks
- `contexts/` — React contexts

## Component Rules

### Pure components first

Components must be pure: given the same props, they render the same output. No side effects inside the component body.

```tsx
// Good
function WorkoutCard({ name, exerciseCount, onPress }: WorkoutCardProps) {
  return <Pressable onPress={onPress}>...</Pressable>;
}

// Bad — fetching inside a component
function WorkoutCard({ id }: { id: string }) {
  const [workout, setWorkout] = useState(null);
  useEffect(() => fetch(`/workouts/${id}`).then(...), [id]); // not pure
  ...
}
```

### Higher-order components for side effects

If a component needs external effects (data fetching, subscriptions, navigation side effects), isolate the effect in a HOC and pass the result as props to the pure inner component.

```tsx
// Pure display component
function WorkoutListView({ workouts, onAdd, onDelete }: WorkoutListViewProps) { ... }

// HOC handles the effect
function withWorkouts(Component: typeof WorkoutListView) {
  return function WorkoutsContainer(props: {}) {
    const { workouts, addWorkout, deleteWorkout } = useWorkouts();
    return <Component workouts={workouts} onAdd={addWorkout} onDelete={deleteWorkout} />;
  };
}

export default withWorkouts(WorkoutListView);
```

### Props over context

Pass data via props rather than reaching into context inside a component. Context should be consumed at the HOC/container level and threaded down as props.

```tsx
// Good — context consumed once at the top, passed as props
const WorkoutsScreen = withWorkouts(WorkoutListView);

// Avoid — context consumed deep inside a leaf component
function WorkoutCard({ id }: { id: string }) {
  const { workouts } = useWorkouts(); // reach-in
  ...
}
```

## Styling

Use `StyleSheet.create` for all styles. No inline style objects except for dynamic values that depend on props/state (e.g., `{ backgroundColor: primaryColor }`).

## Theming

Use `useThemeColor` from `@/hooks/useThemeColor` to resolve colors. Use `Colors` and `Fonts` from `@/constants/theme`.

## File naming

- Components and contexts: PascalCase — `WorkoutCard.tsx`, `WorkoutContext.tsx`
- Hooks: camelCase — `useThemeColor.ts`, `useWorkouts.ts`
- Types: kebab-case
- App route files follow Expo Router conventions (`_layout.tsx`, `[id].tsx`)

## General

- No external documentation files unless explicitly requested.
- Keep components small and focused on a single responsibility.
- Always follow existing codebase conventions.
- Alway write unit tests for new components/logic you implemented.
