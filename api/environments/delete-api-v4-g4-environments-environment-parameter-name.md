# DELETE: Delete a Parameter from the Specified Environment

This endpoint removes a parameter from the specified environment. If the parameter is found and successfully deleted, a 204 No Content response is returned. If the parameter is not found, a 404 Not Found response is returned.

## Http Request

```none
DELETE /api/v4/g4/environments/{environment}/parameter/{name}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| environment | string | The name of the environment from which the parameter will be deleted. |
| name | string | The name of the parameter to delete. |

## Response Body

```json
{
    "status": "success",
    "message": "Parameter deleted"
}
```

## Status Codes

* `204 No Content`: The parameter was successfully deleted from the environment.
* `404 Not Found`: The parameter was not found in the specified environment.

## cURL Example

```bash
curl -X DELETE "http://localhost:9944/api/v4/g4/environments/environment-name/parameter/param-name" -H "Content-Type: application/json"
```