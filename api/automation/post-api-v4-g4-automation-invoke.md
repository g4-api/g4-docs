# POST: Invoke an Automation Session

This endpoint triggers the invocation of an automation session based on the provided automation model. The result includes detailed information about the entire automation run, returned in JSON format.

## Http Request

```none
POST /api/v4/g4/automation/invoke
```

## Request Body

```json
{
    "driverParameters": {
        "browser": "chrome"
    },
    "stages": [
        {
            "name": "Stage1",
            "jobs": [
                {
                    "rules": [
                        {
                            "pluginName": "PluginName",
                            "argument": "value"
                        }
                    ]
                }
            ]
        }
    ]
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

* `200 OK`: Successfully invoked the automation session.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/automation/invoke" -H "Content-Type: application/json" -d '{"driverParameters":{"browser":"chrome"},"stages":[{"name":"Stage1","jobs":[{"rules":[{"pluginName":"PluginName","argument":"value"}]}]}]}'
```