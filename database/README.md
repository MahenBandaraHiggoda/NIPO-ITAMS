# Database

MySQL schema changes for the Spring Boot application are managed as Flyway migrations in `backend/src/main/resources/db/migration/`. The numbered files in `schema/` are organization placeholders; do not apply them as migrations. Add approved, non-sensitive development records to `seed/sample_data.sql`. Keep database backups out of source control.
