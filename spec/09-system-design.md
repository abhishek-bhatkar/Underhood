# Specification: Interactive System Design

## 1. Purpose

Build an interactive simulation-based learning experience for **Interactive System Design**.

Primary question:

> **What happens when a scalable system receives traffic and components fail?**

## 2. Learning Goals

The learner should understand:

- Request flow.
- Load balancing.
- Caching.
- Queues.
- Databases.
- Replication.
- Sharding.
- Rate limiting.
- Async processing.
- Scaling.
- Availability.
- Latency.
- Failures.

## Product Role

This is one domain specification for the shared Visual Systems Learning Engine.

Core principle:

> **Don't just read how it works. Watch it work.**

The domain must be represented as a deterministic model of components, state and events. The renderer must remain separate from domain content.

## Shared Interaction

Every simulation should support:

- Play / pause
- Step forward
- Restart
- Timeline
- Speed control
- Component inspection
- Abstraction/deep-dive level

Step backward is supported where state snapshots/reversible events make it deterministic.

## Simulation Model

Use domain-neutral concepts:

```text
System
 ├── Components
 ├── Relationships
 ├── State
 ├── Events
 ├── Timeline
 └── Scenarios
```

Example event:

```json
{
  "type": "STATE_CHANGE",
  "source": "component-a",
  "target": "component-b",
  "payload": {}
}
```

## Rendering

Prefer the simplest representation that improves understanding:

- HTML/CSS: explanations, code and controls.
- SVG/graph: architecture, relationships and state machines.
- Canvas: high-frequency/large-scale animation.
- Three.js: spatial environments where 3D genuinely improves comprehension.

**3D is a renderer, not the product.**

## Technical Accuracy

Implementation-specific behavior must identify its assumed implementation/version. Simplified educational models must be labelled as abstractions and must not be presented as exact runtime behavior.

## MVP Principle

Start with one polished simulation, validate the learning experience, then expand the domain.

## Acceptance Principle

A learner should finish the primary simulation able to explain the system's major components, the sequence of events, the relevant state transitions and at least one failure/edge case.

## 3. Domain-Specific Design

## Primary Simulation

Start with a scalable URL shortener:

```text
Client
 -> Load Balancer
 -> API
 -> Cache
 -> Database
```

### User controls

```text
Traffic: 10K / 100K / 1M requests/sec
Servers: 1 / 3 / 10 / 100
Cache: enabled/disabled
Database: single/replicated
Failures: API / DB / network / queue
```

### Secondary simulations

1. Cache hit/miss.
2. Horizontal scaling.
3. Database replication.
4. Queues and asynchronous processing.
5. Rate limiting.
6. Sharding.

### Failure scenarios

API failure, database failure, cache failure, queue backlog, network partition, high latency, traffic spike, replica lag and hot partition.

### MVP

Implement the URL-shortener architecture and let the user change traffic, server count, cache and database state.

### Success

The learner sees how architecture choices affect throughput, latency, availability and failure behavior rather than memorizing a static architecture.
