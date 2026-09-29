import { useCallback, useEffect, useState } from "react";
import {
  createJob,
  deleteJob as deleteJobFromDatabase,
  fetchJobs,
  getEmployees,
  updateJob as updateJobInDatabase,
  type Employee,
  type Job,
  type JobInput,
} from "@/lib/jobs";

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);

      const [jobsData, employeesData] = await Promise.all([
        fetchJobs(),
        getEmployees(),
      ]);

      setJobs(jobsData);
      setEmployees(employeesData);
    } catch (err) {
      console.error("Failed to load data:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data.",
      );
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addJob = useCallback(async (input: JobInput) => {
    try {
      setError(null);

      const newJob = await createJob(input);

      setJobs((current) => [newJob, ...current]);

      return newJob;
    } catch (err) {
      console.error("Failed to create job:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create job.",
      );

      throw err;
    }
  }, []);

  const updateJob = useCallback(
    async (id: string, input: JobInput) => {
      try {
        setError(null);

        const updatedJob = await updateJobInDatabase(id, input);

        setJobs((current) =>
          current.map((job) =>
            job.id === id ? updatedJob : job,
          ),
        );

        return updatedJob;
      } catch (err) {
        console.error("Failed to update job:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to update job.",
        );

        throw err;
      }
    },
    [],
  );

  const deleteJob = useCallback(async (id: string) => {
    try {
      setError(null);

      await deleteJobFromDatabase(id);

      setJobs((current) =>
        current.filter((job) => job.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete job:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete job.",
      );

      throw err;
    }
  }, []);

  return {
    jobs,
    employees,
    ready,
    error,
    addJob,
    updateJob,
    deleteJob,
    reload: load,
  };
}