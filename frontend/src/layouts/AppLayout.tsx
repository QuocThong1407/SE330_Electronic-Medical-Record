import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AppIcon, type AppIconName } from "../components/AppIcon";
import { getMyDoctorProfile, getMyPatientProfile } from "../services/profileService";

type WorkspaceRole = "ADMIN" | "DOCTOR" | "RECEPTIONIST" | "PATIENT";

type WorkspaceMeta = {
  title: string;
  subtitle: string;
  roleLabel: string;
};

type NavItem = {
  to: string;
  label: string;
  icon: AppIconName;
};

const workspaceByRole: Record<WorkspaceRole, WorkspaceMeta> = {
  ADMIN: {
    title: "Admin Console",
    subtitle: "System administration workspace",
    roleLabel: "Administrator",
  },
  DOCTOR: {
    title: "Doctor Workspace",
    subtitle: "Clinical operations center",
    roleLabel: "Doctor",
  },
  RECEPTIONIST: {
    title: "Reception Desk",
    subtitle: "Front-office operations",
    roleLabel: "Receptionist",
  },
  PATIENT: {
    title: "Patient Portal",
    subtitle: "Personal health access",
    roleLabel: "Patient",
  },
};

function getNavItems(role: WorkspaceRole): NavItem[] {
  const shared: NavItem[] = [
    { to: "/", label: "Dashboard", icon: "dashboard" },
    { to: "/appointments", label: "Appointments", icon: "calendar" },
  ];

  if (role === "DOCTOR") {
    return [
      ...shared,
      { to: "/doctor-workspace", label: "Doctor Workspace", icon: "edit" },
      { to: "/medicines", label: "Medicines", icon: "medicines" },
    ];
  }

  if (role === "RECEPTIONIST") {
    return [
      ...shared,
      { to: "/patients", label: "Patients", icon: "patients" },
      { to: "/doctors", label: "Doctors", icon: "doctors" },
      { to: "/specializations", label: "Specializations", icon: "specializations" },
    ];
  }

  return [
    ...shared,
    { to: "/users", label: "Users", icon: "users" },
    { to: "/departments", label: "Departments", icon: "departments" },
    { to: "/specializations", label: "Specializations", icon: "specializations" },
    { to: "/doctors", label: "Doctors", icon: "doctors" },
    { to: "/patients", label: "Patients", icon: "patients" },
    { to: "/medicines", label: "Medicines", icon: "medicines" },
    { to: "/medicine-categories", label: "Medicine Categories", icon: "categories" },
    { to: "/medical-records", label: "Medical Records", icon: "table" },
    { to: "/icd-codes", label: "ICD Codes", icon: "categories" },
  ];
}

function getInitials(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const role = (user?.role ?? "ADMIN") as WorkspaceRole;
  const workspace = workspaceByRole[role] ?? workspaceByRole.ADMIN;
  const [displayName, setDisplayName] = useState(workspace.roleLabel);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDisplayName = async () => {
      try {
        if (role === "DOCTOR") {
          const profile = await getMyDoctorProfile();
          if (active) setDisplayName(profile.fullName);
          return;
        }

        if (role === "PATIENT") {
          const profile = await getMyPatientProfile();
          if (active) setDisplayName(profile.fullName);
          return;
        }

        if (active) {
          setDisplayName(workspace.roleLabel);
        }
      } catch {
        if (active) {
          setDisplayName(workspace.roleLabel);
        }
      }
    };

    void loadDisplayName();

    return () => {
      active = false;
    };
  }, [role, workspace.roleLabel]);

  const initials = useMemo(
    () => getInitials(displayName || user?.email || "EMR"),
    [displayName, user?.email]
  );

  const roleLabel = workspace.roleLabel;
  const navItems = useMemo(() => getNavItems(role), [role]);

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed((value) => !value);
      return;
    }

    setIsMobileSidebarOpen((value) => !value);
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(11,87,208,0.08),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6fb_100%)]">
      {isMobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <div className="min-h-screen lg:flex">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
            isSidebarCollapsed ? "lg:w-24" : "lg:w-72",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            "w-72",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">
              <div className={["flex min-w-0 items-center", isSidebarCollapsed ? "justify-center w-full" : "gap-3"].join(" ")}>
                <div className="flex h-[45.5px] w-[45.5px] shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-[0_12px_30px_rgba(8,86,207,0.18)]">
                  <span className="text-lg font-bold text-center">M</span>
                </div>

                {!isSidebarCollapsed ? (
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold uppercase tracking-[0.22em] text-brand-700">
                      {workspace.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {workspace.subtitle}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <nav className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-brand-700 text-white shadow-[0_12px_26px_rgba(8,86,207,0.18)]"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        isSidebarCollapsed ? "lg:justify-center lg:px-3" : "",
                      ].join(" ")
                    }
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <AppIcon
                      name={item.icon}
                      className={[
                        "h-5 w-5 shrink-0 transition",
                        isSidebarCollapsed ? "lg:h-5 lg:w-5" : "",
                      ].join(" ")}
                    />
                    {!isSidebarCollapsed ? <span>{item.label}</span> : null}
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="mt-auto border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={logout}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                title={isSidebarCollapsed ? "Logout" : undefined}
              >
                <AppIcon name="logout" className="h-5 w-5" />
                {!isSidebarCollapsed ? <span>Logout</span> : null}
              </button>

              <button
                type="button"
                onClick={handleSidebarToggle}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div className={isSidebarCollapsed ? "rotate-180 transition-transform duration-200" : "transition-transform duration-200"}>
                  <AppIcon name="collapse" className="h-5 w-5" />
                </div>
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={handleSidebarToggle}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Toggle sidebar"
                >
                  <AppIcon name="menu" className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {workspace.title}
                  </div>
                  <div className="truncate text-sm text-slate-500">{workspace.subtitle}</div>
                </div>
              </div>

              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white shadow-[0_12px_30px_rgba(8,86,207,0.16)]">
                    {initials}
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                    <div className="text-xs text-slate-500">{roleLabel}</div>
                  </div>
                  <AppIcon name="chevron" className="hidden h-4 w-4 text-slate-400 sm:block" />
                </summary>

                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <AppIcon name="logout" className="h-4 w-4 text-slate-500" />
                    Logout
                  </button>
                </div>
              </details>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
