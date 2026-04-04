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
│   Browser · Mobile Native · Windows UI · API · DB   │
└─────────────────────────────────────────────────────┘
```

Data flows upward: drivers handle platform interaction, workflows define what to do, the engine orchestrates execution, and the output layer receives validated structured results.

---

## Driver Layer

Drivers are the surface connectors. They translate G4's unified action vocabulary into platform-specific operations. G4 uses the **WebDriver protocol** as its underlying standard, which provides a consistent command interface regardless of whether the target is a browser, a native mobile app, a Windows desktop application, or an HTTP API.

| Driver | Surface | Protocol |
|---|---|---|
| ChromeDriver / GeckoDriver | Web browser (headless or headed) | WebDriver W3C |
| Appium Driver | iOS and Android native apps | WebDriver / Appium extensions |
| UIA Driver Server | Windows native desktop UI | UI Automation → WebDriver bridge |
| HTTP Driver | REST APIs | HTTP with session and auth management |

All drivers implement the same interface from the engine's perspective. The engine does not need to know which driver it is talking to — it sends commands and receives results through a uniform contract.

**Custom drivers** can be written by implementing the driver interface. This allows G4 to be extended to non-standard surfaces without modifying the engine.

### Why WebDriver?

The WebDriver protocol was chosen because:

- It is platform-agnostic by design
- It separates the command sender (engine) from the command executor (driver)
- It provides a mature, well-understood vocabulary for UI interaction
- It allows the driver layer to be replaced or extended without touching execution logic

---

## Workflows & Plugins

Workflows are JSON documents that define what the engine should do. They are the primary interface between the user and the engine — a workflow describes the sequence of actions, branching logic, and extraction rules for a given automation task.

### Workflow Structure

A workflow is composed of three nested units:

```
Workflow
└── Stage          (top-level phase, e.g. "Authenticate", "Extract", "Validate")
    └── Job        (parallel execution unit within a stage)
        └── Step   (individual action: navigate, click, extract, transform, assert...)
```

**Stages** run sequentially. **Jobs** within a stage run in parallel (subject to worker availability). **Steps** within a job run sequentially.

This structure gives you control over concurrency at the job level without requiring custom threading logic.

### Plugins

Plugins extend the available step vocabulary. If the built-in action library doesn't cover a specific operation, you write a plugin that implements it and register it with the engine. Plugins:

- Are standard .NET assemblies implementing the G4 plugin interface
- Are loaded at engine startup (or dynamically via the tools catalog)
- Appear as first-class steps in workflow documents once registered
- Can wrap third-party libraries, external services, or custom business logic

The plugin system is open source. See [Workflows & Plugins](workflows-and-plugins.md) for the full reference.

---

## G4 Engine

The engine is the proprietary execution core. It interprets workflow documents, coordinates drivers, manages workers, runs in-flight ETL, and produces structured output.

### Responsibilities

| Responsibility | Description |
|---|---|
| Workflow parsing | Validate and deserialize workflow JSON before execution begins |
| Session management | Open, reuse, and close driver sessions across steps and jobs |
| Worker distribution | Dispatch jobs across worker nodes for horizontal execution |
| In-flight ETL | Apply transformations and schema validation during extraction — not after |
| Result aggregation | Collect output from all workers and serialize into unified structured JSON |
| Failure handling | Isolate step failures, apply retry policies, and propagate errors with full context |

### What the engine is not

The engine is not a wrapper around Playwright, Selenium, or any other automation framework. It is a purpose-built execution system designed around G4's workflow model and data processing requirements. The engine's relationship to those frameworks is through the driver layer — it talks to drivers via the WebDriver protocol, and drivers may use those libraries internally.

### Proprietary vs open source

The engine is the only proprietary component in the G4 platform. Everything else — drivers, workflows, plugins, services, the VS Code extension, the Recorder — is open source.

You license the engine. You own the toolchain.

---

## Output Layer

Every workflow run produces structured JSON output. The output schema is consistent regardless of which driver or workflow was used.

### Output structure

```json
{
  "status": "Success",
  "durationMs": 4821,
  "stages": [
    {
      "name": "Extract",
      "jobs": [
        {
          "steps": [...],
          "records": [...],
          "validationResults": [...]
        }
      ]
    }
  ],
  "records": [...],
  "errors": []
}
```

### Output fields

| Field | Description |
|---|---|
| `status` | `Success`, `PartialSuccess`, or `Failure` |
| `durationMs` | Total wall-clock execution time in milliseconds |
| `records` | Extracted data records — typed and validated against the workflow schema |
| `validationResults` | Per-record validation outcome, including which rules passed or failed |
| `errors` | Step-level errors with context: stage, job, step, driver response |

### Output destinations

Output can be:

- **Returned directly** via the G4 Engine API or SDK
- **Written to files** — JSON, CSV, or custom serialization via plugin
- **Streamed** to downstream services during execution (not only at completion)
- **Returned to AI agents** via G4 MCP as structured tool output

When running distributed via G4 Services, results from all workers are aggregated before delivery. The caller always receives a single unified response regardless of how many workers participated.

---

## Separation of Concerns

The layered architecture enforces a strict separation:

| Layer | What it knows | What it doesn't know |
|---|---|---|
| Driver | How to operate a surface | What the workflow is doing or why |
| Engine | How to execute a workflow | What surface is being operated |
| Workflow | What to do | How the engine or driver implements it |
| Output | The result | How it was produced |

This separation is what allows each layer to be extended or replaced independently. A new driver doesn't require changes to workflows. A new plugin doesn't require changes to the engine. A new output format doesn't require changes to anything else.

---

## Related

- [Execution Model](execution-model.md) — workers, concurrency, session lifecycle, and failure handling
- [Drivers & Surfaces](drivers-and-surfaces.md) — driver configuration and custom driver development
- [Workflows & Plugins](workflows-and-plugins.md) — workflow structure, step reference, and plugin development
- [ETL & Data Pipelines](etl-and-data-pipelines.md) — in-flight transformation and schema validation
- [G4 Engine](../products/g4-engine.md) — engine product reference and licensing
