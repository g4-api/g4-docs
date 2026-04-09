# GET: Get All Credentials

This endpoint returns all saved credential records from the in-memory cache (not from the underlying persistent store).

## Http Request

```none
GET /api/v4/g4/integration/cache/credentials
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "id": "credential-id",
            "name": "credential-name"
        }
    ]
}
```

## Status Codes

* `200 OK`: Credentials returned successfully.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/cache/credentials" -H "Content-Type: application/json"
```