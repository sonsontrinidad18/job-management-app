import { supabase } from "@/lib/supabase";

export type Employee = {
  id: string;
  name: string;
};

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Failed to load employees:", error);
    throw error;
  }

  return data ?? [];
}

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export const STATUSES = ["To Do", "In Progress", "Complete"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export type Job = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  notes: string;
  createdAt: string;
};

export type JobInput = Omit<Job, "id" | "createdAt">;

type SupabaseJob = {
  id: string;
  title: string;
  description: string | null;
  employee_id: string | null;
  due_date: string | null;
  priority: Priority;
  status: Status;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/* ---------------------------------
   Date helpers
---------------------------------- */

export function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeDateKey(value: string) {
  if (!value) return "";

  if (DATE_KEY_RE.test(value)) {
    return value;
  }

  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? "" : toDateKey(d);
}

export function formatDate(value: string) {
  const key = normalizeDateKey(value);

  if (!key) return "—";

  const [y = 0, m = 1, day = 1] = key.split("-").map(Number);

  const d = new Date(y, m - 1, day);

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(job: Job) {
  if (job.status === "Complete" || !job.dueDate) {
    return false;
  }

  return job.dueDate < todayKey();
}

/* ---------------------------------
   Job helpers
---------------------------------- */

export function emptyJob(): JobInput {
  return {
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    priority: "Medium",
    status: "To Do",
    notes: "",
  };
}

/**
 * Convert a Supabase job row into the format
 * used by the React application.
 */
function mapSupabaseJob(
  row: SupabaseJob,
  employees: Employee[],
): Job {
  const employee = employees.find(
    (item) => item.id === row.employee_id,
  );

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    assignee: employee?.name ?? "",
    dueDate: row.due_date ?? "",
    priority: row.priority,
    status: row.status,
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}

/**
 * Find an employee ID from the employee name.
 */
async function getEmployeeId(name: string) {
  if (!name) {
    return null;
  }

  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(`Employee "${name}" was not found.`);
  }

  return data.id;
}

/* ---------------------------------
   Fetch jobs
---------------------------------- */

export async function fetchJobs(): Promise<Job[]> {
  // Load both tables independently.
  const [jobsResult, employeesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        employee_id,
        due_date,
        priority,
        status,
        notes,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("employees")
      .select("id, name")
      .order("name"),
  ]);

  if (jobsResult.error) {
    throw jobsResult.error;
  }

  if (employeesResult.error) {
    throw employeesResult.error;
  }

  const jobs = (jobsResult.data ?? []) as SupabaseJob[];
  const employees = employeesResult.data ?? [];

  return jobs.map((job) =>
    mapSupabaseJob(job, employees),
  );
}

/* ---------------------------------
   Create job
---------------------------------- */

export async function createJob(
  input: JobInput,
): Promise<Job> {
  const employeeId = await getEmployeeId(input.assignee);

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: input.title,
      description: input.description,
      employee_id: employeeId,
      due_date: input.dueDate || null,
      priority: input.priority,
      status: input.status,
      notes: input.notes,
    })
    .select(`
      id,
      title,
      description,
      employee_id,
      due_date,
      priority,
      status,
      notes,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw error;
  }

  // Fetch through the same reliable mapping used by the dashboard.
  const jobs = await fetchJobs();

  const createdJob = jobs.find(
    (job) => job.id === data.id,
  );

  if (!createdJob) {
    throw new Error(
      "Job was created, but could not be loaded afterward.",
    );
  }

  return createdJob;
}

/* ---------------------------------
   Update job
---------------------------------- */

export async function updateJob(
  id: string,
  input: JobInput,
): Promise<Job> {
  const employeeId = await getEmployeeId(input.assignee);

  const { error } = await supabase
    .from("jobs")
    .update({
      title: input.title,
      description: input.description,
      employee_id: employeeId,
      due_date: input.dueDate || null,
      priority: input.priority,
      status: input.status,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  // Reload the updated job using the same employee mapping
  // used by the dashboard.
  const jobs = await fetchJobs();

  const updatedJob = jobs.find(
    (job) => job.id === id,
  );

  if (!updatedJob) {
    throw new Error(
      "Job was updated, but could not be loaded afterward.",
    );
  }

  return updatedJob;
}

/* ---------------------------------
   Delete job
---------------------------------- */

export async function deleteJob(id: string) {
  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}