# Workflows & Plugins

Workflows define what G4 does. Plugins extend what G4 can do. Together they form the complete automation surface — workflows describe the sequence and logic, plugins provide the individual action implementations.

---

## What is a Workflow?

A workflow is a JSON document submitted to the G4 engine. It is fully declarative — it describes *what* should happen, not *how* the engine should implement it. The engine reads the document, resolves the plugins referenced by each rule, and executes the sequence against the configured driver.

Workflows are language-agnostic. There is no scripting, no runtime, and no SDK required to write one. A workflow is data.

---

## Workflow Document Structure

```json
{
	"authentication": { ... },
	"automationSession": "string",
	"dataSource": { ... },
	"driverParameters": { ... },
	"driverSession": "string",
	"groupId": "string",
	"reference": { ... },
	"settings": { ... },
	"stages": [ ... ]
}
```

| Field | Description |
|---|---|
| `authentication` | Credentials used during session setup (`username`, `password`, `token`). |
| `automationSession` | Session identifier for resuming or attaching to an existing automation session. |
| `dataSource` | External data source configuration — repository, filters, and auth for input data. |
| `driverParameters` | Which driver to use and how to reach it. See [Drivers & Surfaces](drivers-and-surfaces.md). |
| `driverSession` | An existing driver session to attach to instead of opening a new one. |
| `groupId` | The automation group identifier. Appears as the top-level key in the response. |
| `reference` | Metadata — name, description, and ID for this automation run. |
| `settings` | Engine behavior configuration. See [Settings](#settings) below. |
| `stages` | The execution tree — stages, jobs, and rules. |

---

## Settings

The `settings` object controls engine behavior for the run:

```json
{
	"settings": {
		"automationSettings": {
			"loadTimeout": 0,
			"maxParallel": 0,
			"returnFlatResponse": true,
			"returnRules": true,
			"returnStructuredResponse": true,
			"searchTimeout": 0
		},
		"environmentsSettings": {
			"defaultEnvironment": "string",
			"environmentVariables": {
				"<envName>": {
					"parameters": {
						"<key>": "value"
					}
				}
			},
			"returnEnvironment": true
		},
		"exceptionsSettings": {
			"returnExceptions": true
		},
		"performancePointsSettings": {
			"returnPerformancePoints": true
		},
		"pluginsSettings": {
			"externalRepositories": [ ... ],
			"forceRuleReference": true
		},
		"screenshotsSettings": {
			"convertToBase64": true,
			"onExceptionOnly": true,
			"outputFolder": "string",
			"returnScreenshots": true
		}
	}
}
```

Settings are covered in full in the Engine Settings reference. Notable fields:

| Field | Description |
|---|---|
| `automationSettings.maxParallel` | Maximum number of jobs that may run in parallel within a stage. |
| `automationSettings.returnRules` | Include the per-rule execution trace in the response. |
| `environmentsSettings.environmentVariables` | Named environments with key/value parameter sets, available via `{{$parameterName}}` interpolation. |
| `pluginsSettings.externalRepositories` | External plugin sources — RPC endpoints, MCP tools, or any G4-protocol-compatible repository. See [External Plugin Repositories](#external-plugin-repositories). |
| `screenshotsSettings.onExceptionOnly` | Capture screenshots only on failure rather than for every step. |

---

## The Execution Tree

The `stages` array is the root of the execution tree:

```
stages[]                    (sequential)
└── jobs[]                  (sequential by default)
    └── rules[]             (sequential — individual plugin invocations)
```

### Stages

Each stage is an object with the following key fields:

```json
{
	"name": "string",
	"description": "string",
	"condition": "string",
	"driverParameters": { ... },
	"driverSession": "string",
	"automationSession": "string",
	"failOnException": true,
	"ignoredExceptions": [],
	"dependencies": [],
	"jobs": [ ... ]
}
```

| Field | Description |
|---|---|
| `name` | Stage name — appears in the response reference chain. |
| `condition` | Expression evaluated before the stage executes. Stage is skipped if false. |
| `driverParameters` | Stage-level driver override — opens an isolated session for this stage. |
| `driverSession` | Attach to a specific existing session instead of using the inherited one. |
| `failOnException` | Stop this stage on first exception instead of the default silent-and-continue behavior. |
| `ignoredExceptions` | Exception types to suppress — not recorded, not counted. |
| `dependencies` | Stage names that must complete before this stage begins. |

### Jobs

Each job within a stage:

```json
{
	"name": "string",
	"description": "string",
	"condition": "string",
	"driverParameters": { ... },
	"driverSession": "string",
	"automationSession": "string",
	"ignoredExceptions": [],
	"stopOnError": true,
	"rules": [ ... ]
}
```

| Field | Description |
|---|---|
| `condition` | Expression evaluated before the job executes. Job is skipped if false. |
| `driverParameters` | Job-level driver override — isolated session for this job. |
| `stopOnError` | Stop this job on first rule failure. Default engine behavior is silent-and-continue. |
| `rules` | The ordered list of plugin invocations (steps) in this job. |

### Rules (Steps)

A rule is a single plugin invocation. The `pluginName` field references the plugin by its `key` from the plugin manifest:

```json
{
	"pluginName": "string",
	"argument": "string",
	"onElement": "string",
	"locator": "string",
	"onAttribute": "string",
	"regularExpression": "string",
	"capabilities": { ... },
	"dataCollector": { ... },
	"transformers": [ ... ],
	"rules": [ ... ]
}
```

| Field | Description |
|---|---|
| `pluginName` | The `key` of the plugin to invoke, from the plugin manifest. |
| `argument` | Primary input to the plugin — a URL, a value, a command, a count, etc. |
| `onElement` | Target element selector — CSS, XPath, or driver-specific locator. |
| `locator` | Locator strategy for `onElement` (e.g., `CssSelector`, `XPath`). |
| `onAttribute` | Attribute to read or write on the target element. |
| `regularExpression` | Pattern applied to extracted content before storing. |
| `capabilities` | Rule-level capability overrides passed to the driver. |
| `dataCollector` | Extraction schema — what to collect and where to store it. See [ETL & Data Pipelines](etl-and-data-pipelines.md). |
| `transformers` | Ordered list of transformations applied to the extracted value. |
| `rules` | Nested rules — child steps executed within a container plugin (e.g., loop body). |

---

## Plugins

A plugin is any implementation that abides by the G4 protocol. The engine dispatches a rule to the plugin, the plugin executes, and returns a result. Every plugin becomes a first-class, independent entity in the tools catalog — indistinguishable in use from any other plugin, regardless of how it was implemented or where it runs.

### What Can Be a Plugin

| Type | Description |
|---|---|
| Built-in G4 actions | Native implementations shipped with the engine — browser control, flow control, data operations, system utilities |
| G4 Protocol implementations | Any code that implements the G4 plugin protocol — any language, any runtime, any environment |
| MCP tools | Tools connected through the G4 MCP dispatcher become catalog entries and are invocable as rules |
| External RPC repositories | Remote plugin repositories served over the G4 protocol — registered via `pluginsSettings.externalRepositories` |

All four types are resolved and dispatched identically. The workflow does not know or care whether a plugin is built-in, local, remote, or AI-connected.

### Discovering Available Plugins

To see which plugins are available on a running G4 server:

```
GET <serverUrl>/api/v4/g4/integration/manifests/plugins
```

Each entry includes the plugin's `key`, `name`, `description`, parameter schema, and type. Use the `key` value as `pluginName` in workflow rules.

To retrieve a specific plugin's manifest:

```
GET <serverUrl>/api/v4/g4/integration/manifests/plugins/<key>
```

### External Plugin Repositories

External plugins — remote RPC implementations, MCP-connected tools, or any G4-protocol-compatible source — are registered in `settings.pluginsSettings.externalRepositories`:

```json
{
	"settings": {
		"pluginsSettings": {
			"externalRepositories": [
				{
					"name": "string",
					"url": "string",
					"version": 0,
					"timeout": 0,
					"credentials": {
						"username": "string",
						"password": "string",
						"token": "string"
					},
					"headers": {
						"<headerName>": "value"
					},
					"capabilities": {
						"<key>": "value"
					}
				}
			]
		}
	}
}
```

Once registered, all plugins exposed by the repository are resolved into the tools catalog for the duration of the automation run and are available as first-class rules.

### Nested Plugins

Container plugins execute child rules within their own context. A loop plugin repeats its `rules` array a defined number of times. A conditional plugin executes its `rules` only when its condition is met.

Nesting is unlimited. The hierarchy is visible in the response via the `parentReference` chain on each performance point.

---

## Variable Interpolation

Workflow values support `{{$parameterName}}` template syntax. The engine resolves each token at step execution time against the current data context.

Sources for variable values:

| Source | How it's set |
|---|---|
| Prior rule output | A `dataCollector` on an earlier rule stores the extracted value under a key |
| `RegisterParameter` plugin | Explicitly registers a value (literal, extracted, or transformed) into the context |
| Environment variables | Defined in `settings.environmentsSettings.environmentVariables` |
| Engine built-ins | Runtime values such as current URL, page title, timestamps |
| External input | Parameters passed in with the workflow submission |

---

## Related

- [Architecture](architecture.md) — how workflows fit into the layer model
- [Execution Model](execution-model.md) — how the engine runs workflow documents
- [ETL & Data Pipelines](etl-and-data-pipelines.md) — `dataCollector`, transformers, and extraction schema
- [Drivers & Surfaces](drivers-and-surfaces.md) — session context configuration across stages and jobs
- [G4 Plugins](../products/g4-plugins.md) — building and registering custom plugins
- [G4 MCP](../products/g4-mcp.md) — connecting MCP tools to the dispatcher
