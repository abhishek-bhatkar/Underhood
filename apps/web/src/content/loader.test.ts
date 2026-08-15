import { describe, it, expect } from 'vitest';
import { loadDockerRunContent } from './loader';
import { materializeEvents } from '@underhood/simulation-engine';

describe('loadDockerRunContent', () => {
  it('returns both scenarios and all six concepts', () => {
    const content = loadDockerRunContent();
    expect(Object.keys(content.scenarios).sort()).toEqual(['cached', 'pull']);
    expect(Object.keys(content.concepts).sort()).toEqual([
      'cli',
      'container',
      'daemon',
      'image-store',
      'registry',
      'terminal',
    ]);
    expect(content.overview.title).toMatch(/docker run nginx/);
  });

  it('scenarios materialize into runnable event lists', () => {
    const content = loadDockerRunContent();
    expect(materializeEvents(content.scenarios.pull)).toHaveLength(15);
    expect(materializeEvents(content.scenarios.cached)).toHaveLength(8);
  });
});
