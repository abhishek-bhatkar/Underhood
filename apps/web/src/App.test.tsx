import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App';

afterEach(() => {
  cleanup();
  window.location.hash = '';
});

describe('App routing', () => {
  it('home lists topics with the hero', () => {
    window.location.hash = '';
    render(<App />);
    expect(screen.getByText('Docker')).toBeTruthy();
    expect(screen.getByText(/watch it work/i)).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
      /Don't just read how it works/i,
    );
  });

  it('docker experience steps through events', () => {
    window.location.hash = '#/docker/docker-run';
    render(<App />);
    const next = screen.getByRole('button', { name: 'Step forward' });
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByTestId('step-counter').textContent).toMatch(/step 3 \/ 15/);
  });

  it('docker scenario toggle still works', () => {
    window.location.hash = '#/docker/docker-run';
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Image cached' }));
    fireEvent.click(screen.getByRole('button', { name: 'Step forward' }));
    expect(screen.getByTestId('step-counter').textContent).toMatch(/step 1 \/ 8/);
  });

  it('jvm experience renders via hash', () => {
    window.location.hash = '#/jvm/run-java';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Java program/i);
  });
});
