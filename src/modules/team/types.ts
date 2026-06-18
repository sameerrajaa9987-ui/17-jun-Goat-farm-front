import { Role } from "@shared/store/useAuthStore";

export interface TeamUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  permissions: string[];
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
}

export interface ActivityLog {
  id: string;
  user: { id: string; name: string; email: string; role: string } | null;
  userRole: string;
  action: string;
  entityType: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
