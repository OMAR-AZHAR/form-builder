import { useState, useLayoutEffect, useCallback } from "react";
import { Themes, type Theme } from "@/constants/messages";
import { THEME_STORAGE_KEY } from "@/constants/config";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return Themes.Light;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === Themes.Dark || stored === Themes.Light) return stored;
  } catch {
    /* private mode / storage unavailable */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? Themes.Dark
    : Themes.Light;
}

/** Theme state with localStorage persistence, system preference fallback, and zero-flash on reload. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Sync DOM class before paint to prevent flash of wrong theme during toggles.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle(Themes.Dark, theme === Themes.Dark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* private mode / storage unavailable */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === Themes.Light ? Themes.Dark : Themes.Light));
  }, []);

  return { theme, toggleTheme } as const;
}
