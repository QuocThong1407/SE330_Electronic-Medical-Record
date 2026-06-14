import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type {
  Diagnosis,
  DiagnosisCreateRequest,
  IcdCode,
  MedicalRecord,
  MedicalRecordCreateRequest,
  MedicalRecordSearchParams,
  MedicalRecordUpdateRequest,
  PrescriptionCreateRequest,
  PrescriptionDetail,
  PrescriptionSearchParams,
  PrescriptionSummary,
  VitalSigns,
  VitalSignsRequest,
} from "../types/clinical";

function unwrapPage<T>(data: ApiResponse<any>): T[] {
  const payload = data?.data;
  const content = Array.isArray(payload) ? payload : payload?.content || payload?.data?.content || [];
  return Array.isArray(content) ? content : [];
}

export async function getMedicalRecords(params: MedicalRecordSearchParams = {}): Promise<MedicalRecord[]> {
  const { data } = await api.get<ApiResponse<any>>("/medical-records", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.doctorId ? { doctorId: params.doctorId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.fromDate ? { fromDate: params.fromDate } : {}),
      ...(params.toDate ? { toDate: params.toDate } : {}),
    },
  });

  return unwrapPage<MedicalRecord>(data);
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const { data } = await api.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`);
  return data.data;
}

export async function createMedicalRecord(payload: MedicalRecordCreateRequest): Promise<MedicalRecord> {
  const { data } = await api.post<ApiResponse<MedicalRecord>>("/medical-records", payload);
  return data.data;
}

export async function updateMedicalRecord(id: string, payload: MedicalRecordUpdateRequest): Promise<MedicalRecord> {
  const { data } = await api.put<ApiResponse<MedicalRecord>>(`/medical-records/${id}`, payload);
  return data.data;
}

export async function completeMedicalRecord(id: string): Promise<MedicalRecord> {
  const { data } = await api.patch<ApiResponse<MedicalRecord>>(`/medical-records/${id}/complete`);
  return data.data;
}

export async function archiveMedicalRecord(id: string): Promise<MedicalRecord> {
  const { data } = await api.patch<ApiResponse<MedicalRecord>>(`/medical-records/${id}/archive`);
  return data.data;
}

export async function setMedicalRecordConfidential(id: string, isConfidential: boolean): Promise<MedicalRecord> {
  const { data } = await api.patch<ApiResponse<MedicalRecord>>(`/medical-records/${id}/confidential`, {
    isConfidential,
  });
  return data.data;
}

export async function getVitalSigns(recordId: string): Promise<VitalSigns> {
  const { data } = await api.get<ApiResponse<VitalSigns>>(`/medical-records/${recordId}/vital-signs`);
  return data.data;
}

export async function createVitalSigns(recordId: string, payload: VitalSignsRequest): Promise<VitalSigns> {
  const { data } = await api.post<ApiResponse<VitalSigns>>(`/medical-records/${recordId}/vital-signs`, payload);
  return data.data;
}

export async function updateVitalSigns(recordId: string, payload: VitalSignsRequest): Promise<VitalSigns> {
  const { data } = await api.put<ApiResponse<VitalSigns>>(`/medical-records/${recordId}/vital-signs`, payload);
  return data.data;
}

export async function getDiagnoses(recordId: string): Promise<Diagnosis[]> {
  const { data } = await api.get<ApiResponse<Diagnosis[]>>(`/medical-records/${recordId}/diagnoses`);
  return data.data || [];
}

export async function addDiagnosis(recordId: string, payload: DiagnosisCreateRequest): Promise<Diagnosis> {
  const { data } = await api.post<ApiResponse<Diagnosis>>(`/medical-records/${recordId}/diagnoses`, payload);
  return data.data;
}

export async function deleteDiagnosis(recordId: string, icdCodeId: string): Promise<void> {
  await api.delete(`/medical-records/${recordId}/diagnoses/${icdCodeId}`);
}

export async function searchIcdCodes(keyword?: string, category?: string): Promise<IcdCode[]> {
  const { data } = await api.get<ApiResponse<any>>("/icd-codes", {
    params: {
      page: 0,
      size: 20,
      ...(keyword ? { keyword } : {}),
      ...(category ? { category } : {}),
    },
  });

  return unwrapPage<IcdCode>(data);
}

export async function createIcdCode(payload: { id: string; name: string; category?: string | null; description?: string | null }): Promise<IcdCode> {
  const { data } = await api.post<ApiResponse<IcdCode>>("/icd-codes", payload);
  return data.data;
}

export async function updateIcdCode(
  id: string,
  payload: { name: string; category?: string | null; description?: string | null }
): Promise<IcdCode> {
  const { data } = await api.put<ApiResponse<IcdCode>>(`/icd-codes/${id}`, payload);
  return data.data;
}

export async function deleteIcdCode(id: string): Promise<void> {
  await api.delete(`/icd-codes/${id}`);
}

export async function searchPrescriptions(params: PrescriptionSearchParams = {}): Promise<PrescriptionSummary[]> {
  const { data } = await api.get<ApiResponse<any>>("/prescriptions", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      ...(params.medicalRecordId ? { medicalRecordId: params.medicalRecordId } : {}),
      ...(params.patientId ? { patientId: params.patientId } : {}),
      ...(params.doctorId ? { doctorId: params.doctorId } : {}),
      ...(params.fromDate ? { fromDate: params.fromDate } : {}),
      ...(params.toDate ? { toDate: params.toDate } : {}),
    },
  });

  return unwrapPage<PrescriptionSummary>(data);
}

export async function createPrescription(payload: PrescriptionCreateRequest): Promise<PrescriptionDetail> {
  const { data } = await api.post<ApiResponse<PrescriptionDetail>>("/prescriptions", payload);
  return data.data;
}

export async function getPrescriptionItems(prescriptionId: string): Promise<PrescriptionDetail["items"]> {
  const { data } = await api.get<ApiResponse<PrescriptionDetail["items"]>>(`/prescriptions/${prescriptionId}/items`);
  return data.data || [];
}
