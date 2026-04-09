# GET: Stop a Running Automation Session

This endpoint stops the currently running automation session identified by the provided automationId. If the automation exists, a cancellation signal is sent and the session is terminated gracefully.

## Http Request

```none
GET /api/v4/g4/automation/stop/{automationId}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| automationId | string | The unique identifier of the automation session to stop. |

## Response Body

```json
{
    "status": "success",
    "message": "Automation stopped"
}
```

## Status Codes

* `200 OK`: Automation stopped successfully.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/automation/stop/12345" -H "Content-Type: application/json"
```