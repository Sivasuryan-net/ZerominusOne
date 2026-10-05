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
- `POST /api/agents/heartbeat`
- `WS /ws/live`

The frontend currently keeps its SOC state in `SecurityContext.tsx`; this API is additive and does not alter that UI state. The existing Express server remains responsible for the frontend and `/api/ai-explain`.

## Download watcher agent

The watcher must run in the same Python virtual environment as the backend. Open PowerShell from the repository root.

### Install

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Check that `watchdog` is installed:

```powershell
python -m pip show watchdog
python -c "from importlib.metadata import version; print(version('watchdog'))"
```

### Update watchdog

Update only the watcher package:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade "watchdog>=6.0,<7"
python -c "from importlib.metadata import version; print('watchdog version:', version('watchdog'))"
```

Update all backend dependencies when required:

```powershell
python -m pip install --upgrade -r backend\requirements.txt
```

Restart the watcher after an update. A running process does not automatically reload Python package changes.

### Start

Start the API first in one terminal:

```powershell
.\.venv\Scripts\Activate.ps1
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start the watcher in a second terminal:

```powershell
.\.venv\Scripts\Activate.ps1
..\.venv\Scripts\python.exe -m app.ingestion.download_watcher --folder "$HOME\Downloads" --api-url http://127.0.0.1:8000 --verbose
```

It waits for a file to finish copying, calculates SHA-256, reports the endpoint heartbeat, and posts the file to `/api/ingest`. The agent only reads files. Configure `ZERO_ONE_BLOCKLIST_SHA256` as a comma-separated list of known hashes for deterministic blocklist matches.

### Check that it is working

Check the backend:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health | ConvertTo-Json
```

Check the watcher heartbeat. The agent should appear as `ONLINE` and its `lastSeen` value should update every 30 seconds:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/agents | ConvertTo-Json -Depth 5
```

For a safe end-to-end test, create a plain text file in Downloads:

```powershell
Set-Content "$HOME\Downloads\zero-one-watcher-test.txt" "Zero Minus One watcher test"
```

The watcher terminal should log `Submitted ... alert=...`. Confirm that the backend stored the alert:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/alerts | ConvertTo-Json -Depth 5
```

Delete the test file after checking it:

```powershell
Remove-Item "$HOME\Downloads\zero-one-watcher-test.txt"
```

### Troubleshooting

- `No module named watchdog`: activate `.\.venv\Scripts\Activate.ps1` and run `python -m pip install -r backend\requirements.txt`.
- Agent does not appear: confirm the API is running at `http://127.0.0.1:8000` and check the watcher terminal for heartbeat errors.
- Agent is `OFFLINE`: restart the watcher; the backend marks agents offline after 90 seconds without a heartbeat.
- Files are not detected: pass an explicit folder with `--folder "C:\path\to\folder"` and ensure the file is created after the watcher starts.
- Port 8000 is already in use: stop the old backend process or use another port and pass the matching value to `--api-url`.

## Simulation

Start the safe fixture replay with:

```powershell
Invoke-RestMethod -Method Post http://localhost:8000/api/simulate/start -ContentType 'application/json' -Body '{"intervalSeconds":1}'
```

The fixture events are in `app/simulation/fixtures/events.json`. They are synthetic and do not execute files.
