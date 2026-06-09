import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Department, Specialization } from "../types/catalog";
import type { DoctorProfile } from "../types/doctor";
import type { PatientProfile } from "../types/patient";
import type { UserSummary } from "../types/auth";

async function fetchList<T>(path: string) {
  const { data } = await api.get<ApiResponse<T[]>>(path);
  return data.data;
}

export async function getUsers() {
  return fetchList<UserSummary>("/users");
}

export async function getDoctors() {
  return fetchList<DoctorProfile>("/doctors");
}

export async function getPatients() {
  return fetchList<PatientProfile>("/patients");
}

export async function getDepartments() {
  return fetchList<Department>("/departments");
}

export async function getSpecializations() {
  return fetchList<Specialization>("/specializations");
}
