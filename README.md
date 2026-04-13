# EnSer 2.0 — Engineering Service Platform

A full-stack service-learning platform that bridges **university engineering departments** with **real community challenges**. This is the redesigned and re-engineered version of my original EnSER project — rebuilt from the ground up with a modern tech stack, role-based authentication, AI-assisted workflow, and a clean professional UI.

---

## What is EnSer?

EnSer (Engineering Service) connects three types of users around real engineering projects:

| Role | What They Do |
|------|-------------|
| 🏙️ **Community** | Propose real engineering challenges (traffic systems, water infrastructure, bridges, EV networks, etc.) |
| 🎓 **Student** | Browse projects, submit applications, receive an AI-generated syllabus, and upload final PDF reports |
| 👨‍🏫 **Professor** | Review student applications, optionally use an AI key to generate syllabuses, and grade submissions with structured feedback |

The moment a professor accepts a student, they can use their own API key to instantly generate a complete **syllabus with weekly milestones, learning objectives, and a grading rubric** — saving hours of administrative work.

---

## What's New in v2.0

This version is a complete rewrite of the original EnSER project:

- **Modern UI** — Sidebar dashboards, role-specific color themes, light/dark mode, professional landing page
- **Role-based authentication** — Three distinct user roles powered by Supabase Auth
- **AI-assisted workflow** — Professors use their own API key (stored only in their browser) to generate syllabuses. No shared key, no unexpected charges.
- **PDF submission system** — Students upload project reports to Supabase Storage; professors can view and download them
- **Structured grading** — AI-generated rubric guides professor feedback; final score is entered manually
- **Real-time-ready** — Built on Supabase with PostgreSQL and Row Level Security

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI (Python), SQLAlchemy, Uvicorn |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (PDF submissions) |
| AI | OpenAI-compatible API — Bring Your Own Key (professor's browser only) |
| Deployment | Vercel (frontend) + Render (backend) + Supabase (database/auth) |

---

## Project Structure

```
EnSER-v2/
├── frontend/          # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # DashboardLayout, Navbar
│   │   ├── pages/         # LandingPage, Login, Register, 3 Dashboards
│   │   ├── hooks/         # useAuth
│   │   ├── lib/           # api.ts, supabase.ts, theme.tsx
│   │   └── types/         # TypeScript interfaces
│   └── public/            # logo, favicon, images
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── routers/       # projects, applications, syllabus, grades, submissions
│   │   ├── services/      # openai_service.py
│   │   ├── models.py      # SQLAlchemy ORM models
│   │   └── schemas.py     # Pydantic schemas
│   └── requirements.txt
└── database/
    ├── schema.sql     # Full PostgreSQL schema
    └── seed.sql       # Demo data for 3 roles
```

---

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/AankitPaudel/EnSER-v2.git
cd EnSER-v2
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, SECRET_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev
```

### 4. Database setup

1. Create a [Supabase](https://supabase.com) project
2. Run `database/schema.sql` in the SQL Editor
3. Create three demo accounts in **Authentication → Users**:
   - `demo-student@enser.dev` / `demo1234`
   - `demo-professor@enser.dev` / `demo1234`
   - `demo-community@enser.dev` / `demo1234`
4. Run `database/seed.sql` to populate demo data

---

## Deployment

| Service | What it hosts | Config |
|---------|--------------|--------|
| **Supabase** | PostgreSQL database + Auth + File Storage | Run `schema.sql`, create demo users |
| **Render** | FastAPI backend | Set `DATABASE_URL` (Session Pooler), `SECRET_KEY`, `ALLOWED_ORIGINS` |
| **Vercel** | React frontend | Root: `frontend/`, set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` |

---

## Key Features

- **Bring Your Own Key** — Professors enter their OpenAI-compatible API key in Settings. It's stored in their browser only and passed directly to the AI endpoint. The server never logs it.
- **AI Syllabus + Rubric Generation** — On acceptance, a full syllabus with weekly milestones and a grading rubric is generated instantly.
- **PDF Submission Pipeline** — Students upload PDF reports; files go to Supabase Storage with a public URL stored in the database.
- **Role-Based Dashboards** — Each role has a collapsible sidebar, stats cards, and role-specific workflow.
- **Dark / Light Mode** — Persisted in localStorage, toggleable from any page.

---

## About

Built by **Ankit Paudel** as a redesigned and re-engineered version of the original EnSER project.  
This v2.0 reflects significant improvements in architecture, UI, and real-world usability.
