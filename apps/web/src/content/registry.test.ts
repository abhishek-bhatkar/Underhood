import { describe, it, expect } from 'vitest';
import { materializeEvents } from '@underhood/simulation-engine';
import { topics, firstExperience } from './registry';

describe('content registry', () => {
  it('discovers all spec topics and their experiences', () => {
    expect(Object.keys(topics).sort()).toEqual([
      'arrays',
      'databases',
      'docker',
      'jvm',
      'kafka',
      'kubernetes',
      'linux',
      'networking',
      'system-design',
      'v8',
    ]);
    expect(topics.docker.name).toBe('Docker');
    expect(topics.jvm.name).toBe('JVM');
    expect(Object.keys(topics.docker.experiences)).toContain('docker-run');
    expect(Object.keys(topics.jvm.experiences)).toContain('run-java');
    expect(topics.arrays.name).toBe('Arrays');
    expect(Object.keys(topics.arrays.experiences).sort()).toEqual([
      'kadanes-algorithm',
      'insert-delete',
      'prefix-sum',
      'traversal',
      'two-pointers',
    ].sort());
  });

  it('traversal has complete and empty scenarios with read events', () => {
    const experience = topics.arrays.experiences.traversal;
    expect(Object.keys(experience.scenarios).sort()).toEqual(['complete', 'empty']);
    expect(experience.scenarios.complete.events.map((event) => event.type)).toEqual([
      'READ',
      'READ',
      'READ',
      'READ',
      'READ',
      'TRAVERSAL_COMPLETE',
    ]);
    expect(experience.scenarios.empty.events.map((event) => event.type)).toEqual([
      'CHECK_LENGTH',
      'EMPTY_ARRAY_GUARD',
      'SKIP_READ',
      'TERMINATE',
      'EMPTY_ARRAY',
    ]);
  });

  it('retains plural visual bindings for all Task 5 array experiences', () => {
    expect(topics.arrays.experiences['two-pointers'].visuals.nodes[0]).toMatchObject({
      pointerKeys: ['left', 'right'],
    });
    expect(topics.arrays.experiences['prefix-sum'].visuals.nodes[0]).toMatchObject({
      rangeKeys: ['left', 'right'],
    });
    expect(topics.arrays.experiences['kadanes-algorithm'].visuals.nodes[0]).toMatchObject({
      rangeKeys: ['bestStart', 'bestEnd'],
    });
  });

  it('docker-run has two scenarios and six concepts', () => {
    const experience = topics.docker.experiences['docker-run'];
    expect(Object.keys(experience.scenarios).sort()).toEqual(['cached', 'pull']);
    expect(Object.keys(experience.concepts)).toHaveLength(6);
    expect(materializeEvents(experience.scenarios.pull)).toHaveLength(15);
  });

  it('every experience has complete, validated content', () => {
    for (const topic of Object.values(topics)) {
      for (const experience of Object.values(topic.experiences)) {
        expect(experience.overview.title.length, `${topic.id}/${experience.id} title`).toBeGreaterThan(0);
        expect(experience.visuals.nodes.length).toBeGreaterThan(0);
      }
    }
  });

  it('firstExperience returns something usable per topic', () => {
    for (const topic of Object.values(topics)) {
      expect(firstExperience(topic).id).toBeTruthy();
    }
  });
});
