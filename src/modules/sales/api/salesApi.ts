import { apiClient } from "@api/apiClient";
import {
  Sale,
  SalesStats,
  SellGoatPayload,
  Paginated,
} from "@modules/sales/types";

export const salesApi = {
  list: async () => {
    const res = await apiClient.get<Paginated<Sale>>("/sales");
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Sale }>(
      `/sales/${id}`,
    );
    return res.data.data;
  },
  sell: async (payload: SellGoatPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Sale }>(
      "/sales",
      payload,
    );
    return res.data.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: SalesStats }>(
      "/sales/stats",
    );
    return res.data.data;
  },
  void: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: Sale }>(
      `/sales/${id}/void`,
    );
    return res.data.data;
  },
};
