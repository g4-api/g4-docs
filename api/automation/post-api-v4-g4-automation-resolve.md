# POST: Resolve Macros in the Provided G4AutomationModel

This endpoint scans and resolves macros for all rules in the G4AutomationModel, returning a list of G4RuleModelBase objects with macros resolved.

## Http Request

```none
POST /api/v4/g4/automation/resolve
```

## Request Body

```json
{
    "driverParameters": { },
    "stages": [
        {
            "jobs": [
                {
                    "rules": [
                        {
                            "pluginName": "PluginName"
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
    "data": [
        {
            "pluginName": "PluginName",
            "argument": "resolved_value"
        }
    ]
}
```

## Status Codes

* `200 OK`: Successfully resolved macros.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/automation/resolve" -H "Content-Type: application/json" -d '{"driverParameters":{},"stages":[{"jobs":[{"rules":[{"pluginName":"PluginName"}]}]}]}'
```