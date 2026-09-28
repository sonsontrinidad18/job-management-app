import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PriorityBadge, StatusBadge } from "@/components/jobs/badges";
import { formatDate, type Job } from "@/lib/jobs";

type Props = {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JobViewDialog({ job, open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover/95 backdrop-blur-2xl sm:max-w-lg">
        {job ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{job.title}</DialogTitle>
              <DialogDescription>
                Created {formatDate(job.createdAt.slice(0, 10))}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
            </div>

            <dl className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Assigned to</dt>
                <dd className="mt-1">{job.assignee}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Due date</dt>
                <dd className="mt-1">{formatDate(job.dueDate)}</dd>
              </div>
            </dl>

            <div className="mt-2 space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="mt-1 whitespace-pre-line">{job.description || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="mt-1 whitespace-pre-line">{job.notes || "—"}</p>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
