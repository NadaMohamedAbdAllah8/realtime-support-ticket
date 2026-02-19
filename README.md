# Realtime Support Ticket (Laravel + React)

Full-stack support ticket system with:

- Laravel 12 API (`app`)
- Laravel Reverb websocket server (`reverb`)
- React + Vite frontend (`frontend/real-time-support-tickets`)

## Docker Quick Start

1. Make sure Docker Desktop is running.
2. Ensure backend env exists:

```bash
cp .env.example .env
```

3. Ensure Docker secrets/config env exists (`.env.docker`):

```env
REVERB_APP_ID=955925
REVERB_APP_KEY=your_reverb_key
REVERB_APP_SECRET=your_reverb_secret
VITE_REVERB_APP_KEY=your_reverb_key
```

4. Start all services:

```bash
docker compose up -d --build
```

5. Open services:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8081`
- Reverb WS server: `http://localhost:8080`

6. Stop services:

```bash
docker compose down
```

## Frontend Pages

The React app is in `frontend/real-time-support-tickets` and has 3 main views:

1. Support Ticket Form
- Public page for customers.
- Submits `POST /api/support-tickets`.
- Shows validation and success/error messages.

2. Admin Login
- Authenticates admin with `POST /api/login`.
- Stores token and admin name in `localStorage`.

3. Admin Tickets Dashboard
- Loads tickets from `GET /api/admin/support-tickets`.
- Shows table, pagination, refresh, and logout.
- Requires valid Sanctum bearer token.

## Realtime Notifications

Realtime notifications are shown inside the Admin Tickets Dashboard:

- Frontend subscribes to private channel `admin.inbox` using Laravel Echo + Reverb.
- Backend broadcasts `.ticket.created` when a new ticket is created.
- On each event, frontend shows an in-app toast: `New Ticket #<id> <subject>`.
- On each event, frontend refreshes the ticket list automatically.

Required frontend env (in `frontend/real-time-support-tickets/.env`):

```env
VITE_API_BASE_URL=http://localhost:8081/api
VITE_REVERB_APP_KEY=khwnctapwmj3sqtqlmu8
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

## Authentication

Admin-only endpoints use Sanctum bearer tokens.

Auth header format:

```http
Authorization: Bearer <token>
```

Seeded admin credentials (from `database/seeders/AdminSeeder.php`):

- Email: `admin@realtimesupportticket.test`
- Password: `admin123`

## API Endpoints

Base URL example: `http://127.0.0.1:8081`

All routes below are prefixed with `/api`.

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
- Optional query param: `per_page`

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
## Non-Docker Local Run (optional)

```bash
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8081
php artisan reverb:start --host=127.0.0.1 --port=8080 --debug
cd frontend/real-time-support-tickets
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
