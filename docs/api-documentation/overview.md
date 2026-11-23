# API overview

Base path: `/api`. API requests and responses use JSON. Successful responses follow `{ success, message, data, timestamp }`; errors include `success`, `message`, `errors`, `timestamp`, and `path`.

## Asset register

`GET /assets?page=0&size=10&search=&status=&sort=updatedAt&direction=DESC` returns a Spring page envelope in `data`. Supported sort keys: `updatedAt`, `assetCode`, `assetName`, `purchaseDate`, `status`. Page size is limited to 100.

`POST /assets` creates an asset. Required: `assetCode`, `assetName`. Optional fields: `category`, `type`, `brand`, `model`, `serialNumber`, `purchaseDate`, `purchaseCost`, `supplier`, `warrantyStart`, `warrantyExpiry`, `location`, `department`, `status`, `description`.

`GET /assets/{id}` reads an asset. `PUT /assets/{id}` replaces its editable fields. `DELETE /assets/{id}` retires the record by setting its status to `RETIRED`; it does not delete the database row.

`GET /dashboard/summary` returns total, active, available, assigned, in-maintenance, and retired counts from the persisted register.

Interactive API documentation is exposed at `/swagger-ui.html` in local development. Authentication is not implemented in this foundation; do not expose it to a production network.
