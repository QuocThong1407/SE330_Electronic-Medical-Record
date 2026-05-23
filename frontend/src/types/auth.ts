export type RoleName = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";

export interface UserSummary {
  id: string;
  email: string;
  role: RoleName;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: UserSummary;
}
