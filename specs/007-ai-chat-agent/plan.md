# Implementation Plan: AI Chatbot Agent

**Branch**: `007-ai-chat-agent` | **Date**: 2025-12-08 | **Spec**: [specs/007-ai-chat-agent/spec.md](spec.md)
**Input**: Feature specification from `/specs/007-ai-chat-agent/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a browser-based AI chat agent using Google Gemini. The feature includes a floating chat interface, client-side Google OAuth 2.0 authentication, and natural language processing to filter the Pokemon grid. The system uses "Function Calling" to translate user queries into structured filter commands without a backend proxy.

## Technical Context

**Language/Version**: TypeScript 5.9+
**Primary Dependencies**: React 19, Chakra UI v3, Vite 7, Google Identity Services SDK (NEEDS CLARIFICATION), Google Gemini API Client (NEEDS CLARIFICATION)
**Storage**: Session Storage (for ephemeral tokens), Browser Memory
**Testing**: Vitest, React Testing Library
**Target Platform**: Web (Modern Browsers)
**Project Type**: Single Page Application (React)
**Performance Goals**: Chat open < 200ms, UI responsive during AI requests
**Constraints**: 100% Client-side, No backend server, Strict OAuth 2.0 (Google), CORS enabled API calls
**Scale/Scope**: Single feature module, ~5-10 new components/hooks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Code Quality**: TypeScript strict mode will be enforced.
- [x] **Testing**: TDD will be used. Unit tests for Chat components and Hooks. Integration test for the Auth -> Chat -> Filter flow.
- [x] **UX**: Chakra UI components will be used for the Chat interface to match existing design.
- [x] **Velocity**: Vite dev server used. No complex backend setup required.
- [x] **Architecture**: Feature will be modularized in `src/components/Chat` and `src/hooks`.

## Project Structure

### Documentation (this feature)

```text
specs/007-ai-chat-agent/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Chat/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── AuthButton.tsx
│   └── FloatingChatButton.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useGoogleAuth.ts
│   └── useGemini.ts
├── services/
│   └── ai/
│       ├── gemini.ts
│       └── googleAuth.ts
└── types/
    └── chat.ts

tests/
├── unit/
│   ├── components/
│   │   └── Chat/
│   └── hooks/
│       ├── useChat.test.ts
│       └── useGoogleAuth.test.ts
└── integration/
    └── flows/
        └── chat-filtering.test.ts
```

**Structure Decision**: Modular feature structure within existing `src/components` and `src/hooks` directories, following the project's flat architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - Compliant with constitution.
