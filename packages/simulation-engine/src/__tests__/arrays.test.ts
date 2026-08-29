import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveState } from '../fold';
import {
  materializeEvents,
  parseConceptsYaml,
  parseOverviewYaml,
  parseSimulationYaml,
} from '../scenario';

const contentDir = resolve(__dirname, '../../../../content/arrays/traversal');
const simulation = () => readFileSync(resolve(contentDir, 'simulation.yaml'), 'utf8');
const insertDeleteDir = resolve(__dirname, '../../../../content/arrays/insert-delete');
const insertDelete = (name: string) => readFileSync(resolve(insertDeleteDir, name), 'utf8');
const twoPointersDir = resolve(__dirname, '../../../../content/arrays/two-pointers');
const prefixSumDir = resolve(__dirname, '../../../../content/arrays/prefix-sum');
const kadanesDir = resolve(__dirname, '../../../../content/arrays/kadanes-algorithm');
const readFrom = (directory: string, name: string) => readFileSync(resolve(directory, name), 'utf8');

describe('arrays traversal content', () => {
  it('reads every complete-array element and exposes O(1)/O(n)/O(1) live state', () => {
    const [complete] = parseSimulationYaml(simulation());
    const events = materializeEvents(complete);
    const reads = events.filter((event) => event.type === 'READ');

    expect(reads).toHaveLength(5);
    expect(reads.map((event) => event.payload?.index)).toEqual([0, 1, 2, 3, 4]);
    expect(reads.map((event) => event.payload?.value)).toEqual([10, 20, 30, 40, 50]);

    const mid = deriveState(events, 2, complete.components);
    expect(mid.components.array).toMatchObject({
      status: 'active',
      data: { index: 2, value: 30, operations: 3 },
    });
    expect(mid.components.complexity.data).toMatchObject({ access: 'O(1)', time: 'O(n)', space: 'O(1)' });

    const final = deriveState(events, events.length - 1, complete.components);
    expect(final.components.array).toMatchObject({
      status: 'done',
      data: { index: 5, value: null, operations: 5 },
    });
    expect(final.components.array.data.cells).toEqual([
      { value: 10, state: 'read' },
      { value: 20, state: 'read' },
      { value: 30, state: 'read' },
      { value: 40, state: 'read' },
      { value: 50, state: 'read' },
    ]);
  });

  it('terminates an empty array without reading an invalid index', () => {
    const empty = parseSimulationYaml(simulation()).find((scenario) => scenario.id === 'empty')!;
    const events = materializeEvents(empty);

    expect(events.map((event) => event.type)).toEqual([
      'CHECK_LENGTH',
      'EMPTY_ARRAY_GUARD',
      'SKIP_READ',
      'TERMINATE',
      'EMPTY_ARRAY',
    ]);
    expect(events.every((event) => event.type !== 'READ')).toBe(true);
    expect(events.at(-1)?.payload).toMatchObject({ index: null, value: null });

    const state = deriveState(events, events.length - 1, empty.components);
    expect(state.currentStep).toBe(4);
    expect(state.components.array).toMatchObject({
      status: 'done',
      data: { index: null, value: null, operations: 0, cells: [] },
    });
    expect(state.components.array.data.reading).toBe(false);
  });
});

describe('arrays insert and delete content', () => {
  it('provides overview, concepts, and visual configuration', () => {
    expect(parseOverviewYaml(insertDelete('overview.yaml')).title).toMatch(/insert/i);
    expect(parseConceptsYaml(insertDelete('concepts.yaml'))).toHaveProperty('shifting');
    expect(insertDelete('visuals.yaml')).toContain('kind: array');
  });

  it('inserts into the middle by shifting from the end before writing', () => {
    const scenario = parseSimulationYaml(insertDelete('simulation.yaml')).find((item) => item.id === 'middle-insert')!;
    const events = materializeEvents(scenario);

    expect(events.map((event) => event.type)).toEqual(['ARRAY_READY', 'SHIFT_RIGHT', 'SHIFT_RIGHT', 'WRITE', 'INSERT_COMPLETE']);
    expect(events.slice(1, 3).map((event) => event.payload?.from)).toEqual([3, 2]);
    expect(events.slice(1, 3).map((event) => event.payload?.to)).toEqual([4, 3]);

    const beforeWrite = deriveState(events, 2, scenario.components);
    expect(beforeWrite.components.array.data.cells).toEqual([
      { value: 10 },
      { value: 20 },
      { value: 30 },
      { value: 30, state: 'moved' },
      { value: 40, state: 'moved' },
    ]);

    const final = deriveState(events, events.length - 1, scenario.components);
    expect(final.components.array).toMatchObject({
      status: 'done',
      data: { cells: [{ value: 10 }, { value: 20 }, { value: 25, state: 'written' }, { value: 30 }, { value: 40 }], shifts: 2, writes: 1 },
    });
  });

  it('deletes from the middle by moving later values left before removing the tail', () => {
    const scenario = parseSimulationYaml(insertDelete('simulation.yaml')).find((item) => item.id === 'middle-delete')!;
    const events = materializeEvents(scenario);

    expect(events.map((event) => event.type)).toEqual(['ARRAY_READY', 'SHIFT_LEFT', 'SHIFT_LEFT', 'REMOVE_TAIL', 'DELETE_COMPLETE']);
    expect(events.slice(1, 3).map((event) => [event.payload?.from, event.payload?.to, event.payload?.value])).toEqual([[3, 2, 30], [4, 3, 40]]);

    const beforeTailRemoval = deriveState(events, 2, scenario.components);
    expect(beforeTailRemoval.components.array.data.cells).toEqual([
      { value: 10 },
      { value: 20 },
      { value: 30, state: 'moved' },
      { value: 40, state: 'moved' },
      { value: 40, state: 'stale' },
    ]);

    const final = deriveState(events, events.length - 1, scenario.components);
    expect(final.components.array).toMatchObject({
      status: 'done',
      data: { cells: [{ value: 10 }, { value: 20 }, { value: 30 }, { value: 40 }], shifts: 2, deletes: 1 },
    });
  });

  it('covers beginning and end insertion/deletion without unnecessary shifts', () => {
    const scenarios = parseSimulationYaml(insertDelete('simulation.yaml'));
    const beginning = scenarios.find((item) => item.id === 'beginning-insert')!;
    const endInsert = scenarios.find((item) => item.id === 'end-insert')!;
    const beginningDelete = scenarios.find((item) => item.id === 'beginning-delete')!;

    expect(materializeEvents(beginning).map((event) => event.type)).toEqual(['SHIFT_RIGHT', 'SHIFT_RIGHT', 'SHIFT_RIGHT', 'WRITE', 'INSERT_COMPLETE']);
    expect(deriveState(materializeEvents(beginning), 4, beginning.components).components.array.data).toMatchObject({ shifts: 3, writes: 1 });
    expect(deriveState(materializeEvents(endInsert), endInsert.events.length - 1, endInsert.components).components.array.data).toMatchObject({ cells: [{ value: 10 }, { value: 20 }, { value: 30 }, { value: 40 }, { value: 50 }], shifts: 0, writes: 1 });
    expect(deriveState(materializeEvents(beginningDelete), beginningDelete.events.length - 1, beginningDelete.components).components.array.data).toMatchObject({ cells: [{ value: 20 }, { value: 30 }, { value: 40 }], shifts: 3, deletes: 1 });
  });

  it('handles inserting into an empty array and deleting the only element', () => {
    const scenarios = parseSimulationYaml(insertDelete('simulation.yaml'));
    const emptyInsert = scenarios.find((item) => item.id === 'empty-insert')!;
    const singleDelete = scenarios.find((item) => item.id === 'single-delete')!;

    expect(materializeEvents(emptyInsert).map((event) => event.type)).toEqual(['ARRAY_READY', 'CHECK_BOUNDARY', 'INSERT_READY', 'WRITE', 'INSERT_COMPLETE']);
    expect(deriveState(materializeEvents(emptyInsert), 4, emptyInsert.components).components.array.data).toMatchObject({ cells: [{ value: 7 }], shifts: 0, writes: 1 });
    expect(materializeEvents(singleDelete).map((event) => event.type)).toEqual(['ARRAY_READY', 'CHECK_BOUNDARY', 'DELETE_READY', 'REMOVE_TAIL', 'DELETE_COMPLETE']);
    expect(deriveState(materializeEvents(singleDelete), 4, singleDelete.components).components.array.data).toMatchObject({ cells: [], shifts: 0, deletes: 1 });
  });

  it('settles every insert/delete scenario with exact cells, done status, and complexity state', () => {
    const scenarios = parseSimulationYaml(insertDelete('simulation.yaml'));
    const expected: Record<string, unknown[]> = {
      'middle-insert': [{ value: 10 }, { value: 20 }, { value: 25, state: 'written' }, { value: 30 }, { value: 40 }],
      'middle-delete': [{ value: 10 }, { value: 20 }, { value: 30 }, { value: 40 }],
      'beginning-insert': [{ value: 5 }, { value: 10 }, { value: 20 }, { value: 30 }],
      'end-insert': [{ value: 10 }, { value: 20 }, { value: 30 }, { value: 40 }, { value: 50 }],
      'beginning-delete': [{ value: 20 }, { value: 30 }, { value: 40 }],
      'end-delete': [{ value: 10 }, { value: 20 }],
      'empty-insert': [{ value: 7 }],
      'single-delete': [],
    };
    const expectedOperation: Record<string, Record<string, unknown>> = {
      'middle-insert': { from: 2, to: 2, value: 25 },
      'middle-delete': { from: 2, to: 2, value: 25 },
      'beginning-insert': { from: 0, to: 0, value: 5 },
      'end-insert': { from: 4, to: 4, value: 50 },
      'beginning-delete': { from: 0, to: 0, value: 10 },
      'end-delete': { from: 2, to: 2, value: 30 },
      'empty-insert': { from: 0, to: 0, value: 7 },
      'single-delete': { from: 0, to: 0, value: 7 },
    };

    expect(scenarios.map((scenario) => scenario.id)).toEqual(Object.keys(expected));
    for (const scenario of scenarios) {
      const state = deriveState(materializeEvents(scenario), scenario.events.length - 1, scenario.components);
      expect(state.components.array.status, scenario.id).toBe('done');
      expect(state.components.array.data.cells, scenario.id).toEqual(expected[scenario.id]);
      expect(state.components.complexity.status, scenario.id).toBe('done');
      expect(state.components.complexity.data, scenario.id).toMatchObject({ insert: expect.any(String), delete: expect.any(String), space: 'O(1)' });
      expect(state.components.operation.data, scenario.id).toMatchObject(expectedOperation[scenario.id]);
      expect(state.log.length, scenario.id).toBeGreaterThan(0);
    }
  });
});

describe('arrays two pointers content', () => {
  it('converges inward and records a found target', () => {
    const scenario = parseSimulationYaml(readFrom(twoPointersDir, 'simulation.yaml')).find((item) => item.id === 'target-found')!;
    const events = materializeEvents(scenario);

    expect(events.map((event) => event.type)).toEqual(['ARRAY_READY', 'COMPARE', 'MOVE_LEFT', 'COMPARE', 'MOVE_LEFT', 'COMPARE', 'TARGET_FOUND']);
    expect(events.filter((event) => event.type === 'COMPARE').map((event) => [event.payload?.left, event.payload?.right, event.payload?.sum])).toEqual([[0, 5, 10], [1, 5, 11], [2, 5, 13]]);

    const final = deriveState(events, events.length - 1, scenario.components);
    expect(final.components.array).toMatchObject({ status: 'done', data: { left: 2, right: 5, target: 13, found: true } });
    expect(final.components.operation.data).toMatchObject({ left: 2, right: 5, sum: 13, target: 13, result: 'found' });
  });

  it('stops after pointers cross when the target is absent', () => {
    const scenario = parseSimulationYaml(readFrom(twoPointersDir, 'simulation.yaml')).find((item) => item.id === 'target-not-found')!;
    const events = materializeEvents(scenario);
    const final = deriveState(events, events.length - 1, scenario.components);

    expect(events.filter((event) => event.type === 'COMPARE').map((event) => [event.payload?.left, event.payload?.right])).toEqual([[0, 5], [1, 5], [2, 5], [3, 5], [4, 5]]);
    expect(events.at(-1)?.type).toBe('TARGET_NOT_FOUND');
    expect(final.components.array).toMatchObject({ status: 'done', data: { left: 5, right: 5, target: 20, found: false } });
    expect(final.components.operation.data).toMatchObject({ left: 5, right: 5, result: 'not found' });
  });
});

describe('arrays prefix sum content', () => {
  it('builds prefixes and answers a full-range query from the prefix endpoints', () => {
    const scenario = parseSimulationYaml(readFrom(prefixSumDir, 'simulation.yaml')).find((item) => item.id === 'full-range')!;
    const events = materializeEvents(scenario);
    const types = events.map((event) => event.type);

    expect(types.slice(0, 5)).toEqual(['ARRAY_READY', 'PREFIX_BUILD', 'PREFIX_BUILD', 'PREFIX_BUILD', 'PREFIX_BUILD']);
    expect(types.at(-1)).toBe('RANGE_SUM_COMPLETE');
    expect(events.find((event) => event.type === 'RANGE_QUERY')?.payload).toMatchObject({ left: 0, right: 4, before: 0, after: 15 });

    const built = deriveState(events, 4, scenario.components);
    expect(built.components.prefix.data.values).toEqual([0, 3, 4, 8, 10]);
    const final = deriveState(events, events.length - 1, scenario.components);
    expect(final.components.prefix.data.values).toEqual([0, 3, 4, 8, 10, 15]);
    expect(final.components.range).toMatchObject({ status: 'done', data: { left: 0, right: 4, sum: 15, query: 'full range' } });
    expect(final.components.complexity.data).toMatchObject({ build: 'O(n)', query: 'O(1)', space: 'O(n)' });
  });
});

describe("arrays Kadane's algorithm content", () => {
  it('keeps the best mixed subarray candidate after resetting a losing prefix', () => {
    const scenario = parseSimulationYaml(readFrom(kadanesDir, 'simulation.yaml')).find((item) => item.id === 'mixed')!;
    const events = materializeEvents(scenario);
    const restart = deriveState(events, 1, scenario.components);
    expect(restart.components.array.data).toMatchObject({ index: 1, currentSum: 1, bestStart: 1 });
    const continued = deriveState(events, 4, scenario.components);
    expect(continued.components.array.data).toMatchObject({ index: 4, currentSum: 3, bestStart: 3 });
    const final = deriveState(events, events.length - 1, scenario.components);

    expect(events.filter((event) => event.type === 'CANDIDATE_UPDATE').length).toBeGreaterThan(0);
    expect(final.components.array).toMatchObject({ status: 'done', data: { bestSum: 6, bestStart: 3, bestEnd: 6, currentSum: 1 } });
    expect(final.components.candidate.data).toMatchObject({ values: [4, -1, 2, 1], sum: 6, start: 3, end: 6 });
  });

  it('selects the least negative element when every value is negative', () => {
    const scenario = parseSimulationYaml(readFrom(kadanesDir, 'simulation.yaml')).find((item) => item.id === 'all-negative')!;
    const events = materializeEvents(scenario);
    const final = deriveState(events, events.length - 1, scenario.components);

    expect(final.components.array).toMatchObject({ status: 'done', data: { bestSum: -1, bestStart: 2, bestEnd: 3 } });
    expect(final.components.candidate.data).toMatchObject({ values: [-1], sum: -1, start: 2, end: 3 });
  });
});
