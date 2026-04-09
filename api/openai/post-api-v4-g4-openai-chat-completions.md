# POST: Generate Chat Completions

This endpoint sends a chat completion request to the OpenAI-compatible backend. Supports streaming or non-streaming responses based on the `stream` flag.

## Http Request

```none
POST /api/v4/g4/openai/chat/completions
```

## Request Body

```json
{
    "model": "gpt-4",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ],
    "temperature": 0.7,
    "maxTokens": 100,
    "stream": false
}
```

## Response Body

```json
{
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1234567890,
    "model": "gpt-4",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "I'm doing well, thank you!"
            },
            "finish_reason": "stop"
        }
    ]
}
```

## Status Codes

* `200 OK`: Returns the full chat completion if `stream=false`.
* `204 No Content`: The chat completion is streamed directly to the response if `stream=true`.

## cURL Example

```bash
curl -X POST "http://localhost:9944/api/v4/g4/openai/chat/completions" -H "Content-Type: application/json" -d '{"model":"gpt-4","messages":[{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"Hello, how are you?"}],"temperature":0.7,"maxTokens":100,"stream":false}'
```