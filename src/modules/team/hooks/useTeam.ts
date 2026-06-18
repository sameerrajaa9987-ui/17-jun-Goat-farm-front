import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "@modules/team/api/teamApi";
import { CreateUserPayload } from "@modules/team/types";

export const useUsers = (params?: { role?: string; search?: string }) =>
  useQuery({
    queryKey: ["users", params],
    queryFn: () => teamApi.listUsers(params),
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => teamApi.createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useSetUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      teamApi.setActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useActivityLogs = () =>
  useQuery({
    queryKey: ["activity-logs"],
    queryFn: () => teamApi.listActivityLogs({ page: 1 }),
  });
