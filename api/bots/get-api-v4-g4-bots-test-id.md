# GET: Test Connectivity for a Specific Bot

This endpoint checks if the bot has an active SignalR connection or responds at its callback endpoint; updates and returns its model.

## Http Request

```none
GET /api/v4/g4/bots/test/{id}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The unique bot ID to test connectivity for. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "id": "bot-id",
        "status": "online"
    }
}
```

## Status Codes

* `200 OK`: Bot model returned with updated status (online or offline).
* `404 Not Found`: No bot found with the provided ID.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/bots/test/bot-id" -H "Content-Type: application/json"
```