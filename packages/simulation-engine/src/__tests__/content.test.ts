import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  parseSimulationYaml,
  parseConceptsYaml,
  parseOverviewYaml,
  materializeEvents,
} from '../scenario';
import { deriveState } from '../fold';

const contentDir = resolve(__dirname, '../../../../content/docker/docker-run');
const read = (name: string) => readFileSync(resolve(contentDir, name), 'utf8');

describe('docker-run content', () => {
  it('overview parses', () => {
    const overview = parseOverviewYaml(read('overview.yaml'));
    expect(overview.title).toMatch(/docker run nginx/);
  });

  it('simulation parses with both scenarios and valid events', () => {
    const scenarios = parseSimulationYaml(read('simulation.yaml'));
    expect(scenarios.map((s) => s.id)).toEqual(['pull', 'cached']);
    const pull = scenarios.find((s) => s.id === 'pull')!;
    expect(pull.events).toHaveLength(15);
    const cached = scenarios.find((s) => s.id === 'cached')!;
    expect(cached.events).toHaveLength(8);
  });

  it('pull scenario reaches a running container', () => {
    const [pull] = parseSimulationYaml(read('simulation.yaml'));
    const events = materializeEvents(pull);
    const types = events.map((e) => e.type);
    expect(types[0]).toBe('COMMAND_ENTERED');
    expect(types.at(-1)).toBe('CONTAINER_RUNNING');
    expect(types.filter((t) => t === 'LAYER_PULL')).toHaveLength(4);
    // timestamps strictly increasing
    for (let i = 1; i < events.length; i++) {
      expect(events[i].timestamp).toBeGreaterThan(events[i - 1].timestamp);
    }
  });

  it('all six components have inspection content', () => {
    const concepts = parseConceptsYaml(read('concepts.yaml'));
    for (const id of ['terminal', 'cli', 'daemon', 'registry', 'image-store', 'container']) {
      expect(concepts[id], `missing concept for ${id}`).toBeDefined();
    }
  });

  it('every event source/target references a known component', () => {
    const known = new Set(['terminal', 'cli', 'daemon', 'registry', 'image-store', 'container']);
    for (const scenario of parseSimulationYaml(read('simulation.yaml'))) {
      for (const e of scenario.events) {
        if (e.source) expect(known.has(e.source), `unknown source ${e.source}`).toBe(true);
        if (e.target) expect(known.has(e.target), `unknown target ${e.target}`).toBe(true);
      }
    }
  });

  it('declarative effects reproduce the full docker-run lifecycle', () => {
    const [pull] = parseSimulationYaml(read('simulation.yaml'));
    const events = materializeEvents(pull);
    const s = deriveState(events, events.length - 1, pull.components);
    expect(s.components.container).toMatchObject({
      status: 'done',
      data: expect.objectContaining({
        containerId: 'e4f5a6b7c8',
        ip: '172.17.0.2',
        pid: 1,
        running: true,
      }),
    });
    expect((s.components['image-store'].data.layers as unknown[]).length).toBe(4);
    expect((s.components.container.data.stack as unknown[]).length).toBe(5);
    expect(s.log.map((l) => l.text)).toContain('STATUS: Running — nginx is up');
    // Mid-simulation rewind is clean.
    const mid = deriveState(events, 3, pull.components);
    expect(mid.components.container.status).toBe('absent');
    expect(mid.components.container.data.containerId).toBeUndefined();
  });
});
