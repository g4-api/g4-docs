# Architecture

G4 is a layered system. Each layer has a defined role, a defined interface, and can be extended or replaced independently. Understanding the architecture helps you configure G4 correctly, extend it effectively, and debug it when things don't go as expected.

---

## The Layer Model

```
┌─────────────────────────────────────────────────────┐
│                    Output Layer                     │
│       Validated JSON · Pipelines · Agents · Storage │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              G4 Engine  [proprietary]               │
│  Workflow execution · Orchestration · ETL · Workers │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│          Workflows & Plugins  [open source]         │
│    Action sequences · Validation · Custom plugins   │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              Driver Layer  [open source]            │
│          Any surface G4 or the user targets         │
└─────────────────────────────────────────────────────┘
```

Data flows upward: drivers handle surface interaction, workflows define what to do, the engine orchestrates execution, and the output layer receives validated structured results.

---

## Driver Layer

Drivers are surface connectors. Their role is to translate G4's unified action vocabulary into operations on a specific target — a browser, a mobile app, a desktop application, an HTTP API, a database, or anything else.

G4 uses the **WebDriver protocol** as its underlying standard. This provides a consistent command interface regardless of what surface the driver targets. From the engine's perspective, every driver looks the same — it sends commands and receives results through a uniform contract.

Drivers are open source. The set of available drivers is not fixed — users can connect any WebDriver-compatible driver or implement their own for non-standard surfaces. G4 does not dictate which drivers you use.

See [Drivers & Surfaces](drivers-and-surfaces.md) for configuration and custom driver development.

---

## Workflows & Plugins

Workflows are JSON documents that define what the engine should do. They are the primary interface between the user and the engine — a workflow describes the sequence of actions, branching logic, and extraction rules for a given automation task.

### Workflow Structure

A workflow is composed of three nested units:

```
Automation
└── Stage       (top-level phase with its own driver context)
    └── Job     (unit of work with its own driver context)
        └── Step  (individual action: navigate, click, extract, transform, assert...)
```

**Stages** run sequentially. **Jobs** within a stage run sequentially by default.

### Context Isolation — Why Three Layers?

The three-layer structure exists primarily for **driver context management**, not just organization.

Each stage and each job can run on its own driver session, or it can inherit and share the session from its parent. This gives you precise control over which parts of a workflow are isolated and which are connected:

- A job can open its own browser session independently of its stage
- A job can connect to the stage's active session and continue from where it left off
- Stages can be fully isolated from each other, running against different surfaces entirely

This flexibility is essential for complex scenarios:

- **Multi-phase flows**: authenticate in one stage (establish session), extract in the next (reuse session), validate in a third (isolated)
- **Active crawling**: each job targets a different URL or page state while sharing authenticated context from the parent stage
- **Cross-surface workflows**: one stage operates a browser, another calls an API, a third writes to a database — each with its own driver

In most simple automation and RPA use cases, you will have a single stage with one or more jobs, all sharing the same driver session. The extra layers only come into play when you need the driver and context control they provide.

### Plugins

Plugins extend the available step vocabulary. If the built-in action library doesn't cover a specific operation, you implement a plugin and register it with the engine. Plugins:

- Implement the G4 plugin interface
- Are registered with the engine at startup or dynamically via the tools catalog
- Appear as first-class steps in workflow documents once registered
- Can wrap any logic — external calls, file operations, business rules, integrations

See [Workflows & Plugins](workflows-and-plugins.md) for the full reference.

---

## G4 Engine

The engine is the proprietary execution core. It interprets workflow documents, coordinates drivers, manages worker and session lifecycle, runs in-flight ETL, and produces structured output.

### Design Philosophy

G4 Engine is built on standard SDK libraries — no external frameworks, no third-party automation libraries. The only external dependencies are minimal and scoped: HAP (HTML parsing), SQLite (embedded state), and in limited cases Newtonsoft.Json. Everything else is built directly on the platform SDK.

This is a deliberate design decision. Third-party libraries are a liability in strict, regulated, or air-gapped environments — they can be blocked by security policy, incompatible with the target runtime, or introduce transitive dependencies that create compliance risk. G4 eliminates this by implementing its own clients from the ground up.

The engine is not a wrapper around Playwright, Selenium, or any other automation framework. Those tools were considered and deliberately not used. The engine implements its own WebDriver client, its own HTTP session management, its own ETL pipeline, and its own worker distribution. This makes it fully self-contained and completely independent of the automation ecosystem's dependency graph.

### Engine Responsibilities

| Responsibility | Description |
|---|---|
| Workflow parsing | Validate and deserialize workflow JSON before execution begins |
| Session management | Open, reuse, and close driver sessions based on job/stage context configuration |
| Worker distribution | Dispatch jobs across worker nodes for horizontal execution |
| In-flight ETL | Apply transformations and schema validation during extraction — not after |
| Result aggregation | Collect output from all sessions and serialize into a unified response |
| Failure handling | Isolate step failures, apply retry policies, and propagate errors with full context |

### Proprietary vs Open Source

The engine is the only proprietary component in the G4 platform. Everything else — drivers, workflows, plugins, services, the VS Code extension, the Recorder, the MCP dispatcher — is open source.

You license the engine. You own the toolchain.

---

## Output

Every workflow run produces a structured JSON response. The response is keyed by the automation's group ID and contains performance data, session-level results, and per-step execution traces.

### Response Structure

```json
{
  "<groupId>": {
    "dataProvider": [ ... ],
    "performancePoint": {
      "$type": "Automation",
      "start": "2026-04-04T18:19:06.346435Z",
      "end": "2026-04-04T18:19:11.960607Z",
      "runTime": 56141727,
      "sessionTime": 106662220,
      "authenticationTime": 14868,
      "driverSetupTime": 0,
      "setupTime": 1173,
      "setupDelegationTime": 9055,
      "teardownTime": 291995,
      "teardownDelegationTime": 27773,
      "timeouts": 0
    },
    "sessions": {
      "<sessionId>": {
        "dataProvider": [ ... ],
        "iteration": 0,
        "performancePoint": { ... },
        "requestSize": 150816,
        "responseData": {
          "exceptions": [],
          "performancePoints": [ ... ],
          "responseSize": 127990
        }
      }
    }
  }
}
```

### Key Fields

| Field | Description |
|---|---|
| `groupId` | The automation run identifier — top-level key of the response |
| `dataProvider` | Extracted data records produced by the automation |
| `performancePoint` | Timing breakdown for the automation or session (see below) |
| `sessions` | Map of driver session ID → session result |
| `requestSize` | Size of the incoming workflow request in bytes |
| `responseSize` | Size of the engine response in bytes |
| `exceptions` | Unhandled exceptions that occurred during the session |
| `performancePoints` | Per-step execution trace (one entry per plugin/action executed) |

### Timing Fields

All time values are in **.NET ticks** (100-nanosecond units).

| Field | Description |
|---|---|
| `runTime` | Total execution time of the automation or step |
| `sessionTime` | Duration the driver session was active |
| `authenticationTime` | Time spent on authentication steps |
| `driverSetupTime` | Time to initialize the driver session |
| `setupTime` | Plugin or step setup time |
| `setupDelegationTime` | Time delegating setup to sub-components |
| `teardownTime` | Plugin or step teardown time |
| `teardownDelegationTime` | Time delegating teardown to sub-components |
| `timeouts` | Number of timeout events during execution |

### Per-Step Execution Trace

Each entry in `performancePoints` represents one plugin execution and carries its full context:

```json
{
  "$type": "Plugin",
  "reference": {
    "alias": "RegisterParameter",
    "name": "RegisterParameter",
    "type": "Action",
    "description": "...",
    "id": "2842257e13015",
    "iteration": 0,
    "jobReference": {
      "name": "Setup",
      "id": "1506f1c332245c",
      "stageReference": {
        "name": "G4™ Default Stage",
        "id": "5d0a08a119ec4",
        "automationReference": {
          "name": "2026-04-04T18:19:06Z: Untitled Automation",
          "groupId": "7c0a88ae-3635-410e-ac38-08b6fd16c6df",
          "id": "681245c8-b95c-48a7-9ad1-b0e83aa0fe8a",
          "iteration": 0
        }
      }
    },
    "parentReference": { }
  },
  "driverSession": "simulator-d445f568-8a65-493c-87d7-2880283e1969",
  "start": "2026-04-04T18:19:06.481521Z",
  "end": "2026-04-04T18:19:06.518453Z",
  "runTime": 151211,
  "setupTime": 194660,
  "setupDelegationTime": 20379,
  "teardownTime": 2397,
  "teardownDelegationTime": 6021,
  "timeouts": 0
}
```

The `reference` chain — step → job → stage → automation — gives you full traceability for every action executed, including which driver session it ran on, which iteration it belonged to, and whether it was a child of another plugin (e.g., a step inside a loop via `parentReference`).

### Output Destinations

Output can be:

- **Returned directly** via the G4 Engine API or SDK
- **Written to files** — JSON, CSV, or custom format via plugin
- **Streamed** to downstream services during execution
- **Returned to AI agents** via G4 MCP as structured tool output

When running distributed via G4 Services, results from all sessions are aggregated before delivery. The caller always receives a single unified response regardless of how many workers or sessions participated.

---

## Separation of Concerns

| Layer | What it knows | What it doesn't know |
|---|---|---|
| Driver | How to operate its target surface | What the workflow is doing or why |
| Engine | How to execute a workflow | How the driver implements operations |
| Workflow | What to do | How the engine or driver implements it |
| Output | The result | How it was produced |

This separation is what allows each layer to be extended or replaced without touching the others. A new driver doesn't require changes to workflows. A new plugin doesn't require changes to the engine. A new output format requires no changes anywhere else.

---

## Related

- [Execution Model](execution-model.md) — worker distribution, concurrency, session lifecycle, and failure handling
- [Drivers & Surfaces](drivers-and-surfaces.md) — driver configuration and custom driver development
- [Workflows & Plugins](workflows-and-plugins.md) — workflow structure, step reference, and plugin development
- [ETL & Data Pipelines](etl-and-data-pipelines.md) — in-flight transformation and schema validation
- [G4 Engine](../products/g4-engine.md) — engine product reference and licensing
