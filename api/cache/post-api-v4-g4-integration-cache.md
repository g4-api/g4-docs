# POST: Retrieve the Plugin Cache from External Repositories

This endpoint fetches the cached plugin data from the specified external repositories, returning the data in a dictionary format. The cache is stored in JSON format and is client-cached for 60 seconds.

## Http Request

```none
POST /api/v4/g4/integration/cache
```

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
    "data": {
        "pluginType": {
            "pluginName": {
                "manifest": { }
            }
        }
    }
}
```

## Status Codes

* `200 OK`: Successfully retrieved the plugin cache from the specified repositories.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/integration/cache" -H "Content-Type: application/json" -d '[{"name":"repository-name","url":"https://example.com/repository","version":1}]'
```