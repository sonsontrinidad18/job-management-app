import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  PRIORITIES,
  STATUSES,
  emptyJob,
  type Employee,
  type Job,
  type JobInput,
  type Priority,
  type Status,
} from "@/lib/jobs";

type Errors = Partial<Record<keyof JobInput, string | undefined>>;

function FieldError({ msg }: { msg?: string | undefined }) {
  return msg ? (
    <p className="mt-1 text-xs text-destructive">
      {msg}
    </p>
  ) : null;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  employees: Employee[];
  onSubmit: (input: JobInput) => Promise<void>;
};

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  employees,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<JobInput>(emptyJob);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setSaving(false);

    setForm(
      job
        ? {
            title: job.title,
            description: job.description,
            assignee: job.assignee,
            dueDate: job.dueDate,
            priority: job.priority,
            status: job.status,
            notes: job.notes,
          }
        : emptyJob(),
    );
  }, [open, job]);

  const set = <K extends keyof JobInput>(
    key: K,
    value: JobInput[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  const handleSave = async () => {
    const next: Errors = {};

    // -----------------------------
    // Validation
    // -----------------------------

    if (!form.title.trim()) {
      next.title = "Job title is required.";
    }

    const employeeExists = employees.some(
      (employee) => employee.name === form.assignee,
    );

    if (!employeeExists) {
      next.assignee = "Choose an assigned employee.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)) {
      next.dueDate = "Due date is required.";
    }

    if (!PRIORITIES.includes(form.priority)) {
      next.priority = "Choose a priority.";
    }

    if (!STATUSES.includes(form.status)) {
      next.status = "Choose a status.";
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    // -----------------------------
    // Save
    // -----------------------------

    setSaving(true);
    setErrors({});

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
      });

      // Only close the dialog when the save succeeds.
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to save job:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to save job.";

      setErrors({
        title: message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover/95 backdrop-blur-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {job ? "Edit job" : "New job"}
          </DialogTitle>

          <DialogDescription>
            {job
              ? "Update the details for this job."
              : "Add a job to the queue."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job title */}
          <div>
            <Label
              htmlFor="title"
              className="text-xs text-muted-foreground"
            >
              Job title
            </Label>

            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Replace rooftop HVAC unit"
              className="mt-1 bg-secondary"
              aria-invalid={!!errors.title}
            />

            <FieldError msg={errors.title} />
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="description"
              className="text-xs text-muted-foreground"
            >
              Description
            </Label>

            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                set("description", e.target.value)
              }
              placeholder="What needs to happen?"
              className="mt-1 resize-none bg-secondary"
            />
          </div>

          {/* Employee + Due date */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                Assigned employee
              </Label>

              <Select
                value={form.assignee}
                onValueChange={(value) =>
                  set("assignee", value)
                }
                disabled={saving}
              >
                <SelectTrigger
                  className="mt-1 bg-secondary"
                  aria-invalid={!!errors.assignee}
                >
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>

                <SelectContent>
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

              <FieldError msg={errors.assignee} />
            </div>

            <div>
              <Label
                htmlFor="due"
                className="text-xs text-muted-foreground"
              >
                Due date
              </Label>

              <Input
                id="due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  set("dueDate", e.target.value)
                }
                className="mt-1 bg-secondary"
                aria-invalid={!!errors.dueDate}
                disabled={saving}
              />

              <FieldError msg={errors.dueDate} />
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                Priority
              </Label>

              <Select
                value={form.priority}
                onValueChange={(value) =>
                  set("priority", value as Priority)
                }
                disabled={saving}
              >
                <SelectTrigger className="mt-1 bg-secondary">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldError msg={errors.priority} />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Status
              </Label>

              <Select
                value={form.status}
                onValueChange={(value) =>
                  set("status", value as Status)
                }
                disabled={saving}
              >
                <SelectTrigger className="mt-1 bg-secondary">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                    >
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FieldError msg={errors.status} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor="notes"
              className="text-xs text-muted-foreground"
            >
              Notes
            </Label>

            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) =>
                set("notes", e.target.value)
              }
              placeholder="Anything the crew should know"
              className="mt-1 resize-none bg-secondary"
              disabled={saving}
            />
          </div>

          {/* Error message */}
          {Object.values(errors).some(Boolean) ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {Object.values(errors).find(Boolean)}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex-1 border-border bg-secondary font-display"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            className="flex-1 font-display"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}