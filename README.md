# Novel Tracking Website

A modern reading tracker built with a React + Vite frontend and a Node.js + Express + SQLite backend.

## Overview

This app helps readers track what they’re reading, keep goals, log sessions, and review reading trends with a polished dashboard.

## Project structure

- frontend/: React + Vite client that renders the reading tracker UI
- backend/: Express REST API with SQLite database and authentication middleware
- backend/src/db.js: SQLite setup and demo data
- backend/routes/: API route modules for auth, novels, sessions, goals, notes, and statistics

## Tech stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts, Lucide React
- Backend: Node.js, Express, SQLite, JWT, bcryptjs

## Quick start

### 1. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Configure environment

Copy the example backend environment file:

```bash
cd backend
copy .env.example .env
```

If you are using PowerShell, this is equivalent:

```powershell
Copy-Item .env.example .env
```

### 3. Run the backend

```bash
cd backend
npm install
npm run dev
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:5173 and the API runs at http://localhost:5000.

## API endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/novels
- POST /api/novels
- GET /api/novels/:id
- PUT /api/novels/:id
- DELETE /api/novels/:id
- GET /api/sessions
- POST /api/sessions
- PUT /api/sessions/:id
- DELETE /api/sessions/:id
- GET /api/goals
- POST /api/goals
- PUT /api/goals/:id
- DELETE /api/goals/:id
- GET /api/notes
- POST /api/notes
- PUT /api/notes/:id
- DELETE /api/notes/:id
- GET /api/statistics

## Demo credentials

- Email: demo@reader.app
- Password: password123

## Future improvements

- Better form validation and user-specific theme preferences
- More advanced recommendations and CSV export
- Pagination and search refinements
- Editable forms for notes and goals
- Full implementation for reading streak calculations and book cover uploads
