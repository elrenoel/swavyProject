# Backend PHP (Native)

This folder is a native PHP 8.2 API replacement for the old Express backend.

## Run

1. Copy env:
   - `cp .env.example .env` (or copy manually on Windows)
2. Fill Supabase + Spotify credentials.
   - Recommended for DB: set `SUPABASE_DB_URL` from Supabase connection string.
   - Alternative: fill `SUPABASE_DB_HOST`, `SUPABASE_DB_PORT`, `SUPABASE_DB_NAME`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`.
3. Start server from this folder:
   - `php -S localhost:8000 -t public`

## API Base

- Base URL: `http://localhost:8000/api`
- CORS allows `FRONTEND_URL` plus `http://localhost:5173` and `http://127.0.0.1:5173`

## Notes

- Native PHP only (no Laravel/Symfony/CodeIgniter)
- Uses PDO (PostgreSQL) for app tables
- Uses Supabase Auth REST API for auth/session endpoints
- Uses Spotify Web API with server-side client credentials
