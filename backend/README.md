# Zero Minus One Backend

FastAPI service for the Zero Minus One EDR prototype. It is deliberately runnable without external infrastructure: SQLite is the default store, while PostgreSQL can be selected later with `DATABASE_URL`.

## Run locally

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`, with interactive documentation at `/docs`.

## Main endpoints

- `GET /api/health`
- `POST /api/ingest` multipart file upload plus optional JSON `metadata` form field
- `GET /api/alerts` and `GET /api/alerts/{id}`
- `PATCH /api/alerts/{id}/status`
- `GET /api/mail`, `/api/agents`, `/api/cases`, `/api/attck-coverage`
- `GET` and `PUT /api/settings/thresholds`
- `POST /api/simulate/start` and `/api/simulate/stop`
- `WS /ws/live`

The frontend currently keeps its SOC state in `SecurityContext.tsx`; this API is additive and does not alter that UI state. The existing Express server remains responsible for the frontend and `/api/ai-explain`.

## Simulation

Start the safe fixture replay with:

```powershell
Invoke-RestMethod -Method Post http://localhost:8000/api/simulate/start -ContentType 'application/json' -Body '{"intervalSeconds":1}'
```

The fixture events are in `app/simulation/fixtures/events.json`. They are synthetic and do not execute files.
