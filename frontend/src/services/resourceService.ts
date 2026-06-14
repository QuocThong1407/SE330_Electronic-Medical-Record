import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Department, Specialization } from "../types/catalog";
import type { DoctorProfile } from "../types/doctor";
import type { PatientProfile } from "../types/patient";
import type { UserSummary } from "../types/auth";
import type { Medicine, MedicineCategory } from "../types/medicine";

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

export async function getMedicines() {
  // Backend returns Page<MedicineResponse> wrapped in ApiResponse
  // Page.content contains the actual list of medicines
  const { data } = await api.get<ApiResponse<{ content: Medicine[] }>>("/medicines?page=0&size=1000");
  return data.data.content;
}

export async function getMedicineCategories() {
   return fetchList<MedicineCategory>("/medicine-categories");
 }

export async function createMedicineCategory(data: any) {
   const { data: response } = await api.post<ApiResponse<MedicineCategory>>("/medicine-categories", data);
   return response.data;
 }

export async function updateMedicineCategory(id: string, data: any) {
   const { data: response } = await api.put<ApiResponse<MedicineCategory>>(`/medicine-categories/${id}`, data);
   return response.data;
 }

export async function deleteMedicineCategory(id: string) {
   await api.delete(`/medicine-categories/${id}`);
 }

export async function getMedicineById(id: string) {
  const { data } = await api.get<ApiResponse<Medicine>>(`/medicines/${id}`);
  return data.data;
}

export async function createMedicine(data: any) {
  const { data: response } = await api.post<ApiResponse<Medicine>>("/medicines", data);
  return response.data;
}

export async function updateMedicine(id: string, data: any) {
  const { data: response } = await api.put<ApiResponse<Medicine>>(`/medicines/${id}`, data);
  return response.data;
}

export async function updateMedicineStatus(id: string, data: any) {
  const { data: response } = await api.patch<ApiResponse<Medicine>>(`/medicines/${id}/status`, data);
  return response.data;
}

export async function addMedicineStock(id: string, data: any) {
  const { data: response } = await api.patch<ApiResponse<Medicine>>(`/medicines/${id}/stock`, data);
  return response.data;
}

export async function deleteMedicine(id: string) {
  await api.delete(`/medicines/${id}`);
}
