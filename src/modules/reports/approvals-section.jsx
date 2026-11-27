"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Lock,
  Search,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"];

function statusBadgeVariant(status) {
  if (status === "Approved") return "default";
  if (status === "Rejected") return "destructive";
  return "outline";
}

export default function ApprovalsSection({
  requests,
  canApprove,
  onDecision,
  onClearAll,
  onRestoreSample,
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialogState, setDialogState] = useState(null); // { request, action: "Approve" | "Reject" }
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState("");

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "Pending").length,
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((req) => {
      const matchesStatus =
        statusFilter === "All" || req.status === statusFilter;
      const matchesSearch =
        !query ||
        [req.id, req.applicantName, req.department, req.requestedItem]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, search]);

  function openReviewDialog(request, action) {
    if (!canApprove || request.status !== "Pending") return;
    setDialogState({ request, action });
    setRemarks("");
    setRemarksError("");
  }

  function closeDialog() {
    setDialogState(null);
    setRemarks("");
    setRemarksError("");
  }

  function handleConfirmDecision(event) {
    event.preventDefault();
    if (!dialogState) return;

    const trimmed = remarks.trim();
    if (dialogState.action === "Reject" && !trimmed) {
      setRemarksError("Please provide a reason/remarks when rejecting a request.");
      return;
    }

    onDecision(
      dialogState.request.id,
      dialogState.action === "Approve" ? "Approved" : "Rejected",
      trimmed || "Approved by IT Officer.",
    );
    closeDialog();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>
              {pendingCount} pending request{pendingCount === 1 ? "" : "s"}{" "}
              awaiting IT officer review
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {requests.length > 0 ? (
              <Button variant="outline" size="sm" onClick={onClearAll}>
                Simulate Empty Queue
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onRestoreSample}>
                Restore Sample Requests
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!canApprove && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <Lock className="size-3.5 shrink-0" />
              <span>
                Approval actions are disabled in Read-Only Viewer mode. Switch
                to IT Officer to approve or reject requests.
              </span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? "default" : "outline"}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicant or item..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-8 text-sm text-slate-900 outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <ClipboardList className="size-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                {requests.length === 0
                  ? "No approval requests in the queue"
                  : "No requests match the selected filter"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {requests.length === 0
                  ? "All equipment and stock requests have been cleared."
                  : "Try switching status tabs or clearing the search box."}
              </p>
              {requests.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onRestoreSample}
                >
                  Load sample requests
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Requested Item</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => {
                  const isPending = req.status === "Pending";
                  return (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium text-slate-900">
                        <div>{req.id}</div>
                        <div className="text-xs font-normal text-slate-500">
                          {req.priority} priority
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {req.applicantName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.department}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-slate-900">
                          {req.quantity} × {req.requestedItem}
                        </div>
                        <div className="max-w-xs truncate text-xs text-slate-500">
                          {req.remarks
                            ? `Remarks: ${req.remarks}`
                            : req.justification}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-600">
                        {req.requestDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(req.status)}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={!canApprove || !isPending}
                            onClick={() => openReviewDialog(req, "Approve")}
                          >
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={!canApprove || !isPending}
                            onClick={() => openReviewDialog(req, "Reject")}
                          >
                            <XCircle className="size-3.5" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve / Reject Confirmation Dialog */}
      <Dialog
        open={Boolean(dialogState)}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          {dialogState && (
            <form onSubmit={handleConfirmDecision} className="space-y-4">
              <DialogHeader>
                <DialogTitle>
                  {dialogState.action === "Approve"
                    ? "Approve Request"
                    : "Reject Request"}{" "}
                  · {dialogState.request.id}
                </DialogTitle>
                <DialogDescription>
                  {dialogState.request.applicantName} (
                  {dialogState.request.department}) requested{" "}
                  {dialogState.request.quantity} ×{" "}
                  {dialogState.request.requestedItem}.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">
                  Justification:{" "}
                </span>
                {dialogState.request.justification}
              </div>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-700">
                <span>
                  Review Remarks{" "}
                  {dialogState.action === "Reject" ? "(required)" : "(optional)"}
                </span>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                    if (remarksError) setRemarksError("");
                  }}
                  placeholder={
                    dialogState.action === "Approve"
                      ? "Add allocation notes or store instructions..."
                      : "Explain why this request cannot be approved..."
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
                />
                {remarksError && (
                  <span className="text-xs text-red-600">{remarksError}</span>
                )}
              </label>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={
                    dialogState.action === "Reject" ? "destructive" : "default"
                  }
                >
                  Confirm {dialogState.action}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
