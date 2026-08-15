import { describe, it, expect } from 'vitest';
import {
  parseSimulationYaml,
  parseConceptsYaml,
  parseOverviewYaml,
  materializeEvents,
} from '../scenario';

const simulationYaml = `
scenarios:
  - id: pull
    name: Pull image
    components:
      - id: terminal
      - id: container
        initial: absent
    events:
      - type: COMMAND_ENTERED
        source: terminal
        target: cli
        duration: 1200
        payload:
          command: docker run nginx
        explanation:
          title: You run docker run nginx
          body: The CLI parses the command.
          concept: docker run = create + start
        effects:
          - op: set
            component: terminal
            data:
              command: "$payload.command"
          - op: status
            component: terminal
            status: done
          - op: log
            text: "$ $payload.command"
      - type: CLI_REQUEST
        source: cli
        target: daemon
        explanation:
          title: CLI talks to the daemon
          body: Over the Docker socket.
        effects:
          - op: log
            text: "cli -> daemon"
  - id: cached
    name: Image cached
    events:
      - type: COMMAND_ENTERED
        source: terminal
        target: cli
        explanation:
          title: You run docker run nginx
          body: Again.
`;

const conceptsYaml = `
concepts:
  cli:
    name: Docker CLI
    summary: A thin client.
    details:
      - Parses commands.
      - Talks to the daemon over the socket.
  container:
    name: Container
    summary: A running instance of an image.
    details:
      - Image layers plus a writable layer.
      - Isolated process, not a VM.
`;

const overviewYaml = `
title: What happens when you run docker run nginx?
summary: One paragraph.
`;

describe('parseSimulationYaml', () => {
  it('parses scenarios with their events, components, and effects', () => {
    const scenarios = parseSimulationYaml(simulationYaml);
    expect(scenarios).toHaveLength(2);
    expect(scenarios[0]).toMatchObject({ id: 'pull', name: 'Pull image' });
    expect(scenarios[0].components).toEqual([{ id: 'terminal' }, { id: 'container', initial: 'absent' }]);
    expect(scenarios[0].events[0]).toMatchObject({
      type: 'COMMAND_ENTERED',
      source: 'terminal',
      target: 'cli',
      duration: 1200,
    });
    expect(scenarios[0].events[0].effects).toHaveLength(3);
    expect(scenarios[1].events).toHaveLength(1);
    expect(scenarios[1].components).toBeUndefined();
  });

  it('rejects an unknown effect op with a useful message', () => {
    const bad = `
scenarios:
  - id: pull
    name: Pull
    events:
      - type: COMMAND_ENTERED
        explanation:
          title: t
          body: b
        effects:
          - op: explode
            component: cli
`;
    expect(() => parseSimulationYaml(bad)).toThrow(/effects.*0.*op|Invalid input|invalid/i);
  });

  it('rejects an event missing explanation.title with a useful message', () => {
    const bad = `
scenarios:
  - id: pull
    name: Pull
    events:
      - type: COMMAND_ENTERED
        explanation:
          body: no title
`;
    expect(() => parseSimulationYaml(bad)).toThrow(/explanation.*title|title.*required/i);
  });

  it('rejects malformed YAML with an error', () => {
    expect(() => parseSimulationYaml('{{not yaml')).toThrow();
  });
});

describe('materializeEvents', () => {
  it('assigns sequential ids, cumulative timestamps, and passes effects through', () => {
    const [scenario] = parseSimulationYaml(simulationYaml);
    const events = materializeEvents(scenario);
    expect(events.map((e) => e.id)).toEqual(['e0', 'e1']);
    expect(events[0].timestamp).toBe(0);
    expect(events[1].timestamp).toBe(1200); // duration of event 0
    expect(events[1].duration).toBe(800); // default applied
    expect(events[0].explanation.concept).toBe('docker run = create + start');
    expect(events[0].effects?.[0]).toEqual({ op: 'set', component: 'terminal', data: { command: '$payload.command' } });
  });
});

describe('parseConceptsYaml', () => {
  it('parses concepts keyed by id', () => {
    const concepts = parseConceptsYaml(conceptsYaml);
    expect(concepts.cli).toMatchObject({ name: 'Docker CLI', summary: 'A thin client.' });
    expect(concepts.container.details).toHaveLength(2);
  });

  it('rejects a concept missing details', () => {
    expect(() => parseConceptsYaml('concepts:\n  cli:\n    name: x\n    summary: y\n')).toThrow();
  });
});

describe('parseOverviewYaml', () => {
  it('parses title and summary', () => {
    expect(parseOverviewYaml(overviewYaml)).toEqual({
      title: 'What happens when you run docker run nginx?',
      summary: 'One paragraph.',
    });
  });

  it('rejects missing summary', () => {
    expect(() => parseOverviewYaml('title: only title\n')).toThrow();
  });
});
