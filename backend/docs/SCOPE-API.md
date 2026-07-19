# Scope API

Freelancer manages scope sections and items inside a project. **Blocked when project is approved.**

**Auth:** Bearer token + freelancer role

Base path:

```text
/projects/{project_id}/sections
/projects/{project_id}/sections/{section_id}/items
```

---

## List sections

**Purpose:** Get all sections (with items) for a project.

```http
GET /projects/{project_id}/sections
```

**Response:**

```json
{
  "success": true,
  "message": "Scope sections retrieved",
  "data": {
    "sections": [
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
            "position": 0,
            "created_at": "2026-07-19T10:00:00.000000Z",
            "updated_at": "2026-07-19T10:00:00.000000Z"
          }
        ],
        "created_at": "2026-07-19T10:00:00.000000Z",
        "updated_at": "2026-07-19T10:00:00.000000Z"
      }
    ]
  }
}
```

---

## Create section

**Purpose:** Add a scope section to a project.

```http
POST /projects/{project_id}/sections
```

**Body:**

```json
{
  "title": "Features",
  "position": 0
}
```

| Field | Rules |
|-------|-------|
| title | Required, 3–255 chars |
| position | Optional integer; auto-assigned if omitted |

**Response (201):**

```json
{
  "success": true,
  "message": "Scope section created successfully",
  "data": {
    "section": {
      "id": 1,
      "project_id": 1,
      "title": "Features",
      "position": 0,
      "items": []
    }
  }
}
```

---

## Get section

**Purpose:** Retrieve one section with its items.

```http
GET /projects/{project_id}/sections/{section_id}
```

---

## Update section

**Purpose:** Change section title or sort order.

```http
PUT /projects/{project_id}/sections/{section_id}
PATCH /projects/{project_id}/sections/{section_id}
```

**Body:**

```json
{
  "title": "Core Features",
  "position": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Scope section updated successfully",
  "data": {
    "section": {
      "id": 1,
      "title": "Core Features",
      "position": 1
    }
  }
}
```

---

## Delete section

**Purpose:** Remove a section and all its items.

```http
DELETE /projects/{project_id}/sections/{section_id}
```

**Response:**

```json
{
  "success": true,
  "message": "Scope section deleted successfully",
  "data": null
}
```

---

## List items

**Purpose:** Get items in a section.

```http
GET /projects/{project_id}/sections/{section_id}/items
```

**Response:**

```json
{
  "success": true,
  "message": "Scope items retrieved",
  "data": {
    "items": [
      {
        "id": 1,
        "section_id": 1,
        "title": "User Auth",
        "description": "Login and register",
        "status": "included",
        "status_value": "included",
        "position": 0
      }
    ]
  }
}
```

---

## Create item

**Purpose:** Add a line item to a section.

```http
POST /projects/{project_id}/sections/{section_id}/items
```

**Body:**

```json
{
  "title": "User Auth",
  "description": "Login and register",
  "status": "included",
  "position": 0
}
```

| Field | Rules |
|-------|-------|
| title | Required, 3–255 chars |
| description | Optional |
| status | Optional: `included`, `excluded`, `needs_review`, or `pending` (alias for needs_review). Default: `included` |
| position | Optional integer |

**Response (201):**

```json
{
  "success": true,
  "message": "Scope item created successfully",
  "data": {
    "item": {
      "id": 1,
      "section_id": 1,
      "title": "User Auth",
      "description": "Login and register",
      "status": "included",
      "status_value": "included",
      "position": 0
    }
  }
}
```

---

## Get item

**Purpose:** Retrieve one scope item.

```http
GET /projects/{project_id}/sections/{section_id}/items/{item_id}
```

---

## Update item

**Purpose:** Edit item title, description, status, or position.

```http
PUT /projects/{project_id}/sections/{section_id}/items/{item_id}
PATCH /projects/{project_id}/sections/{section_id}/items/{item_id}
```

**Body:**

```json
{
  "title": "User Authentication",
  "description": "Login, register, password reset",
  "status": "pending",
  "position": 1
}
```

---

## Delete item

**Purpose:** Remove a scope item.

```http
DELETE /projects/{project_id}/sections/{section_id}/items/{item_id}
```

**Response:**

```json
{
  "success": true,
  "message": "Scope item deleted successfully",
  "data": null
}
```

---

## Edit restrictions

All create/update/delete scope endpoints return **422** if the project is approved:

```json
{
  "success": false,
  "message": "Approved projects cannot be edited"
}
```

After approval, scope changes go through [change requests](./CHANGE-REQUESTS-API.md).
