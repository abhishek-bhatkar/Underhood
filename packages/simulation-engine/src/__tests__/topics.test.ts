import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  parseSimulationYaml,
  parseConceptsYaml,
  parseOverviewYaml,
  materializeEvents,
} from '../scenario';
import { deriveState } from '../fold';

const contentRoot = resolve(__dirname, '../../../../content');

function topicDirs(): string[] {
  return readdirSync(contentRoot).filter((name) => statSync(resolve(contentRoot, name)).isDirectory());
}

function experienceDirs(topic: string): string[] {
  const topicDir = resolve(contentRoot, topic);
  return readdirSync(topicDir).filter((name) => statSync(resolve(topicDir, name)).isDirectory());
}

const read = (topic: string, experience: string, file: string) =>
  readFileSync(resolve(contentRoot, topic, experience, file), 'utf8');

describe('all topics content', () => {
  const topics = topicDirs();

  it('discovers at least the eight implemented topics', () => {
    expect(topics.length).toBeGreaterThanOrEqual(8);
  });

  for (const topic of topics) {
    describe(`topic: ${topic}`, () => {
      const experiences = experienceDirs(topic);

      it('has at least one experience', () => {
        expect(experiences.length).toBeGreaterThan(0);
      });

      for (const experience of experiences) {
        it(`${experience}: overview/concepts parse`, () => {
          expect(parseOverviewYaml(read(topic, experience, 'overview.yaml')).title.length).toBeGreaterThan(0);
          const concepts = parseConceptsYaml(read(topic, experience, 'concepts.yaml'));
          expect(Object.keys(concepts).length).toBeGreaterThan(0);
        });

        const scenarios = parseSimulationYaml(read(topic, experience, 'simulation.yaml'));

        it(`${experience}: has a failure scenario alongside the happy path`, () => {
          expect(scenarios.length).toBeGreaterThanOrEqual(2);
        });

        for (const scenario of scenarios) {
          it(`${experience}/${scenario.id}: events are well-formed`, () => {
            const events = materializeEvents(scenario);
            expect(events.length).toBeGreaterThanOrEqual(5);
            for (let i = 1; i < events.length; i++) {
              expect(events[i].timestamp).toBeGreaterThan(events[i - 1].timestamp);
            }
            // Sources/targets reference known components (declared or referenced).
            const known = new Set([
              ...(scenario.components ?? []).map((c) => c.id),
              ...events.flatMap((e) => [e.source, e.target]).filter((x): x is string => Boolean(x)),
              ...scenario.events.flatMap((e) => (e.effects ?? []).map((f) => ('component' in f ? f.component : ''))),
            ]);
            for (const e of events) {
              if (e.source) expect(known.has(e.source), `unknown source ${e.source}`).toBe(true);
              if (e.target) expect(known.has(e.target), `unknown target ${e.target}`).toBe(true);
            }
          });

          it(`${experience}/${scenario.id}: folds to a settled end state with a log`, () => {
            const events = materializeEvents(scenario);
            const state = deriveState(events, events.length - 1, scenario.components);
            expect(state.log.length).toBeGreaterThan(0);
            const statuses = Object.values(state.components).map((c) => c.status);
            const settled = statuses.every((s) => s === 'done' || s === 'idle' || s === 'error' || s === 'absent');
            expect(settled, `unsettled components: ${statuses.join(',')}`).toBe(true);
          });
        }
      }
    });
  }
});
