import type { MedicineUnit } from "./medicine";

export type RecordStatus = "DRAFT" | "COMPLETED" | "ARCHIVED";

export type DiagnosisType = "PRIMARY" | "SECONDARY" | "PROVISIONAL" | "RULE_OUT";

export type FrequencyEnum =
  | "ONCE_DAILY"
  | "TWICE_DAILY"
  | "THREE_TIMES_DAILY"
  | "EVERY_8_HOURS"
  | "EVERY_12_HOURS"
  | "AS_NEEDED";

export interface MedicalRecord {
  id: string;
  recordNo: string;
  appointmentId?: string | null;
  patientId: string;
  doctorId: string;
  departmentId?: string | null;
  visitDate: string;
  chiefComplaint: string;
  presentIllness?: string | null;
  assessment?: string | null;
  treatmentPlan?: string | null;
  status: RecordStatus;
  isConfidential?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalRecordCreateRequest {
  appointmentId?: string | null;
  patientId: string;
  doctorId: string;
  departmentId?: string | null;
  visitDate: string;
  chiefComplaint: string;
  presentIllness?: string | null;
  assessment?: string | null;
  treatmentPlan?: string | null;
  isConfidential?: boolean;
}

export interface MedicalRecordUpdateRequest {
  visitDate?: string;
  chiefComplaint?: string;
  presentIllness?: string | null;
  assessment?: string | null;
  treatmentPlan?: string | null;
}

export interface VitalSigns {
  id: string;
  medicalRecordId: string;
  temperature?: number | null;
  heartRate?: number | null;
  bloodPressure?: number | null;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
  createdAt?: string;
}

export interface VitalSignsRequest {
  temperature?: number | null;
  heartRate?: number | null;
  bloodPressure?: number | null;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
}

export interface Diagnosis {
  medicalRecordId: string;
  icdCodeId?: string | null;
  customDiagnosis?: string | null;
  diagnosisType: DiagnosisType;
  notes?: string | null;
  createdAt?: string;
}

export interface DiagnosisCreateRequest {
  icdCodeId?: string | null;
  customDiagnosis?: string | null;
  diagnosisType?: DiagnosisType;
  notes?: string | null;
}

export interface IcdCode {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
}

export interface PrescriptionSummary {
  id: string;
  prescriptionNo: string;
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  prescribedDate: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  itemCount?: number;
}

export interface PrescriptionDetail extends PrescriptionSummary {
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id?: string;
  prescriptionId?: string;
  medicineId?: string | null;
  medicineName: string;
  dosage: string;
  frequency?: FrequencyEnum | null;
  durationDays?: number | null;
  quantity: number;
  unit?: MedicineUnit | null;
  route?: string | null;
  instructions?: string | null;
  notes?: string | null;
}

export interface PrescriptionCreateRequest {
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  prescribedDate: string;
  notes?: string | null;
  items: PrescriptionItem[];
}

export interface MedicalRecordSearchParams {
  patientId?: string;
  doctorId?: string;
  status?: RecordStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

export interface PrescriptionSearchParams {
  medicalRecordId?: string;
  patientId?: string;
  doctorId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}
