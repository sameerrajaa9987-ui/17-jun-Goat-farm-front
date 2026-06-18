import { apiClient } from "@api/apiClient";
import {
  InventoryItem,
  StockMovement,
  InventoryStats,
  CreateItemPayload,
  MovementPayload,
  InventoryCategory,
  Paginated,
} from "@modules/inventory/types";

export const inventoryApi = {
  list: async (params?: {
    category?: InventoryCategory;
    search?: string;
    lowStockOnly?: boolean;
  }) => {
    const res = await apiClient.get<Paginated<InventoryItem>>(
      "/inventory/items",
      { params },
    );
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: InventoryItem }>(
      `/inventory/items/${id}`,
    );
    return res.data.data;
  },
  create: async (payload: CreateItemPayload) => {
    const res = await apiClient.post<{ success: boolean; data: InventoryItem }>(
      "/inventory/items",
      payload,
    );
    return res.data.data;
  },
  update: async (id: string, payload: Partial<CreateItemPayload>) => {
    const res = await apiClient.patch<{
      success: boolean;
      data: InventoryItem;
    }>(`/inventory/items/${id}`, payload);
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/inventory/items/${id}`);
    return res.data;
  },
  move: async (id: string, payload: MovementPayload) => {
    const res = await apiClient.post<{
      success: boolean;
      data: { item: InventoryItem; movement: StockMovement };
    }>(`/inventory/items/${id}/movements`, payload);
    return res.data.data;
  },
  movements: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: StockMovement[];
    }>(`/inventory/items/${id}/movements`);
    return res.data.data;
  },
  alerts: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: InventoryItem[];
    }>("/inventory/alerts");
    return res.data.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: InventoryStats }>(
      "/inventory/stats",
    );
    return res.data.data;
  },
};
