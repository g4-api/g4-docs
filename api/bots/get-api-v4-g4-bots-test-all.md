# GET: Test Connectivity for All Bots

This endpoint checks connectivity for every registered bot and returns the updated bot models with their current status.

## Http Request

```none
GET /api/v4/g4/bots/test/all
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "id": "bot-id",
            "status": "online"
        }
    ]
}
```

## Status Codes

* `200 OK`: A list of all bots with their latest connectivity status.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/bots/test/all" -H "Content-Type: application/json"
```