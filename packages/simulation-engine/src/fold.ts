import type { ComponentId, ComponentRuntime, SimulationEvent, SimulationState } from './types';

export const COMPONENT_IDS: readonly ComponentId[] = [
  'terminal',
  'cli',
  'daemon',
  'registry',
  'image-store',
  'container',
];

const initialComponents = (): Record<string, ComponentRuntime> =>
  Object.fromEntries(
    COMPONENT_IDS.map((id) => [
      id,
      { id, status: id === 'container' ? 'absent' : 'idle', data: {} } satisfies ComponentRuntime,
    ]),
  );

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

type Handler = (state: SimulationState, event: SimulationEvent) => void;

/**
 * Explicit handler per event type: deterministic, auditable state transitions.
 * Mirrors real docker behavior closely enough to teach accurately.
 */
const handlers: Record<string, Handler> = {
  COMMAND_ENTERED: (s, e) => {
    s.components.terminal.data.command = e.payload?.command;
    s.components.terminal.status = 'done';
    s.components.cli.status = 'active';
    s.components.cli.label = 'parsing command';
    s.log.push({ eventIndex: s.currentStep, text: `$ ${String(e.payload?.command ?? '')}` });
  },
  CLI_REQUEST: (s, e) => {
    s.components.cli.status = 'active';
    s.components.cli.label = `${e.payload?.method} ${e.payload?.path}`;
    s.components.daemon.status = 'active';
    s.components.daemon.label = 'handling API request';
    s.log.push({
      eventIndex: s.currentStep,
      text: `cli -> daemon: ${e.payload?.method} ${e.payload?.path}`,
    });
  },
  IMAGE_LOOKUP: (s) => {
    s.components.daemon.status = 'active';
    s.components.daemon.label = 'checking local image store…';
    s.components['image-store'].status = 'active';
    s.log.push({ eventIndex: s.currentStep, text: 'daemon: looking for image locally' });
  },
  IMAGE_MISS: (s) => {
    s.components['image-store'].status = 'idle';
    s.components.daemon.label = 'image not found locally';
    s.log.push({ eventIndex: s.currentStep, text: "Unable to find image 'nginx:latest' locally" });
  },
  IMAGE_HIT: (s) => {
    s.components['image-store'].status = 'done';
    s.components.daemon.label = 'image found locally';
    s.log.push({ eventIndex: s.currentStep, text: 'Image nginx:latest found in local store' });
  },
  REGISTRY_REQUEST: (s, e) => {
    s.components.daemon.label = 'contacting registry';
    s.components.registry.status = 'active';
    s.components.registry.label = 'auth + manifest';
    s.log.push({
      eventIndex: s.currentStep,
      text: `daemon -> ${e.payload?.registry}: auth, fetch manifest`,
    });
  },
  MANIFEST_FETCHED: (s, e) => {
    s.components.registry.label = `manifest: ${e.payload?.layers} layers`;
    s.log.push({
      eventIndex: s.currentStep,
      text: `manifest fetched (${e.payload?.layers} layers)`,
    });
  },
  LAYER_PULL: (s, e) => {
    const store = s.components['image-store'];
    store.status = 'active';
    store.label = `pulling layer ${e.payload?.layerIndex}/${e.payload?.total}`;
    const layers = (store.data.layers as unknown[]) ?? (store.data.layers = []);
    layers.push({
      layerIndex: e.payload?.layerIndex,
      total: e.payload?.total,
      name: e.payload?.name,
      digest: e.payload?.digest,
    });
    s.components.registry.status = 'active';
    s.components.registry.label = `serving blob ${String(e.payload?.digest).slice(0, 7)}`;
    s.log.push({ eventIndex: s.currentStep, text: `${e.payload?.digest}: Pull complete` });
  },
  IMAGE_READY: (s, e) => {
    s.components['image-store'].status = 'done';
    s.components['image-store'].label = 'image ready';
    s.components.registry.status = 'done';
    s.components.registry.label = undefined;
    s.components.daemon.label = `image ${e.payload?.image} ready`;
    s.log.push({
      eventIndex: s.currentStep,
      text: `Status: Downloaded newer image for ${e.payload?.image}`,
    });
  },
  CONTAINER_CREATED: (s, e) => {
    const c = s.components.container;
    c.status = 'active';
    c.data.containerId = e.payload?.containerId;
    c.data.writableLayer = true;
    c.label = 'container created';
    s.components.daemon.label = 'container created';
    s.log.push({
      eventIndex: s.currentStep,
      text: `container ${e.payload?.containerId} created (writable layer added)`,
    });
  },
  NETWORK_ATTACHED: (s, e) => {
    const c = s.components.container;
    c.data.ip = e.payload?.ip;
    c.data.network = e.payload?.network;
    c.data.veth = e.payload?.veth;
    c.label = `network: ${e.payload?.network}`;
    s.log.push({
      eventIndex: s.currentStep,
      text: `connected to bridge (${e.payload?.veth}) -> ${e.payload?.ip}`,
    });
  },
  PROCESS_STARTED: (s, e) => {
    const c = s.components.container;
    c.data.pid = e.payload?.pid;
    c.data.process = e.payload?.process;
    c.label = `PID ${e.payload?.pid}: ${e.payload?.process}`;
    s.log.push({ eventIndex: s.currentStep, text: `PID 1 started: ${e.payload?.process}` });
  },
  CONTAINER_RUNNING: (s) => {
    const c = s.components.container;
    c.status = 'done';
    c.data.running = true;
    c.label = 'running';
    s.components.daemon.status = 'done';
    s.components.daemon.label = 'supervising';
    s.components.cli.status = 'done';
    s.components.cli.label = undefined;
    s.components.terminal.status = 'done';
    s.log.push({ eventIndex: s.currentStep, text: 'STATUS: Running — nginx is up' });
  },
};

/**
 * Pure fold: reduce events[0..uptoIndex] into a SimulationState.
 * Rewind is free — state at any point is derived by folding fewer events.
 */
export function deriveState(events: SimulationEvent[], uptoIndex: number): SimulationState {
  const state: SimulationState = { currentStep: -1, components: initialComponents(), log: [] };
  const last = Math.min(uptoIndex, events.length - 1);
  for (let i = 0; i <= last; i++) {
    const event = events[i];
    state.currentStep = i;
    handlers[event.type]?.(state, event);
  }
  return state;
}
