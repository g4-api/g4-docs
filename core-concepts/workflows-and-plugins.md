# Workflows & Plugins

Workflows define what G4 does. Plugins extend what G4 can do. Together they form the complete automation surface — workflows describe the sequence and logic, plugins provide the individual action implementations.

---

## What is a Workflow?

A workflow is a JSON document submitted to the G4 engine. It is fully declarative — it describes *what* should happen, not *how* the engine should implement it. The engine reads the document, resolves the plugins referenced by each step, and executes the sequence against the configured driver.

Workflows are language-agnostic. There is no scripting, no runtime, and no SDK required to write one. A workflow is data.

---

## Workflow Document Structure

A workflow document has three top-level concerns:

```json
{
	"driverParameters": { ... },
	"engineSettings": { ... },
	"authentication": { ... },
	"automation": { ... }
}
```

| Field | Description |
|---|---|
| `driverParameters` | Which driver to use and how to reach it. See [Drivers & Surfaces](drivers-and-surfaces.md). |
| `engineSettings` | Engine behavior overrides — failure policy, timeouts, parallelism. Covered in the Engine Settings reference. |
| `authentication` | Credentials or token configuration used during session setup. |
| `automation` | The workflow itself — stages, jobs, and steps. |

---

## The Automation Hierarchy

The `automation` object contains the full execution tree:

```
automation
└── stage          (sequential — one after the other)
    └── job        (sequential by default, isolated context)
        └── step   (plugin invocation)
```

### Automation

The root of the execution tree. Contains metadata (name, description) and the list of stages. The automation is also the level at which engine-wide settings and the default session context are established.

### Stages

Stages group related jobs into named phases. They run sequentially — a stage does not begin until the previous one completes. Typical patterns:

- `Setup` → `Execute` → `Teardown`
- `Authenticate` → `Extract` → `Validate`
- A single unnamed stage for simple flows

Each stage can carry its own driver context or inherit from the automation. See [Drivers & Surfaces](drivers-and-surfaces.md).

### Jobs

Jobs are the primary execution unit within a stage. They run sequentially by default. Each job contains an ordered list of steps and can carry its own isolated driver context.

The job boundary is important for context management: jobs within the same stage can share the parent session or each open their own. This is what enables multi-surface workflows — one job drives a browser, another calls an API, a third writes to a database — within the same stage.

### Steps

A step is a single plugin invocation. Each step references a plugin by its alias, provides its arguments, and optionally attaches a `dataProvider` for extraction. Steps execute in order within a job.

Steps can be nested. Flow-control plugins like `InvokeForLoop` contain child steps that execute within the loop body. The nesting is reflected in the response's `parentReference` chain.

---

## Plugins

Plugins are the action implementations. Every step in a workflow invokes a plugin. The engine resolves the plugin by alias, dispatches the step context to it, and processes the result.

### What a Plugin Is

A plugin is any implementation registered with G4 that accepts a step invocation and returns a result. Plugins are not limited to browser or UI operations. The plugin system covers:

- **Browser actions** — navigate, click, type, extract, scroll, wait
- **Flow control** — loops, conditionals, branching
- **Data operations** — register parameters, transform values, validate
- **Integrations** — HTTP calls, email, external APIs, AI services
- **System operations** — write logs, manage files, execute scripts

### Plugin Aliases

Every plugin has an `alias` — the identifier you use to reference it in a workflow step. The alias is stable and unique within a G4 installation.

### Discovering Available Plugins

To see which plugins are registered on a running G4 server, call the plugin manifest endpoint:

```
GET <serverUrl>/api/v4/g4/integration/manifests/plugins
```

Each entry in the response includes the plugin's `alias`, `name`, `description`, parameter schema, and type. Use the `alias` value when writing workflow steps.

You can also retrieve a single plugin's manifest by alias:

```
GET <serverUrl>/api/v4/g4/integration/manifests/plugins/<alias>
```

### Nested Plugins

Some plugins act as containers — they execute other steps within their own context. `InvokeForLoop` is an example: it repeats a set of child steps a defined number of times. In the response, nested steps carry a `parentReference` pointing to the containing plugin.

This nesting is unlimited. A loop can contain conditionals, conditionals can contain further loops, and so on.

---

## Data Provider

A `dataProvider` can be attached to any step to capture its output into the automation's data context. It defines:

- **What to extract** — the value, attribute, or content the step produces
- **Where to store it** — the key name in the data context
- **Validation rules** — schema constraints applied at extraction time

Data captured via `dataProvider` is available to subsequent steps through variable interpolation and appears in the response's `dataProvider` arrays at the session and automation levels.

---

## Variable Interpolation

Workflow values support `{{$parameterName}}` template syntax. At execution time, the engine resolves each token against the current data context.

Sources for variable values:

| Source | How it's set |
|---|---|
| Prior step output | A `dataProvider` on an earlier step stores the value under a key |
| `RegisterParameter` | Explicitly stores a value (literal, extracted, or transformed) into the context |
| Engine built-ins | Runtime values like current URL, page title, timestamps |
| External input | Variables passed in with the workflow submission |

Variables are resolved at step execution time — they always reflect the current state of the data context at that point in the run.

---

## Related

- [Architecture](architecture.md) — how workflows fit into the layer model
- [Execution Model](execution-model.md) — how the engine runs workflow documents
- [ETL & Data Pipelines](etl-and-data-pipelines.md) — data extraction, transformation, and validation
- [Drivers & Surfaces](drivers-and-surfaces.md) — session context across stages and jobs
- [G4 Plugins](../products/g4-plugins.md) — building and registering custom plugins
