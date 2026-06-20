import { apiClient } from "@api/apiClient";
import {
  Goat,
  GoatListItem,
  GoatListParams,
  GoatStats,
  RegisterGoatPayload,
  QrResult,
  Paginated,
} from "@modules/goat/types";

export const goatApi = {
  list: async (params?: GoatListParams) => {
    const res = await apiClient.get<Paginated<GoatListItem>>("/goats", {
      params,
    });
    return res.data;
  },
  get: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Goat }>(
      `/goats/${id}`,
    );
    return res.data.data;
  },
  scan: async (qrToken: string) => {
    const res = await apiClient.get<{ success: boolean; data: Goat }>(
      `/goats/scan/${qrToken}`,
    );
    return res.data.data;
  },
  register: async (payload: RegisterGoatPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Goat }>(
      "/goats",
      payload,
    );
    return res.data.data;
  },
  update: async (
    id: string,
    payload: Partial<RegisterGoatPayload> & { status?: string },
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: Goat }>(
      `/goats/${id}`,
      payload,
    );
    return res.data.data;
  },
  addWeight: async (id: string, weightKg: number, note?: string) => {
    const res = await apiClient.post<{ success: boolean; data: Goat }>(
      `/goats/${id}/weights`,
      { weightKg, note },
    );
    return res.data.data;
  },
  updateWeight: async (
    id: string,
    weightId: string,
    patch: { weightKg?: number; note?: string },
  ) => {
    const res = await apiClient.patch<{ success: boolean; data: Goat }>(
      `/goats/${id}/weights/${weightId}`,
      patch,
    );
    return res.data.data;
  },
  deleteWeight: async (id: string, weightId: string) => {
    const res = await apiClient.delete<{ success: boolean; data: Goat }>(
      `/goats/${id}/weights/${weightId}`,
    );
    return res.data.data;
  },
  qr: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: QrResult }>(
      `/goats/${id}/qr`,
    );
    return res.data.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: GoatStats }>(
      "/goats/stats",
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/goats/${id}`);
    return res.data;
  },
};

/** Uploads a local image URI and returns its server URL. */
export async function uploadImage(uri: string): Promise<string> {
  const name = uri.split("/").pop() || `photo-${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(name);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  const form = new FormData();
  // RN FormData file shape
  form.append("file", { uri, name, type } as unknown as Blob);
  const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
    "/media",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data.url;
}
