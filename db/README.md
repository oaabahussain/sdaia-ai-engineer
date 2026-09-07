# Database schema

The DDL intentionally uses the common subset of SQLite and PostgreSQL types and constraints.

SQLite:
```sh
sqlite3 dev.db < db/schema.sql
```

PostgreSQL (skip the SQLite-only PRAGMA line):
```sh
sed '/^PRAGMA /d' db/schema.sql | psql "$DATABASE_URL"
```
