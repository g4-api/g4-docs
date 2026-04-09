# GET: Get the Status of All Connected Bots

This endpoint retrieves a list of bots currently connected to the system, including their metadata and connection status.

## Http Request

```none
GET /api/v4/g4/bots/status
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "id": "bot-id",
            "name": "bot-name",
            "status": "online",
            "callbackUri": "http://localhost:9000"
        }
    ]
}
```

## Status Codes

* `200 OK`: A list of all currently connected bots with their runtime details.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/bots/status" -H "Content-Type: application/json"
```