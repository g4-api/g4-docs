# G4 as an Execution Layer

G4 is not an agent product. It is not a workflow builder. It is the execution substrate that runs beneath both.

That distinction matters. The automation and AI tooling ecosystem contains three meaningfully different categories of technology that are frequently discussed together but operate at different layers of the stack. Conflating them produces poor architecture decisions — integrations that fight each other, execution models that don't scale, and tools adopted for the wrong reasons.

This page explains where G4 fits, what problem it actually solves, and why treating it as an execution layer — rather than a competitor to workflow tools or agent environments — is the correct mental model.

---

## Category Distinctions

### Workflow Tools

Workflow tools are graph-first systems. They give you a canvas — visual or declarative — where you define nodes, edges, triggers, and data mappings. The product is the graph. Execution is what happens when you run it.

These tools are excellent at modeling predictable, human-designed processes. They tend to assume that the shape of the automation is known in advance, that it can be drawn, and that it will remain stable over time. Data flows through fixed paths. Connections between services are configured once and reused.

n8n is a representative example. Its strength is its model: composable, visual, low-code automation that moves data between services according to a defined graph.

### Agent Environments

Agent environments give AI agents an operational surface — a place to run, observe, and act. They are built around the agent as the primary actor. The environment provides the scaffolding: a runtime, tooling access, a UI for monitoring and control, state management across sessions.

The agent makes decisions. The environment executes them and gives the agent feedback. The value is in how the environment supports the agent's decision loop — observability, safety controls, user intervention points, session continuity.

OpenClaw is a representative example. Its strength is the operator surface: an environment designed for human-agent collaboration, where an agent can be launched, guided, and supervised as it works toward a goal.

### Execution Layers

Execution layers are the substrate. Their role is not to define the graph and not to host the agent — it is to execute whatever is asked of them, reliably, at scale, with full observability.

An execution layer provides: a driver abstraction over any surface, a plugin model that resolves and invokes capabilities, an ETL pipeline that processes data in flight, a worker model that distributes load, and a response contract that returns structured results to whatever called it.

The caller can be a human operator, a workflow tool, an AI agent, an API client, or another system. The execution layer doesn't care. Its contract is stable regardless of who is invoking it or what they are trying to accomplish.

**G4 is an execution layer.**

```none
┌──────────────────────────────────────────────────────┐
│         Caller (Agent · Workflow Tool · API)         │
│        Intent · Plans · Graphs · Orchestration       │
└─────────────────────────┬────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────┐
│                  G4 Execution Layer                  │
│  Workflows · Plugins · MCP · Drivers · ETL · Workers │
└─────────────────────────┬────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────┐
│      External Systems · UIs · APIs · Databases       │
└──────────────────────────────────────────────────────┘
```

---

## Where G4 Fits

G4 operates in two modes. They are not two products — they are two ways of using the same execution substrate, depending on whether a human or an agent is driving intent.

### Mode 1: Deterministic Automation

In this mode, G4 executes structured, fully specified workflows. The execution path is defined in advance. Steps run in order. Behavior is predictable.

This is the right model for:

- Governed business processes where the sequence must be auditable
- RPA workflows replacing manual operations in regulated environments
- Test automation where repeatability is a requirement, not a preference
- Data pipelines where extraction, transformation, and validation rules are fixed
- Any scenario where "this must always work the same way" is the design goal

Deterministic mode does not require AI. It does not require an agent. It is a clean, powerful execution model that works without any of that — and that is an explicit design choice, not a limitation.

### Mode 2: Agent Enhancement

In this mode, G4 serves as the execution substrate for an external agent. The agent determines intent; G4 resolves and executes the required capabilities.

Rather than the agent being constrained to a static graph of pre-wired tools, G4 exposes a **dispatcher layer** through which the agent can dynamically resolve and invoke any registered capability — built-in actions, SDK plugins, MCP-connected tools, external RPC repositories, or flow templates. The agent operates against a live catalog, not a fixed menu.

The key distinction:

| | Static graph model | G4 agent enhancement model |
|---|---|---|
| Tool availability | Fixed at design time | Resolved dynamically from the catalog |
| Execution path | Predefined by the graph | Derived from intent at runtime |
| Surface access | Defined by graph connections | Any driver the engine can reach |
| Result format | Graph output | Structured JSON per the G4 response contract |
| Governance | Varies by platform | Enforced at the execution layer |

G4 does not provide the agent. It provides what the agent needs to act in the world.

---

## Why Static Agent Graphs Hit Limits

Most systems that connect AI agents to tools do so through a predefined graph. The tools are nodes. The connections are edges. The agent operates inside this graph — it can traverse paths and choose between options, but the structure itself is fixed by whoever built it.

This model works well for narrow, well-specified tasks. It fails under three common pressures:

**Capability combinatorics.** The number of tool combinations an agent might need grows faster than anyone can wire graphs. Every new integration requires a new connection, a new edge, a new deployment. The graph becomes the bottleneck on what the agent can do.

**Intent that doesn't fit the graph.** An agent working toward an open-ended goal may need to compose tools in ways that weren't anticipated when the graph was built. Static graphs force the agent to work with what's available in its immediate context, not with what it actually needs.

**Governance at the wrong layer.** When execution is distributed across graph nodes, applying consistent policy — retries, timeouts, failure handling, logging, output schema — requires doing it everywhere. This is fragile.

G4 solves these problems by moving execution capability below the graph entirely. Tools are registered in a catalog. The engine resolves them on demand. Governance is enforced at the execution layer, once, for everything that runs through it. The agent expresses intent; G4 handles execution.

---

## How G4 Complements Existing Tools

G4 is designed to sit *under* or *beside* your existing tooling, not to replace it.

### Under a workflow tool

A workflow tool like n8n is excellent at modeling data flows between services. What it is not designed to do is operate a browser, extract structured data from a dynamic UI, distribute execution across dozens of parallel workers, or apply in-flight ETL to extracted data.

G4 can handle the execution-heavy segments of a workflow as a node or action within the tool. The workflow tool handles orchestration and data routing. G4 handles the execution that requires surface access, driver management, or scale.

You keep your current automation graph. You add G4 where raw execution power is needed.

### Under an agent environment

An agent environment like OpenClaw provides the operational surface for the agent — the runtime, the UI, the session management, the human oversight layer. What it is not designed to be is a high-throughput execution substrate that can operate arbitrary surfaces through a uniform protocol.

G4 can serve as the execution layer for agents running inside that environment. The agent decides what to do. G4 executes it — against a browser, an API, a database, a legacy desktop application — and returns structured results. The agent environment retains control of the agent's decision loop and operator interface.

You keep your agent environment. You add G4 where real-world execution is required.

### Standalone

G4 does not require a workflow tool or an agent environment. In deterministic mode, it is a complete execution platform on its own. Teams that want structured, governed, auditable automation without any AI layer use G4 directly — submitting workflows via the API, SDK, or MCP.

G4 also ships a first-party workflow canvas built on [Sequential Workflow Designer](https://github.com/nocode-js/sequential-workflow-designer). It is accessible in two ways:

- **VS Code extension** — the [G4 Engine Client](https://marketplace.visualstudio.com/items?itemName=g4-api.g4-engine-client) embeds the full canvas experience inside VS Code, with engine connectivity and live execution
- **Browser** — the canvas runs directly in the browser without requiring an IDE

When a workflow is complete, the canvas exports a fully self-contained JSON document — the automation definition plus all settings, ready to run as a bot. That document can be submitted directly to the engine via the API or any other integration point.

This means G4 can serve as the starting point for automation work, not only as the execution target of other tools.

---

## Mental Model

Three analogies, each accurate for its category:

**n8n is a workflow factory.** It is designed to model, build, and run processes. The factory has machines (nodes), conveyor belts (edges), and a production floor (the canvas). Its strength is in designing and visualizing the process.

**OpenClaw is a cockpit.** It is designed for a human operator and an AI agent to work together. The cockpit has instrumentation, controls, and communication systems. Its strength is in providing the operator surface for human-agent collaboration.

**G4 is the engine, drivetrain, and weapon system the pilot can invoke.** It does not decide where to fly. It does not design the factory floor. It executes, with precision and at scale, whatever it is directed to do — from whatever is directing it.

The cockpit becomes significantly more capable when it can invoke an engine that can operate any surface, compose any registered capability, and return structured results under a consistent contract. The factory becomes significantly more capable when it can call an execution substrate for the work that falls outside the graph model.

---

## Practical Examples

### A workflow tool delegates execution to G4

A team uses n8n to orchestrate their data pipeline. Most of the workflow involves moving data between services — webhook ingestion, API calls, database writes. One segment requires extracting structured data from a legacy web UI that exposes no API.

They add a G4 action to that segment. The workflow passes the target URL and extraction schema. G4 opens a browser session, navigates to the UI, extracts the data, applies the defined transformers, and returns a structured JSON result. n8n receives it as a regular node output and continues the pipeline.

The workflow graph doesn't change. The execution substrate handles what the graph model can't.

### An external agent uses G4 for dynamic tool resolution

An AI agent is working toward a research task that involves navigating several web sources, extracting information, cross-referencing against a database, and producing a structured report.

The agent is connected to G4 via MCP. Rather than invoking a fixed set of pre-wired tools, the agent queries the G4 tools catalog, identifies the plugins it needs for each step, and invokes them sequentially as the task evolves. G4 opens driver sessions, executes the navigation and extraction steps, runs in-flight ETL, and returns structured results at each stage. The agent uses those results to determine what to do next.

The agent's decision-making is unrestricted by graph structure. Its execution is governed by the platform handling it.

### An enterprise team runs governed automation without AI

A regulated financial services team needs to automate a reconciliation process across three internal systems. The process must be auditable, retryable on failure, and produce a timestamped record of every action taken.

They model the process as a G4 workflow — three stages, each with its own driver session targeting a different internal system. The engine executes sequentially, captures performance data and exceptions per step, and produces a structured response with a full trace. Failures are logged with their exact location in the workflow. Retries are configured at the job level.

No AI. No agent. Deterministic execution against a defined workflow, with full observability built into the platform.

---

## Final Take

G4 is not another interface for AI agents. It is the execution substrate that gives software systems real-world agency — the ability to operate any surface, invoke any capability, process extracted data in flight, distribute execution at scale, and return structured results under a consistent contract.

G4 also ships a first-party workflow canvas, accessible via the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=g4-api.g4-engine-client) or directly in the browser. The canvas exports a fully self-contained JSON document — complete automation definition including all settings — that can be submitted directly to the engine as a bot. Build in the canvas, run anywhere the engine is reachable.

When you need to model a process, use a workflow tool. When you need an environment for human-agent collaboration, use an agent environment. When you need something to actually execute — reliably, at scale, against any surface — that is what G4 is for.

The strongest architecture uses all three at the right layer.

---

## Related

- [Architecture](architecture.md) — G4's internal layer model: driver, workflow, engine, and output
- [Execution Model](execution-model.md) — how the engine schedules and manages execution
- [Workflows & Plugins](workflows-and-plugins.md) — the workflow document structure and plugin system
- [Drivers & Surfaces](drivers-and-surfaces.md) — the driver abstraction and session lifecycle
- [G4 MCP](../products/g4-mcp.md) — the MCP dispatcher and tool resolution for AI agents
