# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: working software engineers (inferred from spec/visual-technical-systems-plan.md §25,
whose success test is "a developer who already knows Docker can say 'I can see what Docker is
actually doing'"). They arrive self-directed, curious about a system they use or hear about
daily, and want a correct mental model in minutes - not certification, not reference docs.

Secondary (same spec section, confirmed by brief): beginners, who should understand the core
distinctions (image vs container, CLI vs daemon) "without needing to read a long article first."

## Product Purpose

Underhood is a visual learning engine where technical systems are explained by **watching a
deterministic simulation of them work**, event by event, rather than by reading text and
static diagrams. Success: a learner finishes an experience able to explain the system's major
components, the sequence of events, the state transitions, and at least one failure path
(every topic spec's acceptance principle).

## Positioning

The explanation itself is executable and inspectable. Neighboring products (documentation,
diagrams, video courses) present static or linear narratives; Underhood's differentiator is a
deterministic event-based simulation the learner can play, scrub, step, and break - with every
component clickable and every state change observable. Content is data (validated YAML over
one engine), so breadth across systems is a property of authoring, not engineering.

## Operating Context

- Runs fully client-side; deployed on GitHub Pages at
  https://abhishek-bhatkar.github.io/Underhood/ (hash-routed, deep-linkable per experience).
- Local development: `npm install && npm run dev` (Node 18+, npm workspaces monorepo).
- Nine topics currently: Docker, JVM, Kubernetes, Kafka, Networking, Linux, Databases
  (PostgreSQL), V8, System Design - each a primary simulation plus a failure scenario.
- Reader flow: home page catalog -> experience -> play/step through events -> inspect
  components -> switch scenarios -> scrub timeline. Dual dark/light theme, persisted.

## Capabilities and Constraints

Confirmed constraints from the platform spec (spec/visual-technical-systems-plan.md §26) and
implementation:

- Simulation first, animation second; state/events are the source of truth.
- Deterministic simulations only - replay and step-back must be exact.
- Renderer strictly separate from content; no topic-specific UI code.
- Content as data: topics are YAML directories discovered automatically at build time.
- Technical accuracy beats visual complexity; educational simplifications must be labeled
  (each topic spec's Technical Accuracy rule; `abstraction` field in overview.yaml).
- No backend, no accounts, no tracking (current phase; spec defers these deliberately).
- Explicitly undecided: interactive mid-simulation controls (traffic/server sliders from the
  system-design spec §19) - modeled as scenario variants for now, engine capability pending.

## Brand Commitments

- Name: Underhood. Tagline: "Don't just read how it works. Watch it work."
- Voice: plain, technically precise, terminal-literate; no marketing filler.
- Source: public at github.com/abhishek-bhatkar/Underhood.

## Evidence on Hand

- Nine complete content packages under `content/<topic>/<experience>/` (simulation events
  with explanations, concept text, visual layouts) - real, reviewed material, not lorem.
- Platform spec + nine domain specs under `spec/` - the product's own requirements docs.
- 101 engine tests + 9 web tests validating every scenario end-to-end.
- No customer quotes, usage analytics, benchmarks, or imagery - future work must not
  fabricate any of these.

## Product Principles

1. Watch it work: every explanation is a runnable, scrubbable sequence of events.
2. Accuracy is non-negotiable; simplify only with a visible label.
3. Failure scenarios are first-class, not appendix (every topic ships one).
4. One engine, many systems: adding a topic is content, not code.
5. Deterministic always - the same events produce the same story every replay.

## Accessibility & Inclusion

Keyboard-navigable controls, visible focus rings, `prefers-reduced-motion` respected, WCAG AA
contrast in both themes (verified numerically). No formal conformance target declared yet.
