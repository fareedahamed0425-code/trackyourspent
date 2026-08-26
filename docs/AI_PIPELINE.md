# AI Advisor Pipeline & Architecture

## Model & Inference
- **Provider:** NVIDIA AI Foundation Endpoints
- **Model:** `nvidia/nemotron-3-ultra-550b-a55b`
- **Protocol:** Server-Sent Events (SSE) Streaming

## Context Injection Flow
1. **Ledger Serialization:** Aggregates user's recent transactions, monthly spending, categories, and budget limits into structured JSON.
2. **System Prompt Injection:** Injects live financial metrics along with persona guidelines (actionable, non-judgmental, natural conversational greetings).
3. **Chunk Processing & Formatting:** Custom markdown compiler parses `**bold**` into `<strong>` and renders structured lists cleanly without visible raw asterisks.

