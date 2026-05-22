import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Users" },
  { to: "/departments", label: "Departments" },
  { to: "/specializations", label: "Specializations" },
  { to: "/doctors", label: "Doctors" },
  { to: "/patients", label: "Patients" },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-100">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">EMR System</div>
            <div className="mt-2 text-xl font-semibold">Hospital Admin</div>
            <div className="mt-1 text-sm text-slate-400">{user?.email}</div>
            <div className="mt-1 inline-flex rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200">
              {user?.role}
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "block rounded-xl px-4 py-3 text-sm transition",
                    isActive
                      ? "bg-cyan-400 text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button className="btn-secondary mt-8 w-full" onClick={logout}>
            Logout
          </button>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 card flex items-center justify-between px-5 py-4">
            <div>
              <div className="page-title">Electronic Medical Record</div>
              <div className="page-subtitle">Frontend scaffold for admin operations</div>
            </div>
            <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 sm:block">
              Ready for API integration
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
