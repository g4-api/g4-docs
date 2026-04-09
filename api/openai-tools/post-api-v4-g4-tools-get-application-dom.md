# POST: Retrieve the Document Model (DOM) of the Current Active Session

This endpoint uses the G4 engine to extract the DOM of the specified driver session. Authorization is performed using the provided token.

## Http Request

```none
POST /api/v4/g4/tools/get_application_dom
```

## Request Body

```json
{
    "driver_session": "session-id",
    "token": "auth-token",
    "id": "chat-id"
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "dom": {
            "elements": [ ]
        }
    }
}
```

## Status Codes

* `200 OK`: The document model (DOM) was retrieved successfully. The result contains a dictionary representation of the application DOM.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/tools/get_application_dom" -H "Content-Type: application/json" -d '{"driver_session":"session-id","token":"auth-token","id":"chat-id"}'
```