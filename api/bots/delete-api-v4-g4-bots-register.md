# DELETE: Batch Unregister Bots

This endpoint attempts to unregister each bot in the provided list of IDs. Returns the updated status for each bot—successfully removed, skipped due to active connection, or unreachable.

## Http Request

```none
DELETE /api/v4/g4/bots/register
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
            "status": "Removed"
        }
    ]
}
```

## Status Codes

* `200 OK`: Returns an array of bot models with their post-unregistration status.
* `400 Bad Request`: Request body was invalid (e.g., missing or malformed list of IDs).

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/bots/register" -H "Content-Type: application/json" -d '["bot-id-1","bot-id-2"]'
```