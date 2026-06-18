import { GoatListItem } from "@modules/goat/types";
import { Subscription, Invoice } from "@modules/billing/types";

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface ClientProfile {
  id: string;
  user: ClientUser | null;
  userId: string;
  kycType: string;
  kycNumber: string;
  kycDocs: { id: string; url: string; label: string }[];
  agreementUrl: string;
  agreementSignedAt: string | null;
  address: { line?: string; city?: string; state?: string; pincode?: string };
  notes: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface ClientListItem extends ClientProfile {
  goatCount: number;
  subscriptionCount: number;
}

export interface ClientFullProfile {
  client: ClientProfile;
  goats: GoatListItem[];
  subscriptions: Subscription[];
  invoices: Invoice[];
}

export interface OnboardClientPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  kycType?: "aadhaar" | "pan" | "other";
  kycNumber?: string;
  address?: { line?: string; city?: string; state?: string; pincode?: string };
  notes?: string;
}
