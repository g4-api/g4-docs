# POST: Invoke an Automation Session Using Base64 Input

This endpoint decodes a Base64-encoded automation model, deserializes it into a G4AutomationModel, and triggers the invocation of an automation session. The result includes detailed information about the run, returned in JSON format.

## Http Request

```none
POST /api/v4/g4/automation/base64/invoke
```

## Request Body

```json
{
    "base64Data": "eyJkcml2ZXJQYXJhbWV0ZXJzIjp7fSwic3RhZ2VzIjpbXX0="
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "sessions": {
            "session1": {
                "responseData": { }
            }
        }
    }
}
```

## Status Codes

* `200 OK`: Successfully invoked the automation session using Base64 input.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/automation/base64/invoke" -H "Content-Type: application/json" -d '{"base64Data":"eyJkcml2ZXJQYXJhbWV0ZXJzIjp7fSwic3RhZ2VzIjpbXX0="}'
```