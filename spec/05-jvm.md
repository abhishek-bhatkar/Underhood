# Specification: JVM

## 1. Purpose

Build an interactive simulation-based learning experience for **JVM**.

Primary question:

> **What happens when you run a Java program?**

## 2. Learning Goals

The learner should understand:

- Java compilation.
- Class files.
- Class loading.
- Bytecode.
- Stack frames.
- Heap.
- Garbage collection.
- JIT compilation.
- Threads.
- Runtime areas.

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

Run a Java program.

```text
Java source
 -> javac
 -> .class bytecode
 -> ClassLoader
 -> JVM
 -> stack/heap
 -> execution
```

### Secondary simulations

1. Method call and stack frames.
2. Object allocation.
3. Garbage collection.
4. JIT compilation.
5. Threads.

### Failure scenarios

Stack overflow, heap exhaustion, class-loading failure, OutOfMemoryError and GC pressure.

### MVP

Show source -> bytecode -> class loading -> stack/heap -> execution.

### Success

The learner understands source vs bytecode, JVM runtime areas and basic method/object execution.
