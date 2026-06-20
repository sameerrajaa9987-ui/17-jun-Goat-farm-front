import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@modules/billing/api/billingApi";
import { InvoiceStatus, InvoiceLineItem } from "@modules/billing/types";

const invalidateBilling = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["invoices"] });
  qc.invalidateQueries({ queryKey: ["invoice"] });
  qc.invalidateQueries({ queryKey: ["billing-stats"] });
  qc.invalidateQueries({ queryKey: ["my-payments"] });
  qc.invalidateQueries({ queryKey: ["client"] });
};

export const usePackages = (includeInactive = false) =>
  useQuery({
    queryKey: ["packages", includeInactive],
    queryFn: () => billingApi.listPackages(includeInactive),
  });

export const useCreatePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: {
      name: string;
      monthlyAmount: number;
      description?: string;
    }) => billingApi.createPackage(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packages"] }),
  });
};

export const useUpdatePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      billingApi.updatePackage(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packages"] }),
  });
};

export const useInvoices = (params?: {
  status?: InvoiceStatus;
  clientUserId?: string;
  period?: string;
}) =>
  useQuery({
    queryKey: ["invoices", params],
    queryFn: () => billingApi.listInvoices(params),
  });

export const useInvoice = (id: string) =>
  useQuery({
    queryKey: ["invoice", id],
    queryFn: () => billingApi.getInvoice(id),
    enabled: !!id,
  });

export const useBillingStats = (enabled = true) =>
  useQuery({
    queryKey: ["billing-stats"],
    queryFn: () => billingApi.stats(),
    enabled,
  });

export const useMyPayments = (enabled = true) =>
  useQuery({
    queryKey: ["my-payments"],
    queryFn: () => billingApi.myPayments(),
    enabled,
  });

export const useGenerateInvoices = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body?: { period?: string; dueInDays?: number }) =>
      billingApi.generate(body),
    onSuccess: () => invalidateBilling(qc),
  });
};

/**
 * Pays an invoice. In dev (Razorpay not configured) it starts the order and
 * immediately confirms (signature accepted server-side). With live keys this
 * is where the native Razorpay checkout would open before confirm.
 */
export const usePayInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { order, razorpayConfigured } = await billingApi.startPayment(id);
      if (!razorpayConfigured) {
        return billingApi.confirmPayment(id, {
          razorpayOrderId: order.orderId,
          razorpayPaymentId: `dev_${order.orderId}`,
        });
      }
      // Live mode: a native Razorpay checkout opens here; omitted in dev build.
      throw new Error("RAZORPAY_CHECKOUT_REQUIRED");
    },
    onSuccess: () => invalidateBilling(qc),
  });
};

export const useRecordOffline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, method }: { id: string; method?: string }) =>
      billingApi.recordOffline(id, { method }),
    onSuccess: () => invalidateBilling(qc),
  });
};

export const useCancelInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.cancelInvoice(id),
    onSuccess: () => invalidateBilling(qc),
  });
};

export const useReversePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.reversePayment(id),
    onSuccess: () => invalidateBilling(qc),
  });
};

export const useUpdateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { lineItems?: InvoiceLineItem[]; total?: number };
    }) => billingApi.updateInvoice(id, patch),
    onSuccess: () => invalidateBilling(qc),
  });
};
