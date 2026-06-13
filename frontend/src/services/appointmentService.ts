import { api } from "../lib/api";
import type { ApiResponse } from "../types/common";
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest, AppointmentFilter } from "../types/appointment";

// Helper to map AppointmentResponse to Appointment
function mapAppointmentResponse(response: any): Appointment {
  const patient = response?.patient ?? {};
  const doctor = response?.doctor ?? {};
  const department = response?.department ?? {};

  return {
    id: response?.id || "",
    appointmentNo: response?.appointmentNo || "",
    appointmentTime: response?.appointmentTime || "",
    status: response?.status || "PENDING",
    reason: response?.reason || null,
    cancelledReason: response?.cancelledReason || null,
    patient: {
      id: patient.id || response?.patientId || "",
      patientCode: patient.patientCode || "",
      fullName: patient.fullName || "",
      phone: patient.phone || null,
    },
    doctor: {
      id: doctor.id || response?.doctorId || "",
      doctorCode: doctor.doctorCode || null,
      fullName: doctor.fullName || "",
      departmentId: doctor.departmentId || null,
      departmentName: doctor.departmentName || null,
    },
    department: {
      id: department.id || response?.departmentId || "",
      code: department.code || "",
      name: department.name || "",
    },
    createdAt: response?.createdAt || undefined,
    updatedAt: response?.updatedAt || undefined,
  };
}

export async function getAppointments(filter?: AppointmentFilter): Promise<Appointment[]> {
  const { data } = await api.get<ApiResponse<any>>("/appointments", {
    params: {
      page: 0,
      size: 1000,
      ...(filter?.keyword ? { keyword: filter.keyword } : {}),
      ...(filter?.date ? { date: filter.date } : {}),
      ...(filter?.doctorId ? { doctorId: filter.doctorId } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
    },
  });

  const payload = data?.data;
  const content = Array.isArray(payload)
    ? payload
    : payload?.content || payload?.data?.content || [];

  return Array.isArray(content) ? content.map(mapAppointmentResponse) : [];
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const { data } = await api.get<ApiResponse<any>>(`/appointments/${id}`);
  return mapAppointmentResponse(data.data);
}

export async function createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
  const { data: response } = await api.post<ApiResponse<any>>("/appointments", data);
  return mapAppointmentResponse(response.data);
}

export async function updateAppointment(id: string, data: UpdateAppointmentRequest): Promise<Appointment> {
  const { data: response } = await api.patch<ApiResponse<any>>(`/appointments/${id}`, data);
  return mapAppointmentResponse(response.data);
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

export async function confirmAppointment(id: string): Promise<Appointment> {
  const { data: response } = await api.patch<ApiResponse<any>>(`/appointments/${id}/confirm`);
  return mapAppointmentResponse(response.data);
}

export async function startAppointment(id: string): Promise<Appointment> {
  const { data: response } = await api.patch<ApiResponse<any>>(`/appointments/${id}/start`);
  return mapAppointmentResponse(response.data);
}

export async function completeAppointment(id: string): Promise<Appointment> {
  const { data: response } = await api.patch<ApiResponse<any>>(`/appointments/${id}/complete`);
  return mapAppointmentResponse(response.data);
}

export async function cancelAppointment(id: string, reason: string): Promise<Appointment> {
  const { data: response } = await api.patch<ApiResponse<any>>(`/appointments/${id}/cancel`, { reason });
  return mapAppointmentResponse(response.data);
}

export async function markNoShow(id: string): Promise<Appointment> {
  const { data: response } = await api.patch<ApiResponse<any>>(`/appointments/${id}/no-show`);
  return mapAppointmentResponse(response.data);
}

export async function getAvailableTimeSlots(doctorId: string, date: string): Promise<string[]> {
  const { data } = await api.get<ApiResponse<any>>("/appointments/available-slots", {
    params: { doctorId, date },
  });
  return data?.data?.availableSlots || [];
}
