# Underhood Arrays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single Arrays home card that opens Traversal plus five deterministic, visually executable Array experiences.

**Architecture:** Keep Array content in the existing YAML registry and simulation engine. Add only generic array node/schema support and same-topic experience links; render all state from folded simulation snapshots.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Flow, YAML, Zod.

**Spec:** `spec/underhood-arrays-implementation-spec.md`; design: `docs/superpowers/specs/2026-08-29-arrays-design.md`

## Global Constraints

- Use the existing Underhood architecture and visual language.
- Implement exactly five initial experiences: Traversal, Insert & Delete, Two Pointers, Prefix Sum, and Kadane's Algorithm.
- Use the existing event-driven simulation model; simulation state and events remain the source of truth.
- Prefer content changes over engine changes and generic renderer capabilities over algorithm-specific components.
- Do not create a DSA dashboard, Arrays application shell, new navigation system, code editor, submissions, or unrelated topic changes.

### Task 1: Add generic array visual schema and renderer

**Files:**
- Modify: `apps/web/src/content/visuals.ts`
- Modify: `apps/web/src/components/Canvas.tsx`
- Create: `apps/web/src/components/nodes/ArrayNode.tsx`
- Modify: `apps/web/src/components/nodes/shared.tsx`
- Modify: `apps/web/src/index.css`
- Test: `apps/web/src/content/visuals.test.ts` and `apps/web/src/components/nodes/ArrayNode.test.tsx`

**Interfaces:**
- `NodeVisual.kind` accepts `array` and its config includes the array's data key plus optional template/pointer/range keys.
- `ArrayNode` consumes `ComponentRuntime.data` and renders cells from the configured key without algorithm-specific field names.

- [ ] Write failing tests for parsing an array node and rendering indexes, values, an active cell, a pointer, a range, and a movement state.
- [ ] Run the focused web tests and confirm they fail because `array` is not yet a valid node kind/renderer.
- [ ] Add the Zod config fields, register `ArrayNode`, and render generic cell records/scalar pointers/ranges.
- [ ] Add theme-aware styles for compact indexed cells, markers, range highlighting, read/write states, and movement cues.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Add grouped home catalog and same-topic experience links

**Files:**
- Modify: `apps/web/src/components/Home.tsx`
- Modify: `apps/web/src/components/ExperienceView.tsx`
- Modify: `apps/web/src/index.css`
- Modify: `apps/web/src/App.test.tsx`

**Interfaces:**
- Home receives topics from the existing registry and renders one topic card for `arrays` linking to `#/arrays/traversal`.
- ExperienceView derives same-topic experiences from `topics[experience.topicId]` and exposes links without changing route parsing or transport state.

- [ ] Add failing tests asserting two catalog section labels, one Arrays card/link, unchanged Systems card count, and navigation among Array experiences.
- [ ] Run the focused tests and confirm the expected failures.
- [ ] Implement grouped catalog rendering and same-topic links, preserving existing card styling, theme behavior, and hash routing.
- [ ] Run web tests and confirm existing routing/theme tests remain green.

### Task 3: Add Arrays topic and Traversal content

**Files:**
- Create: `content/arrays/topic.yaml`
- Create: `content/arrays/traversal/overview.yaml`
- Create: `content/arrays/traversal/simulation.yaml`
- Create: `content/arrays/traversal/concepts.yaml`
- Create: `content/arrays/traversal/visuals.yaml`
- Modify: `apps/web/src/content/registry.test.ts`
- Create: `packages/simulation-engine/src/__tests__/arrays.test.ts`

- [ ] Add failing registry/engine tests for the Arrays topic, traversal scenarios, read events, empty-array termination, and O(1)/O(n)/O(1) live state.
- [ ] Run the focused tests and confirm content is missing.
- [ ] Add YAML using array cells, index state, read state, operations, and complete/empty scenarios.
- [ ] Run engine and web registry tests.

### Task 4: Add Insert & Delete content

**Files:**
- Create: `content/arrays/insert-delete/overview.yaml`
- Create: `content/arrays/insert-delete/simulation.yaml`
- Create: `content/arrays/insert-delete/concepts.yaml`
- Create: `content/arrays/insert-delete/visuals.yaml`
- Modify: `packages/simulation-engine/src/__tests__/arrays.test.ts`

- [ ] Add failing tests for middle insertion shifts, middle deletion moves, beginning/end behavior, and empty/single-element scenarios.
- [ ] Run them to verify the missing content/state failures.
- [ ] Add deterministic events whose state snapshots visibly move values before writing/removing cells.
- [ ] Run the focused tests and verify final arrays and shift/write counters.

### Task 5: Add Two Pointers, Prefix Sum, and Kadane content

**Files:**
- Create: `content/arrays/two-pointers/{overview,simulation,concepts,visuals}.yaml`
- Create: `content/arrays/prefix-sum/{overview,simulation,concepts,visuals}.yaml`
- Create: `content/arrays/kadanes-algorithm/{overview,simulation,concepts,visuals}.yaml`
- Modify: `packages/simulation-engine/src/__tests__/arrays.test.ts`

- [ ] Add failing tests for found/not-found pointer convergence, prefix construction plus full-range query, mixed Kadane winner, and all-negative maximum.
- [ ] Run them to verify the expected missing-content failures.
- [ ] Add event sequences with pointer/range/candidate state and explanations that expose each algorithm's invariant and complexity.
- [ ] Run focused tests and inspect folded final states for all required edge cases.

### Task 6: Validate the complete feature

**Files:**
- Modify: `apps/web/src/content/registry.test.ts` if validation coverage needs extension.
- Modify: `apps/web/src/App.test.tsx` if end-to-end assertions need extension.

- [ ] Run `npm test`.
- [ ] Run `npm run test:web`.
- [ ] Run `npm run lint -w apps/web`.
- [ ] Run `npm run build`.
- [ ] Verify the home Arrays card, all five experience routes, every scenario toggle, step/seek/timeline behavior, inspector state, light/dark themes, and existing topics.
- [ ] Review the diff for accidental unrelated changes and summarize any remaining limitations.
