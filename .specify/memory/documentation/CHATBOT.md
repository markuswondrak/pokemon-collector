# Requirements Document: AI-Powered Chat Agent with Provider-side Authentication

## Overview

Build a browser-based, JavaScript-only chat agent that uses an AI-powered service for conversational interaction. Users authenticate directly with the AI provider (e.g., Google, Microsoft, OpenAI) via provider-side OAuth, enabling the agent to access the API on behalf of the user without exposing shared API keys in the frontend. The chatbot filters Pokemon based on the user requests. 

---

## Functional Requirements

1. **Chat UI**
    - Provide an interactive text-based chat interface embedded in the web application.
    - The chat is activated by a hovering chat icon in the left down corner. 

2. **User Authentication**
    - Integrate with the AI provider’s OAuth flow (e.g., Google Sign-In, Microsoft Login, etc.).
    - The user can choose which API provider to use. 
    - Handle authentication in-browser; users sign in using personal credentials from the provider.
    - Upon successful login, obtain user-specific access tokens (not your application's shared API key).

3. **AI API Integration**
    - Send chat prompts and receive responses using the provider's AI chat endpoint.
    - Attach the user’s access token to API requests as required by the provider.
    - Handle token refresh or expiry gracefully.

4. **Error Handling**
    - Surface authentication, authorization, and API errors in the chat UI.
    - Notify users when authentication is required or has expired.

5. **Interaction with the current shown grid**
    - The grid filters pokemon matching the users request (e.g. "I am looking for a strong fire pokemon")

---

## Non-Functional Requirements

- **Performance**: Minimal latency in chat response delivery.
- **Accessibility**: Comply with basic accessibility standards in UI.
- **Browser Compatibility**: Support latest versions of major browsers.

---

## Out of Scope

- No backend proxy or server-side components for routine chat/AI requests or credential handling.
- No support for providers that do not offer end-user authentication (OAuth) for chat APIs.
- No file upload, voice input, or advanced multimodal features in initial release.

---

## Assumptions & Notes

- The AI provider must support OAuth/token flow for end-user browser clients **and** allow those tokens to access chat/completion endpoints.
- The web app will need to register as an OAuth client with the provider and configure appropriate redirect URIs.
- For demo or dev purposes, provider keys or secrets **must never** be embedded in client code.
