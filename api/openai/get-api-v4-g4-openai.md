# GET: Check Proxy Health Status

This endpoint returns a basic status object indicating that the OpenAI proxy is online.

## Http Request

```none
GET /api/v4/g4/openai
```

## Response Body

```json
{
    "status": "success",
    "message": "OpenAI proxy is online"
}
```

## Status Codes

* `200 OK`: The service is operational.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/openai" -H "Content-Type: application/json"
```