# POST: Retrieve a Collection of Available Tools

This endpoint returns a dictionary of available tools, optionally filtered by intent (purpose) and/or tool types. If no filters are provided, all tools are returned.

## Http Request

```none
POST /api/v4/g4/tools/get_tools
```

## Request Body

```json
{
    "intent": "automation",
    "tool_types": ["browser", "file"]
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "tool1": {
            "name": "tool1",
            "description": "Tool 1 description"
        }
    }
}
```

## Status Codes

* `200 OK`: The available tools were retrieved successfully. The response contains a dictionary mapping tool names to their definitions.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/tools/get_tools" -H "Content-Type: application/json" -d '{"intent":"automation","tool_types":["browser","file"]}'
```