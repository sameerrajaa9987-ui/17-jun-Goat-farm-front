import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "@modules/sales/api/salesApi";
import { SellGoatPayload } from "@modules/sales/types";

export const useSales = () =>
  useQuery({ queryKey: ["sales"], queryFn: () => salesApi.list() });

export const useSalesStats = (enabled = true) =>
  useQuery({
    queryKey: ["sales", "stats"],
    queryFn: () => salesApi.stats(),
    enabled,
  });

export const useSellGoat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SellGoatPayload) => salesApi.sell(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["goats"] });
      qc.invalidateQueries({ queryKey: ["goat"] });
      qc.invalidateQueries({ queryKey: ["goat-stats"] });
      qc.invalidateQueries({ queryKey: ["finance"] });
      qc.invalidateQueries({ queryKey: ["pnl"] });
    },
  });
};
