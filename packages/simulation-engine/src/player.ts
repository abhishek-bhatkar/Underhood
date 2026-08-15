import { deriveState } from './fold';
import type { ComponentInit, SimulationEvent, SimulationState } from './types';

export type PlayerStatus = 'idle' | 'playing' | 'paused' | 'ended';

export interface PlayerSnapshot {
  status: PlayerStatus;
  /** Index of the last applied event; -1 = nothing applied yet. */
  currentStep: number;
  /** One of 0.5 | 1 | 2 | 4. */
  speed: number;
  state: SimulationState;
}

/**
 * Framework-agnostic playback controller over a deterministic event list.
 * State is always deriveState(events, currentStep) — rewind is free.
 *
 * Timing: when event N is applied, the player waits events[N].duration/speed
 * before applying event N+1. Changing speed mid-wait re-arms the full
 * duration of the current event at the new speed.
 */
export class SimulationPlayer {
  private readonly events: SimulationEvent[];
  private readonly initial: ComponentInit[];
  private readonly listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private snap: PlayerSnapshot;

  constructor(events: SimulationEvent[], initial: ComponentInit[] = []) {
    this.events = events;
    this.initial = initial;
    this.snap = { status: 'idle', currentStep: -1, speed: 1, state: deriveState(events, -1, initial) };
  }

  getSnapshot(): PlayerSnapshot {
    return this.snap;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  play(): void {
    if (this.snap.status === 'ended') return;
    const { currentStep } = this.snap;
    if (currentStep === -1) {
      // Fresh start: apply the first event immediately.
      this.snap = this.rebuild(0, this.events.length ? 'playing' : 'ended');
      this.afterAdvance();
    } else if (currentStep >= this.events.length - 1) {
      this.snap = this.rebuild(currentStep, 'ended');
    } else {
      this.snap = this.rebuild(currentStep, 'playing');
      this.scheduleNext();
    }
    this.emit();
  }

  pause(): void {
    this.clearTimer();
    if (this.snap.status !== 'ended') {
      this.snap = this.rebuild(this.snap.currentStep, this.snap.currentStep === -1 ? 'idle' : 'paused');
      this.emit();
    }
  }

  next(): void {
    if (this.snap.currentStep >= this.events.length - 1) return;
    this.clearTimer();
    const nextStep = this.snap.currentStep + 1;
    const status = nextStep === this.events.length - 1 ? 'ended' : this.snap.status === 'playing' ? 'playing' : 'paused';
    this.snap = this.rebuild(nextStep, status);
    this.afterAdvance();
    this.emit();
  }

  prev(): void {
    this.clearTimer();
    const prevStep = Math.max(this.snap.currentStep - 1, -1);
    this.snap = this.rebuild(prevStep, prevStep === -1 ? 'idle' : 'paused');
    this.emit();
  }

  seek(step: number): void {
    this.clearTimer();
    const clamped = Math.max(-1, Math.min(step, this.events.length - 1));
    this.snap = this.rebuild(clamped, clamped === -1 ? 'idle' : 'paused');
    this.emit();
  }

  restart(): void {
    this.clearTimer();
    this.snap = this.rebuild(-1, 'idle');
    this.emit();
  }

  setSpeed(speed: number): void {
    this.snap = this.rebuild(this.snap.currentStep, this.snap.status, speed);
    if (this.snap.status === 'playing') this.scheduleNext();
    this.emit();
  }

  destroy(): void {
    this.clearTimer();
    this.listeners.clear();
  }

  private rebuild(currentStep: number, status: PlayerStatus, speed = this.snap.speed): PlayerSnapshot {
    return { status, currentStep, speed, state: deriveState(this.events, currentStep, this.initial) };
  }

  /** Post-advance bookkeeping: end at the last event, otherwise keep waiting. */
  private afterAdvance(): void {
    if (this.snap.currentStep >= this.events.length - 1) {
      this.clearTimer();
      this.snap = this.rebuild(this.snap.currentStep, 'ended');
    } else if (this.snap.status === 'playing') {
      this.scheduleNext();
    }
  }

  private scheduleNext(): void {
    this.clearTimer();
    const current = this.events[this.snap.currentStep];
    if (!current) return;
    const wait = current.duration / this.snap.speed;
    this.timer = setTimeout(() => {
      if (this.snap.status !== 'playing') return;
      const nextStep = this.snap.currentStep + 1;
      this.snap = this.rebuild(nextStep, 'playing');
      this.afterAdvance();
      this.emit();
    }, wait);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }
}
