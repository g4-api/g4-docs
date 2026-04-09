# DELETE: Stop Monitor for a Specific Bot

This endpoint sends a StopBot command to the connected client identified by the given connection ID.

## Http Request

```none
DELETE /api/v4/g4/bots/disconnect/{connection}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| connection | string | The SignalR connection ID of the bot monitor instance to stop. |

## Response Body

```json
{
    "status": "success",
    "message": "StopBot command dispatched"
}
```

## Status Codes

* `204 No Content`: StopBot command successfully dispatched to the specified bot.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/bots/disconnect/connection-id" -H "Content-Type: application/json"
```