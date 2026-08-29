import { describe, it, expect } from 'vitest';
import { deriveState, makeEvent } from '../fold';
import type { Effect } from '../types';

const fx = (effects: Effect[], extra: Record<string, unknown> = {}) => ({
  effects,
  payload: extra.payload as Record<string, unknown> | undefined,
});

describe('deriveState (declarative effects)', () => {
  it('initial state: currentStep -1, components from init list, empty log', () => {
    const events = [makeEvent(0, 'ANY', { effects: [{ op: 'log', text: 'x' }] })];
    const s = deriveState(events, -1, [
      { id: 'terminal' },
      { id: 'container', initial: 'absent' },
    ]);
    expect(s.currentStep).toBe(-1);
    expect(s.log).toHaveLength(0);
    expect(s.components.terminal.status).toBe('idle');
    expect(s.components.container.status).toBe('absent');
    expect(s.components['no-such']).toBeUndefined();
  });

  it('preserves declarative component data before the first event', () => {
    const state = deriveState([], -1, [
      { id: 'array', data: { cells: [{ value: 10 }, { value: 20 }] } },
    ]);

    expect(state.components.array.data.cells).toEqual([{ value: 10 }, { value: 20 }]);
  });

  it('status/label/set/log effects mutate the named component', () => {
    const events = [
      makeEvent(0, 'COMMAND_ENTERED', {
        source: 'terminal',
        target: 'cli',
        payload: { command: 'docker run nginx' },
        effects: [
          { op: 'set', component: 'terminal', data: { command: '$payload.command' } },
          { op: 'status', component: 'terminal', status: 'done' },
          { op: 'status', component: 'cli', status: 'active' },
          { op: 'label', component: 'cli', text: 'parsing command' },
          { op: 'log', text: '$ $payload.command' },
        ],
      }),
    ];
    const s = deriveState(events, 0);
    expect(s.components.terminal.data.command).toBe('docker run nginx');
    expect(s.components.terminal.status).toBe('done');
    expect(s.components.cli.status).toBe('active');
    expect(s.components.cli.label).toBe('parsing command');
    expect(s.log.at(-1)?.text).toBe('$ docker run nginx');
  });

  it('label without text clears the label', () => {
    const events = [
      makeEvent(0, 'A', { effects: [{ op: 'label', component: 'cli', text: 'busy' }] }),
      makeEvent(1, 'B', { effects: [{ op: 'label', component: 'cli' }] }),
    ];
    const s = deriveState(events, 1);
    expect(s.components.cli.label).toBeUndefined();
  });

  it('push accumulates array items in order; templates interpolate in values', () => {
    const events = [
      makeEvent(0, 'PULL_1', {
        payload: { layerIndex: 1, name: 'base image', digest: 'aaa' },
        effects: [
          { op: 'push', component: 'store', key: 'layers', value: { name: '$payload.name', digest: '$payload.digest' } },
        ],
      }),
      makeEvent(1, 'PULL_2', {
        payload: { layerIndex: 2, name: 'binaries', digest: 'bbb' },
        effects: [
          { op: 'push', component: 'store', key: 'layers', value: { name: '$payload.name', digest: '$payload.digest' } },
        ],
      }),
    ];
    const s = deriveState(events, 1, [{ id: 'store' }]);
    expect(s.components.store.data.layers).toEqual([
      { name: 'base image', digest: 'aaa' },
      { name: 'binaries', digest: 'bbb' },
    ]);
  });

  it('pop removes the last item; remove drops the first matching item', () => {
    const events = [
      makeEvent(0, 'PUSH_A', {
        effects: [
          { op: 'push', component: 'st', key: 'frames', value: { method: 'main' } },
          { op: 'push', component: 'st', key: 'frames', value: { method: 'compute' } },
        ],
      }),
      makeEvent(1, 'POP', { effects: [{ op: 'pop', component: 'st', key: 'frames' }] }),
      makeEvent(2, 'RM', {
        effects: [{ op: 'remove', component: 'st', key: 'frames', match: { method: 'main' } }],
      }),
    ];
    const afterPop = deriveState(events, 1, [{ id: 'st' }]);
    expect(afterPop.components.st.data.frames).toEqual([{ method: 'main' }]);
    const afterRemove = deriveState(events, 2, [{ id: 'st' }]);
    expect(afterRemove.components.st.data.frames).toEqual([]);
  });

  it('templates: missing payload keys render empty; unreferenced components auto-create idle', () => {
    const events = [
      makeEvent(0, 'X', {
        effects: [
          { op: 'label', component: 'ghost', text: 'v=$payload.nope' },
          { op: 'log', text: 'log $payload.nope end' },
        ],
      }),
    ];
    const s = deriveState(events, 0);
    expect(s.components.ghost).toMatchObject({ id: 'ghost', status: 'idle' });
    expect(s.components.ghost.label).toBe('v=');
    expect(s.log.at(-1)?.text).toBe('log  end');
  });

  it('events without effects still advance currentStep', () => {
    const events = [makeEvent(0, 'SILENT'), makeEvent(1, 'ALSO_SILENT')];
    const s = deriveState(events, 1);
    expect(s.currentStep).toBe(1);
    expect(s.log).toHaveLength(0);
  });

  it('error status is representable', () => {
    const events = [
      makeEvent(0, 'BOOM', {
        effects: [
          { op: 'status', component: 'st', status: 'error' },
          { op: 'label', component: 'st', text: 'StackOverflowError' },
        ],
      }),
    ];
    const s = deriveState(events, 0, [{ id: 'st' }]);
    expect(s.components.st.status).toBe('error');
  });

  it('pure: folding to an earlier index discards later effects', () => {
    const events = [
      makeEvent(0, 'A', { effects: [{ op: 'set', component: 'cli', data: { n: 1 } }] }),
      makeEvent(1, 'B', { effects: [{ op: 'set', component: 'cli', data: { n: 2 } }] }),
    ];
    expect(deriveState(events, 0).components.cli.data.n).toBe(1);
    expect(deriveState(events, 1).components.cli.data.n).toBe(2);
  });
});
