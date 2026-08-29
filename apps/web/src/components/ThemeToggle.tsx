import { useTheme } from '../theme';

/** Single-button theme switch with a visible icon and an accessible action label. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  return (
    <div className="scenario-toggle theme-toggle" role="group" aria-label="Theme">
      <button
        aria-label={`Switch to ${nextTheme} theme`}
        title={`Switch to ${nextTheme} theme`}
        onClick={() => setTheme(nextTheme)}
      >
        <span aria-hidden="true" className="theme-icon">{nextTheme === 'light' ? '☀' : '☾'}</span>
      </button>
    </div>
  );
}
