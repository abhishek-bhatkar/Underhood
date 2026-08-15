# Underhood

A visual learning engine for understanding how technical systems actually work.

> **Don't just read how it works. Watch it work.**

**Try it live: <https://abhishek-bhatkar.github.io/Underhood/>**

One engine, many systems. Each topic is **content** — components, event
sequences, and explanations as validated YAML — rendered by the same
simulation engine and UI. Every experience has a happy-path scenario plus a
failure scenario (each spec's acceptance principle requires at least one).

| Topic | Experience | Scenarios |
| --- | --- | --- |
| Docker | `docker run nginx` | Pull image · Image cached |
| JVM | Run a Java program | Run program · Stack overflow |
| Kubernetes | Create a Deployment (3 replicas) | Apply · Pod crash + self-healing |
| Kafka | Produce a message | Produce + consume · Broker failure |
| Networking | Request `https://example.com` | HTTPS request · DNS failure |
| Linux | Make a system call | `write()` · Permission denied |
| Databases | Run a SQL query (PostgreSQL) | Indexed SELECT · UPDATE transaction |
| V8 | Run a JS function | Run + tiering · Deoptimization |
| System Design | URL shortener under load | Resolve (miss → hit) · DB failure + failover |

Full product vision: [`spec/visual-technical-systems-plan.md`](spec/visual-technical-systems-plan.md).
Topic specs live next to it (`spec/02-kubernetes.md` … `spec/09-system-design.md`).

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

Open the live site (or `npm run dev` locally), pick a topic from the home
page, and:

1. Press **play** and watch the simulation run.
2. **Step** through events one at a time; the right panel explains each.
3. **Click any component** to inspect it — including live state as the
   simulation progresses.
4. Switch **scenarios** (Pull image vs Image cached, Run program vs Stack
   overflow, …) and watch the same machinery take a different path.
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
Phase 9 test passed twice over: JVM and then seven more topics landed with
**zero engine/UI code changes** — only YAML. The generic content validator
(`packages/simulation-engine/src/__tests__/topics.test.ts`) checks every
topic automatically: schema, event well-formedness, and settled end states.

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
