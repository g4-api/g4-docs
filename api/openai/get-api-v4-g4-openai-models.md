# GET: List Available Models

This endpoint returns all available models from the OpenAI-compatible backend, prefixed with `g4-` for internal use.

## Http Request

```none
GET /api/v4/g4/openai/models
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "id": "gpt-4",
            "created": 1234567890,
            "object": "model",
            "ownedBy": "openai"
        }
    ]
}
```

## Status Codes

* `200 OK`: Successfully retrieved list of available models.
* `500 Internal Server Error`: Bad request or error occurred while fetching the models.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/openai/models" -H "Content-Type: application/json"
```