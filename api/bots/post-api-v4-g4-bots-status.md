# POST: Get Status for Multiple Bots

This endpoint retrieves runtime details for each bot specified in the request body.

## Http Request

```none
POST /api/v4/g4/bots/status
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

* `200 OK`: An array of ConnectedBotModel instances for each valid Id.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/bots/status" -H "Content-Type: application/json" -d '["bot-id-1","bot-id-2"]'
```