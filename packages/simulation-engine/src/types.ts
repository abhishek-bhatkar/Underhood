export interface EventExplanation {
  title: string;
  body: string;
  /** Key-idea callout, rendered prominently. */
  concept?: string;
}

/** Declarative state transition applied when an event occurs. */
export type Effect =
  | { op: 'status'; component: string; status: ComponentStatus }
  | { op: 'label'; component: string; text?: string }
  | { op: 'set'; component: string; data: Record<string, unknown> }
  | { op: 'push'; component: string; key: string; value: Record<string, unknown> }
  | { op: 'pop'; component: string; key: string }
  | { op: 'remove'; component: string; key: string; match: Record<string, string | number> }
  | { op: 'log'; text: string };

export interface SimulationEvent {
  id: string;
  type: string;
  /** Sim-time ms, cumulative from durations. */
  timestamp: number;
  /** ms this transition takes at 1x speed. */
  duration: number;
  /** Component id. */
  source?: string;
  /** Component id. */
  target?: string;
  payload?: Record<string, unknown>;
  explanation: EventExplanation;
  effects?: Effect[];
}

export type ComponentStatus = 'idle' | 'active' | 'done' | 'absent' | 'error';

export interface ComponentRuntime {
  id: string;
  status: ComponentStatus;
  /** Transient status line shown inside the node. */
  label?: string;
  /** Component-specific accumulated state. */
  data: Record<string, unknown>;
}

/** Declared initial state of a component in a scenario. */
export interface ComponentInit {
  id: string;
  initial?: ComponentStatus;
  /** Declarative state visible before the first event is applied. */
  data?: Record<string, unknown>;
}

export interface LogEntry {
  eventIndex: number;
  text: string;
}

export interface SimulationState {
  /** Index of the last applied event; -1 = nothing applied yet. */
  currentStep: number;
  components: Record<string, ComponentRuntime>;
  log: LogEntry[];
}
