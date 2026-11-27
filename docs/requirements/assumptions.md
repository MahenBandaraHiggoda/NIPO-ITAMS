# Requirements status and implementation assumptions

The project proposal describes a broader system than the current implementation. This document records implemented behavior and agreed assumptions so that unimplemented requirements are not mistaken for available features.

## Implemented foundation

- Maintain an IT asset register with create, read, update, search, status filtering, pagination, and retirement.
- Show dashboard totals computed from the asset register.
- Require a unique asset code; serial numbers are unique when present.
- Retirement is represented as a status transition, preserving the record and avoiding destructive deletion.
- Store dates without a time zone and monetary purchase cost as decimal currency units. Currency display is not fixed until confirmed.
- Maintain employees with a required full name, optional unique work email, optional department/division, and active status.
- Maintain departments and divisions as organizational units with a type; deactivate rather than hard-delete them.
- Do not collect NIC until authentication and access controls are implemented.

## Configurable / needs approval

- Asset status values are currently `ACTIVE`, `AVAILABLE`, `ASSIGNED`, `UNDER_MAINTENANCE`, and `RETIRED`.
- Category, type, department, location, and supplier are currently descriptive text fields; controlled vocabularies and ownership rules need confirmation.
- No authentication, roles, retention policy, approval workflow, currency, or QR exposure policy has been supplied. The development API must not be exposed as a production system until those requirements are approved and implemented.
- The current assignment form assigns an available asset to one active employee and records the assignment date. Assignment rows preserve prior records for future return/history support. Department/division assignment, return, transfer, and assignment-history screens/endpoints are not implemented yet.
