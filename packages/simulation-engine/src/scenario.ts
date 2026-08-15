import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { SimulationEvent } from './types';

const DEFAULT_DURATION = 800;

const explanationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  concept: z.string().optional(),
});

const eventDefSchema = z.object({
  type: z.string().min(1),
  source: z.string().optional(),
  target: z.string().optional(),
  duration: z.number().positive().optional(),
  payload: z.record(z.unknown()).optional(),
  explanation: explanationSchema,
});

const scenarioDefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  events: z.array(eventDefSchema).min(1),
});

const simulationFileSchema = z.object({ scenarios: z.array(scenarioDefSchema).min(1) });

const conceptDefSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  details: z.array(z.string().min(1)).min(1),
});

const conceptsFileSchema = z.object({
  concepts: z.record(z.string(), conceptDefSchema),
});

const overviewFileSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
});

export interface EventDef {
  type: string;
  source?: string;
  target?: string;
  duration?: number;
  payload?: Record<string, unknown>;
  explanation: { title: string; body: string; concept?: string };
}

export interface ScenarioDef {
  id: string;
  name: string;
  events: EventDef[];
}

export interface ConceptDef {
  name: string;
  summary: string;
  details: string[];
}

export interface OverviewDef {
  title: string;
  summary: string;
}

function parse<T>(text: string, schema: z.ZodType<T>, what: string): T {
  let raw: unknown;
  try {
    raw = parseYaml(text);
  } catch (err) {
    throw new Error(`Invalid YAML in ${what}: ${(err as Error).message}`);
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid ${what}: ${issues}`);
  }
  return result.data;
}

export function parseSimulationYaml(text: string): ScenarioDef[] {
  return parse(text, simulationFileSchema, 'simulation content').scenarios;
}

export function parseConceptsYaml(text: string): Record<string, ConceptDef> {
  return parse(text, conceptsFileSchema, 'concepts content').concepts;
}

export function parseOverviewYaml(text: string): OverviewDef {
  return parse(text, overviewFileSchema, 'overview content');
}

/** Turn a scenario's event defs into full events: ids + cumulative timestamps. */
export function materializeEvents(scenario: ScenarioDef): SimulationEvent[] {
  let t = 0;
  return scenario.events.map((def, index) => {
    const event: SimulationEvent = {
      id: `e${index}`,
      type: def.type,
      timestamp: t,
      duration: def.duration ?? DEFAULT_DURATION,
      source: def.source,
      target: def.target,
      payload: def.payload,
      explanation: def.explanation,
    };
    t += event.duration;
    return event;
  });
}
