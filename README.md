# Advanced Form Builder / Workflow Designer

A production-quality, enterprise-grade dynamic form builder built with React 19, TypeScript 5, and modern tooling. Users can create, configure, and persist complex forms with conditional logic, real-time validation, and drag-and-drop reordering -- all within a live inline preview backed by a real REST API (json-server).

## Quick Start

```bash
# Install dependencies
npm install

# Start the JSON Server API (Terminal 1)
npm run api

# Start the dev server (Terminal 2)
npm run dev

# Run the test suite
npm test

# Lint the codebase
npm run lint

# Type-check without building
npm run typecheck

# Full validation pipeline (typecheck + lint + test + build)
npm run validate

# Build for production
npm run build
```

## Features at a Glance

| Capability | Details |
|---|---|
| **Dynamic fields** | Add, remove, reorder (drag-and-drop) five field types: Text, Number, Select, Checkbox, Date |
| **Live inline preview** | Form renders in real time as fields are added -- read-only in build mode, interactive in view mode |
| **Conditional logic** | Show/hide fields and toggle required state based on another field's value (applied only in preview mode) |
| **Real-time validation** | Required checks, number ranges, regex patterns, date bounds, custom error messages |
| **Input sanitization** | Labels must contain at least one letter; special characters rejected; option values cannot be empty |
| **Type safety** | Strict TypeScript throughout; discriminated unions, `as const` objects, zero `any` |
| **REST API** | json-server provides a real REST API with endpoints for forms and submissions |
| **Persistence** | Save/load/edit/preview/delete form configurations; submitted values are stored and restored on re-open |
| **Export** | Download form configuration as a portable JSON file |
| **Build vs View mode** | Build mode: fields are read-only with drag handles and delete buttons. View mode: fields are interactive with a Submit button |
| **Theming** | Light (frosted glass) and dark mode with system-preference detection and localStorage persistence |
| **Responsive** | Adapts from mobile to wide desktop with a fluid layout |
| **WCAG accessibility** | Contrast-compliant colours, `prefers-reduced-motion` support, keyboard-accessible controls, ARIA labels, `focus-visible` outlines |
| **Centralized strings** | All UI labels, placeholders, messages, and ARIA labels in a single constants file -- i18n-ready |
| **Toast feedback** | Every user action (add/remove/reorder field, save, export, submit, reset, rule add/remove) triggers a toast notification |
| **Reusable components** | All UI elements use shared primitives: `Button`, `Input`, `Select`, `Checkbox`, `FieldWrapper`, `Card`, `SectionHeader`, `ErrorBanner`, `ToastContainer` |
| **Testing** | 53 tests covering validation logic, store behaviour, and component rendering |

---

## Architecture

The codebase follows a layered architecture that separates concerns cleanly. Each layer can be understood, tested, and evolved independently.

```
src/
├── types/              Type definitions (the "contract" layer)
├── constants/          Centralized UI labels, messages, env config
├── validation/         Pure-function validation engine
├── store/              Redux Toolkit state management
├── api/                REST API client (json-server)
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

**Types** (`types/`) -- Discriminated unions define every field shape. `FieldConfig` is a union of `TextFieldConfig | NumberFieldConfig | SelectFieldConfig | CheckboxFieldConfig | DateFieldConfig`. Conditional rules, validation results, and the serialisable `FormConfiguration` all live here.

**Constants** (`constants/`) -- All user-facing text centralized in `messages.ts` using `as const` objects: `ValidationMessages`, `ToastMessages`, `AppLabels`, `FormLabels`, `ButtonLabels`, `SectionLabels`, `FieldConfigLabels`, `PlaceholderTexts`, `EmptyStateTexts`, `AriaLabels`, `Themes`, `LogicOperators`. Environment-driven config (`API_BASE_URL`, `TEXT_MAX_LENGTH`, `THEME_STORAGE_KEY`) and constants (`TOAST_DURATION_MS`) in `config.ts`.

**Validation Engine** (`validation/engine.ts`) -- Pure functions: `isFieldVisible`, `isFieldRequired`, `validateField`, `validateAllFields`, `isFormValid`. No React dependency; reusable server-side.

**State Management** (`store/`) -- Redux Toolkit slice with Immer reducers. Thunks: `validateFormThunk`, `getFormConfigThunk`, `removeFieldThunk`. Typed hooks: `useAppSelector` / `useAppDispatch`. Helper: `normalizeFieldOrder`.

**API Client** (`api/mock-api.ts`) -- REST client backed by json-server. Centralized `ENDPOINTS` object, shared `request<T>()` helper, typed `FormSubmission` interface. Endpoints: `list`, `getById`, `save`, `remove`, `submitForm`, `getLastSubmission`.

**Hooks** (`hooks/`) -- `useTheme` manages light/dark mode with `useLayoutEffect`, system-preference detection, and localStorage persistence. `useToasts` manages ephemeral toast notifications with auto-dismiss.

**Utils** (`utils/`) -- `cn` merges class names. `createField` produces type-safe defaults with exhaustiveness checking. `sanitize` provides `hasMeaningfulContent` and `isValidLabel`. `form-actions` provides `downloadJson`, `exportAsJsonFile`, `validateFormName`, `validateFieldLabels`.

**UI Primitives** (`components/ui/`) -- `Button` (with `type="button"` default), `Input`, `Select`, `Checkbox`, `FieldWrapper`, `Card` (frosted glass panel), `SectionHeader` (uppercase section title), `ErrorBanner` (dismissible error alert), `ToastContainer`. All leaf components `memo`-wrapped with Tailwind utility classes (`ToastContainer` is a plain wrapper).

**Builder** (`components/builder/`) -- Field-type picker, per-field configurator with move up/down and remove controls, conditional-rule editor, saved-forms list with preview/edit/delete.

**Preview** (`components/preview/FormPreview.tsx`) -- Renders the form inline. Build mode: fields are read-only with drag handles and delete buttons. View mode: fields are interactive with conditional logic applied and a Submit button with loading state. Submitted values are stored via the API and restored on re-open.

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

### Named `as const` objects over enums

No runtime IIFE bloat, tree-shakeable, supports function-valued entries.

### Zero `any`

`strict: true`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`. ESLint `strict` config with `consistent-type-imports` enforced.

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
2. **On submit** -- `validateFormThunk` runs all fields; `submitForm` posts to the API if valid.
3. **On save** -- `validateFormName` and `validateFieldLabels` check names, labels, and option values.

### Conditional logic (preview mode only)

A `ConditionalRule` describes an action (`show`, `hide`, `require`, `unrequire`) to apply to a target field when a source field meets a condition. In build mode, all fields are always visible with their base required state. In preview mode, conditional rules are applied.

---

## Styling Approach

**Tailwind CSS v4** with custom `@theme` in `index.css`. Purpose-named colour scales: `primary`, `surface`, `danger`, `success`, `warning`.

- **Frosted glass light mode** -- `bg-white/70 backdrop-blur-lg` with semi-transparent borders
- **Dark mode** -- `@variant dark` with `dark` class on `<html>`. `useLayoutEffect` applies the saved theme before paint
- **WCAG AA** -- All text meets 4.5:1 contrast ratio. Inter with optical sizing
- **`prefers-reduced-motion`** -- Global media query disables animations/transitions
- **No `transition-all`** -- Each component transitions only specific properties
- **No `!important`** -- Higher specificity via `html *` selector instead
- **Reusable utility classes** -- `container-app`, `glass-header`, `list-item`, `divider`, `hover-on-group`, `hover-danger`, `sidebar-scroll`
- **Select chevron** -- Separate light/dark SVG data URIs

---

## Environment Configuration

All env reads centralized in `constants/config.ts`. Template in `.env.example`:

```
VITE_APP_HOST=localhost
VITE_APP_PORT=5173
VITE_API_BASE_URL=http://localhost:3001
VITE_TEXT_MAX_LENGTH=100
VITE_THEME_STORAGE_KEY=form_builder_theme
```

---

## Performance Considerations

| Technique | Rationale |
|---|---|
| `React.memo` on all leaf components | Prevents unnecessary re-renders |
| Redux Toolkit selectors | Components subscribe only to needed state slices |
| `@dnd-kit` pointer activation constraint | Drag initiates only after 8px movement |
| Single `FieldRenderer` switch | One component for all five types |
| Per-field validation on change | Only the changed field re-validates |
| No `transition-all` | Specific property transitions avoid expensive repaints |
| `prefers-reduced-motion` | Disables all animations for accessibility |
| `useLayoutEffect` for theme | Prevents flicker during theme toggle |
| `Button type="button"` default | Prevents accidental form submissions |

---

## Error Handling

- **Validation errors** -- Inline beneath fields with `role="alert"`
- **Save failures** -- Dismissible `ErrorBanner` with descriptive message
- **Field removal conflicts** -- Toast naming dependent conditional rules
- **Toast notifications** -- Every action triggers feedback; auto-dismiss with proper timer cleanup
- **Input sanitization** -- Labels require at least one letter, no special characters. Option values cannot be empty. Real-time inline error styling.
- **API errors** -- Typed `request<T>()` helper includes URL and status in error messages
- **localStorage resilience** -- All reads/writes wrapped in try/catch

---

## Trade-offs and Decisions

| Decision | Why | Alternative considered |
|---|---|---|
| **Redux Toolkit** over Zustand / plain Redux | `createSlice` with Immer; DevTools built-in; typed hooks | Zustand lighter but lacks DevTools; plain Redux needs more boilerplate |
| **json-server** for API | Real REST endpoints; data persisted in `db.json`; inspectable with curl/DevTools | localStorage is simpler but not a real API; MSW requires service worker setup |
| **localStorage** for theme | Persists across refreshes; simple synchronous read in `useLayoutEffect` | Cookie would work for SSR; IndexedDB is overkill for a single string |
| **Tailwind CSS v4** over CSS Modules | Utility-first with built-in dark mode; co-located styles | CSS Modules give scoped names but add files |
| **@dnd-kit** over react-beautiful-dnd | Actively maintained, accessible, modular | react-beautiful-dnd in maintenance mode |
| **Pure validation functions** over Zod/Yup | Dynamic user-defined rules; schema library adds indirection | Zod works for static schemas |
| **`as const` objects** over TypeScript `enum` | No runtime bloat, tree-shakeable, supports function values | Enums generate reverse mappings, can't hold functions |
| **Inline live preview** over separate preview mode | Real-time feedback; no context switching | Separate preview gives cleaner simulation but adds friction |
| **Reusable utility classes** in CSS | `divider`, `list-item`, `hover-danger` etc. eliminate duplication | Inline classes are explicit but verbose when repeated |
| **Reusable UI components** | `Card`, `SectionHeader`, `ErrorBanner` replace inline patterns | Inline is simpler for one-off usage but doesn't scale |

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
npm run lint          # ESLint (strict + consistent-type-imports)
npm run typecheck     # TypeScript check only
npm run validate      # Full pipeline: typecheck + lint + test + build
```

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI library |
| TypeScript | 5.9 | Static typing |
| Vite | 7 | Build tool, dev server |
| Redux Toolkit | 2.x | State management with Immer and DevTools |
| React-Redux | 9.x | Official React bindings |
| @dnd-kit | Latest | Accessible drag-and-drop |
| Tailwind CSS | 4 | Utility-first styling with WCAG-compliant theme |
| json-server | 1.x | REST API for forms and submissions |
| Lucide React | Latest | Icon library |
| nanoid | 5.x | Compact unique ID generation |
| Vitest | 4.x | Test runner |
| React Testing Library | 16.x | Component testing |
