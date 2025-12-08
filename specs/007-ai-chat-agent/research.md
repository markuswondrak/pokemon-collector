# Research: AI Chatbot Agent

**Feature**: `007-ai-chat-agent`
**Date**: 2025-12-08

## 1. Google Identity Services (GIS) for Client-side OAuth

**Decision**: Use the "Token Model" from the Google Identity Services SDK.

**Rationale**:
- The "Token Model" (`google.accounts.oauth2`) is specifically designed for SPAs (Single Page Applications) to obtain an access token directly in the browser without a backend exchange (Implicit Flow replacement).
- It handles the popup/redirect flow and returns an `access_token` with an expiration time.

**Implementation Details**:
- **Script**: `<script src="https://accounts.google.com/gsi/client" async defer></script>`
- **Initialization**:
  ```typescript
  const client = google.accounts.oauth2.initTokenClient({
    client_id: 'YOUR_CLIENT_ID',
    scope: 'https://www.googleapis.com/auth/cloud-platform', // Or specific Gemini scope if available
    callback: (response) => {
      if (response.access_token) {
        // Store token in session/memory
      }
    },
  });
  ```
- **Trigger**: `client.requestAccessToken()` on button click.

**Alternatives Considered**:
- **Legacy Google Sign-In (`gapi.auth2`)**: Deprecated and should not be used.
- **Authorization Code Flow**: Requires a backend to exchange code for token. Rejected due to "No backend" constraint.

## 2. Gemini API Client (Browser + OAuth)

**Decision**: Use the Gemini REST API directly via `fetch` with the OAuth token.

**Rationale**:
- The official `@google/generative-ai` SDK is primarily designed for API Key usage. While it might support custom headers, using `fetch` gives us full control over the `Authorization` header (`Bearer <token>`) which is required for OAuth.
- The REST API is well-documented and supports CORS (provided the Origin is allowed in Google Cloud Console).

**Implementation Details**:
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent` (or `gemini-pro`)
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`
- **CORS**: Must configure "Authorized JavaScript origins" in Google Cloud Console for the OAuth Client ID.

**Alternatives Considered**:
- **`@google/generative-ai` SDK**: If it supports passing a token directly, we could use it. However, direct REST is a guaranteed working path for OAuth.

## 3. Function Calling Schema

**Decision**: Use the native `tools` and `function_declarations` schema in the Gemini API.

**Rationale**:
- Ensures structured JSON output that strictly adheres to our filter requirements.
- Eliminates the need for complex regex parsing of natural language responses.

**Schema Example**:
```json
{
  "tools": [
    {
      "function_declarations": [
        {
          "name": "filter_pokemon",
          "description": "Filter the Pokemon grid based on user criteria",
          "parameters": {
            "type": "OBJECT",
            "properties": {
              "type": {
                "type": "ARRAY",
                "items": { "type": "STRING" },
                "description": "Pokemon types (e.g., 'fire', 'water')"
              },
              "minStat": {
                "type": "NUMBER",
                "description": "Minimum base stat total or specific stat value"
              },
              "nameContains": {
                "type": "STRING",
                "description": "Substring to search in Pokemon name"
              }
            },
            "required": []
          }
        }
      ]
    }
  ]
}
```

## 4. Unknowns Resolved

- **GIS SDK**: Confirmed usage of `google.accounts.oauth2`.
- **Gemini API**: Confirmed usage of REST API with Bearer token.
- **Function Calling**: Confirmed schema structure.
