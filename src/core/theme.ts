export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'fractalab-theme';
const listeners = new Set<(theme: Theme) => void>();

export function getTheme(): Theme {
  const v = document.documentElement.dataset.theme;
  return v === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#05060a' : '#f7f5f0');
  listeners.forEach((fn) => fn(theme));
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function onThemeChange(fn: (theme: Theme) => void): void {
  listeners.add(fn);
}

/** Resolve a CSS custom property to its computed value (e.g. `rgb(...)`). */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Resolved visualization palette for canvas renderers (theme-aware). */
export interface VizPalette {
  bg: string;
  grid: string;
  ink: string;
  cyan: string;
  amber: string;
  rose: string;
  emerald: string;
  violet: string;
}

export function viz(): VizPalette {
  return {
    bg: cssVar('--viz-bg'),
    grid: cssVar('--viz-grid'),
    ink: cssVar('--viz-ink'),
    cyan: cssVar('--viz-cyan'),
    amber: cssVar('--viz-amber'),
    rose: cssVar('--viz-rose'),
    emerald: cssVar('--viz-emerald'),
    violet: cssVar('--viz-violet'),
  };
}
