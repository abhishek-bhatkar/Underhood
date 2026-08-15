# Underhood

A visual learning engine for understanding how technical systems actually work.

> **Don't just read how it works. Watch it work.**

One engine, many systems. Each topic is **content** — components, event
sequences, and explanations as validated YAML — rendered by the same
simulation engine and UI.

Current experiences:

- **Docker** — [what happens when you run `docker run nginx`?](https://abhishek-bhatkar.github.io/Underhood/#/docker/docker-run)
  pull vs cached scenarios: CLI → daemon → registry → layers → container.
- **JVM** — [what happens when you run a Java program?](https://abhishek-bhatkar.github.io/Underhood/#/jvm/run-java)
  run + stack-overflow scenarios: javac → classloading → runtime areas →
  execution, frames, heap, JIT.

Full product vision: [`spec/visual-technical-systems-plan.md`](spec/visual-technical-systems-plan.md).
Topic specs live next to it (`spec/05-jvm.md`, …).

## Run it

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm test           # simulation-engine unit tests (fold, player, content)
npm run test:web   # web tests (registry, routing, interactions)
npm run build      # production build of the web app
```

## Try this

1. From the home page, open an experience and press **play**.
2. **Step** through events one at a time; the right panel explains each.
3. **Click any component** to inspect it — including live state as the
   simulation progresses.
4. Switch **scenarios** (Pull image vs Image cached, Run program vs Stack
   overflow) and watch the same machinery take a different path.
5. Scrub the **timeline** at the bottom to jump to any event.

## Architecture

Simulation first, animation second. State and events are the source of truth;
renderers derive everything from them. Adding a topic is a content directory,
not a code change.

```text
content/<topic>/<experience>/
  topic.yaml (per topic)   name + description
  overview.yaml            title + summary (+ abstraction labelling)
  simulation.yaml          components + scenarios + events with declarative
                           `effects` (status/label/set/push/pop/remove/log,
                           `$payload.x` templates)
  concepts.yaml            component inspection content + live-state fields
  visuals.yaml             canvas: node kinds, positions, edges, chips

packages/simulation-engine      framework-agnostic TypeScript
  types + fold                  effect interpreter, event-sourced state
  player                        play/pause/step/seek/speed
  scenario                      zod schemas + YAML parsing

apps/web (React + Vite + React Flow)
  content/registry              discovers content/ via import.meta.glob
  content/visuals               visuals schema
  components/Canvas             generic graph renderer, node kinds:
                                terminal · panel · stack · list · group
  hash routing                  #/ = topic index, #/<topic>/<experience>
```

Engineering principles (from the spec): deterministic simulations, renderer
separate from content, no premature backend/AI/3D, content as data. The
Phase 9 test passed: JVM landed with **zero engine/UI code changes** — only
new YAML plus the visuals schema the generalization introduced.

## Adding a topic

1. Create `content/<topic>/topic.yaml` (`name`, `description`).
2. Create `content/<topic>/<experience>/` with the four files above.
3. That's it — the registry discovers it, the home page lists it, and the
   hash route `#/<topic>/<experience>` works. Validation is loud: malformed
   content fails at load time with the file and field named, and engine
   tests in `packages/simulation-engine/src/__tests__/content.test.ts` guard
   the real files.

Deploy: pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`.
