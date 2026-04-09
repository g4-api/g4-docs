# DELETE: Clear All Environments

This endpoint removes all environments and their associated parameters. Returns a 204 No Content response upon successful removal.

## Http Request

```none
DELETE /api/v4/g4/environments
```

## Response Body

```json
{
    "status": "success",
    "message": "All environments cleared"
}
```

## Status Codes

* `204 No Content`: All environments were successfully cleared.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/environments" -H "Content-Type: application/json"
```