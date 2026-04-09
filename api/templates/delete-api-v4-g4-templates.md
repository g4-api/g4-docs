# DELETE: Clear All Templates

This endpoint removes all templates from the cache. Returns a 204 No Content response upon successful removal.

## Http Request

```none
DELETE /api/v4/g4/templates
```

## Response Body

```json
{
    "status": "success",
    "message": "All templates cleared"
}
```

## Status Codes

* `204 No Content`: All templates were successfully cleared from the cache.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/templates" -H "Content-Type: application/json"
```