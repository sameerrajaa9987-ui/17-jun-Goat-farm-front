import { apiClient } from "@api/apiClient";
import {
  Transaction,
  PnL,
  FinanceStats,
  GoatProfitability,
  CreateTxPayload,
  TxType,
  Paginated,
} from "@modules/finance/types";

export const financeApi = {
  list: async (params?: {
    type?: TxType;
    category?: string;
    relatedGoat?: string;
    from?: string;
    to?: string;
  }) => {
    const res = await apiClient.get<Paginated<Transaction>>(
      "/finance/transactions",
      { params },
    );
    return res.data;
  },
  create: async (payload: CreateTxPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Transaction }>(
      "/finance/transactions",
      payload,
    );
    return res.data.data;
  },
  remove: async (id: string) => {
    const res = await apiClient.delete(`/finance/transactions/${id}`);
    return res.data;
  },
  pnl: async (params?: { from?: string; to?: string }) => {
    const res = await apiClient.get<{ success: boolean; data: PnL }>(
      "/finance/pnl",
      { params },
    );
    return res.data.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: FinanceStats }>(
      "/finance/stats",
    );
    return res.data.data;
  },
  goatProfitability: async (goatId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: GoatProfitability;
    }>(`/finance/goat/${goatId}/profitability`);
    return res.data.data;
  },
};
