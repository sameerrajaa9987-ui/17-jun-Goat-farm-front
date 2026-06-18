import { apiClient } from "@api/apiClient";
import {
  TeamUser,
  CreateUserPayload,
  ActivityLog,
  Paginated,
} from "@modules/team/types";

export const teamApi = {
  listUsers: async (params?: { role?: string; search?: string }) => {
    const res = await apiClient.get<Paginated<TeamUser>>("/users", { params });
    return res.data;
  },
  createUser: async (payload: CreateUserPayload) => {
    const res = await apiClient.post<{ success: boolean; data: TeamUser }>(
      "/users",
      payload,
    );
    return res.data;
  },
  setActive: async (id: string, isActive: boolean) => {
    const res = await apiClient.patch(`/users/${id}/active`, { isActive });
    return res.data;
  },
  listActivityLogs: async (params?: { page?: number }) => {
    const res = await apiClient.get<Paginated<ActivityLog>>("/activity-logs", {
      params,
    });
    return res.data;
  },
};
