# Advanced Form Builder / Workflow Designer

A production-quality, enterprise-grade dynamic form builder built with React 19, TypeScript 5, and modern tooling. Users can create, configure, and persist complex forms with conditional logic, real-time validation, and drag-and-drop reordering -- all within a live inline preview.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run the test suite
npm test

# Lint the codebase
npm run lint

# Build for production
npm run build
```

## Features at a Glance

| Capability | Details |
|---|---|
| **Dynamic fields** | Add, remove, reorder (drag-and-drop) five field types: Text, Number, Select, Checkbox, Date |
| **Live inline preview** | The form renders in real time as fields are added -- read-only in build mode, interactive in view mode |
| **Conditional logic** | Show/hide fields and toggle required state based on another field's value |
| **Real-time validation** | Required checks, number ranges, regex patterns, date bounds, custom error messages |
| **Input sanitization** | Labels must contain at least one letter; special characters are rejected; option values cannot be empty |
| **Type safety** | Strict TypeScript throughout; discriminated unions, `as const` objects, zero `any` |
| **Persistence** | Save/load/edit form configurations via a simulated REST API backed by localStorage |
| **Export** | Download the form configuration as a portable JSON file |
| **Build vs View mode** | Building mode: fields are read-only with drag handles and delete buttons. View mode (Preview/Load): fields are interactive with a Submit button that calls the mock API |
| **Theming** | Light (frosted glass) and dark mode with system-preference detection and localStorage persistence |
| **Responsive** | Adapts from mobile to wide desktop with a fluid layout |
| **WCAG accessibility** | Contrast-compliant colours, `prefers-reduced-motion` support, keyboard-accessible controls, ARIA labels, `focus-visible` outlines |
| **Centralized strings** | All UI labels, placeholders, messages, and ARIA labels in a single constants file -- i18n-ready |
| **Toast feedback** | Every user action (add field, remove field, reorder, save, export, submit, reset, rule add/remove) triggers a toast notification |
| **Testing** | 53 tests covering validation logic, store behaviour, and component rendering |

---

## Architecture

The codebase follows a layered architecture that separates concerns cleanly. Each layer can be understood, tested, and evolved independently.

```
src/
├── types/              Type definitions (the "contract" layer)
├── constants/          Centralized UI labels, messages, and config
├── validation/         Pure-function validation engine
├── store/              Redux Toolkit state management
├── api/                Mock persistence layer
├── hooks/              Shared React hooks (theming, toasts)
├── utils/              Utilities (classnames, field factory, sanitization, form actions)
├── assets/             SVG logo component
├── components/
│   ├── ui/             Reusable design-system primitives
│   ├── fields/         Field renderer (type-to-component mapping)
│   ├── builder/        Builder workspace (sidebar, configurator)
│   └── preview/        Live form preview with drag-and-drop
├── test/               Test setup
├── App.tsx             Application shell
└── main.tsx            Entry point
```

### Layer responsibilities

**Types** (`types/`) -- Discriminated unions define every field shape. `FieldConfig` is a union of `TextFieldConfig | NumberFieldConfig | SelectFieldConfig | CheckboxFieldConfig | DateFieldConfig`, so the compiler enforces that you cannot access `.options` on a text field or `.pattern` on a number field. Conditional rules, validation results, and the serialisable `FormConfiguration` all live here.

**Constants** (`constants/`) -- All user-facing text is centralized in `messages.ts` using `as const` objects: `ValidationMessages`, `ToastMessages`, `AppLabels`, `FormLabels`, `ButtonLabels`, `SectionLabels`, `FieldConfigLabels`, `PlaceholderTexts`, `EmptyStateTexts`, and `AriaLabels`. Application config (`TEXT_MAX_LENGTH`, `TOAST_DURATION_MS`, `THEME_STORAGE_KEY`) is read from environment variables via `config.ts`.

**Validation Engine** (`validation/engine.ts`) -- Pure functions with no React dependency: `isFieldVisible`, `isFieldRequired`, `validateField`, `validateAllFields`, `isFormValid`. They are the single source of truth for field state and can be reused on a server.

**State Management** (`store/`) -- A Redux Toolkit slice holds the builder state: fields, conditions, form values, validation errors, and UI state. Thunks handle imperative operations (`validateFormThunk`, `getFormConfigThunk`, `removeFieldThunk`). Typed hooks (`useAppSelector` / `useAppDispatch`) provide full TypeScript inference.

**Mock API** (`api/mock-api.ts`) -- Async layer with configurable latency (via `.env`). Methods: `list`, `getById`, `save`, `remove`, `exportAsJson`, `submitForm`. Storage key and delay read from environment variables. All `localStorage` access is wrapped in try/catch.

**Hooks** (`hooks/`) -- `useTheme` manages light/dark mode with system-preference detection and localStorage persistence. `useToasts` manages ephemeral toast notifications with auto-dismiss.

**Utils** (`utils/`) -- `cn` merges class names. `createField` produces type-safe defaults with exhaustiveness checking. `sanitize` provides `hasMeaningfulContent` and `isValidLabel` for input validation. `form-actions` provides reusable `downloadJson`, `validateFormName`, and `validateFieldLabels` functions.

**UI Primitives** (`components/ui/`) -- `Button`, `Input`, `Select`, `Checkbox`, `FieldWrapper`, and `ToastContainer`. Each is `memo`-wrapped with Tailwind utility classes, frosted glass styling in light mode, and consistent focus/disabled/error states.

**Builder** (`components/builder/`) -- Field-type picker, per-field configurator panel with move up/down and remove controls, conditional-rule editor, and saved-forms list with preview/edit/delete.

**Preview** (`components/preview/FormPreview.tsx`) -- Renders the form inline. In build mode, fields are read-only with drag handles and delete buttons on hover. In view mode, fields are interactive with a Submit button.

---

## TypeScript Strategy

### Discriminated unions over generics

```typescript
export type FieldConfig =
  | TextFieldConfig    // type: "text"
  | NumberFieldConfig  // type: "number"
  | SelectFieldConfig  // type: "select"
  | CheckboxFieldConfig // type: "checkbox"
  | DateFieldConfig;   // type: "date"
```

Switching on `field.type` narrows the type automatically, giving access to type-specific properties without casting.

### Named `as const` objects over enums

```typescript
export const FieldTypes = {
  Text: "text",
  Number: "number",
  // ...
} as const;
```

Same autocomplete and refactoring safety as enums, without the runtime IIFE bloat, reverse mappings, or tree-shaking issues. Supports function-valued entries (e.g. parameterised validation messages).

### Zero `any`

`tsconfig.app.json` enables `strict: true`, `noUnusedLocals`, and `noUnusedParameters`. The entire codebase compiles with zero `any` usages.

---

## Validation and Conditional Logic

### Validation pipeline

| Field type | Checks |
|---|---|
| Text | required, minLength, maxLength, regex pattern with custom message |
| Number | required, NaN guard, min, max |
| Select | required (non-empty selection) |
| Checkbox | required (must be checked) |
| Date | required, minDate, maxDate |

Validation runs in three contexts:

1. **Real-time** -- `setFormValue` validates the changed field on each keystroke.
2. **On submit** -- `validateFormThunk` runs all fields and calls `formApi.submitForm` if valid.
3. **On save** -- `validateFormName` and `validateFieldLabels` check that the form name contains at least one letter (no special characters) and that all field/option labels are valid before persisting.

### Conditional logic

A `ConditionalRule` describes an action (`show`, `hide`, `require`, `unrequire`) to apply to a target field when a source field meets a condition. Operators: `equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `is_checked`, `is_not_checked`.

Hidden fields are automatically excluded from validation, preventing phantom errors.

### Safety guardrails

Removing a field referenced as a condition source on another field is blocked with a descriptive toast naming the dependent fields.

---

## Styling Approach

**Tailwind CSS v4** with a custom theme defined via `@theme` in `index.css`. The palette uses purpose-named colour scales: `primary`, `surface`, `danger`, `success`, `warning`.

### Key decisions

- **Frosted glass light mode** -- Cards and panels use `bg-white/70 backdrop-blur-lg` with semi-transparent borders for a soft, non-glaring appearance.
- **Dark mode** -- Controlled via `@variant dark` with the `dark` class on `<html>`. Persisted to localStorage, respects system preference on first visit.
- **WCAG AA** -- All text meets 4.5:1 contrast ratio. Inter loaded with optical sizing (`opsz`) for better readability at small sizes.
- **`prefers-reduced-motion`** -- Global media query disables all animations and transitions for users who prefer reduced motion.
- **Performance-optimized transitions** -- No `transition-all`; each component transitions only the specific properties that change (`transition-colors`, `transition-[transform,opacity]`).
- **Consistent durations** -- 150ms for interactions (buttons, inputs), 200ms for theme/toast transitions.
- **Select chevron** -- Separate light and dark SVG data URIs ensure the dropdown arrow is visible in both themes.
- **Focus ring offsets** -- All `ring-offset` values match the actual background colour of each mode (`surface-950` for dark, white for light).

---

## Environment Configuration

Application settings are managed via `.env` (excluded from version control). A `.env.example` template is provided:

```
VITE_APP_HOST=localhost
VITE_APP_PORT=9000
VITE_STORAGE_KEY=form_builder_configurations
VITE_API_SIMULATED_DELAY=600
VITE_TEXT_MAX_LENGTH=100
VITE_THEME_STORAGE_KEY=form_builder_theme
```

---

## Performance Considerations

| Technique | Rationale |
|---|---|
| `React.memo` on all leaf components | Prevents re-renders when a component's props haven't changed |
| Redux Toolkit selectors | `useAppSelector` subscribes only to needed state slices. Stable `dispatch` keeps memoized callbacks stable |
| `@dnd-kit` pointer activation constraint | Drag initiates only after 8px movement, preventing accidental drags |
| Single `FieldRenderer` switch | One component handles all five types, avoiding unnecessary mount/unmount |
| Per-field validation on change | Only the changed field is re-validated on each keystroke. Full validation runs on submit |
| No `transition-all` | Each component transitions only specific properties to avoid expensive repaints |
| `prefers-reduced-motion` | Disables all animations and transitions for accessibility |

---

## Error Handling

- **Validation errors** appear inline beneath fields with `role="alert"` for screen readers.
- **Save failures** show a dismissible banner with a descriptive message.
- **Field removal conflicts** surface a toast naming the dependent conditional rules.
- **Toast notifications** on every action: field add/remove/reorder, rule add/remove, save, export, submit, reset. Auto-dismiss after 4 seconds with proper cleanup of both timers.
- **Input sanitization** -- Labels must contain at least one letter and no special characters. Dropdown option values cannot be empty. Real-time inline error styling plus save-time validation.
- **localStorage resilience** -- All `localStorage` reads and writes are wrapped in try/catch for private browsing mode.

---

## Trade-offs and Decisions

| Decision | Why | Alternative considered |
|---|---|---|
| **Redux Toolkit** over Zustand / plain Redux | `createSlice` eliminates boilerplate; Immer enables ergonomic immutable updates; DevTools built-in | Zustand is lighter but lacks DevTools; plain Redux requires more boilerplate |
| **Tailwind CSS v4** over CSS Modules | Utility-first with built-in dark mode; co-located styles reduce context switching | CSS Modules give scoped names but add more files |
| **@dnd-kit** over react-beautiful-dnd | Actively maintained, accessible, modular, lighter | react-beautiful-dnd is in maintenance mode |
| **Pure validation functions** over Zod/Yup | Field rules are dynamic and user-defined; a schema library adds indirection | Zod works well for static schemas |
| **localStorage** over IndexedDB / in-memory | Persists across page refreshes without async setup; synchronous API keeps the mock simple; sufficient capacity for form configurations; easy to inspect in DevTools | IndexedDB is async-native and handles larger data but adds complexity for a demo; in-memory (Map) loses data on refresh |
| **Single slice** over multiple slices | Form state is inherently connected -- field edits affect conditions and validation | Splitting introduces synchronisation overhead |
| **`as const` objects** over TypeScript `enum` | No runtime IIFE bloat, tree-shakeable, supports function values | Enums generate reverse mappings, can't hold functions, aren't dead-code eliminated |
| **Inline live preview** over separate preview mode | Users see the form taking shape in real time; no context switching | Separate preview gives a cleaner simulation but adds friction |
| **Reusable utility functions** (`form-actions.ts`) | Business logic extracted from components for reuse and testability | Inline handlers are simpler but lock logic inside callbacks |

---

## Testing

| Suite | File | Tests | What it verifies |
|---|---|---|---|
| Validation engine | `validation/engine.test.ts` | 32 | Required checks, text/number/date/checkbox rules, conditional visibility/required, whole-form validation |
| Store | `store/form-builder-slice.test.ts` | 9 | Field CRUD, reordering, condition management, real-time validation, config export/import |
| Field rendering | `components/fields/FieldRenderer.test.tsx` | 12 | Correct input types rendered, label/placeholder display, onChange callbacks, error display, disabled state |

```bash
npm test              # Single run
npm run test:watch    # Watch mode
npm run lint          # ESLint
```

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| TypeScript | 5.9 | Static typing |
| Vite | 7 | Build tool and dev server |
| Redux Toolkit | 2.x | State management with `createSlice`, Immer, and DevTools |
| React-Redux | 9.x | Official React bindings for Redux |
| @dnd-kit | Latest | Accessible drag-and-drop |
| Tailwind CSS | 4 | Utility-first styling with WCAG-compliant theme |
| Lucide React | Latest | Icon library |
| nanoid | 5.x | Compact unique ID generation |
| Vitest | 4.x | Test runner |
| React Testing Library | 16.x | Component testing |
