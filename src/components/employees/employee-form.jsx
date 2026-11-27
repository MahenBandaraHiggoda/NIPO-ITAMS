"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleAlert, RefreshCw } from "lucide-react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";

async function requestApi(path, options = {}, signal) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    signal,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const body = await response.text();
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    if (!response.ok) {
      throw new Error(
        `The employee service returned HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}.`,
      );
    }
    throw new Error("The employee service returned an invalid response.");
  }

  if (!response.ok || result?.success === false) {
    const fieldErrors = Object.values(result?.errors || {}).filter(Boolean);
    throw new Error(
      fieldErrors.length
        ? `${result?.message || "Please correct the form"}: ${fieldErrors.join("; ")}`
        : result?.message ||
            `The employee service returned HTTP ${response.status}.`,
    );
  }

  return result?.data;
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "The employee record could not be loaded. Please try again.";
}

export default function EmployeeForm({ employeeId }) {
  const router = useRouter();
  const editing = Boolean(employeeId);
  const [departments, setDepartments] = useState([]);
  const [existingDepartmentId, setExistingDepartmentId] = useState(null);
  const [values, setValues] = useState({
    fullName: "",
    workEmail: "",
    departmentId: "",
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    const departmentRequest = requestApi("/departments", {}, controller.signal);
    const employeeRequest = editing
      ? requestApi(`/employees/${employeeId}`, {}, controller.signal)
      : Promise.resolve(null);

    Promise.all([departmentRequest, employeeRequest])
      .then(([departmentData, employee]) => {
        if (!Array.isArray(departmentData)) {
          throw new Error("The department service returned an invalid list.");
        }
        if (
          departmentData.some(
            (department) =>
              !Number.isInteger(department.id) ||
              typeof department.name !== "string" ||
              typeof department.type !== "string" ||
              typeof department.active !== "boolean",
          )
        ) {
          throw new Error("The department service returned invalid records.");
        }
        setDepartments(departmentData);
        if (employee) {
          if (
            !Number.isInteger(employee.id) ||
            typeof employee.fullName !== "string" ||
            typeof employee.active !== "boolean"
          ) {
            throw new Error("The employee service returned an invalid record.");
          }
          setExistingDepartmentId(employee.departmentId ?? null);
          setValues({
            fullName: employee.fullName || "",
            workEmail: employee.workEmail || "",
            departmentId: employee.departmentId
              ? String(employee.departmentId)
              : "",
            active: Boolean(employee.active),
          });
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [editing, employeeId, refreshKey]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: name === "active" ? value === "true" : value,
    }));
  }

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    const payload = {
      fullName: values.fullName.trim(),
      workEmail: values.workEmail.trim() || null,
      departmentId: values.departmentId ? Number(values.departmentId) : null,
      active: values.active,
    };

    try {
      await requestApi(editing ? `/employees/${employeeId}` : "/employees", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      router.push("/employees");
      router.refresh();
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="employee-form-page">
      <div className="module-breadcrumb">
        <Link href="/">Dashboard</Link>
        <span>/</span>
        <Link href="/employees">Employees</Link>
        <span>/</span>
        <span>{editing ? "Edit employee" : "New employee"}</span>
      </div>

      <header className="employee-directory-heading">
        <div>
          <span className="section-kicker">EMPLOYEE DIRECTORY</span>
          <h1>{editing ? "Edit employee" : "Add employee"}</h1>
          <p>
            {editing
              ? "Update employee contact, department, and status details."
              : "Add an employee to the NIPO IT asset directory."}
          </p>
        </div>
      </header>

      <section className="panel employee-form-panel">
        {loading ? (
          <div className="register-loading" role="status">
            <span className="loading-spinner" />
            Loading employee form…
          </div>
        ) : loadError ? (
          <div className="inline-error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>Could not load the employee form</strong>
              <p>{loadError}</p>
              <button
                type="button"
                className="employee-retry-button"
                onClick={() => setRefreshKey((key) => key + 1)}
              >
                <RefreshCw size={13} aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <form className="employee-form" onSubmit={submitForm}>
            <div className="employee-form-fields">
              <label className="employee-form-field">
                <span>
                  Full name <b aria-hidden="true">*</b>
                </span>
                <input
                  autoComplete="name"
                  maxLength={160}
                  name="fullName"
                  onChange={updateField}
                  required
                  value={values.fullName}
                />
              </label>

              <label className="employee-form-field">
                <span>Work email</span>
                <input
                  autoComplete="email"
                  maxLength={254}
                  name="workEmail"
                  onChange={updateField}
                  type="email"
                  value={values.workEmail}
                />
              </label>

              <label className="employee-form-field">
                <span>Department / division</span>
                <select
                  name="departmentId"
                  onChange={updateField}
                  value={values.departmentId}
                >
                  <option value="">No department/division</option>
                  {departments.map((department) => {
                    const isCurrentUnit =
                      Number(existingDepartmentId) === department.id;
                    return (
                      <option
                        key={department.id}
                        value={department.id}
                        disabled={!department.active && !isCurrentUnit}
                      >
                        {department.name} (
                        {department.type === "DIVISION"
                          ? "Division"
                          : "Department"}
                        {!department.active ? ", inactive" : ""})
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="employee-form-field">
                <span>Status</span>
                <select
                  name="active"
                  onChange={updateField}
                  value={String(values.active)}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>

            {saveError && (
              <div className="employee-form-save-error" role="alert">
                <CircleAlert size={16} aria-hidden="true" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="employee-form-actions">
              <Link href="/employees" className="employee-cancel-link">
                <ArrowLeft size={14} aria-hidden="true" />
                Cancel
              </Link>
              <button
                type="submit"
                className="employee-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create employee"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
