import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "@modules/document/api/documentApi";
import { CreateDocPayload, DocumentType } from "@modules/document/types";

export const useDocuments = (params?: {
  type?: DocumentType;
  relatedGoat?: string;
  relatedClient?: string;
}) =>
  useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentApi.list(params),
  });

export const useCreateDocument = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocPayload) => documentApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
};
