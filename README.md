# Underhood

A visual learning engine for understanding how technical systems actually work.

> **Don't just read how it works. Watch it work.**

The first experience explains **what happens when you run `docker run nginx`**:
the command travels from the CLI to the daemon, the image is found (or pulled
layer by layer from a registry), a container is assembled around it — writable
layer, bridge network, PID 1 — and nginx comes up. Every step is an event in a
deterministic simulation you can play, pause, scrub, and inspect.

Full product vision: [`spec/visual-technical-systems-plan.md`](spec/visual-technical-systems-plan.md).

## Run it

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other commands:

```bash
npm test           # simulation-engine unit tests (fold, player, content schema)
npm run test:web   # web integration tests (controls, timeline, inspector)
npm run build      # production build of the web app
```

## Try this

1. Press **play** and watch `docker run nginx` travel through the system.
2. **Step** through the 15 events one at a time; the right panel explains each.
3. **Click any component** (CLI, daemon, registry, image store, container) to
   inspect it — including its live state as the simulation progresses.
4. Switch to the **Image cached** scenario and watch the pull phase vanish.
5. Scrub the **timeline** at the bottom to jump to any event.

## Architecture

Simulation first, animation second. State and events are the source of truth;
renderers derive everything from them.

```text
content/docker/docker-run/*.yaml        structured, validated content (zod)
        |
packages/simulation-engine              framework-agnostic TypeScript
        |--- types + fold               event-sourced state (rewind is free)
        |--- player                     play/pause/step/seek/speed
        |--- scenario                   YAML schemas + event materializer
        |
apps/web (React + Vite + React Flow)
        |--- content/loader             parses + validates bundled YAML
        |--- simulation/useSimulation   binds the player via useSyncExternalStore
        |--- components/Canvas          node graph derived from SimulationState
        |--- controls, timeline, panels HTML/CSS
```

Engineering principles (from the spec): deterministic simulations, renderer
separate from content, no premature backend/AI/3D, content as data.

## Adding content

The Docker explanation lives in YAML, not component code:

- `content/docker/docker-run/simulation.yaml` — event sequences per scenario
- `content/docker/docker-run/concepts.yaml` — component inspection content
- `content/docker/docker-run/overview.yaml` — title and summary

The engine validates all of it at load time (`packages/simulation-engine/src/scenario.ts`),
so malformed content fails loudly. Tests in
`packages/simulation-engine/src/__tests__/content.test.ts` guard the real files.
