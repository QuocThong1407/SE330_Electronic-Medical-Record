import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { api } from "../../lib/api";
import { getSpecializations } from "../../services/resourceService";
import type { Specialization } from "../../types/catalog";
import { useAuth } from "../../contexts/AuthContext";

type SpecializationFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (specialization: Partial<Specialization>) => void;
  initialData?: Partial<Specialization> | null;
};

function SpecializationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SpecializationFormModalProps) {
  const [formData, setFormData] = useState<Partial<Specialization>>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
            {initialData?.id ? "Edit Specialization" : "Create New Specialization"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {initialData?.id
              ? "Update specialization details."
              : "Create a new specialization with complete information."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto px-6 py-5"
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Specialization Name *
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
                htmlFor="description"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter specialization description"
              />
            </div>
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

type SpecializationViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  specialization: Specialization | null;
};

function SpecializationViewModal({
  isOpen,
  onClose,
  specialization,
}: SpecializationViewModalProps) {
  if (!isOpen || !specialization) return null;

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
                Specialization Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {specialization.name}
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
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-xl font-bold text-white shadow-lg">
                {specialization.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {specialization.name}
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    ID: {specialization.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Specialization ID
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {specialization.id}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(specialization.createdAt)}
                </div>
              </div>
            </div>

            {specialization.description && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Description
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {specialization.description}
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

export function SpecializationsPage() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] =
    useState<Specialization | null>(null);
  const [viewingSpecialization, setViewingSpecialization] =
    useState<Specialization | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const fetchSpecializations = async () => {
    try {
      const specializationsData = await getSpecializations();
      setSpecializations(specializationsData);
    } catch (error) {
      console.error("Failed to fetch specializations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSpecializations();
  }, []);

  const filteredSpecializations = useMemo(() => {
    let result = specializations.filter((s) => {
      const matchesSearch =
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
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
  }, [specializations, searchQuery, sortBy]);

  const handleCreateSpecialization = () => {
    setEditingSpecialization(null);
    setIsModalOpen(true);
  };

  const handleEditSpecialization = (specialization: Specialization) => {
    setEditingSpecialization(specialization);
    setIsModalOpen(true);
  };

  const handleViewSpecialization = (specialization: Specialization) => {
    setViewingSpecialization(specialization);
    setIsViewModalOpen(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    void fetchSpecializations();
  };

  const handleDeleteSpecialization = async (specializationId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this specialization?")
    ) {
      return;
    }
    try {
      await api.delete(`/specializations/${specializationId}`);
      setSpecializations((prev) =>
        prev.filter((s) => s.id !== specializationId),
      );
    } catch (error: any) {
      console.error("Failed to delete specialization:", error);
      alert(error.response?.data?.message || "Failed to delete specialization");
    }
  };

  const handleFormSubmit = async (
    specializationData: Partial<Specialization>,
  ) => {
    try {
      if (editingSpecialization?.id) {
        // Update existing specialization
        await api.put(`/specializations/${editingSpecialization.id}`, {
          name: specializationData.name,
          description: specializationData.description,
        });
        setSpecializations((prev) =>
          prev.map((s) =>
            s.id === editingSpecialization.id
              ? { ...s, ...specializationData }
              : s,
          ),
        );
      } else {
        // Create new specialization
        await api.post("/specializations", {
          name: specializationData.name,
          description: specializationData.description,
        });
        const newSpecialization: Specialization = {
          id: "",
          name: specializationData.name || "",
          description: specializationData.description || "",
          createdAt: new Date().toISOString(),
        };
        setSpecializations((prev) => [...prev, newSpecialization]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save specialization:", error);
      alert(error.response?.data?.message || "Failed to save specialization");
    }
  };

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Specialization Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Specializations
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage medical specializations and clinical areas of expertise.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Specializations
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {specializations.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Medical specializations in the system
              </div>
            </div>
          </div>
        </div>
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
                placeholder="Search specializations by name or description..."
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

          {isAdmin && (
            <button
              onClick={handleCreateSpecialization}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(20,184,166,0.18)] transition hover:bg-teal-800 hover:shadow-[0_12px_24px_rgba(20,184,166,0.22)] active:scale-[0.98]"
            >
              <AppIcon name="specializations" className="h-5 w-5" />
              <span>Add Specialization</span>
            </button>
          )}
        </div>
      </div>

      {/* Specializations Table */}
      <div className="card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Specialization</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
                      <span className="text-sm text-slate-500">
                        Loading specializations...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredSpecializations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <AppIcon
                          name="specializations"
                          className="h-8 w-8 text-slate-400"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">
                          No specializations found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery
                            ? "Try adjusting your search criteria."
                            : "Get started by creating your first specialization."}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          onClick={handleCreateSpecialization}
                          className="mt-4 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                        >
                          Create Specialization
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSpecializations.map((specialization) => (
                  <tr
                    key={specialization.id}
                    className="group transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-bold text-white shadow-sm">
                          {specialization.name?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {specialization.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {specialization.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {specialization.createdAt
                        ? new Date(specialization.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewSpecialization(specialization)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <AppIcon name="menu" className="h-4 w-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEditSpecialization(specialization)}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-teal-600"
                              title="Edit specialization"
                            >
                              <AppIcon name="profile" className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSpecialization(specialization.id)}
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete specialization"
                            >
                              <AppIcon name="logout" className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredSpecializations.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredSpecializations.length} of {specializations.length} specializations
              </span>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <SpecializationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSpecialization}
      />

      {/* View Modal */}
      <SpecializationViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        specialization={viewingSpecialization}
      />
    </section>
  );
}