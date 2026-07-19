# Projects API

Freelancer project management. Projects start as `draft` with no linked client until a client approves via the share link.

**Auth:** Bearer token + freelancer role (except share view — see [SHARE-APPROVAL-API.md](./SHARE-APPROVAL-API.md))

---

## Project statuses

| Status | Meaning |
|--------|---------|
| `draft` | Being edited by freelancer |
| `sent` | Sent to client, awaiting approval |
| `approved` | Client approved scope |
| `in-progress` | Work started |
| `completed` | Done |
| `cancelled` | Cancelled |

---

## List projects

**Purpose:** Get all projects owned by the freelancer (with scope included).

```http
GET /projects
```

**Response:**

```json
{
  "success": true,
  "message": "Projects retrieved",
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "E-commerce Store",
        "title": "E-commerce Store",
        "description": "Online clothing store",
        "client_id": null,
        "clientId": null,
        "owner_id": 2,
        "ownerId": 2,
        "approved_at": null,
        "approvedAt": null,
        "share_link": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "shareLink": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "status": "draft",
        "client": null,
        "scopeSections": [],
        "project_approval": null,
        "projectApproval": null,
        "created_at": "2026-07-19T10:00:00.000000Z",
        "createdAt": "2026-07-19T10:00:00.000000Z",
        "updated_at": "2026-07-19T10:00:00.000000Z",
        "updatedAt": "2026-07-19T10:00:00.000000Z"
      }
    ]
  }
}
```

---

## Create project

**Purpose:** Create a new draft project. `share_link` is auto-generated.

```http
POST /projects
```

**Body:**

```json
{
  "title": "E-commerce Store",
  "description": "Online clothing store"
}
```

| Field | Rules |
|-------|-------|
| title | Required, 3–255 chars |
| description | Optional, max 5000 chars |

**Response (201):**

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": 1,
      "name": "E-commerce Store",
      "title": "E-commerce Store",
      "description": "Online clothing store",
      "client_id": null,
      "status": "draft",
      "share_link": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "shareLink": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "scopeSections": []
    }
  }
}
```

---

## Get project

**Purpose:** Retrieve one project with full scope.

```http
GET /projects/{id}
```

**Response:** Same project shape as create, with populated `scopeSections`.

---

## Update project

**Purpose:** Edit title, description, or status. **Blocked if project is already approved.**

```http
PUT /projects/{id}
PATCH /projects/{id}
```

**Body:**

```json
{
  "title": "Updated Store Name",
  "description": "Updated description",
  "status": "in-progress"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "id": 1,
      "title": "Updated Store Name",
      "status": "in-progress"
    }
  }
}
```

**Error (422):** `"Approved projects cannot be edited"`

---

## Delete project

**Purpose:** Permanently delete a project and all related data.

```http
DELETE /projects/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": null
}
```

---

## Send to client

**Purpose:** Mark project as `sent` and open it for client approval. Only works from `draft` status.

```http
POST /projects/{id}/send
```

**Body:** None

**Response:**

```json
{
  "success": true,
  "message": "Project sent to client",
  "data": {
    "project": {
      "id": 1,
      "status": "sent",
      "share_link": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "shareLink": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "project_approval": {
        "id": 1,
        "project_id": 1,
        "projectId": 1,
        "client_id": null,
        "clientId": null,
        "comment": null,
        "status": "pending",
        "client": null
      }
    }
  }
}
```

Share the `shareLink` value with the client. Frontend URL example:

```text
https://yourapp.com/share/{shareLink}
```

**Error (422):** `"Only draft projects can be sent to the client"`

---

## Get project approval (freelancer)

**Purpose:** View approval status for a sent/approved/rejected project.

```http
GET /projects/{id}/project-approval
```

**Response:**

```json
{
  "success": true,
  "message": "Project approval retrieved",
  "data": {
    "project_approval": {
      "id": 1,
      "project_id": 1,
      "projectId": 1,
      "client_id": 3,
      "clientId": 3,
      "comment": "Looks good",
      "status": "approved",
      "client": {
        "id": 3,
        "name": "Sara Client",
        "email": "sara@example.com"
      },
      "created_at": "2026-07-19T11:00:00.000000Z",
      "updated_at": "2026-07-19T12:00:00.000000Z"
    }
  }
}
```

**Error (404):** Project was never sent (no approval record).

---

## Scope shape (nested in project)

Sections and items are included on project responses:

```json
"scopeSections": [
  {
    "id": 1,
    "project_id": 1,
    "projectId": 1,
    "title": "Features",
    "position": 0,
    "items": [
      {
        "id": 1,
        "section_id": 1,
        "sectionId": 1,
        "title": "User Auth",
        "description": "Login and register",
        "status": "included",
        "status_value": "included",
        "position": 0
      }
    ]
  }
]
```

Item `status` values for UI: `included`, `excluded`, `pending` (`pending` = needs review).

See [SCOPE-API.md](./SCOPE-API.md) for CRUD on sections/items.
