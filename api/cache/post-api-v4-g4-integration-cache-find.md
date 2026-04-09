# POST: Find MCP Tools by Intent

This endpoint searches for MCP tools matching the provided intent string. Allows specifying the maximum number of results and relevance threshold.

## Http Request

```none
POST /api/v4/g4/integration/cache/find
```

## Request Body

```json
{
    "intent": "search for files",
    "maxResults": 10,
    "threshold": 80
}
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "name": "tool-name",
            "description": "tool description"
        }
    ]
}
```

## Status Codes

* `200 OK`: Successfully retrieved matching tools.
* `400 Bad Request`: Invalid request payload.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/integration/cache/find" -H "Content-Type: application/json" -d '{"intent":"search for files","maxResults":10,"threshold":80}'
```