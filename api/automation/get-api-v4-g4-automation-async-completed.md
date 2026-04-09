# GET: Retrieve Completed Automation Responses

This endpoint fetches the collection of automation responses that have been completed. The responses are managed by the AutomationAsync client.

## Http Request

```none
GET /api/v4/g4/automation/async/completed
```

This endpoint retrieves all completed automation responses from the async client.

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "automationId": "12345",
            "status": "completed",
            "result": { }
        }
    ]
}
```

## Status Codes

* `200 OK`: Request was successful and completed responses are returned.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/automation/async/completed" -H "Content-Type: application/json"
```