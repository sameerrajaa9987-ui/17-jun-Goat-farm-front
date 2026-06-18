import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@modules/client/api/clientApi";
import { OnboardClientPayload } from "@modules/client/types";

export const useClients = () =>
  useQuery({ queryKey: ["clients"], queryFn: () => clientApi.list() });

export const useClientProfile = (userId: string) =>
  useQuery({
    queryKey: ["client", userId],
    queryFn: () => clientApi.profile(userId),
    enabled: !!userId,
  });

export const useOnboardClient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OnboardClientPayload) => clientApi.onboard(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
};

export const useAssignGoat = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      goatId,
      packageId,
    }: {
      goatId: string;
      packageId: string;
    }) => clientApi.assignGoat(userId, goatId, packageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["client", userId] });
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["goats"] });
    },
  });
};
