# GET: Get a Credential by ID or Name

This endpoint returns a single credential record from the in-memory cache (not from the underlying persistent store) matching the provided id or name.

## Http Request

```none
GET /api/v4/g4/integration/cache/credentials/{idOrName}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| idOrName | string | Credential id or credential name. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "id": "credential-id",
        "name": "credential-name"
    }
}
```

## Status Codes

* `200 OK`: Credential returned successfully.
* `404 Not Found`: Credential was not found.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/cache/credentials/credential-id" -H "Content-Type: application/json"
```