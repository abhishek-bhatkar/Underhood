# Specification: Kubernetes

## 1. Purpose

Build an interactive simulation-based learning experience for **Kubernetes**.

Primary question:

> **What happens when you create a Deployment with three replicas?**

## 2. Learning Goals

The learner should understand:

- Control plane.
- API server.
- Scheduler.
- Controllers.
- Pods.
- Deployments/ReplicaSets.
- Services.
- Desired vs actual state.
- Reconciliation.
- Self-healing.
- Rolling updates.
- Scaling.

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

Create a Deployment with three replicas.

```text
kubectl apply
 -> API Server
 -> desired state
 -> Deployment controller
 -> ReplicaSet
 -> Pods
 -> Scheduler
 -> Node
 -> Kubelet/runtime
 -> Running Pods
```

### Secondary simulations

1. Reconciliation loop.
2. Pod failure and replacement.
3. Rolling update.
4. Service routing.
5. Scaling.

### Failure scenarios

Pod crash, node failure, image pull failure, readiness failure, scheduling failure and unavailable Service endpoints.

### MVP

Create, schedule and run three Pods, then kill one and watch reconciliation create a replacement.

### Success

The learner understands desired state, controllers, scheduling, Pods and self-healing.
