export interface EventExplanation {
  title: string;
  body: string;
  /** Key-idea callout, rendered prominently. */
  concept?: string;
}

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
}

export type ComponentStatus = 'idle' | 'active' | 'done' | 'absent';

export interface ComponentRuntime {
  id: string;
  status: ComponentStatus;
  /** Transient status line shown inside the node. */
  label?: string;
  /** Component-specific accumulated state. */
  data: Record<string, unknown>;
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

/** All component ids used by the docker-run simulation. */
export type ComponentId = 'terminal' | 'cli' | 'daemon' | 'registry' | 'image-store' | 'container';
