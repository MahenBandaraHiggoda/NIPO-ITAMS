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
        `The department service returned HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}.`,
      );
    }
    throw new Error("The department service returned an invalid response.");
  }

  if (!response.ok || result?.success === false) {
    const fieldErrors = Object.values(result?.errors || {}).filter(Boolean);
    throw new Error(
      fieldErrors.length
        ? `${result?.message || "Please correct the form"}: ${fieldErrors.join("; ")}`
        : result?.message ||
            `The department service returned HTTP ${response.status}.`,
    );
  }

  return result?.data;
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "The department or division could not be loaded. Please try again.";
}

export default function DepartmentForm({ departmentId }) {
  const router = useRouter();
  const editing = Boolean(departmentId);
  const [values, setValues] = useState({
    name: "",
    type: "DEPARTMENT",
    active: true,
  });
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!editing) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    requestApi(`/departments/${departmentId}`, {}, controller.signal)
      .then((department) => {
        if (
          !department ||
          !Number.isInteger(department.id) ||
          typeof department.name !== "string" ||
          !["DEPARTMENT", "DIVISION"].includes(department.type) ||
          typeof department.active !== "boolean"
        ) {
          throw new Error("The department service returned an invalid record.");
        }
        setValues({
          name: department.name,
          type: department.type,
          active: department.active,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [departmentId, editing, refreshKey]);

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

    try {
      await requestApi(
        editing ? `/departments/${departmentId}` : "/departments",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify({
            name: values.name.trim(),
            type: values.type,
            active: values.active,
          }),
        },
      );
      router.push("/departments");
      router.refresh();
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="department-form-page">
      <div className="module-breadcrumb">
        <Link href="/">Dashboard</Link>
        <span>/</span>
        <Link href="/employees">Employees</Link>
        <span>/</span>
        <Link href="/departments">Departments and divisions</Link>
        <span>/</span>
        <span>{editing ? "Edit unit" : "New unit"}</span>
      </div>

      <header className="employee-directory-heading">
        <div>
          <span className="section-kicker">ORGANIZATIONAL UNITS</span>
          <h1>{editing ? "Edit unit" : "Add department or division"}</h1>
          <p>
            {editing
              ? "Update the unit name, type, or active status."
              : "Add a department or division for employee records."}
          </p>
        </div>
      </header>

      <section className="panel department-form-panel">
        {loading ? (
          <div className="register-loading" role="status">
            <span className="loading-spinner" />
            Loading department form…
          </div>
        ) : loadError ? (
          <div className="inline-error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>Could not load the department form</strong>
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
                  Unit name <b aria-hidden="true">*</b>
                </span>
                <input
                  maxLength={120}
                  name="name"
                  onChange={updateField}
                  required
                  value={values.name}
                />
              </label>

              <label className="employee-form-field">
                <span>Type</span>
                <select name="type" onChange={updateField} value={values.type}>
                  <option value="DEPARTMENT">Department</option>
                  <option value="DIVISION">Division</option>
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
              <Link href="/departments" className="employee-cancel-link">
                <ArrowLeft size={14} aria-hidden="true" />
                Cancel
              </Link>
              <button
                type="submit"
                className="employee-save-button"
                disabled={saving}
              >
                {saving ? "Saving…" : editing ? "Save changes" : "Create unit"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
