import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { getUsers } from "../../services/resourceService";
import type { UserSummary } from "../../types/auth";

type RoleBadgeProps = {
  role: string;
  onClick?: () => void;
};

function RoleBadge({ role, onClick }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Administrator",
          color: "bg-rose-100 text-rose-700 ring-rose-200",
          icon: "shield",
        };
      case "DOCTOR":
        return {
          label: "Doctor",
          color: "bg-emerald-100 text-emerald-700 ring-emerald-200",
          icon: "doctors",
        };
      case "RECEPTIONIST":
        return {
          label: "Receptionist",
          color: "bg-amber-100 text-amber-700 ring-amber-200",
          icon: "users",
        };
      case "PATIENT":
        return {
          label: "Patient",
          color: "bg-blue-100 text-blue-700 ring-blue-200",
          icon: "patients",
        };
      default:
        return {
          label: role,
          color: "bg-slate-100 text-slate-700 ring-slate-200",
          icon: "users",
        };
    }
  };

  const config = getRoleConfig(role);
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.color} ${onClick ? "cursor-pointer hover:bg-opacity-80 transition" : ""}`}
    >
      <AppIcon name={config.icon as any} className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

type StatusBadgeProps = {
  active: boolean;
};

function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        active
          ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Partial<UserAdminCreateRequest>) => void;
  initialData?: Partial<UserAdminResponse> | null;
};

interface UserAdminCreateRequest {
  email: string;
  password: string;
  role: string;
  active: boolean;
}

interface UserAdminResponse {
  id: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  doctorProfile?: any;
  patientProfile?: any;
}

function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<UserAdminCreateRequest>({
    email: "",
    password: "",
    role: "PATIENT",
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || "",
        password: "",
        role: initialData.role || "PATIENT",
        active: initialData.active ?? true,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        role: "PATIENT",
        active: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {initialData?.id ? "Edit User" : "Create New User"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {initialData?.id
              ? "Update user account details and permissions."
              : "Create a new user account with specified role and permissions."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email || ""}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required={!initialData?.id}
              value={formData.password || ""}
              onChange={handleChange}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              placeholder="Enter password"
            />
            {!initialData?.id && (
              <p className="text-xs text-slate-400">
                Password will be sent to the user's email for first login.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
            >
              Role
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              >
                <option value="ADMIN">Administrator</option>
                <option value="DOCTOR">Doctor</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="PATIENT">Patient</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <label className="relative flex cursor-pointer items-center gap-3">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={handleChange}
                className="peer h-5 w-5 appearance-none rounded-md border border-slate-300 bg-white transition checked:border-brand-500 checked:bg-brand-50 checked:ring-4 checked:ring-brand-100"
              />
              <span className="text-sm font-medium text-slate-700 peer-checked:text-slate-900">
                Active Account
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-28 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 w-28 rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,116,144,0.18)] transition hover:bg-brand-800 hover:shadow-[0_12px_24px_rgba(14,116,144,0.22)] active:scale-[0.98]"
            >
              {initialData?.id ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type UserViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserAdminResponse | null;
};

function UserViewModal({ isOpen, onClose, user }: UserViewModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                User Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {user.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <AppIcon name="logout" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-600 text-xl font-bold text-white shadow-lg">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {user.email}
                </div>
                <div className="mt-1">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  User ID
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {user.id}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </div>
                <div className="mt-1">
                  <StatusBadge active={user.active} />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Last Updated
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </div>
              </div>
            </div>

            {(user.doctorProfile || user.patientProfile) && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Linked Profile
                </div>
                {user.doctorProfile && (
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <div className="flex items-center gap-2">
                      <AppIcon
                        name="doctors"
                        className="h-4 w-4 text-emerald-600"
                      />
                      <span className="text-sm font-medium text-emerald-700">
                        Doctor Profile
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-emerald-600">
                      <div>Code: {user.doctorProfile.code}</div>
                      <div>Name: {user.doctorProfile.fullName}</div>
                      <div>
                        Created:{" "}
                        {user.doctorProfile.createdAt
                          ? new Date(
                              user.doctorProfile.createdAt,
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </div>
                )}
                {user.patientProfile && (
                  <div className="mt-3 rounded-lg bg-blue-50 p-3">
                    <div className="flex items-center gap-2">
                      <AppIcon
                        name="patients"
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-blue-700">
                        Patient Profile
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-blue-600">
                      <div>Code: {user.patientProfile.code}</div>
                      <div>Name: {user.patientProfile.fullName}</div>
                      <div>
                        Created:{" "}
                        {user.patientProfile.createdAt
                          ? new Date(
                              user.patientProfile.createdAt,
                            ).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 w-full rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAdminResponse | null>(
    null,
  );
  const [viewingUser, setViewingUser] = useState<UserAdminResponse | null>(
    null,
  );
  const isAdmin = user?.role === "ADMIN";

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      const matchesSearch =
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole =
        selectedRoles.length === 0 || selectedRoles.includes(u.role);
      return matchesSearch && matchesRole;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.email.localeCompare(b.email);
        case "date":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "status":
          return (b.active ? 1 : 0) - (a.active ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [users, searchQuery, selectedRoles, sortBy]);

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserAdminResponse) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleViewUser = (user: UserAdminResponse) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    void fetchUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleFormSubmit = async (
    userData: Partial<UserAdminCreateRequest>,
  ) => {
    try {
      if (editingUser?.id) {
        // Update existing user
        await api.put(`/users/${editingUser.id}`, {
          email: userData.email,
          role: userData.role,
          active: userData.active,
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)),
        );
      } else {
        // Create new user
        await api.post("/users", userData);
        const newUser: UserAdminResponse = {
          id: "",
          email: userData.email || "",
          role: userData.role || "PATIENT",
          active: userData.active ?? true,
        };
        setUsers((prev) => [...prev, newUser]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save user:", error);
      alert(error.response?.data?.message || "Failed to save user");
    }
  };

  const toggleRoleFilter = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ADMIN: 0,
      DOCTOR: 0,
      RECEPTIONIST: 0,
      PATIENT: 0,
    };
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [users]);

  const activeCounts = useMemo(() => {
    return {
      active: users.filter((u) => u.active).length,
      inactive: users.filter((u) => !u.active).length,
    };
  }, [users]);

  const availableRoles = ["ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"];

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(14,116,144,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                User Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Users
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage system access, permissions, and user accounts across the
                platform.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Users
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {users.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Active accounts in the system
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Administrators",
            count: roleCounts.ADMIN,
            color: "bg-rose-50 text-rose-700",
          },
          {
            label: "Doctors",
            count: roleCounts.DOCTOR,
            color: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Receptionists",
            count: roleCounts.RECEPTIONIST,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Patients",
            count: roleCounts.PATIENT,
            color: "bg-blue-50 text-blue-700",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="card p-5 transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {stat.label}
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {stat.count}
                </div>
              </div>
              <div className={`rounded-2xl p-3 ${stat.color} bg-opacity-10`}>
                <AppIcon
                  name={
                    stat.label === "Administrators"
                      ? "users"
                      : stat.label === "Doctors"
                        ? "doctors"
                        : stat.label === "Receptionists"
                          ? "users"
                          : "patients"
                  }
                  className="h-6 w-6"
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="card p-4">
        {/* Search and Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <AppIcon
              name="menu"
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search users by email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="relative min-w-[160px]">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "date" | "status")
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            >
              <option value="date">Sort by Date Created</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex">
            <button
              onClick={handleRefresh}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              <AppIcon name="refresh" className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Add User Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCreateUser}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(14,116,144,0.18)] transition hover:bg-brand-800 hover:shadow-[0_12px_24px_rgba(14,116,144,0.22)] active:scale-[0.98]"
            >
              <AppIcon name="users" className="h-5 w-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden border-slate-200 bg-white shadow-sm rounded-2xl">
        <div className="border-b border-slate-100 px-6 py-4 bg-white">
          {/* Role Filter Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Filter by Role:
            </span>
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => toggleRoleFilter(role)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedRoles.includes(role)
                    ? "bg-brand-700 text-white shadow-[0_4px_12px_rgba(14,116,144,0.25)]"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <AppIcon
                  name={
                    role === "ADMIN"
                      ? "shield"
                      : role === "DOCTOR"
                        ? "doctors"
                        : role === "RECEPTIONIST"
                          ? "users"
                          : "patients"
                  }
                  className="h-3.5 w-3.5"
                />
                {role.charAt(0) + role.slice(1).toLowerCase()}
                {selectedRoles.includes(role) && (
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                    ×
                  </span>
                )}
              </button>
            ))}
            {selectedRoles.length > 0 && (
              <button
                onClick={() => setSelectedRoles([])}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
                      <span className="text-sm text-slate-500">
                        Loading users...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <AppIcon
                          name="users"
                          className="h-8 w-8 text-slate-400"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">
                          No users found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery || selectedRoles.length > 0
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by creating your first user account."}
                        </p>
                      </div>
                      {!searchQuery && selectedRoles.length === 0 && (
                        <button
                          onClick={handleCreateUser}
                          className="mt-4 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
                        >
                          Create User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-600 text-sm font-bold text-white shadow-sm">
                          {user.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {user.email}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <RoleBadge role={user.role} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge active={user.active} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <AppIcon name="menu" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-600"
                          title="Edit user"
                        >
                          <AppIcon name="profile" className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete user"
                          >
                            <AppIcon name="logout" className="h-4 w-4" />
                          </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredUsers.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
      />

      {/* View Modal */}
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={viewingUser}
      />
    </section>
  );
}
