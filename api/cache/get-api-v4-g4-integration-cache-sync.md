# GET: Synchronize the Internal Plugin Cache

This endpoint triggers the synchronization of the internal plugin cache, updating cached data from internal resources and connected libraries within the G4 engine integration. This operation ensures that the internal cache is aligned with the latest data from internal sources, excluding external repositories.

## Http Request

```none
GET /api/v4/g4/integration/cache/sync
```

## Response Body

```json
{
    "status": "success",
    "message": "Cache synchronized"
}
```

## Status Codes

* `204 No Content`: Successfully synchronized the internal plugin cache. No content is returned.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/cache/sync" -H "Content-Type: application/json"
```