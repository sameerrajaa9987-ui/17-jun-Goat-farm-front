import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "@modules/task/api/taskApi";
import {
  AssignTaskPayload,
  TaskListParams,
  ProofItem,
} from "@modules/task/types";

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["tasks"] });
  qc.invalidateQueries({ queryKey: ["task"] });
  qc.invalidateQueries({ queryKey: ["task-stats"] });
};

export const useTasks = (params?: TaskListParams) =>
  useQuery({
    queryKey: ["tasks", params],
    queryFn: () => taskApi.list(params),
  });

export const useTask = (id: string) =>
  useQuery({
    queryKey: ["task", id],
    queryFn: () => taskApi.get(id),
    enabled: !!id,
  });

export const useTaskStats = (enabled = true) =>
  useQuery({
    queryKey: ["task-stats"],
    queryFn: () => taskApi.stats(),
    enabled,
  });

export const useAssignTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignTaskPayload) => taskApi.assign(payload),
    onSuccess: () => invalidate(qc),
  });
};

export const useStartTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.start(id),
    onSuccess: () => invalidate(qc),
  });
};

export const useCompleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      proof,
      workerNote,
    }: {
      id: string;
      proof: Pick<ProofItem, "url" | "type">[];
      workerNote?: string;
    }) => taskApi.complete(id, proof, workerNote),
    onSuccess: () => invalidate(qc),
  });
};

export const useApproveTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      publishToClient,
    }: {
      id: string;
      publishToClient?: boolean;
    }) => taskApi.approve(id, publishToClient),
    onSuccess: () => invalidate(qc),
  });
};

export const useRejectTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      taskApi.reject(id, reason),
    onSuccess: () => invalidate(qc),
  });
};
