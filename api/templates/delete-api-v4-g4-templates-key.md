# DELETE: Remove a Template by Key

This endpoint removes the specified template identified by its key from the cache. If the template is successfully removed, a 204 No Content response is returned. If the template is not found, a 404 Not Found response is returned with an error message.

## Http Request

```none
DELETE /api/v4/g4/templates/{key}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | The key of the template to be removed. |

## Response Body

```json
{
    "status": "success",
    "message": "Template removed"
}
```

## Status Codes

* `204 No Content`: The template was successfully removed from the cache.
* `404 Not Found`: Template not found with the specified key.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/templates/template-key" -H "Content-Type: application/json"
```