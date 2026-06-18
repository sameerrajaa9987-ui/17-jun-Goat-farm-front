export type TxType = "income" | "expense";

export const EXPENSE_CATEGORIES = [
  "feed",
  "medicine",
  "transport",
  "utilities",
  "salary",
  "equipment",
  "other",
] as const;
export const INCOME_CATEGORIES = [
  "goat_sale",
  "adpali_fee",
  "milk",
  "manure",
  "breeding",
  "other",
] as const;

export interface Transaction {
  id: string;
  type: TxType;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  relatedGoat: { id: string; goatId?: string; name?: string } | null;
  source: string;
  recordedBy: { id: string; name: string; role: string } | null;
  createdAt: string;
}

export interface PnL {
  income: number;
  expense: number;
  net: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
}

export interface FinanceStats {
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  totalNet: number;
}

export interface GoatProfitability {
  goatId: string;
  goatCode: string;
  purchasePrice: number;
  currentValue: number;
  expenses: number;
  totalCost: number;
  saleIncome: number;
  profit: number;
  status: string;
  ownershipType: "farm" | "client";
}

export interface CreateTxPayload {
  type: TxType;
  category: string;
  amount: number;
  description?: string;
  date?: string;
  relatedGoat?: string | null;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const CATEGORY_LABEL: Record<string, string> = {
  feed: "Feed",
  medicine: "Medicine",
  transport: "Transport",
  utilities: "Utilities",
  salary: "Salary",
  equipment: "Equipment",
  goat_sale: "Goat sale",
  adpali_fee: "Ad Pali fee",
  milk: "Milk",
  manure: "Manure",
  breeding: "Breeding",
  other: "Other",
};
