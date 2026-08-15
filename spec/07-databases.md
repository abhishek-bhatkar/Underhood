# Specification: Databases

## 1. Purpose

Build an interactive simulation-based learning experience for **Databases**.

Primary question:

> **What happens when you execute a SQL query or update?**

## 2. Learning Goals

The learner should understand:

- SQL parsing.
- Query planning.
- Indexes.
- Table scans.
- Buffer/cache.
- Transactions.
- Locks.
- MVCC.
- WAL.
- Commit.
- Replication.
- Query execution.

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

Indexed SELECT:

```text
SQL
 -> parser
 -> planner
 -> execution plan
 -> index lookup or table scan
 -> buffer/storage
 -> result
```

Write path:

```text
Transaction
 -> locking/MVCC
 -> WAL
 -> data pages
 -> commit
```

### Secondary simulations

1. Index vs full scan.
2. Transactions.
3. Concurrent transactions.
4. WAL/commit.
5. Replication.

### Failure scenarios

Slow query, missing index, lock contention, deadlock, rollback, replica lag and primary failure.

### MVP

Use PostgreSQL as the reference implementation. Visualize an indexed SELECT and one transaction.

### Success

The learner understands why indexes change execution, what a transaction does and how query execution/storage relate.
