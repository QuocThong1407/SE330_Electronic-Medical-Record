import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { getDoctors, getUsers } from "../../services/resourceService";
import type { Department } from "../../types/catalog";
import type { DoctorProfile } from "../../types/doctor";
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

type DepartmentBadgeProps = {
  departmentName?: string | null;
};

function DepartmentBadge({ departmentName }: DepartmentBadgeProps) {
  if (!departmentName) {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
        Unassigned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-200">
      <AppIcon name="departments" className="h-3.5 w-3.5" />
      {departmentName}
    </span>
  );
}

type DoctorFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctor: Partial<DoctorAdminCreateRequest>) => void;
  initialData?: Partial<DoctorProfileResponse> | null;
  departments: Department[];
  users: UserSummary[];
};

interface DoctorAdminCreateRequest {
  userId: string;
  fullName: string;
  gender: string;
  departmentId?: string | null;
  phone?: string | null;
  emailContact?: string | null;
  degree?: string | null;
  experienceYears?: number;
  dateOfBirth?: string | null;
}

interface DoctorProfileResponse {
  id: string;
  userId?: string | null;
  departmentId?: string | null;
  employeeCode: string;
  fullName: string;
  gender: string;
  phone?: string | null;
  emailContact?: string | null;
  degree?: string | null;
  experienceYears?: number;
  dateOfBirth?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function DoctorFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  departments,
  users,
}: DoctorFormModalProps) {
  const [formData, setFormData] = useState<DoctorAdminCreateRequest>({
    userId: "",
    fullName: "",
    gender: "MALE",
    departmentId: "",
    phone: "",
    emailContact: "",
    degree: "",
    experienceYears: 0,
    dateOfBirth: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || "",
        fullName: initialData.fullName || "",
        gender: initialData.gender || "MALE",
        departmentId: initialData.departmentId || "",
        phone: initialData.phone || "",
        emailContact: initialData.emailContact || "",
        degree: initialData.degree || "",
        experienceYears: initialData.experienceYears || 0,
        dateOfBirth: initialData.dateOfBirth || "",
      });
    } else {
      setFormData({
        userId: "",
        fullName: "",
        gender: "MALE",
        departmentId: "",
        phone: "",
        emailContact: "",
        degree: "",
        experienceYears: 0,
        dateOfBirth: "",
      });
    }
  }, [initialData, isOpen]);

  // Get users who don't have a doctor profile yet (for new doctor creation)
  const availableUsers = useMemo(() => {
    if (initialData) {
      // For editing, show all users including the current one
      return users;
    }
    // For creating, exclude users who already have a doctor profile
    return users.filter((u) => !u.doctorProfile);
  }, [users, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "experienceYears" ? (value ? parseInt(value) : 0) : value,
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
            {initialData?.id ? "Edit Doctor" : "Create New Doctor"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {initialData?.id
              ? "Update doctor profile details."
              : "Create a new doctor profile with complete information."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] overflow-y-auto px-6 py-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
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
                  ? "User associated with this doctor profile."
                  : "Select an existing user to link to this doctor profile."}
              </p>
            </div>

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
                htmlFor="departmentId"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Department
              </label>
              <div className="relative">
                <select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId || ""}
                  onChange={handleChange}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="degree"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  Degree
                </label>
                <input
                  id="degree"
                  name="degree"
                  type="text"
                  value={formData.degree || ""}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  placeholder="e.g., MD, PhD"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="experienceYears"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  Experience
                </label>
                <input
                  id="experienceYears"
                  name="experienceYears"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.experienceYears || 0}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
                  placeholder="Enter years of experience"
                />
              </div>
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
              {initialData?.id ? "Save Changes" : "Create Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type DoctorViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfileResponse | null;
  departments: Department[];
};

function DoctorViewModal({
  isOpen,
  onClose,
  doctor,
  departments,
}: DoctorViewModalProps) {
  if (!isOpen || !doctor) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const departmentName = useMemo(() => {
    return (
      departments.find((d) => d.id === doctor.departmentId)?.name ||
      "Unassigned"
    );
  }, [departments, doctor.departmentId]);

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
                Doctor Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Complete information for {doctor.fullName}
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
                {doctor.fullName?.[0]?.toUpperCase() || "D"}
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {doctor.fullName}
                </div>
                <div className="mt-1">
                  <GenderBadge gender={doctor.gender} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Doctor ID
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {doctor.id}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Employee Code
                </div>
                <div className="mt-1 font-mono text-sm text-slate-700">
                  {doctor.employeeCode}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Phone
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {doctor.phone || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {doctor.emailContact || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Department
                </div>
                <div className="mt-1">
                  <DepartmentBadge departmentName={departmentName} />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Experience
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {doctor.experienceYears} years
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Degree
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {doctor.degree || "-"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Created
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {formatDate(doctor.createdAt)}
                </div>
              </div>
            </div>
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

export function DoctorsPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfileResponse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] =
    useState<DoctorProfileResponse | null>(null);
  const [viewingDoctor, setViewingDoctor] =
    useState<DoctorProfileResponse | null>(null);

  const fetchDoctors = async () => {
    try {
      const [doctorsData, departmentsData, usersData] = await Promise.all([
        getDoctors(),
        api.get("/departments").then((res) => res.data.data),
        getUsers(),
      ]);
      setDoctors(doctorsData);
      setDepartments(departmentsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    let result = doctors.filter((d) => {
      const matchesSearch =
        d.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id?.toLowerCase().includes(searchQuery.toLowerCase());
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
  }, [doctors, searchQuery, sortBy]);

  const handleCreateDoctor = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const handleEditDoctor = (doctor: DoctorProfileResponse) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleViewDoctor = (doctor: DoctorProfileResponse) => {
    setViewingDoctor(doctor);
    setIsViewModalOpen(true);
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (
      !window.confirm("Are you sure you want to delete this doctor profile?")
    ) {
      return;
    }
    try {
      await api.delete(`/doctors/${doctorId}`);
      setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (error: any) {
      console.error("Failed to delete doctor:", error);
      alert(error.response?.data?.message || "Failed to delete doctor");
    }
  };

  const handleFormSubmit = async (
    doctorData: Partial<DoctorAdminCreateRequest>,
  ) => {
    try {
      if (editingDoctor?.id) {
        // Update existing doctor
        await api.put(`/doctors/${editingDoctor.id}`, {
          userId: doctorData.userId,
          fullName: doctorData.fullName,
          gender: doctorData.gender,
          departmentId: doctorData.departmentId || null,
          phone: doctorData.phone || null,
          emailContact: doctorData.emailContact || null,
          degree: doctorData.degree || null,
          experienceYears: doctorData.experienceYears || 0,
          dateOfBirth: doctorData.dateOfBirth || null,
        });
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === editingDoctor.id ? { ...d, ...doctorData } : d,
          ),
        );
      } else {
        // Create new doctor
        await api.post("/doctors/admin", {
          userId: doctorData.userId,
          fullName: doctorData.fullName,
          gender: doctorData.gender,
          departmentId: doctorData.departmentId || null,
          phone: doctorData.phone || null,
          emailContact: doctorData.emailContact || null,
          degree: doctorData.degree || null,
          experienceYears: doctorData.experienceYears || 0,
          dateOfBirth: doctorData.dateOfBirth || null,
        });
        const newDoctor: DoctorProfileResponse = {
          id: "",
          employeeCode: "",
          fullName: doctorData.fullName || "",
          gender: doctorData.gender || "MALE",
          userId: doctorData.userId || null,
          departmentId: doctorData.departmentId || null,
          phone: doctorData.phone || null,
          emailContact: doctorData.emailContact || null,
          degree: doctorData.degree || null,
          experienceYears: doctorData.experienceYears || 0,
          dateOfBirth: doctorData.dateOfBirth || null,
          createdAt: new Date().toISOString(),
        };
        setDoctors((prev) => [...prev, newDoctor]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save doctor:", error);
      alert(error.response?.data?.message || "Failed to save doctor");
    }
  };

  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      MALE: 0,
      FEMALE: 0,
      OTHER: 0,
    };
    doctors.forEach((d) => {
      counts[d.gender] = (counts[d.gender] || 0) + 1;
    });
    return counts;
  }, [doctors]);

  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    doctors.forEach((d) => {
      const deptName =
        departments.find((dept) => dept.id === d.departmentId)?.name ||
        "Unassigned";
      counts[deptName] = (counts[deptName] || 0) + 1;
    });
    return counts;
  }, [doctors, departments]);

  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="card overflow-hidden border-slate-200">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.10),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700">
                Doctor Management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Doctors
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage doctor profiles, departments, and clinical operations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Total Doctors
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {doctors.length}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Doctor profiles in the system
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
                Male Doctors
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
                Female Doctors
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
                Departments
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-indigo-700">
                {Object.keys(departmentCounts).length}
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
                placeholder="Search doctors by name, code or ID..."
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
            onClick={handleCreateDoctor}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(79,70,229,0.18)] transition hover:bg-indigo-800 hover:shadow-[0_12px_24px_rgba(79,70,229,0.22)] active:scale-[0.98]"
          >
            <AppIcon name="doctors" className="h-5 w-5" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Doctor</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold">Gender</th>
                <th className="px-6 py-4 font-semibold">Created</th>
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
                        Loading doctors...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <AppIcon
                          name="doctors"
                          className="h-8 w-8 text-slate-400"
                        />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-slate-900">
                          No doctors found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {searchQuery
                            ? "Try adjusting your search criteria."
                            : "Get started by creating your first doctor profile."}
                        </p>
                      </div>
                      {!searchQuery && (
                        <button
                          onClick={handleCreateDoctor}
                          className="mt-4 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
                        >
                          Create Doctor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="group transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                          {doctor.fullName?.[0]?.toUpperCase() || "D"}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">
                            {doctor.fullName}
                          </div>
                          <div className="truncate text-xs text-slate-500">
                            Code: {doctor.employeeCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DepartmentBadge
                        departmentName={
                          departments.find((d) => d.id === doctor.departmentId)
                            ?.name || null
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <GenderBadge gender={doctor.gender} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {doctor.createdAt
                        ? new Date(doctor.createdAt).toLocaleDateString(
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
                          onClick={() => handleViewDoctor(doctor)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View details"
                        >
                          <AppIcon name="menu" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                          title="Edit doctor"
                        >
                          <AppIcon name="profile" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete doctor"
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
        {!loading && filteredDoctors.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </span>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDoctor}
        departments={departments}
        users={users}
      />

      {/* View Modal */}
      <DoctorViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        doctor={viewingDoctor}
        departments={departments}
      />
    </section>
  );
}
