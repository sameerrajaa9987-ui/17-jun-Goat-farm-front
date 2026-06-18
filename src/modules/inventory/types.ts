export type InventoryCategory =
  | "feed"
  | "medicine"
  | "equipment"
  | "supplement"
  | "mineral"
  | "other";

export type MovementType = "in" | "out" | "adjust";

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  stockValue: number;
  supplier: string;
  notes: string;
  isLow: boolean;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  balanceAfter: number;
  reason: string;
  relatedGoat: { id: string; goatId: string; name: string } | null;
  performedBy: { id: string; name: string; role: string } | null;
  createdAt: string;
}

export interface InventoryStats {
  items: number;
  lowStock: number;
  stockValue: number;
}

export interface CreateItemPayload {
  name: string;
  category?: InventoryCategory;
  unit?: string;
  openingStock?: number;
  minStock?: number;
  costPerUnit?: number;
  supplier?: string;
  notes?: string;
}

export interface MovementPayload {
  type: MovementType;
  quantity: number;
  reason?: string;
  relatedGoat?: string | null;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  feed: "Feed",
  medicine: "Medicine",
  equipment: "Equipment",
  supplement: "Supplement",
  mineral: "Mineral",
  other: "Other",
};
