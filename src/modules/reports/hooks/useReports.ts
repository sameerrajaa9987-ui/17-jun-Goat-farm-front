import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@modules/reports/api/reportsApi";

export const useOverview = () =>
  useQuery({
    queryKey: ["reports", "overview"],
    queryFn: () => reportsApi.overview(),
  });
