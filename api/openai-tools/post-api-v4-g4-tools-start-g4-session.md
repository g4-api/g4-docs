# POST: Start a New G4 Driver Session

This endpoint creates a new driver session using the G4 engine. Requires driver name, driver binaries, and an authorization token. Optional session capabilities can be provided via AlwaysMatch or FirstMatch.

## Http Request

```none
POST /api/v4/g4/tools/start_g4_session
```

## Request Body

```json
{
    "driver": "Chrome",
    "driver_binaries": "/path/to/driver",
    "token": "auth-token",
    "always_match": {
        "browserName": "chrome"
    }
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "session_id": "session-id",
        "driver": "Chrome"
    }
}
```

## Status Codes

* `200 OK`: The driver session was started successfully. The response contains details of the newly created session.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/tools/start_g4_session" -H "Content-Type: application/json" -d '{"driver":"Chrome","driver_binaries":"/path/to/driver","token":"auth-token"}'
```