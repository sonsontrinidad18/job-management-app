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
  EMPLOYEES,
  PRIORITIES,
  STATUSES,
  emptyJob,
  type Job,
  type JobInput,
  type Priority,
  type Status,
} from "@/lib/jobs";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onSubmit: (input: JobInput) => void;
};

export function JobFormDialog({ open, onOpenChange, job, onSubmit }: Props) {
  const [form, setForm] = useState<JobInput>(emptyJob);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
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

  const set = <K extends keyof JobInput>(key: K, value: JobInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.title.trim()) {
      setError("A job title is required.");
      return;
    }
    if (!form.dueDate) {
      setError("Pick a due date.");
      return;
    }
    onSubmit({ ...form, title: form.title.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover/95 backdrop-blur-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{job ? "Edit job" : "New job"}</DialogTitle>
          <DialogDescription>
            {job ? "Update the details for this job." : "Add a job to the queue."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-xs text-muted-foreground">
              Job title
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Replace rooftop HVAC unit"
              className="mt-1 bg-secondary"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-xs text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What needs to happen?"
              className="mt-1 resize-none bg-secondary"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Assigned employee</Label>
              <Select value={form.assignee} onValueChange={(v) => set("assignee", v)}>
                <SelectTrigger className="mt-1 bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="due" className="text-xs text-muted-foreground">
                Due date
              </Label>
              <Input
                id="due"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="mt-1 bg-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v as Priority)}
              >
                <SelectTrigger className="mt-1 bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
                <SelectTrigger className="mt-1 bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-xs text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything the crew should know"
              className="mt-1 resize-none bg-secondary"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex-1 border-border bg-secondary font-display"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1 font-display" onClick={handleSave}>
            Save job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
