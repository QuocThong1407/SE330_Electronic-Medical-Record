import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { DoctorProfile } from "../types/doctor";
import type { PatientProfile } from "../types/patient";

export async function getMyDoctorProfile() {
  const { data } = await api.get<ApiResponse<DoctorProfile>>("/doctors/profile");
  return data.data;
}

export async function getMyPatientProfile() {
  const { data } = await api.get<ApiResponse<PatientProfile>>("/patients/profile");
  return data.data;
}
