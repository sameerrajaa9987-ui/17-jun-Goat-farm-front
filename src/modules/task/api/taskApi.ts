import { apiClient } from "@api/apiClient";
import {
  Task,
  TaskStats,
  TaskListParams,
  AssignTaskPayload,
  ProofItem,
  Paginated,
} from "@modules/task/types";

export const taskApi = {
  list: async (params?: TaskListParams) => {
    const res = await apiClient.get<Paginated<Task>>("/tasks", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Task }>(
      `/tasks/${id}`,
    );
    return res.data.data;
  },
  assign: async (payload: AssignTaskPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Task }>(
      "/tasks",
      payload,
    );
    return res.data.data;
  },
  start: async (id: string) => {
    const res = await apiClient.patch<{ success: boolean; data: Task }>(
      `/tasks/${id}/start`,
    );
    return res.data.data;
  },
  complete: async (
    id: string,
    proof: Pick<ProofItem, "url" | "type">[],
    workerNote?: string,
  ) => {
    const res = await apiClient.post<{ success: boolean; data: Task }>(
      `/tasks/${id}/complete`,
      { proof, workerNote },
    );
    return res.data.data;
  },
  approve: async (id: string, publishToClient?: boolean) => {
    const res = await apiClient.post<{ success: boolean; data: Task }>(
      `/tasks/${id}/approve`,
      { publishToClient },
    );
    return res.data.data;
  },
  reject: async (id: string, reason: string) => {
    const res = await apiClient.post<{ success: boolean; data: Task }>(
      `/tasks/${id}/reject`,
      { reason },
    );
    return res.data.data;
  },
  reopen: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: Task }>(
      `/tasks/${id}/reopen`,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/tasks/${id}`);
    return res.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: TaskStats }>(
      "/tasks/stats",
    );
    return res.data.data;
  },
};
