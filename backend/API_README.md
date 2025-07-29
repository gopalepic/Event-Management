# Calendar Integration API

A Node.js/Express API for Google Calendar integration with OAuth2 authentication.

## Features

- 🔐 Google OAuth2 Authentication
- 📅 Create Calendar Events
- 📋 List Calendar Events
- 🔄 Automatic Token Refresh
- 🛡️ Input Validation
- 💾 PostgreSQL Database with Prisma ORM

## API Endpoints

### Authentication

#### Start Google OAuth Flow
```
GET /api/auth/google
```
Redirects user to Google's consent screen.

#### OAuth Callback
```
GET /api/auth/google/callback
```
Handles Google's callback after user grants permissions.

### Calendar Events

#### Create Calendar Event
```
POST /api/calendar/event
```

**Headers:**
```
Content-Type: application/json
X-User-ID: {user_id_from_database}
```

**Body:**
```json
{
  "title": "Meeting with Team",
  "description": "Weekly standup meeting",
  "start": "2025-07-30T14:00:00.000Z",
  "end": "2025-07-30T15:00:00.000Z"
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "eventId": "abc123...",
  "htmlLink": "https://www.google.com/calendar/event?eid=...",
  "event": { /* full event object */ }
}
```

#### Get Calendar Events
```
GET /api/calendar/events
```

**Headers:**
```
X-User-ID: {user_id_from_database}
```

**Response:**
```json
{
  "message": "Events retrieved successfully",
  "events": [
    {
      "id": "event_id",
      "summary": "Event Title",
      "start": { "dateTime": "2025-07-30T14:00:00.000Z" },
      "end": { "dateTime": "2025-07-30T15:00:00.000Z" },
      // ... other event properties
    }
  ]
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URL="http://localhost:5000/api/auth/google/callback"
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Google Cloud Console Setup

1. Create a new project in Google Cloud Console
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
5. Add your email to test users (if app is in testing mode)

## Production Considerations

- ✅ Input validation implemented
- ✅ Automatic token refresh
- ✅ Error handling
- ✅ Database integration
- ✅ Secure environment variables
- ⚠️ Add rate limiting for production
- ⚠️ Add proper logging middleware
- ⚠️ Add authentication middleware for protected routes
