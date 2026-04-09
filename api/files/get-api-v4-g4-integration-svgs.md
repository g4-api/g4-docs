# GET: Lists All SVG Files in wwwroot

This endpoint recursively scans the wwwroot directory for SVG files and returns a dictionary with the formatted file names (as keys) and their relative paths (as values). Useful for discovering and using SVG resources for UI components, icons, etc.

## Http Request

```none
GET /api/v4/g4/integration/svgs
```

## Response Body

```json
{
    "status": "success",
    "data": {
        "icon-home": "/images/icons/home.svg",
        "icon-settings": "/images/icons/settings.svg"
    }
}
```

## Status Codes

* `200 OK`: Successfully returned a dictionary of all SVG files found under wwwroot.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/svgs" -H "Content-Type: application/json"
```