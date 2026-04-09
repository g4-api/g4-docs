# GET: Retrieve Details of an Environment by Name

This endpoint fetches detailed information of a specified environment by name. If the environment exists, the details are returned in JSON format.

## Http Request

```none
GET /api/v4/g4/environments/{name}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | The name of the environment to retrieve. |

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| decode | boolean | false | Specifies whether the parameters values should be Base64-decoded before being returned. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "param1": "value1",
        "param2": "value2"
    }
}
```

## Status Codes

* `200 OK`: Environment found and returned successfully.
* `404 Not Found`: Environment not found with the specified name.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/environments/environment-name" -H "Content-Type: application/json"
```