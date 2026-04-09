# POST: Register a New Bot

This endpoint adds a new bot to the domain. If no ID is provided, one will be generated. Returns the registered bot model.

## Http Request

```none
POST /api/v4/g4/bots/register
```

## Request Body

```json
{
    "callbackUri": "http://localhost:9000",
    "id": "bot-id",
    "machine": "machine-name",
    "name": "bot-name",
    "osVersion": "Windows 11",
    "type": "Chrome"
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "id": "bot-id",
        "name": "bot-name",
        "status": "online"
    }
}
```

## Status Codes

* `200 OK`: Bot successfully registered.
* `400 Bad Request`: Invalid registration payload.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/bots/register" -H "Content-Type: application/json" -d '{"callbackUri":"http://localhost:9000","id":"bot-id","machine":"machine-name","name":"bot-name","osVersion":"Windows 11","type":"Chrome"}'
```