import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { api } from "../../lib/api";
import {
  getMedicineCategories,
  createMedicineCategory,
  updateMedicineCategory,
  deleteMedicineCategory,
} from "../../services/resourceService";
import type { MedicineCategory } from "../../types/medicine";

type CategoryFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: Partial<MedicineCategory>) => void;
  initialData?: Partial<MedicineCategory> | null;
};

function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<Partial<MedicineCategory>>({
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
            {initialData?.id ? "Edit Category" : "Create New Category"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {initialData?.id
              ? "Update category details."
              : "Create a new medicine category with complete information."}
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
                Category Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., Antibiotics"
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
                placeholder="Enter category description"
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

type CategoryViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category: MedicineCategory | null;
};

function CategoryViewModal({
  isOpen,
  onClose,
  category,
}: CategoryViewModalProps) {
  if (!isOpen || !category) return null;

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
                Category Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {category.name}
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
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-lg">
                {category.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {category.name}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Category ID
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {category.id}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(category.createdAt)}
                </div>
              </div>
            </div>

            {category.description && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Description
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {category.description}
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

export function MedicineCategoriesPage() {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MedicineCategory | null>(
    null,
  );
  const [viewingCategory, setViewingCategory] = useState<MedicineCategory | null>(
    null,
  );

  const fetchCategories = async () => {
    try {
      const categoriesData = await getMedicineCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    let result = categories.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

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
  }, [categories, searchQuery, sortBy]);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: MedicineCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleViewCategory = (category: MedicineCategory) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    void fetchCategories();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }
    try {
      await deleteMedicineCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleFormSubmit = async (categoryData: Partial<MedicineCategory>) => {
    try {
      if (editingCategory?.id) {
        // Update existing category
        await updateMedicineCategory(editingCategory.id, {
          name: categoryData.name,
          description: categoryData.description,
        });
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...categoryData } : c,
          ),
        );
      } else {
        // Create new category
        await createMedicineCategory({
          name: categoryData.name,
          description: categoryData.description,
        });
        const newCategory: MedicineCategory = {
          id: "",
          name: categoryData.name || "",
          description: categoryData.description || "",
          createdAt: new Date().toISOString(),
        };
        setCategories((prev) => [...prev, newCategory]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save category:", error);
      alert(error.response?.data?.message || "Failed to save category");
    }
  };

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Medicine Category Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Medicine Categories
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage medicine categories for organizing your inventory.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Categories
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {categories.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Categories in the system
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
                placeholder="Search categories by name or description..."
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
            onClick={handleCreateCategory}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.18)] transition hover:bg-emerald-800 hover:shadow-[0_12px_24px_rgba(16,185,129,0.22)] active:scale-[0.98]"
          >
            <AppIcon name="categories" className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                      <span className="text-sm text-slate-500">
                        Loading categories...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <AppIcon
                          name="categories"
                          className="h-8 w-8 text-slate-400"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">
                          No categories found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery
                            ? "Try adjusting your search criteria."
                            : "Get started by creating your first category."}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          onClick={handleCreateCategory}
                          className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                          Create Category
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="group transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
                          {category.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {category.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {category.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewCategory(category)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <AppIcon name="menu" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"
                          title="Edit category"
                        >
                          <AppIcon name="edit" className="h-[14px] w-[14px]" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete category"
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
        {!loading && filteredCategories.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredCategories.length} of {categories.length}{" "}
                categories
              </span>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
      />

      {/* View Modal */}
      <CategoryViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        category={viewingCategory}
      />
    </section>
  );
}