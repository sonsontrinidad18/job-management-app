import { useCallback, useEffect, useState } from "react";
import { loadJobs, saveJobs, type Job, type JobInput } from "@/lib/jobs";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setJobs(loadJobs());
    setReady(true);
  }, []);

  const persist = useCallback((next: Job[]) => {
    setJobs(next);
    saveJobs(next);
  }, []);

  const addJob = useCallback(
    (input: JobInput) => {
      persist([
        {
          ...input,
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `job-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...jobs,
      ]);
    },
    [jobs, persist],
  );

  const updateJob = useCallback(
    (id: string, input: JobInput) => {
      persist(jobs.map((job) => (job.id === id ? { ...job, ...input } : job)));
    },
    [jobs, persist],
  );

  const deleteJob = useCallback(
    (id: string) => {
      persist(jobs.filter((job) => job.id !== id));
    },
    [jobs, persist],
  );

  return { jobs, ready, addJob, updateJob, deleteJob };
}
