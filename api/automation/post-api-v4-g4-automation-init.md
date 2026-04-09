# POST: Initialize an Automation Request

This endpoint configures and prepares an automation request by setting up all necessary references and action connections in the provided model. The result is an initialized `G4AutomationModel` that is fully configured and ready for invocation.

## Http Request

```none
POST /api/v4/g4/automation/init
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
        "driverParameters": { },
        "stages": [ ],
        "settings": { }
    }
}
```

## Status Codes

* `200 OK`: Successfully initialized the automation request.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/automation/init" -H "Content-Type: application/json" -d '{"driverParameters":{"browser":"chrome"},"stages":[{"name":"Stage1","jobs":[{"rules":[{"pluginName":"PluginName","argument":"value"}]}]}]}'
```