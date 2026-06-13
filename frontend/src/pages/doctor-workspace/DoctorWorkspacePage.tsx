import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppIcon } from "../../components/AppIcon";
import { useAuth } from "../../contexts/AuthContext";
import { cancelAppointment, confirmAppointment, getAppointments, startAppointment } from "../../services/appointmentService";
import { getMyDoctorProfile } from "../../services/profileService";
import type { Appointment, AppointmentStatus, AppointmentFilter } from "../../types/appointment";

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

function formatAppointmentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getTodayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DoctorWorkspacePage() {
  const { user } = useAuth();
  const role = user?.role ?? "DOCTOR";
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDate] = useState(getTodayValue());
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [cancelingAppointment, setCancelingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const isReadOnly = role === "ADMIN";

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        let nextDoctorId = doctorId;

        if (role === "DOCTOR" && !doctorId) {
          const profile = await getMyDoctorProfile();
          nextDoctorId = profile.id;
          if (active) {
            setDoctorId(profile.id);
          }
        }

        const filter: AppointmentFilter = {
          date: selectedDate,
          ...(nextDoctorId ? { doctorId: nextDoctorId } : {}),
        };

        const data = await getAppointments(filter);

        if (!active) {
          return;
        }

        setAppointments(data);
      } catch (loadError) {
        console.error("Failed to load doctor workspace:", loadError);
        if (active) {
          setError("Không thể tải hàng đợi phòng khám. Vui lòng thử lại.");
          setAppointments([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [doctorId, role, selectedDate]);

  const filteredAppointments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      if (!keyword) {
        return true;
      }

      return (
        appointment.appointmentNo.toLowerCase().includes(keyword) ||
        appointment.patient.fullName.toLowerCase().includes(keyword) ||
        appointment.patient.patientCode.toLowerCase().includes(keyword) ||
        appointment.patient.phone?.toLowerCase().includes(keyword) ||
        appointment.reason?.toLowerCase().includes(keyword)
      );
    });
  }, [appointments, search]);

  const summary = useMemo(() => {
    return {
      waiting: filteredAppointments.filter((item) => item.status === "CONFIRMED").length,
      inProgress: filteredAppointments.filter((item) => item.status === "IN_PROGRESS").length,
      completed: filteredAppointments.filter((item) => item.status === "COMPLETED").length,
    };
  }, [filteredAppointments]);

  const handleOpenBoard = (appointment: Appointment) => {
    navigate(`/doctor-workspace/${appointment.id}`);
  };

  const handleStartExam = async (appointment: Appointment) => {
    try {
      const updated = await startAppointment(appointment.id);
      setAppointments((prev) => prev.map((item) => (item.id === appointment.id ? updated : item)));
      handleOpenBoard(updated);
    } catch (startError: any) {
      console.error("Failed to start appointment:", startError);
      alert(startError.response?.data?.message || "Failed to start examination");
    }
  };

  const handleConfirmAppointment = async (appointment: Appointment) => {
    try {
      const updated = await confirmAppointment(appointment.id);
      setAppointments((prev) => prev.map((item) => (item.id === appointment.id ? updated : item)));
    } catch (confirmError: any) {
      console.error("Failed to confirm appointment:", confirmError);
      alert(confirmError.response?.data?.message || "Failed to confirm appointment");
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelingAppointment) {
      return;
    }

    if (!cancelReason.trim()) {
      alert("Please enter cancellation reason");
      return;
    }

    try {
      const updated = await cancelAppointment(cancelingAppointment.id, cancelReason);
      setAppointments((prev) => prev.map((item) => (item.id === cancelingAppointment.id ? updated : item)));
      setCancelingAppointment(null);
      setCancelReason("");
    } catch (cancelError: any) {
      console.error("Failed to cancel appointment:", cancelError);
      alert(cancelError.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const rowActions = (appointment: Appointment) => {
    if (isReadOnly) {
      return (
        <button
          type="button"
          onClick={() => handleOpenBoard(appointment)}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <AppIcon name="eye" className="h-3.5 w-3.5" />
          View Record
        </button>
      );
    }

    if (appointment.status === "PENDING") {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleConfirmAppointment(appointment)}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            <AppIcon name="check" className="h-3.5 w-3.5" />
            Confirm
          </button>
          <button
            type="button"
            onClick={() => {
              setCancelingAppointment(appointment);
              setCancelReason("");
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
          >
            <AppIcon name="logout" className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      );
    }

    if (appointment.status === "CONFIRMED") {
      return (
        <button
          type="button"
          onClick={() => handleStartExam(appointment)}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
        >
          <AppIcon name="play" className="h-3.5 w-3.5" />
          Start Exam
        </button>
      );
    }

    if (appointment.status === "IN_PROGRESS") {
      return (
        <button
          type="button"
          onClick={() => handleOpenBoard(appointment)}
          className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
        >
          <AppIcon name="arrow" className="h-3.5 w-3.5" />
          Continue Exam
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleOpenBoard(appointment)}
        className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <AppIcon name="eye" className="h-3.5 w-3.5" />
        View Record
      </button>
    );
  };

  return (
    <section className="space-y-6">
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(8,86,207,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                My Clinic Queue
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Doctor Workspace
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage and examine your scheduled patients for today.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-500">Waiting</div>
                <div className="mt-1 text-2xl font-semibold text-amber-900">{summary.waiting}</div>
              </div>
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-500">In Progress</div>
                <div className="mt-1 text-2xl font-semibold text-indigo-900">{summary.inProgress}</div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-500">Completed</div>
                <div className="mt-1 text-2xl font-semibold text-emerald-900">{summary.completed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <AppIcon name="search" className="h-5 w-5 text-slate-400" />
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient name, code, appointment no..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
            <AppIcon name="calendar" className="h-5 w-5 text-brand-700" />
            <span>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date(`${selectedDate}T00:00:00`))}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setError(null);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <AppIcon name="refresh" className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">NO.</th>
                <th className="px-6 py-4 font-semibold">APPOINTMENT NO</th>
                <th className="px-6 py-4 font-semibold">PATIENT INFO</th>
                <th className="px-6 py-4 font-semibold">SCHEDULED TIME</th>
                <th className="px-6 py-4 font-semibold">REASON</th>
                <th className="px-6 py-4 font-semibold">STATUS</th>
                <th className="px-6 py-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
                      <span className="text-sm text-slate-500">Loading today&apos;s queue...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <AppIcon name="calendar" className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium text-slate-900">No patients in queue</p>
                    <p className="mt-1 text-sm">You have no appointments matching this filter.</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment, index) => (
                  <tr key={appointment.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{appointment.appointmentNo}</td>
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
                    <td className="px-6 py-4 text-slate-600">{formatAppointmentTime(appointment.appointmentTime)}</td>
                    <td className="px-6 py-4 text-slate-600">{appointment.reason || "No reason provided"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColors[appointment.status]}`}
                      >
                        {statusLabels[appointment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">{rowActions(appointment)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {cancelingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm"
            onClick={() => setCancelingAppointment(null)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Cancel Appointment</h3>
              <p className="mt-1 text-sm text-slate-500">Please provide a cancellation reason.</p>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                placeholder="Reason for cancellation..."
                className="h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancelingAppointment(null)}
                  className="h-11 w-28 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleCancelAppointment}
                  className="h-11 w-28 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
