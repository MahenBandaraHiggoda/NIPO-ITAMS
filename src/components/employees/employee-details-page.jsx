"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Building2,
  CalendarDays,
  Check,
  CircleAlert,
  History,
  Mail,
  Monitor,
  Pencil,
  RefreshCw,
  RotateCcw,
  X,
  Users,
} from "lucide-react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";

async function getEmployee(employeeId, signal) {
  const response = await fetch(`${apiBase}/employees/${employeeId}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The employee service returned an invalid response.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        `The employee service returned HTTP ${response.status}.`,
    );
  }

  const employee = result?.data;
  if (
    !Number.isInteger(employee?.id) ||
    typeof employee.fullName !== "string" ||
    typeof employee.active !== "boolean" ||
    (employee.workEmail !== null && typeof employee.workEmail !== "string") ||
    (employee.departmentName !== null &&
      typeof employee.departmentName !== "string")
  ) {
    throw new Error(
      "The employee service returned an invalid employee record.",
    );
  }

  return employee;
}

async function getCurrentAssignments(employeeId, signal) {
  const response = await fetch(
    `${apiBase}/employees/${employeeId}/assignments`,
    {
      signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const body = await response.text();
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    if (!response.ok) {
      throw new Error(
        `The assignment service returned HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}.`,
      );
    }
    throw new Error("The assignment service returned an invalid response.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        `The assignment service returned HTTP ${response.status}.`,
    );
  }

  if (
    !Array.isArray(result?.data) ||
    result.data.some(
      (assignment) =>
        !Number.isInteger(assignment.id) ||
        !Number.isInteger(assignment.assetId) ||
        typeof assignment.assetCode !== "string" ||
        typeof assignment.assetName !== "string" ||
        typeof assignment.assignedDate !== "string",
    )
  ) {
    throw new Error("The assignment service returned invalid records.");
  }

  return result.data;
}

async function getAssignmentHistory(employeeId, signal) {
  const response = await fetch(
    `${apiBase}/employees/${employeeId}/assignment-history`,
    {
      signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const body = await response.text();
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    if (!response.ok) {
      throw new Error(
        `The assignment history service returned HTTP ${response.status}${body ? `: ${body.slice(0, 180)}` : ""}.`,
      );
    }
    throw new Error(
      "The assignment history service returned an invalid response.",
    );
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        `The assignment history service returned HTTP ${response.status}.`,
    );
  }

  if (
    !Array.isArray(result?.data) ||
    result.data.some(
      (assignment) =>
        !Number.isInteger(assignment.id) ||
        !Number.isInteger(assignment.assetId) ||
        typeof assignment.assetCode !== "string" ||
        typeof assignment.assetName !== "string" ||
        typeof assignment.assignedDate !== "string" ||
        typeof assignment.returnedDate !== "string",
    )
  ) {
    throw new Error("The assignment history service returned invalid records.");
  }

  return result.data;
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Employee details could not be loaded. Please try again.";
}

function getToday() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function AssignmentControls({ assignment, onChanged }) {
  const [mode, setMode] = useState("");
  const [actionDate, setActionDate] = useState(getToday);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "transfer") return;

    const controller = new AbortController();
    setEmployeesLoading(true);
    setEmployeesError("");
    fetch(
      `${apiBase}/employees?active=true&page=0&size=100&sort=fullName&direction=ASC`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    )
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message ||
              `The employee service returned HTTP ${response.status}.`,
          );
        }
        const content = result?.data?.content;
        if (
          !Array.isArray(content) ||
          content.some(
            (employee) =>
              !Number.isInteger(employee.id) ||
              typeof employee.fullName !== "string",
          )
        ) {
          throw new Error("The employee service returned an invalid list.");
        }
        setEmployees(
          content.filter((employee) => employee.id !== assignment.employeeId),
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setEmployeesError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setEmployeesLoading(false);
      });

    return () => controller.abort();
  }, [assignment.employeeId, mode]);

  function openAction(nextMode) {
    setActionDate(getToday());
    setActionError("");
    setMode((currentMode) => (currentMode === nextMode ? "" : nextMode));
  }

  async function submitAction(event) {
    event.preventDefault();
    setSaving(true);
    setActionError("");

    const isTransfer = mode === "transfer";
    const requestBody = isTransfer
      ? {
          employeeId: Number(event.currentTarget.elements.employeeId.value),
          assignedDate: actionDate,
        }
      : { returnedDate: actionDate };

    try {
      const response = await fetch(
        `${apiBase}/assignments/${assignment.id}/${mode}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );
      const result = await response.json();
      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message ||
            `The assignment service returned HTTP ${response.status}.`,
        );
      }
      setMode("");
      onChanged();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="employee-assignment-actions">
        <button
          type="button"
          className="employee-assignment-action-button"
          disabled={saving}
          aria-expanded={mode === "return"}
          onClick={() => openAction("return")}
        >
          <RotateCcw size={12} aria-hidden="true" />
          Return
        </button>
        <button
          type="button"
          className="employee-assignment-action-button"
          disabled={saving}
          aria-expanded={mode === "transfer"}
          onClick={() => openAction("transfer")}
        >
          <ArrowRightLeft size={12} aria-hidden="true" />
          Transfer
        </button>
      </div>

      {mode && (
        <form
          className="employee-assignment-action-form"
          onSubmit={submitAction}
        >
          {mode === "transfer" && (
            <label>
              <span>Transfer to</span>
              {employeesLoading ? (
                <small>Loading active employees…</small>
              ) : (
                <select
                  required
                  name="employeeId"
                  defaultValue=""
                  disabled={employees.length === 0 || Boolean(employeesError)}
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              )}
              {employeesError ? (
                <small className="employee-assignment-action-error">
                  {employeesError}
                </small>
              ) : (
                !employeesLoading &&
                employees.length === 0 && (
                  <small>No other active employees are available.</small>
                )
              )}
            </label>
          )}
          <label>
            <span>{mode === "return" ? "Return date" : "Transfer date"}</span>
            <input
              required
              type="date"
              min={assignment.assignedDate}
              max={getToday()}
              value={actionDate}
              onChange={(event) => setActionDate(event.target.value)}
            />
          </label>
          {actionError && (
            <p className="employee-assignment-action-error" role="alert">
              {actionError}
            </p>
          )}
          <div className="employee-assignment-action-buttons">
            <button
              type="button"
              className="employee-assignment-action-button"
              disabled={saving}
              onClick={() => setMode("")}
            >
              <X size={12} aria-hidden="true" />
              Cancel
            </button>
            <button
              type="submit"
              className="employee-assignment-action-submit"
              disabled={
                saving ||
                (mode === "transfer" &&
                  (employeesLoading ||
                    employees.length === 0 ||
                    Boolean(employeesError)))
              }
            >
              <Check size={12} aria-hidden="true" />
              {saving
                ? "Saving…"
                : mode === "return"
                  ? "Confirm return"
                  : "Confirm transfer"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default function EmployeeDetailsPage({ employeeId }) {
  const [employee, setEmployee] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let employeeLoaded = false;
    setLoading(true);
    setAssignmentsLoading(true);
    setHistoryLoading(true);
    setError("");
    setAssignmentsError("");
    setHistoryError("");

    getEmployee(employeeId, controller.signal)
      .then((employeeData) => {
        setEmployee(employeeData);
        employeeLoaded = true;
        setLoading(false);
        return Promise.all([
          getCurrentAssignments(employeeId, controller.signal)
            .then(setAssignments)
            .catch((requestError) => {
              if (requestError.name !== "AbortError") {
                setAssignments([]);
                setAssignmentsError(getErrorMessage(requestError));
              }
            }),
          getAssignmentHistory(employeeId, controller.signal)
            .then(setAssignmentHistory)
            .catch((requestError) => {
              if (requestError.name !== "AbortError") {
                setAssignmentHistory([]);
                setHistoryError(getErrorMessage(requestError));
              }
            }),
        ]);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          if (!employeeLoaded) {
            setEmployee(null);
            setError(getErrorMessage(requestError));
          }
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setAssignmentsLoading(false);
          setHistoryLoading(false);
        }
      });

    return () => controller.abort();
  }, [employeeId, refreshKey]);

  return (
    <div className="employee-details-page">
      <div className="module-breadcrumb">
        <Link href="/">Dashboard</Link>
        <span>/</span>
        <Link href="/employees">Employees</Link>
        <span>/</span>
        <span>{employee?.fullName || "Employee details"}</span>
      </div>

      {loading ? (
        <section className="panel employee-details-state" role="status">
          <span className="loading-spinner" />
          Loading employee details…
        </section>
      ) : error ? (
        <section className="panel employee-details-state" role="alert">
          <CircleAlert size={19} aria-hidden="true" />
          <div>
            <strong>Could not load employee details</strong>
            <p>{error}</p>
            <button
              type="button"
              className="employee-retry-button"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              <RefreshCw size={13} aria-hidden="true" />
              Retry
            </button>
            <Link href="/employees" className="employee-details-back-link">
              Back to employees
            </Link>
          </div>
        </section>
      ) : (
        <>
          <header className="employee-details-heading">
            <div className="employee-details-title">
              <span className="employee-details-avatar">
                <Users size={20} aria-hidden="true" />
              </span>
              <div>
                <span className="section-kicker">EMPLOYEE RECORD</span>
                <h1>{employee.fullName}</h1>
              </div>
            </div>
            <div className="employee-details-actions">
              <span
                className={`employee-status${employee.active ? " is-active" : " is-inactive"}`}
              >
                <span />
                {employee.active ? "Active" : "Inactive"}
              </span>
              <Link
                href={`/employees/${employee.id}/edit`}
                className="employee-add-button"
              >
                <Pencil size={14} aria-hidden="true" />
                Edit employee
              </Link>
            </div>
          </header>

          <section className="panel employee-details-panel">
            <div className="employee-details-panel-heading">
              <div>
                <span className="section-kicker">EMPLOYEE INFORMATION</span>
                <h2>Contact and organization</h2>
              </div>
            </div>
            <dl className="employee-details-grid">
              <div className="employee-detail-item">
                <dt>
                  <Mail size={14} aria-hidden="true" />
                  Work email
                </dt>
                <dd>{employee.workEmail || "Not provided"}</dd>
              </div>
              <div className="employee-detail-item">
                <dt>
                  <Building2 size={14} aria-hidden="true" />
                  Department / division
                </dt>
                <dd>
                  {employee.departmentName
                    ? `${employee.departmentName} (${
                        employee.departmentType === "DIVISION"
                          ? "Division"
                          : "Department"
                      })`
                    : "No department/division assigned"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel employee-details-panel">
            <div className="employee-details-panel-heading employee-assignment-heading">
              <div>
                <span className="section-kicker">ASSET REGISTER</span>
                <h2>Assigned equipment</h2>
              </div>
              <Link
                href={`/assignments/new?employeeId=${employee.id}`}
                className="employee-add-button"
              >
                Assign equipment
              </Link>
            </div>

            {assignmentsError ? (
              <div className="employee-assignment-error" role="alert">
                <CircleAlert size={16} aria-hidden="true" />
                <div>
                  <strong>Could not load assigned equipment</strong>
                  <p>{assignmentsError}</p>
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
            ) : assignmentsLoading ? (
              <div className="register-loading" role="status">
                <span className="loading-spinner" />
                Loading assigned equipment…
              </div>
            ) : assignments.length > 0 ? (
              <div className="employee-assignment-list">
                {assignments.map((assignment) => (
                  <article
                    className="employee-assignment-item"
                    key={assignment.id}
                  >
                    <span className="employee-assignment-icon">
                      <Monitor size={17} aria-hidden="true" />
                    </span>
                    <div className="employee-assignment-asset">
                      <strong>{assignment.assetName}</strong>
                      <span>
                        {assignment.assetCode}
                        {assignment.category ? ` · ${assignment.category}` : ""}
                        {assignment.type ? ` · ${assignment.type}` : ""}
                      </span>
                    </div>
                    <div className="employee-assignment-date">
                      <CalendarDays size={14} aria-hidden="true" />
                      Assigned{" "}
                      {new Date(
                        `${assignment.assignedDate}T00:00:00`,
                      ).toLocaleDateString()}
                    </div>
                    <AssignmentControls
                      assignment={assignment}
                      onChanged={() => setRefreshKey((key) => key + 1)}
                    />
                  </article>
                ))}
              </div>
            ) : (
              <div className="employee-assignment-empty">
                No equipment is currently assigned to this employee.
              </div>
            )}
          </section>

          <section className="panel employee-details-panel">
            <div className="employee-details-panel-heading">
              <div>
                <span className="section-kicker">ASSIGNMENT HISTORY</span>
                <h2>Previous equipment assignments</h2>
              </div>
            </div>

            {historyError ? (
              <div className="employee-assignment-error" role="alert">
                <CircleAlert size={16} aria-hidden="true" />
                <div>
                  <strong>Could not load assignment history</strong>
                  <p>{historyError}</p>
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
            ) : historyLoading ? (
              <div className="register-loading" role="status">
                <span className="loading-spinner" />
                Loading assignment history…
              </div>
            ) : assignmentHistory.length > 0 ? (
              <div className="employee-assignment-history-list">
                {assignmentHistory.map((assignment) => (
                  <article
                    className="employee-assignment-history-item"
                    key={assignment.id}
                  >
                    <span className="employee-assignment-icon">
                      <History size={17} aria-hidden="true" />
                    </span>
                    <div className="employee-assignment-asset">
                      <strong>{assignment.assetName}</strong>
                      <span>
                        {assignment.assetCode}
                        {assignment.category ? ` · ${assignment.category}` : ""}
                        {assignment.type ? ` · ${assignment.type}` : ""}
                      </span>
                    </div>
                    <div className="employee-assignment-history-dates">
                      <div>
                        <span>Assigned</span>
                        <strong>
                          {new Date(
                            `${assignment.assignedDate}T00:00:00`,
                          ).toLocaleDateString()}
                        </strong>
                      </div>
                      <div>
                        <span>Returned / transferred</span>
                        <strong>
                          {new Date(
                            `${assignment.returnedDate}T00:00:00`,
                          ).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="employee-assignment-empty">
                No previous equipment assignments.
              </div>
            )}
          </section>

          <Link href="/employees" className="employee-details-back-link">
            Back to employee directory
          </Link>
        </>
      )}
    </div>
  );
}
