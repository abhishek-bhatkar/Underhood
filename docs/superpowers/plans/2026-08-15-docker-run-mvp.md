# Docker Run MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP from the spec — one polished interactive experience: "What happens when you run `docker run nginx`?" — with a deterministic event-based simulation engine, a React Flow visualization, playback controls, timeline, and component inspection.

**Architecture:** npm-workspaces monorepo. A framework-agnostic `simulation-engine` package holds the domain model: a YAML scenario is normalized into a typed event list; a pure fold (`deriveState`) reduces events to state (event-sourcing, so rewind is free); a `SimulationPlayer` class drives play/pause/step/seek/speed and exposes a subscribe/getSnapshot store that React binds via `useSyncExternalStore`. The `apps/web` Vite app renders state with React Flow (graph), HTML/CSS (panels, controls, timeline). Docker content lives as YAML under `content/`, validated with zod at load time.

**Tech Stack:** TypeScript, React 18, Vite 5, @xyflow/react (React Flow) 12, yaml + zod (content), Vitest (tests). npm workspaces.

**Spec:** `spec/visual-technical-systems-plan.md` — especially §5 (MVP flow), §6 (visualization steps), §7 (interaction model), §8 (event model), §10 (content as data), §23 (MVP scope), §26 (engineering principles).

## Global Constraints

- TypeScript throughout the frontend (spec §12).
- No backend, no AI, no 3D, no auth/database/mobile (spec §23 "Not required").
- Simulation first, animation second: state/events are the source of truth; the renderer derives everything from `SimulationState` + current event; renderer stays separate from content (spec §26).
- Deterministic simulation — same events, same state, every time (spec §26).
- Content as data: Docker explanation lives in `content/docker/docker-run/*.yaml`, not hardcoded in components (spec §10).
- React Flow for the node graph; HTML/CSS for panels/controls; no Three.js (spec §11, §23).
- Technical accuracy over flash (spec §25): use real concepts (writable layer, veth pair, PID 1, 172.17.0.2 bridge IP).
- Create only the directories the MVP needs (spec §14): `apps/web`, `packages/simulation-engine`, `content/docker/docker-run`. No `renderer-3d`, no `packages/ui`, etc.
- Node >= 18 assumed; npm workspaces (ships with Node — no extra global tooling required).

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`, `.gitignore`, `README.md`
- Create: `packages/simulation-engine/package.json`, `packages/simulation-engine/tsconfig.json`, `packages/simulation-engine/src/index.ts`
- Create: `apps/web` via `npm create vite@5 -- --template react-ts`
- Create: `content/docker/docker-run/.gitkeep`

**Interfaces:**
- Produces: workspace layout; `npm run dev` (root) starts Vite; `npm test -w packages/simulation-engine` runs Vitest.

- [ ] **Step 1: Root manifest + gitignore**

`package.json` (root):
```json
{
  "name": "underhood",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev -w apps/web",
    "build": "npm run build -w apps/web",
    "test": "npm run test -w packages/simulation-engine",
    "test:web": "npm run test -w apps/web"
  }
}
```

`.gitignore`:
```
node_modules/
dist/
*.local
.DS_Store
```

- [ ] **Step 2: Engine package**

`packages/simulation-engine/package.json`:
```json
{
  "name": "@underhood/simulation-engine",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "scripts": { "test": "vitest run" },
  "dependencies": { "yaml": "^2.5.0", "zod": "^3.23.0" },
  "devDependencies": { "typescript": "~5.5.0", "vitest": "^2.1.0" }
}
```

`packages/simulation-engine/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

`src/index.ts` starts as `export {};` (filled by later tasks).

- [ ] **Step 3: Scaffold web app**

```bash
npm create vite@5.5.0 -- --template react-ts apps/web
npm install
```
Add `@xyflow/react` to apps/web: `npm install @xyflow/react -w apps/web`.

- [ ] **Step 4: Verify**

`npm run dev` serves the Vite starter on localhost. Kill the server.

- [ ] **Step 5: Commit** — `chore: scaffold npm-workspaces monorepo (web app + simulation engine)`

---

### Task 2: Engine core — types + event fold

**Files:**
- Create: `packages/simulation-engine/src/types.ts`
- Create: `packages/simulation-engine/src/fold.ts`
- Test: `packages/simulation-engine/src/__tests__/fold.test.ts`
- Modify: `packages/simulation-engine/src/index.ts`

**Interfaces:**
- Produces: `SimulationEvent`, `ComponentStatus`, `ComponentRuntime`, `SimulationState`, `LogEntry` (types.ts); `deriveState(events: SimulationEvent[], uptoIndex: number): SimulationState` (fold.ts). All later tasks import these from `@underhood/simulation-engine`.

- [ ] **Step 1: Write failing tests** for `deriveState`:

```typescript
import { describe, it, expect } from 'vitest';
import { deriveState } from '../fold';
import type { SimulationEvent } from '../types';
import { EV } from '../fold'; // tiny test helper: EV(type, overrides) -> minimal event

const ev = (i: number, type: string, source?: string, target?: string, payload?): SimulationEvent =>
  ({ id: `e${i}`, type, timestamp: i * 100, duration: 100, source, target, payload,
     explanation: { title: type, body: '' } });

describe('deriveState', () => {
  it('initial state: currentStep -1, all components idle, empty log', () => {
    const s = deriveState([ev(0, 'COMMAND_ENTERED', 'terminal', 'cli')], -1);
    expect(s.currentStep).toBe(-1);
    expect(s.log).toHaveLength(0);
    expect(Object.values(s.components).every(c => c.status === 'idle')).toBe(true);
  });

  it('COMMAND_ENTERED stores the command on terminal and logs it', () => {
    const s = deriveState([ev(0, 'COMMAND_ENTERED', 'terminal', 'cli', { command: 'docker run nginx' })], 0);
    expect(s.components.terminal.data.command).toBe('docker run nginx');
    expect(s.log.at(-1)?.text).toContain('docker run nginx');
  });

  it('LAYER_PULL events accumulate layers on image-store in order', () => {
    const events = [
      ev(0, 'LAYER_PULL', 'registry', 'image-store', { layerIndex: 1, name: 'base image', digest: 'aaa' }),
      ev(1, 'LAYER_PULL', 'registry', 'image-store', { layerIndex: 2, name: 'binaries', digest: 'bbb' }),
    ];
    const s = deriveState(events, 1);
    expect(s.components['image-store'].data.layers).toEqual([
      { layerIndex: 1, name: 'base image', digest: 'aaa' }, { layerIndex: 2, name: 'binaries', digest: 'bbb' },
    ]);
  });

  it('container lifecycle: absent -> created -> networked -> running', () => {
    const events = [
      ev(0, 'CONTAINER_CREATED', 'daemon', 'container', { containerId: 'e4f5a6b7c8', writableLayer: true }),
      ev(1, 'NETWORK_ATTACHED', 'daemon', 'container', { ip: '172.17.0.2', network: 'bridge', veth: 'veth7a2b' }),
      ev(2, 'PROCESS_STARTED', 'container', 'container', { pid: 1, process: 'nginx: master process' }),
      ev(3, 'CONTAINER_RUNNING', 'container', 'terminal', { status: 'running' }),
    ];
    const mid = deriveState(events, 1);
    expect(mid.components.container.data.containerId).toBe('e4f5a6b7c8');
    expect(mid.components.container.data.ip).toBe('172.17.0.2');
    expect(mid.components.container.data.pid).toBeUndefined();
    const end = deriveState(events, 3);
    expect(end.components.container.status).toBe('done');
    expect(end.components.container.data.pid).toBe(1);
    expect(end.components.container.data.running).toBe(true);
  });

  it('replaying to an earlier index equals a fresh fold to that index (determinism)', () => {
    const events = [
      ev(0, 'COMMAND_ENTERED', 'terminal', 'cli', { command: 'x' }),
      ev(1, 'CONTAINER_CREATED', 'daemon', 'container', { containerId: 'abc' }),
      ev(2, 'CONTAINER_RUNNING', 'container', 'terminal'),
    ];
    expect(deriveState(events, 1)).toEqual(deriveState(events, 1));
    expect(deriveState(events, 0).components.container.data.containerId).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run** `npm test -w packages/simulation-engine` — expect FAIL (module not found).

- [ ] **Step 3: Implement types + fold**

`types.ts`:
```typescript
export interface EventExplanation {
  title: string;
  body: string;
  concept?: string; // key-idea callout, rendered prominently
}

export interface SimulationEvent {
  id: string;
  type: string;
  timestamp: number; // sim-time ms, cumulative from durations
  duration: number;  // ms this transition takes at 1x speed
  source?: string;   // component id
  target?: string;   // component id
  payload?: Record<string, unknown>;
  explanation: EventExplanation;
}

export type ComponentStatus = 'idle' | 'active' | 'done' | 'absent';

export interface ComponentRuntime {
  id: string;
  status: ComponentStatus;
  label?: string;                      // transient status line inside the node
  data: Record<string, unknown>;       // component-specific accumulated state
}

export interface LogEntry {
  eventIndex: number;
  text: string;
}

export interface SimulationState {
  currentStep: number; // index of last applied event; -1 = nothing applied yet
  components: Record<string, ComponentRuntime>;
  log: LogEntry[];
}
```

`fold.ts`: pure fold over events, with an explicit handler per known event type (deterministic, auditable). Component ids: `terminal`, `cli`, `daemon`, `registry`, `image-store`, `container`. Status rules: `source` of the in-flight event becomes `active`; phase-ending events mark their components `done`; `container` starts `absent` until `CONTAINER_CREATED`. Each event pushes a human-readable `LogEntry` (from payload, e.g. `Pull complete fbcc8b…`).

```typescript
import type { SimulationEvent, SimulationState, ComponentRuntime } from './types';

export const COMPONENT_IDS = ['terminal', 'cli', 'daemon', 'registry', 'image-store', 'container'] as const;

const initialComponents = (): Record<string, ComponentRuntime> =>
  Object.fromEntries(COMPONENT_IDS.map(id => [
    id,
    { id, status: id === 'container' ? 'absent' : 'idle', data: {} } as ComponentRuntime,
  ]));

type Handler = (s: SimulationState, e: SimulationEvent) => void;

const handlers: Record<string, Handler> = {
  COMMAND_ENTERED: (s, e) => {
    const term = s.components.terminal;
    term.data.command = e.payload?.command;
    term.status = 'done';
    s.log.push({ eventIndex: s.currentStep, text: `$ ${String(e.payload?.command ?? '')}` });
    s.components.cli.status = 'active';
    s.components.cli.label = 'parsing command';
  },
  CLI_REQUEST: (s, e) => {
    s.components.cli.status = 'active';
    s.components.cli.label = `${e.payload?.method} ${e.payload?.path}`;
    s.components.daemon.status = 'active';
    s.components.daemon.label = 'handling API request';
    s.log.push({ eventIndex: s.currentStep, text: `cli -> daemon: ${e.payload?.method} ${e.payload?.path}` });
  },
  IMAGE_LOOKUP: (s) => {
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
    s.log.push({ eventIndex: s.currentStep, text: `daemon -> ${e.payload?.registry}: auth, fetch manifest` });
  },
  MANIFEST_FETCHED: (s, e) => {
    s.components.registry.label = `manifest: ${e.payload?.layers} layers`;
    s.log.push({ eventIndex: s.currentStep, text: `manifest fetched (${e.payload?.layers} layers)` });
  },
  LAYER_PULL: (s, e) => {
    const store = s.components['image-store'];
    store.status = 'active';
    store.label = `pulling layer ${e.payload?.layerIndex}/${e.payload?.total}`;
    const layers = (store.data.layers as unknown[]) ?? (store.data.layers = []);
    layers.push({ layerIndex: e.payload?.layerIndex, name: e.payload?.name, digest: e.payload?.digest });
    s.components.registry.label = `serving ${(e.payload?.name as string)?.split(' ')[0]} blob`;
    s.log.push({ eventIndex: s.currentStep, text: `${e.payload?.digest}: Pull complete` });
  },
  IMAGE_READY: (s, e) => {
    s.components['image-store'].status = 'done';
    s.components['image-store'].label = 'image ready';
    s.components.registry.status = 'done';
    s.components.daemon.label = `image ${e.payload?.image} ready`;
    s.log.push({ eventIndex: s.currentStep, text: `Status: Downloaded newer image for ${e.payload?.image}` });
  },
  CONTAINER_CREATED: (s, e) => {
    const c = s.components.container;
    c.status = 'active';
    c.data.containerId = e.payload?.containerId;
    c.data.writableLayer = true;
    c.label = 'container created';
    s.components.daemon.label = 'container created';
    s.log.push({ eventIndex: s.currentStep, text: `container ${e.payload?.containerId} created (writable layer added)` });
  },
  NETWORK_ATTACHED: (s, e) => {
    const c = s.components.container;
    c.data.ip = e.payload?.ip;
    c.data.network = e.payload?.network;
    c.data.veth = e.payload?.veth;
    c.label = `network: ${e.payload?.network}`;
    s.log.push({ eventIndex: s.currentStep, text: `connected to bridge (${e.payload?.veth}) -> ${e.payload?.ip}` });
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
    s.log.push({ eventIndex: s.currentStep, text: 'STATUS: Running — nginx is up' });
  },
};

export function deriveState(events: SimulationEvent[], uptoIndex: number): SimulationState {
  const state: SimulationState = { currentStep: -1, components: initialComponents(), log: [] };
  const last = Math.min(uptoIndex, events.length - 1);
  for (let i = 0; i <= last; i++) {
    const e = events[i];
    state.currentStep = i;
    handlers[e.type]?.(state, e);
  }
  return state;
}
```

(If a test needs the `EV` helper, export a `makeEvent` from fold.ts; adjust test imports accordingly.)

- [ ] **Step 4: Run tests** — PASS. Export types + `deriveState` + `COMPONENT_IDS` from `index.ts`.

- [ ] **Step 5: Commit** — `feat(engine): event types and deterministic state fold`

---

### Task 3: Engine — SimulationPlayer

**Files:**
- Create: `packages/simulation-engine/src/player.ts`
- Test: `packages/simulation-engine/src/__tests__/player.test.ts`
- Modify: `packages/simulation-engine/src/index.ts`

**Interfaces:**
- Consumes: `SimulationEvent[]`, `deriveState`.
- Produces:
```typescript
export interface PlayerSnapshot {
  status: 'idle' | 'playing' | 'paused' | 'ended';
  currentStep: number;        // -1 .. events.length-1
  speed: number;              // one of 0.5 | 1 | 2 | 4
  state: SimulationState;     // deriveState(events, currentStep)
}
export class SimulationPlayer {
  constructor(events: SimulationEvent[]);
  play(): void; pause(): void; next(): void; prev(): void;
  seek(step: number): void;   // clamps to [-1, events.length-1]
  restart(): void;
  setSpeed(speed: number): void;
  subscribe(fn: () => void): () => void;
  getSnapshot(): PlayerSnapshot;  // stable identity until state changes
  destroy(): void;
}
```
Timing: on `play`, apply the *next* event immediately, then wait `events[currentStep].duration / speed` before applying the following one (setTimeout chain; re-arm the current wait when speed changes; clear on pause/seek/destroy).

- [ ] **Step 1: Write failing tests** (vitest fake timers):
  - `next()` from idle applies event 0; `prev()` returns to -1.
  - `play()` auto-advances: after advancing timers by durations, currentStep increments; at the end `status === 'ended'` and no further advance.
  - `pause()` freezes; `play()` resumes from where it stopped.
  - `setSpeed(2)` halves the wait (assert with fake timers).
  - `seek(5)` produces `state` equal to `deriveState(events, 5)`.
  - `restart()` → currentStep -1, status 'idle', log empty.
  - `getSnapshot()` returns the same object identity until a mutation.
  - `subscribe` fires on `next()`.
- [ ] **Step 2: Run** — FAIL (module not found).
- [ ] **Step 3: Implement** `SimulationPlayer` with a private `emit()` that rebuilds `this.snapshot` (new identity) and notifies subscribers. Guard timer cleanup in `destroy()`.
- [ ] **Step 4: Run tests** — PASS. Export from `index.ts`.
- [ ] **Step 5: Commit** — `feat(engine): simulation player with play/pause/step/seek/speed`

---

### Task 4: Engine — scenario schema + YAML parsing

**Files:**
- Create: `packages/simulation-engine/src/scenario.ts`
- Test: `packages/simulation-engine/src/__tests__/scenario.test.ts`
- Modify: `packages/simulation-engine/src/index.ts`

**Interfaces:**
- Produces:
```typescript
export interface ScenarioDef { id: string; name: string; events: EventDef[]; }
export interface EventDef { type: string; source?: string; target?: string;
  duration?: number; payload?: Record<string, unknown>;
  explanation: { title: string; body: string; concept?: string }; }
export function parseSimulationYaml(text: string): ScenarioDef[]      // zod-validated
export function materializeEvents(scenario: ScenarioDef): SimulationEvent[] // ids + cumulative timestamps
export function parseConceptsYaml(text: string): Record<string, ConceptDef>
export interface ConceptDef { name: string; summary: string; details: string[]; }
export function parseOverviewYaml(text: string): { title: string; summary: string }
```
Validation errors must name the offending field/path (zod's message).

- [ ] **Step 1: Failing tests**: valid minimal YAML parses; YAML missing `explanation.title` on an event throws; `materializeEvents` assigns `e0, e1, …` ids and cumulative timestamps (`t[i] = t[i-1] + duration[i-1]`, default duration 800).
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** with zod schemas mirroring the interfaces above.
- [ ] **Step 4: Run tests** — PASS. Export from `index.ts`.
- [ ] **Step 5: Commit** — `feat(engine): scenario YAML schema, parser, and event materializer`

---

### Task 5: Docker run content

**Files:**
- Create: `content/docker/docker-run/overview.yaml`
- Create: `content/docker/docker-run/simulation.yaml`
- Create: `content/docker/docker-run/concepts.yaml`

**Interfaces:**
- Consumes: Task 4 schemas.
- Produces: two scenarios — `pull` (15 events, cold) and `cached` (8 events) — and inspection content for all six components.

- [ ] **Step 1: Write `simulation.yaml`** — scenario `pull` event list (types/payloads must match Task 2 handlers exactly):

  1. `COMMAND_ENTERED` terminal→cli `{command: "docker run nginx"}` — "You run `docker run nginx`" (concept: `docker run` = create + start; the CLI is just a client).
  2. `CLI_REQUEST` cli→daemon `{method: POST, path: /v1.47/containers/create}` (concept: client/server over the Docker socket — CLI is not the container).
  3. `IMAGE_LOOKUP` daemon→image-store `{image: nginx:latest}` (concept: daemon checks the local store first).
  4. `IMAGE_MISS` image-store→daemon `{reason: not-found}`.
  5. `REGISTRY_REQUEST` daemon→registry `{registry: registry-1.docker.io}` (concept: registries serve manifests + layer blobs).
  6. `MANIFEST_FETCHED` registry→daemon `{layers: 4}`.
  7–10. `LAYER_PULL` registry→image-store `{layerIndex: 1..4, total: 4, name, digest}` — layers: `base image (bookworm-slim)`, `base distribution (apt packages)`, `nginx binaries`, `nginx configuration`; fake digests `fbcc8b0e…` etc. (concept: layered filesystem; layers are reusable and cached).
  11. `IMAGE_READY` image-store→daemon `{image: nginx:latest}` — "Status: Downloaded newer image".
  12. `CONTAINER_CREATED` daemon→container `{containerId: e4f5a6b7c8, writableLayer: true}` (concept: image = read-only template; container = image + writable layer).
  13. `NETWORK_ATTACHED` daemon→container `{network: bridge, ip: 172.17.0.2, veth: veth7a2b}` (concept: bridge network + veth pair + network namespace).
  14. `PROCESS_STARTED` container→container `{pid: 1, process: "nginx: master process"}` (concept: a container is an isolated process sharing the host kernel — PID namespace makes nginx PID 1; not a VM).
  15. `CONTAINER_RUNNING` container→terminal `{status: running}`.

  Scenario `cached`: events 1–3, then `IMAGE_HIT` image-store→daemon, then events 12–15.

  Every event carries `explanation.title/body` (2–3 sentences, technically accurate) and most carry `explanation.concept`.
- [ ] **Step 2: Write `concepts.yaml`** — for `terminal`, `cli`, `daemon`, `registry`, `image-store`, `container`: name, summary, 3–5 detail bullets (image vs container, client/server, layers read-only + writable top, namespaces/cgroups in one accurate line each).
- [ ] **Step 3: Write `overview.yaml`** — title "What happens when you run `docker run nginx`?" + one-paragraph summary.
- [ ] **Step 4: Add engine test** that parses the real YAML files (read via `fs` from repo root, so content regressions fail CI).
- [ ] **Step 5: Run tests** — PASS. Commit — `feat(content): docker run nginx scenarios (pull + cached) and concept content`

---

### Task 6: Web — content loading + useSimulation hook

**Files:**
- Create: `apps/web/src/content/loader.ts`
- Create: `apps/web/src/simulation/useSimulation.ts`
- Modify: `apps/web/vite.config.ts` (allow importing from repo-root `content/`)

**Interfaces:**
- Consumes: engine parsers; `SimulationPlayer`.
- Produces:
```typescript
// loader.ts
export interface DockerRunContent { overview: {title: string; summary: string};
  scenarios: Record<string, ScenarioDef>; concepts: Record<string, ConceptDef>; }
export function loadDockerRunContent(): DockerRunContent  // ?raw imports + parse (throws loudly on invalid)
// useSimulation.ts
export function useSimulation(scenarioId: 'pull' | 'cached'): {
  snapshot: PlayerSnapshot; player: SimulationPlayer; events: SimulationEvent[] }
```
Hook creates the player in `useState`/`useRef`, subscribes via `useSyncExternalStore(player.subscribe, player.getSnapshot)`, destroys on unmount, and recreates when `scenarioId` changes.

- [ ] **Step 1: Implement loader** — `import overviewRaw from '../../../../content/docker/docker-run/overview.yaml?raw'` etc.; parse with Task 4 functions. In `vite.config.ts` add `server.fs.allow: ['<repo root>']`.
- [ ] **Step 2: Implement hook** as specified.
- [ ] **Step 3: Verify** — `npm run test:web` (add a vitest test asserting `loadDockerRunContent()` returns 2 scenarios and 6 concepts) and `npm run dev` still boots (import the loader in App temporarily). 
- [ ] **Step 4: Commit** — `feat(web): content loader and useSimulation hook`

---

### Task 7: Web — graph canvas

**Files:**
- Create: `apps/web/src/components/Canvas.tsx`
- Create: `apps/web/src/components/nodes/NodeShell.tsx` (+ `TerminalNode`, `CliNode`, `DaemonNode`, `RegistryNode`, `ImageStoreNode`, `ContainerNode`, `DockerHostGroup`)
- Modify: `apps/web/src/App.tsx`

**Interfaces:**
- Consumes: `SimulationState`, current event (for edge highlighting), `onSelect(componentId)` callback.
- Produces: the React Flow graph rendering all six components + a "Docker host" group node.

Layout (React Flow coordinates; group at (400,170) 760×450, children positioned relative with `parentId` + `extent: 'parent'`):
- `terminal` (20, 40) — outside group; shows `$ docker run nginx` + tail of log lines.
- `cli` (250, 40) — outside group.
- `registry` (770, 20) — outside group.
- `docker-host` group — contains: `daemon` (30, 60), `image-store` (300, 250), `container` (550, 60).
- Edges: terminal→cli, cli→daemon, daemon→registry, registry→image-store, daemon→image-store, daemon→container.

Node visuals by status: `idle` muted; `active` accent border + pulse; `done` settled accent; `container` renders as dashed empty placeholder while `absent`. `ImageStoreNode` renders a 4-slot layer stack filling bottom-up as `data.layers` grows (each slot labeled). `ContainerNode` renders image-layers (muted) + distinct `writable layer` chip when created, `IP 172.17.0.2` chip on network attach, `PID 1 · nginx` chip on process start, running glow at the end. Edge for the current event (`source`→`target`) gets `animated: true` + accent color. All nodes clickable → `onSelect(id)`.

- [ ] **Step 1: Implement `NodeShell`** (title bar, status dot, label line, children slot) and the six node components + group node.
- [ ] **Step 2: Implement `Canvas.tsx`** — `nodeTypes`/`edgeTypes` maps, memoized nodes/edges derived from `state` + `currentEvent`, `fitView`, `nodesDraggable={false}` (or drag-within-parent only), `proOptions={{hideAttribution: false}}` keep default attribution.
- [ ] **Step 3: Wire into App** with a hardcoded initial state to verify visually; check `npm run dev`.
- [ ] **Step 4: Commit** — `feat(web): React Flow canvas with docker run components`

---

### Task 8: Web — playback controls + explanation panel + timeline

**Files:**
- Create: `apps/web/src/components/ControlsBar.tsx`
- Create: `apps/web/src/components/ExplanationPanel.tsx`
- Create: `apps/web/src/components/Timeline.tsx`
- Modify: `apps/web/src/App.tsx`

**Interfaces:**
- Consumes: `useSimulation` snapshot + player + events.
- Produces: full §7 interaction model — Play, Pause, Step Forward, Step Backward, Restart, Speed (0.5x/1x/2x/4x), plus timeline scrubbing and the synced step explanation.

`ControlsBar`: restart (⏮), prev (◀), play/pause (▶/⏸), next (▶), speed `<select>`; disabled states: prev at -1, next/play at last event (play becomes replay-hint: disabled, restart enabled).
`ExplanationPanel`: step counter (`Step 3 / 15`), current event `explanation.title`, `body`, and `concept` callout box.
`Timeline`: one clickable tick per event (filled when ≤ currentStep, accent on current), plus a scrollable log list (text + step number) that auto-scrolls to the current entry and seeks on click.
`App`: header with `overview.title` + scenario toggle (`Pull image` / `Image cached` → switches scenario id, which resets the player via Task 6) + layout: canvas center, right panel (explanation + inspector from Task 9), bottom bar (controls + timeline).

- [ ] **Step 1: Implement the three components and App wiring.**
- [ ] **Step 2: Web test**: render App, click Next twice → step counter reads `Step 3 / 15`; click a later timeline tick → explanation title updates; scenario toggle switches to 8 events. (Vitest + @testing-library/react + jsdom; add deps to apps/web.)
- [ ] **Step 3: Run `npm run test:web`** — PASS. Verify manually in dev server.
- [ ] **Step 4: Commit** — `feat(web): playback controls, explanation panel, and timeline`

---

### Task 9: Web — inspector

**Files:**
- Create: `apps/web/src/components/InspectorPanel.tsx`
- Modify: `apps/web/src/App.tsx`

**Interfaces:**
- Consumes: `concepts` from loader, selected component id, live `SimulationState`.
- Produces: contextual inspection under the explanation panel: concept `name`, `summary`, `detail` bullets, plus a live-state table derived from `state.components[id].data` (e.g. container → ID, IP, network, PID, status; image-store → layers pulled count/list).

- [ ] **Step 1: Implement** — selection state in App (`useState<string | null>`), Canvas `onSelect` sets it, panel shows Inspector when set; ✕ clears.
- [ ] **Step 2: Verify in browser**: click Container mid-simulation → ID/IP/PID appear as simulation progresses.
- [ ] **Step 3: Commit** — `feat(web): component inspector with live state`

---

### Task 10: Visual design pass + final verification

**Files:**
- Modify: `apps/web/src/styles.css` (+ any component styles)
- Create/Modify: `README.md`

- [ ] **Step 1:** Invoke the `frontend-design` skill and do a full visual pass: dark technical theme, monospace accents for the terminal heritage, one accent color family (Docker blue), clear hierarchy, restrained animation (pulse on active node, marching-dash edges, layer fill transitions). No stock-dashboard look.
- [ ] **Step 2:** Browser-verify the complete flow end to end (play all 15 events, step back/forward, scrub, switch scenario, inspect every component, restart). Fix issues found.
- [ ] **Step 3:** README: what this is (link spec), how to run (`npm install`, `npm run dev`, `npm test`), repo layout, content authoring note (edit YAML under `content/`).
- [ ] **Step 4:** Run full test suite + `npm run build` — all green.
- [ ] **Step 5: Commit** — `feat: polish visual design; add README` 

---

## Self-Review

- **Spec coverage vs §23 MVP requirements:** CLI ✓ (T2/T5/T7), daemon ✓, image lookup ✓ (+ cached branch), registry ✓, image pull ✓, image layers ✓ (4-slot stack), container creation ✓, network setup ✓, process startup ✓, running state ✓, step-by-step animation ✓ (T8), play/pause/prev/next/restart ✓ (T3/T8), component inspection ✓ (T9), timeline ✓ (T8). Speed control from §7 ✓. Explicitly out of scope per §23: 3D, backend, AI, failure scenarios (Phase 7), build visualization (Phase 5).
- **Placeholders:** none — every step names files and shows code or exact payloads.
- **Type consistency:** event type strings and payload keys are identical across T2 (handlers), T5 (YAML), T7 (node rendering); `deriveState`/`PlayerSnapshot`/loader signatures are used verbatim in T6–T9.
