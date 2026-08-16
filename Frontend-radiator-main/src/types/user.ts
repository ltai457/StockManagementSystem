export type UserRole = 1 | 2 | "Admin" | "Staff";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isActive?: boolean;
}

export type UpdateUserPayload = Omit<Partial<CreateUserPayload>, "password">;
