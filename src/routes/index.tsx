import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { JobList } from "@/components/jobs/JobList";
import { JobFormDialog } from "@/components/jobs/JobFormDialog";
import { JobViewDialog } from "@/components/jobs/JobViewDialog";

import { useJobs } from "@/hooks/useJobs";
import { STATUSES, type Job } from "@/lib/jobs";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "JobFlow — Job management dashboard",
      },
      {
        name: "description",
        content:
          "JobFlow is a simple job management dashboard: create, assign, filter and track jobs from To Do to Complete.",
      },
      {
        property: "og:title",
        content: "JobFlow — Job management dashboard",
      },
      {
        property: "og:description",
        content:
          "Create, assign, filter and track jobs from To Do to Complete.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();

  const {
    jobs,
    employees,
    ready,
    addJob,
    updateJob,
    deleteJob,
  } = useJobs();

  const [authChecking, setAuthChecking] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [assignee, setAssignee] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [viewing, setViewing] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);

  /*
   * Check authentication when the dashboard loads.
   *
   * If there is no active Supabase session,
   * redirect the user to the login page.
   */
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        await navigate({
          to: "/login",
          replace: true,
        });

        return;
      }

      setAuthChecking(false);
    };

    void checkSession();

    /*
     * Listen for authentication changes.
     *
     * This is especially useful for logout.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        void navigate({
          to: "/login",
          replace: true,
        });

        return;
      }

      setAuthChecking(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  /*
   * Logout
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Failed to log out:", error);
      return;
    }

    await navigate({
      to: "/login",
      replace: true,
    });
  };

  const filtered = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.title
            .toLowerCase()
            .includes(search.trim().toLowerCase()) &&
          (status === "all" || job.status === status) &&
          (assignee === "all" || job.assignee === assignee),
      ),
    [jobs, search, status, assignee],
  );

  const counts = useMemo(
    () => ({
      total: jobs.length,
      todo: jobs.filter((j) => j.status === "To Do").length,
      progress: jobs.filter((j) => j.status === "In Progress").length,
      complete: jobs.filter((j) => j.status === "Complete").length,
    }),
    [jobs],
  );

  const filtersActive =
    search !== "" || status !== "all" || assignee !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setAssignee("all");
  };

  const summary = [
    {
      label: "Total jobs",
      value: counts.total,
      note: "in the queue",
    },
    {
      label: "To Do",
      value: counts.todo,
      note: "not started",
    },
    {
      label: "In Progress",
      value: counts.progress,
      note: "active now",
    },
    {
      label: "Completed",
      value: counts.complete,
      note: "closed out",
    },
  ];

  /*
   * Don't render the dashboard while authentication
   * is still being checked.
   */
  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="font-display text-xl font-semibold">
            JobFlow
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="aurora-bg pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="drift absolute -left-40 top-24 h-[520px] w-[900px] -rotate-12 rounded-[40px] border border-border bg-foreground/[0.04] backdrop-blur-2xl" />

        <div className="drift-slow absolute -top-20 right-0 h-[420px] w-[700px] rotate-[9deg] rounded-[40px] border-l border-border bg-accent/[0.06] backdrop-blur-2xl" />

        <div className="drift absolute bottom-0 left-1/3 h-[300px] w-[1100px] -rotate-6 bg-foreground/[0.03] backdrop-blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl border border-border bg-secondary font-display text-lg font-bold backdrop-blur-xl">
            J
          </div>

          <span className="font-display text-lg font-semibold tracking-tight">
            JobFlow
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xl sm:block">
            {employees.length} employees
          </div>

          <Button
            variant="outline"
            className="rounded-full border-border bg-secondary font-display"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 size-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="relative z-10 px-5 pb-16 md:px-10">
        {/* Page heading */}
        <div className="flex flex-wrap items-end justify-between gap-4 pt-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Operations
            </p>

            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Job Queue
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Create, assign and track every job your team is running.
            </p>
          </div>

          <Button
            className="rounded-xl font-display shadow-lg shadow-accent/30"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            + Add New Job
          </Button>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summary.map((card) => (
            <div
              key={card.label}
              className="glass-panel rounded-2xl p-5"
            >
              <p className="text-xs font-medium text-muted-foreground">
                {card.label}
              </p>

              <p className="mt-2 font-display text-3xl font-bold">
                {card.value}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {card.note}
              </p>
            </div>
          ))}
        </div>

        {/* Search and filters */}
        <div className="glass-panel mt-6 flex flex-col gap-3 rounded-2xl p-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-secondary px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger className="w-[150px] rounded-xl bg-secondary">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All statuses
                </SelectItem>

                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={assignee}
              onValueChange={setAssignee}
            >
              <SelectTrigger className="w-[170px] rounded-xl bg-secondary">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All employees
                </SelectItem>

                {employees.map((employee) => (
                  <SelectItem
                    key={employee.id}
                    value={employee.name}
                  >
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              className="rounded-xl font-display text-muted-foreground"
              onClick={clearFilters}
              disabled={!filtersActive}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {/* Jobs */}
        {ready && filtered.length === 0 ? (
          <div className="glass-panel mt-6 rounded-2xl border-dashed p-10 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-border bg-secondary font-display text-2xl text-muted-foreground">
              ∅
            </div>

            <h3 className="mt-4 font-display text-lg font-semibold">
              {jobs.length === 0
                ? "No jobs yet"
                : "No jobs match your filters"}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {jobs.length === 0
                ? "Add your first job to start tracking work."
                : "Try clearing the search or widening the status."}
            </p>

            <Button
              variant="secondary"
              className="mt-4 rounded-xl bg-secondary font-display"
              onClick={() => {
                if (jobs.length === 0) {
                  setEditing(null);
                  setFormOpen(true);
                } else {
                  clearFilters();
                }
              }}
            >
              {jobs.length === 0
                ? "Add New Job"
                : "Clear filters"}
            </Button>
          </div>
        ) : (
          <JobList
            jobs={filtered}
            onView={setViewing}
            onEdit={(job) => {
              setEditing(job);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
          />
        )}
      </main>

      {/* Create / Edit dialog */}
      <JobFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        job={editing}
        employees={employees}
        onSubmit={async (input) => {
          if (editing) {
            await updateJob(editing.id, input);
          } else {
            await addJob(input);
          }
        }}
      />

      {/* View dialog */}
      <JobViewDialog
        job={viewing}
        open={viewing !== null}
        onOpenChange={() => setViewing(null)}
        onEdit={(job) => {
          setViewing(null);
          setEditing(job);
          setFormOpen(true);
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={() => setDeleting(null)}
      >
        <AlertDialogContent className="border-border bg-popover/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this job?
            </AlertDialogTitle>

            <AlertDialogDescription>
              “{deleting?.title}” will be permanently removed. This
              can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-secondary font-display">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive font-display text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleting) {
                  await deleteJob(deleting.id);
                }

                setDeleting(null);
              }}
            >
              Delete job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}