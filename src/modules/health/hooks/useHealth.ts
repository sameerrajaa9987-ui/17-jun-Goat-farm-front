import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { healthApi } from "@modules/health/api/healthApi";
import {
  CreateHealthPayload,
  HealthType,
  HealthRecordStatus,
} from "@modules/health/types";

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["health"] });
  qc.invalidateQueries({ queryKey: ["health-timeline"] });
  qc.invalidateQueries({ queryKey: ["health-alerts"] });
  qc.invalidateQueries({ queryKey: ["health-schedule"] });
  qc.invalidateQueries({ queryKey: ["goats"] });
  qc.invalidateQueries({ queryKey: ["goat"] });
  qc.invalidateQueries({ queryKey: ["goat-stats"] });
};

export const useHealthTimeline = (goatId: string) =>
  useQuery({
    queryKey: ["health-timeline", goatId],
    queryFn: () => healthApi.timeline(goatId),
    enabled: !!goatId,
  });

export const useHealthAlerts = (enabled = true) =>
  useQuery({
    queryKey: ["health-alerts"],
    queryFn: () => healthApi.alerts(),
    enabled,
  });

export const useHealthSchedule = () =>
  useQuery({
    queryKey: ["health-schedule"],
    queryFn: () => healthApi.schedule(),
  });

export const useHealthStats = (enabled = true) =>
  useQuery({
    queryKey: ["health", "stats"],
    queryFn: () => healthApi.stats(),
    enabled,
  });

export const useCreateHealthRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHealthPayload) => healthApi.create(payload),
    onSuccess: () => invalidate(qc),
  });
};

export const useCompleteScheduled = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { medicine?: string; dosage?: string; nextDueDate?: string };
    }) => healthApi.complete(id, body),
    onSuccess: () => invalidate(qc),
  });
};

export const useCancelRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthApi.cancel(id),
    onSuccess: () => invalidate(qc),
  });
};

export const useReopenRecord = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dueDate }: { id: string; dueDate: string }) =>
      healthApi.reopen(id, dueDate),
    onSuccess: () => invalidate(qc),
  });
};

export const useRunReminders = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => healthApi.runReminders(),
    onSuccess: () => invalidate(qc),
  });
};

export type HealthListFilter = {
  goatId?: string;
  type?: HealthType;
  status?: HealthRecordStatus;
};
