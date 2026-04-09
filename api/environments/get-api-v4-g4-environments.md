# GET: Retrieve All Environments with Global Parameters

This endpoint fetches a list of environments, where each environment contains a collection of key-value pairs representing global configuration parameters.

## Http Request

```none
GET /api/v4/g4/environments
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "environment1": {
            "param1": "value1",
            "param2": "value2"
        },
        "environment2": {
            "param1": "value1"
        }
    }
}
```

## Status Codes

* `200 OK`: A dictionary where each environment is mapped to its corresponding global configuration parameters.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/environments" -H "Content-Type: application/json"
```