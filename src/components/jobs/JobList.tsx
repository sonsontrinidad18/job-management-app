import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/jobs/badges";
import { formatDate, isOverdue, type Job } from "@/lib/jobs";
import { cn } from "@/lib/utils";

type Props = {
  jobs: Job[];
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
};

const cols = "grid-cols-[2fr_1fr_1fr_1fr_170px]";

function Actions({ job, onView, onEdit, onDelete, full }: Props & { job: Job; full?: boolean }) {
  return (
    <div className={cn("flex gap-2 text-xs", full ? "" : "justify-end")}>
      <Button
        variant="secondary"
        size="sm"
        className={cn("h-8 bg-secondary px-2.5 text-muted-foreground", full && "flex-1")}
        onClick={() => onView(job)}
      >
        View
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className={cn("h-8 bg-secondary px-2.5 text-muted-foreground", full && "flex-1")}
        onClick={() => onEdit(job)}
      >
        Edit
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className={cn(
          "h-8 bg-destructive/20 px-2.5 text-destructive hover:bg-destructive/30",
          full && "flex-1",
        )}
        onClick={() => onDelete(job)}
      >
        Delete
      </Button>
    </div>
  );
}

export function JobList(props: Props) {
  const { jobs, onView } = props;

  return (
    <>
      {/* desktop table */}
      <div className="glass-panel mt-6 hidden overflow-hidden rounded-2xl md:block">
        <div
          className={cn(
            "grid gap-4 border-b border-border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground",
            cols,
          )}
        >
          <span>Job</span>
          <span>Employee</span>
          <span>Status</span>
          <span>Due</span>
          <span className="text-right">Actions</span>
        </div>
        {jobs.map((job) => (
          <div
            key={job.id}
            className={cn(
              "grid items-center gap-4 border-b border-border/60 px-6 py-4 transition-colors last:border-b-0 hover:bg-secondary/40",
              cols,
            )}
          >
            <div className="min-w-0">
              <button
                onClick={() => onView(job)}
                className="truncate font-display font-semibold text-left hover:text-primary"
              >
                {job.title}
              </button>
              <p className="truncate text-xs text-muted-foreground">
                {job.description || "No description"}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">{job.assignee}</div>
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
            </div>
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "text-sm text-muted-foreground",
                  isOverdue(job) && "font-medium text-destructive",
                )}
              >
                {formatDate(job.dueDate)}
              </span>
              <PriorityBadge priority={job.priority} />
            </div>
            <Actions {...props} job={job} />
          </div>
        ))}
      </div>

      {/* mobile cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {jobs.map((job) => (
          <div key={job.id} className="glass-panel rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-semibold">{job.title}</p>
                <p className="text-xs text-muted-foreground">
                  {job.assignee} ·{" "}
                  <span className={cn(isOverdue(job) && "text-destructive")}>
                    {formatDate(job.dueDate)}
                  </span>
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <div className="mt-3">
              <PriorityBadge priority={job.priority} />
            </div>
            <div className="mt-3">
              <Actions {...props} job={job} full />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
