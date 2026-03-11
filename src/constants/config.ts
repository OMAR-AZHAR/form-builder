/** Environment-driven app configuration with sensible defaults. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export const TEXT_MAX_LENGTH = Number(
  import.meta.env.VITE_TEXT_MAX_LENGTH ?? 100,
);

export const THEME_STORAGE_KEY =
  import.meta.env.VITE_THEME_STORAGE_KEY ?? "form_builder_theme";

export const TOAST_DURATION_MS = 4000;
export const TOAST_EXIT_DELAY_MS = 200;
