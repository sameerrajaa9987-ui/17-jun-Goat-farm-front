import { apiClient } from "@api/apiClient";
import {
  FarmDocument,
  CreateDocPayload,
  DocumentType,
  Paginated,
} from "@modules/document/types";

export const documentApi = {
  list: async (params?: {
    type?: DocumentType;
    relatedGoat?: string;
    relatedClient?: string;
  }) => {
    const res = await apiClient.get<Paginated<FarmDocument>>("/documents", {
      params,
    });
    return res.data;
  },
  create: async (payload: CreateDocPayload) => {
    const res = await apiClient.post<{ success: boolean; data: FarmDocument }>(
      "/documents",
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/documents/${id}`);
    return res.data;
  },
};
