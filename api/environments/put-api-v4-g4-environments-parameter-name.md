# PUT: Create or Update a System Parameter

This endpoint creates a new parameter or updates an existing one under the default environment 'SystemParameters'. Optionally encodes the value in Base64 before storing.

## Http Request

```none
PUT /api/v4/g4/environments/parameter/{name}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | The name of the parameter to be created or updated in 'SystemParameters'. |

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| encode | boolean | true | Specifies whether the value should be encoded to Base64 before being stored. |

## Request Body

```text
parameter-value
```

## Response Body

```json
{
    "status": "success",
    "message": "Parameter created or updated",
    "parameter": {
        "param-name": "param-value"
    }
}
```

## Status Codes

* `200 OK`: Parameter successfully updated in 'SystemParameters'. Returns the updated parameter.
* `201 Created`: Parameter successfully created in 'SystemParameters'. Returns the newly created parameter.
* `400 Bad Request`: Invalid request. The parameter name does not conform to the required format or other validation errors occurred.

## cURL Example

```bash
curl -X PUT "http://localhost:9944/api/v4/g4/environments/parameter/param-name" -H "Content-Type: text/plain" -d 'parameter-value'
```