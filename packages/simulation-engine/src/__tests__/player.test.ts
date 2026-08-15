import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SimulationPlayer } from '../player';
import { makeEvent } from '../fold';

const events = [
  makeEvent(0, 'COMMAND_ENTERED', {
    duration: 1000,
    source: 'terminal',
    target: 'cli',
    payload: { command: 'docker run nginx' },
    effects: [
      { op: 'set', component: 'terminal', data: { command: '$payload.command' } },
      { op: 'log', text: '$ $payload.command' },
    ],
  }),
  makeEvent(1, 'CLI_REQUEST', { duration: 1000, source: 'cli', target: 'daemon' }),
  makeEvent(2, 'IMAGE_LOOKUP', {
    duration: 1000,
    source: 'daemon',
    target: 'image-store',
    effects: [{ op: 'status', component: 'image-store', status: 'active' }],
  }),
];

describe('SimulationPlayer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts idle at step -1 with empty state', () => {
    const p = new SimulationPlayer(events, [{ id: 'terminal' }, { id: 'cli' }]);
    expect(p.getSnapshot()).toMatchObject({ status: 'idle', currentStep: -1, speed: 1 });
    expect(p.getSnapshot().state.components.terminal.data.command).toBeUndefined();
  });

  it('next() applies one event; prev() steps back to -1', () => {
    const p = new SimulationPlayer(events, [{ id: 'terminal' }, { id: 'cli' }]);
    p.next();
    expect(p.getSnapshot().currentStep).toBe(0);
    expect(p.getSnapshot().state.components.terminal.data.command).toBe('docker run nginx');
    p.next();
    expect(p.getSnapshot().currentStep).toBe(1);
    p.prev();
    expect(p.getSnapshot().currentStep).toBe(0);
    p.prev();
    expect(p.getSnapshot().currentStep).toBe(-1);
  });

  it('next() at the end is a no-op; play() at the end does not wrap', () => {
    const p = new SimulationPlayer(events);
    p.seek(events.length - 1);
    p.play();
    vi.advanceTimersByTime(10_000);
    p.next();
    expect(p.getSnapshot().currentStep).toBe(events.length - 1);
    expect(p.getSnapshot().status).toBe('ended');
  });

  it('play() auto-advances respecting durations', () => {
    const p = new SimulationPlayer(events);
    p.play();
    expect(p.getSnapshot().currentStep).toBe(0); // first event applies immediately
    vi.advanceTimersByTime(999);
    expect(p.getSnapshot().currentStep).toBe(0);
    vi.advanceTimersByTime(1);
    expect(p.getSnapshot().currentStep).toBe(1);
    vi.advanceTimersByTime(2000);
    expect(p.getSnapshot().currentStep).toBe(2);
    expect(p.getSnapshot().status).toBe('ended');
  });

  it('pause() freezes; play() resumes from where it stopped', () => {
    const p = new SimulationPlayer(events);
    p.play();
    vi.advanceTimersByTime(1000); // now at step 1, waiting 1000ms for step 2
    p.pause();
    vi.advanceTimersByTime(5000);
    expect(p.getSnapshot().currentStep).toBe(1);
    expect(p.getSnapshot().status).toBe('paused');
    p.play();
    expect(p.getSnapshot().status).toBe('playing');
    vi.advanceTimersByTime(1000);
    expect(p.getSnapshot().currentStep).toBe(2);
  });

  it('setSpeed(2) halves the wait before the next event', () => {
    const p = new SimulationPlayer(events);
    p.play();
    p.setSpeed(2);
    vi.advanceTimersByTime(500); // 1000ms / 2x
    expect(p.getSnapshot().currentStep).toBe(1);
  });

  it('setSpeed mid-wait re-arms the current wait with the new speed', () => {
    const p = new SimulationPlayer(events);
    p.play(); // step 0 applied, wait 1000ms for step 1
    vi.advanceTimersByTime(500);
    p.setSpeed(4); // remaining wait becomes 250ms (full duration re-armed at 4x)
    vi.advanceTimersByTime(249);
    expect(p.getSnapshot().currentStep).toBe(0);
    vi.advanceTimersByTime(1);
    expect(p.getSnapshot().currentStep).toBe(1);
  });

  it('seek() produces state equal to deriveState at that index', () => {
    const p = new SimulationPlayer(events);
    p.seek(2);
    expect(p.getSnapshot().currentStep).toBe(2);
    expect(p.getSnapshot().state.components['image-store'].status).toBe('active');
    p.seek(0);
    // Event 2 never applied, so the component was never referenced either.
    expect(p.getSnapshot().state.components['image-store']).toBeUndefined();
    expect(p.getSnapshot().status).toBe('paused');
  });

  it('seek() clamps out-of-range indices', () => {
    const p = new SimulationPlayer(events);
    p.seek(99);
    expect(p.getSnapshot().currentStep).toBe(events.length - 1);
    p.seek(-42);
    expect(p.getSnapshot().currentStep).toBe(-1);
  });

  it('restart() resets to idle with empty state', () => {
    const p = new SimulationPlayer(events);
    p.seek(2);
    p.restart();
    expect(p.getSnapshot()).toMatchObject({ status: 'idle', currentStep: -1 });
    expect(p.getSnapshot().state.log).toHaveLength(0);
  });

  it('getSnapshot() is referentially stable until state changes', () => {
    const p = new SimulationPlayer(events);
    const a = p.getSnapshot();
    const b = p.getSnapshot();
    expect(a).toBe(b);
    p.next();
    expect(p.getSnapshot()).not.toBe(a);
  });

  it('subscribe() fires on next() and unsubscribes cleanly', () => {
    const p = new SimulationPlayer(events);
    const fn = vi.fn();
    const off = p.subscribe(fn);
    p.next();
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    p.next();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('destroy() clears pending timers', () => {
    const p = new SimulationPlayer(events);
    p.play();
    p.destroy();
    vi.advanceTimersByTime(10_000);
    expect(p.getSnapshot().currentStep).toBe(0);
  });
});
