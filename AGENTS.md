# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run test       # Run all tests
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

Run a single test file:

```bash
npx jest path/to/file.test.ts
```

All source files live under `src/`. The `@/` alias maps to `src/`.

## Key Directories

- `app/` — screens and layouts (Expo Router)
- `app/(tabs)/` — tab screens
- `app/workout/` — workout detail screens
- `app/workout-log/` — workout log screens
- `components/` — shared UI components
- `components/ui/` — base UI primitives (accordion, card, input, etc.)
- `constants/` — colors, fonts, and other constants
- `hooks/` — custom hooks
- `providers/` — app-level React providers
- `storage/` — persistence layer
- `store/` — Zustand state stores
- `types/` — shared TypeScript types

## Architecture

### Data flow

```
AsyncStorage
  → storage/ (load/save, handles Date serialization)
    → providers/ (useLoadX / usePersistX effect hooks)
      → store/ (Zustand)
        → hooks/ (useWorkouts, useWorkoutLogs — selectors)
          → HOC containers (withWorkouts, etc.)
            → pure view components (props only)
```

**Providers** (`WorkoutProvider`, `WorkoutLogProvider`, `WorkoutHistoryProvider`) are mounted in `app/_layout.tsx`. They run `useLoadX` on mount and `usePersistX` whenever the store changes. The `isLoaded` flag on each store guards against writing before the initial load completes.

### State management (Zustand)

Two main stores:

- `useWorkoutStore` — workouts and exercises
- `useWorkoutLogStore` — current session log (set/exercise completion)

Custom hooks (`useWorkouts`, `useWorkoutLogs`) select from stores using `useShallow()` to avoid unnecessary re-renders. Always use these hooks rather than accessing stores directly from components.

### Storage layer

Each domain has an interface (`WorkoutStorage`, `WorkoutLogStorage`, `WorkoutHistoryStorage`) and an `AsyncStorage*` implementation. Implementations handle Date serialization (stored as strings, revived as `Date` objects). Singleton instances are exported from `storage/index.ts`.

### Routing (Expo Router)

- `app/_layout.tsx` — root Stack navigator, wraps all providers
- `app/(tabs)/_layout.tsx` — bottom tab navigator
- Dynamic routes use `useLocalSearchParams<{ id: string }>()` for params and `useRouter()` for navigation
- Typed routes are enabled (`typedRoutes: true` in app.json)

## Component Rules

- Use `src/components/ui` as founditonal block to build more complex commponents. If you can't find building block, tell me which blocks you need to build.
- Always have 1 component per file. Except it is HoC. If it is HoC, you can export 2 components. 1 for HoC and another one for pure component.

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

### Composition over props for UI variation

Prefer compound components over boolean/enum props that change what a component renders. Expose named sub-components so callers assemble the UI themselves.

```tsx
// Good — compound component pattern
function Card({ children }: { children: React.ReactNode }) {
  return <View className="rounded-lg p-4">{children}</View>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <View className="mb-2">{children}</View>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

// Caller composes the pieces they need
<Card>
  <CardHeader><Text>Chest Day</Text></CardHeader>
  <CardBody><Text>5 exercises</Text></CardBody>
</Card>

// Bad — component grows a prop for every UI variant
function Card({ title, subtitle, showBadge, showFooter }: CardProps) { ... }
```

When you find yourself adding a boolean/enum prop purely to swap out a chunk of JSX, extract that chunk into a sub-component instead.

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

- Use NativeWind (TailwindCSS) for all styling. No inline style objects except for dynamic values that depend on props/state (e.g., `{ backgroundColor: primaryColor }`). Must support both light mode and dark mode.
- Every `lucide` icon you use must be created in `components/icons/` and use `wrapIcon`.
- Follow [@DESIGN.md](./DESIGN.md) philosophy when design screen or component.

## File Naming

- Components and contexts: PascalCase — `WorkoutCard.tsx`, `WorkoutContext.tsx`
- Hooks: camelCase — `useThemeColor.ts`, `useWorkouts.ts`
- Types: kebab-case
- App route files follow Expo Router conventions (`_layout.tsx`, `[id].tsx`)

## General

- No external documentation files unless explicitly requested.
- Keep components small and focused on a single responsibility.
- Always follow existing codebase conventions.
- Always write unit tests for new components/logic you implement.
- Never use `any` in TypeScript.
- When asked to commit, only write a short message with conventional commits. Don't include Claude co-author.
- Always run `npm run format`, `npm run test`, after you update any code.

## Delivery Guardrails

### 1) Non-negotiable rules (hard fail)

- If a non-dynamic inline style object is used, the task is invalid and must be fixed before final response.
- If a `lucide-react-native` icon is used without being created in `components/icons/` and wrapped with `wrapIcon`, the task is invalid and must be fixed before final response.
- If a violation of these rules is detected at any point, do not finalize; fix first, then continue.

### 2) Dark-mode override rule

- Do not add `dark:` overrides when using semantic design tokens (for example `text-typography-*`, `bg-background-*`, `border-outline-*`) because these tokens already adapt to light/dark themes.
- Use `dark:` only when behavior must intentionally differ from token-based theming.
- If `dark:` is used, explicitly justify why in the required self-audit section before final response.

### 3) Required pre-submit checklist

- For every implementation task, the final response must include a short `Pre-submit checklist` section.
- The checklist must explicitly confirm:
  - No non-dynamic inline styles were introduced.
  - All Lucide icons follow the `components/icons/` + `wrapIcon` rule.
  - `npm run format` and `npm run test` were run when code changed.

### 4) Required self-audit before final response

- Before sending the final response, run a brief self-audit and include it in the final response.
- Self-audit must call out any potential AGENTS.md violations found during the task and whether they were fixed.
- If uncertain about a possible violation, explicitly state the uncertainty and what was verified.
