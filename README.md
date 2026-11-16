# NIPO-ITAMS
NIPO IT Asset Management System

## Project status

This repository is the starting point for the National Intellectual Property Office IT Asset Management System. The source material currently available in the repository is a project name only; the supplied master prompt describes a proposed page inventory but ends before the database and approved-requirements sections are complete. The implementation therefore starts with a functional asset register and dashboard foundation. The remaining modules should be mapped to the approved proposal before being treated as committed requirements.

## Architecture

- `frontend/`: React and Vite single-page application.
- `backend/`: Java 21 Spring Boot REST API.
- `database/`: MySQL schema design and seed guidance.
- `docs/`: requirements assumptions, architecture, and API notes.

The browser talks only to the REST API. The API owns persistence and validates asset code and serial number uniqueness. MySQL runs via Docker Compose for local development.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and set local database credentials if needed. Docker Compose can read these values with `docker compose --env-file backend/.env up -d db`; otherwise its local defaults match the backend defaults.
2. Start MySQL with the command above.
3. Run the API from `backend/` with Maven 3.9+: `mvn spring-boot:run`. If using the `.env` file, export its values in that terminal first (`set -a; source .env; set +a`).
4. Copy `frontend/.env.example` to `frontend/.env`, then run `npm install` and `npm run dev` from `frontend/`.
5. Open the Vite URL shown in the terminal. The API defaults to `http://localhost:8080/api`.

The API documentation is available at `/swagger-ui.html` while the backend is running. Flyway creates the database schema on startup. The development API currently exposes asset and dashboard endpoints; authentication and the other business modules need approved requirements and subsequent implementation before deployment.

## Current API

- `GET /api/assets` — paginated and searchable register (`page`, `size`, `search`, `status`).
- `POST /api/assets` — create an asset.
- `GET /api/assets/{id}` — read an asset.
- `PUT /api/assets/{id}` — update an asset.
- `DELETE /api/assets/{id}` — soft-retire an asset.
- `GET /api/dashboard/summary` — live register totals.

All API responses use `{ success, message, data, timestamp }`. The asset register and summary are persisted in MySQL; the dashboard does not use fixture data.
