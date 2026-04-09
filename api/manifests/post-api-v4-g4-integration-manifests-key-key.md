# POST: Retrieve Plugin Manifest by Key and Repository

This endpoint fetches the plugin manifest identified by the specified plugin name key and external repository information. Optionally includes specified fields in the response. Returns the manifest data in JSON format if found.

## Http Request

```none
POST /api/v4/g4/integration/manifests/key/{key}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | The name of the plugin identifying the manifest to retrieve. |

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| expandFields | string | Comma-separated list of fields to include in the response. |

## Request Body

```json
{
    "name": "repository-name",
    "url": "https://example.com/repository",
    "version": 1
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "key": "plugin-name",
        "pluginType": "type",
        "parameters": [ ],
        "rules": [ ]
    }
}
```

## Status Codes

* `200 OK`: Successfully retrieved the plugin manifest.
* `404 Not Found`: Plugin manifest not found for the provided plugin name and repository.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/integration/manifests/key/plugin-name" -H "Content-Type: application/json" -d '{"name":"repository-name","url":"https://example.com/repository","version":1}'
```