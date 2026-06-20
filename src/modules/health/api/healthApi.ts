import { apiClient } from "@api/apiClient";
import {
  HealthRecord,
  HealthAlerts,
  HealthStats,
  CreateHealthPayload,
  HealthType,
  HealthRecordStatus,
  Paginated,
} from "@modules/health/types";

export const healthApi = {
  list: async (params?: {
    goatId?: string;
    type?: HealthType;
    status?: HealthRecordStatus;
  }) => {
    const res = await apiClient.get<Paginated<HealthRecord>>(
      "/health/records",
      { params },
    );
    return res.data;
  },
  timeline: async (goatId: string) => {
    const res = await apiClient.get<{ success: boolean; data: HealthRecord[] }>(
      `/health/goat/${goatId}/timeline`,
    );
    return res.data.data;
  },
  schedule: async (params?: {
    from?: string;
    to?: string;
    goatId?: string;
  }) => {
    const res = await apiClient.get<{ success: boolean; data: HealthRecord[] }>(
      "/health/schedule",
      { params },
    );
    return res.data.data;
  },
  alerts: async () => {
    const res = await apiClient.get<{ success: boolean; data: HealthAlerts }>(
      "/health/alerts",
    );
    return res.data.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: HealthStats }>(
      "/health/stats",
    );
    return res.data.data;
  },
  create: async (payload: CreateHealthPayload) => {
    const res = await apiClient.post<{ success: boolean; data: HealthRecord }>(
      "/health/records",
      payload,
    );
    return res.data.data;
  },
  complete: async (
    id: string,
    body: {
      medicine?: string;
      dosage?: string;
      vetNotes?: string;
      nextDueDate?: string;
    },
  ) => {
    const res = await apiClient.post<{ success: boolean; data: HealthRecord }>(
      `/health/records/${id}/complete`,
      body,
    );
    return res.data.data;
  },
  cancel: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: HealthRecord }>(
      `/health/records/${id}/cancel`,
    );
    return res.data.data;
  },
  reopen: async (id: string, dueDate: string) => {
    const res = await apiClient.post<{ success: boolean; data: HealthRecord }>(
      `/health/records/${id}/reopen`,
      { dueDate },
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/health/records/${id}`);
    return res.data;
  },
  runReminders: async () => {
    const res = await apiClient.post("/health/run-reminders");
    return res.data.data;
  },
};
