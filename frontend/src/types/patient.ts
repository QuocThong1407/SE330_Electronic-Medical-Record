export interface PatientProfile {
  id: string;
  userId?: string | null;
  patientCode: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string | null;
  idCardNumber?: string | null;
  insuranceNumber?: string | null;
  insuranceExpDate?: string | null;
  phone?: string | null;
  emailContact?: string | null;
  address?: string | null;
  city?: string | null;
  bloodType?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientProfileForm {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string | null;
  idCardNumber?: string | null;
  insuranceNumber?: string | null;
  insuranceExpDate?: string | null;
  phone?: string | null;
  emailContact?: string | null;
  address?: string | null;
  city?: string | null;
  bloodType?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  notes?: string | null;
}
