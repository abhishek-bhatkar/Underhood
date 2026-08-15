import type {
  ComponentInit,
  ComponentRuntime,
  Effect,
  SimulationEvent,
  SimulationState,
} from './types';

/** Test/content helper: build a minimal valid event. */
export function makeEvent(
  index: number,
  type: string,
  overrides: Partial<SimulationEvent> = {},
): SimulationEvent {
  return {
    id: `e${index}`,
    type,
    timestamp: (overrides.duration ?? 800) * index,
    duration: 800,
    explanation: { title: type, body: '' },
    ...overrides,
  };
}

/** Replace $payload.<key> references in a string. Missing keys become ''. */
function tpl(text: string, payload: Record<string, unknown> | undefined): string {
  return text.replace(/\$payload\.(\w+)/g, (_, key: string) => {
    const value = payload?.[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

const EXACT_REF = /^\$payload\.(\w+)$/;

/**
 * Deeply template every string in a value (objects, arrays, primitives).
 * A string that is exactly "$payload.key" passes the raw (typed) value
 * through, so numbers and booleans survive `set`/`push`.
 */
function tplDeep(value: unknown, payload: Record<string, unknown> | undefined): unknown {
  if (typeof value === 'string') {
    const exact = value.match(EXACT_REF);
    if (exact) {
      const raw = payload?.[exact[1]];
      return raw === undefined ? '' : raw;
    }
    return tpl(value, payload);
  }
  if (Array.isArray(value)) return value.map((v) => tplDeep(v, payload));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, tplDeep(v, payload)]),
    );
  }
  return value;
}

function applyEffect(state: SimulationState, effect: Effect, payload: Record<string, unknown> | undefined): void {
  // Components referenced by effects are auto-created idle; scenarios only
  // need to pre-declare components with a non-idle initial status.
  const comp =
    'component' in effect
      ? (state.components[effect.component] ??= {
          id: effect.component,
          status: 'idle' as const,
          data: {},
        })
      : undefined;
  switch (effect.op) {
    case 'status':
      if (comp) comp.status = effect.status;
      return;
    case 'label':
      if (comp) comp.label = effect.text === undefined ? undefined : tpl(effect.text, payload);
      return;
    case 'set':
      if (comp) {
        for (const [k, v] of Object.entries(tplDeep(effect.data, payload) as Record<string, unknown>)) {
          comp.data[k] = v;
        }
      }
      return;
    case 'push': {
      if (!comp) return;
      const items = (comp.data[effect.key] as unknown[]) ?? (comp.data[effect.key] = []);
      items.push(tplDeep(effect.value, payload));
      return;
    }
    case 'pop': {
      if (!comp) return;
      const items = comp.data[effect.key] as unknown[] | undefined;
      if (Array.isArray(items)) items.pop();
      return;
    }
    case 'remove': {
      if (!comp) return;
      const items = comp.data[effect.key] as unknown[] | undefined;
      if (!Array.isArray(items)) return;
      const index = items.findIndex((item) => {
        if (!item || typeof item !== 'object') return false;
        const record = item as Record<string, unknown>;
        return Object.entries(effect.match).every(
          ([k, v]) => String(record[k]) === String(tplDeep(v, payload)),
        );
      });
      if (index >= 0) items.splice(index, 1);
      return;
    }
    case 'log':
      state.log.push({ eventIndex: state.currentStep, text: tpl(effect.text, payload) });
      return;
  }
}

/**
 * Pure fold: reduce events[0..uptoIndex] into a SimulationState by applying
 * each event's declarative effects. Rewind is free — state at any point is
 * derived by folding fewer events.
 */
export function deriveState(
  events: SimulationEvent[],
  uptoIndex: number,
  initial: ComponentInit[] = [],
): SimulationState {
  const state: SimulationState = {
    currentStep: -1,
    components: Object.fromEntries(
      initial.map((c) => [
        c.id,
        { id: c.id, status: c.initial ?? 'idle', data: {} } satisfies ComponentRuntime,
      ]),
    ),
    log: [],
  };
  const last = Math.min(uptoIndex, events.length - 1);
  for (let i = 0; i <= last; i++) {
    const event = events[i];
    state.currentStep = i;
    for (const effect of event.effects ?? []) {
      applyEffect(state, effect, event.payload);
    }
  }
  return state;
}
