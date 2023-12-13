import { useEffect, useState } from "react";
import nocodbApi from "./nocodbClient";

export type TrackyTask = {
  Id: number;
  CreatedAt: string;
  UpdatedAt: string;
  type: "PHASE" | "RECURRING";
  name: string;
};

export function useTasks() {
  const [tasks, setTasks] = useState<TrackyTask[]>([]);

  useEffect(() => {
    loadTasks().then((tasks) => setTasks(tasks));
  }, []);

  const phaseTasks = tasks.filter((keyword) => keyword.type === "PHASE");
  const recurringTasks = tasks.filter(
    (keyword) => keyword.type === "RECURRING",
  );

  return {
    phaseTasks,
    recurringTasks,
  };
}

async function loadTasks() {
  const tasks = await nocodbApi.dbTableRow.list(
    "v1",
    "ds4g-data",
    "Tracky-Task",
  );

  return tasks.list as TrackyTask[];
}
