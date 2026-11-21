"use client";

import { useState } from "react";
import Image from "next/image";
import { AppwriteException } from "appwrite";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleX,
  CodeXml,
  Database,
  LoaderCircle,
  Terminal,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appwriteConfig, client } from "@/lib/appwrite";
import AppwriteLogo from "../static/appwrite-icon.svg";
import NextjsLogo from "../static/nextjs-icon.svg";

const connectionStates = {
  idle: { label: "Ready to test", variant: "outline", Icon: Circle },
  loading: {
    label: "Checking connection",
    variant: "outline",
    Icon: LoaderCircle,
  },
  success: { label: "Connected", variant: "default", Icon: CircleCheck },
  error: { label: "Connection failed", variant: "destructive", Icon: CircleX },
};

const projectFields = [
  { label: "Project name", value: appwriteConfig.projectName },
  { label: "Endpoint", value: appwriteConfig.endpoint, monospace: true },
  { label: "Project ID", value: appwriteConfig.projectId, monospace: true },
];

const logDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function ConnectionLogs({ logs, open, onOpenChange }) {
  return (
    <Card>
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <h2>
          <CollapsibleTrigger
            render={<Button variant="ghost" />}
            className="group/logs h-auto w-full justify-start gap-3 rounded-xl px-5 py-4 text-left sm:px-6"
          >
            <Terminal aria-hidden="true" className="text-muted-foreground" />
            <span>Request logs</span>
            <Badge variant="secondary">{logs.length}</Badge>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground ml-auto transition-transform group-aria-expanded/logs:rotate-180 motion-reduce:transition-none"
            />
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent className="overflow-hidden rounded-b-xl border-t">
          {logs.length ? (
            <Table>
              <caption className="sr-only">
                Appwrite ping requests, newest first
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="w-full">Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      <time dateTime={log.date.toISOString()}>
                        {logDate.format(log.date)}
                      </time>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.outcome === "success"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {log.code || "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">GET</TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">
                      /v1/ping
                    </TableCell>
                    <TableCell className="min-w-44 font-mono text-xs break-all">
                      {log.response}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground px-5 py-8 text-center text-sm">
              No requests yet. Send a ping to see the response here.
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [showLogs, setShowLogs] = useState(false);
  const { label, variant, Icon } = connectionStates[status];

  async function sendPing() {
    if (status === "loading") return;

    setStatus("loading");
    let result;
    try {
      const response = await client.ping();
      result = {
        outcome: "success",
        code: 200,
        response: JSON.stringify(response),
      };
    } catch (error) {
      result = {
        outcome: "error",
        code: error instanceof AppwriteException ? error.code : 500,
        response:
          error instanceof AppwriteException
            ? error.message
            : "Something went wrong",
      };
    }
    const date = new Date();

    setLogs((previous) => [
      { ...result, id: previous.length + 1, date },
      ...previous,
    ]);
    setStatus(result.outcome);
    setShowLogs(true);
  }

  return (
    <div className="bg-muted/40 min-h-dvh">
      <header className="bg-background border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-8">
          <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
            <Database aria-hidden="true" className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            NIPO ITAMS
          </span>
          <div className="text-muted-foreground ml-auto flex items-center gap-2 text-xs">
            <Image src={AppwriteLogo} alt="" width={16} height={16} />
            Appwrite
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pt-9 pb-12 sm:px-8 sm:pt-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Appwrite connection
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
            Verify that the NIPO IT Asset Management System can reach Appwrite.
          </p>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[1.35fr_1fr]">
          <Card>
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-lg">Connection check</CardTitle>
                <div role="status">
                  <Badge variant={variant}>
                    <Icon
                      aria-hidden="true"
                      className={
                        status === "loading"
                          ? "motion-safe:animate-spin"
                          : undefined
                      }
                    />
                    {label}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Send a GET request to the Appwrite ping endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto grid gap-5 pt-5">
              <div className="bg-primary/5 flex min-h-28 items-center justify-center rounded-lg border px-3">
                <div className="grid w-18 shrink-0 justify-items-center gap-1.5 text-center text-xs font-medium">
                  <span className="bg-card grid size-10 place-items-center rounded-lg border shadow-xs">
                    <Image src={NextjsLogo} alt="" width={22} height={22} />
                  </span>
                  Next.js
                </div>
                <div
                  aria-hidden="true"
                  className="text-primary flex -translate-y-2.5 items-center"
                >
                  <span className="w-5 border-t border-dashed border-current opacity-40 sm:w-12" />
                  <span className="bg-card grid size-7 place-items-center rounded-full border">
                    <Activity className="size-3.5" />
                  </span>
                  <span className="w-5 border-t border-dashed border-current opacity-40 sm:w-12" />
                </div>
                <div className="grid w-18 shrink-0 justify-items-center gap-1.5 text-center text-xs font-medium">
                  <span className="bg-card grid size-10 place-items-center rounded-lg border shadow-xs">
                    <Image src={AppwriteLogo} alt="" width={22} height={22} />
                  </span>
                  Appwrite
                </div>
              </div>
              <Button
                size="lg"
                className="w-fit px-4"
                onClick={sendPing}
                disabled={status === "loading"}
              >
                <Activity aria-hidden="true" />
                Send a ping
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appwrite project</CardTitle>
              <CardDescription>Configuration used by this app.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <dl className="divide-y">
                {projectFields.map(({ label, value, monospace }) => (
                  <div
                    key={label}
                    className="grid gap-1 py-3 first:pt-0 last:pb-0"
                  >
                    <dt className="text-muted-foreground text-xs font-medium">
                      {label}
                    </dt>
                    <dd
                      className={
                        monospace
                          ? "font-mono text-xs break-all"
                          : "text-sm font-medium"
                      }
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>

        <ConnectionLogs
          logs={logs}
          open={showLogs}
          onOpenChange={setShowLogs}
        />

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t pt-4">
          <p className="text-muted-foreground flex items-center gap-2 text-sm sm:mr-auto">
            <CodeXml aria-hidden="true" className="size-4 shrink-0" />
            <span>
              Edit{" "}
              <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                src/app/page.js
              </code>{" "}
              to get started.
            </span>
          </p>
          <Button
            variant="outline"
            render={
              <a
                href="https://cloud.appwrite.io"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            Appwrite console <ArrowUpRight aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            render={
              <a
                href="https://appwrite.io/docs"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            <BookOpen aria-hidden="true" /> Documentation{" "}
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </footer>
      </main>
    </div>
  );
}
