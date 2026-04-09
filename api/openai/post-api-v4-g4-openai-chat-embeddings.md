# POST: Generate Embeddings

This endpoint generates embeddings for the given input text using the OpenAI-compatible backend.

## Http Request

```none
POST /api/v4/g4/openai/chat/embeddings
```

## Request Body

```json
{
    "model": "text-embedding-ada-002",
    "input": "The quick brown fox jumps over the lazy dog"
}
```

## Response Body

```json
{
    "object": "list",
    "data": [
        {
            "object": "embedding",
            "embedding": [0.1, 0.2, 0.3],
            "index": 0
        }
    ],
    "model": "text-embedding-ada-002"
}
```

## Status Codes

* `200 OK`: Request was successful.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/openai/chat/embeddings" -H "Content-Type: application/json" -d '{"model":"text-embedding-ada-002","input":"The quick brown fox jumps over the lazy dog"}'
```