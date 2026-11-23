# Database design

The implemented database foundation is documented in [the initial data model](../architecture/data-model.md). It currently covers the asset register only. Flyway migrations in `backend/src/main/resources/db/migration/` are the source of truth for schema changes. The broader modules remain proposals until requirements and relationships are approved.
