# All Topics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement every topic spec (02–09) as content-only experiences on the one-engine-many-systems architecture: primary simulation + one failure scenario each, per each spec's own MVP and acceptance principles.

**Architecture:** unchanged engine/UI. Per topic: `content/<topic>/topic.yaml` + `content/<topic>/<experience>/{overview,simulation,concepts,visuals}.yaml` using the five node kinds. A generic engine test iterates all content so every new topic is schema- and semantics-checked automatically.

**Specs:** spec/02-kubernetes.md, 03-kafka.md, 04-networking.md, 06-linux.md, 07-databases.md, 08-v8.md, 09-system-design.md.

## Global Constraints

- Content-only: no engine or UI code changes except a generic all-topics content test and any registry-test count update.
- Node kinds: terminal · panel · stack · list · group only.
- Every scenario ends settled (done) or errored; every event has title+body; most have concept; technically accurate with simplifications labelled in `overview.abstraction`.
- Each topic: happy-path scenario (~10–14 events) + failure scenario (~6–9 events).

## Per-topic designs

### Task 1 — kubernetes / `apply-deployment`
"What happens when you create a Deployment with three replicas?"
- Components: terminal(kubectl), apiserver, etcd, controller, scheduler (group "Control Plane"), kubelet, pods(list) (group "Node 1").
- `apply`: kubectl apply → API POST → etcd desired state → controller: desired≠actual → ReplicaSet + 3 pending Pods → scheduler binds nodes → kubelet/containerd starts containers → Running/ready → observed=desired (reconciled).
- `pod-crash` (failure): 3 running → pod-2 crashes (error, removed) → controller sees 2/3 → new pod created → scheduled → started → 3/3 again (self-healing).

### Task 2 — kafka / `produce-consume`
"What happens after a producer sends a message?"
- Components: terminal(producer CLI), producer, topic(list: partitions), broker-1 (leader P1), broker-2/broker-3 (followers, group "Broker Cluster"), consumer-group, offsets(list).
- `produce-consume`: send {key: user-42} → hash key → partition P1 → append to leader log @offset 42 → replicate to ISR followers → commit (acks=all) → ack producer → group assignment → fetch from committed offset → deliver → commit offset 43.
- `broker-failure` (failure): broker-1 (leader) dies → controller elects broker-2 from ISR → metadata refresh → produce/consume continue on new leader.

### Task 3 — networking / `https-request`
"What happens when a browser requests https://example.com?"
- Components: browser(terminal), dns(panel), tcp(panel), tls(panel), router(panel), server(panel).
- `request`: URL entered → stub resolver → root → .com TLD → authoritative A 93.184.216.34 → TCP SYN → SYN-ACK → ACK (connection) → TLS ClientHello → ServerHello+cert (verified) → session keys → HTTP GET (encrypted) → routed hops → server decrypt+route → 200 HTML → browser renders.
- `dns-failure` (failure): NXDOMAIN from authoritative → resolver returns failure → browser error page (no connection attempted).

### Task 4 — linux / `write-syscall`
"What happens when a program makes a system call?"
- Components: app(panel, user space), libc(panel), boundary(panel "syscall gate"), group "Kernel": vfs, page-cache, tty; cpu(panel, user/kernel mode chip).
- `write`: printf buffered → write(1,…) in libc → mode switch ring 3→0 (boundary) → fd 1 resolved → VFS → copy from user buffer → page cache → tty driver → output appears → return to user (ring 3).
- `permission-denied` (failure): open("/etc/shadow") → syscall → kernel permission check → EACCES → errno → app handles error. 

### Task 5 — databases / `sql-query` (PostgreSQL)
"What happens when you execute a SQL query or update?"
- Components: terminal(psql), parser, planner, executor, index(btree list), buffer-pool, pages(list), wal(stack) — group "PostgreSQL".
- `select`: SELECT … WHERE email= → tokens/AST → planner: index scan vs seq scan (costs) → executor: btree root→internal→leaf → heap page 42 fetch → buffer pool (disk read) → 1 row → client.
- `transaction` (failure-adjacent edge): BEGIN → UPDATE … WHERE id=7 → row lock + new tuple version (MVCC) → WAL append → COMMIT → WAL flush (fsync) → durable; crash-note: replay from WAL.

### Task 6 — v8 / `run-function`
"What happens when a JavaScript function runs?" (add(a,b){return a+b})
- Components: terminal(call site), parser, ast(list), ignition(list: bytecode), feedback(list: slots), turbofan(panel, tier chip), machine-code(panel), heap(list) — group "V8 Isolate".
- `run`: script parsed → AST for add → Ignition compiles bytecode (Ldar a1…Add…Return) → call add(2,3) → interpreted → feedback: Smi+Smi → hot after N calls → tier up → TurboFan emits machine code → native execution.
- `deopt` (failure): optimized add called with string → type guard fails → deoptimize → back to Ignition → re-optimize polymorphic.

### Task 7 — system-design / `url-shortener`
"What happens when a scalable system receives traffic and components fail?"
- Components: client, lb, api(list: api-1..3), cache, db, replica — group "Production".
- `resolve`: GET /abc123 → LB picks api-2 → cache lookup MISS → db index lookup → row → cache fill (TTL) → 302 redirect. 
- `db-failure` (failure): db down → api errors + circuit breaker opens → 503s → replica promoted → breaker half-open → recovers. Overview notes the full interactive-control model (traffic/servers sliders) as the next iteration per spec §19.

### Task 8 — cross-cutting
- Engine `__tests__/topics.test.ts`: iterate every content dir generically (parse all four files, materialize all scenarios, assert: ≥5 events, sources/targets known components, timestamps strictly increasing, effects reference declared-or-referenced components, last event settles done-or-error or log present).
- Registry test: 8 topics discovered.
- README: list all experiences; browser spot-check 2–3 topics; full tests + build; commit/push.

## Self-Review
- Every spec's MVP covered by its primary scenario; every spec's failure-scenario list covered by ≥1 implemented failure (k8s pod crash, kafka broker failure, networking DNS failure, linux EACCES, databases tx/WAL edge, v8 deopt, system-design DB failure + circuit breaker).
- No placeholders; kinds reuse verified per visuals design above.
