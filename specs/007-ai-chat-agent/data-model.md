# Data Model: AI Chatbot Agent

**Feature**: `007-ai-chat-agent`

## Entities

### ChatMessage

Represents a single message in the conversation history.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (UUID) |
| `role` | `'user' \| 'model' \| 'system'` | The sender of the message |
| `content` | `string` | The text content of the message |
| `timestamp` | `number` | Unix timestamp of when the message was sent |
| `isError` | `boolean` | (Optional) Whether this message represents an error state |

### FilterIntent

Structured criteria extracted from the user's natural language query.

| Field | Type | Description |
|-------|------|-------------|
| `types` | `string[]` | List of Pokemon types (e.g., `['fire', 'flying']`) |
| `minStat` | `number` | Minimum base stat value (aggregate or specific) |
| `nameContains` | `string` | Substring match for Pokemon name |
| `generation` | `number` | Pokemon generation number (1-9) |

### AuthSession

Represents the active authentication state.

| Field | Type | Description |
|-------|------|-------------|
| `provider` | `'google'` | The auth provider |
| `accessToken` | `string` | The OAuth 2.0 access token |
| `expiresAt` | `number` | Timestamp when the token expires |
| `status` | `'idle' \| 'authenticated' \| 'error'` | Current auth status |

## State Management

### ChatState

Managed via `useChat` hook.

```typescript
interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### AuthState

Managed via `useGoogleAuth` hook.

```typescript
interface AuthState {
  session: AuthSession | null;
  isInitializing: boolean;
  login: () => void;
  logout: () => void;
}
```
