# Activity Logs API

Project timeline / audit trail. Every major action is logged automatically.

**Auth:** Bearer token — project owner (freelancer) or linked client

---

## List activity logs

**Purpose:** Get chronological activity for a project.

```http
GET /projects/{project_id}/activity-logs
```

**Response:**

```json
{
  "success": true,
  "message": "Activity logs retrieved",
  "data": {
    "activity_logs": [
      {
        "id": 5,
        "project_id": 1,
        "projectId": 1,
        "user_id": 3,
        "userId": 3,
        "description": "Change request \"Add blog\" was created",
        "action": "change_request_created",
        "type": "change_requested",
        "user": {
          "id": 3,
          "name": "Sara Client",
          "email": "sara@example.com"
        },
        "timestamp": "2026-07-19T14:00:00.000000Z",
        "created_at": "2026-07-19T14:00:00.000000Z",
        "createdAt": "2026-07-19T14:00:00.000000Z"
      },
      {
        "id": 4,
        "project_id": 1,
        "user_id": 3,
        "description": "Client \"Sara Client\" approved the project scope",
        "action": "scope_approved",
        "type": "scope_approved",
        "user": {
          "id": 3,
          "name": "Sara Client",
          "email": "sara@example.com"
        },
        "timestamp": "2026-07-19T12:00:00.000000Z"
      },
      {
        "id": 3,
        "project_id": 1,
        "user_id": 2,
        "description": "Project \"E-commerce Store\" was sent to the client for approval",
        "action": "scope_sent",
        "type": "scope_sent",
        "user": {
          "id": 2,
          "name": "Ahmed Dev",
          "email": "ahmed@example.com"
        },
        "timestamp": "2026-07-19T11:00:00.000000Z"
      },
      {
        "id": 1,
        "project_id": 1,
        "user_id": 2,
        "description": "Project \"E-commerce Store\" was created",
        "action": "project_created",
        "type": "project_created",
        "user": {
          "id": 2,
          "name": "Ahmed Dev",
          "email": "ahmed@example.com"
        },
        "timestamp": "2026-07-19T10:00:00.000000Z"
      }
    ]
  }
}
```

Use the `type` field for frontend icons/labels (maps change-request actions to React-friendly names).

---

## Logged action types

| `action` | `type` (for UI) | Triggered by |
|----------|-----------------|--------------|
| `project_created` | `project_created` | Create project |
| `project_updated` | `project_updated` | Update project |
| `scope_sent` | `scope_sent` | Send to client |
| `section_added` | `section_added` | Create section |
| `section_updated` | `section_updated` | Update section |
| `section_deleted` | `section_deleted` | Delete section |
| `item_added` | `item_added` | Create scope item |
| `item_updated` | `item_updated` | Update scope item |
| `item_deleted` | `item_deleted` | Delete scope item |
| `scope_approved` | `scope_approved` | Client approves share link |
| `scope_rejected` | `scope_rejected` | Client rejects share link |
| `change_request_created` | `change_requested` | Client creates CR |
| `change_request_approved` | `change_accepted` | Freelancer accepts CR |
| `change_request_rejected` | `change_rejected` | Freelancer rejects CR |
| `change_request_deleted` | `change_request_deleted` | Delete pending CR |

Logs are returned **newest first** (`latest()`).

---

## Access rules

| User | Access |
|------|--------|
| Freelancer who owns the project | Yes |
| Linked client (`projects.client_id` matches their client record) | Yes |
| Other users | 403 |

**Note:** Before approval, only the freelancer can see logs (client is not linked yet).
