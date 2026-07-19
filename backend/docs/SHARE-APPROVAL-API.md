# Share & Approval API

Client-facing share link flow. The client must **log in** before viewing or responding to a shared project.

**Important:** Viewing the share link does **not** link the client to the project. Linking happens only on **approve**.

---

## View shared project

**Purpose:** Client (or owning freelancer) views project scope via share token.

```http
GET /share/{shareLink}
```

**Auth:** Bearer token required

**Who can access:**

| User | Access |
|------|--------|
| Client (any logged-in client) | Yes, if they have the link |
| Freelancer who owns the project | Yes (preview) |
| Other freelancers | No (403) |

**Response:**

```json
{
  "success": true,
  "message": "Project retrieved",
  "data": {
    "project": {
      "id": 1,
      "name": "E-commerce Store",
      "title": "E-commerce Store",
      "description": "Online clothing store",
      "client_id": null,
      "clientId": null,
      "status": "sent",
      "share_link": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "shareLink": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "scopeSections": [
        {
          "id": 1,
          "title": "Features",
          "position": 0,
          "items": [
            {
              "id": 1,
              "title": "Product Catalog",
              "description": "Browse and filter products",
              "status": "included",
              "position": 0
            }
          ]
        }
      ],
      "project_approval": {
        "id": 1,
        "status": "pending",
        "comment": null,
        "clientId": null
      },
      "projectApproval": {
        "id": 1,
        "status": "pending",
        "comment": null,
        "clientId": null
      }
    }
  }
}
```

**Error (401):** Not logged in

**Error (404):** Invalid share link

---

## Approve project

**Purpose:** Client approves the scope. Links client to project and sets status to `approved`.

```http
POST /share/{shareLink}/approve
```

**Auth:** Bearer token + client role

**Body:**

```json
{
  "comment": "Looks good to me"
}
```

| Field | Rules |
|-------|-------|
| comment | Optional, max 2000 chars |

**Response:**

```json
{
  "success": true,
  "message": "Project approved successfully",
  "data": {
    "project_approval": {
      "id": 1,
      "project_id": 1,
      "client_id": 3,
      "clientId": 3,
      "comment": "Looks good to me",
      "status": "approved",
      "client": {
        "id": 3,
        "name": "Sara Client",
        "email": "sara@example.com"
      }
    },
    "project": {
      "id": 1,
      "status": "approved",
      "approvedAt": "2026-07-19T12:00:00.000000Z"
    }
  }
}
```

**What happens on approve:**

1. Creates or finds a `clients` row for this freelancer + logged-in user
2. Sets `projects.client_id` to that client
3. Sets `projects.status` to `approved`
4. Logs `scope_approved` activity

**Errors (422):**

- `"Project is already approved"`
- `"Project must be sent before it can be approved"`
- `"No pending project approval found for this project"`

---

## Reject project

**Purpose:** Client rejects the scope. Project returns to `draft` for freelancer edits.

```http
POST /share/{shareLink}/reject
```

**Auth:** Bearer token + client role

**Body:**

```json
{
  "comment": "Need more details on payment flow"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Project rejected successfully",
  "data": {
    "project_approval": {
      "id": 1,
      "status": "rejected",
      "comment": "Need more details on payment flow",
      "clientId": 3
    },
    "project": {
      "id": 1,
      "status": "draft"
    }
  }
}
```

**Note:** `projects.client_id` stays `null` on reject. Only `approval_client_id` records who rejected.

---

## Frontend flow

```text
1. Client opens /share/{shareLink}
2. If not logged in → redirect to login/register (role: client)
3. GET /share/{shareLink} with token → show scope
4. Client clicks Approve or Reject
5. POST /share/{shareLink}/approve or /reject
6. On approve → client is linked; can create change requests later
```

Register/login: see [AUTH-API.md](./AUTH-API.md)
