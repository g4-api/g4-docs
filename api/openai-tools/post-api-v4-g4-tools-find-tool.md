# POST: Find a Tool by Name or Intent

This endpoint attempts to locate a tool in the registry. If the tool name is not provided or is inaccurate, the intent will be used as a fallback for vector-based lookup.

## Http Request

```none
POST /api/v4/g4/tools/find_tool
```

## Request Body

```json
{
    "tool_name": "tool-name",
    "intent": "search for files",
    "id": "chat-id"
}
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "name": "tool-name",
        "description": "Tool description"
    }
}
```

## Status Codes

* `200 OK`: The tool was found successfully. Returns a ToolOutputSchema containing the matched tool details.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/tools/find_tool" -H "Content-Type: application/json" -d '{"tool_name":"tool-name","intent":"search for files","id":"chat-id"}'
```