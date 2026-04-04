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
| `authentication` | G4 authentication credentials (`username`, `password`, `token`). Tokens are issued by G4 Services — see the [Development License](https://github.com/g4-api/g4-services?tab=readme-ov-file#development-license) for free tier access. |
| `automationSession` | Auto-populated and managed by the engine when a session is created. Not set by the user. |
| `dataSource` | External data source configuration — repository, filters, and auth for input data. |
| `driverParameters` | Which driver to use and how to reach it. See [Drivers & Surfaces](drivers-and-surfaces.md). To attach to an existing driver session, set `driver` to `"Id(<driverSessionId>)"`. |
| `driverSession` | Auto-populated and managed by the engine. Not set by the user. |
| `groupId` | Groups all instances of this automation created together — across distributed workers and data-driven runs. Appears as the top-level key in the response. |
| `reference` | User-level identity for this automation or bot — name, description, ID. Auto-assigned if not provided. |
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
			"servers": { ... },
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
| `automationSettings.maxParallel` | Scale throttle — maximum number of automations that may run concurrently. Execution is FIFO: as soon as one automation completes, the next starts. Optimizes CPU utilization without over-committing resources (e.g., 10 pods should not run 1000 simultaneous automations). |
| `automationSettings.returnRules` | Per-rule results always return. This controls whether the rule itself — the request and the rule response — is included alongside the results. Useful for fine-tuning automation behavior. |
| `environmentsSettings.environmentVariables` | Named environments with key/value parameter sets. Access parameters at runtime via `{{$Get-Parameter --Name:<parameterName> --Scope:Application}}`. |
| `pluginsSettings.externalRepositories` | Code-agnostic external plugin sources served over HTTP (G4 protocol). See [External Plugin Repositories](#external-plugin-repositories). |
| `pluginsSettings.servers` | MCP server connections — standard MCP settings object. Connected MCP tools are resolved into the tools catalog as first-class plugins. |
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
| `driverSession` | Auto-populated and managed by the engine. Not set by the user. |
| `failOnException` | Stop this stage on first exception instead of the default silent-and-continue behavior. |
| `ignoredExceptions` | Exception types to suppress — not recorded, not counted, and will not trigger `failOnException` even when it is set. |
| `dependencies` | IDs of stages (from their `reference` field) that must complete before this stage begins. |

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
| `driverSession` | Auto-populated and managed by the engine. Not set by the user. |
| `automationSession` | Auto-populated and managed by the engine. Not set by the user. |
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
| `onElement` | Target element selector — CSS, Xpath, or driver-specific locator. |
| `locator` | Locator strategy for `onElement` (e.g., `CssSelector`, `Xpath`). |
| `onAttribute` | Attribute to read or write on the target element. |
| `regularExpression` | Pattern applied to the value before any further processing — extraction, transformation, storage, or comparison. |
| `capabilities` | User-level metadata for the rule. Not related to the driver. Used by tooling (e.g., the SWF UI stores a user-assigned label or display name here). |
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
| G4 SDK plugins | .NET implementations using the [G4 API Client SDK](https://github.com/g4-api/g4-api-client). Referenced by the g4.hub or placed under the plugins directory. Covered in full in the G4 Plugins reference. |
| Templates | Flows registered as plugins. A template wraps any number of rules into a single named tool that exposes its own parameters and properties. See [Templates](#templates). |
| MCP tools | MCP servers configured via `pluginsSettings.servers`. Connected tools are resolved into the catalog and invocable as first-class rules. |
| External RPC repositories | Code-agnostic plugin sources served over HTTP using the G4 protocol. Any language, any runtime. Registered via `pluginsSettings.externalRepositories`. |

All types are resolved and dispatched identically. The workflow does not know or care whether a plugin is built-in, SDK-based, a template, MCP-connected, or served remotely over HTTP.

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

External plugin repositories are code-agnostic plugin sources served over HTTP using the G4 protocol. Any language or runtime can expose plugins this way. They are registered in `settings.pluginsSettings.externalRepositories`:

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

### MCP Servers

MCP server connections are configured via `settings.pluginsSettings.servers` using the standard MCP settings object. Tools exposed by connected MCP servers are resolved into the tools catalog and become first-class plugins — invocable as rules in any workflow, indistinguishable from built-in or SDK-based plugins.

See [G4 MCP](../products/g4-mcp.md) for the full dispatcher architecture and MCP integration reference.

### Templates

A template is a flow registered as a plugin. It takes any number of rules — a complete automation sequence that could span dozens of steps — and exposes it as a single named tool in the catalog with its own parameters and properties.

Once registered, a template is indistinguishable from any other plugin. It appears in the manifest, is referenced by its `key` in workflow rules, receives arguments, and returns results the same way any other plugin does. The complexity it encapsulates is invisible to the caller.

Templates can be used inside other templates, enabling layered abstraction — a template that calls other templates, each hiding its own complexity behind a clean interface.

To prevent fragility, abuse, and recursive execution, template nesting is **hard-limited to a depth of 10**. If a template directly or indirectly calls itself, execution stops at depth 10 and the flow continues — the recursion does not crash or hang the automation.

### Nested Plugins

Container plugins execute child rules within their own context. A loop plugin repeats its `rules` array a defined number of times. A conditional plugin executes its `rules` only when its condition is met.

Nesting is unlimited. The hierarchy is visible in the response via the `parentReference` chain on each performance point.

---

## Variable Interpolation

Workflow values support template syntax. The engine resolves each token at rule execution time against the current data context.

Parameters are accessed using the `Get-Parameter` plugin inline syntax:

```
{{$Get-Parameter --Name:<parameterName> --Scope:<scope>}}
```

Common scopes:

| Scope | Description |
|---|---|
| `Application` | Parameters from `environmentsSettings.environmentVariables` — shared across the automation |
| `Session` | Parameters stored during the current session via `RegisterParameter` or `dataCollector` |

Sources for parameter values:

| Source | How it's set |
|---|---|
| Prior rule output | A `dataCollector` on an earlier rule stores the extracted value under a named key |
| `RegisterParameter` plugin | Explicitly registers a value (literal, extracted, or transformed) into the context |
| Environment variables | Defined in `settings.environmentsSettings.environmentVariables` under a named environment |
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
