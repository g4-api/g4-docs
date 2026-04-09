# PUT: Create or Update a Parameter in the Specified Environment

This endpoint creates a new parameter or updates an existing one in the specified environment. If the parameter doesn't exist, it will be created. The value can optionally be Base64-encoded before storage.

## Http Request

```none
PUT /api/v4/g4/environments/{environment}/parameter/{name}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| environment | string | The name of the environment where the parameter will be set or updated. |
| name | string | The name of the parameter to be created or updated. |

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| encode | boolean | true | Specifies whether the value should be Base64-encoded before being stored. |

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

* `200 OK`: Parameter existed and was successfully updated.
* `201 Created`: Parameter did not exist and was successfully created.
* `400 Bad Request`: Invalid request. The parameter name or environment does not conform to the required format.

## cURL Example

```bash
curl -X PUT "http://localhost:9944/api/v4/g4/environments/environment-name/parameter/param-name" -H "Content-Type: text/plain" -d 'parameter-value'
```