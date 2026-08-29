import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import App from './App';
import { catalogTotals } from './components/Home';

afterEach(() => {
  cleanup();
  window.location.hash = '';
});

describe('App routing', () => {
  it('catalog totals include experiences from every registered topic', () => {
    const experience = (events: number) =>
      ({ scenarios: { primary: { events: Array.from({ length: events }) } } }) as never;

    expect(catalogTotals([experience(2), experience(1)])).toEqual({
      scenarios: 2,
      events: 3,
    });
  });

  it('home groups systems and algorithms catalog sections', () => {
    window.location.hash = '';
    render(<App />);
    expect(screen.getByText('docker')).toBeTruthy();
    expect(screen.getByText('SYSTEMS')).toBeTruthy();
    expect(screen.getByText('ALGORITHMS & DATA STRUCTURES')).toBeTruthy();
    expect(screen.getByText(/watch it work/i)).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(
      /Don't just read how it works/i,
    );
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBe(10);
  });

  it('home exposes one Arrays topic card and preserves the nine Systems experiences', () => {
    window.location.hash = '';
    render(<App />);
    expect(screen.getByRole('link', { name: /Arrays/i }).getAttribute('href')).toBe(
      '#/arrays/traversal',
    );
    expect(screen.getAllByTestId('systems-experience-card')).toHaveLength(9);
  });

  it('Array experience header links navigate among all five Array experiences', () => {
    window.location.hash = '#/arrays/traversal';
    render(<App />);
    const links = screen.getAllByTestId('topic-experience-link');
    expect(links).toHaveLength(5);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#/arrays/traversal',
      '#/arrays/insert-delete',
      '#/arrays/two-pointers',
      '#/arrays/prefix-sum',
      '#/arrays/kadanes-algorithm',
    ]);
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

  it('theme toggle switches the document theme and persists it', () => {
    window.location.hash = '';
    localStorage.removeItem('underhood-theme');
    render(<App />);
    const switchToLight = screen.getByRole('button', { name: 'Switch to light theme' });
    expect(switchToLight.querySelector('[aria-hidden="true"]')?.textContent).toBe('☀');
    fireEvent.click(switchToLight);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('underhood-theme')).toBe('light');
    const switchToDark = screen.getByRole('button', { name: 'Switch to dark theme' });
    expect(switchToDark.querySelector('[aria-hidden="true"]')?.textContent).toBe('☾');
    fireEvent.click(switchToDark);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('underhood-theme')).toBe('dark');
  });
});
