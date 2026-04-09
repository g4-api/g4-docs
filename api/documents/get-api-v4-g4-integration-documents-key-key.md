# GET: Retrieve Plugin Markdown Documentation by Key

This endpoint fetches the plugin Markdown documentation identified by the specified plugin name key. Returns the documentation content in Markdown format if found.

## Http Request

```none
GET /api/v4/g4/integration/documents/key/{key}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | The name of the plugin identifying the Markdown documentation to retrieve. |

## Response Body

```markdown
# Plugin Documentation

This is the markdown documentation for the plugin.
```

## Status Codes

* `200 OK`: Successfully retrieved the plugin Markdown documentation.
* `404 Not Found`: Plugin Markdown documentation not found for the provided plugin name.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/documents/key/plugin-name" -H "Content-Type: application/json"
```