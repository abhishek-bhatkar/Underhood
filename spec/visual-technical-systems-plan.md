# Visual Technical Systems Learning Platform

## 1. Product Vision

Build an interactive learning platform that explains complex technical systems by **showing how they work**, rather than relying primarily on text and static diagrams.

Core philosophy:

> **Don't just read how it works. Watch it work.**

The first topic is **Docker**.

The long-term platform should be capable of explaining systems such as:

- Docker
- Kubernetes
- Kafka
- JVM
- Linux
- Networking
- Databases
- V8
- System Design
- Compilers
- Distributed systems

The product is **not a 3D book reader** and is **not a browser engine**. It is a **visual simulation/learning engine** that can consume structured technical knowledge and render it as interactive explanations.

---

# 2. Core Product Concept

A user selects a technical topic and gets:

1. A high-level architecture.
2. A step-by-step explanation.
3. Animated state transitions.
4. Play / pause / previous / next / replay.
5. Interactive inspection of components.
6. Timeline of events.
7. Optional simulations.
8. Failure scenarios.
9. Eventually, 2D/3D visualizations where spatial representation adds value.

Example:

```text
docker run nginx
        |
        v
  Docker Client
        |
        v
  Docker Daemon
        |
        +---------> Image lookup
        |
        +---------> Container creation
        |
        +---------> Network setup
        |
        +---------> Process start
        |
        v
  Running nginx container
```

The user should be able to watch each step occur.

---

# 3. Product Differentiator

Existing technical education commonly looks like:

```text
Documentation
    |
    v
Text
    |
    v
Static diagram
```

This platform should instead provide:

```text
Technical concept
       |
       v
Semantic model
       |
       v
Simulation
       |
       v
Events + state changes
       |
       v
Interactive visualization
       |
       v
User experimentation
```

The key differentiator is:

> **The explanation itself is executable/interactable.**

For example, don't merely show how Kafka replication works. Let the user:

- produce a message
- kill a broker
- introduce latency
- make a consumer slow
- observe replication
- observe leader/follower changes
- inspect the resulting state

---

# 4. First Topic: Docker

Docker is the first topic because it has:

- High developer demand.
- Strong visual potential.
- A manageable learning scope.
- Clear concepts.
- Natural progression from simple to advanced.
- Direct connection to Kubernetes and distributed systems.

The first flagship experience should be:

> **What actually happens when you run `docker run nginx`?**

---

# 5. Docker MVP

The first polished experience should explain:

```bash
docker run nginx
```

Target flow:

```text
Terminal
   |
   | docker run nginx
   v
Docker CLI
   |
   | API request
   v
Docker Daemon
   |
   +----------------------+
   |                      |
   v                      v
Image lookup           Configuration
   |
   +---- local image? ----+
   |                      |
  YES                    NO
   |                      |
   |                 Docker Registry
   |                      |
   |                 Pull image layers
   |                      |
   +----------+-----------+
              |
              v
       Create Container
              |
              v
       Configure Network
              |
              v
       Start Process
              |
              v
        nginx running
```

---

# 6. Docker Run Visualization Steps

## Step 1 — Docker CLI

Show:

```text
Terminal
    |
    | docker run nginx
    v
Docker CLI
```

Explain:

- What `docker run` means.
- CLI is requesting Docker to create/start a container.
- The CLI communicates with the Docker daemon.

---

## Step 2 — Docker Daemon

Animate:

```text
Docker CLI
     |
     | API request
     v
Docker Daemon
```

Conceptually show the API request.

The user should understand:

- CLI is not the container.
- The daemon performs the work.
- Docker has a client/server architecture.

---

## Step 3 — Image Lookup

Show:

```text
Docker Daemon
      |
      v
Local image exists?
      |
  +---+---+
  |       |
 YES      NO
  |       |
  |       v
  |    Registry
  |       |
  |    Pull layers
  |       |
  +---+---+
      |
      v
Create container
```

Make the decision visually obvious.

---

## Step 4 — Image → Container

Show the distinction:

```text
IMAGE
+----------------------+
| nginx                |
| binaries             |
| configuration        |
| filesystem layers    |
+----------+-----------+
           |
           | instantiate
           v
CONTAINER
+----------------------+
| image layers         |
|                      |
| writable layer       |
+----------------------+
```

Important concept:

> An image is a template/package; a container is a running/instantiated environment based on the image.

---

## Step 5 — Image Layers

Visualize:

```text
nginx image

+--------------------------+
| nginx configuration     |
+--------------------------+
| nginx binaries          |
+--------------------------+
| base distribution       |
+--------------------------+
| base image              |
+--------------------------+
```

Animate pulling each layer.

Later explain:

- layered filesystems
- read-only image layers
- writable container layer
- image reuse
- caching

---

## Step 6 — Container Networking

Initial conceptual view:

```text
Docker Host

+--------------------------------------+
|                                      |
| Docker networking                    |
|        |                             |
|        v                             |
|   +-----------+                      |
|   | container |                      |
|   |   nginx   |                      |
|   +-----------+                      |
|                                      |
+--------------------------------------+
```

Later deepen into:

- network namespace
- virtual Ethernet pair
- bridge
- container IP
- port publishing
- NAT

Avoid misleading oversimplification when the deeper simulation is implemented.

---

## Step 7 — Container Process

Show:

```text
HOST
--------------------------------

Docker daemon
      |
      | start
      v

Container
+-----------------------------+
| PID namespace               |
|                             |
| PID 1                       |
| nginx                       |
|                             |
+-----------------------------+
```

Important concept:

> A container is not a miniature VM. It is a set of isolated processes sharing the host kernel.

This should be visually emphasized.

---

## Step 8 — Final Running State

```text
DOCKER HOST

+--------------------------------------+
| Docker Daemon                        |
|                                      |
|   +------------------------------+   |
|   | Container                    |   |
|   |                              |   |
|   | PID 1: nginx                 |   |
|   |                              |   |
|   | Filesystem                   |   |
|   | Network                      |   |
|   +------------------------------+   |
|                                      |
+--------------------------------------+

STATUS: Running
```

---

# 7. Core Interaction Model

Every visualization should eventually support:

### Play

Run the complete simulation.

### Pause

Stop at the current state.

### Step Forward

Advance one event.

### Step Backward

Return to the previous state where possible.

### Restart

Reset simulation.

### Speed

```text
0.5x
1x
2x
4x
```

### Inspect

Click a component and open its explanation.

Example:

```text
Container
    |
    +--> Details
    +--> Filesystem
    +--> Network
    +--> Processes
    +--> Resources
```

---

# 8. Event-Based Simulation Model

Do not hardcode animations directly into topic-specific UI code.

Use an event model.

Example:

```typescript
interface SimulationEvent {
    id: string;
    type: string;
    timestamp: number;
    source?: string;
    target?: string;
    payload?: unknown;
}
```

Example event:

```json
{
  "type": "IMAGE_LOOKUP",
  "source": "docker-daemon",
  "target": "local-image-store",
  "payload": {
    "image": "nginx"
  }
}
```

Another:

```json
{
  "type": "IMAGE_PULL",
  "source": "registry",
  "target": "local-image-store",
  "payload": {
    "image": "nginx",
    "layer": "layer-3"
  }
}
```

Another:

```json
{
  "type": "PROCESS_STARTED",
  "source": "container",
  "target": "nginx",
  "payload": {
    "pid": 1
  }
}
```

The renderer consumes these events.

This allows:

```text
Simulation Engine
       |
       v
     Events
       |
   +---+---+
   |   |   |
   v   v   v
  2D  Timeline  3D
```

The content should not depend directly on Three.js.

---

# 9. Core Domain Model

Initial model:

```typescript
interface Component {
    id: string;
    name: string;
    type: string;
}

interface SimulationState {
    components: Record<string, Component>;
    events: SimulationEvent[];
    currentStep: number;
}
```

Eventually extend to:

```text
System
 |
 +-- Components
 +-- Relationships
 +-- States
 +-- Events
 +-- Scenarios
 +-- Explanations
 +-- Visualizations
```

---

# 10. Content as Data

Docker-specific explanations should be stored as structured content rather than being embedded throughout the frontend.

Suggested structure:

```text
content/
└── docker/
    ├── docker-run/
    │   ├── overview.yaml
    │   ├── simulation.yaml
    │   └── concepts.yaml
    │
    ├── images/
    ├── containers/
    ├── networking/
    ├── volumes/
    ├── dockerfile/
    └── compose/
```

Example:

```yaml
title: "How docker run works"

components:
  - id: cli
    name: Docker CLI

  - id: daemon
    name: Docker Daemon

  - id: registry
    name: Registry

  - id: image
    name: Image

  - id: container
    name: Container

steps:
  - event: command_entered
    source: terminal
    target: cli

  - event: api_request
    source: cli
    target: daemon

  - event: image_lookup
    source: daemon
    target: image

  - event: container_created
    source: daemon
    target: container

  - event: process_started
    source: container
    target: nginx
```

This is only a starting format. The schema should evolve after implementing the first simulation.

---

# 11. Rendering Strategy

Do NOT make everything 3D.

Use the renderer appropriate to the concept.

## HTML/CSS

For:

- explanations
- code
- documentation
- side panels
- controls

## SVG

For:

- architecture diagrams
- flows
- state machines
- dependency graphs

## Canvas

For:

- large numbers of nodes
- particle/packet effects
- high-frequency animation

## React Flow / graph renderer

For:

- interactive node graphs
- architecture
- relationships

## Three.js / React Three Fiber

For:

- spatial systems
- infrastructure
- clusters
- networks
- complex 3D relationships

Principle:

> **3D is a renderer, not the product.**

---

# 12. Frontend Stack

Recommended:

```text
React
TypeScript
Vite
React Flow
D3
Three.js
React Three Fiber
```

Use TypeScript throughout the frontend.

Do not introduce unnecessary backend infrastructure initially.

---

# 13. Backend

For the MVP, avoid a backend unless required.

Start with:

```text
React + TypeScript
        |
        v
Local structured content
```

Later add:

```text
Frontend
   |
   v
API
   |
   +-- Content
   +-- Search
   +-- User progress
   +-- Bookmarks
   +-- Generated simulations
```

Possible later backend:

```text
Spring Boot
PostgreSQL
Redis
```

Java/Spring should be introduced when the product actually needs server-side capabilities.

---

# 14. Repository Structure

Suggested initial repository:

```text
visual-systems/
│
├── apps/
│   └── web/
│
├── packages/
│   ├── simulation-engine/
│   ├── visualization-engine/
│   ├── model/
│   ├── renderer-2d/
│   ├── renderer-3d/
│   └── ui/
│
├── content/
│   ├── docker/
│   ├── kubernetes/
│   ├── kafka/
│   ├── jvm/
│   └── linux/
│
├── docs/
│
└── README.md
```

Do not create all directories immediately. Add them as the architecture requires them.

---

# 15. Docker Content Roadmap

## Level 1 — Docker basics

- Docker CLI
- Docker daemon
- Images
- Containers
- Registry
- `docker run`
- `docker pull`
- `docker ps`
- `docker stop`
- `docker rm`

## Level 2 — Images

- Layers
- Image manifests
- Image cache
- Dockerfile
- Build context
- Build layers
- Image tags

## Level 3 — Containers

- Process isolation
- PID namespace
- Mount namespace
- Network namespace
- cgroups
- filesystem layers
- container lifecycle

## Level 4 — Networking

- Bridge network
- Container IP
- Port mapping
- DNS
- Network namespace
- NAT

## Level 5 — Storage

- Volumes
- Bind mounts
- Container writable layer
- Persistence

## Level 6 — Docker Compose

Example:

```yaml
services:
  web:
    ...
  api:
    ...
  db:
    ...
```

Visualize:

```text
Web
 |
 v
API
 |
 v
DB
```

## Level 7 — Failure simulations

Add controls:

```text
[ Kill Container ]
[ Restart Container ]
[ Delete Image ]
[ Network Failure ]
[ Slow Network ]
[ Stop Database ]
```

---

# 16. Docker Build Visualization

Example:

```dockerfile
FROM node:22
COPY . .
RUN npm install
CMD ["npm", "start"]
```

Visualize:

```text
Dockerfile
    |
    v
Build
    |
    +-- FROM
    |
    +-- COPY
    |
    +-- RUN
    |
    +-- CMD
    |
    v
Image Layers
    |
    v
Final Image
```

Each Dockerfile instruction should correspond to a visible build step.

---

# 17. Failure Simulation

This is a major differentiator.

Instead of only showing the happy path, allow users to break the system.

Examples:

### Delete local image

```text
Local image
    X
    |
docker run nginx
    |
    v
Registry
    |
    v
Pull layers
    |
    v
Container
```

### Kill container

```text
Container
    |
    X
    |
Process exits
    |
    v
Container stopped
```

### Network failure

```text
Client
   |
   X
   |
Container
```

### Restart

```text
Stopped
   |
   v
Start
   |
   v
Running
```

This should eventually become a general feature of the simulation engine.

---

# 18. Future Topics

After Docker proves the platform:

## Kubernetes

Visualize:

```text
Cluster
 |
 +-- Control Plane
 |
 +-- Node
      |
      +-- Pod
           |
           +-- Container
```

Simulations:

- scheduling
- deployment
- pod creation
- service discovery
- scaling
- rolling deployment
- pod failure
- node failure
- reconciliation

## Kafka

Visualize:

```text
Producer
   |
   v
Topic
   |
   +-- Partition 0
   +-- Partition 1
   +-- Partition 2
```

Simulations:

- produce message
- consume message
- partitioning
- replication
- leader election
- broker failure
- consumer groups
- offsets

## JVM

```text
Java
 |
javac
 |
.class
 |
ClassLoader
 |
Bytecode
 |
JVM
 |
+-- Heap
+-- Stack
+-- Metaspace
+-- GC
+-- JIT
```

## Linux

```text
Application
 |
Syscall
 |
Kernel
 |
+-- Scheduler
+-- Memory
+-- VFS
+-- Network
+-- Drivers
 |
Hardware
```

## Networking

```text
Application
 |
HTTP
 |
TLS
 |
TCP
 |
IP
 |
Ethernet
 |
Router
 |
Server
```

## V8

```text
JavaScript
 |
Parser
 |
AST
 |
Bytecode
 |
Ignition
 |
Hot code
 |
Optimization
 |
Machine code
```

---

# 19. System Design Expansion

Eventually build interactive system-design scenarios.

Example:

> How does a large-scale service handle millions of requests?

Instead of a static diagram:

```text
User
 |
CDN
 |
Load Balancer
 |
API
 |
Cache
 |
Database
```

make it interactive.

Possible controls:

```text
Traffic:        [ 10K ] [ 100K ] [ 1M ] requests/sec

Servers:        [ + ] [ - ]

Cache hit rate: [ slider ]

Database:       [ single ] [ replicated ]

Failure:
[ Kill API ]
[ Kill DB ]
[ Network Delay ]
```

Then show how system behavior changes.

This turns system design into an experiment rather than a memorization exercise.

---

# 20. AI Integration — Later

Do not make AI the core of the MVP.

Long-term pipeline:

```text
Technical Documentation
        |
        v
Document Parser
        |
        v
LLM-assisted Extraction
        |
        v
Semantic Model
        |
        v
Simulation Model
        |
        v
Human Verification
        |
        v
Visualization
```

AI can help generate:

- concepts
- relationships
- event sequences
- explanations
- diagrams
- quizzes
- scenarios

But actual simulations should be deterministic and verifiable.

Do not allow an LLM to invent runtime behavior and present it as fact.

---

# 21. Long-Term Document/Standard Vision

The original idea was to turn technical standards/books into graphical experiences.

Keep that as the long-term direction.

The correct architecture is:

```text
Book / Standard / Documentation
              |
              v
        Semantic Parser
              |
              v
        Knowledge Model
              |
              v
        Simulation Model
              |
              v
      Visual Learning Engine
              |
      +-------+-------+
      |       |       |
      v       v       v
    Text    Graph     3D
      |       |       |
      +-------+-------+
              |
              v
        Interactive Study
```

The document is the source.

The simulation/visualization engine is the product.

---

# 22. User Experience

Every topic should eventually follow a consistent structure:

```text
Topic
 |
 +-- What is it?
 |
 +-- Big picture
 |
 +-- Step-by-step
 |
 +-- Interactive simulation
 |
 +-- Deep dive
 |
 +-- Example
 |
 +-- Failure scenarios
 |
 +-- Edge cases
 |
 +-- Test yourself
```

Example:

```text
How Docker Works

[Overview]

[Run docker run nginx]

[Step-by-step]

[Inspect Container]

[Inspect Image]

[Break It]

[Test Yourself]
```

---

# 23. First MVP Scope

Do NOT build the entire platform first.

MVP should contain exactly one excellent experience:

> **What happens when you run `docker run nginx`?**

Required:

- Docker CLI
- Docker daemon
- Image lookup
- Registry
- Image pull
- Image layers
- Container creation
- Network setup
- Process startup
- Running state
- Step-by-step animation
- Play
- Pause
- Previous/next
- Restart
- Component inspection
- Timeline

Not required initially:

- authentication
- database
- AI
- user profiles
- mobile app
- full Docker implementation
- real Docker execution
- 3D
- Kubernetes
- Kafka
- PDF parsing

---

# 24. Development Phases

## Phase 1 — Visualization Prototype

Goal:

```text
CLI → Daemon → Image → Container
```

Build:

- nodes
- edges
- transitions
- zoom
- basic animations

No backend.

No AI.

No 3D.

---

## Phase 2 — Simulation Engine

Build:

- state
- event model
- timeline
- play
- pause
- step
- replay
- reset

The visualization must derive from simulation state/events.

---

## Phase 3 — Docker Run

Implement the complete first experience:

```text
docker run nginx
```

Use a deterministic simulation model.

---

## Phase 4 — Inspection

Click:

- CLI
- daemon
- image
- registry
- container
- network
- process

Show contextual explanations.

---

## Phase 5 — Docker Build

Add:

```text
Dockerfile
   |
   v
Build steps
   |
   v
Image layers
```

---

## Phase 6 — Docker Internals

Add:

- namespaces
- cgroups
- filesystem layers
- networking
- processes

Use careful technical accuracy.

---

## Phase 7 — Failure Scenarios

Add:

- container failure
- network failure
- image missing
- process crash
- restart

---

## Phase 8 — 3D Renderer

Introduce Three.js only after the 2D/simulation architecture works.

Use 3D where it genuinely improves understanding.

---

## Phase 9 — Generic Engine

Add a second topic.

Recommended:

> Kubernetes or Kafka.

The test:

> Can a new system be added primarily through content/model definitions rather than rewriting the visualization engine?

If not, refactor the architecture.

---

## Phase 10 — Content Platform

Add:

- topic navigation
- search
- bookmarks
- progress
- deep links
- sharing
- versioning

---

## Phase 11 — AI-assisted Content Generation

Add:

```text
Documentation
    |
    v
AI extraction
    |
    v
Structured model
    |
    v
Simulation
    |
    v
Human verification
    |
    v
Published visualization
```

---

# 25. Success Criteria

The first MVP is successful if a developer who already knows Docker can say:

> "I can see what Docker is actually doing."

And a beginner should be able to understand:

- image vs container
- CLI vs daemon
- image pulling
- image layers
- container creation
- container process
- basic isolation
- networking

without needing to read a long article first.

Technical correctness is more important than flashy graphics.

---

# 26. Engineering Principles

1. **Simulation first, animation second.**
2. **State/events are the source of truth.**
3. **Renderer must remain separate from content.**
4. **Do not force 3D.**
5. **Prefer deterministic simulations.**
6. **Technical accuracy beats visual complexity.**
7. **Start with one polished experience.**
8. **Make content data-driven.**
9. **Do not introduce backend infrastructure prematurely.**
10. **Do not add AI until the underlying model works.**
11. **Test the architecture by adding a second system.**
12. **Failure scenarios are as important as happy paths.**

---

# 27. Final Product Architecture

Long term:

```text
                       CONTENT SOURCES
                              |
              +---------------+----------------+
              |               |                |
            Docs            Books          Standards
              |               |                |
              +---------------+----------------+
                              |
                              v
                     DOCUMENT PROCESSOR
                              |
                              v
                      SEMANTIC KNOWLEDGE
                              |
                              v
                       SYSTEM MODEL
                              |
                              v
                     SIMULATION ENGINE
                              |
                +-------------+-------------+
                |             |             |
                v             v             v
             Timeline       Graph          State
                |             |             |
                +-------------+-------------+
                              |
                              v
                    VISUALIZATION ENGINE
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
            HTML/SVG        Canvas         Three.js
              |               |               |
              +---------------+---------------+
                              |
                              v
                    INTERACTIVE EXPERIENCE
```

---

# 28. Product Thesis

The project should ultimately answer one question:

> **Can complex technical systems be learned more effectively by watching and manipulating their internal behavior rather than only reading about them?**

The first experiment is:

> **Docker: What actually happens when you run `docker run nginx`?**

If that experience is compelling, expand the engine.

The eventual progression is:

```text
Docker
  ↓
Kubernetes
  ↓
Kafka
  ↓
Networking
  ↓
JVM
  ↓
Linux
  ↓
Databases
  ↓
V8
  ↓
System Design
  ↓
Technical Standards / Documentation
```

The final vision is not a collection of animations.

It is a **general-purpose visual learning engine for understanding how software and computer systems actually work.**
