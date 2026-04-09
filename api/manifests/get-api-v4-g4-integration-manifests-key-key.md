# GET: Retrieve the Plugin Manifest by Key

This endpoint fetches the plugin manifest, including optional Markdown documentation, identified by the specified plugin name key. Optionally includes specified fields in the response. Returns the manifest content in JSON format if found.

## Http Request

```none
GET /api/v4/g4/integration/manifests/key/{key}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | The name of the plugin identifying the manifest to retrieve. |

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| expandFields | string | Comma-separated list of fields to include in the response. |

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
* `404 Not Found`: Plugin manifest not found for the provided plugin name.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/manifests/key/plugin-name" -H "Content-Type: application/json"
```