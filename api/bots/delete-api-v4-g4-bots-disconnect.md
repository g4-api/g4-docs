# DELETE: Stop Monitors for Multiple Bots

This endpoint sends a StopBot command to each client identified by the provided connection IDs array.

## Http Request

```none
DELETE /api/v4/g4/bots/disconnect
```

## Request Body

```json
[
    "connection-id-1",
    "connection-id-2"
]
```

## Response Body

```json
{
    "status": "success",
    "message": "StopBot commands dispatched to specified bots"
}
```

## Status Codes

* `204 No Content`: StopBot commands successfully dispatched to the specified bots.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/bots/disconnect" -H "Content-Type: application/json" -d '["connection-id-1","connection-id-2"]'
```