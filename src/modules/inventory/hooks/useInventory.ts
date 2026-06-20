import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@modules/inventory/api/inventoryApi";
import {
  CreateItemPayload,
  MovementPayload,
  InventoryCategory,
} from "@modules/inventory/types";

const invalidate = (qc: ReturnType<typeof useQueryClient>, id?: string) => {
  qc.invalidateQueries({ queryKey: ["inventory"] });
  if (id) {
    qc.invalidateQueries({ queryKey: ["inventory-item", id] });
    qc.invalidateQueries({ queryKey: ["inventory-movements", id] });
  }
};

export const useInventoryItems = (params?: {
  category?: InventoryCategory;
  search?: string;
  lowStockOnly?: boolean;
}) =>
  useQuery({
    queryKey: ["inventory", params],
    queryFn: () => inventoryApi.list(params),
  });

export const useInventoryItem = (id: string) =>
  useQuery({
    queryKey: ["inventory-item", id],
    queryFn: () => inventoryApi.get(id),
    enabled: !!id,
  });

export const useInventoryMovements = (id: string) =>
  useQuery({
    queryKey: ["inventory-movements", id],
    queryFn: () => inventoryApi.movements(id),
    enabled: !!id,
  });

export const useInventoryStats = (enabled = true) =>
  useQuery({
    queryKey: ["inventory", "stats"],
    queryFn: () => inventoryApi.stats(),
    enabled,
  });

export const useCreateItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => inventoryApi.create(payload),
    onSuccess: () => invalidate(qc),
  });
};

export const useMoveStock = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MovementPayload) => inventoryApi.move(id, payload),
    onSuccess: () => invalidate(qc, id),
  });
};

export const useReverseMovement = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (movementId: string) =>
      inventoryApi.reverseMovement(movementId),
    onSuccess: () => invalidate(qc, id),
  });
};
