import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goatApi } from "@modules/goat/api/goatApi";
import { GoatListParams, RegisterGoatPayload } from "@modules/goat/types";

export const useGoats = (params?: GoatListParams) =>
  useQuery({
    queryKey: ["goats", params],
    queryFn: () => goatApi.list(params),
  });

export const useGoat = (id: string) =>
  useQuery({
    queryKey: ["goat", id],
    queryFn: () => goatApi.get(id),
    enabled: !!id,
  });

export const useGoatStats = () =>
  useQuery({ queryKey: ["goat-stats"], queryFn: () => goatApi.stats() });

export const useGoatQr = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: ["goat-qr", id],
    queryFn: () => goatApi.qr(id),
    enabled: enabled && !!id,
  });

export const useRegisterGoat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterGoatPayload) => goatApi.register(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goats"] });
      qc.invalidateQueries({ queryKey: ["goat-stats"] });
    },
  });
};

export const useUpdateGoat = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RegisterGoatPayload> & { status?: string }) =>
      goatApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat", id] });
      qc.invalidateQueries({ queryKey: ["goats"] });
      qc.invalidateQueries({ queryKey: ["goat-stats"] });
    },
  });
};

export const useAddWeight = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ weightKg, note }: { weightKg: number; note?: string }) =>
      goatApi.addWeight(id, weightKg, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goat", id] });
      qc.invalidateQueries({ queryKey: ["goats"] });
    },
  });
};

export const useScanGoat = () =>
  useMutation({ mutationFn: (qrToken: string) => goatApi.scan(qrToken) });
