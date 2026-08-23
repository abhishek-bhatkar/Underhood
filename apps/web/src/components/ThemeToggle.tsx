import { useTheme } from '../theme';

/** Segmented light/dark control; reuses the scenario-toggle styling. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="scenario-toggle" role="group" aria-label="Theme">
      <button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
        dark
      </button>
      <button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
        light
      </button>
    </div>
  );
}
