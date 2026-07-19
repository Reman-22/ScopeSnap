# Change Requests API

Post-approval scope changes. **Clients create** change requests; **freelancers accept or reject** them.

---

## List change requests (client)

**Purpose:** Client sees all their change requests across projects.

```http
GET /change-requests
```

**Auth:** Bearer token + client role

**Response:**

```json
{
  "success": true,
  "message": "Change requests retrieved",
  "data": {
    "change_requests": [
      {
        "id": 1,
        "project_id": 1,
        "projectId": 1,
        "client_id": 3,
        "clientId": 3,
        "item_id": 5,
        "itemId": 5,
        "title": "Add blog section",
        "description": "Please add a blog with categories",
        "status": "pending",
        "status_value": "pending",
        "reason": null,
        "client": {
          "id": 3,
          "name": "Sara Client",
          "email": "sara@example.com"
        },
        "item": {
          "id": 5,
          "title": "Content Pages"
        },
        "created_at": "2026-07-19T14:00:00.000000Z",
        "updated_at": "2026-07-19T14:00:00.000000Z"
      }
    ]
  }
}
```

---

## List change requests (freelancer, per project)

**Purpose:** Freelancer sees all change requests for one project.

```http
GET /projects/{project_id}/change-requests
```

**Auth:** Bearer token + freelancer role (must own project)

**Response:** Same `change_requests` array shape as above.

---

## Create change request

**Purpose:** Linked client requests a scope change on an **approved** project.

```http
POST /projects/{project_id}/change-requests
```

**Auth:** Bearer token + client role

**Body:**

```json
{
  "title": "Add blog section",
  "description": "Please add a blog with categories and tags",
  "item_id": 5
}
```

| Field | Rules |
|-------|-------|
| title | Required, 3–255 chars |
| description | Required, 3–5000 chars |
| item_id | Optional — link to an existing scope item in this project |

**Response (201):**

```json
{
  "success": true,
  "message": "Change request created successfully",
  "data": {
    "change_request": {
      "id": 1,
      "project_id": 1,
      "client_id": 3,
      "item_id": 5,
      "title": "Add blog section",
      "description": "Please add a blog with categories and tags",
      "status": "pending",
      "status_value": "pending",
      "reason": null
    }
  }
}
```

**Errors:**

| Code | Message |
|------|---------|
| 422 | Change requests can only be created for approved projects |
| 422 | Change requests require a project that was approved by a linked client |
| 403 | You are not the linked client for this project |

**Note:** Creating a change request does **not** link the client to the project.

---

## Get change request

**Purpose:** View one change request (freelancer owner or linked client).

```http
GET /change-requests/{id}
```

**Auth:** Bearer token (freelancer owner or linked client)

**Response:**

```json
{
  "success": true,
  "message": "Change request retrieved",
  "data": {
    "change_request": {
      "id": 1,
      "project_id": 1,
      "title": "Add blog section",
      "description": "Please add a blog",
      "status": "pending",
      "status_value": "pending",
      "reason": null,
      "item_id": 5,
      "client": { "id": 3, "name": "Sara Client", "email": "sara@example.com" },
      "item": { "id": 5, "title": "Content Pages" }
    }
  }
}
```

---

## Update status (accept / reject)

**Purpose:** Freelancer accepts or rejects a pending change request.

```http
PATCH /change-requests/{id}/status
```

**Auth:** Bearer token + freelancer role (must own the project)

**Body (accept):**

```json
{
  "status": "accepted",
  "reason": "Will be billed separately"
}
```

**Body (reject):**

```json
{
  "status": "rejected",
  "reason": "Out of current scope"
}
```

| Field | Rules |
|-------|-------|
| status | Required: `accepted`, `approved`, or `rejected` |
| reason | Optional, max 2000 chars |

**Response (accepted):**

```json
{
  "success": true,
  "message": "Change request updated successfully",
  "data": {
    "change_request": {
      "id": 1,
      "status": "accepted",
      "status_value": "approved",
      "reason": "Will be billed separately"
    }
  }
}
```

**Response (rejected):**

```json
{
  "success": true,
  "message": "Change request updated successfully",
  "data": {
    "change_request": {
      "id": 1,
      "status": "rejected",
      "status_value": "rejected",
      "reason": "Out of current scope"
    }
  }
}
```

Use `status` for UI labels (`accepted` / `rejected` / `pending`). Use `status_value` for internal state if needed.

**Error (422):** `"Only pending change requests can be updated"`

---

## Delete change request

**Purpose:** Cancel a pending change request.

```http
DELETE /change-requests/{id}
```

**Auth:** Bearer token — freelancer (project owner) or linked client

**Response:**

```json
{
  "success": true,
  "message": "Change request deleted successfully",
  "data": null
}
```

**Error (422):** `"Only pending change requests can be deleted"`

---

## Status reference

| UI `status` | DB `status_value` | Meaning |
|-------------|-------------------|---------|
| `pending` | `pending` | Awaiting freelancer review |
| `accepted` | `approved` | Freelancer accepted |
| `rejected` | `rejected` | Freelancer rejected |
