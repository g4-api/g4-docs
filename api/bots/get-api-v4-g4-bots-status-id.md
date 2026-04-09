# GET: Get the Status of a Specific Bot

This endpoint retrieves runtime details for a single bot identified by the given Id.

## Http Request

```none
GET /api/v4/g4/bots/status/{id}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The unique identifier of the bot to retrieve. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "id": "bot-id",
        "name": "bot-name",
        "status": "online"
    }
}
```

## Status Codes

* `200 OK`: The ConnectedBotModel instance for the requested Id.
* `404 Not Found`: No bot found with the provided Id.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/bots/status/bot-id" -H "Content-Type: application/json"
```