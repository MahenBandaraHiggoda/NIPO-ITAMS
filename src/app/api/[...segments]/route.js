import { getLocalDatabase } from "@/lib/local-database";

export const runtime = "nodejs";

class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const employeeSortFields = {
  fullName: "e.full_name",
  workEmail: "e.work_email",
  createdAt: "e.created_at",
  updatedAt: "e.updated_at",
};

const assetSortFields = {
  updatedAt: "a.updated_at",
  assetCode: "a.asset_code",
  assetName: "a.asset_name",
  purchaseDate: "a.purchase_date",
  status: "a.status",
};

const assetFields = [
  "assetCode",
  "assetName",
  "category",
  "type",
  "brand",
  "model",
  "serialNumber",
  "purchaseDate",
  "purchaseCost",
  "supplier",
  "warrantyStart",
  "warrantyExpiry",
  "location",
  "department",
  "status",
  "description",
];

function response(data, message, status = 200) {
  return Response.json(
    { success: true, message, data, timestamp: new Date().toISOString() },
    { status },
  );
}

function parseId(value, label) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new ApiError(400, `${label} is outside the supported range`);
  }
  return id;
}

function parseBoolean(value, name) {
  if (value === "true") return 1;
  if (value === "false") return 0;
  throw new ApiError(400, `${name} must be true or false`);
}

function parsePage(url) {
  const page = Number(url.searchParams.get("page") ?? 0);
  const size = Number(url.searchParams.get("size") ?? 10);
  if (
    !Number.isInteger(page) ||
    page < 0 ||
    !Number.isInteger(size) ||
    size < 1 ||
    size > 100
  ) {
    throw new ApiError(
      400,
      "Page must be >= 0 and size must be between 1 and 100",
    );
  }
  return { page, size, offset: page * size };
}

function pageResult(content, totalElements, page, size, sorted = true) {
  const totalPages = Math.ceil(totalElements / size);
  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: { sorted, empty: !sorted, unsorted: !sorted },
      offset: page * size,
      paged: true,
      unpaged: false,
    },
    last: page + 1 >= totalPages,
    totalElements,
    totalPages,
    size,
    number: page,
    sort: { sorted, empty: !sorted, unsorted: !sorted },
    first: page === 0,
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON");
  }
}

function validateEmployee(body) {
  const errors = {};
  const fullName =
    typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const workEmail =
    typeof body?.workEmail === "string"
      ? body.workEmail.trim().toLowerCase()
      : "";

  if (!fullName) errors.fullName = "Full name is required";
  else if (fullName.length > 160)
    errors.fullName = "Full name must be at most 160 characters";
  if (workEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
    errors.workEmail = "Enter a valid work email";
  } else if (workEmail.length > 254) {
    errors.workEmail = "Work email must be at most 254 characters";
  }
  if (
    body?.departmentId !== null &&
    body?.departmentId !== undefined &&
    body.departmentId !== ""
  ) {
    if (
      !Number.isSafeInteger(Number(body.departmentId)) ||
      Number(body.departmentId) < 1
    ) {
      errors.departmentId = "Choose a valid department or division";
    }
  }
  if (
    body?.active !== null &&
    body?.active !== undefined &&
    typeof body.active !== "boolean"
  ) {
    errors.active = "Status must be active or inactive";
  }
  if (Object.keys(errors).length)
    throw new ApiError(400, "Please correct the highlighted fields", errors);

  return {
    fullName,
    workEmail: workEmail || null,
    departmentId:
      body.departmentId === null ||
      body.departmentId === undefined ||
      body.departmentId === ""
        ? null
        : Number(body.departmentId),
    active: body.active,
  };
}

function validateDepartment(body) {
  const errors = {};
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const type =
    typeof body?.type === "string" ? body.type.trim().toUpperCase() : "";
  if (!name) errors.name = "Unit name is required";
  else if (name.length > 120)
    errors.name = "Unit name must be at most 120 characters";
  if (!["DEPARTMENT", "DIVISION"].includes(type)) {
    errors.type = "Type must be DEPARTMENT or DIVISION";
  }
  if (
    body?.active !== null &&
    body?.active !== undefined &&
    typeof body.active !== "boolean"
  ) {
    errors.active = "Status must be active or inactive";
  }
  if (Object.keys(errors).length)
    throw new ApiError(400, "Please correct the highlighted fields", errors);
  return { name, type, active: body.active };
}

function validateAsset(body) {
  const errors = {};
  const assetCode =
    typeof body?.assetCode === "string" ? body.assetCode.trim() : "";
  const assetName =
    typeof body?.assetName === "string" ? body.assetName.trim() : "";
  if (!assetCode) errors.assetCode = "Asset code is required";
  else if (assetCode.length > 40)
    errors.assetCode = "Asset code must be at most 40 characters";
  if (!assetName) errors.assetName = "Asset name is required";
  else if (assetName.length > 160)
    errors.assetName = "Asset name must be at most 160 characters";

  for (const field of assetFields
    .slice(2)
    .filter((field) => field !== "purchaseCost")) {
    const value = body?.[field];
    if (value !== null && value !== undefined && typeof value !== "string") {
      errors[field] = "This field must be text";
    }
  }
  const purchaseCost = body?.purchaseCost;
  if (
    purchaseCost !== null &&
    purchaseCost !== undefined &&
    purchaseCost !== ""
  ) {
    if (!Number.isFinite(Number(purchaseCost)) || Number(purchaseCost) < 0) {
      errors.purchaseCost = "Purchase cost must be a non-negative number";
    }
  }
  const status = body?.status ? String(body.status).toUpperCase() : "AVAILABLE";
  if (
    ![
      "ACTIVE",
      "AVAILABLE",
      "ASSIGNED",
      "UNDER_MAINTENANCE",
      "RETIRED",
    ].includes(status)
  ) {
    errors.status = "Unsupported asset status";
  }
  if (Object.keys(errors).length)
    throw new ApiError(400, "Please correct the highlighted fields", errors);

  return {
    assetCode,
    assetName,
    category: cleanText(body.category),
    type: cleanText(body.type),
    brand: cleanText(body.brand),
    model: cleanText(body.model),
    serialNumber: cleanText(body.serialNumber),
    purchaseDate: cleanText(body.purchaseDate),
    purchaseCost:
      purchaseCost === null || purchaseCost === undefined || purchaseCost === ""
        ? null
        : Number(purchaseCost),
    supplier: cleanText(body.supplier),
    warrantyStart: cleanText(body.warrantyStart),
    warrantyExpiry: cleanText(body.warrantyExpiry),
    location: cleanText(body.location),
    department: cleanText(body.department),
    status,
    description: cleanText(body.description),
  };
}

function cleanText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function employeeResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    workEmail: row.work_email,
    departmentId: row.department_id,
    departmentName: row.department_name,
    departmentType: row.department_type,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function departmentResponse(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assetResponse(row) {
  return {
    id: row.id,
    assetCode: row.asset_code,
    assetName: row.asset_name,
    category: row.category,
    type: row.asset_type,
    brand: row.brand,
    model: row.model,
    serialNumber: row.serial_number,
    purchaseDate: row.purchase_date,
    purchaseCost: row.purchase_cost,
    supplier: row.supplier,
    warrantyStart: row.warranty_start,
    warrantyExpiry: row.warranty_expiry,
    location: row.location,
    department: row.department,
    status: row.status,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assignmentResponse(row) {
  return {
    id: row.id,
    assetId: row.asset_id,
    assetCode: row.asset_code,
    assetName: row.asset_name,
    category: row.category,
    type: row.asset_type,
    serialNumber: row.serial_number,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    assignedDate: row.assigned_date,
    returnedDate: row.returned_date ?? null,
  };
}

function getEmployee(database, id) {
  return database
    .prepare(
      `
      SELECT e.*, d.name AS department_name, d.type AS department_type
      FROM employee e
      LEFT JOIN department d ON d.id = e.department_id
      WHERE e.id = ?
    `,
    )
    .get(id);
}

function getAsset(database, id) {
  return database.prepare("SELECT * FROM asset WHERE id = ?").get(id);
}

async function handleEmployees(database, method, segments, url, request) {
  if (segments.length === 1 && method === "GET") {
    const { page, size, offset } = parsePage(url);
    const sort = url.searchParams.get("sort") || "fullName";
    const direction = (
      url.searchParams.get("direction") || "ASC"
    ).toUpperCase();
    if (!employeeSortFields[sort])
      throw new ApiError(400, "Unsupported sort field");
    if (!["ASC", "DESC"].includes(direction))
      throw new ApiError(400, "Unsupported sort direction");

    const conditions = [];
    const values = [];
    const search = url.searchParams.get("search")?.trim();
    if (search) {
      conditions.push(
        "(lower(e.full_name) LIKE lower(?) OR lower(coalesce(e.work_email, '')) LIKE lower(?) OR lower(coalesce(d.name, '')) LIKE lower(?))",
      );
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const departmentId = url.searchParams.get("departmentId");
    if (departmentId) {
      conditions.push("e.department_id = ?");
      values.push(parseId(departmentId, "Department id"));
    }
    const active = url.searchParams.get("active");
    if (active !== null) {
      conditions.push("e.active = ?");
      values.push(parseBoolean(active, "Active"));
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const join =
      "FROM employee e LEFT JOIN department d ON d.id = e.department_id";
    const total = database
      .prepare(`SELECT count(*) AS total ${join} ${where}`)
      .get(...values).total;
    const rows = database
      .prepare(
        `
        SELECT e.*, d.name AS department_name, d.type AS department_type
        ${join} ${where}
        ORDER BY ${employeeSortFields[sort]} ${direction}, e.id ASC
        LIMIT ? OFFSET ?
      `,
      )
      .all(...values, size, offset)
      .map(employeeResponse);
    return response(pageResult(rows, total, page, size), "Employees loaded");
  }

  if (segments.length === 1 && method === "POST") {
    const body = await readJson(request);
    const values = validateEmployee(body);
    if (values.departmentId !== null) {
      const department = database
        .prepare("SELECT active FROM department WHERE id = ?")
        .get(values.departmentId);
      if (!department)
        throw new ApiError(404, "Department or division not found");
      if (!department.active)
        throw new ApiError(
          400,
          "Inactive departments or divisions cannot be assigned",
        );
    }
    const result = database
      .prepare(
        `
      INSERT INTO employee (full_name, work_email, department_id, active)
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(
        values.fullName,
        values.workEmail,
        values.departmentId,
        values.active === false ? 0 : 1,
      );
    return response(
      employeeResponse(getEmployee(database, Number(result.lastInsertRowid))),
      "Employee created",
      201,
    );
  }

  if (segments.length === 2 && method === "GET") {
    const employee = getEmployee(database, parseId(segments[1], "Employee id"));
    if (!employee) throw new ApiError(404, "Employee not found");
    return response(employeeResponse(employee), "Employee loaded");
  }

  if (segments.length === 2 && method === "PUT") {
    const id = parseId(segments[1], "Employee id");
    const existing = getEmployee(database, id);
    if (!existing) throw new ApiError(404, "Employee not found");
    const body = await readJson(request);
    const values = validateEmployee(body);
    if (
      values.departmentId !== null &&
      values.departmentId !== existing.department_id
    ) {
      const department = database
        .prepare("SELECT active FROM department WHERE id = ?")
        .get(values.departmentId);
      if (!department)
        throw new ApiError(404, "Department or division not found");
      if (!department.active)
        throw new ApiError(
          400,
          "Inactive departments or divisions cannot be assigned",
        );
    }
    database
      .prepare(
        `
      UPDATE employee
      SET full_name = ?, work_email = ?, department_id = ?,
          active = coalesce(?, active), updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?
    `,
      )
      .run(
        values.fullName,
        values.workEmail,
        values.departmentId,
        values.active === undefined ? null : values.active ? 1 : 0,
        id,
      );
    return response(
      employeeResponse(getEmployee(database, id)),
      "Employee updated",
    );
  }

  if (
    segments.length === 3 &&
    segments[2] === "assignments" &&
    method === "GET"
  ) {
    const employeeId = parseId(segments[1], "Employee id");
    if (
      !database.prepare("SELECT 1 FROM employee WHERE id = ?").get(employeeId)
    ) {
      throw new ApiError(404, "Employee not found");
    }
    const rows = database
      .prepare(
        `
        SELECT aa.id, aa.asset_id, a.asset_code, a.asset_name, a.category,
               a.asset_type, a.serial_number, aa.employee_id, e.full_name AS employee_name,
               aa.assigned_date
        FROM asset_assignment aa
        JOIN asset a ON a.id = aa.asset_id
        JOIN employee e ON e.id = aa.employee_id
        WHERE aa.employee_id = ? AND aa.returned_date IS NULL
        ORDER BY aa.assigned_date DESC, aa.id DESC
      `,
      )
      .all(employeeId)
      .map(assignmentResponse);
    return response(rows, "Current employee equipment loaded");
  }

  if (
    segments.length === 3 &&
    segments[2] === "assignment-history" &&
    method === "GET"
  ) {
    const employeeId = parseId(segments[1], "Employee id");
    if (
      !database.prepare("SELECT 1 FROM employee WHERE id = ?").get(employeeId)
    ) {
      throw new ApiError(404, "Employee not found");
    }
    const rows = database
      .prepare(
        `
        SELECT aa.id, aa.asset_id, a.asset_code, a.asset_name, a.category,
               a.asset_type, a.serial_number, aa.employee_id, e.full_name AS employee_name,
               aa.assigned_date, aa.returned_date
        FROM asset_assignment aa
        JOIN asset a ON a.id = aa.asset_id
        JOIN employee e ON e.id = aa.employee_id
        WHERE aa.employee_id = ? AND aa.returned_date IS NOT NULL
        ORDER BY aa.assigned_date DESC, aa.id DESC
      `,
      )
      .all(employeeId)
      .map(assignmentResponse);
    return response(rows, "Employee assignment history loaded");
  }

  throw new ApiError(405, "Method not allowed");
}

async function handleDepartments(database, method, segments, url, request) {
  if (segments.length === 1 && method === "GET") {
    const active = url.searchParams.get("active");
    let rows;
    if (active === null) {
      rows = database
        .prepare("SELECT * FROM department ORDER BY name COLLATE NOCASE, id")
        .all();
    } else {
      rows = database
        .prepare(
          "SELECT * FROM department WHERE active = ? ORDER BY name COLLATE NOCASE, id",
        )
        .all(parseBoolean(active, "Active"));
    }
    return response(
      rows.map(departmentResponse),
      "Departments and divisions loaded",
    );
  }

  if (segments.length === 1 && method === "POST") {
    const values = validateDepartment(await readJson(request));
    const result = database
      .prepare(
        `
      INSERT INTO department (name, type, active) VALUES (?, ?, ?)
    `,
      )
      .run(values.name, values.type, values.active === false ? 0 : 1);
    const row = database
      .prepare("SELECT * FROM department WHERE id = ?")
      .get(Number(result.lastInsertRowid));
    return response(
      departmentResponse(row),
      "Department or division created",
      201,
    );
  }

  if (segments.length === 2 && method === "GET") {
    const row = database
      .prepare("SELECT * FROM department WHERE id = ?")
      .get(parseId(segments[1], "Department id"));
    if (!row) throw new ApiError(404, "Department or division not found");
    return response(departmentResponse(row), "Department or division loaded");
  }

  if (segments.length === 2 && method === "PUT") {
    const id = parseId(segments[1], "Department id");
    const existing = database
      .prepare("SELECT * FROM department WHERE id = ?")
      .get(id);
    if (!existing) throw new ApiError(404, "Department or division not found");
    const values = validateDepartment(await readJson(request));
    database
      .prepare(
        `
      UPDATE department
      SET name = ?, type = ?, active = coalesce(?, active),
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?
    `,
      )
      .run(
        values.name,
        values.type,
        values.active === undefined ? null : values.active ? 1 : 0,
        id,
      );
    return response(
      departmentResponse(
        database.prepare("SELECT * FROM department WHERE id = ?").get(id),
      ),
      "Department or division updated",
    );
  }

  throw new ApiError(405, "Method not allowed");
}

async function handleAssets(database, method, segments, url, request) {
  if (segments.length === 1 && method === "GET") {
    const { page, size, offset } = parsePage(url);
    const sort = url.searchParams.get("sort") || "updatedAt";
    const direction = (
      url.searchParams.get("direction") || "DESC"
    ).toUpperCase();
    if (!assetSortFields[sort])
      throw new ApiError(400, "Unsupported sort field");
    if (!["ASC", "DESC"].includes(direction))
      throw new ApiError(400, "Unsupported sort direction");
    const conditions = [];
    const values = [];
    const status = url.searchParams.get("status");
    if (status) {
      const normalizedStatus = status.toUpperCase();
      if (
        ![
          "ACTIVE",
          "AVAILABLE",
          "ASSIGNED",
          "UNDER_MAINTENANCE",
          "RETIRED",
        ].includes(normalizedStatus)
      ) {
        throw new ApiError(400, "Unsupported asset status");
      }
      conditions.push("a.status = ?");
      values.push(normalizedStatus);
    }
    const search = url.searchParams.get("search")?.trim();
    if (search) {
      conditions.push(
        "(lower(a.asset_code) LIKE lower(?) OR lower(a.asset_name) LIKE lower(?) OR lower(coalesce(a.serial_number, '')) LIKE lower(?) OR lower(coalesce(a.category, '')) LIKE lower(?))",
      );
      values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const total = database
      .prepare(`SELECT count(*) AS total FROM asset a ${where}`)
      .get(...values).total;
    const rows = database
      .prepare(
        `SELECT a.* FROM asset a ${where} ORDER BY ${assetSortFields[sort]} ${direction}, a.id ASC LIMIT ? OFFSET ?`,
      )
      .all(...values, size, offset)
      .map(assetResponse);
    return response(pageResult(rows, total, page, size), "Assets loaded");
  }

  if (segments.length === 1 && method === "POST") {
    const values = validateAsset(await readJson(request));
    const row = insertAsset(database, values);
    return response(assetResponse(row), "Asset created successfully", 201);
  }

  if (segments.length === 2 && method === "GET") {
    const row = getAsset(database, parseId(segments[1], "Asset id"));
    if (!row) throw new ApiError(404, "Asset not found");
    return response(assetResponse(row), "Asset loaded");
  }

  if (segments.length === 2 && method === "PUT") {
    const id = parseId(segments[1], "Asset id");
    const existing = getAsset(database, id);
    if (!existing) throw new ApiError(404, "Asset not found");
    const values = validateAsset(await readJson(request));
    const hasAssignment = database
      .prepare(
        "SELECT 1 FROM asset_assignment WHERE asset_id = ? AND returned_date IS NULL",
      )
      .get(id);
    if (hasAssignment && values.status !== "ASSIGNED") {
      throw new ApiError(
        400,
        "An assigned asset must be returned before its status can change",
      );
    }
    if (hasAssignment) values.status = "ASSIGNED";
    updateAsset(database, id, values);
    return response(
      assetResponse(getAsset(database, id)),
      "Asset updated successfully",
    );
  }

  if (segments.length === 2 && method === "DELETE") {
    const id = parseId(segments[1], "Asset id");
    const existing = getAsset(database, id);
    if (!existing) throw new ApiError(404, "Asset not found");
    if (
      database
        .prepare(
          "SELECT 1 FROM asset_assignment WHERE asset_id = ? AND returned_date IS NULL",
        )
        .get(id)
    ) {
      throw new ApiError(
        400,
        "An assigned asset must be returned before it can be retired",
      );
    }
    database
      .prepare(
        "UPDATE asset SET status = 'RETIRED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
      )
      .run(id);
    return response(
      assetResponse(getAsset(database, id)),
      "Asset retired successfully",
    );
  }

  throw new ApiError(405, "Method not allowed");
}

function insertAsset(database, values) {
  const fields = assetFields.map(
    (field) =>
      ({
        assetCode: "asset_code",
        assetName: "asset_name",
        type: "asset_type",
        serialNumber: "serial_number",
        purchaseDate: "purchase_date",
        purchaseCost: "purchase_cost",
        warrantyStart: "warranty_start",
        warrantyExpiry: "warranty_expiry",
      })[field] || field,
  );
  const result = database
    .prepare(
      `INSERT INTO asset (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`,
    )
    .run(...assetFields.map((field) => values[field]));
  return getAsset(database, Number(result.lastInsertRowid));
}

function updateAsset(database, id, values) {
  const columns = assetFields.map(
    (field) =>
      ({
        assetCode: "asset_code",
        assetName: "asset_name",
        type: "asset_type",
        serialNumber: "serial_number",
        purchaseDate: "purchase_date",
        purchaseCost: "purchase_cost",
        warrantyStart: "warranty_start",
        warrantyExpiry: "warranty_expiry",
      })[field] || field,
  );
  database
    .prepare(
      `
    UPDATE asset SET ${columns.map((column) => `${column} = ?`).join(", ")},
      updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `,
    )
    .run(...assetFields.map((field) => values[field]), id);
}

function handleDashboard(database, method, segments) {
  if (method !== "GET" || segments.length !== 2 || segments[1] !== "summary") {
    throw new ApiError(405, "Method not allowed");
  }
  const counts = database
    .prepare(
      `
    SELECT count(*) AS totalAssets,
      sum(status = 'ACTIVE') AS activeAssets,
      sum(status = 'AVAILABLE') AS availableAssets,
      sum(status = 'ASSIGNED') AS assignedAssets,
      sum(status = 'UNDER_MAINTENANCE') AS underMaintenance,
      sum(status = 'RETIRED') AS retiredAssets
    FROM asset
  `,
    )
    .get();
  return response(
    Object.fromEntries(
      Object.entries(counts).map(([key, value]) => [key, value || 0]),
    ),
    "Dashboard summary loaded",
  );
}

function isValidCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function getAssignment(database, id) {
  return database
    .prepare(
      `
      SELECT aa.*, a.asset_code, a.asset_name, a.category, a.asset_type,
             a.serial_number, e.full_name AS employee_name
      FROM asset_assignment aa
      JOIN asset a ON a.id = aa.asset_id
      JOIN employee e ON e.id = aa.employee_id
      WHERE aa.id = ?
    `,
    )
    .get(id);
}

function validateAssignmentActionDate(value, field, assignedDate) {
  const errors = {};
  const today = new Date().toISOString().slice(0, 10);
  if (!isValidCalendarDate(value)) {
    errors[field] = "Enter a valid date";
  } else if (value > today) {
    errors[field] = "Date cannot be in the future";
  } else if (value < assignedDate) {
    errors[field] = "Date cannot be before the assignment date";
  }
  if (Object.keys(errors).length) {
    throw new ApiError(400, "Please correct the highlighted fields", errors);
  }
}

async function handleAssignmentAction(database, id, action, request) {
  const current = getAssignment(database, id);
  if (!current) throw new ApiError(404, "Assignment not found");
  if (current.returned_date !== null) {
    throw new ApiError(409, "This assignment is no longer active");
  }

  const body = await readJson(request);
  let actionDate;
  let targetEmployeeId;
  if (action === "return") {
    actionDate =
      typeof body?.returnedDate === "string" ? body.returnedDate : "";
    validateAssignmentActionDate(
      actionDate,
      "returnedDate",
      current.assigned_date,
    );
  } else {
    actionDate =
      typeof body?.assignedDate === "string" ? body.assignedDate : "";
    validateAssignmentActionDate(
      actionDate,
      "assignedDate",
      current.assigned_date,
    );
    targetEmployeeId = Number(body?.employeeId);
    if (!Number.isSafeInteger(targetEmployeeId) || targetEmployeeId < 1) {
      throw new ApiError(400, "Choose an employee", {
        employeeId: "Choose an employee",
      });
    }
    if (targetEmployeeId === current.employee_id) {
      throw new ApiError(400, "Choose a different employee", {
        employeeId: "Choose a different employee",
      });
    }
    const employee = database
      .prepare("SELECT active FROM employee WHERE id = ?")
      .get(targetEmployeeId);
    if (!employee) throw new ApiError(404, "Employee not found");
    if (!employee.active) {
      throw new ApiError(
        400,
        "Equipment can only be transferred to an active employee",
      );
    }
  }

  database.exec("BEGIN IMMEDIATE");
  try {
    const activeAssignment = getAssignment(database, id);
    if (!activeAssignment) throw new ApiError(404, "Assignment not found");
    if (activeAssignment.returned_date !== null) {
      throw new ApiError(409, "This assignment is no longer active");
    }

    if (action === "transfer") {
      const employee = database
        .prepare("SELECT active FROM employee WHERE id = ?")
        .get(targetEmployeeId);
      if (!employee) throw new ApiError(404, "Employee not found");
      if (!employee.active) {
        throw new ApiError(
          400,
          "Equipment can only be transferred to an active employee",
        );
      }
    }

    const update = database
      .prepare(
        "UPDATE asset_assignment SET returned_date = ? WHERE id = ? AND returned_date IS NULL",
      )
      .run(actionDate, id);
    if (update.changes !== 1) {
      throw new ApiError(409, "This assignment is no longer active");
    }

    let resultId = id;
    if (action === "return") {
      database
        .prepare(
          "UPDATE asset SET status = 'AVAILABLE', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        )
        .run(current.asset_id);
    } else {
      const result = database
        .prepare(
          "INSERT INTO asset_assignment (asset_id, employee_id, assigned_date) VALUES (?, ?, ?)",
        )
        .run(current.asset_id, targetEmployeeId, actionDate);
      resultId = Number(result.lastInsertRowid);
      database
        .prepare(
          "UPDATE asset SET status = 'ASSIGNED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        )
        .run(current.asset_id);
    }

    database.exec("COMMIT");
    const message =
      action === "return"
        ? "Equipment returned successfully"
        : "Equipment transferred successfully";
    return response(
      assignmentResponse(getAssignment(database, resultId)),
      message,
    );
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

async function handleAssignments(database, method, segments, request) {
  if (
    method === "POST" &&
    segments.length === 3 &&
    ["return", "transfer"].includes(segments[2])
  ) {
    const id = parseId(segments[1], "Assignment id");
    return handleAssignmentAction(database, id, segments[2], request);
  }

  if (method !== "POST" || segments.length !== 1)
    throw new ApiError(405, "Method not allowed");

  const body = await readJson(request);
  const errors = {};
  const employeeId = Number(body?.employeeId);
  const assetId = Number(body?.assetId);
  const assignedDate =
    typeof body?.assignedDate === "string" ? body.assignedDate : "";
  const today = new Date().toISOString().slice(0, 10);
  if (!Number.isSafeInteger(employeeId) || employeeId < 1)
    errors.employeeId = "Choose an employee";
  if (!Number.isSafeInteger(assetId) || assetId < 1)
    errors.assetId = "Choose a device";
  if (!isValidCalendarDate(assignedDate)) {
    errors.assignedDate = "Enter a valid assignment date";
  } else if (assignedDate > today) {
    errors.assignedDate = "Assignment date cannot be in the future";
  }
  if (Object.keys(errors).length)
    throw new ApiError(400, "Please correct the highlighted fields", errors);

  const employee = database
    .prepare("SELECT * FROM employee WHERE id = ?")
    .get(employeeId);
  if (!employee) throw new ApiError(404, "Employee not found");
  if (!employee.active)
    throw new ApiError(
      400,
      "Equipment can only be assigned to an active employee",
    );
  const asset = getAsset(database, assetId);
  if (!asset) throw new ApiError(404, "Asset not found");
  if (asset.status !== "AVAILABLE")
    throw new ApiError(400, "Only available assets can be assigned");

  database.exec("BEGIN IMMEDIATE");
  try {
    const result = database
      .prepare(
        `
      INSERT INTO asset_assignment (asset_id, employee_id, assigned_date)
      VALUES (?, ?, ?)
    `,
      )
      .run(assetId, employeeId, assignedDate);
    database
      .prepare(
        `
      UPDATE asset SET status = 'ASSIGNED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?
    `,
      )
      .run(assetId);
    database.exec("COMMIT");
    const row = database
      .prepare(
        `
      SELECT aa.id, aa.asset_id, a.asset_code, a.asset_name, a.category,
             a.asset_type, a.serial_number, aa.employee_id, e.full_name AS employee_name,
             aa.assigned_date
      FROM asset_assignment aa
      JOIN asset a ON a.id = aa.asset_id
      JOIN employee e ON e.id = aa.employee_id
      WHERE aa.id = ?
    `,
      )
      .get(Number(result.lastInsertRowid));
    return response(
      assignmentResponse(row),
      "Equipment assigned successfully",
      201,
    );
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

async function dispatch(request, context) {
  const { segments = [] } = await context.params;
  const database = getLocalDatabase();
  const method = request.method.toUpperCase();
  const url = new URL(request.url);
  const [resource] = segments;

  if (resource === "employees")
    return handleEmployees(database, method, segments, url, request);
  if (resource === "departments")
    return handleDepartments(database, method, segments, url, request);
  if (resource === "assets")
    return handleAssets(database, method, segments, url, request);
  if (resource === "dashboard")
    return handleDashboard(database, method, segments);
  if (resource === "assignments")
    return handleAssignments(database, method, segments, request);
  throw new ApiError(404, "API endpoint not found");
}

async function handle(request, context) {
  try {
    return await dispatch(request, context);
  } catch (error) {
    const requestPath = new URL(request.url).pathname;
    let status = error instanceof ApiError ? error.status : 500;
    let message =
      error instanceof ApiError
        ? error.message
        : "An unexpected server error occurred";
    let errors = error instanceof ApiError ? error.errors : {};

    if (
      error?.code === "ERR_SQLITE_ERROR" &&
      /UNIQUE constraint failed/i.test(error.message)
    ) {
      status = 409;
      errors = {};
      if (requestPath.startsWith("/api/departments")) {
        message =
          "A department or division with this name and type already exists";
      } else if (requestPath.startsWith("/api/employees")) {
        message = "An employee with this work email already exists";
      } else if (requestPath.startsWith("/api/assignments")) {
        message = "This asset already has an active assignment";
      } else {
        message =
          "An asset with this asset code or serial number already exists";
      }
    } else if (!(error instanceof ApiError)) {
      console.error("Local API request failed", {
        method: request.method,
        path: requestPath,
        error,
      });
    }

    return Response.json(
      {
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString(),
        path: requestPath,
      },
      { status },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
