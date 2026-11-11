# G4 MCP Server Implementations

A multi-language implementation of a minimal, extensible **Model Context Protocol (MCP)** server.

This repository contains multiple implementations of the same MCP architecture in different languages.
Each implementation follows the same design principles:

* JSON-RPC based MCP protocol
* Tool definitions separated from execution logic
* Reflection-based tool discovery
* SSE-compatible streaming endpoint
* Designed for VS Code Agent Mode and automation platforms like n8n

---

# Table of Contents

* [Overview](#overview)
* [Architecture Philosophy](#architecture-philosophy)
* [Available Implementations](#available-implementations)
  * [Python (Flask)](#python-flask)
* [MCP Capabilities](#mcp-capabilities)
* [When to Use Each Implementation](#when-to-use-each-implementation)
* [Folder Structure](#folder-structure)
* [Contribution Guidelines](#contribution-guidelines)
* [Roadmap](#roadmap)

---

# Overview

This repository provides reference implementations of an MCP (Model Context Protocol) server.

MCP enables:

* LLM tool calling
* Agent-based execution
* Structured tool schemas
* Tool discovery
* Streaming-capable transport

Each language implementation exposes:

* `initialize`
* `tools/list`
* `tools/call`
* SSE endpoint (optional but recommended)

All implementations follow the same tool design rules:

1. Tool metadata defined in JSON (or schema file)
2. Tool logic implemented as a function/method
3. Tool name must match definition name
4. All tools return structured JSON objects

---

# Architecture Philosophy

The architecture is intentionally:

* Minimal
* Explicit
* Reflection-based
* Stateless
* Easy to extend
* Agent-first

Core layers:

```
Definitions  →  Cache  →  Domain  →  Repository  →  Transport
```

Where:

* **Definitions** = JSON schemas describing tools
* **Cache** = In-memory storage of tool metadata
* **Domain** = Dispatcher and orchestrator
* **Repository** = Tool implementations
* **Transport** = HTTP + JSON-RPC + SSE

---

# Available Implementations

## Python (Flask)

Location:

```
src/python/
```

Full documentation:

👉 **[Python Implementation README](src/python/README.md)**

Features:

* Flask-based MCP server
* SSE endpoint
* JSON-RPC POST endpoint
* Reflection-based tool loading
* Docker-ready
* IDE (VSCode, PyCharm, Visual Studio, etc.) Agent compatible
* n8n Streamable HTTP compatible

---

# MCP Capabilities

All implementations aim to support:

| Capability            | Description                  |
| --------------------- | ---------------------------- |
| JSON-RPC              | Standard MCP method dispatch |
| Tool Discovery        | `tools/list`                 |
| Tool Execution        | `tools/call`                 |
| Structured Output     | `structuredContent` support  |
| Streaming             | SSE endpoint                 |
| Agent Mode Compatible | VS Code Agent                |
| Automation Compatible | n8n Tools Node               |

---

# When to Use Each Implementation

### Python (Flask)

Best for:

* Rapid prototyping
* Lightweight deployments
* Educational reference
* Docker-based environments
* Edge deployments
* Quick MCP testing

---

# Folder Structure

From repository root:

```
/README.md
/src
   /python
      README.md
      app.py
      domain.py
      cache_manager.py
      tools_repository.py
      definitions/
```

Each language implementation lives under `src/<language>/`.

---

# Contribution Guidelines

If adding a new language implementation:

1. Follow the same MCP method contract
2. Keep tool definition separation
3. Support JSON-RPC POST
4. Optionally support SSE
5. Include a `README.md` inside the language folder
6. Add a link to it in this root README

---

# Roadmap

Planned future implementations:

* .NET
* Node.js
* FastAPI
* Go
* Rust
* Cloud-native Kubernetes-ready variant

---

# Design Goal

This repository is intended to serve as:

* A reference MCP architecture
* A clean starting point for agent-enabled systems
* A minimal, understandable tool-first MCP server
* A foundation for enterprise-grade automation
