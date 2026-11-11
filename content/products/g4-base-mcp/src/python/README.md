# mcp-flask — Minimal MCP (Model Context Protocol) Flask Host

A minimal, production-ready Flask service that exposes an **MCP-compatible server** over HTTP.

It supports:

* **GET `/api/v1/mcp`** → SSE (text/event-stream)
* **POST `/api/v1/mcp`** → JSON-RPC (`initialize`, `tools/list`, `tools/call`)
* **GET `/api/v1/mcp/ping`** → Health check

This project is designed to be:

* Minimal
* Transparent
* Easy to extend
* Tool-first (definitions + repository pattern)
* Compatible with VS Code Agent Mode and n8n

---

# Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
   * [Run with Terminal](#run-with-terminal)
   * [Run with Docker](#run-with-docker)
3. [Architecture](#architecture)
4. [Endpoints](#endpoints)
5. [Configuration](#configuration)
6. [Adding a New Tool](#adding-a-new-tool)
7. [Using in VS Code (Agent Mode + mcp.json)](#using-in-vs-code-agent-mode--mcpjson)
8. [Using in n8n (Tools Node + Streamable HTTP)](#using-in-n8n-tools-node--streamable-http)
9. [Component Walkthrough](#component-walkthrough)
10. [Troubleshooting](#troubleshooting)

---

# Project Overview

This is a minimal MCP server implemented in Flask.

It:

1. Loads tool definitions from `definitions/*.json`
2. Reflects tool implementations from `ToolsRepository`
3. Exposes them through MCP JSON-RPC
4. Supports SSE for streaming-compatible clients

Tool definitions and implementations are strictly separated:

* JSON = schema + metadata
* Python method = execution logic

---

# Quick Start

## Run with Terminal

### Create `.env`

```env
APP_NAME=G4 Flask Service
APP_PORT=5000
APP_VERSION=1.0.0
SECRET_KEY=super-secret
```

### Create virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run

```bash
python app.py
```

### Verify

```bash
curl http://localhost:5000/api/v1/mcp/ping
```

Expected:

```
pong
```

---

## Run with Docker

Build:

```bash
docker build -f ./docker/app.Dockerfile -t mcp-flask .
```

Run:

```bash
docker run --rm -p 5000:5000 --env-file ./.env mcp-flask
```

Verify:

```bash
curl http://localhost:5000/api/v1/mcp/ping
```

---

# Architecture

High-level flow:

1. `app.py` boots Flask
2. `Domain` initializes:
   * `ToolsCacheManager`
   * `ToolsRepository`
3. `ToolsCacheManager.sync()` loads all `definitions/*.json`
4. `Domain` reflects all public methods from `ToolsRepository`
5. Incoming JSON-RPC calls are dispatched by method name

Tools are discovered automatically.

No manual registration required.

---

# Endpoints

Base route:

```
/api/v1/mcp
```

### GET `/api/v1/mcp`

* Returns SSE stream
* Used by streaming-compatible MCP clients

### POST `/api/v1/mcp`

Handles JSON-RPC:

* `initialize`
* `notifications/initialized`
* `tools/list`
* `tools/call`

### GET `/api/v1/mcp/ping`

Returns:

```
pong
```

---

# Configuration

Environment variables:

| Variable    | Description            |
| ----------- | ---------------------- |
| APP_NAME    | Service display name   |
| APP_PORT    | Port to bind           |
| APP_VERSION | Reported in initialize |
| SECRET_KEY  | Flask secret key       |

---

# Adding a New Tool

A tool consists of:

1. JSON definition in `definitions/`
2. Matching method in `ToolsRepository`

## Step 1 — Create definition

`definitions/say_hello.json`

```json
{
    "name": "say_hello",
    "description": "Greets a user by name.",
    "inputSchema": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string"
            }
        },
        "required": [
            "name"
        ]
    }
}
```

## Step 2 — Implement method

In `tools_repository.py`:

```python
def say_hello(self, **kwargs):
    name = (kwargs or {}).get("name", "world")
    return {"message": f"Hello, {name}!"}
```

### IMPORTANT RULE

The function name **must match** the `"name"` in the JSON definition.

Signature must always be:

```python
def tool_name(self, **kwargs) -> dict
```

Restart server after adding tools.

---

# Using in VS Code (Agent Mode + mcp.json)

## Create `.vscode/mcp.json`

Create:

```
.vscode/mcp.json
```

With:

```json
{
    "servers": {
        "my-mcp": {
            "type": "http",
            "url": "http://localhost:5000/api/v1/mcp",
            "headers": {
                "Accept": "application/json, text/event-stream"
            }
        }
    }
}
```

## Start the MCP server

```bash
python app.py
```

## Open the project in VS Code

Make sure `.vscode/mcp.json` is inside the workspace root.

Reload VS Code window if needed.

---

## Switch Copilot to Agent Mode (IMPORTANT)

To call tools from VS Code:

1. Open Copilot Chat
2. Switch mode from **Chat** to **Agent**
3. Ensure your MCP server appears in the server list
4. Open the **Tools list panel**
5. Confirm your tools are visible

If the tools do not appear:

* Reload window
* Restart server
* Verify ping endpoint works

---

## Call a Tool from VS Code

Once in Agent Mode:

1. Confirm the tool appears in the tools list
2. Prompt the agent using natural language, referencing the tool

Example:

```
Echo a joke using the echo tool.
```

Or more explicit:

```
Use the echo tool and return a funny programming joke.
```

The Agent will:

1. Choose the tool
2. Generate arguments
3. Call `tools/call`
4. Return structured result

---

# Using in n8n (Tools Node + Streamable HTTP)

## Start the MCP server

```bash
python app.py
```

## Create a workflow

Add:

* AI Agent node
* Tools node

## Add Tool Provider: Streamable HTTP

Configure:

| Setting  | Value                                                                |
| -------- | -------------------------------------------------------------------- |
| Base URL | [http://localhost:5000/api/v1/mcp](http://localhost:5000/api/v1/mcp) |
| Method   | POST                                                                 |
| Headers  | Content-Type: application/json                                       |
| Headers  | Accept: application/json, text/event-stream                          |

---

## JSON-RPC Shape

n8n Tools node will internally call:

### tools/list

```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list",
    "params": {}
}
```

### tools/call

```json
{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/call",
    "params": {
        "name": "tool_name",
        "arguments": {}
    }
}
```

---

## Testing Before Agent

Add an HTTP Request node:

POST → `/api/v1/mcp`

Body:

```json
{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list",
    "params": {}
}
```

If that works, your Tools node will work.

---

# Component Walkthrough

## app.py

* Creates Flask app
* Initializes Domain
* Registers routes
* Dispatches JSON-RPC
* Handles SSE

## app_settings.py

Loads:

* APP_NAME
* APP_PORT
* APP_VERSION
* SECRET_KEY

## cache_manager.py

* Loads JSON tool definitions
* Stores them in memory
* Exposes `get_tools()`

## domain.py

Core orchestration layer.

Responsibilities:

* Initialize cache
* Reflect repository methods
* Dispatch tool calls
* Wrap responses in MCP format

## tools_repository.py

Contains all tool implementations.

Rules:

* Public methods only
* Must match JSON definition names
* Always return dict
* Never raise — return error object instead

## definitions/*.json

Tool metadata.

Contains:

* name
* description
* inputSchema

---

# Troubleshooting

### Tools not visible in VS Code

* Ensure Agent Mode is enabled
* Reload window
* Restart server
* Check `/ping`

### Tool call fails

* Check method name matches definition
* Check arguments match inputSchema
* Ensure method returns dict

### n8n not connecting

* Verify Base URL
* Check port mapping (Docker)
* Confirm POST works manually
