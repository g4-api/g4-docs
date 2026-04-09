# DELETE: Delete an Environment by Name

This endpoint removes the specified environment by name. If the environment is successfully deleted, a 204 No Content response is returned. If the environment is not found, a 404 Not Found response is returned.

## Http Request

```none
DELETE /api/v4/g4/environments/{name}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | The name of the environment to be removed. |

## Response Body

```json
{
    "status": "success",
    "message": "Environment deleted"
}
```

## Status Codes

* `204 No Content`: The environment was successfully deleted.
* `404 Not Found`: Environment not found with the specified name.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/environments/environment-name" -H "Content-Type: application/json"
```