# POST: Enqueue a New Automation Task

This endpoint creates a new automation queue model and enqueues it into the pending queue. The automation task will be picked up by any available automation worker for processing.

## Http Request

```none
POST /api/v4/g4/automation/async/start
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
    "message": "Automation task enqueued"
}
```

## Status Codes

* `202 Accepted`: The automation task has been accepted and enqueued.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/automation/async/start" -H "Content-Type: application/json" -d '{"driverParameters":{"browser":"chrome"},"stages":[{"name":"Stage1","jobs":[{"rules":[{"pluginName":"PluginName","argument":"value"}]}]}]}'
```