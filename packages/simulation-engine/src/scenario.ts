import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import type { ComponentInit, Effect, SimulationEvent } from './types';

const DEFAULT_DURATION = 800;

const explanationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  concept: z.string().optional(),
});

const componentStatusSchema = z.enum(['idle', 'active', 'done', 'absent', 'error']);

const effectSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('status'), component: z.string().min(1), status: componentStatusSchema }),
  z.object({ op: z.literal('label'), component: z.string().min(1), text: z.string().optional() }),
  z.object({ op: z.literal('set'), component: z.string().min(1), data: z.record(z.unknown()) }),
  z.object({
    op: z.literal('push'),
    component: z.string().min(1),
    key: z.string().min(1),
    value: z.record(z.unknown()),
  }),
  z.object({ op: z.literal('pop'), component: z.string().min(1), key: z.string().min(1) }),
  z.object({
    op: z.literal('remove'),
    component: z.string().min(1),
    key: z.string().min(1),
    match: z.record(z.union([z.string(), z.number()])),
  }),
  z.object({ op: z.literal('log'), text: z.string() }),
]);

const componentInitSchema = z.object({
  id: z.string().min(1),
  initial: componentStatusSchema.optional(),
});

const eventDefSchema = z.object({
  type: z.string().min(1),
  source: z.string().optional(),
  target: z.string().optional(),
  duration: z.number().positive().optional(),
  payload: z.record(z.unknown()).optional(),
  explanation: explanationSchema,
  effects: z.array(effectSchema).optional(),
});

const scenarioDefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  components: z.array(componentInitSchema).optional(),
  events: z.array(eventDefSchema).min(1),
});

const simulationFileSchema = z.object({ scenarios: z.array(scenarioDefSchema).min(1) });

const conceptFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  list: z.boolean().optional(),
});

const conceptDefSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  details: z.array(z.string().min(1)).min(1),
  fields: z.array(conceptFieldSchema).optional(),
});

const conceptsFileSchema = z.object({
  concepts: z.record(z.string(), conceptDefSchema),
});

const overviewFileSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  abstraction: z.string().optional(),
});

export interface EventDef {
  type: string;
  source?: string;
  target?: string;
  duration?: number;
  payload?: Record<string, unknown>;
  explanation: { title: string; body: string; concept?: string };
  effects?: Effect[];
}

export interface ScenarioDef {
  id: string;
  name: string;
  components?: ComponentInit[];
  events: EventDef[];
}

export interface ConceptField {
  key: string;
  label: string;
  list?: boolean;
}

export interface ConceptDef {
  name: string;
  summary: string;
  details: string[];
  fields?: ConceptField[];
}

export interface OverviewDef {
  title: string;
  summary: string;
  /** Labels the educational simplifications assumed (spec: technical accuracy). */
  abstraction?: string;
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
      effects: def.effects,
    };
    t += event.duration;
    return event;
  });
}
