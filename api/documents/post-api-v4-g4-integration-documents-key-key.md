# POST: Retrieve Plugin Markdown Documentation by Key and Repository

This endpoint fetches the plugin Markdown documentation identified by the specified plugin name key and external repository information. Returns the documentation content in Markdown format if found.

## Http Request

```none
POST /api/v4/g4/integration/documents/key/{key}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | The name of the plugin identifying the Markdown documentation to retrieve. |

## Request Body

```json
{
    "name": "repository-name",
    "url": "https://example.com/repository",
    "version": 1
}
```

## Response Body

```markdown
# Plugin Documentation

This is the markdown documentation for the plugin.
```

## Status Codes

* `200 OK`: Successfully retrieved the plugin Markdown documentation.
* `404 Not Found`: Plugin Markdown documentation not found for the provided plugin name and repository.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/integration/documents/key/plugin-name" -H "Content-Type: application/json" -d '{"name":"repository-name","url":"https://example.com/repository","version":1}'
```