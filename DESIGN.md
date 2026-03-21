# Design System Strategy: The Kinetic Editorial

## 1. Overview & Creative North Star

**Creative North Star: "The Kinetic Editorial"**

This design system is built to transform the utility of a workout tracker into a high-end, editorial experience. It rejects the "spreadsheet" aesthetic common in fitness apps in favor of a bold, high-contrast environment that feels both premium and indestructible.

By leveraging a strict monochromatic base with surgical injections of high-chroma accents, we create a UI that demands focus. We move beyond standard templates by utilizing **intentional asymmetry**—such as oversized display typography paired with generous, breathing whitespace—to guide the athlete's eye through their session without the clutter of traditional UI frameworks.

---

## 2. Colors & Surface Logic

The palette is rooted in deep obsidian tones, providing a light-absorbing backdrop that makes active content "pop" with cinematic intensity.

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. In a workout environment, thin lines add visual noise. Boundaries must be defined solely through:

- **Tonal Shifts:** Placing a `surface-container-low` card on a `background` floor.
- **Vertical Rhythm:** Using the spacing scale to create groupings.

### Surface Hierarchy

We use a "Physical Layering" model. Imagine sheets of dark obsidian stacked on one another:

- **Base Layer (`surface` / `background-0`):** The foundation of the app.
- **Secondary Layer (`surface-container` / `secondary-100`):** Standard card backgrounds and interactive zones.
- **Elevated Layer (`surface-container-high` / `secondary-300`):** For active states or modal overlays.

### The "Glass & Gradient" Rule

To inject a "signature" feel, floating navigation elements or sticky headers should utilize Glassmorphism. Use `surface` at 70% opacity with a `20px` backdrop-blur.

- **Signature Textures:** Apply a subtle linear gradient to the `primary` (White) buttons, transitioning from `primary-default` to `primary-300` at a 155-degree angle. This adds a "machined metal" sheen that flat white lacks.

---

## 3. Typography

We utilize **Inter** as a variable font to bridge the gap between technical precision and bold editorial impact.

| Level           | Size     | Weight     | Role                                       |
| :-------------- | :------- | :--------- | :----------------------------------------- |
| **Display-LG**  | 3.5rem   | 800        | Large, aggressive metrics (Weight, Reps).  |
| **Headline-LG** | 2.0rem   | 700        | Primary Page Titles; high impact.          |
| **Title-MD**    | 1.125rem | 600        | Card titles and Exercise names.            |
| **Body-MD**     | 0.875rem | 400        | Instructional text and secondary metadata. |
| **Label-MD**    | 0.75rem  | 700 (Caps) | Small labels like "SETS" or "REPS".        |

The hierarchy conveys authority. By using `Display-LG` for numbers, we turn workout data into a "hero" element, celebrating the user's progress.

---

## 4. Elevation & Depth

### The Layering Principle

Depth is achieved through Tonal Layering rather than shadows.

- **Nested Depth:** A `surface-container-highest` button inside a `surface-container` card creates a natural, soft lift.

### Ambient Shadows

When a floating effect is required (e.g., a floating action button), use a "Ghost Shadow":

- **Value:** 0px 12px 32px
- **Color:** `on_surface` at 6% opacity. This mimics natural light reflecting off the dark surface.

### The "Ghost Border" Fallback

If a visual separator is strictly required for accessibility (e.g., inside a complex input form), use a "Ghost Border": the `outline-variant` token at 15% opacity. **100% opaque borders are forbidden.**

---

## 5. Components

### Buttons

- **Primary:** Solid `primary` (White) fill with `on_primary` (Black) text. 48px-56px height for large touch targets. Corner radius: `lg` (1rem).
- **Tertiary/Delete:** Transparent background with `error-600` text and icons.

### Kinetic Input Fields

- **Styling:** Remove all boxes. Use a single underline using `outline-variant` or simply a large `Display-SM` typographic style for the value.
- **Touch Targets:** Every input field must have a minimum height of 56px to ensure ease of use with sweaty hands or gloves.

### Cards & Lists

- **Separation:** Forbid the use of divider lines. Use `spacing-8` (2rem) to separate exercises.
- **Card Styling:** Use `surface-container` with a `lg` (16px) corner radius. For an "Active" workout card, transition the background to `surface-bright`.

### Additional Component: The "Progress Pill"

A custom component for tracking sets. A series of `secondary-500` pills that transition to `primary-default` (White) when a set is completed.

---

## 6. Do’s and Don’ts

### Do

- **Do** use extreme contrast. If a button is white, the text must be absolute black.
- **Do** utilize `error-950` and `error-100` tones only for destructive actions or critical warnings.
- **Do** maximize "negative space." Let the black background breathe to reduce cognitive load during high-intensity training.

### Don’t

- **Don’t** use shadows to define a card's edge. Use background color shifts.
- **Don’t** use icons smaller than 24x24px within a 44px touch target.
- **Don’t** use pure 100% Grey for text. Use `typography-600` to maintain a sophisticated, tinted dark-mode feel.
