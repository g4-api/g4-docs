# PUT: Update Bot Metadata and Status

This endpoint applies the provided metadata and status to the bot identified by the given ID. Returns the updated bot model.

## Http Request

```none
PUT /api/v4/g4/bots/register/{id}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Unique identifier of the bot to update. |

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

* `200 OK`: Bot successfully updated; returns the updated bot model.
* `400 Bad Request`: Request payload is missing required parameters or is invalid.
* `404 Not Found`: No bot found with the provided ID.

## cURL Example

```bash
curl -X PUT "http://localhost:9944/api/v4/g4/bots/register/bot-id" -H "Content-Type: application/json" -d '{"callbackUri":"http://localhost:9000","id":"bot-id","machine":"machine-name","name":"bot-name","osVersion":"Windows 11","type":"Chrome"}'
```