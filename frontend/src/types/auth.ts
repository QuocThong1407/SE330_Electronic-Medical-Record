export type RoleName = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";

export interface LinkedProfileResponse {
  id: string;
  code: string;
  fullName: string;
}

export interface UserSummary {
  id: string;
  email: string;
  role: RoleName;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  doctorProfile?: LinkedProfileResponse | null;
  patientProfile?: LinkedProfileResponse | null;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: UserSummary;
}