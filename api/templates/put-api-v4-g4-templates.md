# PUT: Add or Overwrite a Template

This endpoint adds a new template based on the provided G4PluginAttribute manifest. If the template exists, it is overwritten and the engine cache is updated. A 204 No Content response indicates a successful addition or overwrite. If an error occurs, an appropriate error response is returned.

## Http Request

```none
PUT /api/v4/g4/templates
```

## Request Body

```json
{
    "key": "template-key",
    "pluginType": "type",
    "examples": [
        {
            "description": ["Example description"],
            "rule": { }
        }
    ]
}
```

## Response Body

```json
{
    "status": "success",
    "message": "Template added or overwritten"
}
```

## Status Codes

* `204 No Content`: The template was successfully added or overwritten, and the engine cache was updated.
* `400 Bad Request`: Invalid request. The manifest provided is not in the correct format or missing required fields.
* `409 Conflict`: Invalid manifest. The provided manifest could not be processed.

## cURL Example

```bash
curl -X PUT "http://localhost:9944/api/v4/g4/templates" -H "Content-Type: application/json" -d '{"key":"template-key","pluginType":"type","examples":[{"description":["Example description"],"rule":{}}]}'
```