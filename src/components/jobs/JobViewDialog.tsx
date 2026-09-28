import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PriorityBadge, StatusBadge } from "@/components/jobs/badges";
import { Button } from "@/components/ui/button";
import { formatDate, normalizeDateKey, type Job } from "@/lib/jobs";

type Props = {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (job: Job) => void;
};

export function JobViewDialog({ job, open, onOpenChange, onEdit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover/95 backdrop-blur-2xl sm:max-w-lg">
        {job ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{job.title}</DialogTitle>
              <DialogDescription>
                Created {formatDate(normalizeDateKey(job.createdAt))}
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

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-border bg-secondary font-display"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button className="font-display" onClick={() => onEdit(job)}>
                Edit Job
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
