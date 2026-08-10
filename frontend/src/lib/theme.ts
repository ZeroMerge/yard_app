import { useEffect, useState } from "react";

const KEY = "creatoryard:theme";
export type Theme = "light" | "dark";

const apply = (t: Theme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(KEY) as Theme | null;
  return stored === "dark" ? "dark" : "light";
};

export const initTheme = (): Theme => {
  const t = getStoredTheme();
  apply(t);
  return t;
};

export const setGlobalTheme = (t: Theme) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, t);
  apply(t);
  window.dispatchEvent(new CustomEvent("yard-theme-change", { detail: t }));
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    apply(theme);
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      }
    };
    window.addEventListener("yard-theme-change", handler);
    return () => window.removeEventListener("yard-theme-change", handler);
  }, [theme]);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setGlobalTheme(next);
  };

  const setTheme = (t: Theme) => {
    setGlobalTheme(t);
  };

  return { theme, toggle, setTheme };
};
