# API Overview

## Base URL

```text
http://127.0.0.1:8000/api
```

All requests should include:

```http
Accept: application/json
```

Protected routes also require:

```http
Authorization: Bearer {token}
```

---

## Response envelope

### Success

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { }
}
```

Created resources return HTTP `201` with the same shape.

### Error

```json
{
  "success": false,
  "message": "Error summary",
  "errors": {
    "field": ["Validation message"]
  }
}
```

`errors` is only present for validation failures (HTTP `422`).

---

## HTTP status codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Not logged in / invalid token |
| 403 | Logged in but wrong role or not allowed |
| 404 | Resource or endpoint not found |
| 422 | Validation or business rule failed |
| 500 | Server error |

---

## Authentication flow

```text
1. POST /auth/register  or  POST /auth/login
2. Save data.token
3. Send Authorization: Bearer {token} on every protected request
4. GET /auth/me to restore session on app load
5. POST /auth/logout to invalidate token
```

---

## Roles

Register with `"role": "freelancer"` or `"role": "client"`.

User object returns:

```json
{
  "role": true,
  "role_label": "freelancer"
}
```

| `role` | `role_label` | Can access |
|--------|--------------|------------|
| `false` | `client` | Share approve/reject, create change requests |
| `true` | `freelancer` | Projects, clients, scope, CR status updates |

Some routes work for **any authenticated user** (share view, activity logs, change request show/delete).

---

## Health check

**Purpose:** Verify the API is running.

```http
GET /health
```

**Auth:** No

**Response:**

```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "app": "ScopeSnap",
    "version": "12.x.x"
  }
}
```

---

## CamelCase vs snake_case

Responses include both forms for React compatibility, e.g.:

- `client_id` and `clientId`
- `share_link` and `shareLink`
- `scopeSections` (nested array on projects)

Send request bodies using either convention unless noted otherwise.
