# One Engine, Many Systems — JVM as Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize the four Docker-coupled spots (fold handlers, canvas, loader, inspector) so a topic is added as content only, then add the JVM experience ("What happens when you run a Java program?") per `spec/05-jvm.md`.

**Architecture:** The engine's hardcoded event-handler table becomes a declarative effect interpreter (`status`/`label`/`set`/`push`/`pop`/`remove`/`log` ops with `$payload.x` templating) so scenario YAML fully defines state transitions. The web canvas becomes driven by a per-experience `visuals.yaml` over five generic node kinds (terminal, panel, stack, list, group). Content is discovered via `import.meta.glob` into a topic registry; hash routing selects topic/experience. Docker is ported with zero behavior change (existing tests guard this); JVM lands as four YAML files.

**Tech Stack:** unchanged — TypeScript, React 18, Vite 5, @xyflow/react, yaml + zod, Vitest.

**Spec:** `spec/visual-technical-systems-plan.md` (§8–10, §14, Phase 9) + `spec/05-jvm.md` (MVP: source → bytecode → class loading → stack/heap → execution; failure: StackOverflowError; abstractions must be labelled).

## Global Constraints

- Existing Docker behavior must not change: all current tests (34 engine + 7 web) stay green, only rewritten to construct declarative effects where they referenced handlers.
- Renderer stays separate from domain content; no topic-specific code in engine or Canvas.
- Deterministic simulation (spec §26); JVM educational simplifications labelled as abstractions (spec 05-jvm §Technical Accuracy).
- No new runtime dependencies (zod moves to web's own package.json for the visuals schema — already hoisted).

---

### Task 1: Engine — declarative effects interpreter (TDD)

**Files:** Modify `packages/simulation-engine/src/{types,scenario,fold,player,index}.ts`; rewrite `src/__tests__/{fold,player,scenario}.test.ts`.

**Interfaces (produces):**
```typescript
export type Effect =
  | { op: 'status'; component: string; status: ComponentStatus }   // ComponentStatus gains 'error'
  | { op: 'label'; component: string; text?: string }              // no text clears the label
  | { op: 'set'; component: string; data: Record<string, unknown> }
  | { op: 'push'; component: string; key: string; value: Record<string, unknown> }
  | { op: 'pop'; component: string; key: string }
  | { op: 'remove'; component: string; key: string; match: Record<string, string | number> }
  | { op: 'log'; text: string };
export interface ComponentInit { id: string; initial?: ComponentStatus }
export interface EventDef { ...existing; effects?: Effect[] }
export interface ScenarioDef { id; name; components?: ComponentInit[]; events: EventDef[] }
export function deriveState(events, uptoIndex, initial?: ComponentInit[]): SimulationState
export class SimulationPlayer { constructor(events, initial?: ComponentInit[]) }
```
- [ ] Rewrite fold tests: same behavioral assertions (statuses/labels/data/log/lifecycle/purity) using events with `effects`; unknown event types are no-ops; templates interpolate `$payload.x` (missing → empty string); `pop`/`remove` behave; components initialize from `initial` (default: empty record).
- [ ] Run → RED; implement interpreter in fold.ts (delete Docker handler table; keep `makeEvent` helper accepting effects); run → GREEN; tsc clean.
- [ ] Update player tests: first event carries a `set` effect; `new SimulationPlayer(events, [{id:'container', initial:'absent'}])` respected. Scenario schema tests: effects validated by discriminated union; bad op rejected; components list validated.

### Task 2: Port Docker content to effects + visuals

**Files:** Modify `content/docker/docker-run/{simulation,concepts}.yaml`; create `content/docker/docker-run/visuals.yaml`, `content/docker/topic.yaml`; delete `packages/simulation-engine/src/__tests__/content.test.ts` path assumptions if needed.

- [ ] simulation.yaml: add `components:` init list (container → absent) and translate every handler exactly into `effects` (same labels, logs, data keys, layer pushes). content.test.ts expectations (15/8 events, types sequence, log strings) unchanged.
- [ ] concepts.yaml: add `fields:` per component (container: containerId/network/ip/pid/process; image-store via layers count handled generically; terminal: command; cli/daemon/registry: none beyond auto status).
- [ ] visuals.yaml: reproduce current layout/kinds — terminal/cli/registry as terminal/panel/panel; daemon panel; image-store stack (slots 4, emptyLabel `layer $index — empty`, itemTemplate `$value.name`, subTemplate `$value.digest`); container stack (key `stack`, chips [ip/pid/running], footerKey containerId; CONTAINER_CREATED pushes writable + 4 image layer items with `variant`); group node; edges with handle ids.
- [ ] topic.yaml: `{name: Docker}`. All engine tests green.

### Task 3: Web — visuals schema + generic canvas node kinds

**Files:** Create `apps/web/src/content/visuals.ts` (zod schema + parse), `apps/web/src/components/nodes/{PanelNode,StackNode,ListNode}.tsx`; rewrite `Canvas.tsx` to build nodes/edges from visuals; delete `nodes/{CliNode,DaemonNode,RegistryNode,ImageStoreNode,ContainerNode}.tsx`; NodeShell gains node-level `chips` support; add zod to web deps.

**Interfaces:** `visuals.ts` exports `VisualsDef { nodes: NodeVisual[]; edges: EdgeDef[] }`; `NodeVisual { id, kind: 'terminal'|'panel'|'stack'|'list'|'group', position, size, parent?, label?, lines?, key?, slots?, emptyLabel?, itemTemplate?, subTemplate?, itemVariantKey?, chips?, footerKey?, handles[] }`.
- [ ] Schema + parse test (web).
- [ ] Implement kinds: panel (static lines), stack (fixed slots or dynamic push/pop rows, bottom-up, per-item variant class, chips row, footer), list (rows from data key), terminal/group unchanged. Chips: `{key, text, variant?}` rendered when data[key] defined, text templated with `$value`.
- [ ] Canvas reads visuals + state; handles from config; same edge activity logic (source→target match). Browser-check Docker renders identically (DOM snapshot).

### Task 4: Web — topic registry, hash routing, generic shell

**Files:** Rewrite `apps/web/src/content/loader.ts` → `registry.ts` using `import.meta.glob('../../../../content/**\/*.yaml', {query:'?raw', import:'default', eager:true})`; create `apps/web/src/ExperienceView.tsx`, `apps/web/src/Home.tsx`; rewrite `App.tsx` (hash router `#/topic/experience`), `InspectorPanel.tsx` (fields-driven), index.css (+error status, chips-on-panel, home styles).

- [ ] registry: parse every YAML by filename role (topic/overview/simulation/concepts/visuals), validate, expose `topics: Record<topicId, {name, experiences: Record<expId, Experience>}>`; loud errors naming the file.
- [ ] App: hash sync both directions; Home lists topics/experiences with summaries; ExperienceView = current App body parameterized (title from overview, scenario toggle from scenario names, restart on switch).
- [ ] Inspector: auto `status` row (runtime.status, red when error) + concept `fields` rows (data[key] ?? '—').
- [ ] Update App.test.tsx: default route → docker (existing assertions); `#/jvm/run-java` renders JVM; loader test → registry test (2 topics).

### Task 5: JVM content

**Files:** Create `content/jvm/topic.yaml`, `content/jvm/run-java/{overview,simulation,concepts,visuals}.yaml`.

- [ ] Components: terminal, javac, classfile, classloader, method-area, heap, stack (thread stack), engine; group `jvm` contains classloader/method-area/heap/stack/engine. Events (~15, scenario `run`): COMPILE_COMMAND → CLASSFILE_CREATED → RUN_COMMAND → JVM_STARTED → LOAD_REQUESTED → DELEGATED → CLASS_READ → CLASS_DEFINED (pushes Object/String/Hello into method area) → CLASS_VERIFIED → CLASS_INITIALIZED → MAIN_INVOKED (stack push) → METHOD_CALLED (push compute frame) → OBJECT_ALLOCATED (heap push) → METHOD_RETURNED (pop) → HOT_LOOP + JIT_COMPILED (engine chip "JIT: C2") → PROGRAM_COMPLETED. Scenario `stack-overflow` (~9 events): recursion pushes frames then `error` status + StackOverflowError log.
- [ ] Explanations technically accurate; overview/concepts label simplifications as abstractions; every event has explanation + concept where valuable.
- [ ] visuals.yaml: terminal/javac/classfile(list) outside group; jvm group with classloader(panel, delegation lines), method-area(list), heap(list), stack(stack kind, push/pop frames), engine(panel + jit chip). Layout mirrors Docker grid.
- [ ] content tests in engine `__tests__/content.test.ts` extended for jvm files (both scenarios parse, event counts, all sources/targets known).

### Task 6: Verification, browser pass, docs

- [ ] All tests green (engine + web), `npm run build` clean, tsc clean.
- [ ] Browser: docker route unchanged visually+interactively; jvm route: play to end, frames push/pop, heap object appears, JIT chip, scenario switch to stack-overflow shows error state; inspector on classloader/heap/stack.
- [ ] README: update architecture (registry, visuals, node kinds, adding a topic), CI deploys on main push (already set up). Commit `feat: generalize engine to one-engine-many-systems; add JVM experience`.

## Self-Review

- Spec 05-jvm coverage: MVP flow ✓ (Task 5 run scenario), failure/edge case ✓ (stack-overflow), stack frames/heap/class loading/bytecode/JIT ✓, abstraction labelling ✓ (overview + concepts), shared interaction model ✓ (inherited).
- Docker behavior preserved: Tasks 2–3 are pure refactors guarded by unchanged content/App tests + DOM snapshot check.
- No placeholders; all interfaces named; types consistent across tasks (Effect/ComponentInit flow T1→T2→T5; VisualsDef T3→T4).
