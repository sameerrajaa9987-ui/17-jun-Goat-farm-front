import { apiClient } from "@api/apiClient";
import {
  ClientProfile,
  ClientListItem,
  ClientFullProfile,
  OnboardClientPayload,
} from "@modules/client/types";

export const clientApi = {
  list: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: ClientListItem[];
    }>("/clients");
    return res.data.data;
  },
  profile: async (userId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: ClientFullProfile;
    }>(`/clients/${userId}`);
    return res.data.data;
  },
  onboard: async (payload: OnboardClientPayload) => {
    const res = await apiClient.post<{ success: boolean; data: ClientProfile }>(
      "/clients",
      payload,
    );
    return res.data.data;
  },
  update: async (userId: string, body: Partial<ClientProfile>) => {
    const res = await apiClient.patch<{
      success: boolean;
      data: ClientProfile;
    }>(`/clients/${userId}`, body);
    return res.data.data;
  },
  assignGoat: async (userId: string, goatId: string, packageId: string) => {
    const res = await apiClient.post(`/clients/${userId}/assign-goat`, {
      goatId,
      packageId,
    });
    return res.data.data;
  },
  unassignGoat: async (userId: string, goatId: string) => {
    const res = await apiClient.post(`/clients/${userId}/unassign-goat`, {
      goatId,
    });
    return res.data.data;
  },
};
