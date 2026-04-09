# GET: Retrieve All Plugin Manifests

This endpoint fetches all available plugin manifests, optionally filtering the response based on the fields provided in the `expandFields` query parameter. Returns the manifest data in JSON format.

## Http Request

```none
GET /api/v4/g4/integration/manifests
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| expandFields | string | Comma-separated list of fields to include in the response. |

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

* `200 OK`: Successfully retrieved the list of plugin manifests.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/manifests" -H "Content-Type: application/json"
```