import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AppIcon, type AppIconName } from "../../components/AppIcon";
import { getAppointments } from "../../services/appointmentService";
import { getMedicalRecords, searchPrescriptions } from "../../services/clinicalService";
import { getDepartments, getDoctors, getPatients, getSpecializations, getUsers } from "../../services/resourceService";
import { getMyDoctorProfile } from "../../services/profileService";
import type { Appointment } from "../../types/appointment";
import type { MedicalRecord, PrescriptionSummary } from "../../types/clinical";

type StatCard = {
  label: string;
  value: string;
  description: string;
  icon: AppIconName;
  tone: string;
};

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTodayValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function SectionShell({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? "ADMIN";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<PrescriptionSummary[]>([]);
  const [totals, setTotals] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    departments: 0,
    specializations: 0,
    appointmentsToday: 0,
    recordsToday: 0,
    prescriptionsToday: 0,
  });
  const [profileName, setProfileName] = useState("");

  const roleMeta = useMemo(() => {
    if (role === "DOCTOR") {
      return {
        title: "Doctor Dashboard",
        subtitle: "Clinical flow, today's queue, and your current workload.",
        accent: "bg-blue-50 text-blue-700 ring-blue-100",
        badge: "Clinical Operations",
      };
    }
    if (role === "RECEPTIONIST") {
      return {
        title: "Reception Dashboard",
        subtitle: "Front desk queue, patient intake, and booking support.",
        accent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        badge: "Front Office",
      };
    }
    return {
      title: "Admin Dashboard",
      subtitle: "System overview, catalog health, and clinical activity.",
      accent: "bg-brand-50 text-brand-700 ring-brand-100",
      badge: "System Control",
    };
  }, [role]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const today = getTodayValue();
        if (role === "DOCTOR") {
          const doctorProfile = await getMyDoctorProfile().catch(() => null);
          const [appointments, records, prescriptions, departments, specializations] = await Promise.all([
            getAppointments({ date: today, doctorId: doctorProfile?.id }).catch(() => []),
            getMedicalRecords({ doctorId: doctorProfile?.id, page: 0, size: 20 }).catch(() => []),
            searchPrescriptions({ doctorId: doctorProfile?.id, page: 0, size: 20 }).catch(() => []),
            getDepartments().catch(() => []),
            getSpecializations().catch(() => []),
          ]);

          if (!active) return;

          setProfileName(doctorProfile?.fullName || "Doctor");
          setRecentAppointments(appointments.slice(0, 6));
          setRecentRecords(records.slice(0, 6));
          setRecentPrescriptions(prescriptions.slice(0, 4));
          setTotals({
            users: 0,
            doctors: 0,
            patients: 0,
            departments: departments.length,
            specializations: specializations.length,
            appointmentsToday: appointments.length,
            recordsToday: records.length,
            prescriptionsToday: prescriptions.length,
          });
          setStats([
            { label: "Today's appointments", value: formatCount(appointments.length), description: "Appointments assigned today.", icon: "calendar", tone: "bg-blue-50 text-blue-700 ring-blue-100" },
            { label: "Active records", value: formatCount(records.filter((item) => item.status === "DRAFT").length), description: "Records still open for editing.", icon: "edit", tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
            { label: "Prescriptions", value: formatCount(prescriptions.length), description: "Prescriptions created by you.", icon: "medicines", tone: "bg-amber-50 text-amber-700 ring-amber-100" },
            { label: "Departments", value: formatCount(departments.length), description: "Departments available to assign.", icon: "departments", tone: "bg-slate-100 text-slate-700 ring-slate-200" },
          ]);
          return;
        }

        if (role === "RECEPTIONIST") {
          const [appointments, patients, doctors, departments, specializations] = await Promise.all([
            getAppointments({ date: today }).catch(() => []),
            getPatients().catch(() => []),
            getDoctors().catch(() => []),
            getDepartments().catch(() => []),
            getSpecializations().catch(() => []),
          ]);

          if (!active) return;

          setProfileName(user?.email || "Receptionist");
          setRecentAppointments(appointments.slice(0, 6));
          setRecentRecords([]);
          setRecentPrescriptions([]);
          setTotals({
            users: 0,
            doctors: doctors.length,
            patients: patients.length,
            departments: departments.length,
            specializations: specializations.length,
            appointmentsToday: appointments.length,
            recordsToday: 0,
            prescriptionsToday: 0,
          });
          setStats([
            { label: "Today's appointments", value: formatCount(appointments.length), description: "Bookings and walk-ins for today.", icon: "calendar", tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
            { label: "Patients", value: formatCount(patients.length), description: "Patient profiles available.", icon: "patients", tone: "bg-blue-50 text-blue-700 ring-blue-100" },
            { label: "Doctors", value: formatCount(doctors.length), description: "Doctors ready to book.", icon: "doctors", tone: "bg-amber-50 text-amber-700 ring-amber-100" },
            { label: "Specializations", value: formatCount(specializations.length), description: "Specialty catalog available.", icon: "specializations", tone: "bg-slate-100 text-slate-700 ring-slate-200" },
          ]);
          return;
        }

        const [users, doctors, patients, departments, specializations, appointments, records, prescriptions] = await Promise.all([
          getUsers().catch(() => []),
          getDoctors().catch(() => []),
          getPatients().catch(() => []),
          getDepartments().catch(() => []),
          getSpecializations().catch(() => []),
          getAppointments({ page: 0, size: 20 } as any).catch(() => []),
          getMedicalRecords({ page: 0, size: 20 }).catch(() => []),
          searchPrescriptions({ page: 0, size: 20 }).catch(() => []),
        ]);

        if (!active) return;

        setProfileName(user?.email || "Administrator");
        setRecentAppointments(appointments.slice(0, 6));
        setRecentRecords(records.slice(0, 6));
        setRecentPrescriptions(prescriptions.slice(0, 4));
        setTotals({
          users: users.length,
          doctors: doctors.length,
          patients: patients.length,
          departments: departments.length,
          specializations: specializations.length,
          appointmentsToday: appointments.length,
          recordsToday: records.length,
          prescriptionsToday: prescriptions.length,
        });
        setStats([
          { label: "Users", value: formatCount(users.length), description: "System accounts", icon: "users", tone: "bg-brand-50 text-brand-700 ring-brand-100" },
          { label: "Doctors", value: formatCount(doctors.length), description: "Doctor profiles", icon: "doctors", tone: "bg-blue-50 text-blue-700 ring-blue-100" },
          { label: "Patients", value: formatCount(patients.length), description: "Patient profiles", icon: "patients", tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
          { label: "Records", value: formatCount(records.length), description: "Medical records", icon: "table", tone: "bg-slate-100 text-slate-700 ring-slate-200" },
          { label: "Appts", value: formatCount(appointments.length), description: "Appointment history", icon: "calendar", tone: "bg-amber-50 text-amber-700 ring-amber-100" },
        ]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [role]);

  const quickActions = useMemo(() => {
    if (role === "DOCTOR") {
      return [
        "Open today's queue and start the next examination.",
        "Review medical records and prescriptions in one place.",
        "Track current workload before confirming more visits.",
      ];
    }

    if (role === "RECEPTIONIST") {
      return [
        "Create walk-in patient profiles at the front desk.",
        "Link a patient user later using the profile actions.",
        "Book appointments quickly with doctor and specialty lookup.",
      ];
    }

    return [
      "Monitor system accounts, profiles, and clinical activity.",
      "Keep doctor, patient, and catalog data in sync.",
      "Review medical records and ICD usage from one place.",
    ];
  }, [role]);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(8,86,207,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ring-1 ring-inset ${roleMeta.accent}`}>
                {roleMeta.badge}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {roleMeta.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {roleMeta.subtitle}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Signed in as</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{profileName || user?.email || role}</div>
              <div className="mt-1 text-sm text-slate-500">{user?.role}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${role === "ADMIN" ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        {loading
          ? Array.from({ length: stats.length || 4 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="h-4 w-28 rounded-full bg-slate-200" />
                <div className="mt-4 h-10 w-24 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-4 w-full rounded-full bg-slate-100" />
              </div>
            ))
          : stats.map((item) => (
              <article key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
                    <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                  </div>
                  <div className={`rounded-2xl p-3 ring-1 ${item.tone}`}>
                    <AppIcon name={item.icon} className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionShell
          title={role === "DOCTOR" ? "Today at a glance" : role === "RECEPTIONIST" ? "Front desk overview" : "Platform overview"}
          subtitle={role === "DOCTOR" ? "Your queue and latest clinical work." : role === "RECEPTIONIST" ? "Bookkeeping and intake activity." : "Overview of live platform data."}
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Appointments today</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{formatCount(totals.appointmentsToday)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Records today</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{formatCount(totals.recordsToday)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Prescriptions</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{formatCount(totals.prescriptionsToday)}</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</div>
                <div className="mt-2 text-sm leading-6 text-slate-700">{item}</div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title="Current resources"
          subtitle="The data this workspace can use right now."
          action={<div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Live</div>}
        >
          <div className="space-y-3">
            <div className="rounded-2xl bg-brand-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Departments</div>
              <div className="mt-2 text-2xl font-semibold text-brand-900">{formatCount(totals.departments)}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Specializations</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{formatCount(totals.specializations)}</div>
            </div>
            {role === "ADMIN" ? (
              <>
                <div className="rounded-2xl bg-blue-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Doctors</div>
                  <div className="mt-2 text-2xl font-semibold text-blue-900">{formatCount(totals.doctors)}</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Patients</div>
                  <div className="mt-2 text-2xl font-semibold text-emerald-900">{formatCount(totals.patients)}</div>
                </div>
              </>
            ) : null}
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionShell title={role === "DOCTOR" ? "Recent appointments" : "Recent activity"} subtitle="Latest items from the backend APIs.">
          {recentAppointments.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">No appointments found.</div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900">{item.appointmentNo}</div>
                      <div className="mt-1 text-sm text-slate-600">{item.patient.fullName}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatDateTime(item.appointmentTime)}</div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionShell>

        <SectionShell title="Clinical summaries" subtitle="Recent medical records and prescriptions.">
          {role === "RECEPTIONIST" ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Receptionist can focus on booking and patient intake. Medical records are available to admin and doctor workspaces.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-900">Recent medical records</div>
                {recentRecords.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">No records found.</div>
                ) : (
                  <div className="space-y-3">
                    {recentRecords.slice(0, 4).map((record) => (
                      <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-900">{record.recordNo}</div>
                            <div className="mt-1 text-xs text-slate-500">{formatDateTime(record.visitDate)}</div>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">{record.status}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{record.chiefComplaint}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-900">Recent prescriptions</div>
                {recentPrescriptions.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">No prescriptions found.</div>
                ) : (
                  <div className="space-y-3">
                    {recentPrescriptions.slice(0, 4).map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-900">{item.prescriptionNo}</div>
                            <div className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</div>
                          </div>
                          <div className="text-xs text-slate-500">{item.itemCount ?? "-"} items</div>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">{item.notes || "No notes"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SectionShell>
      </div>
    </section>
  );
}
