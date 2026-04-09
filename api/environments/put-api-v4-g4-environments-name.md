# PUT: Update an Existing Environment or Create a New One

This endpoint updates the parameters of an existing environment identified by its name. If the environment does not exist, it will be created with the provided parameters. A 204 No Content response indicates a successful update, while a 201 Created response indicates that a new environment was created.

## Http Request

```none
PUT /api/v4/g4/environments/{name}
```

## Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| name | string | The name of the environment to be updated or created. |

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| encode | boolean | true | Specifies whether the parameters should be Base64-encoded before being stored. |

## Request Body

```json
{
    "param1": "value1",
    "param2": "value2"
}
```

## Response Body

```json
{
    "status": "success",
    "message": "Environment updated or created"
}
```

## Status Codes

* `201 Created`: The environment did not exist and was successfully created with the provided parameters.
* `204 No Content`: The environment existed and was successfully updated with the provided parameters.
* `400 Bad Request`: Invalid request. The environment name is not in the correct format.

## cURL Example

```bash
curl -X PUT "http://localhost:9944/api/v4/g4/environments/environment-name" -H "Content-Type: application/json" -d '{"param1":"value1","param2":"value2"}'
```