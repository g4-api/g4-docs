# GET: Lists All Static Files in wwwroot

This endpoint recursively scans the wwwroot directory and returns a list of all static file paths, relative to wwwroot. Useful for discovering available static resources such as HTML, JS, CSS, images, etc.

## Http Request

```none
GET /api/v4/g4/integration/files
```

## Response Body

```json
{
    "status": "success",
    "data": [
        "/index.html",
        "/css/style.css",
        "/js/app.js"
    ]
}
```

## Status Codes

* `200 OK`: Successfully returned a list of all static files found under wwwroot.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/integration/files" -H "Content-Type: application/json"
```