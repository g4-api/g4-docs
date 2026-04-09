# GET: Retrieve a Parameter from the Specified Environment

This endpoint fetches the value of a parameter from the specified environment. The value can optionally be Base64-decoded before being returned.

## Http Request

```none
GET /api/v4/g4/environments/{environment}/parameter/{name}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| environment | string | The name of the environment where the parameter is located. |
| name | string | The name of the parameter to retrieve. |

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| decode | boolean | false | Specifies whether the parameter value should be Base64-decoded before being returned. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "parameter": {
            "param-name": "param-value"
        }
    }
}
```

## Status Codes

* `200 OK`: The parameter was found and its value is returned as plain text.
* `404 Not Found`: The parameter was not found in the specified environment.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/environments/environment-name/parameter/param-name" -H "Content-Type: application/json"
```