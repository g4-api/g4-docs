# GET: Retrieve All Template Manifests

This endpoint fetches all template manifests available in the system. The response includes a custom header 'X-Manifest-Count' indicating the total number of manifests returned.

## Http Request

```none
GET /api/v4/g4/templates
```

## Response Body

```json
{
    "status": "success",
    "data": [
        {
            "key": "template-key",
            "pluginType": "type",
            "examples": [ ]
        }
    ]
}
```

## Status Codes

* `200 OK`: Manifests retrieved successfully.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/templates" -H "Content-Type: application/json"
```