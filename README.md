# Swavy Web App

## Overview

Swavy is a music discovery and list-curation web app. The frontend is built
with React + Vite, and the backend is an Express API that uses Supabase for
auth and data storage. The app supports login, profile, lists, community,
and Spotify search integration.

## Tech Stack

Frontend

- React
- Vite
- React Router
- Tailwind CSS (utility classes)

Backend

- Node.js + Express
- Supabase (auth + database)
- Cookie-based sessions
- Spotify Web API

## Folder Structure

Frontend

- public/ Static assets
- src/
  - assets/ Images and global styles
  - components/ UI components
  - context/ React Context providers
  - pages/ Route pages
  - services/ API clients
  - App.jsx Root component
  - main.jsx Entry point

Backend

- server/
  - index.js Express app entry
  - src/
    - config/ Supabase and CORS config
    - controllers/ Route controllers
    - middlewares/ Express middleware
    - routes/ API routes
    - services/ Service layer

## Environment Variables

Create a file at server/.env with the following values:

PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

Notes:

- Do not commit real secrets to Git.
- If you already have a .env in your machine, keep it local.

## How To Run

1. Install dependencies

Frontend:
cd .
npm install

Backend:
cd server
npm install

2. Start the apps (two terminals)

Backend:
cd server
npm run dev

Frontend:
cd .
npm run dev

Default ports

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Common Scripts

Frontend

- npm run dev Start Vite dev server
- npm run build Build for production

Backend

- npm run dev Start Express with nodemon

## API Base URL

The frontend expects the backend at:
http://localhost:5000/api
