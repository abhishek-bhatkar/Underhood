import { describe, it, expect } from 'vitest';
import { materializeEvents } from '@underhood/simulation-engine';
import { topics, firstExperience } from './registry';

describe('content registry', () => {
  it('discovers topics and their experiences', () => {
    expect(Object.keys(topics).sort()).toContain('docker');
    const docker = topics.docker;
    expect(docker.name).toBe('Docker');
    expect(Object.keys(docker.experiences)).toContain('docker-run');
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
