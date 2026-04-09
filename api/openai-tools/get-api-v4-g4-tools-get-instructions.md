# GET: Retrieve Instructions for a Given Policy

This endpoint returns the instruction set associated with the specified policy. If no policy is provided, the 'default' policy instructions are returned.

## Http Request

```none
GET /api/v4/g4/tools/get_instructions
```

## Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| policy | string | Optional policy name. If omitted or empty, the 'default' policy will be used. |

## Response Body

```json
{
    "status": "success",
    "data": {
        "instructions": "These are the policy instructions."
    }
}
```

## Status Codes

* `200 OK`: The instructions for the requested (or default) policy were retrieved successfully.

## cURL Example

```bash
curl -X GET "http://localhost:9944/api/v4/g4/tools/get_instructions?policy=default" -H "Content-Type: application/json"
```