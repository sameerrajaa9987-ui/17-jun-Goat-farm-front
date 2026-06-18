export type InvoiceStatus = "due" | "paid" | "overdue" | "cancelled";

export interface Package {
  id: string;
  name: string;
  monthlyAmount: number;
  description: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  goat: { id: string; goatId?: string; name?: string; photo?: string };
  packageName: string;
  monthlyAmount: number;
  status: "active" | "stopped";
  startDate: string;
}

export interface InvoiceLineItem {
  id: string;
  goatId: string | null;
  goatName: string;
  packageName: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  client: { id: string; name: string; email: string; phone?: string } | null;
  clientUserId: string;
  period: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  total: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: string;
  status: string;
  razorpayPaymentId: string;
  paidAt: string;
}

export interface BillingStats {
  outstanding: number;
  outstandingCount: number;
  collected: number;
  collectedCount: number;
  collectedThisMonth: number;
  overdueCount: number;
}

export interface PayOrder {
  devMode: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const INVOICE_TONE: Record<
  InvoiceStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  paid: "success",
  due: "warning",
  overdue: "danger",
  cancelled: "neutral",
};
