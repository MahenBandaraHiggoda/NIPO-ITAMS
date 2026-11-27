# NIPO-ITAMS

The National Intellectual Property Office IT Asset Management System.

## Project structure

- The repository root contains the Next.js App Router dashboard.
- `src/app/api/` contains the development API, backed by a local SQLite database.
- `backend/` contains the separate Spring Boot API for MySQL deployments.
- `database/` contains MySQL schema design, migrations, and seed guidance.
- `docs/` contains requirements, architecture, API, and deployment notes.
- `frontend/` contains the separate React and Vite client scaffold.

The dashboard gets asset totals and recent asset records from the local API.
Store stock, approvals, and activity currently use clearly labeled sample data.
Authentication and the remaining business modules require further
implementation before deployment.

## Requirements

- Node.js 24 and pnpm for the dashboard and SQLite development API.
- Java 21, Maven 3.9+, and Docker Compose are only needed for the separate
  Spring Boot/MySQL backend; they are not needed for local feature development.

## Develop locally with SQLite

From the repository root:

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The Next.js route handlers create and use
`data/itams.sqlite` automatically; that local database file is ignored by Git.
Set `ITAMS_SQLITE_PATH` to use a different SQLite file.

To run the Vite client instead, copy `frontend/.env.example` to
`frontend/.env`, then run `npm install` and `npm run dev` from `frontend/`.
The Vite scaffold still expects the separate Spring Boot API.

## Current API

- `GET /api/assets` — paginated and searchable register (`page`, `size`,
  `search`, `status`).
- `POST /api/assets` — create an asset.
- `GET /api/assets/{id}` — read an asset.
- `PUT /api/assets/{id}` — update an asset.
- `DELETE /api/assets/{id}` — soft-retire an asset.
- `GET /api/dashboard/summary` — live register totals.
- `GET /api/employees` — searchable, filterable, paginated employee list.
- `POST /api/employees` — create an employee.
- `GET /api/employees/{id}` and `PUT /api/employees/{id}` — read or update an employee.
- `GET /api/departments` — list departments and divisions.
- `POST /api/departments` — create a department or division.
- `GET /api/departments/{id}` and `PUT /api/departments/{id}` — read or update a department or division.
- `POST /api/assignments` — assign an available asset to an active employee with an assignment date.
- `POST /api/assignments/{id}/return` — return an assigned asset and make it available again.
- `POST /api/assignments/{id}/transfer` — transfer an assigned asset to another active employee.
- `GET /api/employees/{id}/assignments` — list an employee's current assigned equipment.

All development API responses use `{ success, message, data, timestamp }`.
SQLite tables are initialized automatically on the first API request. Asset
codes and non-empty serial numbers are unique; employee work email is optional
and unique when provided. NIC is not collected; authentication and access
controls must be implemented before storing it.

## Production build

From the repository root:

```sh
pnpm build
pnpm start
```
