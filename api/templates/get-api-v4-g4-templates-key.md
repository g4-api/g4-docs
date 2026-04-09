# GET: Retrieve a Template Manifest by Key

This endpoint fetches the manifest of a template identified by its key. If the template exists, its manifest is returned in JSON format. If the template is not found, a 404 Not Found response is returned with a detailed error message.

## Http Request

```none
GET /api/v4/g4/templates/{key}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| key | string | The key of the template to retrieve the manifest for. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "key": "template-key",
        "pluginType": "type",
        "examples": [ ]
    }
}
```

## Status Codes

* `200 OK`: Template manifest found and returned successfully.
* `404 Not Found`: Template not found with the specified key.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/templates/template-key" -H "Content-Type: application/json"
```