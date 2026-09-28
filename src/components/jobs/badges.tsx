import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/lib/jobs";

const statusStyles: Record<Status, string> = {
  "To Do": "bg-secondary border-border text-foreground",
  "In Progress": "bg-brand/25 border-brand/50 text-foreground",
  Complete: "bg-accent/20 border-accent/45 text-foreground",
};

const priorityStyles: Record<Priority, string> = {
  Low: "bg-secondary border-border text-muted-foreground",
  Medium: "bg-warning/15 border-warning/40 text-warning",
  High: "bg-destructive/20 border-destructive/45 text-destructive",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}
