# Advanced Form Builder / Workflow Designer

A production-quality, enterprise-grade dynamic form builder built with React 19, TypeScript 5, and modern tooling. Designed to let users create, configure, and persist complex forms with conditional logic, real-time validation, and drag-and-drop reordering — all within a live inline preview.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run the test suite
npm test

# Build for production
npm run build
```

## Features at a Glance

| Capability | Details |
|---|---|
| **Dynamic fields** | Add, remove, reorder (drag-and-drop) five field types: Text, Number, Select, Checkbox, Date |
| **Live inline preview** | The form renders in real time as you build it — no separate preview mode needed |
| **Conditional logic** | Show/hide fields and toggle required state based on other fields' values |
| **Real-time validation** | Required checks, number ranges, regex patterns, date bounds, meaningful-content checks, custom error messages |
| **Type safety** | Strict TypeScript throughout; discriminated unions, mapped types, zero `any` |
| **Persistence** | Save/load/edit form configurations via a simulated REST API backed by localStorage |
| **Export** | Download the form configuration as a portable JSON file |
| **Build vs View mode** | Building mode shows builder controls; loading a saved form shows the end-user experience with submit |
| **Theming** | Light and dark mode with system-preference detection |
| **Responsive** | Adapts from mobile to wide desktop with a fluid layout |
| **WCAG accessibility** | Contrast-compliant colours, keyboard-accessible controls, ARIA labels, focus-visible outlines |
| **Centralized strings** | All UI labels, placeholders, messages, and aria labels in a single constants file — i18n-ready |
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
├── hooks/              Shared React hooks (theming)
├── utils/              Utilities (classnames, field factory, sanitization)
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

**Types** (`types/`) — Discriminated unions define every field shape. `FieldConfig` is a union of `TextFieldConfig | NumberFieldConfig | SelectFieldConfig | CheckboxFieldConfig | DateFieldConfig`, so the compiler enforces that you cannot access `.options` on a text field or `.pattern` on a number field. Conditional rules, validation results, and the serialisable `FormConfiguration` all live here as well.

**Constants** (`constants/`) — All user-facing text is centralized in `messages.ts` using `as const` objects: `ValidationMessages`, `ToastMessages`, `AppLabels`, `FormLabels`, `ButtonLabels`, `SectionLabels`, `FieldConfigLabels`, `PlaceholderTexts`, `EmptyStateTexts`, and `AriaLabels`. Application config (`TEXT_MAX_LENGTH`) is read from environment variables via `config.ts`.

**Validation Engine** (`validation/engine.ts`) — A collection of pure functions with no React dependency. This is the single source of truth for "is this field visible?", "is this field required?", and "does this value satisfy the field's constraints?". Because they are pure functions operating on plain data, they are trivially testable and can be reused on a server if needed.

**State Management** (`store/`) — A Redux Toolkit slice holds the builder state: fields, conditions, form values, validation errors, and UI concerns like the selected field. Redux Toolkit was chosen because:

- `createSlice` with Immer provides concise, mutation-style reducers while preserving immutability.
- The Redux DevTools extension gives production-grade debugging out of the box.
- Typed hooks (`useAppSelector` / `useAppDispatch`) provide full TypeScript inference with minimal boilerplate.
- Thunks allow imperative operations (e.g. validate-and-return, read-latest-state) while keeping reducers pure.

**Mock API** (`api/mock-api.ts`) — A thin async layer with configurable latency (via `.env`). It mirrors a typical REST interface (`list`, `getById`, `save`, `remove`, `exportAsJson`) and stores data in `localStorage`. The storage key and simulated delay are read from environment variables. Swapping this for a real HTTP client is a single-file change.

**UI Primitives** (`components/ui/`) — `Button`, `Input`, `Select`, `Checkbox`, `FieldWrapper`, `Badge`, and `Toast`. Each is a `memo`-wrapped, prop-driven component with Tailwind utility classes. They accept standard HTML attributes via rest-spreading, so they compose naturally with forms, accessibility attributes, and event handlers.

**Field Renderer** (`components/fields/FieldRenderer.tsx`) — A single component that receives a `FieldConfig` and switches on `field.type` to render the correct UI primitive.

**Builder** (`components/builder/`) — The workspace. Contains the field-type picker, per-field configurator panel with move up/down controls, conditional-rule editor, and saved-forms list with load/edit/delete.

**Preview** (`components/preview/FormPreview.tsx`) — Renders the form inline as a live preview. In building mode, fields are read-only with drag-and-drop reordering and a gear icon to open configuration. In view mode (loaded form), fields are interactive with a submit button and full validation.

---

## TypeScript Strategy

### Discriminated unions over generics

Field configurations use a discriminated union keyed on the `type` property:

```typescript
export type FieldConfig =
  | TextFieldConfig    // type: "text"
  | NumberFieldConfig  // type: "number"
  | SelectFieldConfig  // type: "select"
  | CheckboxFieldConfig // type: "checkbox"
  | DateFieldConfig;   // type: "date"
```

When you switch on `field.type`, TypeScript narrows the type automatically, giving you access to type-specific properties like `validation.pattern` (text) or `options` (select) without any casting.

### Named `as const` objects over enums

All domain values use `as const` objects with named keys:

```typescript
export const FieldTypes = {
  Text: "text",
  Number: "number",
  // ...
} as const;
```

This provides the same autocomplete and refactoring safety as enums but without the runtime IIFE bloat, reverse mappings, or tree-shaking issues. Function-valued entries (e.g. parameterised validation messages) are supported naturally.

### Mapped types for field-to-value mapping

`FieldValueMap` and `FieldConfigMap` let you look up the value or config type for a given field type at the type level.

### Zero `any`

The `tsconfig.app.json` enables `strict: true`, `noUnusedLocals`, and `noUnusedParameters`. The entire codebase compiles with zero `any` usages.

---

## Validation and Conditional Logic

### Validation pipeline

Each field type has its own validation branch in `validateField()`:

| Field type | Checks |
|---|---|
| Text | required, meaningful content, minLength, maxLength, regex pattern |
| Number | required, NaN guard, min, max |
| Select | required (non-empty selection) |
| Checkbox | required (must be checked) |
| Date | required, minDate, maxDate |

Validation runs in two contexts:

1. **Real-time** — Every keystroke triggers `setFormValue`, which validates that single field and updates the error map immediately.
2. **On submit** — `validateForm()` runs all fields at once and prevents submission if any fail.

Additionally, form-level validation at save time checks that all field labels contain meaningful content (rejecting gibberish like `,,,,` or `////`).

### Conditional logic

A `ConditionalRule` describes an action (`show`, `hide`, `require`, `unrequire`) to apply to a target field when one or more source-field conditions are met. Conditions support operators like `equals`, `not_equals`, `contains`, `greater_than`, `less_than`, `is_checked`, and `is_not_checked`, combined with `AND` or `OR` logic.

The validation engine checks visibility before validation — hidden fields are automatically excluded from validation, which prevents phantom errors on fields the user cannot see.

### Safety guardrails

Removing a field that is referenced as a condition source on *another* field is blocked with a descriptive error. This prevents broken conditional rules. The user must remove the dependent rules first.

---

## Styling Approach

The project uses **Tailwind CSS v4** with a custom theme defined in `index.css` using the `@theme` directive. The palette is built around purpose-named colour scales:

- `primary` — Actions and focus rings
- `surface` — Neutrals for backgrounds, borders, and text
- `danger` / `success` / `warning` — Semantic feedback

Dark mode is controlled via the `dark` class on `<html>` (configured with `@variant dark`), toggled by a React hook that persists the preference to `localStorage` and respects the system preference on first visit.

All text colours meet **WCAG AA contrast ratios** (4.5:1 minimum for normal text). Inter is loaded with optical sizing for improved readability at small sizes.

Every UI primitive is self-contained — it applies its own light/dark variants, focus states, disabled styles, and error states through conditional Tailwind classes composed by a lightweight `cn()` utility.

---

## Environment Configuration

Application settings are managed via `.env` (excluded from version control). A `.env.example` template is provided:

```
VITE_APP_HOST=localhost
VITE_APP_PORT=5173
VITE_STORAGE_KEY=form_builder_configurations
VITE_API_SIMULATED_DELAY=600
VITE_TEXT_MAX_LENGTH=100
```

---

## Performance Considerations

| Technique | Rationale |
|---|---|
| `React.memo` on all leaf components | Prevents re-renders when parent state changes but a component's own props haven't. |
| Redux Toolkit selectors | `useAppSelector` ensures components subscribe only to the slices of state they need. Stable `dispatch` references keep memoized callbacks stable. |
| `@dnd-kit` pointer activation constraint | Drag is only initiated after 8px of movement, preventing accidental drags and wasted layout recalculations. |
| Single `FieldRenderer` switch | One component handles all five types, avoiding unnecessary mount/unmount cycles when field type doesn't change. |
| Validation per-field on change | Only the changed field is re-validated on each keystroke. Full-form validation only runs on explicit submit. |

---

## Error Handling

- **Validation errors** appear inline beneath the relevant field with `role="alert"` for screen readers.
- **Save failures** show a dismissible banner with a descriptive message.
- **Field removal conflicts** surface a specific message naming the fields that depend on the one being removed.
- **Toast notifications** provide ephemeral feedback for save success, export, form load, and errors. They auto-dismiss after 4 seconds with a smooth exit animation.
- **Input sanitization** rejects gibberish-only values (no alphanumeric characters) for form names and field labels at save time.

---

## Trade-offs and Decisions

| Decision | Why | Alternative considered |
|---|---|---|
| **Redux Toolkit** over Zustand / plain Redux | `createSlice` eliminates action-constant boilerplate; Immer enables ergonomic immutable updates; DevTools and middleware are built-in | Zustand is lighter but lacks DevTools and middleware ecosystem; plain Redux requires significantly more boilerplate |
| **Tailwind CSS v4** over CSS Modules | Utility-first approach with built-in dark mode; co-located styles reduce context switching | CSS Modules would give scoped class names but add more files |
| **@dnd-kit** over react-beautiful-dnd | Actively maintained, accessible, modular, and lighter | react-beautiful-dnd is in maintenance mode |
| **Pure validation functions** over a schema library (Zod/Yup) | Field rules are dynamic and user-defined at runtime; a schema library adds indirection without benefit here | Zod would work well if schemas were static |
| **localStorage mock API** over MSW | Simpler setup for a standalone demo; no service worker configuration required | MSW would be better for testing HTTP-layer concerns |
| **Single slice** over multiple slices | The form builder state is inherently connected — field edits affect conditions, conditions affect validation | Splitting would introduce synchronisation overhead |
| **`as const` objects** over TypeScript `enum` | No runtime IIFE bloat, tree-shakeable, supports function values (e.g. parameterised validation messages), and recommended by the TypeScript team | Enums generate reverse-mapping wrappers, can't hold functions, and aren't dead-code eliminated |
| **Inline live preview** over separate preview mode | Users see the form taking shape in real time; no context switching between builder and preview screens | Separate preview gives a cleaner end-user simulation but adds friction |

---

## Testing

The test suite covers three layers:

| Suite | File | Tests | What it verifies |
|---|---|---|---|
| Validation engine | `validation/engine.test.ts` | 32 | Required checks, text/number/date/checkbox rules, conditional visibility, conditional required, whole-form validation |
| Store | `store/form-builder-slice.test.ts` | 9 | Field CRUD, reordering, condition management, real-time validation, config export/import |
| Field rendering | `components/fields/FieldRenderer.test.tsx` | 12 | Correct input types rendered, label/placeholder display, onChange callbacks, error display, disabled state |

Run with:

```bash
npm test              # Single run
npm run test:watch    # Watch mode
```

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| TypeScript | 5.9 | Static typing |
| Vite | 7 | Build tool and dev server |
| Redux Toolkit | Latest | State management with `createSlice`, Immer, and DevTools |
| React-Redux | Latest | Official React bindings for Redux |
| @dnd-kit | Latest | Accessible drag-and-drop |
| Tailwind CSS | 4 | Utility-first styling with WCAG-compliant theme |
| Lucide React | Latest | Icon library |
| nanoid | Latest | Compact unique ID generation |
| Vitest | Latest | Test runner |
| React Testing Library | Latest | Component testing |
