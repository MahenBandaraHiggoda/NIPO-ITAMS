"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Building2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";
const pageSize = 10;

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "The employee directory could not be loaded. Please try again.";
}

async function getEmployees(path, signal) {
  const response = await fetch(`${apiBase}${path}`, {
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

  const data = result?.data;
  if (
    !Array.isArray(data?.content) ||
    !Number.isInteger(data.number) ||
    !Number.isInteger(data.size) ||
    !Number.isInteger(data.totalElements) ||
    !Number.isInteger(data.totalPages)
  ) {
    throw new Error("The employee service returned an invalid directory page.");
  }

  return data;
}

export default function EmployeeListPage() {
  const [directory, setDirectory] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      size: String(pageSize),
      sort: "fullName",
      direction: "ASC",
    });

    if (search) params.set("search", search);
    if (activeFilter !== "all") params.set("active", activeFilter);

    setLoading(true);
    setError("");

    getEmployees(`/employees?${params}`, controller.signal)
      .then(setDirectory)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setDirectory(null);
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeFilter, page, refreshKey, search]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  const employees = directory?.content ?? [];
  const totalEmployees = directory?.totalElements ?? 0;
  const totalPages = Math.max(directory?.totalPages ?? 0, 1);
  const firstItem = totalEmployees === 0 ? 0 : page * pageSize + 1;
  const lastItem =
    totalEmployees === 0
      ? 0
      : Math.min(firstItem + employees.length - 1, totalEmployees);

  return (
    <div className="employee-directory-page">
      <div className="module-breadcrumb">
        <Link href="/">Dashboard</Link>
        <span>/</span>
        <span>Employees</span>
      </div>

      <header className="employee-directory-heading">
        <div>
          <span className="section-kicker">ASSET MANAGEMENT</span>
          <h1>Employees</h1>
          <p>Find employees and see their department or division.</p>
        </div>
        <div className="employee-directory-heading-actions">
          <Link href="/departments" className="department-manage-link">
            <Building2 size={14} aria-hidden="true" />
            Manage units
          </Link>
          <span className="employee-directory-total">
            <Users size={16} aria-hidden="true" />
            {loading ? "Loading directory" : `${totalEmployees} employees`}
          </span>
          <Link href="/employees/new" className="employee-add-button">
            <Plus size={15} aria-hidden="true" />
            Add employee
          </Link>
        </div>
      </header>

      <section
        className="panel employee-directory-panel"
        aria-label="Employee directory"
      >
        <div className="employee-directory-toolbar">
          <div className="employee-directory-toolbar-title">
            <h2>Employee directory</h2>
            <p>Search by name, work email, or department/division.</p>
          </div>

          <form className="employee-directory-filters" onSubmit={submitSearch}>
            <label className="employee-search-field">
              <span className="sr-only">Search employees</span>
              <input
                type="search"
                placeholder="Search employees"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </label>
            <label className="employee-filter-field">
              <span className="sr-only">Filter by employee status</span>
              <select
                value={activeFilter}
                onChange={(event) => {
                  setPage(0);
                  setActiveFilter(event.target.value);
                }}
              >
                <option value="all">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <button type="submit" className="employee-search-button">
              <Search size={14} aria-hidden="true" />
              Search
            </button>
          </form>
        </div>

        {error ? (
          <div className="inline-error" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>Could not load employees</strong>
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
            Loading employees…
          </div>
        ) : employees.length > 0 ? (
          <>
            <div className="register-table-wrap">
              <table className="register-table employee-directory-table">
                <caption className="sr-only">Employee directory</caption>
                <thead>
                  <tr>
                    <th scope="col">EMPLOYEE</th>
                    <th scope="col">DEPARTMENT / DIVISION</th>
                    <th scope="col">WORK EMAIL</th>
                    <th scope="col">STATUS</th>
                    <th scope="col">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <Link
                          href={`/employees/${employee.id}`}
                          className="employee-name-link"
                        >
                          {employee.fullName}
                        </Link>
                      </td>
                      <td>
                        {employee.departmentName ? (
                          <>
                            <strong>{employee.departmentName}</strong>
                            <small>
                              {employee.departmentType === "DIVISION"
                                ? "Division"
                                : "Department"}
                            </small>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{employee.workEmail || "—"}</td>
                      <td>
                        <span
                          className={`employee-status${employee.active ? " is-active" : " is-inactive"}`}
                        >
                          <span />
                          {employee.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/employees/${employee.id}/edit`}
                          className="employee-edit-link"
                          aria-label={`Edit ${employee.fullName}`}
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

            <div className="register-footer employee-directory-footer">
              <span>
                Showing {firstItem}–{lastItem} of {totalEmployees} employees
              </span>
              <nav className="employee-pagination" aria-label="Employee pages">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page === 0}
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
                <span>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </nav>
            </div>
          </>
        ) : (
          <div className="register-empty">
            <span className="empty-register-icon">
              <Users size={21} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <strong>
              {search || activeFilter !== "all"
                ? "No matching employees"
                : "No employees recorded yet"}
            </strong>
            <p>
              {search || activeFilter !== "all"
                ? "Change your search or status filter and try again."
                : "Employee records will appear here when they are added."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
