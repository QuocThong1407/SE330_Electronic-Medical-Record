import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AppIcon, type AppIconName } from "../../components/AppIcon";
import {
  getDepartments,
  getDoctors,
  getPatients,
  getSpecializations,
  getUsers,
} from "../../services/resourceService";
import { getMyDoctorProfile, getMyPatientProfile } from "../../services/profileService";

type MetricResult = {
  label: string;
  value: string;
  description: string;
  icon: AppIconName;
  tone: string;
};

type MetricDefinition = {
  label: string;
  description: string;
  icon: AppIconName;
  tone: string;
  load: () => Promise<number>;
};

const metricToneByIndex = [
  "bg-brand-50 text-brand-700 ring-brand-100",
  "bg-cyan-50 text-cyan-700 ring-cyan-100",
  "bg-slate-100 text-slate-700 ring-slate-200",
  "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "bg-amber-50 text-amber-700 ring-amber-100",
];

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? "ADMIN";
  const [metrics, setMetrics] = useState<MetricResult[]>([]);
  const [loading, setLoading] = useState(true);
  const displayName = useMemo(() => {
    if (role === "DOCTOR") return "Doctor";
    if (role === "PATIENT") return "Patient";
    if (role === "RECEPTIONIST") return "Receptionist";
    return "Administrator";
  }, [role]);

  const metricDefinitions = useMemo<MetricDefinition[]>(() => {
    const adminMetrics: MetricDefinition[] = [
      {
        label: "Users",
        description: "System accounts managed in the platform",
        icon: "users",
        tone: metricToneByIndex[0],
        load: async () => (await getUsers()).length,
      },
      {
        label: "Doctors",
        description: "Registered doctor profiles",
        icon: "doctors",
        tone: metricToneByIndex[1],
        load: async () => (await getDoctors()).length,
      },
      {
        label: "Patients",
        description: "Patient profiles ready for care",
        icon: "patients",
        tone: metricToneByIndex[2],
        load: async () => (await getPatients()).length,
      },
      {
        label: "Departments",
        description: "Hospital departments available",
        icon: "departments",
        tone: metricToneByIndex[3],
        load: async () => (await getDepartments()).length,
      },
      {
        label: "Specializations",
        description: "Medical specializations in the catalog",
        icon: "specializations",
        tone: metricToneByIndex[4],
        load: async () => (await getSpecializations()).length,
      },
    ];

    const doctorMetrics: MetricDefinition[] = [
      {
        label: "Departments",
        description: "Departments available in the system",
        icon: "departments",
        tone: metricToneByIndex[0],
        load: async () => (await getDepartments()).length,
      },
      {
        label: "Specializations",
        description: "Specialization catalog",
        icon: "specializations",
        tone: metricToneByIndex[1],
        load: async () => (await getSpecializations()).length,
      },
      {
        label: "My profile",
        description: "Your doctor profile is connected",
        icon: "profile",
        tone: metricToneByIndex[2],
        load: async () => {
          await getMyDoctorProfile();
          return 1;
        },
      },
    ];

    const patientMetrics: MetricDefinition[] = [
      {
        label: "Departments",
        description: "Departments available in the system",
        icon: "departments",
        tone: metricToneByIndex[0],
        load: async () => (await getDepartments()).length,
      },
      {
        label: "Specializations",
        description: "Specialization catalog",
        icon: "specializations",
        tone: metricToneByIndex[1],
        load: async () => (await getSpecializations()).length,
      },
      {
        label: "My profile",
        description: "Your patient profile is connected",
        icon: "profile",
        tone: metricToneByIndex[2],
        load: async () => {
          await getMyPatientProfile();
          return 1;
        },
      },
    ];

    const receptionistMetrics: MetricDefinition[] = [
      {
        label: "Departments",
        description: "Departments available in the system",
        icon: "departments",
        tone: metricToneByIndex[0],
        load: async () => (await getDepartments()).length,
      },
      {
        label: "Specializations",
        description: "Specialization catalog",
        icon: "specializations",
        tone: metricToneByIndex[1],
        load: async () => (await getSpecializations()).length,
      },
    ];

    if (role === "DOCTOR") return doctorMetrics;
    if (role === "PATIENT") return patientMetrics;
    if (role === "RECEPTIONIST") return receptionistMetrics;
    return adminMetrics;
  }, [role]);

  useEffect(() => {
    let active = true;

    const loadMetrics = async () => {
      setLoading(true);

      const results = await Promise.all(
        metricDefinitions.map(async (definition) => {
          try {
            const count = await definition.load();
            return {
              label: definition.label,
              value: formatCount(count),
              description: definition.description,
              icon: definition.icon,
              tone: definition.tone,
            } satisfies MetricResult;
          } catch {
            return {
              label: definition.label,
              value: "N/A",
              description: "You do not have access to this data or it is not available.",
              icon: definition.icon,
              tone: definition.tone,
            } satisfies MetricResult;
          }
        })
      );

      if (active) {
        setMetrics(results);
        setLoading(false);
      }
    };

    void loadMetrics();

    return () => {
      active = false;
    };
  }, [metricDefinitions]);

  const quickActions = useMemo(() => {
    if (role === "ADMIN") {
      return [
        "Manage user accounts and access control.",
        "Review doctor and patient profiles.",
        "Keep departments and specializations updated.",
      ];
    }

    if (role === "DOCTOR") {
      return [
        "Review your profile and clinical information.",
        "Browse departments and medical specializations.",
        "Prepare for appointments and medical records.",
      ];
    }

    if (role === "RECEPTIONIST") {
      return [
        "Create walk-in patient profiles at the front desk.",
        "Link patient accounts later when needed.",
        "Keep department and specialization data ready.",
      ];
    }

    return [
      "View your personal profile details.",
      "Use the portal to keep your records in sync.",
      "Contact support if account data is missing.",
    ];
  }, [role]);

  return (
    <section className="space-y-6">
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(8,86,207,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                Dashboard overview
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Welcome back, {displayName}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Live summary based on the current backend APIs. The dashboard adapts to your
                role and only shows data you can access.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Current role
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {user?.role ?? "ADMIN"}
              </div>
              <div className="mt-1 text-sm text-slate-500">{displayName}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: metricDefinitions.length || 3 }).map((_, index) => (
              <div key={index} className="card animate-pulse p-5">
                <div className="h-4 w-28 rounded-full bg-slate-200" />
                <div className="mt-4 h-10 w-24 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-4 w-full rounded-full bg-slate-200" />
              </div>
            ))
          : metrics.map((metric) => (
              <article key={metric.label} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {metric.label}
                    </div>
                    <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                      {metric.value}
                    </div>
                  </div>
                  <div className={`rounded-2xl p-3 ring-1 ${metric.tone}`}>
                    <AppIcon name={metric.icon} className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{metric.description}</p>
              </article>
            ))}
      </div>
    </section>
  );
}
