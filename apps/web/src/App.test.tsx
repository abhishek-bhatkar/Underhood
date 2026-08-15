import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

describe('App', () => {
  it('steps forward with the Next control', () => {
    render(<App />);
    const next = screen.getByRole('button', { name: 'Step forward' });
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByTestId('step-counter').textContent).toMatch(/step 3 \/ 15/);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toMatch(
      /daemon looks for the image locally/i,
    );
  });

  it('steps back to the empty state and disables prev/restart there', () => {
    render(<App />);
    const next = screen.getByRole('button', { name: 'Step forward' });
    fireEvent.click(next);
    fireEvent.click(screen.getByRole('button', { name: 'Step back' }));
    expect(screen.getByText(/press play/i)).not.toBeNull();
    expect((screen.getByRole('button', { name: 'Step back' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Restart' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('scrubbing a timeline tick seeks and updates the explanation', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Step 12:/i }));
    expect(screen.getByTestId('step-counter').textContent).toMatch(/step 12 \/ 15/);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toMatch(/Container created/i);
  });

  it('switching to the cached scenario gives an 8-step simulation', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Image cached' }));
    fireEvent.click(screen.getByRole('button', { name: 'Step forward' }));
    expect(screen.getByTestId('step-counter').textContent).toMatch(/step 1 \/ 8/);
  });

  it('inspecting the container shows concept content and live state', () => {
    render(<App />);
    // Advance to CONTAINER_RUNNING (last event of the pull scenario).
    fireEvent.click(screen.getByRole('button', { name: /^Step 15:/i }));
    // Click the created Container node on the canvas.
    const containerNode =
      screen.getByText("writable layer (container's own)").closest('.react-flow__node') ?? document.body;
    fireEvent.click(containerNode);
    const inspector = screen.getByText(/isolated set of processes/i).closest('section');
    expect(inspector?.textContent).toMatch(/Container/);
    expect(inspector?.textContent).toMatch(/nginx: master process/);
    expect(inspector?.textContent).toMatch(/172\.17\.0\.2/);
  });
});
