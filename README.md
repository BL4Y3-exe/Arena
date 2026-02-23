# Arena

AI-powered platform for finding sparring partners.

## Tech Stack

| Layer    | Tech                                    |
|----------|-----------------------------------------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand |
| Backend  | FastAPI, Python 3.11, SQLAlchemy 2, Alembic |
| Database | PostgreSQL                              |
| AI       | OpenAI GPT-4o-mini                      |
| Auth     | JWT (access + refresh tokens)           |

## Quick Start (Docker)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set SECRET_KEY + OPENAI_API_KEY

docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000  
- API Docs: http://localhost:8000/docs

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in values

alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Project Structure

```
Arena/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/          # Route handlers
│   │   ├── core/         # Config, DB, security, deps
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic & AI
│   ├── alembic/          # DB migrations
│   └── tests/
└── frontend/
    ├── app/              # Next.js App Router pages
    ├── components/       # Shared UI components
    ├── hooks/            # Custom React hooks
    └── lib/              # API client, Zustand store
```

## API Endpoints

| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| POST   | /api/auth/register      | Create account           |
| POST   | /api/auth/login         | Get tokens               |
| POST   | /api/auth/refresh       | Refresh access token     |
| GET    | /api/profiles/me        | Get own profile          |
| POST   | /api/profiles           | Create profile           |
| PATCH  | /api/profiles/me        | Update profile           |
| GET    | /api/availability       | Get own availability     |
| POST   | /api/availability       | Add time slot            |
| DELETE | /api/availability/{id}  | Remove time slot         |
| POST   | /api/match/find         | Run AI matchmaking       |
| GET    | /api/match/recommended  | Get pending matches      |
| PATCH  | /api/match/{id}         | Accept / reject match    |

## Matching Logic

1. **Hard Filters** — same sport, skill gap ≤ 2, same city  
2. **Rule-based Score** — 30% skill + 20% goals + 20% schedule + 15% weight + 15% experience  
3. **AI Refinement** — GPT-4o-mini adds reasoning, risks, and strengths

## Running Tests

```bash
cd backend
pytest
```
