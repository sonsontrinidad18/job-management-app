export const EMPLOYEES = ["John Doe", "Jane Smith", "Mark Santos", "Sarah Wilson"] as const;

export const PRIORITIES = ["Low", "Medium", "High"] as const;
export const STATUSES = ["To Do", "In Progress", "Complete"] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export type Job = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string; // yyyy-mm-dd
  priority: Priority;
  status: Status;
  notes: string;
  createdAt: string; // ISO
};

export type JobInput = Omit<Job, "id" | "createdAt">;

export const STORAGE_KEY = "jobflow.jobs.v1";
export const SEED_KEY = "jobflow.seeded.v1";

function dayOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function createSeedJobs(): Job[] {
  const now = Date.now();
  const raw: Array<[string, string, string, number, Priority, Status, string]> = [
    [
      "Replace rooftop HVAC unit",
      "Swap the failing compressor on the Meridian Dental rooftop unit and recertify airflow.",
      "Mark Santos",
      2,
      "High",
      "In Progress",
      "Permit filed. Crane booked for 7am start.",
    ],
    [
      "Quarterly fire alarm inspection",
      "Full panel and sensor test across all three floors of the Birch Lane office.",
      "Jane Smith",
      5,
      "Medium",
      "To Do",
      "Building manager needs 24h notice before access.",
    ],
    [
      "Kitchen cabinet install — Hartley",
      "Install upper and lower cabinetry, then align doors and fit the hardware.",
      "John Doe",
      1,
      "High",
      "In Progress",
      "Two hinge sets still on backorder.",
    ],
    [
      "Deck staining — Northside Park",
      "Sand the boards and apply two coats of weatherproof stain.",
      "Sarah Wilson",
      -4,
      "Low",
      "Complete",
      "Signed off by the parks supervisor.",
    ],
    [
      "Warehouse lighting retrofit",
      "Replace 42 fluorescent fixtures with LED panels and log the energy baseline.",
      "Mark Santos",
      9,
      "Medium",
      "To Do",
      "Order fixtures before the end of the week.",
    ],
  ];

  return raw.map(([title, description, assignee, due, priority, status, notes], i) => ({
    id: `seed-${i + 1}`,
    title,
    description,
    assignee,
    dueDate: dayOffset(due),
    priority,
    status,
    notes,
    createdAt: new Date(now - (raw.length - i) * 86_400_000).toISOString(),
  }));
}

export function loadJobs(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Job[];
    if (window.localStorage.getItem(SEED_KEY)) return [];
    const seeded = createSeedJobs();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    window.localStorage.setItem(SEED_KEY, "1");
    return seeded;
  } catch {
    return [];
  }
}

export function saveJobs(jobs: Job[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    window.localStorage.setItem(SEED_KEY, "1");
  } catch {
    /* storage unavailable */
  }
}

export function formatDate(value: string) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function isOverdue(job: Job) {
  if (job.status === "Complete" || !job.dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return job.dueDate < today;
}

export function emptyJob(): JobInput {
  return {
    title: "",
    description: "",
    assignee: EMPLOYEES[0],
    dueDate: dayOffset(7),
    priority: "Medium",
    status: "To Do",
    notes: "",
  };
}
