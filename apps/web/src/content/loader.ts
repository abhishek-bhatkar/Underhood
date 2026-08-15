import overviewRaw from '../../../../content/docker/docker-run/overview.yaml?raw';
import simulationRaw from '../../../../content/docker/docker-run/simulation.yaml?raw';
import conceptsRaw from '../../../../content/docker/docker-run/concepts.yaml?raw';
import {
  parseConceptsYaml,
  parseOverviewYaml,
  parseSimulationYaml,
  type ConceptDef,
  type OverviewDef,
  type ScenarioDef,
} from '@underhood/simulation-engine';

export interface DockerRunContent {
  overview: OverviewDef;
  scenarios: Record<string, ScenarioDef>;
  concepts: Record<string, ConceptDef>;
}

let cached: DockerRunContent | null = null;

/** Parse + validate the bundled docker-run YAML content (throws loudly on bad content). */
export function loadDockerRunContent(): DockerRunContent {
  if (cached) return cached;
  cached = {
    overview: parseOverviewYaml(overviewRaw),
    scenarios: Object.fromEntries(parseSimulationYaml(simulationRaw).map((s) => [s.id, s])),
    concepts: parseConceptsYaml(conceptsRaw),
  };
  return cached;
}
