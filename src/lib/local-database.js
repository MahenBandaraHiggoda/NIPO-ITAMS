import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const globalForDatabase = globalThis;

export function getLocalDatabase() {
  if (!globalForDatabase.itamsDatabase) {
    const databasePath =
      process.env.ITAMS_SQLITE_PATH ||
      path.join(process.cwd(), "data", "itams.sqlite");

    if (databasePath !== ":memory:") {
      mkdirSync(path.dirname(databasePath), { recursive: true });
    }

    const database = new DatabaseSync(databasePath);
    database.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;

      CREATE TABLE IF NOT EXISTS department (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL COLLATE NOCASE,
        type TEXT NOT NULL CHECK (type IN ('DEPARTMENT', 'DIVISION')),
        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        UNIQUE (name, type)
      );

      CREATE TABLE IF NOT EXISTS employee (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        work_email TEXT COLLATE NOCASE UNIQUE,
        department_id INTEGER REFERENCES department(id) ON DELETE RESTRICT,
        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE IF NOT EXISTS asset (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_code TEXT NOT NULL COLLATE NOCASE UNIQUE,
        asset_name TEXT NOT NULL,
        category TEXT,
        asset_type TEXT,
        brand TEXT,
        model TEXT,
        serial_number TEXT COLLATE NOCASE UNIQUE,
        purchase_date TEXT,
        purchase_cost REAL CHECK (purchase_cost IS NULL OR purchase_cost >= 0),
        supplier TEXT,
        warranty_start TEXT,
        warranty_expiry TEXT,
        location TEXT,
        department TEXT,
        status TEXT NOT NULL DEFAULT 'AVAILABLE'
          CHECK (status IN ('ACTIVE', 'AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'RETIRED')),
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      CREATE TABLE IF NOT EXISTS asset_assignment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL REFERENCES asset(id) ON DELETE RESTRICT,
        employee_id INTEGER NOT NULL REFERENCES employee(id) ON DELETE RESTRICT,
        assigned_date TEXT NOT NULL,
        returned_date TEXT,
        CHECK (returned_date IS NULL OR returned_date >= assigned_date)
      );

      CREATE UNIQUE INDEX IF NOT EXISTS uq_assignment_active_asset
        ON asset_assignment(asset_id) WHERE returned_date IS NULL;
      CREATE INDEX IF NOT EXISTS idx_assignment_employee_active
        ON asset_assignment(employee_id, returned_date, assigned_date);
    `);

    globalForDatabase.itamsDatabase = database;
  }

  return globalForDatabase.itamsDatabase;
}
