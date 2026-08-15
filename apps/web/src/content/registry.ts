import { parse as parseYamlText } from 'yaml';
import {
  parseConceptsYaml,
  parseOverviewYaml,
  parseSimulationYaml,
  type ConceptDef,
  type OverviewDef,
  type ScenarioDef,
} from '@underhood/simulation-engine';
import { parseVisualsYaml, type VisualsDef } from './visuals';

export interface ExperienceDef {
  topicId: string;
  id: string;
  overview: OverviewDef;
  scenarios: Record<string, ScenarioDef>;
  concepts: Record<string, ConceptDef>;
  visuals: VisualsDef;
}

export interface TopicDef {
  id: string;
  name: string;
  description?: string;
  experiences: Record<string, ExperienceDef>;
}

// Discover every content YAML at build time — adding a topic is a new
// directory under content/, no code changes.
const files = import.meta.glob('../../../../content/**\/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function buildTopics(): Record<string, TopicDef> {
  const topics: Record<string, TopicDef> = {};

  for (const [path, raw] of Object.entries(files)) {
    // path: .../content/<topic>/<experience>/<file>.yaml | .../content/<topic>/topic.yaml
    const rel = path.replace(/^.*\/content\//, '');
    const segments = rel.split('/');
    if (segments.length === 2 && segments[1] === 'topic.yaml') {
      const id = segments[0];
      const meta = parseTopicYaml(raw, path);
      topics[id] ??= { id, name: meta.name ?? id, description: meta.description, experiences: {} };
      topics[id].name = meta.name ?? id;
      topics[id].description = meta.description;
      continue;
    }
    if (segments.length !== 3) continue;
    const [topicId, experienceId, file] = segments;
    const experience = ((topics[topicId] ??= { id: topicId, name: topicId, experiences: {} })
      .experiences[experienceId] ??= {
      topicId,
      id: experienceId,
      overview: undefined as unknown as OverviewDef,
      scenarios: {},
      concepts: {},
      visuals: undefined as unknown as VisualsDef,
    });
    const source = `${topicId}/${experienceId}/${file}`;
    switch (file) {
      case 'overview.yaml':
        experience.overview = parseOverviewYaml(raw);
        break;
      case 'simulation.yaml':
        for (const scenario of parseSimulationYaml(raw)) {
          experience.scenarios[scenario.id] = scenario;
        }
        break;
      case 'concepts.yaml':
        experience.concepts = parseConceptsYaml(raw);
        break;
      case 'visuals.yaml':
        experience.visuals = parseVisualsYaml(raw, source);
        break;
    }
  }

  // Validate completeness with errors that name the file.
  for (const topic of Object.values(topics)) {
    for (const experience of Object.values(topic.experiences)) {
      const base = `${topic.id}/${experience.id}`;
      if (!experience.overview) throw new Error(`Missing overview.yaml for ${base}`);
      if (!experience.visuals) throw new Error(`Missing visuals.yaml for ${base}`);
      if (Object.keys(experience.scenarios).length === 0) {
        throw new Error(`No scenarios defined for ${base}`);
      }
    }
  }
  return topics;
}

function parseTopicYaml(text: string, path: string): { name?: string; description?: string } {
  try {
    return (parseYamlText(text) as { name?: string; description?: string }) ?? {};
  } catch (err) {
    throw new Error(`Invalid YAML in ${path}: ${(err as Error).message}`);
  }
}

export const topics: Record<string, TopicDef> = buildTopics();

export function firstExperience(topic: TopicDef): ExperienceDef {
  return Object.values(topic.experiences)[0];
}

export function routeExists(topicId: string, experienceId: string): boolean {
  return Boolean(topics[topicId]?.experiences[experienceId]);
}
