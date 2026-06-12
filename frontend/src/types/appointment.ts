export type AppointmentStatus = 
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  appointmentNo: string;
  appointmentTime: string;
  status: AppointmentStatus;
  reason?: string | null;
  cancelledReason?: string | null;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  department: AppointmentDepartment;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentPatient {
  id: string;
  patientCode: string;
  fullName: string;
  phone?: string | null;
}

export interface AppointmentDoctor {
  id: string;
  doctorCode?: string | null;
  fullName: string;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface AppointmentDepartment {
  id: string;
  code: string;
  name: string;
}

export interface AppointmentFormValues {
  patientId: string;
  departmentId: string;
  doctorId: string;
  appointmentTime: string;
  reason: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  departmentId?: string;
  appointmentTime: string;
  durationMinutes: number;
  reason?: string;
  patientNotes?: string;
}

export interface UpdateAppointmentRequest {
  status: AppointmentStatus;
  cancelledReason?: string;
}

export interface AppointmentFilter {
  keyword?: string;
  date?: string;
  doctorId?: string;
  status?: AppointmentStatus;
}
