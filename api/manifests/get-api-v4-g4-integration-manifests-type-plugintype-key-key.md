# GET: Retrieve Plugin Manifest by Plugin Type and Key

This endpoint fetches the plugin manifest identified by the specified plugin type and name key. Optionally includes specified fields in the response. Returns the manifest data in JSON format if found.

## Http Request

```none
GET /api/v4/g4/integration/manifests/type/{pluginType}/key/{key}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| pluginType | string | The type/category of the plugin identifying the manifest to retrieve. |
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
* `404 Not Found`: Plugin manifest not found for the provided plugin type and name.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/manifests/type/plugin-type/key/plugin-name" -H "Content-Type: application/json"
```