# Specification: Linux

## 1. Purpose

Build an interactive simulation-based learning experience for **Linux**.

Primary question:

> **What happens when a program makes a system call?**

## 2. Learning Goals

The learner should understand:

- User vs kernel space.
- Processes.
- System calls.
- Scheduling.
- Virtual memory.
- Filesystems.
- File descriptors.
- Networking.
- Processes vs threads.
- Kernel services.

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

A conceptual `write()` system call.

```text
Application
 -> library/API
 -> syscall boundary
 -> kernel
 -> file descriptor
 -> terminal/file
```

### Secondary simulations

1. Process lifecycle.
2. Scheduler.
3. Virtual memory.
4. Filesystem/VFS.
5. File descriptors.
6. I/O wait.

### Failure scenarios

Process kill, memory pressure, page fault, permission failure, CPU contention and blocked I/O.

### MVP

Show one process crossing the user/kernel boundary for a system call.

### Success

The learner understands user/kernel space, syscall flow and basic process scheduling.
