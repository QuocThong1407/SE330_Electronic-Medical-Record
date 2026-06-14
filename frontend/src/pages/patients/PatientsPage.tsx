import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { getPatients, getUsers } from "../../services/resourceService";
import type { PatientProfile } from "../../types/patient";
import type { UserSummary } from "../../types/auth";

type GenderBadgeProps = {
  gender: string;
};

function GenderBadge({ gender }: GenderBadgeProps) {
  const getGenderConfig = (gender: string) => {
    switch (gender) {
      case "MALE":
        return {
          label: "Male",
          color: "bg-blue-100 text-blue-700 ring-blue-200",
          icon: "users",
        };
      case "FEMALE":
        return {
          label: "Female",
          color: "bg-pink-100 text-pink-700 ring-pink-200",
          icon: "patients",
        };
      case "OTHER":
        return {
          label: "Other",
          color: "bg-purple-100 text-purple-700 ring-purple-200",
          icon: "users",
        };
      default:
        return {
          label: gender,
          color: "bg-slate-100 text-slate-700 ring-slate-200",
          icon: "users",
        };
    }
  };

  const config = getGenderConfig(gender);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${config.color}`}
    >
      <AppIcon name={config.icon as any} className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

type PatientFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patient: Partial<PatientAdminCreateRequest>) => void;
  initialData?: Partial<PatientProfileResponse> | null;
  users: UserSummary[];
  showUserSelect?: boolean;
  submitLabel?: string;
  title?: string;
  description?: string;
};

interface PatientAdminCreateRequest {
  userId: string;
  fullName: string;
  gender: string;
  dateOfBirth?: string | null;
  idCardNumber?: string | null;
  insuranceNumber?: string | null;
  insuranceExpDate?: string | null;
  phone?: string | null;
  emailContact?: string | null;
  address?: string | null;
  city?: string | null;
  bloodType?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  notes?: string | null;
}

interface PatientProfileResponse {
  id: string;
  userId?: string | null;
  patientCode: string;
  fullName: string;
  gender: string;
  dateOfBirth?: string | null;
  idCardNumber?: string | null;
  insuranceNumber?: string | null;
  insuranceExpDate?: string | null;
  phone?: string | null;
  emailContact?: string | null;
  address?: string | null;
  city?: string | null;
  bloodType?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function PatientFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  users,
  showUserSelect = true,
  submitLabel,
  title,
  description,
}: PatientFormModalProps) {
  const [formData, setFormData] = useState<PatientAdminCreateRequest>({
    userId: "",
    fullName: "",
    gender: "MALE",
    dateOfBirth: "",
    idCardNumber: "",
    insuranceNumber: "",
    insuranceExpDate: "",
    phone: "",
    emailContact: "",
    address: "",
    city: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || "",
        fullName: initialData.fullName || "",
        gender: initialData.gender || "MALE",
        dateOfBirth: initialData.dateOfBirth || "",
        idCardNumber: initialData.idCardNumber || "",
        insuranceNumber: initialData.insuranceNumber || "",
        insuranceExpDate: initialData.insuranceExpDate || "",
        phone: initialData.phone || "",
        emailContact: initialData.emailContact || "",
        address: initialData.address || "",
        city: initialData.city || "",
        bloodType: initialData.bloodType || "",
        emergencyContactName: initialData.emergencyContactName || "",
        emergencyContactPhone: initialData.emergencyContactPhone || "",
        emergencyContactRelation: initialData.emergencyContactRelation || "",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        userId: "",
        fullName: "",
        gender: "MALE",
        dateOfBirth: "",
        idCardNumber: "",
        insuranceNumber: "",
        insuranceExpDate: "",
        phone: "",
        emailContact: "",
        address: "",
        city: "",
        bloodType: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  // Get users who don't have a patient profile yet (for new patient creation)
  const availableUsers = useMemo(() => {
    if (initialData) {
      // For editing, show all users including the current one
      return users;
    }
    // For creating, exclude users who already have a patient profile
    return users.filter((u) => !u.patientProfile);
  }, [users, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
            {title || (initialData?.id ? "Edit Patient" : "Create New Patient")}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {description ||
              (initialData?.id
                ? "Update patient profile details."
                : "Create a new patient profile with complete information.")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {showUserSelect ? (
            <div className="space-y-2">
              <label
                htmlFor="userId"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Select User *
              </label>
              <div className="relative">
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId || ""}
                  onChange={handleChange}
                  required={!initialData?.id}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                >
                  <option value="">Select a user</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {initialData?.id
                  ? "User associated with this patient profile."
                  : "Select an existing user to link to this patient profile."}
              </p>
            </div>
            ) : null}

            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Gender *
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <AppIcon name="chevron" className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dateOfBirth"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="emailContact"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Email Contact
              </label>
              <input
                id="emailContact"
                name="emailContact"
                type="email"
                value={formData.emailContact || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter email"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="idCardNumber"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                ID Card Number
              </label>
              <input
                id="idCardNumber"
                name="idCardNumber"
                type="text"
                value={formData.idCardNumber || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter ID card number"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="insuranceNumber"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Insurance Number
              </label>
              <input
                id="insuranceNumber"
                name="insuranceNumber"
                type="text"
                value={formData.insuranceNumber || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter insurance number"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="insuranceExpDate"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Insurance Expiry
              </label>
              <input
                id="insuranceExpDate"
                name="insuranceExpDate"
                type="date"
                value={formData.insuranceExpDate || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="bloodType"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Blood Type
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="city"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="address"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter address"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="emergencyContactName"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Emergency Contact Name
              </label>
              <input
                id="emergencyContactName"
                name="emergencyContactName"
                type="text"
                value={formData.emergencyContactName || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter emergency contact name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="emergencyContactPhone"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Emergency Contact Phone
              </label>
              <input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter emergency phone"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="emergencyContactRelation"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Emergency Relation
              </label>
              <input
                id="emergencyContactRelation"
                name="emergencyContactRelation"
                type="text"
                value={formData.emergencyContactRelation || ""}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., Spouse, Parent"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="notes"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                placeholder="Enter any additional notes"
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
              {submitLabel || (initialData?.id ? "Save Changes" : "Create Patient")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type PatientViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfileResponse | null;
};

function PatientViewModal({ isOpen, onClose, patient }: PatientViewModalProps) {
  if (!isOpen || !patient) return null;

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
      <div className="relative flex flex-col w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Patient Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {patient.fullName}
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-lg">
                {patient.fullName?.[0]?.toUpperCase() || "P"}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {patient.fullName}
                </div>
                <div className="mt-1">
                  <GenderBadge gender={patient.gender} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Patient ID
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {patient.id}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Patient Code
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {patient.patientCode}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Phone
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {patient.phone || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {patient.emailContact || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Date of Birth
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(patient.dateOfBirth)}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  ID Card
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {patient.idCardNumber || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Insurance
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {patient.insuranceNumber || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(patient.createdAt)}
                </div>
              </div>
            </div>

            {(patient.address || patient.city) && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Address
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div>Address: {patient.address || "-"}</div>
                  <div>City: {patient.city || "-"}</div>
                </div>
              </div>
            )}

            {(patient.emergencyContactName ||
              patient.emergencyContactPhone) && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Emergency Contact
                </div>
                <div className="space-y-1 text-sm text-slate-700">
                  <div>
                    <span className="font-medium text-slate-500">Name: </span>
                    {patient.emergencyContactName || "-"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Phone: </span>
                    {patient.emergencyContactPhone || "-"}
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Relation: </span>
                    {patient.emergencyContactRelation || "-"}
                  </div>
                </div>
              </div>
            )}

            {patient.notes && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-900">
                  Notes
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {patient.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
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

export function PatientsPage() {
  const { user } = useAuth();
  const role = user?.role ?? "ADMIN";
  const isReceptionist = role === "RECEPTIONIST";
  const [patients, setPatients] = useState<PatientProfileResponse[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientProfileResponse | null>(
    null
  );
  const [viewingPatient, setViewingPatient] = useState<PatientProfileResponse | null>(
    null
  );
  const [linkingPatient, setLinkingPatient] = useState<PatientProfileResponse | null>(null);
  const [selectedLinkUserId, setSelectedLinkUserId] = useState("");

  const fetchPatients = async () => {
    try {
      const [patientsData, usersData] = await Promise.all([
        getPatients(),
        getUsers(),
      ]);
      setPatients(patientsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    let result = patients.filter((p) => {
      const matchesSearch =
        p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fullName.localeCompare(b.fullName);
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
  }, [patients, searchQuery, sortBy]);

  const handleCreatePatient = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleCreateWalkInPatient = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const handleEditPatient = (patient: PatientProfileResponse) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleViewPatient = (patient: PatientProfileResponse) => {
    setViewingPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleLinkUser = (patient: PatientProfileResponse) => {
    setLinkingPatient(patient);
    setSelectedLinkUserId("");
    setIsLinkModalOpen(true);
  };

  const handleRefresh = () => {
    setLoading(true);
    void fetchPatients();
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm("Are you sure you want to delete this patient profile?")) {
      return;
    }
    try {
      await api.delete(`/patients/${patientId}`);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    } catch (error: any) {
      console.error("Failed to delete patient:", error);
      alert(error.response?.data?.message || "Failed to delete patient");
    }
  };

  const handleFormSubmit = async (
    patientData: Partial<PatientAdminCreateRequest>
  ) => {
    try {
      if (editingPatient?.id) {
        // Update existing patient
        await api.put(`/patients/${editingPatient.id}`, {
          fullName: patientData.fullName,
          gender: patientData.gender,
          dateOfBirth: patientData.dateOfBirth || null,
          idCardNumber: patientData.idCardNumber || null,
          insuranceNumber: patientData.insuranceNumber || null,
          insuranceExpDate: patientData.insuranceExpDate || null,
          phone: patientData.phone || null,
          emailContact: patientData.emailContact || null,
          address: patientData.address || null,
          city: patientData.city || null,
          bloodType: patientData.bloodType || null,
          emergencyContactName: patientData.emergencyContactName || null,
          emergencyContactPhone: patientData.emergencyContactPhone || null,
          emergencyContactRelation: patientData.emergencyContactRelation || null,
          notes: patientData.notes || null,
        });
        setPatients((prev) =>
          prev.map((p) =>
            p.id === editingPatient.id ? { ...p, ...patientData } : p
          )
        );
      } else {
        const requestBody = {
          fullName: patientData.fullName,
          gender: patientData.gender,
          dateOfBirth: patientData.dateOfBirth || null,
          idCardNumber: patientData.idCardNumber || null,
          insuranceNumber: patientData.insuranceNumber || null,
          insuranceExpDate: patientData.insuranceExpDate || null,
          phone: patientData.phone || null,
          emailContact: patientData.emailContact || null,
          address: patientData.address || null,
          city: patientData.city || null,
          bloodType: patientData.bloodType || null,
          emergencyContactName: patientData.emergencyContactName || null,
          emergencyContactPhone: patientData.emergencyContactPhone || null,
          emergencyContactRelation: patientData.emergencyContactRelation || null,
          notes: patientData.notes || null,
        };

        if (isReceptionist) {
          await api.post("/patients/walk-in", requestBody);
        } else {
          await api.post("/patients/admin", {
            userId: patientData.userId,
            ...requestBody,
          });
        }
        const newPatient: PatientProfileResponse = {
          id: "",
          patientCode: "",
          fullName: patientData.fullName || "",
          gender: patientData.gender || "MALE",
          userId: patientData.userId || null,
          dateOfBirth: patientData.dateOfBirth || null,
          idCardNumber: patientData.idCardNumber || null,
          insuranceNumber: patientData.insuranceNumber || null,
          insuranceExpDate: patientData.insuranceExpDate || null,
          phone: patientData.phone || null,
          emailContact: patientData.emailContact || null,
          address: patientData.address || null,
          city: patientData.city || null,
          bloodType: patientData.bloodType || null,
          emergencyContactName: patientData.emergencyContactName || null,
          emergencyContactPhone: patientData.emergencyContactPhone || null,
          emergencyContactRelation: patientData.emergencyContactRelation || null,
          notes: patientData.notes || null,
          createdAt: new Date().toISOString(),
        };
        setPatients((prev) => [...prev, newPatient]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save patient:", error);
      alert(error.response?.data?.message || "Failed to save patient");
    }
  };

  const handleLinkUserSubmit = async () => {
    if (!linkingPatient) {
      return;
    }

    if (!selectedLinkUserId) {
      alert("Please select a user to link.");
      return;
    }

    try {
      await api.patch(`/patients/${linkingPatient.id}/link-user`, {
        userId: selectedLinkUserId,
      });
      await fetchPatients();
      setIsLinkModalOpen(false);
      setLinkingPatient(null);
      setSelectedLinkUserId("");
    } catch (error: any) {
      console.error("Failed to link user:", error);
      alert(error.response?.data?.message || "Failed to link patient user");
    }
  };

  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      MALE: 0,
      FEMALE: 0,
      OTHER: 0,
    };
    patients.forEach((p) => {
      counts[p.gender] = (counts[p.gender] || 0) + 1;
    });
    return counts;
  }, [patients]);

  const bloodTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "A+": 0,
      "A-": 0,
      "B+": 0,
      "B-": 0,
      "AB+": 0,
      "AB-": 0,
      "O+": 0,
      "O-": 0,
      "Unknown": 0,
    };
    patients.forEach((p) => {
      if (p.bloodType && counts[p.bloodType] !== undefined) {
        counts[p.bloodType]++;
      } else if (p.bloodType) {
        counts["Unknown"]++;
      }
    });
    return counts;
  }, [patients]);

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(5,150,105,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Patient Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Patients
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage patient profiles, medical records, and healthcare access.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Patients
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {patients.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Patient profiles in the system
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
                Male Patients
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-blue-700">
                {genderCounts.MALE}
              </div>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <AppIcon name="users" className="h-6 w-6" />
            </div>
          </div>
        </article>
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Female Patients
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-pink-700">
                {genderCounts.FEMALE}
              </div>
            </div>
            <div className="rounded-2xl bg-pink-50 p-3 text-pink-700">
              <AppIcon name="patients" className="h-6 w-6" />
            </div>
          </div>
        </article>
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Other Genders
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-purple-700">
                {genderCounts.OTHER}
              </div>
            </div>
            <div className="rounded-2xl bg-purple-50 p-3 text-purple-700">
              <AppIcon name="users" className="h-6 w-6" />
            </div>
          </div>
        </article>
        <article className="card p-5 transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                With Insurance
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700">
                {patients.filter((p) => p.insuranceNumber).length}
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <AppIcon name="shield" className="h-6 w-6" />
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
                placeholder="Search patients by name, code or ID..."
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
            onClick={isReceptionist ? handleCreateWalkInPatient : handleCreatePatient}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(5,150,105,0.18)] transition hover:bg-emerald-800 hover:shadow-[0_12px_24px_rgba(5,150,105,0.22)] active:scale-[0.98]"
          >
            <AppIcon name="patients" className="h-5 w-5" />
            <span>{isReceptionist ? "Add Walk-in" : "Add Patient"}</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Gender</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
                      <span className="text-sm text-slate-500">
                        Loading patients...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <AppIcon
                          name="patients"
                          className="h-8 w-8 text-slate-400"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">
                          No patients found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery
                            ? "Try adjusting your search criteria."
                            : "Get started by creating your first patient profile."}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          onClick={handleCreatePatient}
                          className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                        >
                          Create Patient
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="group transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
                          {patient.fullName?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {patient.fullName}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            Code: {patient.patientCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <GenderBadge gender={patient.gender} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {patient.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <AppIcon name="menu" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"
                          title="Edit patient"
                        >
                          <AppIcon name="edit" className="h-[14px] w-[14px]" />
                        </button>
                        {isReceptionist && !patient.userId ? (
                          <button
                            onClick={() => handleLinkUser(patient)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                            title="Link user account"
                          >
                            <AppIcon name="users" className="h-4 w-4" />
                          </button>
                        ) : null}
                        {!isReceptionist ? (
                          <button
                            onClick={() => handleDeletePatient(patient.id)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete patient"
                          >
                            <AppIcon name="logout" className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filteredPatients.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredPatients.length} of {patients.length} patients
              </span>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPatient}
        users={users}
        showUserSelect={!isReceptionist}
        title={isReceptionist && !editingPatient ? "Create Walk-in Patient" : undefined}
        description={
          isReceptionist && !editingPatient
            ? "Create a walk-in patient profile without linking a user account."
            : undefined
        }
        submitLabel={isReceptionist && !editingPatient ? "Create Walk-in" : undefined}
      />

      {/* View Modal */}
      <PatientViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        patient={viewingPatient}
      />

      {isLinkModalOpen && linkingPatient ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLinkModalOpen(false)}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Link user account</h3>
              <p className="mt-1 text-sm text-slate-500">
                Link an existing patient user account to {linkingPatient.fullName}.
              </p>
            </div>

            <div className="px-6 py-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                User account
              </label>
              <select
                value={selectedLinkUserId}
                onChange={(e) => setSelectedLinkUserId(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              >
                <option value="">Select patient user</option>
                {users
                  .filter((item) => item.role === "PATIENT" && !item.patientProfile)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.email}
                    </option>
                  ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Only unlinked users with role PATIENT are shown here.
              </p>
            </div>

            <div className="border-t border-slate-100 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkUserSubmit}
                  className="h-10 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  Link user
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
