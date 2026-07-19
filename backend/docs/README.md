# ScopeSnap API Documentation

Documentation for the React frontend team. All endpoints live under:

```text
http://127.0.0.1:8000/api
```

Start the backend:

```bash
cd backend && php artisan serve
```

## Files

| File | Description |
|------|-------------|
| [OVERVIEW.md](./OVERVIEW.md) | Response format, auth headers, roles, errors |
| [AUTH-API.md](./AUTH-API.md) | Register, login, profile, logout |
| [CLIENTS-API.md](./CLIENTS-API.md) | Freelancer client contacts (CRUD) |
| [PROJECTS-API.md](./PROJECTS-API.md) | Freelancer project management |
| [SHARE-APPROVAL-API.md](./SHARE-APPROVAL-API.md) | Share link view, client approve/reject |
| [SCOPE-API.md](./SCOPE-API.md) | Scope sections and items |
| [CHANGE-REQUESTS-API.md](./CHANGE-REQUESTS-API.md) | Change requests (client create, freelancer review) |
| [ACTIVITY-LOGS-API.md](./ACTIVITY-LOGS-API.md) | Project activity timeline |

## Postman

Import the full collection:

```text
backend/docs/ScopeSnap-API.postman_collection.json
```

Collection variables (auto-set where noted):

| Variable | Purpose |
|----------|---------|
| `base_url` | API root (`http://127.0.0.1:8000/api`) |
| `token` | Sanctum token (set after login/register) |
| `project_id` | Last created project |
| `section_id` | Last created section |
| `item_id` | Last created scope item |
| `change_request_id` | Last created change request |
| `share_link` | Project share token |
| `client_id` | Last created client contact |

## Quick role guide

| Role | Value in API | Middleware |
|------|--------------|------------|
| Client | `role: false` or `"client"` on register | `client` routes |
| Freelancer | `role: true` or `"freelancer"` on register | `freelancer` routes |

Use `role_label` (`"client"` / `"freelancer"`) for UI routing.
