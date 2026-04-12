# EnSer 2.0 — Engineering Service Platform

> Connecting communities, students, and professors through real-world engineering projects, powered by AI.

🔗 **Live Demo:** *(add your Vercel URL after deployment)*
🎯 **Try it:** Click "Try as Student / Professor / Community" on the landing page — no sign-up needed

---

## What is EnSer?

EnSer is a full-stack web platform that bridges three groups:

- **Community Members** — propose real-world engineering projects
- **Students** — browse projects by department and apply
- **Professors** — review applications, get an AI-generated syllabus instantly, grade submissions

The hero feature: when a professor accepts a student, **GPT-4o automatically generates a full syllabus and grading rubric** for the project.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| AI | OpenAI GPT-4o |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Project Structure

```
EnSer-v2/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── main.py           # App entry point + CORS
│   │   ├── database.py       # SQLAlchemy + PostgreSQL
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API routes
│   │   │   ├── projects.py
│   │   │   ├── applications.py
│   │   │   ├── syllabus.py
│   │   │   ├── grades.py
│   │   │   └── submissions.py
│   │   └── services/
│   │       └── openai_service.py  # GPT-4o integration
│   ├── requirements.txt
│   ├── render.yaml           # Render deployment config
│   └── .env.example
│
├── frontend/                 # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── ProfessorDashboard.tsx
│   │   │   ├── CommunityDashboard.tsx
│   │   │   └── ProjectDetail.tsx
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts   # Supabase client
│   │   │   └── api.ts        # Axios API helpers
│   │   └── types/
│   │       └── index.ts      # TypeScript interfaces
│   ├── vercel.json
│   └── .env.example
│
└── database/
    ├── schema.sql            # Run this in Supabase SQL Editor
    └── seed.sql              # Demo data + instructions
```

---

## Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- A free [Supabase](https://supabase.com) project
- An [OpenAI API key](https://platform.openai.com/api-keys)

---

### 1 — Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste contents of `database/schema.sql` → click **Run**
3. Go to **Storage** → create a bucket named `submissions` → enable **Public bucket**

---

### 2 — Backend Setup

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJhbGci...
OPENAI_API_KEY=sk-...
SECRET_KEY=any-random-string
```

Start the backend:

```powershell
uvicorn app.main:app --reload
```

API runs at **http://localhost:8000**
API docs at **http://localhost:8000/docs**

---

### 3 — Frontend Setup

```powershell
cd frontend
npm install
```

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```powershell
npm run dev
```

App runs at **http://localhost:5173**

---

## Deploy

### Backend → Render (free)
1. Push to GitHub
2. [render.com](https://render.com) → New Web Service → connect repo → set root to `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env`

### Frontend → Vercel (free)
1. [vercel.com](https://vercel.com) → New Project → import repo → set root to `frontend`
2. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (your Render URL)
3. Deploy

After deploying, add your Vercel URL to `ALLOWED_ORIGINS` in `backend/app/main.py` and redeploy backend.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | demo-student@enser.dev | demo1234 |
| Professor | demo-professor@enser.dev | demo1234 |
| Community | demo-community@enser.dev | demo1234 |

*(Create these in Supabase Auth, then run `database/seed.sql` with the correct UUIDs)*

---

## Features

- Role-based authentication (Community / Student / Professor)
- AI-powered syllabus & rubric generation via GPT-4o
- Project proposals with department filtering
- Student application system
- PDF submission upload via Supabase Storage
- Professor grading with structured feedback
- Demo mode for recruiters (no sign-up required)
