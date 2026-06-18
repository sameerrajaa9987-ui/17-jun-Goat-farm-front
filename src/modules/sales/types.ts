export interface Buyer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  goat: { id: string; goatId?: string; name?: string; photo?: string } | null;
  goatCode: string;
  goatName: string;
  buyerName: string;
  buyerPhone: string;
  salePrice: number;
  saleDate: string;
  paymentStatus: "paid" | "pending";
  paymentMethod: string;
  wasClientOwned: boolean;
  purchasePrice: number;
  recordedCosts: number;
  profit: number;
  notes: string;
  createdAt: string;
}

export interface SalesStats {
  count: number;
  revenue: number;
  profit: number;
}

export interface SellGoatPayload {
  goatId: string;
  buyerName?: string;
  buyerPhone?: string;
  salePrice: number;
  paymentMethod?: string;
  notes?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
