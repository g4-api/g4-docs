# DELETE: Unregister a Single Bot

This endpoint unregisters the bot with the specified ID; on success updates its status to 'Removed' and returns the bot model.

## Http Request

```none
DELETE /api/v4/g4/bots/register/{id}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Unique identifier of the bot to unregister. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "id": "bot-id",
        "name": "bot-name",
        "status": "Removed"
    }
}
```

## Status Codes

* `200 OK`: Bot successfully unregistered; returns the updated bot model.
* `404 Not Found`: No bot found with the provided ID.
* `409 Conflict`: Bot has an active SignalR connection and cannot be unregistered until it disconnects.
* `502 Bad Gateway`: Bot unreachable at callback URI; entry has been removed from memory and database.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/bots/register/bot-id" -H "Content-Type: application/json"
```