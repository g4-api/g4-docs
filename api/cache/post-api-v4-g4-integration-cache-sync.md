# POST: Synchronize the Plugin Cache with External Repositories and MCP Servers

This endpoint triggers plugin cache synchronization using the provided external repositories and Model Context Protocol (MCP) servers. This operation refreshes the cache so it reflects the latest plugin metadata available from the supplied sources.

## Http Request

```none
POST /api/v4/g4/integration/cache/sync
```

## Request Body

```json
{
    "repositories": [
        {
            "name": "repository-name",
            "url": "https://example.com/repository",
            "version": 1
        }
    ],
    "servers": {
        "server-name": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"],
            "type": "stdio"
        }
    }
}
```

## Response Body

```json
{
    "status": "success",
    "message": "Cache synchronized"
}
```

## Status Codes

* `204 No Content`: Successfully synchronized the plugin cache from the provided external repositories and MCP servers. No content is returned.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/integration/cache/sync" -H "Content-Type: application/json" -d '{"repositories":[{"name":"repository-name","url":"https://example.com/repository","version":1}],"servers":{"server-name":{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem","/path/to/directory"],"type":"stdio"}}}'
```