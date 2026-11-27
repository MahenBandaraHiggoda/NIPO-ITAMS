"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CircleAlert, Pencil, Plus, RefreshCw } from "lucide-react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";

async function getDepartments(signal) {
  const response = await fetch(`${apiBase}/departments`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The department service returned an invalid response.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        `The department service returned HTTP ${response.status}.`,
    );
  }

  if (
    !Array.isArray(result?.data) ||
    result.data.some(
      (unit) =>
        !Number.isInteger(unit.id) ||
        typeof unit.name !== "string" ||
        typeof unit.type !== "string" ||
        typeof unit.active !== "boolean",
    )
  ) {
    throw new Error("The department service returned invalid records.");
  }

  return result.data;
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Departments and divisions could not be loaded. Please try again.";
}

export default function DepartmentListPage() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    getDepartments(controller.signal)
      .then(setDepartments)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setDepartments([]);
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [refreshKey]);

  const visibleDepartments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return departments.filter((department) => {
      const matchesSearch =
        !normalizedSearch ||
        `${department.name} ${department.type}`
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus =
        activeFilter === "all" || String(department.active) === activeFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeFilter, departments, search]);

  return (
    <div className="department-directory-page">
      <div className="module-breadcrumb">
        <Link href="/">Dashboard</Link>
        <span>/</span>
        <Link href="/employees">Employees</Link>
        <span>/</span>
        <span>Departments and divisions</span>
      </div>

      <header className="employee-directory-heading">
        <div>
          <span className="section-kicker">ORGANIZATIONAL UNITS</span>
          <h1>Departments &amp; divisions</h1>
          <p>Manage the units available in employee records.</p>
        </div>
        <div className="employee-directory-heading-actions">
          <Link href="/employees" className="department-back-link">
            Back to employees
          </Link>
          <Link href="/departments/new" className="employee-add-button">
            <Plus size={15} aria-hidden="true" />
            Add unit
          </Link>
        </div>
      </header>

      <section
        className="panel department-directory-panel"
        aria-label="Departments and divisions"
      >
        <div className="department-directory-toolbar">
          <label className="department-search-field">
            <span className="sr-only">Search departments and divisions</span>
            <input
              type="search"
              placeholder="Search by name or type"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="department-filter-field">
            <span className="sr-only">Filter by unit status</span>
            <select
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
        </div>

        {error ? (
          <div className="inline-error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>Could not load departments and divisions</strong>
              <p>{error}</p>
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
        ) : loading ? (
          <div className="register-loading" role="status">
            <span className="loading-spinner" />
            Loading departments and divisions…
          </div>
        ) : visibleDepartments.length > 0 ? (
          <div className="register-table-wrap">
            <table className="register-table department-directory-table">
              <caption className="sr-only">
                Department and division directory
              </caption>
              <thead>
                <tr>
                  <th scope="col">NAME</th>
                  <th scope="col">TYPE</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {visibleDepartments.map((department) => (
                  <tr key={department.id}>
                    <td>
                      <strong>{department.name}</strong>
                    </td>
                    <td>
                      {department.type === "DIVISION"
                        ? "Division"
                        : "Department"}
                    </td>
                    <td>
                      <span
                        className={`employee-status${department.active ? " is-active" : " is-inactive"}`}
                      >
                        <span />
                        {department.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/departments/${department.id}/edit`}
                        className="employee-edit-link"
                        aria-label={`Edit ${department.name}`}
                      >
                        <Pencil size={13} aria-hidden="true" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="register-empty">
            <span className="empty-register-icon">
              <Building2 size={21} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <strong>
              {search || activeFilter !== "all"
                ? "No matching departments or divisions"
                : "No departments or divisions recorded yet"}
            </strong>
            <p>
              {search || activeFilter !== "all"
                ? "Change your search or status filter and try again."
                : "Add a unit so employees can be assigned to it."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
