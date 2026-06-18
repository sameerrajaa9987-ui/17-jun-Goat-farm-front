import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { financeApi } from "@modules/finance/api/financeApi";
import { CreateTxPayload, TxType } from "@modules/finance/types";

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["finance"] });
  qc.invalidateQueries({ queryKey: ["pnl"] });
};

export const useTransactions = (params?: {
  type?: TxType;
  category?: string;
  from?: string;
  to?: string;
}) =>
  useQuery({
    queryKey: ["finance", "tx", params],
    queryFn: () => financeApi.list(params),
  });

export const usePnl = (params?: { from?: string; to?: string }) =>
  useQuery({
    queryKey: ["pnl", params],
    queryFn: () => financeApi.pnl(params),
  });

export const useFinanceStats = (enabled = true) =>
  useQuery({
    queryKey: ["finance", "stats"],
    queryFn: () => financeApi.stats(),
    enabled,
  });

export const useGoatProfitability = (goatId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["finance", "profit", goatId],
    queryFn: () => financeApi.goatProfitability(goatId),
    enabled: enabled && !!goatId,
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTxPayload) => financeApi.create(payload),
    onSuccess: () => invalidate(qc),
  });
};
