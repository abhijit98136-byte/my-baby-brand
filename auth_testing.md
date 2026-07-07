# Auth Testing Playbook (Emergent Google Auth)

## Test User & Session Creation
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  id: userId, email: 'test@example.com', name: 'Test User',
  picture: '', role: 'user', created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId, session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
"
```

## Test Endpoints
- GET /api/auth/me with cookie `session_token=<TOKEN>` or `Authorization: Bearer <TOKEN>`
- Browser: set cookie session_token then load /

## Flow Summary
1. Frontend clicks Google Sign-in → redirects to `https://auth.emergentagent.com/?redirect=<origin>/auth/callback`
2. Google returns → user lands at `/auth/callback#session_id=xxx`
3. Frontend detects hash → POST to `/api/auth/google/session` with X-Session-ID header
4. Backend calls emergent `/auth/v1/env/oauth/session-data` → creates user + session → sets httpOnly cookie
5. Frontend navigates to /account
