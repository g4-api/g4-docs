# POST: Retrieve Plugin Manifests from External Repositories

This endpoint fetches plugin manifests from the specified external repositories. Optionally includes specific fields in the response based on the `expandFields` query parameter. Returns the manifest data in JSON format.

## Http Request

```none
POST /api/v4/g4/integration/manifests
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| expandFields | string | Comma-separated list of fields to include in the response. |

## Request Body

```json
[
    {
        "name": "repository-name",
        "url": "https://example.com/repository",
        "version": 1
    }
]
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "key": "plugin-name",
            "pluginType": "type"
        }
    ]
}
```

## Status Codes

* `200 OK`: Successfully retrieved the plugin manifests.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/integration/manifests" -H "Content-Type: application/json" -d '[{"name":"repository-name","url":"https://example.com/repository","version":1}]'
```