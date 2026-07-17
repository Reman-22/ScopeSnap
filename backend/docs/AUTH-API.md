# Auth API (React)

**Base URL:** `http://127.0.0.1:8000/api`

**Start backend:**

```bash
cd backend && php artisan serve
```

---

## Response

All API responses follow this general structure:

### Success Response

```json
{
  "success": true,
  "message": "...",
  "data": {
    "...": "..."
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "...",
  "errors": {
    "...": [
      "..."
    ]
  }
}
```

---

## Endpoints

| Method | URL              | Auth | Notes                    |
| ------ | ---------------- | ---- | ------------------------ |
| POST   | `/auth/register` | No   | Returns `user` + `token` |
| POST   | `/auth/login`    | No   | Returns `user` + `token` |
| GET    | `/auth/me`       | Yes  | Current user             |
| POST   | `/auth/profile`  | Yes  | Update profile           |
| POST   | `/auth/logout`   | Yes  | Invalidates token        |

---

## Auth Header

Protected routes require the following headers:

```http
Authorization: Bearer {token}
Accept: application/json
```

---

# Register

### Endpoint

```http
POST /auth/register
```

### Request Body

```json
{
  "name": "Ahmed Dev",
  "email": "ahmed@example.com",
  "password": "Password1",
  "role": "freelancer"
}
```

### Fields

| Field    | Rules                                                                   |
| -------- | ----------------------------------------------------------------------- |
| name     | Required, 3–100 characters                                              |
| email    | Required, valid email, unique                                           |
| password | Required, 8–64 characters, must contain uppercase and lowercase letters |
| role     | Required: `"freelancer"` or `"client"`                                  |
| phone    | Optional                                                                |
| img      | Optional, image only                                                    |

### Successful Response

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmed Dev",
      "email": "ahmed@example.com",
      "role": "freelancer",
      "role_label": "Freelancer"
    },
    "token": "1|xxxxxxxxxxxxxxxx"
  }
}
```

---

# Login

### Endpoint

```http
POST /auth/login
```

### Request Body

Only `email` and `password` are required:

```json
{
  "email": "ahmed@example.com",
  "password": "Password1"
}
```

### Successful Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmed Dev",
      "email": "ahmed@example.com",
      "role": "freelancer",
      "role_label": "Freelancer"
    },
    "token": "1|xxxxxxxxxxxxxxxx"
  }
}
```

---

# User Role

The user's role is returned as a string:

```json
{
  "role": "freelancer"
}
```

or:

```json
{
  "role": "client"
}
```

Possible values:

```text
"freelancer"
"client"
```

The API may also return:

```json
{
  "role_label": "Freelancer"
}
```

### React Example

```ts
if (user.role === "freelancer") {
  // Freelancer UI
}

if (user.role === "client") {
  // Client UI
}
```

---

# Get Current User

### Endpoint

```http
GET /auth/me
```

### Auth

Yes.

### Headers

```http
Authorization: Bearer {token}
Accept: application/json
```

### Successful Response

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "Ahmed Dev",
    "email": "ahmed@example.com",
    "role": "freelancer",
    "role_label": "Freelancer",
    "phone": null,
    "img": null
  }
}
```

---

# Update Profile

### Endpoint

```http
POST /auth/profile
```

### Auth

Yes.

### Content Type

Because the profile may contain an image, use:

```http
Content-Type: multipart/form-data
```

### Headers

```http
Authorization: Bearer {token}
Accept: application/json
```

### Fields

| Field | Rules                      |
| ----- | -------------------------- |
| name  | Optional, 3–100 characters |
| phone | Optional                   |
| img   | Optional, image only       |

### React Example

```ts
const formData = new FormData();

formData.append("name", name);
formData.append("phone", phone);

if (image) {
  formData.append("img", image);
}

await fetch(`${API}/auth/profile`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

⚠️ When using `FormData`, do not manually add:

```ts
"Content-Type": "application/json"
```

The browser will automatically set the correct `multipart/form-data` content type with its boundary.

---

# Logout

### Endpoint

```http
POST /auth/logout
```

### Auth

Yes.

### Headers

```http
Authorization: Bearer {token}
Accept: application/json
```

### Successful Response

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### React Example

```ts
const token = localStorage.getItem("token");

await fetch(`${API}/auth/logout`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
});

localStorage.removeItem("token");
localStorage.removeItem("user");
```

---

# Error Responses

## Validation Error

Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": [
      "The email field is required."
    ],
    "password": [
      "The password must be at least 8 characters."
    ]
  }
}
```

The frontend should use the `errors` object to display field-specific validation errors.

---

## Invalid Credentials

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Unauthorized Request

If the token is missing, invalid, or expired:

```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

The React application should remove the stored token and redirect the user to the login page.

---

# React Usage

```ts
const API = "http://127.0.0.1:8000/api";
```

---

## Login

```ts
const res = await fetch(`${API}/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    email,
    password,
  }),
});

const json = await res.json();

if (json.success) {
  localStorage.setItem("token", json.data.token);
  localStorage.setItem("user", JSON.stringify(json.data.user));
}
```

---

## Register

```ts
const res = await fetch(`${API}/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    name,
    email,
    password,
    role,
  }),
});

const json = await res.json();

if (json.success) {
  localStorage.setItem("token", json.data.token);
  localStorage.setItem("user", JSON.stringify(json.data.user));
}
```

---

## Authenticated Request

```ts
await fetch(`${API}/auth/me`, {
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
```

---

## Example: Get Current User

```ts
const token = localStorage.getItem("token");

const res = await fetch(`${API}/auth/me`, {
  method: "GET",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
});

const json = await res.json();

if (json.success) {
  const user = json.data;
  console.log(user);
}
```

---

# Postman

Import the following collection:

```text
backend/docs/ScopeSnap-Auth.postman_collection.json
```

After **Register** or **Login**, the token is saved automatically to the collection variable:

```text
token
```

The token can then be automatically used for protected requests such as:

```text
GET /auth/me
POST /auth/profile
POST /auth/logout
```

---

# Authentication Flow

The expected authentication flow is:

```text
1. User registers or logs in
        ↓
2. Backend returns user + token
        ↓
3. React stores the token
        ↓
4. React sends the token with protected requests
        ↓
5. Backend authenticates the user
        ↓
6. User can access protected resources
```

Example:

```text
Register / Login
        ↓
Receive Token
        ↓
Save Token in localStorage
        ↓
Authorization: Bearer {token}
        ↓
Access Protected API
```
