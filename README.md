# Unreel Extension

A React-based browser extension with Google OAuth authentication and Chrome storage integration.

## Authentication Flow

The extension implements a complete authentication flow using Google OAuth:

### 1. Login Process

- User clicks "Login with Google" button
- Extension opens a new tab with the OAuth URL
- User completes Google authentication on the backend
- Backend redirects back to the extension with a token parameter

### 2. Token Storage

- The token is automatically extracted from the URL query parameters
- Token is stored in the Zustand store
- Zustand automatically persists the token to Chrome's local storage
- Token is validated with the backend to fetch user information

### 3. Persistent Authentication

- On subsequent visits, the token is retrieved from Chrome storage
- User remains authenticated without needing to log in again
- Token is validated with the backend to ensure it's still valid

## Technical Implementation

### Chrome Storage Integration

- Uses Zustand's persist middleware with a custom Chrome storage adapter
- Automatically falls back to localStorage if Chrome storage is unavailable
- Provides robust error handling and debugging information

### State Management

- Zustand store manages authentication state (user, token, authenticated status)
- Automatic persistence to Chrome storage
- Reactive updates across the entire application

### URL Token Handling

- Layout component automatically detects tokens in URL parameters
- Cleans up the URL after token extraction
- Seamless user experience with automatic authentication

## Development

### Prerequisites

- Node.js 16+
- Chrome browser for extension testing

### Setup

1. Install dependencies: `npm install`
2. Build the extension: `npm run build`
3. Load the extension in Chrome from the `dist` folder

### Backend Requirements

The backend should implement:

- Google OAuth endpoint: `GET /auth/google`
- Token validation endpoint: `POST /auth/check-token`
- Redirect back to extension with token parameter

### Environment

- Backend URL: `http://localhost:3000` (configurable in `use-auth.ts`)
- Extension popup: `index.html`

## Debugging

The extension includes comprehensive logging for debugging:

- Console logs for all authentication steps
- Chrome storage inspection button on the home page
- Detailed error handling and fallback mechanisms

Use the browser's developer console to monitor the authentication flow and identify any issues.
