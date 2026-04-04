# Execution Model

G4 is designed for high-throughput, reliable execution across a wide range of automation scenarios — from a single sequential workflow to thousands of concurrent distributed workers. Understanding how the engine schedules and manages execution helps you build workflows that scale correctly and fail precisely.

---

## Execution Modes

### Single-Worker

The default mode. One driver session per workflow run, executing the full workflow from start to finish. Suitable for development, testing, targeted automation, and any scenario where parallelism is not needed.

### Distributed

G4 Services coordinates multiple workers executing the same workflow — each against its own input, its own driver session, and in full isolation from other workers. Workers do not share state. Results from all workers are aggregated into a single response before delivery.

---

## Workflow Execution Lifecycle

When the engine receives a workflow, it executes through the following phases in order:

**1. Parse & Validate**
The workflow JSON is parsed and validated against the engine schema. Driver parameters are verified. Any structural errors are reported before execution begins — the engine does not start a driver session for a workflow it cannot execute.

**2. Driver Session Initialization**
The engine opens a driver session based on `driverParameters`. Depending on context configuration, this may happen at the automation level (shared across all stages and jobs) or at a lower level when a stage or job is configured with its own isolated session.

**3. Stage Execution**
Stages execute sequentially, one after the other. Each stage completes before the next begins.

**4. Job Execution**
Within a stage, jobs execute sequentially by default. Jobs can be configured to run in parallel when they have no data dependency on each other and context isolation allows it. Each job runs its steps in order.

**5. Step Execution**
Steps within a job execute sequentially. Each step is dispatched to the driver, which operates on the surface and returns a result. The engine processes the result — applying ETL transforms, schema validation, or extraction rules — before advancing to the next step.

**6. In-Flight ETL**
Extraction steps apply transformation and validation rules as data is collected, not after the workflow completes. Records that fail validation are captured in the output alongside successful ones — the run does not abort on validation failure.

**7. Result Aggregation**
All extraction records, performance data, and error information are aggregated into the final response. In distributed mode, results from all worker sessions are merged before delivery.

**8. Session Cleanup**
Driver sessions are closed and resources released. The response is delivered to the caller.

---

## Concurrency

### Job-Level Parallelism

Jobs within a stage are sequential by default. This is the right default for most automation and RPA workflows, where jobs share driver context and must execute in a defined order.

When jobs are independent — they do not share context and have no data dependency on each other — they can be configured to run in parallel. Each parallel job manages its own session context within the stage.

### Worker-Level Parallelism

Distributed execution via G4 Services runs multiple independent copies of the same workflow simultaneously, each against its own input and driver session. This is the primary scaling mechanism for:

- High-volume crawling across many targets
- Parallel test execution across environments
- Processing large input datasets where each record drives its own workflow run

Workers are fully isolated. They do not share sessions, state, or data. The engine coordinates them at the result level — collecting and merging output after all workers complete or reach a checkpoint.

---

## Session Lifecycle

Session lifecycle is determined by the context configuration of each stage and job, as described in [Architecture](architecture.md) and [Drivers & Surfaces](drivers-and-surfaces.md).

In the most common case — a single stage with one or more jobs sharing the same session — the lifecycle is:

```none
Engine receives workflow
    ↓
Driver session opened (automation level)
    ↓
Stage 1 → Job 1 → Steps... (uses automation session)
          Job 2 → Steps... (uses automation session)
    ↓
Stage 2 → Job 1 → Steps... (uses automation session)
    ↓
Driver session closed
Response delivered
```

When a stage or job is configured with its own isolated session:

```
Engine receives workflow
    ↓
Stage 1 → opens its own driver session
          Job 1 → Steps... (uses Stage 1 session)
          Job 2 → opens its own isolated session
                  Steps...
                  Session closed after Job 2
          Job 3 → Steps... (back to Stage 1 session)
          Stage 1 session closed
    ↓
Stage 2 → opens its own driver session
          ...
```

The engine manages session open/close boundaries transparently. You declare the isolation level in the workflow — the engine handles the lifecycle.

---

## Failure Handling

By default, G4 fails silently and continues. When a step fails, the exception is captured and added to the `exceptions` array in the affected session's `responseData`, and execution proceeds to the next step. The session runs to completion regardless of how many failures occur along the way.

This default exists by design. In automation and crawling scenarios, partial failures are normal — a missing element, a transient network error, a page that didn't load as expected. Stopping the entire run on the first failure would make large-scale workflows impractical. Instead, G4 collects all failures and delivers them with the results for analysis after the run.

**If you want the session to stop on failure**, configure `engineSettings` on the automation (the parent of stages). This is covered in the Engine Settings reference. Stop-on-failure is an opt-in, not the default.

**Validation failures** follow the same pattern. A record that fails schema validation is captured in the output alongside its validation result — the run does not stop.

### Failure Context in the Response

Every exception carries the full reference chain — automation, stage, job, step, and driver session — making it possible to trace any failure back to its exact location in the workflow without re-running or guessing.

---

## Performance Timing

Every workflow run produces detailed timing data at every level of execution. All time values are in **.NET ticks** (100-nanosecond units).

### Automation-Level Timing

```json
{
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
	}
}
```

### Per-Step Timing

Each step in `responseData.performancePoints` carries its own timing breakdown:

```json
{
	"$type": "Plugin",
	"reference": {
		"alias": "RegisterParameter",
		"name": "RegisterParameter",
		"type": "Action",
		"jobReference": {
			"name": "Setup",
			"stageReference": {
				"name": "G4™ Default Stage"
			}
		}
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

This gives you step-level execution visibility across the full run — how long each action took, which session it ran on, and where it sits in the workflow hierarchy.

---

## Related

- [Architecture](architecture.md) — the layer model and session context design
- [Drivers & Surfaces](drivers-and-surfaces.md) — session configuration and driver lifecycle
- [ETL & Data Pipelines](etl-and-data-pipelines.md) — in-flight transformation and validation during execution
- [G4 Engine](../products/g4-engine.md) — engine product reference
