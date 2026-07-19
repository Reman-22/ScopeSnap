# Clients API

Freelancer-only contact list. These are **CRM contacts**, not login accounts. A contact gets linked to a user account when that client approves a project share link.

**Auth:** Bearer token + freelancer role

---

## List clients

**Purpose:** Get all contacts owned by the logged-in freelancer.

```http
GET /clients
```

**Response:**

```json
{
  "success": true,
  "message": "Clients retrieved",
  "data": {
    "clients": [
      {
        "id": 1,
        "owner_id": 2,
        "user_id": null,
        "name": "Sara Client",
        "email": "sara@example.com",
        "phone": "0501234567",
        "company": "Acme Co",
        "created_at": "2026-07-19T10:00:00.000000Z",
        "updated_at": "2026-07-19T10:00:00.000000Z"
      }
    ]
  }
}
```

`user_id` is set after the client registers and approves a project.

---

## Create client

**Purpose:** Add a new contact to the freelancer's list.

```http
POST /clients
```

**Body:**

```json
{
  "name": "Sara Client",
  "email": "sara@example.com",
  "phone": "0501234567",
  "company": "Acme Co"
}
```

| Field | Rules |
|-------|-------|
| name | Required, 3–100 chars |
| email | Required, unique per freelancer |
| phone | Optional |
| company | Optional |

**Response (201):**

```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client": {
      "id": 1,
      "owner_id": 2,
      "user_id": null,
      "name": "Sara Client",
      "email": "sara@example.com",
      "phone": "0501234567",
      "company": "Acme Co",
      "created_at": "2026-07-19T10:00:00.000000Z",
      "updated_at": "2026-07-19T10:00:00.000000Z"
    }
  }
}
```

---

## Get client

**Purpose:** Retrieve one contact by ID.

```http
GET /clients/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Client retrieved",
  "data": {
    "client": {
      "id": 1,
      "owner_id": 2,
      "user_id": 5,
      "name": "Sara Client",
      "email": "sara@example.com",
      "phone": "0501234567",
      "company": "Acme Co",
      "created_at": "2026-07-19T10:00:00.000000Z",
      "updated_at": "2026-07-19T12:00:00.000000Z"
    }
  }
}
```

---

## Update client

**Purpose:** Edit contact details.

```http
PUT /clients/{id}
PATCH /clients/{id}
```

**Body (partial allowed with PATCH):**

```json
{
  "name": "Sara Updated",
  "email": "sara.new@example.com",
  "phone": "0509999999",
  "company": "New Co"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "client": {
      "id": 1,
      "name": "Sara Updated",
      "email": "sara.new@example.com"
    }
  }
}
```

---

## Delete client

**Purpose:** Remove a contact.

```http
DELETE /clients/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Client deleted successfully",
  "data": null
}
```
