"use client";

import { useMemo, useState } from "react";
import { Clock3, History, ListFilter, Search, UserCheck } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORIES = ["All", "Approval", "Report", "Inventory", "Store", "Maintenance"];

export default function AuditSection({ logs }) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "timeline"

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((entry) => {
      const matchesCategory =
        categoryFilter === "All" || entry.category === categoryFilter;
      const matchesSearch =
        !query ||
        [
          entry.actor,
          entry.action,
          entry.target,
          entry.changeSummary,
          entry.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [logs, categoryFilter, search]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Audit & Activity History</CardTitle>
          <CardDescription>
            Tracks who performed each action, what changed, and when it occurred
          </CardDescription>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <ListFilter className="size-3.5" />
            Table
          </Button>
          <Button
            size="sm"
            variant={viewMode === "timeline" ? "default" : "outline"}
            onClick={() => setViewMode("timeline")}
          >
            <History className="size-3.5" />
            Timeline
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={categoryFilter === cat ? "default" : "outline"}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor or change..."
              className="h-8 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-8 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No audit entries found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Adjust your category filter or search query to view activity.
            </p>
          </div>
        ) : viewMode === "table" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Who</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>What Changed</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {entry.actor}
                    </div>
                    <div className="text-xs text-slate-500">
                      {entry.actorRole}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.category}</Badge>
                      <span className="font-medium text-slate-800">
                        {entry.action}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-slate-700">{entry.changeSummary}</div>
                    <div className="text-xs text-slate-500">
                      Target: {entry.target}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-slate-600">
                    {entry.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <ol className="relative space-y-4 border-l border-slate-200 pl-5">
            {filteredLogs.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-white bg-slate-700" />
                <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{entry.category}</Badge>
                      <span className="text-sm font-semibold text-slate-900">
                        {entry.action}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({entry.target})
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {entry.changeSummary}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <UserCheck className="size-3.5" />
                      {entry.actor} · {entry.actorRole}
                    </p>
                  </div>
                  <time className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                    <Clock3 className="size-3.5" />
                    {entry.timestamp}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
