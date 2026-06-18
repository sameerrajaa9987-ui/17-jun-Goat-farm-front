import { apiClient } from "@api/apiClient";
import {
  Package,
  Invoice,
  Payment,
  BillingStats,
  PayOrder,
  InvoiceStatus,
  Paginated,
} from "@modules/billing/types";

export const billingApi = {
  // Packages
  listPackages: async (includeInactive = false) => {
    const res = await apiClient.get<{ success: boolean; data: Package[] }>(
      "/billing/packages",
      {
        params: { includeInactive },
      },
    );
    return res.data.data;
  },
  createPackage: async (body: {
    name: string;
    monthlyAmount: number;
    description?: string;
  }) => {
    const res = await apiClient.post<{ success: boolean; data: Package }>(
      "/billing/packages",
      body,
    );
    return res.data.data;
  },
  updatePackage: async (id: string, body: Partial<Package>) => {
    const res = await apiClient.patch<{ success: boolean; data: Package }>(
      `/billing/packages/${id}`,
      body,
    );
    return res.data.data;
  },

  // Invoices
  generate: async (body?: { period?: string; dueInDays?: number }) => {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        period: string;
        created: number;
        skipped: number;
        clients: number;
      };
    }>("/billing/invoices/generate", body || {});
    return res.data.data;
  },
  listInvoices: async (params?: {
    status?: InvoiceStatus;
    clientUserId?: string;
    period?: string;
  }) => {
    const res = await apiClient.get<Paginated<Invoice>>("/billing/invoices", {
      params,
    });
    return res.data;
  },
  getInvoice: async (id: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: { invoice: Invoice; payments: Payment[] };
    }>(`/billing/invoices/${id}`);
    return res.data.data;
  },
  startPayment: async (id: string) => {
    const res = await apiClient.post<{
      success: boolean;
      data: { invoice: Invoice; order: PayOrder; razorpayConfigured: boolean };
    }>(`/billing/invoices/${id}/pay`);
    return res.data.data;
  },
  confirmPayment: async (
    id: string,
    body: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    },
  ) => {
    const res = await apiClient.post<{ success: boolean; data: Invoice }>(
      `/billing/invoices/${id}/confirm`,
      body,
    );
    return res.data.data;
  },
  recordOffline: async (
    id: string,
    body: { method?: string; amount?: number },
  ) => {
    const res = await apiClient.post<{ success: boolean; data: Invoice }>(
      `/billing/invoices/${id}/record-payment`,
      body,
    );
    return res.data.data;
  },
  myPayments: async () => {
    const res = await apiClient.get<{ success: boolean; data: Payment[] }>(
      "/billing/my/payments",
    );
    return res.data.data;
  },
  stats: async () => {
    const res = await apiClient.get<{ success: boolean; data: BillingStats }>(
      "/billing/stats",
    );
    return res.data.data;
  },
};
