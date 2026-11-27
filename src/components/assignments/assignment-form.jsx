"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleAlert } from "lucide-react";

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
        `The service returned HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}.`,
      );
    }
    throw new Error("The service returned an invalid response.");
  }

  if (!response.ok || result?.success === false) {
    const fieldErrors = Object.values(result?.errors || {}).filter(Boolean);
    throw new Error(
      fieldErrors.length
        ? `${result?.message || "Please correct the form"}: ${fieldErrors.join("; ")}`
        : result?.message || `The service returned HTTP ${response.status}.`,
    );
  }

  return result?.data;
}

function getToday() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "The assignment form could not be loaded. Please try again.";
}

export default function AssignmentForm({ initialEmployeeId = "" }) {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employeeId, setEmployeeId] = useState(String(initialEmployeeId));
  const [assetId, setAssetId] = useState("");
  const [assignedDate, setAssignedDate] = useState(getToday);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    Promise.all([
      requestApi(
        "/employees?active=true&page=0&size=100&sort=fullName&direction=ASC",
        {},
        controller.signal,
      ),
      requestApi(
        "/assets?status=AVAILABLE&page=0&size=100&sort=assetName&direction=ASC",
        {},
        controller.signal,
      ),
    ])
      .then(([employeePage, assetPage]) => {
        if (
          !Array.isArray(employeePage?.content) ||
          employeePage.content.some(
            (employee) =>
              !Number.isInteger(employee.id) ||
              typeof employee.fullName !== "string" ||
              !employee.active,
          )
        ) {
          throw new Error("The employee service returned an invalid list.");
        }
        if (
          !Array.isArray(assetPage?.content) ||
          assetPage.content.some(
            (asset) =>
              !Number.isInteger(asset.id) ||
              typeof asset.assetCode !== "string" ||
              typeof asset.assetName !== "string",
          )
        ) {
          throw new Error("The asset service returned an invalid list.");
        }

        setEmployees(employeePage.content);
        setAssets(assetPage.content);
        if (
          !employeePage.content.some(
            (employee) => String(employee.id) === String(initialEmployeeId),
          )
        ) {
          setEmployeeId("");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [initialEmployeeId]);

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      const assignment = await requestApi("/assignments", {
        method: "POST",
        body: JSON.stringify({
          employeeId: Number(employeeId),
          assetId: Number(assetId),
          assignedDate,
        }),
      });
      router.push(`/employees/${assignment.employeeId}`);
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
        <span>Assign equipment</span>
      </div>

      <header className="employee-directory-heading">
        <div>
          <span className="section-kicker">ASSET MANAGEMENT</span>
          <h1>Assign equipment</h1>
          <p>
            Select an active employee, an available device, and its assignment
            date.
          </p>
        </div>
      </header>

      <section className="panel employee-form-panel">
        {loading ? (
          <div className="register-loading" role="status">
            <span className="loading-spinner" />
            Loading employees and available equipment…
          </div>
        ) : loadError ? (
          <div className="inline-error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>Could not load the assignment form</strong>
              <p>{loadError}</p>
            </div>
          </div>
        ) : (
          <form className="employee-form" onSubmit={submitForm}>
            <div className="employee-form-fields">
              <label className="employee-form-field">
                <span>
                  Employee <b aria-hidden="true">*</b>
                </span>
                <select
                  required
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
                {employees.length === 0 && (
                  <small>No active employees are available.</small>
                )}
              </label>

              <label className="employee-form-field">
                <span>
                  Device <b aria-hidden="true">*</b>
                </span>
                <select
                  required
                  value={assetId}
                  onChange={(event) => setAssetId(event.target.value)}
                >
                  <option value="">Select an available device</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetCode} — {asset.assetName}
                    </option>
                  ))}
                </select>
                {assets.length === 0 && (
                  <small>No available devices are in the asset register.</small>
                )}
              </label>

              <label className="employee-form-field">
                <span>
                  Assignment date <b aria-hidden="true">*</b>
                </span>
                <input
                  required
                  type="date"
                  max={getToday()}
                  value={assignedDate}
                  onChange={(event) => setAssignedDate(event.target.value)}
                />
              </label>
            </div>

            {saveError && (
              <div className="employee-form-save-error" role="alert">
                <CircleAlert size={16} aria-hidden="true" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="employee-form-actions">
              <Link
                href={employeeId ? `/employees/${employeeId}` : "/employees"}
                className="employee-cancel-link"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Cancel
              </Link>
              <button
                type="submit"
                className="employee-save-button"
                disabled={
                  saving ||
                  employees.length === 0 ||
                  assets.length === 0 ||
                  !employeeId ||
                  !assetId
                }
              >
                {saving ? "Assigning…" : "Assign equipment"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
