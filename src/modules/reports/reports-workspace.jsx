"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  History,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ApprovalsSection from "./approvals-section";
import AuditSection from "./audit-section";
import { INITIAL_APPROVAL_REQUESTS, INITIAL_AUDIT_LOGS } from "./mock-data";
import ReportsSection from "./reports-section";

function formatNow() {
  const now = new Date();
  return now.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportsWorkspace() {
  const [activeTab, setActiveTab] = useState("reports"); // "reports" | "approvals" | "audit"
  const [roleMode, setRoleMode] = useState("officer"); // "officer" | "viewer"
  const [requests, setRequests] = useState(INITIAL_APPROVAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasFullAccess = roleMode === "officer";
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  function appendAuditLog({ action, category, target, changeSummary }) {
    const newEntry = {
      id: `AUD-${Math.floor(1050 + Math.random() * 900)}`,
      actor: "Omindu Amarasingha",
      actorRole: hasFullAccess ? "IT Officer" : "Read-Only Viewer",
      action,
      category,
      target,
      changeSummary,
      timestamp: formatNow(),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  }

  function handleApprovalDecision(requestId, nextStatus, remarks) {
    const targetRequest = requests.find((r) => r.id === requestId);
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: nextStatus,
              remarks,
              reviewedBy: "Omindu Amarasingha",
              reviewedAt: formatNow(),
            }
          : req,
      ),
    );

    if (targetRequest) {
      appendAuditLog({
        action: `${nextStatus} Request`,
        category: "Approval",
        target: targetRequest.id,
        changeSummary: `Status changed Pending → ${nextStatus} (${targetRequest.quantity} × ${targetRequest.requestedItem}). Remarks: ${remarks}`,
      });
    }
  }

  function simulateLoading() {
    setErrorMessage("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 900);
  }

  function simulateError() {
    setIsLoading(false);
    setErrorMessage(
      "Unable to reach the shared Appwrite reports service. Displaying cached mock state is paused until retry.",
    );
  }

  function retryFromError() {
    setErrorMessage("");
    simulateLoading();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 hover:underline">
          Dashboard
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-800">
          Reports, Approvals &amp; Activity
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-amber-700 uppercase">
            NIPO ITAMS · REPORTS, APPROVALS &amp; ACTIVITY
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-slate-900">
            Operational Reports &amp; Review Queue
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Preview inventory, store, maintenance, and departmental summaries,
            review pending requests, and inspect audit history.
          </p>
        </div>

        {/* Role / Edge-state controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
            <Shield className="size-3.5 text-slate-600" />
            <span className="text-slate-600">Access:</span>
            <select
              aria-label="Simulate user permission role"
              value={roleMode}
              onChange={(e) => setRoleMode(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 outline-none"
            >
              <option value="officer">IT Officer (Full Access)</option>
              <option value="viewer">Read-Only Viewer (Restricted)</option>
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={simulateLoading}>
            <RefreshCw className="size-3.5" />
            Test Loading
          </Button>
          <Button variant="outline" size="sm" onClick={simulateError}>
            <AlertTriangle className="size-3.5 text-amber-600" />
            Test Error
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Reports and Approvals sections"
        className="flex flex-wrap gap-2"
      >
        <Button
          role="tab"
          aria-selected={activeTab === "reports"}
          variant={activeTab === "reports" ? "default" : "outline"}
          onClick={() => setActiveTab("reports")}
        >
          <BarChart3 className="size-4" />
          Reports
        </Button>

        <Button
          role="tab"
          aria-selected={activeTab === "approvals"}
          variant={activeTab === "approvals" ? "default" : "outline"}
          onClick={() => setActiveTab("approvals")}
        >
          <ClipboardCheck className="size-4" />
          Approval Queue
          <Badge
            variant={activeTab === "approvals" ? "secondary" : "outline"}
            className="ml-1"
          >
            {pendingCount}
          </Badge>
        </Button>

        <Button
          role="tab"
          aria-selected={activeTab === "audit"}
          variant={activeTab === "audit" ? "default" : "outline"}
          onClick={() => setActiveTab("audit")}
        >
          <History className="size-4" />
          Audit &amp; Activity
          <Badge
            variant={activeTab === "audit" ? "secondary" : "outline"}
            className="ml-1"
          >
            {auditLogs.length}
          </Badge>
        </Button>
      </div>

      {/* Error State */}
      {errorMessage ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-start justify-between gap-3 pt-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2.5 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">Failed to load module data</p>
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            </div>
            <Button size="sm" variant="destructive" onClick={retryFromError}>
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        /* Loading State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-slate-500">
            <Loader2 className="size-6 animate-spin text-slate-700" />
            <p className="text-sm font-medium">
              Syncing reports, approvals, and audit records...
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Active Section */
        <>
          {activeTab === "reports" && (
            <ReportsSection
              canExport={hasFullAccess}
              onRecordAudit={appendAuditLog}
            />
          )}

          {activeTab === "approvals" && (
            <ApprovalsSection
              requests={requests}
              canApprove={hasFullAccess}
              onDecision={handleApprovalDecision}
              onClearAll={() => setRequests([])}
              onRestoreSample={() => setRequests(INITIAL_APPROVAL_REQUESTS)}
            />
          )}

          {activeTab === "audit" && <AuditSection logs={auditLogs} />}
        </>
      )}
    </div>
  );
}
