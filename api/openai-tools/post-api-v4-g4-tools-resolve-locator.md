# POST: Resolve a Locator Expression for a Given Driver Session and Intent

This endpoint uses the G4 engine to resolve a locator expression that can be used to identify DOM elements in the current active session. If the tool name is not available, the intent can be leveraged for semantic or vector-based lookup.

## Http Request

```none
POST /api/v4/g4/tools/resolve_locator
```

## Request Body

```json
{
    "driver_session": "session-id",
    "intent": "click on submit button",
    "token": "auth-token",
    "id": "chat-id"
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "locator": "#submit-button"
    }
}
```

## Status Codes

* `200 OK`: The locator expression was successfully resolved and returned in the response.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/tools/resolve_locator" -H "Content-Type: application/json" -d '{"driver_session":"session-id","intent":"click on submit button","token":"auth-token","id":"chat-id"}'
```