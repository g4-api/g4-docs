# DELETE: Stop Monitors for All Bots

This endpoint broadcasts a StopBot command to every connected client.

## Http Request

```none
DELETE /api/v4/g4/bots/disconnect/all
```

## Response Body

```json
{
    "status": "success",
    "message": "StopBot commands dispatched to all bots"
}
```

## Status Codes

* `204 No Content`: StopBot commands successfully dispatched to all connected bots.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/bots/disconnect/all" -H "Content-Type: application/json"
```