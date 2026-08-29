# Underhood — Arrays Implementation Handoff Spec

## Objective

Add Arrays as the first Algorithms & Data Structures section in Underhood.

The implementation must fit the existing Underhood architecture and visual language.

The goal is to make array concepts and algorithms visually executable rather than turning Underhood into a static DSA notes or LeetCode application.

Core principle:

> Don't just read how it works. Watch it work.

---

## 1. UI Placement

Add a new section to the existing Underhood home page:

**ALGORITHMS & DATA STRUCTURES**

The section should contain an `Arrays` topic/card.

Existing Systems topics remain unchanged:

- Docker
- JVM
- Kubernetes
- Kafka
- Networking
- Linux
- Databases
- V8
- System Design

The new structure should conceptually be:

UNDERHOOD

SYSTEMS
- Docker
- JVM
- Kubernetes
- Kafka
- Networking
- Linux
- Databases
- V8
- System Design

ALGORITHMS & DATA STRUCTURES
- Arrays

Reuse the existing home-page topic/card design.

Reuse:

- Existing typography
- Existing spacing
- Existing card styling
- Existing hover behavior
- Existing responsive behavior
- Existing theme behavior
- Existing routing/navigation conventions

Do not create a separate DSA dashboard.

Do not create a separate Arrays dashboard.

Do not create a separate Arrays application shell.

Do not create a new navigation system.

Clicking `Arrays` must use the existing Underhood topic/experience flow.

---

## 2. Product Intent

Arrays should teach users through execution and state transitions.

The experience should follow:

Understand the data structure
→ Observe its state
→ Execute operations
→ Watch state change
→ Understand the algorithm
→ Understand the complexity

The primary question the experience should answer is:

> What is actually happening inside the array at every step?

Avoid turning the feature into:

- Static DSA documentation
- A collection of code snippets
- A LeetCode clone
- A large problem catalogue

---

## 3. Initial Arrays Scope

Implement exactly five initial experiences:

1. Traversal
2. Insert & Delete
3. Two Pointers
4. Prefix Sum
5. Kadane's Algorithm

Do not add other DSA topics yet.

Do not add Sorting as a separate topic.

Do not add Binary Search as a separate topic.

Do not add Trees, Graphs, DP, or other data structures in this implementation.

---

## 4. Content Architecture

Follow the existing Underhood content architecture and schemas.

Recommended structure:

content/arrays/
- topic.yaml
- traversal/
  - overview.yaml
  - simulation.yaml
  - concepts.yaml
  - visuals.yaml
- insert-delete/
  - overview.yaml
  - simulation.yaml
  - concepts.yaml
  - visuals.yaml
- two-pointers/
  - overview.yaml
  - simulation.yaml
  - concepts.yaml
  - visuals.yaml
- prefix-sum/
  - overview.yaml
  - simulation.yaml
  - concepts.yaml
  - visuals.yaml
- kadanes-algorithm/
  - overview.yaml
  - simulation.yaml
  - concepts.yaml
  - visuals.yaml

Use the exact schemas and conventions already present in the repository.

Do not invent a parallel DSA content model.

Do not modify the content architecture unless an actual schema limitation requires it.

---

# 5. Experience — Array Traversal

## Goal

Teach:

- Array indexing
- Index/value relationship
- Sequential traversal
- Indexed access
- Reading elements

## Example State

The visual representation should show an indexed array and a marker for the current index.

Example:

[10] [20] [30] [40] [50]
 ↑
 i = 0

Then:

[10] [20] [30] [40] [50]
       ↑
       i = 1

Then:

[10] [20] [30] [40] [50]
             ↑
             i = 2

## Event Sequence

The simulation should produce deterministic events equivalent to:

- read arr[0]
- read arr[1]
- read arr[2]
- read arr[3]
- read arr[4]

Each read should be represented in the timeline and reflected in the visual state.

## Live State

Expose appropriate state such as:

- i
- value
- operations

## Normal Scenario

Traverse a complete array.

## Edge Scenario

Empty array.

The empty-array scenario must terminate cleanly without invalid state.

## Complexity

Indexed access: O(1)

Traversal: O(n)

Space: O(1)

---

# 6. Experience — Insert & Delete

## Goal

Visually demonstrate why insertion and deletion at the beginning or middle of an array require shifting elements.

## Insert Scenario

Initial array:

[10] [20] [30] [40]

Insert `25` at index `2`.

Expected sequence:

- shift 40 → index 4
- shift 30 → index 3
- write 25 → index 2

Final array:

[10] [20] [25] [30] [40]

The movement of elements must be visually observable.

## Delete Scenario

Initial array:

[10] [20] [25] [30] [40]

Delete index `2`.

Expected sequence:

- move 30 → index 2
- move 40 → index 3
- remove final element

Final array:

[10] [20] [30] [40]

## Live State

Expose appropriate state such as:

- index
- value
- shifts
- writes

## Scenarios

Include:

- Insert in middle
- Delete from middle
- Insert at beginning
- Insert at end
- Delete at beginning/end where appropriate
- Empty array
- Single-element array

## Complexity

Access: O(1)

Insertion at beginning/middle: O(n)

Deletion at beginning/middle: O(n)

The visual experience should make the O(n) shifting behavior intuitive.

---

# 7. Experience — Two Pointers

## Goal

Introduce pointer-based traversal and demonstrate how a sorted array allows the algorithm to eliminate unnecessary search space.

## Input

Sorted array:

[1] [2] [4] [6] [8] [9]

L                   R

target = 13

## Execution

Initial comparison:

1 + 9 = 10

Because the sum is less than the target:

Move L.

Next:

2 + 9 = 11

Move L.

Next:

4 + 9 = 13

Result:

FOUND

## Live State

Expose:

- L
- R
- leftValue
- rightValue
- sum
- target
- comparisons

Pointers must be visually attached to their current array positions.

## Failure Scenario

Use:

target = 20

The pointers should move toward each other until the search terminates.

Final result:

NOT FOUND

## Complexity

Time: O(n)

Space: O(1)

The visualization should make it clear that the algorithm does not examine every possible pair.

---

# 8. Experience — Prefix Sum

## Goal

Demonstrate preprocessing and how it enables constant-time range queries.

## Input

Values:

[3] [1] [4] [2] [5]

Prefix:

[3] [4] [8] [10] [15]

The relationship between the original array and prefix array should be visually clear.

## Build Sequence

prefix[0] = 3

prefix[1] = prefix[0] + 1 = 4

prefix[2] = prefix[1] + 4 = 8

prefix[3] = prefix[2] + 2 = 10

prefix[4] = prefix[3] + 5 = 15

## Range Query

Demonstrate:

sum(1..3)

Using:

prefix[3] - prefix[0]

10 - 3 = 7

Highlight the relevant range and prefix values involved in the calculation.

## Live State

Expose:

- currentIndex
- currentValue
- prefixValue
- queryLeft
- queryRight
- result

## Scenarios

Normal scenario:

- Build prefix array
- Execute a range query

Edge scenario:

- Query covering the entire array

## Complexity

Build: O(n)

Range query: O(1)

Space: O(n)

The experience should communicate the trade-off:

More work during preprocessing
→ faster repeated queries

---

# 9. Experience — Kadane's Algorithm

## Goal

Demonstrate:

- Running state
- Local decision-making
- Maximum-subarray invariant
- Why negative accumulated sums are discarded
- How the best range is tracked

## Input

[-2] [1] [-3] [4] [-1] [2] [1] [-5] [4]

## Live State

Expose:

- currentSum
- maxSum
- currentStart
- bestStart
- bestEnd

## Core Decision

For each value:

currentSum = max(value, previousSum + value)

The visualization must distinguish between:

- Start a new subarray
- Continue the current subarray

Example when processing `4`:

currentSum = max(4, previousSum + 4)

If the previous running sum is negative:

Start a new subarray at 4.

Otherwise:

Continue the existing subarray.

## Expected Result

Highlight:

[4] [-1] [2] [1]

Sum:

6

The winning range must be visually identifiable.

## Required Edge Scenario

All-negative array.

Example:

[-8] [-3] [-6] [-2] [-5]

Expected result:

-2

Do not incorrectly return 0.

## Complexity

Time: O(n)

Space: O(1)

---

# 10. Visual Requirements

Reuse existing Underhood visual components wherever possible.

Arrays require support for:

- Array cells
- Index labels
- Values
- Current-element highlighting
- Pointer/marker
- Range highlighting
- Read state
- Write state
- Element movement
- Insertion
- Deletion

Any new visual primitive must be generic and reusable.

Prefer generic concepts such as:

- array
- cell
- index
- pointer
- marker
- range

Avoid algorithm-specific primitives such as:

- twoPointerLeft
- twoPointerRight
- kadaneRange
- prefixSumMarker

The visual primitives should later be reusable by:

- Sliding Window
- Binary Search
- Sorting
- Prefix/Suffix algorithms
- Dynamic Programming

---

# 11. Simulation Requirements

Use the existing event-driven simulation model.

Simulation state and events must remain the source of truth.

Renderers must derive visual state from simulation state.

Avoid imperative animation logic inside individual Array experiences.

Each experience must have deterministic state transitions.

Given the same input and scenario, the simulation should produce the same event sequence and final state.

---

# 12. Existing Experience UI

Reuse the existing Underhood controls:

- Play
- Pause
- Step
- Seek
- Timeline
- Speed
- Scenario switching
- Component inspection
- Live-state inspection

Do not create DSA-specific controls unless an actual requirement cannot be represented by the existing UI.

The user should feel like they are using the same Underhood product regardless of whether they are viewing Systems content or Arrays.

---

# 13. Complexity Information

Where supported by the existing content model, expose:

- Time Complexity
- Space Complexity

Where practical, show live operation counts.

Example:

Complexity

Time: O(n)

Space: O(1)

Operations:

- Comparisons: 3
- Reads: 6
- Writes: 0

Do not build a separate complexity engine solely for Arrays.

---

# 14. Scenario Requirements

Every experience must have at least one normal scenario and one meaningful edge/alternative scenario.

Required scenarios:

## Traversal

Normal:

- Complete array traversal

Edge:

- Empty array

## Insert/Delete

Normal:

- Middle insertion
- Middle deletion

Edge:

- Empty/single-element array
- Beginning/end operation

## Two Pointers

Normal:

- Target found

Edge:

- Target not found

## Prefix Sum

Normal:

- Normal range query

Edge:

- Full-array range query

## Kadane

Normal:

- Mixed positive/negative values

Edge:

- All-negative values

Scenarios must produce genuinely different simulation state/event behavior.

Do not create duplicate scenarios with only different labels.

---

# 15. Architecture Constraints

Preferred implementation flow:

Array content
→ existing content registry
→ existing simulation engine
→ existing renderer
→ existing experience UI

Do not create:

- DSA engine
- DSA renderer
- DSA dashboard
- Arrays application
- Arrays-specific state system
- Arrays-specific navigation

Only modify shared engine/UI code if the current architecture genuinely cannot represent a required Array behavior.

If an engine change is required, make the capability generic and reusable.

---

# 16. Testing Requirements

Add or extend tests where required by the existing repository conventions.

## Content Validation

Verify:

- topic.yaml is valid
- All experience YAML files conform to existing schemas
- All referenced components exist
- Events are valid
- Effects are valid
- Scenarios settle into valid states

## Simulation Tests

Verify key transitions for:

- Traversal
- Insert
- Delete
- Two Pointers
- Prefix Sum
- Kadane

## Edge Cases

Explicitly verify:

- Empty array
- Single-element array
- Target not found
- Full-range prefix query
- All-negative Kadane input

## Regression

Existing topics must continue to work unchanged.

---

# 17. Implementation Sequence

1. Inspect the existing home-page topic rendering.
2. Inspect an existing topic implementation.
3. Inspect an existing experience implementation.
4. Inspect the existing YAML schemas.
5. Identify the minimum UI change required for the new section.
6. Add the Algorithms & Data Structures section.
7. Add the Arrays topic.
8. Implement Traversal.
9. Verify the existing renderer can represent indexed arrays.
10. Implement Insert & Delete.
11. Implement Two Pointers.
12. Implement Prefix Sum.
13. Implement Kadane's Algorithm.
14. Add only necessary generic visual primitives.
15. Add/extend tests.
16. Run content validation.
17. Run simulation tests.
18. Run web tests.
19. Run production build.
20. Verify existing topics.
21. Manually verify the complete Arrays flow and every scenario.

---

# 18. Scope

## In Scope

- Algorithms & Data Structures section on existing home page
- Arrays topic
- Five Array experiences
- Array visualization
- Index visualization
- Pointer visualization
- Range visualization
- Insert/delete movement visualization
- Live simulation state
- Complexity information
- Edge scenarios
- Automated validation
- Tests
- Production build verification

## Out of Scope

- Separate DSA dashboard
- Separate Arrays page
- Code editor
- Code execution
- LeetCode integration
- User submissions
- Solution evaluation
- User progress tracking
- Difficulty system
- Gamification
- Backend changes unrelated to the content system
- AI-generated problems
- Large problem catalogue
- Trees
- Graphs
- Dynamic Programming
- Sorting as a separate topic
- Binary Search as a separate topic
- Changes to unrelated existing topics

---

# 19. Definition of Done

The implementation is complete when:

- Algorithms & Data Structures appears on the existing home page.
- Arrays appears inside that section.
- Existing home-page styling is preserved.
- Clicking Arrays uses the normal Underhood experience flow.
- All five experiences load successfully.
- Play works.
- Pause works.
- Step works.
- Seek works.
- Timeline works.
- Scenario switching works.
- Array state is visually accurate at every event.
- Indexes are visible where relevant.
- Pointer state is accurate.
- Range state is accurate.
- Insert/delete movement is visible.
- Components can be inspected.
- Live state is accurate.
- Complexity information is displayed.
- Edge scenarios work correctly.
- All-negative Kadane returns the correct maximum.
- Content validation passes.
- Simulation tests pass.
- Web tests pass.
- Production build passes.
- Existing topics continue to work.
- No unnecessary DSA-specific architecture has been introduced.

---

# 20. Engineering Principle

Prefer content changes over engine changes.

Prefer generic renderer capabilities over algorithm-specific components.

Prefer the existing Underhood simulation/player UI over new DSA-specific UI.

Prefer deterministic event-driven simulations over imperative animations.

The implementation should prove that Arrays can be added as normal Underhood content.

The ideal architecture is:

Existing Underhood UI
+
Existing simulation engine
+
Existing content model
+
Minimal generic array visualization capabilities
+
Five Arrays experiences

---

# 21. Product Principle

The Arrays implementation should make the user feel:

> I can see the algorithm working.

Not:

> I can read another explanation of arrays.

Prioritize:

State
→ Events
→ Visual transition
→ Explanation
→ Complexity

The feature should demonstrate that Underhood can teach DSA using the same core idea that powers its existing technical experiences:

> Don't just read how it works. Watch it work.