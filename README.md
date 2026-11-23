# NIPO-ITAMS

The National Intellectual Property Office IT Asset Management System.

## Project structure

- The repository root contains the Next.js App Router dashboard.
- `backend/` contains the Java 21 Spring Boot REST API.
- `database/` contains MySQL schema design, migrations, and seed guidance.
- `docs/` contains requirements, architecture, API, and deployment notes.
- `frontend/` contains the separate React and Vite client scaffold.

The dashboard gets asset totals and recent asset records from the API. Store
stock, approvals, and activity currently use clearly labeled sample data.
Authentication and the remaining business modules require further
implementation before deployment.

## Requirements

- Node.js 24 LTS and pnpm 12 for the Next.js dashboard.
- Java 21 and Maven 3.9+ for the API.
- Docker with Docker Compose for the local MySQL database.

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set local database
   credentials if needed. The example values work with the local Compose
   defaults. This file is ignored by Git.
2. Start MySQL from the repository root:

   ```sh
   docker compose --env-file backend/.env up -d db
   ```

3. Start the API in a terminal:

   ```sh
   cd backend
   set -a
   source .env
   set +a
   mvn spring-boot:run
   ```

   The API runs at `http://localhost:8080/api`. The API documentation is
   available at `http://localhost:8080/swagger-ui.html`.

4. In another terminal, from the repository root, install and start the
   dashboard:

   ```sh
   pnpm install
   pnpm dev
   ```

5. Open `http://localhost:3000`. Next.js proxies `/api` requests to the local
   backend. Set `ITAMS_API_URL` if the API runs at a different origin.

To run the Vite client instead, copy `frontend/.env.example` to
`frontend/.env`, then run `npm install` and `npm run dev` from `frontend/`.
Its API URL defaults to `http://localhost:8080/api`.

## Current API

- `GET /api/assets` — paginated and searchable register (`page`, `size`,
  `search`, `status`).
- `POST /api/assets` — create an asset.
- `GET /api/assets/{id}` — read an asset.
- `PUT /api/assets/{id}` — update an asset.
- `DELETE /api/assets/{id}` — soft-retire an asset.
- `GET /api/dashboard/summary` — live register totals.

All API responses use `{ success, message, data, timestamp }`. Flyway creates
the database schema on API startup. The API owns persistence and validates
asset code and serial number uniqueness.

## Production build

From the repository root:

```sh
pnpm build
pnpm start
```
