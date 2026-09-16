# Perplexity Clone

A MERN-stack AI chat application with real-time messaging and pluggable AI providers (Gemini, Mistral) via LangChain.

## Tech Stack

**Backend** — Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT auth, LangChain (`@langchain/google-genai`, `@langchain/mistralai`)

**Frontend** — React 19, Redux Toolkit, React Router, Tailwind CSS, Vite, Socket.IO client

## Project Structure

```
.
├── backend/
│   └── src/
│       ├── config/         # DB connection
│       ├── controllers/    # auth, chat
│       ├── middleware/     # auth middleware
│       ├── models/         # user, chat, message
│       ├── routes/         # auth, chat routes
│       ├── services/       # AI service, mail service
│       ├── sockets/        # Socket.IO server
│       └── validators/     # request validation
└── frontend/
    └── src/
        └── features/
            └── chat/        # chat feature: hooks, slice, api, socket, pages
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (e.g. MongoDB Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

The frontend expects the backend at `VITE_BACKEND_URL` (default `http://localhost:5000`).

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list of required variables. Never commit a real `.env` file — both are already excluded via `.gitignore`.

> **Note:** `backend/.env` currently contains live credentials (MongoDB password, JWT secret, Google OAuth client secret/refresh token, Gemini/Mistral API keys). Since it was never committed to git, no rotation is strictly required — but treat these as sensitive and rotate them if they're ever exposed outside this machine.
