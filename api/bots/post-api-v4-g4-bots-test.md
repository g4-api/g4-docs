# POST: Test Connectivity for Specific Bots

This endpoint checks the connection status of each bot with the given IDs and returns their updated models.

## Http Request

```none
POST /api/v4/g4/bots/test
```

## Request Body

```json
[
    "bot-id-1",
    "bot-id-2"
]
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "id": "bot-id-1",
            "status": "online"
        }
    ]
}
```

## Status Codes

* `200 OK`: A list of bot models with their latest connectivity status.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/bots/test" -H "Content-Type: application/json" -d '["bot-id-1","bot-id-2"]'
```