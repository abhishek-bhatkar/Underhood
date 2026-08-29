# Underhood Arrays Design

## Goal

Add Arrays as the first Algorithms & Data Structures topic while preserving Underhood's existing content registry, event-driven simulation engine, graph canvas, experience shell, and visual language.

## Decisions

- The home page will have two labeled catalog sections: `SYSTEMS` and `ALGORITHMS & DATA STRUCTURES`.
- Systems topics remain unchanged.
- The Algorithms section contains one `Arrays` card linking to `#/arrays/traversal`.
- The five Array experiences remain separate registry experiences and are reached through the existing experience flow. The experience shell gains only the generic topic-experience navigation needed to move among experiences in the same topic.
- Array simulations are deterministic YAML content. Simulation state and events remain the source of truth; renderers do not own animation state.

## Architecture

Content under `content/arrays/` defines `topic.yaml` plus five experiences: traversal, insert-delete, two-pointers, prefix-sum, and kadanes-algorithm. Each experience uses the existing overview, simulation, concepts, and visuals schemas.

The shared renderer gains a generic array node and generic array visual data conventions. An array component stores cells as data objects with values and visual state, while scalar fields store indexes, pointer positions, counters, and range bounds. Declarative `set` effects are sufficient for deterministic snapshots; no array-specific engine or navigation state is introduced.

The generic array node renders index labels, values, active/read/write/range states, pointer markers, and movement cues from component data. Existing node kinds and topics remain untouched.

## Data Contract

Array visuals use a node with `kind: array`, `key` for the cell collection, and optional `valueTemplate`, `indexTemplate`, `pointerKeys`, and `rangeKeys`. Cell records use stable generic fields such as `value`, `state`, `fromIndex`, and `toIndex`; pointer and range field names are supplied by YAML rather than hard-coded algorithm names. The visuals parser validates this configuration.

Simulation events use existing payloads and `set` effects to replace complete arrays or update scalar state. This makes rewinds pure and avoids adding mutable animation behavior to React nodes.

## Home and Experience Flow

The home component renders existing experience cards in the Systems section and a single topic card for Arrays. The Arrays card links to traversal. The experience header exposes same-topic experience links using registry data, while retaining the existing scenario toggle, transport controls, timeline, inspector, and theme behavior.

## Testing

- Add parser/registry assertions for the Arrays topic and all five experiences.
- Add simulation-engine tests for materialized event sequences and final/mid-state transitions for each algorithm, including empty, single-element, not-found, full-range, and all-negative cases.
- Add renderer tests for array cell/index/pointer/range state and home/experience routing tests.
- Run engine tests, web tests, lint, and production build; manually verify every scenario through the existing transport.

## Scope

Only Arrays content, the minimum generic array renderer/schema support, grouped home catalog rendering, and same-topic experience navigation are in scope. No DSA dashboard, code editor, problem catalogue, separate state system, or unrelated topic changes are introduced.
