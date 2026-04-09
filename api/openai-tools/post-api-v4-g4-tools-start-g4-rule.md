# POST: Start Execution of a Rule in an Active Driver Session

This endpoint uses the G4 engine to execute a rule within the specified driver session. Requires the session identifier, a rule definition, and an authorization token.

## Http Request

```none
POST /api/v4/g4/tools/start_g4_rule
```

## Request Body

```json
{
    "driver_session": "session-id",
    "rule": "rule-definition",
    "token": "auth-token"
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "result": "rule execution result"
    }
}
```

## Status Codes

* `200 OK`: The rule was executed successfully. The response contains the result of the rule execution.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/tools/start_g4_rule" -H "Content-Type: application/json" -d '{"driver_session":"session-id","rule":"rule-definition","token":"auth-token"}'
```