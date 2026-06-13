import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { api } from "../../lib/api";
import { getDepartments } from "../../services/resourceService";
import type { Department } from "../../types/catalog";

type DepartmentFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (department: Partial<Department>) => void;
  initialData?: Partial<Department> | null;
};

function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: DepartmentFormModalProps) {
  const [formData, setFormData] = useState<Partial<Department>>({
    code: "",
    name: "",
    description: "",
    location: "",
    phoneExt: "",
    active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || "",
        name: initialData.name || "",
        description: initialData.description || "",
        location: initialData.location || "",
        phoneExt: initialData.phoneExt || "",
        active: initialData.active ?? true,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        location: "",
        phoneExt: "",
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "active" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {initialData?.id ? "Edit Department" : "Create New Department"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {initialData?.id
              ? "Update department details."
              : "Create a new department with complete information."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto px-6 py-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Department Code *
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={formData.code || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., CARD"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Department Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., Cardiology"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., 1st Floor, Building A"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phoneExt"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Phone Extension
              </label>
              <input
                id="phoneExt"
                name="phoneExt"
                type="tel"
                value={formData.phoneExt || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., 1234"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="description"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter department description"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 mt-4">
            <label className="relative flex cursor-pointer items-center gap-3">
              {/* Vùng chứa ô Checkbox và Dấu Tick định vị tuyệt đối */}
              <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  checked={formData.active ?? true}
                  onChange={handleChange}
                  className="peer h-5 w-5 appearance-none rounded-md border border-slate-300 bg-white transition-all checked:border-slate-500 checked:ring-4 checked:ring-brand-100 outline-none"
                />
                
                {/* Icon Dấu Tick màu đen và không có background */}
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute h-3.5 w-3.5 fill-none stroke-slate-950 opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              {/* Nhãn chữ bên cạnh */}
              <span className="text-sm font-medium text-slate-700 select-none peer-checked:text-slate-900">
                Active Department
              </span>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
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
              {initialData?.id ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type DepartmentViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
};

function DepartmentViewModal({
  isOpen,
  onClose,
  department,
}: DepartmentViewModalProps) {
  if (!isOpen || !department) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Department Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {department.name}
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
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg">
                {department.name?.[0]?.toUpperCase() || "D"}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {department.name}
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    {department.code}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Department ID
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {department.id}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                      department.active
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                        : "bg-slate-50 text-slate-600 ring-slate-600/20"
                    }`}
                  >
                    {department.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Location
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {department.location || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Phone Ext
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {department.phoneExt || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(department.createdAt)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Updated
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(department.updatedAt)}
                </div>
              </div>
            </div>

            {department.description && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Description
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {department.description}
                </div>
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

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(
    null,
  );

  const fetchDepartments = async () => {
    try {
      const departmentsData = await getDepartments();
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    let result = departments.filter((d) => {
      const matchesSearch =
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [departments, searchQuery, sortBy]);

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleViewDepartment = (department: Department) => {
    setViewingDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    void fetchDepartments();
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }
    try {
      await api.delete(`/departments/${departmentId}`);
      setDepartments((prev) => prev.filter((d) => d.id !== departmentId));
    } catch (error: any) {
      console.error("Failed to delete department:", error);
      alert(error.response?.data?.message || "Failed to delete department");
    }
  };

  const handleFormSubmit = async (departmentData: Partial<Department>) => {
    try {
      if (editingDepartment?.id) {
        // Update existing department
        await api.put(`/departments/${editingDepartment.id}`, {
          code: departmentData.code,
          name: departmentData.name,
          description: departmentData.description,
          location: departmentData.location,
          phoneExt: departmentData.phoneExt,
          active: departmentData.active,
        });
        setDepartments((prev) =>
          prev.map((d) =>
            d.id === editingDepartment.id ? { ...d, ...departmentData } : d,
          ),
        );
      } else {
        // Create new department
        await api.post("/departments", {
          code: departmentData.code,
          name: departmentData.name,
          description: departmentData.description,
          location: departmentData.location,
          phoneExt: departmentData.phoneExt,
          active: departmentData.active,
        });
        const newDepartment: Department = {
          id: "",
          code: departmentData.code || "",
          name: departmentData.name || "",
          description: departmentData.description || "",
          location: departmentData.location || "",
          phoneExt: departmentData.phoneExt || "",
          active: departmentData.active ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDepartments((prev) => [...prev, newDepartment]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save department:", error);
      alert(error.response?.data?.message || "Failed to save department");
    }
  };

  const activeCount = useMemo(() => {
    return departments.filter((d) => d.active).length;
  }, [departments]);

  const inactiveCount = useMemo(() => {
    return departments.filter((d) => !d.active).length;
  }, [departments]);

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700">
                Department Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Departments
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage hospital departments, locations, and contact information.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Departments
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {departments.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Active departments in the system
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Active Departments
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700">
                {activeCount}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <AppIcon name="shield" className="h-6 w-6" />
            </div>
          </div>
        </article>
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Inactive Departments
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-700">
                {inactiveCount}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <AppIcon name="menu" className="h-6 w-6" />
            </div>
          </div>
        </article>
      </div>

      {/* Actions Bar */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <AppIcon
                name="menu"
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search departments by name, code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <div className="relative min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "date")}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              >
                <option value="date">Sort by Date Created</option>
                <option value="name">Sort by Name</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
              </div>
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

          <button
            onClick={handleCreateDepartment}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,70,229,0.18)] transition hover:bg-indigo-800 hover:shadow-[0_12px_24px_rgba(79,70,229,0.22)] active:scale-[0.98]"
          >
            <AppIcon name="departments" className="h-5 w-5" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Departments Table */}
      <div className="card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-700" />
                      <span className="text-sm text-slate-500">
                        Loading departments...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <AppIcon
                          name="departments"
                          className="h-8 w-8 text-slate-400"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">
                          No departments found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery
                            ? "Try adjusting your search criteria."
                            : "Get started by creating your first department."}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          onClick={handleCreateDepartment}
                          className="mt-4 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
                        >
                          Create Department
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((department) => (
                  <tr
                    key={department.id}
                    className="group transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                          {department.name?.[0]?.toUpperCase() || "D"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {department.name}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {department.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        {department.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {department.location || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          department.active
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                            : "bg-slate-50 text-slate-600 ring-slate-600/20"
                        }`}
                      >
                        {department.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDepartment(department)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <AppIcon name="menu" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDepartment(department)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                          title="Edit department"
                        >
                          <AppIcon name="profile" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(department.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete department"
                        >
                          <AppIcon name="logout" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredDepartments.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredDepartments.length} of {departments.length}{" "}
                departments
              </span>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDepartment}
      />

      {/* View Modal */}
      <DepartmentViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        department={viewingDepartment}
      />
    </section>
  );
}
