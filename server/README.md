# Server skeleton

This FastAPI service is a local/test-only implementation of `api/openapi.yaml`. It is not deployed by this repository.

Run locally from `server/`:
```sh
pip install -r requirements.txt && uvicorn app.main:app
```

Optional database location:
```sh
DB_URL=sqlite:///./dev.db uvicorn app.main:app
```
