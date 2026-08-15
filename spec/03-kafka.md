# Specification: Apache Kafka

## 1. Purpose

Build an interactive simulation-based learning experience for **Apache Kafka**.

Primary question:

> **What happens after a producer sends a message to Kafka?**

## 2. Learning Goals

The learner should understand:

- Producers.
- Topics.
- Partitions.
- Brokers.
- Leaders/followers.
- Replication.
- Consumer groups.
- Offsets.
- Acknowledgements.
- Rebalancing.
- Broker failure.

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

Produce and consume a message.

```text
Producer
 -> Topic
 -> Partition
 -> Partition leader
 -> Replicas
 -> Consumer group
 -> Consumer
 -> Offset
```

### Secondary simulations

1. Partitioning.
2. Replication.
3. Consumer groups.
4. Rebalancing.
5. Broker failure.

### Failure scenarios

Broker failure, leader failure, consumer failure, consumer lag and network delay.

### MVP

Three partitions, one consumer group, message production/consumption and visible offsets.

### Success

The learner understands partition-level ordering, replication, consumer assignment and offsets.
