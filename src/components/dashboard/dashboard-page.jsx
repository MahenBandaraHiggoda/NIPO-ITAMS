"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Laptop,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "/api";

const activityItems = [
  {
    id: 1,
    icon: Laptop,
    tone: "blue",
    title: "Laptop assigned to an employee",
    description: "NIPO-LT-042 · S. Perera, Legal Division",
    time: "Today, 10:42 AM",
    tag: "ASSIGNMENT",
  },
  {
    id: 2,
    icon: PackageOpen,
    tone: "gold",
    title: "New equipment received into store",
    description: "4 × 24-inch monitors · Main Store",
    time: "Today, 9:18 AM",
    tag: "STOCK IN",
  },
  {
    id: 3,
    icon: Wrench,
    tone: "green",
    title: "Maintenance request completed",
    description: "PRN-018 · Printer servicing",
    time: "Yesterday, 3:26 PM",
    tag: "MAINTENANCE",
  },
  {
    id: 4,
    icon: BriefcaseBusiness,
    tone: "red",
    title: "Procurement request submitted",
    description: "REQ-2026-014 · 6 workstations",
    time: "Yesterday, 11:05 AM",
    tag: "PENDING REVIEW",
  },
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-LK").format(value);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "The asset register could not be reached. Please try again.";
}

async function getApiData(path, signal) {
  const response = await fetch(`${apiBase}${path}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The asset register returned an invalid response.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || `The asset register returned HTTP ${response.status}.`,
    );
  }

  return result?.data;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
  detail,
  loading,
  source,
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-card-top">
        <span className={`metric-icon metric-icon-${tone}`}>
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span
          className={`metric-source${source === "Live" ? " source-live" : ""}`}
        >
          {source === "Live" && <span className="live-dot" />}
          {source}
        </span>
      </div>
      <p className="metric-value" aria-live="polite">
        {loading ? <span className="metric-skeleton" /> : formatNumber(value)}
      </p>
      <div className="metric-card-bottom">
        <span>{title}</span>
        <span className="metric-detail">{detail}</span>
      </div>
    </article>
  );
}

function ActivityFeed() {
  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">WHAT&apos;S HAPPENING</span>
          <h2>Recent activity</h2>
        </div>
        <span className="sample-label">SAMPLE ACTIVITY</span>
      </div>
      <div className="activity-list">
        {activityItems.map((item) => {
          const Icon = item.icon;
          return (
            <article className="activity-item" key={item.id}>
              <span className={`activity-icon activity-${item.tone}`}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="activity-copy">
                <div className="activity-title-row">
                  <h3>{item.title}</h3>
                  <span className={`activity-tag tag-${item.tone}`}>
                    {item.tag}
                  </span>
                </div>
                <p>{item.description}</p>
                <time>{item.time}</time>
              </div>
            </article>
          );
        })}
      </div>
      <Link className="panel-footer-link" href="/reports">
        View activity report <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}

function AssetRegister({ assets, loading, error }) {
  const [search, setSearch] = useState("");
  const visibleAssets = useMemo(() => {
    const records = Array.isArray(assets?.content)
      ? assets.content
      : Array.isArray(assets)
        ? assets
        : [];
    const normalizedSearch = search.trim().toLowerCase();

    return records.filter((asset) =>
      [
        asset.assetName,
        asset.assetCode,
        asset.category,
        asset.department,
        asset.status,
        asset.location,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        ),
    );
  }, [assets, search]);

  return (
    <section className="panel register-panel">
      <div className="panel-heading register-heading">
        <div>
          <span className="section-kicker">ASSET REGISTER</span>
          <h2>Recently updated equipment</h2>
          <p>Latest records from the NIPO asset register</p>
        </div>
        <label className="register-search">
          <span className="sr-only">Search recent assets</span>
          <input
            type="search"
            placeholder="Search equipment"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <div className="inline-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <div>
            <strong>Could not load the asset register</strong>
            <p>{error}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="register-loading" role="status">
          <span className="loading-spinner" />
          Loading asset records…
        </div>
      ) : visibleAssets.length ? (
        <div className="register-table-wrap">
          <table className="register-table">
            <thead>
              <tr>
                <th scope="col">EQUIPMENT</th>
                <th scope="col">CATEGORY</th>
                <th scope="col">DEPARTMENT</th>
                <th scope="col">STATUS</th>
                <th scope="col">LOCATION</th>
              </tr>
            </thead>
            <tbody>
              {visibleAssets.map((asset) => (
                <tr key={asset.id ?? asset.assetCode}>
                  <td>
                    <strong>{asset.assetName || "Unnamed equipment"}</strong>
                    <small>{asset.assetCode || "No asset code"}</small>
                  </td>
                  <td>{asset.category || "—"}</td>
                  <td>{asset.department || "—"}</td>
                  <td>
                    <span
                      className={`asset-status status-${String(asset.status || "unknown").toLowerCase()}`}
                    >
                      <span />
                      {String(asset.status || "Unknown").replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>{asset.location || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="register-empty">
          <span className="empty-register-icon">
            <ArchiveIcon />
          </span>
          <strong>
            {search ? "No matching equipment" : "Your register is ready"}
          </strong>
          <p>
            {search
              ? "Try another asset name, code, category, or department."
              : "There are no asset records to show yet."}
          </p>
          {!search && (
            <Link href="/inventory" className="text-link">
              Open inventory <ChevronRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <div className="register-footer">
        <span>
          {loading
            ? "Syncing with asset register"
            : `${visibleAssets.length} recent record${visibleAssets.length === 1 ? "" : "s"}`}
        </span>
        <Link href="/inventory">
          View inventory <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function ArchiveIcon() {
  return <PackageCheck size={21} strokeWidth={1.7} aria-hidden="true" />;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [assets, setAssets] = useState(null);
  const [assetsError, setAssetsError] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setSummaryLoading(true);
    setAssetsLoading(true);
    setSummaryError("");
    setAssetsError("");

    getApiData("/dashboard/summary", controller.signal)
      .then(setSummary)
      .catch((error) => {
        if (error.name !== "AbortError")
          setSummaryError(getErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setSummaryLoading(false);
      });

    getApiData(
      "/assets?page=0&size=5&sort=updatedAt&direction=DESC",
      controller.signal,
    )
      .then(setAssets)
      .catch((error) => {
        if (error.name !== "AbortError") setAssetsError(getErrorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setAssetsLoading(false);
      });

    return () => controller.abort();
  }, [refreshKey]);

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const metrics = [
    {
      title: "Total equipment",
      value: summary?.totalAssets ?? 0,
      icon: Boxes,
      tone: "navy",
      detail: "in asset register",
      source: "Live",
      loading: summaryLoading,
    },
    {
      title: "Assigned items",
      value: summary?.assignedAssets ?? 0,
      icon: Users,
      tone: "blue",
      detail: "currently in use",
      source: "Live",
      loading: summaryLoading,
    },
    {
      title: "Store stock",
      value: 128,
      icon: PackageOpen,
      tone: "gold",
      detail: "items available",
      source: "Sample",
      loading: false,
    },
    {
      title: "Pending approvals",
      value: 6,
      icon: ClipboardCheck,
      tone: "red",
      detail: "require your review",
      source: "Sample",
      loading: false,
    },
  ];

  const availableEquipment = summary?.availableAssets ?? 0;
  const totalEquipment = summary?.totalAssets ?? 0;
  const availabilityPercent =
    totalEquipment > 0
      ? Math.round((availableEquipment / totalEquipment) * 100)
      : 0;

  return (
    <div className="dashboard-page">
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="welcome-overline">
            <span className="welcome-overline-line" />
            IT ASSET MANAGEMENT SYSTEM
          </span>
          <h1>Good day, Mahen</h1>
          <p>
            A clear view of NIPO equipment, inventory and the work that needs
            your attention.
          </p>
          <div className="welcome-date">
            <Clock3 size={15} aria-hidden="true" />
            <time>{today}</time>
            <span className="date-separator" />
            <span>Colombo, Sri Lanka</span>
          </div>
        </div>
        <div className="welcome-seal" aria-hidden="true">
          <div className="welcome-seal-inner">
            <span>N</span>
            <small>NIPO</small>
          </div>
        </div>
        <div className="welcome-decoration welcome-decoration-one" />
        <div className="welcome-decoration welcome-decoration-two" />
      </section>

      <div className="dashboard-section-title">
        <div>
          <span className="section-kicker">AT A GLANCE</span>
          <h2>Asset overview</h2>
        </div>
        {summaryError || assetsError ? (
          <button
            type="button"
            className="refresh-button"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Retry live data
          </button>
        ) : (
          <span
            className={`connection-status${summaryLoading ? " is-loading" : ""}`}
          >
            <span />
            {summaryLoading ? "Connecting to register" : "Register connected"}
          </span>
        )}
      </div>

      {summaryError && (
        <div className="dashboard-error" role="alert">
          <CircleAlert size={17} aria-hidden="true" />
          <span>
            Live asset totals are unavailable. {summaryError} Store stock and
            approvals below are sample values.
          </span>
        </div>
      )}

      <section className="metric-grid" aria-label="Asset summary">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="dashboard-lower-grid">
        <ActivityFeed />
        <section className="panel attention-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">REGISTER HEALTH</span>
              <h2>Equipment status</h2>
            </div>
            <span className="health-mark">
              <ShieldCheck size={17} aria-hidden="true" />
            </span>
          </div>
          <div className="health-total">
            <div>
              <span className="health-total-number">
                {summaryLoading ? "—" : formatNumber(totalEquipment)}
              </span>
              <span className="health-total-label">registered equipment</span>
            </div>
            <span className="health-live-tag">
              <span className="live-dot" /> LIVE
            </span>
          </div>
          <div
            className="health-progress"
            role="progressbar"
            aria-label="Available equipment percentage"
            aria-valuenow={summaryLoading ? 0 : availabilityPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${availabilityPercent}%` }} />
          </div>
          <div className="health-legend">
            <span>
              <i className="legend-available" />
              Available
            </span>
            <strong>{summaryLoading ? "—" : `${availabilityPercent}%`}</strong>
          </div>
          <div className="health-legend">
            <span>
              <i className="legend-assigned" />
              Assigned
            </span>
            <strong>
              {summaryLoading
                ? "—"
                : `${formatNumber(summary?.assignedAssets ?? 0)} items`}
            </strong>
          </div>
          <div className="health-note">
            <span className="health-note-icon">
              <Check size={14} />
            </span>
            <span>Asset totals update from the live register.</span>
          </div>
          <Link className="panel-footer-link" href="/inventory">
            Explore inventory <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      </section>

      <AssetRegister
        assets={assets}
        loading={assetsLoading}
        error={assetsError}
      />

      <section className="quick-links" aria-label="Quick access">
        <div className="quick-links-heading">
          <span className="section-kicker">QUICK ACCESS</span>
          <h2>Common tasks</h2>
        </div>
        <Link href="/inventory" className="quick-link">
          <span className="quick-link-icon quick-navy">
            <Boxes size={17} />
          </span>
          <span>
            <strong>Browse inventory</strong>
            <small>View equipment register</small>
          </span>
          <ArrowUpRight size={16} className="quick-link-arrow" />
        </Link>
        <Link href="/employees" className="quick-link">
          <span className="quick-link-icon quick-blue">
            <Users size={17} />
          </span>
          <span>
            <strong>Employee directory</strong>
            <small>Find staff and assignments</small>
          </span>
          <ArrowUpRight size={16} className="quick-link-arrow" />
        </Link>
        <Link href="/procurement" className="quick-link">
          <span className="quick-link-icon quick-gold">
            <BriefcaseBusiness size={17} />
          </span>
          <span>
            <strong>Review approvals</strong>
            <small>6 requests awaiting review</small>
          </span>
          <ArrowUpRight size={16} className="quick-link-arrow" />
        </Link>
      </section>
    </div>
  );
}
