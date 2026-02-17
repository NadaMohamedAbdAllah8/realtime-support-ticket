# Realtime Support Ticket API

Laravel 12 backend for creating support tickets and notifying admins in real time using Reverb.

## Base URL

- Local example: `http://127.0.0.1:8081`
- All API routes below are prefixed with: `/api`

## Authentication

Admin-only endpoints use Sanctum bearer tokens.

Auth header format:

```http
Authorization: Bearer <token>
```

Seeded admin credentials (from `database/seeders/AdminSeeder.php`):

- Email: `admin@realtimesupportticket.test`
- Password: `admin123`

## Available Endpoints

### 1. Login (Admin)

- Method: `POST`
- URL: `/api/login`
- Auth required: `No`

Request body:

```json
{
  "email": "admin@realtimesupportticket.test",
  "password": "admin123"
}
```

cURL:

```bash
curl -X POST "http://127.0.0.1:8081/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@realtimesupportticket.test",
    "password": "admin123"
  }'
```

Success response example:

```json
{
  "success": true,
  "message": "Login successful",
  "item": {
    "token": "1|exampleToken...",
    "token_type": "Bearer",
    "admin": {
      "id": 1,
      "name": "System Admin",
      "email": "admin@realtimesupportticket.test"
    }
  }
}
```

### 2. Create Support Ticket

- Method: `POST`
- URL: `/api/support-tickets`
- Auth required: `No`

Request body:

```json
{
  "customer_name": "John Doe",
  "subject": "Payment issue",
  "message": "I was charged twice on checkout."
}
```

cURL:

```bash
curl -X POST "http://127.0.0.1:8081/api/support-tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "subject": "Payment issue",
    "message": "I was charged twice on checkout."
  }'
```

Success response example:

```json
{
  "success": true,
  "message": "Support ticket submitted successfully",
  "item": {
    "id": 1,
    "customer_name": "John Doe",
    "subject": "Payment issue",
    "message": "I was charged twice on checkout.",
    "status": "new",
    "assigned_admin_id": null,
    "admin_response": null,
    "created_at": "2026-02-17T10:00:00.000000Z",
    "updated_at": "2026-02-17T10:00:00.000000Z"
  }
}
```

Validation errors return HTTP `422`.

### 3. List Support Tickets (Admin)

- Method: `GET`
- URL: `/api/admin/support-tickets`
- Auth required: `Yes (Bearer token)`

Optional query params:

- `per_page` (integer)

cURL:

```bash
curl -X GET "http://127.0.0.1:8081/api/admin/support-tickets?per_page=10" \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json"
```

Success response example (Laravel paginator):

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "customer_name": "John Doe",
      "subject": "Payment issue",
      "message": "I was charged twice on checkout.",
      "status": "new",
      "assigned_admin_id": null,
      "admin_response": null,
      "created_at": "2026-02-17T10:00:00.000000Z",
      "updated_at": "2026-02-17T10:00:00.000000Z"
    }
  ],
  "first_page_url": "http://127.0.0.1:8081/api/admin/support-tickets?page=1",
  "from": 1,
  "last_page": 1,
  "last_page_url": "http://127.0.0.1:8081/api/admin/support-tickets?page=1",
  "links": [],
  "next_page_url": null,
  "path": "http://127.0.0.1:8081/api/admin/support-tickets",
  "per_page": 10,
  "prev_page_url": null,
  "to": 1,
  "total": 1
}
```

## Realtime Behavior

When a support ticket is created (`POST /api/support-tickets`), backend dispatches `TicketCreated` and broadcasts it to private channel `admin.inbox`.

Only authenticated admins can subscribe to this private channel.

## Quick Local Run

```bash
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8081
php artisan reverb:start --host=127.0.0.1 --port=8080 --debug
npm.cmd run dev
```
