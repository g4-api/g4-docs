# Drivers & Surfaces

Drivers are the surface connectors in G4's architecture. They translate the engine's unified action vocabulary — navigate, click, extract, type, assert — into platform-specific operations on a target surface. The surface can be a browser, a mobile app, a desktop application, an HTTP API, a database, or anything else a driver can reach.

---

## The WebDriver Standard

G4 uses the **WebDriver protocol** as the interface between the engine and all drivers. This is the same protocol used by browser automation tools, extended by G4 to cover non-browser surfaces.

The WebDriver standard defines a command/response model: the engine sends commands, the driver executes them on the surface, and returns results. From the engine's perspective, all drivers are identical — it sends the same command structure regardless of what's on the other side.

This has two important consequences:

1. **Workflows are surface-agnostic.** The same action vocabulary works across all drivers. A `Click` step doesn't care whether it's clicking a browser button or a native UI control — the driver handles the translation.
2. **Drivers are replaceable.** You can swap one driver for another without changing your workflow. You can also write your own driver for any surface by implementing the WebDriver protocol.

---

## Driver Configuration

Drivers are configured per automation via the `driverParameters` object. The two G4-specific fields are `driver` and `driverBinaries`:

| Field | Description |
|---|---|
| `driver` | The driver key from the server manifest. See [Discovering Available Drivers](#discovering-available-drivers). |
| `driverBinaries` | Path to a local driver binary, or the remote address of a running driver service. Both local and remote targets use the same field. |

```json
{
  "driverParameters": {
    "driver": "DriverName",
    "driverBinaries": "/path/to/driver  or  http://remote-host:4444"
  }
}
```

The value of `driver` must match the `key` field from the server manifest (see [Discovering Available Drivers](#discovering-available-drivers) below). Which drivers are available depends on what is installed in your environment — G4 does not ship with a fixed driver set.

### Capabilities — WebDriver New Session Structure

G4 passes capabilities to the driver using the standard **WebDriver W3C new session** structure — `alwaysMatch` and `firstMatch` — without any deviation. This is the same structure the WebDriver spec defines for the `POST /session` request.

```json
{
  "driverParameters": {
    "driver": "DriverName",
    "driverBinaries": "/path/to/driver",
    "capabilities": {
      "alwaysMatch": {
        "browserName": "chrome"
      },
      "firstMatch": [
        {}
      ]
    }
  }
}
```

Driver-specific options go under their designated vendor extension key, following each driver's own convention. For example:

```json
{
  "driverParameters": {
    "driver": "DriverName",
    "driverBinaries": "/path/to/driver",
    "capabilities": {
      "alwaysMatch": {
        "browserName": "chrome",
        "goog:chromeOptions": {
          "args": ["--headless", "--disable-gpu", "--no-sandbox"]
        }
      },
      "firstMatch": [
        {}
      ]
    }
  }
}
```

The vendor prefix (e.g., `goog:`, `moz:`, `appium:`) is defined by the driver, not by G4. Refer to the documentation of the specific driver for its supported capability keys and vendor namespace.

---

## Discovering Available Drivers

To see which drivers are registered on a running G4 server, call the driver manifest endpoint:

```
GET <serverUrl>/api/v4/g4/integration/manifests/drivers
```

The response returns an array of driver manifest entries. Each entry describes one registered driver. The `key` field is the value you use in `driverParameters.driver`:

```json
[
  {
    "key": "ChromeDriver",
    "name": "Chrome Driver",
    "description": "...",
    ...
  },
  {
    "key": "AppiumDriver",
    "name": "Appium Driver",
    "description": "...",
    ...
  }
]
```

Use the `key` value — not the `name` — in your configuration:

```json
{
  "driverParameters": {
    "driver": "ChromeDriver"
  }
}
```

This endpoint reflects the actual state of the server at the time of the call. If a new driver is installed and the server restarted, it will appear here automatically.

---

## Session Lifecycle

A driver session represents an active connection to a surface — an open browser, a running app, an authenticated API client. The engine manages session lifecycle based on the workflow's context configuration.

Sessions follow the Stage → Job hierarchy described in [Architecture](architecture.md):

- **A job can open its own session** — isolated from its stage and siblings
- **A job can inherit the stage's session** — continuing from the same driver context
- **A stage can open its own session** — isolated from other stages
- **A stage can inherit the flow's session** — sharing context across the automation

By default, sessions are created at the automation level and shared downward. You configure isolation explicitly when a job or stage needs its own independent surface.

### Why this matters

Context inheritance is what makes multi-step workflows coherent. When a job navigates to a page, the next job in the same stage sees that page — because they share a session. When you need a job to start fresh (a clean browser, an unauthenticated session), you give it its own session.

This also enables cross-surface workflows: one stage operates a browser, another stage calls an HTTP API, a third writes to a database — each with its own driver and session, but all coordinated by the same engine run.

---

## Custom Drivers

You can implement a driver for any surface G4 does not cover by default. A custom driver:

- Implements the WebDriver protocol server interface
- Registers with G4 under a name you define
- Receives the same action dispatch as any other driver

Once registered, your driver appears as a first-class option in `driverParameters`. Workflows that use your driver are structured identically to any other workflow.

This is how G4 can reach proprietary protocols, embedded interfaces, legacy systems, or specialized hardware — if you can accept WebDriver commands and translate them into surface operations, G4 can automate it.

---

## Driver Responsibilities vs Engine Responsibilities

Understanding the boundary between driver and engine is important when debugging or building custom drivers.

| Concern | Driver | Engine |
|---|---|---|
| Surface connection | ✓ Opens and maintains the connection | — |
| Command translation | ✓ Translates WebDriver commands to surface calls | — |
| Action vocabulary | — | ✓ Defines what commands to send |
| Session lifecycle | — | ✓ Decides when to open, reuse, or close |
| ETL / data processing | — | ✓ Processes data returned by the driver |
| Retry / failure logic | — | ✓ Decides whether and how to retry |
| Workflow interpretation | — | ✓ Interprets what the workflow requires |

The driver does not know what the workflow is doing. The engine does not know how the driver operates its surface. This separation is what keeps both sides independently replaceable.

---

## Related

- [Architecture](architecture.md) — the full layer model and session context design
- [Execution Model](execution-model.md) — how the engine manages sessions across workers
- [Workflows & Plugins](workflows-and-plugins.md) — how to reference drivers in workflow definitions
- [G4 Plugins](../products/g4-plugins.md) — building custom drivers and plugins
