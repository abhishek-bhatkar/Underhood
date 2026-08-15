# Specification: Computer Networking

## 1. Purpose

Build an interactive simulation-based learning experience for **Computer Networking**.

Primary question:

> **What happens when a browser requests `https://example.com`?**

## 2. Learning Goals

The learner should understand:

- DNS.
- IP.
- Routing.
- TCP.
- TLS.
- HTTP.
- Ports.
- Packets.
- Connection lifecycle.
- Latency.
- Packet loss.
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

HTTPS request:

```text
Browser
 -> DNS
 -> TCP
 -> TLS
 -> HTTP
 -> Router(s)
 -> Server
 -> HTTP response
```

### Secondary simulations

1. DNS lookup.
2. TCP three-way handshake.
3. TLS handshake at conceptual level.
4. Packet routing.
5. HTTP request/response.

### Failure scenarios

DNS failure, packet loss, latency, connection reset, TLS verification failure and server failure.

### MVP

Visualize DNS -> TCP -> TLS -> HTTP request -> HTTP response.

### Success

The learner can follow an HTTPS request and explain the purpose of DNS, TCP, TLS and HTTP.
