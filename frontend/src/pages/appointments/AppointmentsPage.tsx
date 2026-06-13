import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AppIcon } from "../../components/AppIcon";
import { confirmAppointment, startAppointment, completeAppointment, cancelAppointment, markNoShow, deleteAppointment, getAppointments, createAppointment, updateAppointment } from "../../services/appointmentService";
import { getDepartments, getDoctors, getPatients } from "../../services/resourceService";
import { getMyDoctorProfile } from "../../services/profileService";
import type { Appointment, AppointmentStatus, AppointmentFilter, CreateAppointmentRequest } from "../../types/appointment";
import type { Department } from "../../types/catalog";
import type { DoctorProfile } from "../../types/doctor";
import type { PatientProfile } from "../../types/patient";

// Status badge colors
const statusColors: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-100",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 ring-red-100",
  NO_SHOW: "bg-slate-50 text-slate-700 ring-slate-100",
};

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export function AppointmentsPage() {
  const { user } = useAuth();
  const role = user?.role ?? "ADMIN";
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [filter, setFilter] = useState<AppointmentFilter>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | "">("");
  const [reloadToken, setReloadToken] = useState(0);

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState<CreateAppointmentRequest>({
    patientId: "",
    doctorId: "",
    departmentId: "",
    appointmentTime: "",
    durationMinutes: 30,
    reason: "",
  });

  const reloadData = () => setReloadToken((current) => current + 1);

  // Load data on mount and when manual retry is requested
  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [appointmentsData, departmentsData, doctorsData, patientsData] = await Promise.all([
          getAppointments(),
          getDepartments(),
          getDoctors(),
          getPatients(),
        ]);

        if (!isActive) {
          return;
        }

        setAppointments(appointmentsData);
        setDepartments(departmentsData);
        setDoctors(doctorsData);
        setPatients(patientsData);

        if (role === "DOCTOR") {
          const doctorProfile = await getMyDoctorProfile();
          if (isActive) {
            setFilter((prev) =>
              prev.doctorId === doctorProfile.id ? prev : { ...prev, doctorId: doctorProfile.id }
            );
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        if (isActive) {
          setError("Không thể tải danh sách lịch hẹn. Vui lòng thử lại.");
          setAppointments([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isActive = false;
    };
  }, [reloadToken, role]);

  const bookingDoctors = useMemo(() => {
    if (!selectedDepartmentId) {
      return doctors;
    }

    return doctors.filter((doctor) => doctor.departmentId === selectedDepartmentId);
  }, [doctors, selectedDepartmentId]);

  useEffect(() => {
    if (bookingForm.doctorId && bookingDoctors.length > 0) {
      const isStillValid = bookingDoctors.some((doctor) => doctor.id === bookingForm.doctorId);
      if (!isStillValid) {
        setBookingForm((prev) => ({ ...prev, doctorId: "" }));
      }
    }
  }, [bookingDoctors, bookingForm.doctorId]);

  const bookingPatients = useMemo(() => patients, [patients]);

  // Get filtered appointments based on search keyword
  const filteredAppointments = useMemo(() => {
    let result = appointments;

    // Filter by keyword (patient name, patient code, phone)
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      result = result.filter(
        (apt) =>
          apt.patient.fullName.toLowerCase().includes(keyword) ||
          apt.patient.patientCode.toLowerCase().includes(keyword) ||
          apt.patient.phone?.toLowerCase().includes(keyword)
      );
    }

    // Filter by date
    if (filter.date) {
      const filterDate = new Date(filter.date);
      filterDate.setHours(0, 0, 0, 0);
      result = result.filter((apt) => {
        const aptDate = new Date(apt.appointmentTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === filterDate.getTime();
      });
    }

    // Filter by doctor
    if (filter.doctorId) {
      result = result.filter((apt) => apt.doctor.id === filter.doctorId);
    }

    // Filter by status
    if (filter.status) {
      result = result.filter((apt) => apt.status === filter.status);
    }

    return result;
  }, [appointments, filter]);

  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};

    filteredAppointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.appointmentTime);

      if (Number.isNaN(appointmentDate.getTime())) {
        return;
      }

      const dateKey = appointmentDate.toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment);
    });

    return grouped;
  }, [filteredAppointments]);

  // Format date for display
  const formatAppointmentTime = (time: string) => {
    const date = new Date(time);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} - ${day}/${month}/${year}`;
  };

  // Handle status change
  const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    try {
      if (newStatus === "CANCELLED" && !cancelReason.trim()) {
        alert("Please enter a cancellation reason");
        return;
      }

      let updated: Appointment;
      if (newStatus === "CANCELLED") {
        updated = await cancelAppointment(appointment.id, cancelReason);
      } else if (newStatus === "NO_SHOW") {
        updated = await markNoShow(appointment.id);
      } else if (newStatus === "CONFIRMED") {
        updated = await confirmAppointment(appointment.id);
      } else if (newStatus === "IN_PROGRESS") {
        updated = await startAppointment(appointment.id);
      } else if (newStatus === "COMPLETED") {
        updated = await completeAppointment(appointment.id);
      } else {
        updated = await updateAppointment(appointment.id, { status: newStatus });
      }
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointment.id ? updated : apt))
      );
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      alert(error.response?.data?.message || "Failed to update appointment");
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointment: Appointment) => {
    try {
      await deleteAppointment(appointment.id);
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointment.id));
      setShowDetailsModal(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      alert(error.response?.data?.message || "Failed to delete appointment");
    }
  };

  // Handle booking appointment
  const handleBookAppointment = async () => {
    if (!bookingForm.patientId || !bookingForm.doctorId || !bookingForm.appointmentTime) {
      alert("Please fill in all required fields");
      return;
    }

    if (!bookingForm.durationMinutes || bookingForm.durationMinutes <= 0) {
      alert("Please select a valid duration");
      return;
    }

    try {
      const newAppointment = await createAppointment(bookingForm);
      setAppointments((prev) => [newAppointment, ...prev]);
      setShowBookingModal(false);
      setBookingForm({
        patientId: "",
        doctorId: "",
        departmentId: "",
        appointmentTime: "",
        durationMinutes: 30,
        reason: "",
      });
      setSelectedDepartmentId("");
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      alert(error.response?.data?.message || "Failed to create appointment");
    }
  };

  // Get available actions based on role and status
  const getRowActions = (appointment: Appointment) => {
    const actions: React.ReactNode[] = [];

    if (role === "RECEPTIONIST") {
      if (appointment.status === "PENDING") {
        actions.push(
          <button
            key="confirm"
            onClick={() => {
              setSelectedAppointment(appointment);
              handleStatusChange(appointment, "CONFIRMED");
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
            title="Confirm appointment"
          >
            <AppIcon name="check" className="h-3.5 w-3.5" />
            Confirm
          </button>
        );
        actions.push(
          <button
            key="cancel"
            onClick={() => {
              setSelectedAppointment(appointment);
              setShowCancelModal(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
            title="Cancel appointment"
          >
            <AppIcon name="logout" className="h-3.5 w-3.5" />
            Cancel
          </button>
        );
      } else if (appointment.status === "CONFIRMED") {
        actions.push(
          <button
            key="noshow"
            onClick={() => {
              setSelectedAppointment(appointment);
              handleStatusChange(appointment, "NO_SHOW");
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
            title="Mark as no-show"
          >
            <AppIcon name="calendar" className="h-3.5 w-3.5" />
            No-Show
          </button>
        );
        actions.push(
          <button
            key="cancel"
            onClick={() => {
              setSelectedAppointment(appointment);
              setShowCancelModal(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
            title="Cancel appointment"
          >
            <AppIcon name="logout" className="h-3.5 w-3.5" />
            Cancel
          </button>
        );
      }
    } else if (role === "DOCTOR") {
      if (appointment.status === "PENDING") {
        actions.push(
          <button
            key="confirm"
            onClick={() => handleStatusChange(appointment, "CONFIRMED")}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
            title="Confirm appointment"
          >
            <AppIcon name="check" className="h-3.5 w-3.5" />
            Confirm
          </button>
        );
        actions.push(
          <button
            key="cancel"
            onClick={() => {
              setSelectedAppointment(appointment);
              setShowCancelModal(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
            title="Cancel appointment"
          >
            <AppIcon name="logout" className="h-3.5 w-3.5" />
            Cancel
          </button>
        );
      } else if (appointment.status === "CONFIRMED") {
        actions.push(
          <button
            key="start"
            onClick={() => handleStatusChange(appointment, "IN_PROGRESS")}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
            title="Start examination"
          >
            <AppIcon name="play" className="h-3.5 w-3.5" />
            Start
          </button>
        );
      } else if (appointment.status === "IN_PROGRESS") {
        actions.push(
          <button
            key="complete"
            onClick={() => handleStatusChange(appointment, "COMPLETED")}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
            title="Complete appointment"
          >
            <AppIcon name="check" className="h-3.5 w-3.5" />
            Complete
          </button>
        );
      } else if (appointment.status === "COMPLETED") {
        actions.push(
          <button
            key="view"
            onClick={() => {
              setSelectedAppointment(appointment);
              setShowDetailsModal(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            title="View appointment details"
          >
            <AppIcon name="menu" className="h-3.5 w-3.5" />
            View Details
          </button>
        );
      }
    } else if (role === "ADMIN") {
      actions.push(
        <button
          key="view"
          onClick={() => {
            setSelectedAppointment(appointment);
            setShowDetailsModal(true);
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          title="View details"
        >
          <AppIcon name="menu" className="h-3.5 w-3.5" />
          View Details
        </button>
      );
      if (appointment.status === "PENDING") {
        actions.push(
          <button
            key="delete"
            onClick={() => {
              setSelectedAppointment(appointment);
              handleDeleteAppointment(appointment);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition"
            title="Delete appointment"
          >
            <AppIcon name="logout" className="h-3.5 w-3.5" />
            Delete
          </button>
        );
      }
    }

    return <div className="flex items-center gap-2">{actions}</div>;
  };

  // Render Table View
  const renderTableView = () => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm pb-12">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Mã Lịch Hẹn</th>
              <th className="px-6 py-4 font-semibold">Thời Gian</th>
              <th className="px-6 py-4 font-semibold">Bệnh Nhân</th>
              <th className="px-6 py-4 font-semibold">Bác Sĩ / Khoa</th>
              <th className="px-6 py-4 font-semibold">Trạng Thái</th>
              <th className="px-6 py-4 font-semibold text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Loading skeleton
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
                    <span className="text-sm text-slate-500">
                      Loading appointments...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <AppIcon name="calendar" className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium text-slate-900">No appointments found</p>
                  <p className="mt-1 text-sm">Try adjusting your filters or search criteria</p>
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {appointment.appointmentNo}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatAppointmentTime(appointment.appointmentTime)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        {appointment.patient.patientCode} - {appointment.patient.fullName}
                      </span>
                      {appointment.patient.phone && (
                        <span className="text-xs text-slate-500">{appointment.patient.phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{appointment.doctor.fullName}</span>
                      <span className="text-xs text-slate-500">{appointment.department.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColors[appointment.status]}`}
                    >
                      {statusLabels[appointment.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {getRowActions(appointment)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Calendar View
  const renderCalendarView = () => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
          <p className="text-sm text-slate-500">Loading calendar...</p>
        </div>
      );
    }

    // Generate days for current month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {today.toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map((day) => (
            <div key={day} className="px-4 py-3 text-center text-sm font-semibold text-slate-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="min-h-[120px] border-b border-r border-slate-100" />;
            }

            const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayAppointments = appointmentsByDate[dateKey] || [];

            return (
              <div key={index} className="min-h-[120px] border-b border-r border-slate-100 p-2">
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                        ? "bg-brand-700 text-white"
                        : "text-slate-700"
                    }`}
                  >
                    {day}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-xs font-medium text-brand-700">
                      {dayAppointments.length} appt{dayAppointments.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              <div className="space-y-1">
                {dayAppointments.map((apt) => (
                  <div
                      key={apt.id}
                      className={`rounded-lg px-2 py-1 text-xs ${
                        statusColors[apt.status].replace("text-", "bg-").replace("ring-", "border-").replace("700", "500")
                      }`}
                    >
                      <div className="font-medium text-slate-900">{apt.appointmentNo}</div>
                      <div className="truncate text-slate-700">{apt.patient.fullName}</div>
                      <div className="text-[10px] text-slate-600">
                        {new Date(apt.appointmentTime).toLocaleTimeString("vi-VN", { hour: "numeric", minute: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(8,86,207,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                Appointment Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Appointments
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                {role === "ADMIN"
                  ? "Manage all appointments across the system"
                  : role === "DOCTOR"
                  ? "View and manage your appointments"
                  : "Manage patient appointments and scheduling"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Appointments
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {appointments.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Appointments in the system
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={reloadData}
              className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {/* Search Input */}
          <div className="relative lg:col-span-6">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <AppIcon name="menu" className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by patient name, code, or phone..."
              value={filter.keyword || ""}
              onChange={(e) => setFilter((prev) => ({ ...prev, keyword: e.target.value }))}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </div>

          {/* Date Picker */}
          <div className="lg:col-span-2">
            <input
              type="date"
              value={filter.date || ""}
              onChange={(e) => setFilter((prev) => ({ ...prev, date: e.target.value }))}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </div>

          {/* Doctor Filter - Locked for Doctor role */}
          <div className="lg:col-span-2">
            <select
              value={filter.doctorId || ""}
              onChange={(e) => setFilter((prev) => ({ ...prev, doctorId: e.target.value || undefined }))}
              disabled={role === "DOCTOR"}
              className={`h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 ${
                role === "DOCTOR" ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""
              }`}
            >
              <option value="">All Doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.fullName}
                </option>
              ))}
            </select>
            {role === "DOCTOR" && (
              <p className="mt-1 text-xs text-slate-500">Locked to your profile</p>
            )}
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={filter.status || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  status: (e.target.value as AppointmentStatus) || undefined,
                }))
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            >
              <option value="">All Statuses</option>
              {Object.entries(statusLabels).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Toggle Toolbar */}
      <div className="card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">View:</span>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                viewMode === "calendar"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "table" ? renderTableView() : renderCalendarView()}

      {/* Book Appointment Button - Only for Receptionist */}
      {role === "RECEPTIONIST" && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/30 transition hover:bg-brand-800 hover:shadow-xl hover:shadow-brand-700/40 active:scale-[0.98]"
          >
            <AppIcon name="doctors" className="h-5 w-5" />
            <span>Book Appointment</span>
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
            onClick={() => setShowBookingModal(false)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Book New Appointment</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create a new appointment for a patient with a doctor.
              </p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                {/* Patient Selector */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Patient *
                  </label>
                  <select
                    value={bookingForm.patientId}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, patientId: e.target.value }))}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  >
                    <option value="">Select Patient</option>
                    {bookingPatients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.patientCode} - {patient.fullName}
                      </option>
                    ))}
                  </select>
                  {bookingPatients.length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      No patient profiles available yet.
                    </p>
                  )}
                </div>

                {/* Department Selector */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Department *
                  </label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => {
                      setSelectedDepartmentId(e.target.value as string);
                      setBookingForm((prev) => ({
                        ...prev,
                        departmentId: e.target.value,
                        doctorId: "",
                      }));
                    }}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Doctor Selector */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Doctor *
                  </label>
                  <select
                    value={bookingForm.doctorId}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, doctorId: e.target.value }))}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  >
                    <option value="">Select Doctor</option>
                    {bookingDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fullName}
                      </option>
                    ))}
                  </select>
                  {selectedDepartmentId && bookingDoctors.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No doctors found in this department.
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingForm.appointmentTime}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, appointmentTime: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Duration *
                  </label>
                  <select
                    value={bookingForm.durationMinutes}
                    onChange={(e) =>
                      setBookingForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>

                {/* Reason */}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Reason for Visit
                  </label>
                  <textarea
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason for visit..."
                    rows={3}
                    className="h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="h-11 w-28 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookAppointment}
                  className="h-11 w-28 rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,116,144,0.18)] transition hover:bg-brand-800 hover:shadow-[0_12px_24px_rgba(14,116,144,0.22)] active:scale-[0.98]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Cancel Appointment</h3>
              <p className="mt-1 text-sm text-slate-500">
                Are you sure you want to cancel this appointment?
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Reason for Cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows={3}
                  className="h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </div>
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="h-11 w-28 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange(selectedAppointment, "CANCELLED")}
                  className="h-11 w-28 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(220,38,38,0.18)] transition hover:bg-red-700 hover:shadow-[0_12px_24px_rgba(220,38,38,0.22)] active:scale-[0.98]"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal (Admin) */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDetailsModal(false)}
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Appointment Details</h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {selectedAppointment.appointmentNo}
              </p>
            </div>
            <div className="px-6 py-5">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Appointment No
                    </label>
                    <div className="font-mono text-sm text-slate-700">
                      {selectedAppointment.appointmentNo}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Date & Time
                    </label>
                    <div className="text-sm text-slate-700">
                      {formatAppointmentTime(selectedAppointment.appointmentTime)}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColors[selectedAppointment.status]}`}
                    >
                      {statusLabels[selectedAppointment.status]}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Patient
                    </label>
                    <div className="font-medium text-slate-900">
                      {selectedAppointment.patient.fullName}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {selectedAppointment.patient.patientCode}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Doctor
                    </label>
                    <div className="font-medium text-slate-900">
                      {selectedAppointment.doctor.fullName}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {selectedAppointment.department.name}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Reason
                    </label>
                    <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {selectedAppointment.reason || "No reason provided"}
                    </div>
                  </div>
                </div>
              </div>
              {selectedAppointment.cancelledReason && (
                <div className="mt-6 rounded-xl bg-red-50 p-4">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">
                    Cancellation Reason
                  </label>
                  <div className="text-sm text-red-700">
                    {selectedAppointment.cancelledReason}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                {selectedAppointment.status === "PENDING" && (
                  <button
                    onClick={() => handleDeleteAppointment(selectedAppointment)}
                    className="h-11 w-32 rounded-xl bg-red-600 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(220,38,38,0.18)] transition hover:bg-red-700 hover:shadow-[0_12px_24px_rgba(220,38,38,0.22)] active:scale-[0.98]"
                  >
                    Delete Appointment
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="h-11 w-28 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
