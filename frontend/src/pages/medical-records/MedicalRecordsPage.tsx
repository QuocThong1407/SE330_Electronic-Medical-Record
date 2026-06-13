import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "../../components/AppIcon";
import {
  archiveMedicalRecord,
  completeMedicalRecord,
  getDiagnoses,
  getMedicalRecordById,
  getMedicalRecords,
  getVitalSigns,
  searchPrescriptions,
  setMedicalRecordConfidential,
} from "../../services/clinicalService";
import {
  getDepartments,
  getDoctors,
  getPatients,
} from "../../services/resourceService";
import type { Department } from "../../types/catalog";
import type { DoctorProfile } from "../../types/doctor";
import type { PatientProfile } from "../../types/patient";
import type {
  Diagnosis,
  MedicalRecord,
  PrescriptionSummary,
  VitalSigns,
} from "../../types/clinical";

type FilterState = {
  doctorId: string;
  patientId: string;
  status: string;
  fromDate: string;
  toDate: string;
};

type RecordDetail = {
  record: MedicalRecord;
  vitalSigns: VitalSigns | null;
  diagnoses: Diagnosis[];
  prescriptions: PrescriptionSummary[];
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function MedicalRecordsPage() {
  const [filters, setFilters] = useState<FilterState>({
    doctorId: "",
    patientId: "",
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [detail, setDetail] = useState<RecordDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const doctorMap = useMemo(
    () => new Map(doctors.map((item) => [item.id, item.fullName])),
    [doctors],
  );
  const patientMap = useMemo(
    () => new Map(patients.map((item) => [item.id, item.fullName])),
    [patients],
  );
  const departmentMap = useMemo(
    () => new Map(departments.map((item) => [item.id, item.name])),
    [departments],
  );

  const selectedRecord = useMemo(
    () => records.find((item) => item.id === selectedId) ?? null,
    [records, selectedId],
  );

  useEffect(() => {
    let active = true;

    const loadStatic = async () => {
      try {
        const [doctorList, patientList, departmentList] = await Promise.all([
          getDoctors().catch(() => []),
          getPatients().catch(() => []),
          getDepartments().catch(() => []),
        ]);

        if (!active) return;

        setDoctors(doctorList);
        setPatients(patientList);
        setDepartments(departmentList);
      } catch (loadError) {
        console.error(loadError);
      }
    };

    void loadStatic();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMedicalRecords({
          doctorId: appliedFilters.doctorId || undefined,
          patientId: appliedFilters.patientId || undefined,
          status: (appliedFilters.status as any) || undefined,
          fromDate: appliedFilters.fromDate || undefined,
          toDate: appliedFilters.toDate || undefined,
          page: 0,
          size: 200,
        });

        if (!active) return;

        setRecords(data);
        if (!selectedId && data.length > 0) {
          setSelectedId(data[0].id);
        }
        if (selectedId && !data.some((item) => item.id === selectedId)) {
          setSelectedId(data[0]?.id ?? null);
        }
      } catch (loadError: any) {
        console.error(loadError);
        if (active)
          setError(
            loadError?.response?.data?.message ||
              "Could not load medical records.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadRecords();

    return () => {
      active = false;
    };
  }, [appliedFilters, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    let active = true;

    const loadDetail = async () => {
      setDetailLoading(true);
      try {
        const record = await getMedicalRecordById(selectedId);
        const [vitalSigns, diagnoses, prescriptions] = await Promise.all([
          getVitalSigns(selectedId).catch(() => null),
          getDiagnoses(selectedId).catch(() => []),
          searchPrescriptions({
            medicalRecordId: selectedId,
            page: 0,
            size: 20,
          }).catch(() => []),
        ]);

        if (!active) return;

        setDetail({
          record,
          vitalSigns,
          diagnoses,
          prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
        });
      } catch (loadError) {
        console.error(loadError);
        if (active) setDetail(null);
      } finally {
        if (active) setDetailLoading(false);
      }
    };

    void loadDetail();

    return () => {
      active = false;
    };
  }, [selectedId]);

  const applyFilters = () => setAppliedFilters(filters);

  const reload = () => setAppliedFilters({ ...appliedFilters });

  const updateSelectedRecord = async (
    updater: () => Promise<MedicalRecord>,
  ) => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const updated = await updater();
      setRecords((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setDetail((prev) => (prev ? { ...prev, record: updated } : prev));
    } catch (actionError: any) {
      console.error(actionError);
      alert(
        actionError?.response?.data?.message ||
          actionError?.message ||
          "Action failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
              Admin workspace
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Medical Records
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Browse all medical records, filter by doctor, patient, date, and
              manage status safely.
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <AppIcon name="refresh" className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-5">
            <select
              value={filters.doctorId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, doctorId: e.target.value }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            >
              <option value="">All doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.fullName}
                </option>
              ))}
            </select>
            <select
              value={filters.patientId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, patientId: e.target.value }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            >
              <option value="">All patients</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, toDate: e.target.value }))
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none"
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() =>
                setFilters({
                  doctorId: "",
                  patientId: "",
                  status: "",
                  fromDate: "",
                  toDate: "",
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 text-sm text-slate-500">
            {loading ? "Loading..." : `${records.length} records`}
          </div>
          {error ? (
            <div className="px-5 py-4 text-sm text-red-600">{error}</div>
          ) : null}
          <div className="max-h-[42rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Record No</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Visit</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => {
                  const isActive = record.id === selectedId;
                  return (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedId(record.id)}
                      className={`cursor-pointer transition ${isActive ? "bg-brand-50" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {record.recordNo}
                        </div>
                        <div className="text-xs text-slate-500">
                          {record.id}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {patientMap.get(record.patientId) || record.patientId}
                      </td>
                      <td className="px-5 py-4">
                        {doctorMap.get(record.doctorId) || record.doctorId}
                      </td>
                      <td className="px-5 py-4">
                        {formatDateTime(record.visitDate)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Record detail
                </h3>
                <p className="text-sm text-slate-500">
                  View and manage the selected record.
                </p>
              </div>
              {detailLoading ? (
                <div className="text-xs text-slate-400">Loading...</div>
              ) : null}
            </div>

            {detail ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Visit
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {formatDateTime(detail.record.visitDate)}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Complaint
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {detail.record.chiefComplaint || "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Assessment
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {detail.record.assessment || "-"}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {detail.record.status}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Confidential
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {detail.record.isConfidential ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Vital signs
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    {detail.vitalSigns
                      ? `T: ${detail.vitalSigns.temperature ?? "-"} | HR: ${detail.vitalSigns.heartRate ?? "-"} | BP: ${detail.vitalSigns.bloodPressure ?? "-"} | BMI: ${detail.vitalSigns.bmi ?? "-"}`
                      : "No vital signs"}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Diagnoses
                  </div>
                  <div className="mt-2 space-y-2">
                    {detail.diagnoses.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No diagnoses.
                      </div>
                    ) : (
                      detail.diagnoses.map((diag, index) => (
                        <div
                          key={`${diag.icdCodeId || "custom"}-${index}`}
                          className="rounded-lg bg-white px-3 py-2 text-sm"
                        >
                          <div className="font-semibold text-slate-900">
                            {diag.icdCodeId || diag.customDiagnosis || "Custom"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {diag.diagnosisType}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Prescriptions
                  </div>
                  <div className="mt-2 space-y-2">
                    {detail.prescriptions.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        No prescriptions.
                      </div>
                    ) : (
                      detail.prescriptions.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg bg-white px-3 py-2 text-sm"
                        >
                          <div className="font-semibold text-slate-900">
                            {item.prescriptionNo}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDateTime(item.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedRecord(async () => {
                        if (!detail) throw new Error("No record");
                        return completeMedicalRecord(detail.record.id);
                      })
                    }
                    disabled={saving || detail.record.status !== "DRAFT"}
                    className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedRecord(async () => {
                        if (!detail) throw new Error("No record");
                        return archiveMedicalRecord(detail.record.id);
                      })
                    }
                    disabled={saving || detail.record.status === "ARCHIVED"}
                    className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedRecord(async () => {
                        if (!detail) throw new Error("No record");
                        return setMedicalRecordConfidential(
                          detail.record.id,
                          !detail.record.isConfidential,
                        );
                      })
                    }
                    disabled={saving}
                    className="sm:col-span-2 h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Toggle confidentiality
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Select a medical record to inspect its detail.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Department coverage
            </div>
            <div className="mt-3 space-y-2">
              {Array.from(departmentMap.entries())
                .slice(0, 6)
                .map(([id, name]) => (
                  <div
                    key={id}
                    className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {name}
                  </div>
                ))}
              {departmentMap.size === 0 ? (
                <div className="text-sm text-slate-500">
                  No departments loaded.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
