# POST: Generate Completions

This endpoint generates completions using the OpenAI-compatible backend.

## Http Request

```none
POST /api/v4/g4/openai/completions
```

## Request Body

```json
{
    "model": "gpt-3.5-turbo",
    "prompt": "Once upon a time",
    "max_tokens": 50,
    "temperature": 0.7
}
```

## Response Body

```json
{
    "id": "cmpl-123",
    "object": "text_completion",
    "created": 1234567890,
    "model": "gpt-3.5-turbo",
    "choices": [
        {
            "text": "Once upon a time, in a land far away...",
            "index": 0,
            "finish_reason": "stop"
        }
    ]
}
```

## Status Codes

* `200 OK`: Request was successful.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/openai/completions" -H "Content-Type: application/json" -d '{"model":"gpt-3.5-turbo","prompt":"Once upon a time","max_tokens":50,"temperature":0.7}'
```