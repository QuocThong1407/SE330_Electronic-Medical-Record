import type { RoleName } from "./auth";

export interface DoctorProfile {
  id: string;
  userId: string;
  departmentId?: string | null;
  employeeCode: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string | null;
  phone?: string | null;
  emailContact?: string | null;
  degree?: string | null;
  experienceYears: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorProfileForm {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  departmentId?: string | null;
  phone?: string | null;
  emailContact?: string | null;
  degree?: string | null;
  experienceYears?: number;
  dateOfBirth?: string | null;
}

export interface UserDoctorLink {
  role?: RoleName;
  doctorProfile?: DoctorProfile | null;
}
