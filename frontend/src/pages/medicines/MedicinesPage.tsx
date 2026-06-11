import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { api } from "../../lib/api";
import {
  getMedicines,
  getMedicineCategories,
  createMedicine,
  updateMedicine,
  updateMedicineStatus,
  addMedicineStock,
  deleteMedicine,
} from "../../services/resourceService";
import type { Medicine, MedicineCategory, MedicineUnit, MedicineCreateRequest, MedicineStatusRequest, MedicineStockRequest } from "../../types/medicine";

type UnitBadgeProps = {
  unit: MedicineUnit;
};

function UnitBadge({ unit }: UnitBadgeProps) {
  const getUnitConfig = (unit: MedicineUnit) => {
    const configs: Record<MedicineUnit, { label: string; color: string }> = {
      TABLET: { label: "Tablet", color: "bg-blue-100 text-blue-700 ring-blue-200" },
      CAPSULE: { label: "Capsule", color: "bg-purple-100 text-purple-700 ring-purple-200" },
      SYRUP: { label: "Syrup", color: "bg-teal-100 text-teal-700 ring-teal-200" },
      ML: { label: "ml", color: "bg-cyan-100 text-cyan-700 ring-cyan-200" },
      MG: { label: "mg", color: "bg-pink-100 text-pink-700 ring-pink-200" },
      VIAL: { label: "Vial", color: "bg-indigo-100 text-indigo-700 ring-indigo-200" },
      TUBE: { label: "Tube", color: "bg-orange-100 text-orange-700 ring-orange-200" },
      PACK: { label: "Pack", color: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
      BOX: { label: "Box", color: "bg-red-100 text-red-700 ring-red-200" },
    };
    return configs[unit] || { label: unit, color: "bg-slate-100 text-slate-700 ring-slate-200" };
  };

  const config = getUnitConfig(unit);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.color}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

type StatusBadgeProps = {
  isActive: boolean;
};

function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        isActive
          ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <AppIcon name={isActive ? "check" : "close"} className="h-3.5 w-3.5" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

type StockBadgeProps = {
  stockQuantity: number;
};

function StockBadge({ stockQuantity }: StockBadgeProps) {
  const getStockConfig = (stock: number) => {
    if (stock === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-700 ring-red-200" };
    } else if (stock < 50) {
      return { label: "Low Stock", color: "bg-amber-100 text-amber-700 ring-amber-200" };
    } else {
      return { label: "In Stock", color: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    }
  };

  const config = getStockConfig(stockQuantity);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.color}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {stockQuantity} units
    </span>
  );
}

type MedicineFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (medicine: Partial<MedicineCreateRequest>) => void;
  initialData?: Partial<Medicine> | null;
  categories: MedicineCategory[];
};

function MedicineFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}: MedicineFormModalProps) {
  const [formData, setFormData] = useState<Partial<MedicineCreateRequest>>({
    categoryId: "",
    code: "",
    name: "",
    unit: undefined,
    manufacturer: "",
    description: "",
    sideEffects: "",
    price: 0,
    stockQuantity: 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        categoryId: initialData.categoryId || "",
        code: initialData.code || "",
        name: initialData.name || "",
        unit: initialData.unit as MedicineUnit | undefined,
        manufacturer: initialData.manufacturer || "",
        description: initialData.description || "",
        sideEffects: initialData.sideEffects || "",
        price: initialData.price || 0,
        stockQuantity: initialData.stockQuantity || 0,
        isActive: initialData.isActive ?? true,
      });
    } else {
      setFormData({
        categoryId: "",
        code: "",
        name: "",
        unit: undefined,
        manufacturer: "",
        description: "",
        sideEffects: "",
        price: 0,
        stockQuantity: 0,
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    let parsedValue: any = value;
    if (value === "true") parsedValue = true;
    if (value === "false") parsedValue = false;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "stockQuantity"
          ? (value ? parseFloat(value) : 0)
          : parsedValue,
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
            {initialData?.id ? "Edit Medicine" : "Create New Medicine"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {initialData?.id
              ? "Update medicine details."
              : "Create a new medicine with complete information."}
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
                Medicine Code *
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={formData.code || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., MED001"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Medicine Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., Paracetamol"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="categoryId"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Category *
              </label>
              <div className="relative">
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={handleChange}
                  required
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="unit"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Unit *
              </label>
              <div className="relative">
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                >
                  <option value="TABLET">Tablet</option>
                  <option value="CAPSULE">Capsule</option>
                  <option value="SYRUP">Syrup</option>
                  <option value="ML">ml</option>
                  <option value="MG">mg</option>
                  <option value="VIAL">Vial</option>
                  <option value="TUBE">Tube</option>
                  <option value="PACK">Pack</option>
                  <option value="BOX">Box</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="manufacturer"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Manufacturer
              </label>
              <input
                id="manufacturer"
                name="manufacturer"
                type="text"
                value={formData.manufacturer || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., Pharma Corp"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Price (VND) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                required
                value={formData.price || 0}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., 50000"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="stockQuantity"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Initial Stock
              </label>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity || 0}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., 100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="isActive"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="isActive"
                  name="isActive"
                  value={formData.isActive ? "true" : "false"}
                  onChange={handleChange}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2">
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
                placeholder="Enter medicine description"
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label
                htmlFor="sideEffects"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Side Effects
              </label>
              <textarea
                id="sideEffects"
                name="sideEffects"
                rows={3}
                value={formData.sideEffects || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter known side effects"
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

type MedicineViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  categories: MedicineCategory[];
};

function MedicineViewModal({
  isOpen,
  onClose,
  medicine,
  categories,
}: MedicineViewModalProps) {
  if (!isOpen || !medicine) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const categoryName = useMemo(() => {
    return (
      categories.find((c) => c.id === medicine.categoryId)?.name ||
      "Unassigned"
    );
  }, [categories, medicine.categoryId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
                Medicine Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {medicine.name}
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
                {medicine.name?.[0]?.toUpperCase() || "M"}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {medicine.name}
                </div>
                <div className="mt-1">
                  <UnitBadge unit={medicine.unit} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Medicine ID
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {medicine.id}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Code
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {medicine.code}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Category
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200 px-2.5 py-1 text-xs font-semibold">
                    {categoryName}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Manufacturer
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {medicine.manufacturer || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Price
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatPrice(medicine.price)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Stock
                </div>
                <div className="mt-1">
                  <StockBadge stockQuantity={medicine.stockQuantity} />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </div>
                <div className="mt-1">
                  <StatusBadge isActive={medicine.isActive} />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(medicine.createdAt)}
                </div>
              </div>
            </div>

            {medicine.description && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Description
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {medicine.description}
                </div>
              </div>
            )}

            {medicine.sideEffects && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AppIcon name="close" className="h-4 w-4" />
                  Side Effects
                </div>
                <div className="rounded-lg bg-white p-3 text-sm text-amber-900">
                  {medicine.sideEffects}
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

type AddStockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicineStockRequest) => void;
  medicineName: string;
};

function AddStockModal({
  isOpen,
  onClose,
  onSubmit,
  medicineName,
}: AddStockModalProps) {
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setQuantity(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ quantity });
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
            Add Stock - {medicineName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Update the stock quantity for this medicine.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="quantity"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Quantity to Add *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter quantity"
              />
              <p className="text-xs text-slate-400">
                This will be added to the current stock.
              </p>
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
              className="h-11 w-28 rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.18)] transition hover:bg-emerald-800 hover:shadow-[0_12px_24px_rgba(16,185,129,0.22)] active:scale-[0.98]"
            >
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);
  const [addingStockMedicine, setAddingStockMedicine] = useState<Medicine | null>(null);

  const fetchMedicines = async () => {
    try {
      const [medicinesData, categoriesData] = await Promise.all([
        getMedicines(),
        getMedicineCategories(),
      ]);
      setMedicines(medicinesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMedicines();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      console.log("State categories đã thực sự thay đổi thành:", categories);
    }
  }, [categories]);

  const filteredMedicines = useMemo(() => {
    let result = medicines.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
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
  }, [medicines, searchQuery, sortBy]);

  const handleCreateMedicine = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleViewMedicine = (medicine: Medicine) => {
    setViewingMedicine(medicine);
    setIsViewModalOpen(true);
  };

  const handleAddStock = (medicine: Medicine) => {
    setAddingStockMedicine(medicine);
    setIsAddStockModalOpen(true);
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this medicine?")
    ) {
      return;
    }
    try {
      await deleteMedicine(medicineId);
      setMedicines((prev) => prev.filter((m) => m.id !== medicineId));
    } catch (error: any) {
      console.error("Failed to delete medicine:", error);
      alert(error.response?.data?.message || "Failed to delete medicine");
    }
  };

  const handleToggleStatus = async (medicine: Medicine) => {
    try {
      const newStatus: MedicineStatusRequest = {
        isActive: !medicine.isActive,
      };
      await updateMedicineStatus(medicine.id, newStatus);
      setMedicines((prev) =>
        prev.map((m) => (m.id === medicine.id ? { ...m, isActive: !m.isActive } : m))
      );
    } catch (error: any) {
      console.error("Failed to update status:", error);
      alert(error.response?.data?.message || "Failed to update medicine status");
    }
  };

  const handleFormSubmit = async (
    medicineData: Partial<MedicineCreateRequest>,
  ) => {
    try {
      if (editingMedicine?.id) {
        // Update existing medicine
        await updateMedicine(editingMedicine.id, {
          categoryId: medicineData.categoryId,
          code: medicineData.code,
          name: medicineData.name,
          unit: medicineData.unit,
          manufacturer: medicineData.manufacturer,
          description: medicineData.description,
          sideEffects: medicineData.sideEffects,
          price: medicineData.price,
        });
        setMedicines((prev) =>
          prev.map((m) =>
            m.id === editingMedicine.id ? { ...m, ...medicineData } : m,
          ),
        );
      } else {
        // Create new medicine
        await createMedicine({
          categoryId: medicineData.categoryId,
          code: medicineData.code,
          name: medicineData.name,
          unit: medicineData.unit,
          manufacturer: medicineData.manufacturer,
          description: medicineData.description,
          sideEffects: medicineData.sideEffects,
          price: medicineData.price,
          stockQuantity: medicineData.stockQuantity || 0,
          isActive: medicineData.isActive ?? true,
        });
        const newMedicine: Medicine = {
          id: "",
          categoryId: medicineData.categoryId || "",
          categoryName: categories.find(c => c.id === medicineData.categoryId)?.name || "",
          code: medicineData.code || "",
          name: medicineData.name || "",
          unit: (medicineData.unit as MedicineUnit) || "TABLET" as MedicineUnit,
          manufacturer: medicineData.manufacturer || "",
          description: medicineData.description || "",
          sideEffects: medicineData.sideEffects || "",
          price: medicineData.price || 0,
          stockQuantity: medicineData.stockQuantity || 0,
          isActive: medicineData.isActive ?? true,
          createdAt: new Date().toISOString(),
        };
        setMedicines((prev) => [...prev, newMedicine]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save medicine:", error);
      alert(error.response?.data?.message || "Failed to save medicine");
    }
  };

  const handleAddStockSubmit = async (data: MedicineStockRequest) => {
    if (!addingStockMedicine) return;
    try {
      await addMedicineStock(addingStockMedicine.id, data);
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === addingStockMedicine.id
            ? { ...m, stockQuantity: m.stockQuantity + data.quantity }
            : m
        )
      );
      setIsAddStockModalOpen(false);
    } catch (error: any) {
      console.error("Failed to add stock:", error);
      alert(error.response?.data?.message || "Failed to add stock");
    }
  };

  const unitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    medicines.forEach((m) => {
      counts[m.unit] = (counts[m.unit] || 0) + 1;
    });
    return counts;
  }, [medicines]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Active: 0,
      Inactive: 0,
    };
    medicines.forEach((m) => {
      counts[m.isActive ? "Active" : "Inactive"] = (counts[m.isActive ? "Active" : "Inactive"] || 0) + 1;
    });
    return counts;
  }, [medicines]);

  const stockStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "In Stock": 0,
      "Low Stock": 0,
      "Out of Stock": 0,
    };
    medicines.forEach((m) => {
      if (m.stockQuantity === 0) {
        counts["Out of Stock"] = (counts["Out of Stock"] || 0) + 1;
      } else if (m.stockQuantity < 50) {
        counts["Low Stock"] = (counts["Low Stock"] || 0) + 1;
      } else {
        counts["In Stock"] = (counts["In Stock"] || 0) + 1;
      }
    });
    return counts;
  }, [medicines]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    medicines.forEach((m) => {
      const catName = m.categoryName || "Unassigned";
      counts[catName] = (counts[catName] || 0) + 1;
    });
    return counts;
  }, [medicines]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Medicine Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Medicines
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage medicine inventory, categories, and stock levels.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Medicines
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {medicines.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Medicines in the system
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
                Active Medicines
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700">
                {statusCounts.Active}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <AppIcon name="check" className="h-6 w-6" />
            </div>
          </div>
        </article>
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Inactive Medicines
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-600">
                {statusCounts.Inactive}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
              <AppIcon name="close" className="h-6 w-6" />
            </div>
          </div>
        </article>
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Stock Status
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-amber-700">
                {stockStatusCounts["Low Stock"]}
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <AppIcon name="patients" className="h-6 w-6" />
            </div>
          </div>
        </article>
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Categories
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-indigo-700">
                {Object.keys(categoryCounts).length}
              </div>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700">
              <AppIcon name="departments" className="h-6 w-6" />
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
                placeholder="Search medicines by name, code, or category..."
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
          <button
            onClick={handleCreateMedicine}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.18)] transition hover:bg-emerald-800 hover:shadow-[0_12px_24px_rgba(16,185,129,0.22)] active:scale-[0.98]"
          >
            <AppIcon name="patients" className="h-5 w-5" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Medicine</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Unit</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                      <span className="text-sm text-slate-500">
                        Loading medicines...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <AppIcon
                          name="patients"
                          className="h-8 w-8 text-slate-400"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">
                          No medicines found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery
                            ? "Try adjusting your search criteria."
                            : "Get started by creating your first medicine."}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          onClick={handleCreateMedicine}
                          className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                          Create Medicine
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => (
                  <tr
                    key={medicine.id}
                    className="group transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
                          {medicine.name?.[0]?.toUpperCase() || "M"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {medicine.name}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            {medicine.code} • {medicine.manufacturer || "No manufacturer"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200 px-2.5 py-1 text-xs font-semibold">
                        {medicine.categoryName || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <UnitBadge unit={medicine.unit} />
                    </td>
                    <td className="px-6 py-4">
                      <StockBadge stockQuantity={medicine.stockQuantity} />
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatPrice(medicine.price)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={medicine.isActive} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewMedicine(medicine)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <AppIcon name="menu" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditMedicine(medicine)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"
                          title="Edit medicine"
                        >
                          <AppIcon name="edit" className="h-[14px] w-[14px]" />
                        </button>
                        <button
                          onClick={() => handleAddStock(medicine)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                          title="Add stock"
                        >
                          <AppIcon name="plus" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(medicine)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                          title={medicine.isActive ? "Deactivate" : "Activate"}
                        >
                          <AppIcon 
                            name={medicine.isActive ? "close" : "check"} 
                            className="h-4 w-4" 
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete medicine"
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
        {!loading && filteredMedicines.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredMedicines.length} of {medicines.length} medicines
              </span>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <MedicineFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingMedicine}
        categories={categories}
      />

      {/* View Modal */}
      <MedicineViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        medicine={viewingMedicine}
        categories={categories}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSubmit={handleAddStockSubmit}
        medicineName={addingStockMedicine?.name || ""}
      />
    </section>
  );
}