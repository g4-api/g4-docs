# GET: Retrieve the Current Plugin Cache

This endpoint fetches the cached data for plugins, stored in a dictionary format. The cache includes plugin information keyed by plugin type and name, and is returned in JSON format.

## Http Request

```none
GET /api/v4/g4/integration/cache
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "pluginType": {
            "pluginName": {
                "manifest": { },
                "document": "markdown content"
            }
        }
    }
}
```

## Status Codes

* `200 OK`: Successfully retrieved the plugin cache.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/cache" -H "Content-Type: application/json"
```