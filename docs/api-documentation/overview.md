# API overview

Base path: `/api`. During local development, Next.js route handlers use the Node.js built-in SQLite driver and persist to `data/itams.sqlite` (or `ITAMS_SQLITE_PATH`). API requests and responses use JSON. Successful responses follow `{ success, message, data, timestamp }`; errors include `success`, `message`, `errors`, `timestamp`, and `path`.

## Asset register

`GET /assets?page=0&size=10&search=&status=&sort=updatedAt&direction=DESC` returns a page envelope in `data`. Supported sort keys: `updatedAt`, `assetCode`, `assetName`, `purchaseDate`, `status`. Page size is limited to 100.

`POST /assets` creates an asset. Required: `assetCode`, `assetName`. Optional fields: `category`, `type`, `brand`, `model`, `serialNumber`, `purchaseDate`, `purchaseCost`, `supplier`, `warrantyStart`, `warrantyExpiry`, `location`, `department`, `status`, `description`.

`GET /assets/{id}` reads an asset. `PUT /assets/{id}` replaces its editable fields. `DELETE /assets/{id}` retires the record by setting its status to `RETIRED`; it does not delete the database row.

`GET /dashboard/summary` returns total, active, available, assigned, in-maintenance, and retired counts from the persisted register.

## Employees

`GET /employees?page=0&size=10&search=&departmentId=&active=&sort=fullName&direction=ASC` returns a page envelope. Search matches employee name, work email, and department/division name. Supported sort keys: `fullName`, `workEmail`, `createdAt`, `updatedAt`. Page size is limited to 100.

`POST /employees` creates an employee. Required: `fullName`. Optional: `workEmail`, `departmentId`, `active`. Work email is normalized to lowercase and must be unique when provided. `active` defaults to `true`.

`GET /employees/{id}` reads an employee. `PUT /employees/{id}` updates its details. Setting `departmentId` to `null` removes the employee's department/division.

## Departments and divisions

`GET /departments?active=true` lists departments and divisions, ordered by name. Omit `active` to include inactive units.

`POST /departments` creates a unit. Required: `name` and `type` (`DEPARTMENT` or `DIVISION`). Optional: `active`, which defaults to `true`. A name may be reused across different unit types, but not within the same type.

`GET /departments/{id}` reads a unit. `PUT /departments/{id}` updates its details. Units are deactivated through `active=false`; there is no hard-delete endpoint.

## Equipment assignments

`POST /assignments` assigns an available asset to an active employee. Required JSON fields: `employeeId`, `assetId`, and `assignedDate` (`YYYY-MM-DD`, not in the future). The asset is marked `ASSIGNED`, and the API rejects attempts to assign unavailable or already assigned assets.

`POST /assignments/{id}/return` returns a currently assigned asset. Required JSON: `returnedDate` (`YYYY-MM-DD`), which cannot be before its assignment date or in the future. The asset becomes `AVAILABLE`.

`POST /assignments/{id}/transfer` transfers a currently assigned asset to another active employee. Required JSON: `employeeId` and `assignedDate` (`YYYY-MM-DD`). The date cannot be before the current assignment date or in the future. The current assignment is closed and a new assignment is created atomically, leaving both records available for history.

`GET /employees/{employeeId}/assignments` lists the employee's current assigned equipment, including the asset code, name, category/type, serial number, and assignment date.

Authentication is not implemented in this foundation; do not expose the API to a production network.

The separate Java/Spring Boot API and its Swagger UI remain under `backend/` for MySQL-based deployments. They are not required to develop the Next.js app against local SQLite.
