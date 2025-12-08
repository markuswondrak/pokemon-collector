# Quickstart: AI Chatbot Agent

**Feature**: `007-ai-chat-agent`

## Prerequisites

1. **Google Cloud Project**:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/).
   - Enable the **Gemini API** (Generative Language API).
   - Configure the **OAuth Consent Screen** (External or Internal).
   - Create an **OAuth 2.0 Client ID** for "Web application".
   - Add `http://localhost:5173` (or your dev URL) to **Authorized JavaScript origins**.

2. **Environment Variables**:
   - Create or update `.env.local`:
     ```bash
     VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     ```

## Running the Feature

1. **Start the Dev Server**:
   ```bash
   pnpm dev
   ```

2. **Access the Chat**:
   - Click the floating chat icon in the bottom-left corner.
   - Click "Sign in with Google".
   - Complete the popup flow.

3. **Test Queries**:
   - "Show me fire pokemon"
   - "Find strong water types"
   - "Pokemon named char"

## Troubleshooting

- **"Origin not allowed" error**:
  - Check that `http://localhost:5173` is exactly matched in the Google Cloud Console "Authorized JavaScript origins".
  - Clear browser cache or try Incognito if changes don't propagate immediately.

- **"403 Forbidden" on Gemini API**:
  - Ensure the Google Cloud Project has the Generative Language API enabled.
  - Ensure the user account has access (if the app is in "Testing" mode on the OAuth consent screen, the user must be added as a test user).
