# GET: Retrieve the Plugin Cache as a ZIP Archive

This endpoint collects all plugins from the in-memory cache, serializes each plugin's manifest, document, and examples into individual JSON files, and returns a ZIP archive containing these files.

## Http Request

```none
GET /api/v4/g4/integration/cache/dataset
```

## Response Body

Returns a ZIP file containing JSON files for each plugin.

## Status Codes

* `200 OK`: Successfully generated ZIP archive containing all cached plugin JSON files.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/cache/dataset" -H "Content-Type: application/json"
```