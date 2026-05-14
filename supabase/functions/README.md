# Edge Functions — Setup & Usage

## Required env vars (set in Supabase Dashboard → Settings → Edge Functions)

SUPABASE_URL       ← auto-injected by Supabase runtime (no action needed)
SUPABASE_ANON_KEY  ← auto-injected by Supabase runtime (no action needed)

No extra secrets needed. Both functions use the caller's JWT + the anon key,
which is the standard pattern for user-scoped Edge Functions.

---

## Deploy

```bash
npx supabase functions deploy save-billing
npx supabase functions deploy handle-signup-metadata
```

Or via the Supabase Dashboard → Edge Functions → "Deploy new function".

---

## Frontend env vars (in .env.local)

VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

These are already needed for the Supabase client — no new vars required.

---

## save-billing

### Request

POST /functions/v1/save-billing
Authorization: Bearer <user_jwt>
Content-Type: application/json

```json
{
  "full_name": "Ada Okafor",
  "email":     "ada@example.com",
  "phone":     "+234 906 930 3261",
  "address":   "19 Ekeninwor Road",
  "city":      "Port Harcourt",
  "state":     "Rivers",
  "country":   "Nigeria"
}
```

`user_id` must NOT be sent — the server always reads it from the JWT.

### Success response (200)

```json
{
  "data": {
    "id":         "uuid",
    "user_id":    "uuid",
    "full_name":  "Ada Okafor",
    "email":      "ada@example.com",
    "phone":      "+234 906 930 3261",
    "address":    "19 Ekeninwor Road",
    "city":       "Port Harcourt",
    "state":      "Rivers",
    "country":    "Nigeria",
    "updated_at": "2026-05-14T10:00:00Z"
  }
}
```

### Error responses

| Status | Body                                         |
|--------|----------------------------------------------|
| 400    | `{ "error": "full_name is required" }`       |
| 400    | `{ "error": "email format is invalid" }`     |
| 401    | `{ "error": "Missing Authorization header"}` |
| 401    | `{ "error": "Unauthorized" }`                |
| 500    | `{ "error": "Internal server error" }`       |

---

## handle-signup-metadata

### Request

POST /functions/v1/handle-signup-metadata
Authorization: Bearer <user_jwt>
Content-Type: application/json

```json
{ "full_name": "Ada Okafor" }
```

Omit `full_name` for Google OAuth — the server derives it from existing metadata.

### Success response (200)

```json
{
  "success":   true,
  "user_id":   "uuid",
  "full_name": "Ada Okafor"
}
```

### Error responses

| Status | Body                                    |
|--------|-----------------------------------------|
| 400    | `{ "error": "full_name is required" }`  |
| 401    | `{ "error": "Unauthorized" }`           |
| 500    | `{ "error": "Internal server error" }`  |

---

## RLS summary (billing_info)

| Operation | Customer policy              | Admin policy         |
|-----------|------------------------------|----------------------|
| SELECT    | `user_id = auth.uid()`       | `is_admin()`         |
| INSERT    | `WITH CHECK user_id = uid()` | —                    |
| UPDATE    | `USING + WITH CHECK uid()`   | `USING + CHECK admin`|
| DELETE    | **none** (blocked)           | **none** (blocked)   |

Upsert works because Postgres evaluates INSERT WITH CHECK on new rows and
UPDATE USING+WITH CHECK on conflict rows — both are satisfied when
`user_id` comes from the JWT (which the Edge Function enforces).
