# DELETE: Batch Unregister All Disconnected Bots

This endpoint attempts to unregister every bot that has no active SignalR connection; returns each bot's final status.

## Http Request

```none
DELETE /api/v4/g4/bots/register/all
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "id": "bot-id-1",
            "status": "Removed"
        }
    ]
}
```

## Status Codes

* `200 OK`: An array of bot models with updated post-unregistration statuses.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/bots/register/all" -H "Content-Type: application/json"
```