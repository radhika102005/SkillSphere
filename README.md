# SkillSphere

Peer-to-peer skill exchange and mentorship platform for students.

- **frontend/** — React 18 + Vite + Tailwind (port 5173)
- **backend/** — Express + MongoDB/Mongoose + JWT (port 5000)

## Features

- Sign up / log in (JWT), editable profile with skills offered and skills wanted
- Explore and search students by skill, name or university
- Mentorship requests: send, accept / decline, mark complete (earns points)
- Direct messaging with unread counts
- Reviews and ratings (only after a completed session together)
- Learning resource library with likes
- Dashboard with stats and peer recommendations (skill-swap matching)
- AI assistant powered by Google Gemini (optional)

## Run locally

Requirements: Node 18+ and MongoDB (local, or an Atlas connection string).

```bash
# 1. Backend
cd backend
npm install
npm run seed      # optional: demo users (password: password123) and resources
npm run dev       # http://localhost:5000/api/health

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Demo logins after seeding: `aarav@demo.com`, `meera@demo.com`, `rohan@demo.com`, `sneha@demo.com` — all with `password123`.

## Configuration (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string — change before deploying |
| `JWT_EXPIRE` | Token lifetime, e.g. `7d` |
| `GEMINI_API_KEY` | Enables the AI assistant (get one at aistudio.google.com) |
| `GEMINI_MODEL` | Optional, defaults to `gemini-2.0-flash` |
| `CLIENT_URL` | Frontend origin for CORS |

Without `GEMINI_API_KEY` everything else works; the assistant replies with a setup hint.

## API overview

| Route | Description |
| --- | --- |
| `POST /api/auth/register`, `/login`, `GET /me` | Authentication |
| `GET /api/users`, `/users/:id`, `/users/me/stats`, `PUT /users/me` | Profiles and search |
| `POST /api/mentorship`, `GET /mentorship`, `PUT /mentorship/:id` | Session requests |
| `GET /api/messages/conversations`, `GET /messages/:userId`, `POST /messages` | Chat |
| `POST /api/reviews`, `GET /reviews/user/:id` | Ratings |
| `GET/POST /api/learning`, `PUT /learning/:id/like`, `DELETE /learning/:id` | Resources |
| `POST /api/ai/chat`, `GET /ai/recommendations` | AI and matching |

## Notes

- Messages refresh by polling every 5 seconds. Swap in Socket.IO if you need true real-time.
- `.env` is git-ignored; commit `.env.example` only.
