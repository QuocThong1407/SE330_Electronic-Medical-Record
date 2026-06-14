import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppIcon } from "../../components/AppIcon";
import { useAuth } from "../../contexts/AuthContext";
import { completeAppointment, getAppointmentById } from "../../services/appointmentService";
import { getMyDoctorProfile } from "../../services/profileService";
import {
  addDiagnosis,
  completeMedicalRecord,
  createMedicalRecord,
  createPrescription,
  createVitalSigns,
  deleteDiagnosis,
  getDiagnoses,
  getMedicalRecordById,
  getMedicalRecords,
  getPrescriptionItems,
  getVitalSigns,
  searchIcdCodes,
  searchPrescriptions,
  updateMedicalRecord,
  updateVitalSigns,
} from "../../services/clinicalService";
import { getMedicines } from "../../services/resourceService";
import type { Appointment } from "../../types/appointment";
import type { DoctorProfile } from "../../types/doctor";
import type { Medicine, MedicineUnit } from "../../types/medicine";
import type { DiagnosisType, IcdCode, MedicalRecord, PrescriptionItem, PrescriptionSummary } from "../../types/clinical";

type TabKey = "clinical" | "prescription" | "history";

type ClinicalFormState = {
  visitDate: string;
  chiefComplaint: string;
  presentIllness: string;
  assessment: string;
  treatmentPlan: string;
};

type VitalFormState = {
  temperature: string;
  heartRate: string;
  bloodPressure: string;
  height: string;
  weight: string;
};

type DiagnosisDraft = {
  key: string;
  icdCodeId: string;
  icdLabel: string;
  diagnosisType: DiagnosisType;
  notes: string;
};

type PrescriptionDraftItem = {
  key: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: PrescriptionItem["frequency"];
  durationDays: string;
  quantity: string;
  unit: MedicineUnit | "";
  route: string;
  instructions: string;
  notes: string;
  stockQuantity: number;
};

function toLocalDateTimeInput(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function toLocalDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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

const diagnosisTypeLabels: Record<DiagnosisType, string> = {
  PRIMARY: "Primary",
  SECONDARY: "Secondary",
  PROVISIONAL: "Provisional",
  RULE_OUT: "Rule out",
};

const frequencyLabels: Record<NonNullable<PrescriptionItem["frequency"]>, string> = {
  ONCE_DAILY: "Once daily",
  TWICE_DAILY: "Twice daily",
  THREE_TIMES_DAILY: "Three times daily",
  EVERY_8_HOURS: "Every 8 hours",
  EVERY_12_HOURS: "Every 12 hours",
  AS_NEEDED: "As needed",
};

function unitLabel(value: MedicineUnit) {
  switch (value) {
    case "TABLET":
      return "Tablet";
    case "CAPSULE":
      return "Capsule";
    case "SYRUP":
      return "Syrup";
    case "ML":
      return "ml";
    case "MG":
      return "mg";
    case "VIAL":
      return "Vial";
    case "TUBE":
      return "Tube";
    case "PACK":
      return "Pack";
    case "BOX":
      return "Box";
    default:
      return value;
  }
}

export function MedicalRecordBoardPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role ?? "DOCTOR";
  const isReadOnly = role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("clinical");
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [vitalSignsId, setVitalSignsId] = useState<string | null>(null);
  const [diagnoses, setDiagnoses] = useState<DiagnosisDraft[]>([]);
  const persistedDiagnosisKeysRef = useRef<Set<string>>(new Set());

  const [clinicalForm, setClinicalForm] = useState<ClinicalFormState>({
    visitDate: "",
    chiefComplaint: "",
    presentIllness: "",
    assessment: "",
    treatmentPlan: "",
  });
  const [vitalForm, setVitalForm] = useState<VitalFormState>({
    temperature: "",
    heartRate: "",
    bloodPressure: "",
    height: "",
    weight: "",
  });
  const [icdQuery, setIcdQuery] = useState("");
  const [icdResults, setIcdResults] = useState<IcdCode[]>([]);
  const [medicineCatalog, setMedicineCatalog] = useState<Medicine[]>([]);
  const [medicineQuery, setMedicineQuery] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [prescriptionDraftItems, setPrescriptionDraftItems] = useState<PrescriptionDraftItem[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [prescriptionHistory, setPrescriptionHistory] = useState<PrescriptionSummary[]>([]);
  const [historyRecords, setHistoryRecords] = useState<MedicalRecord[]>([]);
  const [prescriptionDetailOpen, setPrescriptionDetailOpen] = useState(false);
  const [prescriptionDetailLoading, setPrescriptionDetailLoading] = useState(false);
  const [prescriptionDetailError, setPrescriptionDetailError] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionSummary | null>(null);
  const [selectedPrescriptionItems, setSelectedPrescriptionItems] = useState<PrescriptionItem[]>([]);

  const bmi = useMemo(() => {
    const heightCm = Number(vitalForm.height);
    const weightKg = Number(vitalForm.weight);
    if (!heightCm || !weightKg) return "";
    const result = weightKg / Math.pow(heightCm / 100, 2);
    return Number.isFinite(result) ? result.toFixed(1) : "";
  }, [vitalForm.height, vitalForm.weight]);

  useEffect(() => {
    if (!appointmentId) {
      setError("Missing appointment id.");
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [appointmentData, medicines, profile] = await Promise.all([
          getAppointmentById(appointmentId),
          getMedicines().catch(() => []),
          role === "DOCTOR" ? getMyDoctorProfile().catch(() => null) : Promise.resolve(null),
        ]);

        if (!active) return;

        setAppointment(appointmentData);
        setMedicineCatalog(medicines);
        setDoctorProfile(profile);
        setClinicalForm({
          visitDate: toLocalDateTimeInput(appointmentData.appointmentTime),
          chiefComplaint: appointmentData.reason || "",
          presentIllness: "",
          assessment: "",
          treatmentPlan: "",
        });

        const records = await getMedicalRecords({
          patientId: appointmentData.patient.id,
          doctorId: appointmentData.doctor.id,
          page: 0,
          size: 50,
        }).catch(() => []);

        if (!active) return;

        const orderedRecords = [...records].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
        setHistoryRecords(orderedRecords.filter((record) => record.appointmentId !== appointmentData.id));

        const currentRecord =
          orderedRecords.find((record) => record.appointmentId === appointmentData.id) ??
          orderedRecords.find((record) => toLocalDate(record.visitDate) === toLocalDate(appointmentData.appointmentTime));

        if (!currentRecord) {
          setMedicalRecord(null);
          setVitalSignsId(null);
          setDiagnoses([]);
          persistedDiagnosisKeysRef.current.clear();
          setPrescriptionHistory([]);
          return;
        }

        const recordDetail = await getMedicalRecordById(currentRecord.id).catch(() => currentRecord);

        if (!active) return;

        setMedicalRecord(recordDetail);
        setClinicalForm({
          visitDate: toLocalDateTimeInput(recordDetail.visitDate),
          chiefComplaint: recordDetail.chiefComplaint || "",
          presentIllness: recordDetail.presentIllness || "",
          assessment: recordDetail.assessment || "",
          treatmentPlan: recordDetail.treatmentPlan || "",
        });

        const [vitalData, diagnosisData, prescriptionData] = await Promise.all([
          getVitalSigns(recordDetail.id).catch(() => null),
          getDiagnoses(recordDetail.id).catch(() => []),
          searchPrescriptions({ medicalRecordId: recordDetail.id, page: 0, size: 20 }).catch(() => []),
        ]);

        if (!active) return;

        if (vitalData) {
          setVitalSignsId(vitalData.id);
          setVitalForm({
            temperature: vitalData.temperature?.toString() || "",
            heartRate: vitalData.heartRate?.toString() || "",
            bloodPressure: vitalData.bloodPressure?.toString() || "",
            height: vitalData.height?.toString() || "",
            weight: vitalData.weight?.toString() || "",
          });
        }

        const mappedDiagnoses = diagnosisData.map((item) => ({
          key: `${item.icdCodeId || "custom"}-${item.diagnosisType}-${item.notes || ""}`,
          icdCodeId: item.icdCodeId || "",
          icdLabel: item.icdCodeId ? item.icdCodeId : item.customDiagnosis || "Custom diagnosis",
          diagnosisType: item.diagnosisType,
          notes: item.notes || "",
        }));
        setDiagnoses(mappedDiagnoses);
        persistedDiagnosisKeysRef.current.clear();
        mappedDiagnoses.forEach((item) => persistedDiagnosisKeysRef.current.add(item.key));
        setPrescriptionHistory(prescriptionData);
      } catch (loadError) {
        console.error("Failed to load medical board:", loadError);
        if (active) setError("Could not load the medical record board.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [appointmentId, role]);

  useEffect(() => {
    let active = true;
    const keyword = icdQuery.trim();

    const timer = window.setTimeout(async () => {
      const results = await searchIcdCodes(keyword || undefined).catch(() => []);
      if (active) setIcdResults(results);
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [icdQuery]);

  const filteredMedicines = useMemo(() => {
    const keyword = medicineQuery.trim().toLowerCase();
    if (!keyword) return medicineCatalog;
    return medicineCatalog.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.categoryName?.toLowerCase().includes(keyword)
    );
  }, [medicineCatalog, medicineQuery]);

  const isLocked = Boolean(medicalRecord && medicalRecord.status !== "DRAFT");
  const canEditBoard = !isReadOnly && !isLocked;

  const updateClinical = (field: keyof ClinicalFormState, value: string) =>
    setClinicalForm((prev) => ({ ...prev, [field]: value }));

  const updateVital = (field: keyof VitalFormState, value: string) =>
    setVitalForm((prev) => ({ ...prev, [field]: value }));

  const addDiagnosisFromIcd = (icd: IcdCode) => {
    setDiagnoses((prev) => {
      if (prev.some((item) => item.icdCodeId === icd.id)) return prev;
      return [
        {
          key: `${icd.id}-${Date.now()}`,
          icdCodeId: icd.id,
          icdLabel: `${icd.id} - ${icd.name}`,
          diagnosisType: "PRIMARY",
          notes: "",
        },
        ...prev,
      ];
    });
  };

  const addMedicine = () => {
    if (!selectedMedicineId) {
      alert("Please select a medicine first.");
      return;
    }

    const medicine = medicineCatalog.find((item) => item.id === selectedMedicineId);
    if (!medicine) {
      alert("Selected medicine is not available.");
      return;
    }

    setPrescriptionDraftItems((prev) => [
      {
        key: `${medicine.id}-${Date.now()}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: `1 ${medicine.unit.toLowerCase()}`,
        frequency: "TWICE_DAILY",
        durationDays: "5",
        quantity: "10",
        unit: medicine.unit,
        route: "oral",
        instructions: "",
        notes: "",
        stockQuantity: medicine.stockQuantity,
      },
      ...prev,
    ]);
    setSelectedMedicineId("");
  };

  const updatePrescriptionItem = (key: string, field: keyof PrescriptionDraftItem, value: string) => {
    setPrescriptionDraftItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const removePrescriptionItem = (key: string) => {
    setPrescriptionDraftItems((prev) => prev.filter((item) => item.key !== key));
  };

  const closePrescriptionDetailModal = () => {
    setPrescriptionDetailOpen(false);
    setSelectedPrescription(null);
    setSelectedPrescriptionItems([]);
    setPrescriptionDetailError(null);
    setPrescriptionDetailLoading(false);
  };

  const ensureMedicalRecord = async () => {
    if (!appointment) throw new Error("Appointment not loaded");

    const payload = {
      appointmentId: appointment.id,
      patientId: appointment.patient.id,
      doctorId: appointment.doctor.id,
      departmentId: appointment.department.id,
      visitDate: clinicalForm.visitDate || toLocalDateTimeInput(appointment.appointmentTime),
      chiefComplaint: clinicalForm.chiefComplaint || appointment.reason || "Consultation",
      presentIllness: clinicalForm.presentIllness || "",
      assessment: clinicalForm.assessment || "",
      treatmentPlan: clinicalForm.treatmentPlan || "",
      isConfidential: false,
    };

    if (!medicalRecord) {
      const created = await createMedicalRecord(payload);
      setMedicalRecord(created);
      return created;
    }

    const updated = await updateMedicalRecord(medicalRecord.id, {
      visitDate: payload.visitDate,
      chiefComplaint: payload.chiefComplaint,
      presentIllness: payload.presentIllness,
      assessment: payload.assessment,
      treatmentPlan: payload.treatmentPlan,
    });
    setMedicalRecord(updated);
    return updated;
  };

  const persistVitals = async (recordId: string) => {
    const payload = {
      temperature: vitalForm.temperature ? Number(vitalForm.temperature) : null,
      heartRate: vitalForm.heartRate ? Number(vitalForm.heartRate) : null,
      bloodPressure: vitalForm.bloodPressure ? Number(vitalForm.bloodPressure) : null,
      height: vitalForm.height ? Number(vitalForm.height) : null,
      weight: vitalForm.weight ? Number(vitalForm.weight) : null,
      bmi: bmi ? Number(bmi) : null,
    };

    const hasValue =
      payload.temperature !== null ||
      payload.heartRate !== null ||
      payload.bloodPressure !== null ||
      payload.height !== null ||
      payload.weight !== null;

    if (!hasValue) return;

    if (vitalSignsId) {
      const updated = await updateVitalSigns(recordId, payload);
      setVitalSignsId(updated.id);
    } else {
      const created = await createVitalSigns(recordId, payload);
      setVitalSignsId(created.id);
    }
  };

  const persistDiagnoses = async (recordId: string) => {
    const nextKeys = new Set(diagnoses.map((item) => item.key));
    const persistedKeys = persistedDiagnosisKeysRef.current;

    for (const row of diagnoses) {
      if (!persistedKeys.has(row.key)) {
        await addDiagnosis(recordId, {
          icdCodeId: row.icdCodeId || null,
          customDiagnosis: row.icdCodeId ? null : row.icdLabel,
          diagnosisType: row.diagnosisType,
          notes: row.notes || null,
        });
      }
    }

    for (const key of Array.from(persistedKeys)) {
      if (!nextKeys.has(key)) {
        const icdCodeId = key.split("-")[0];
        if (icdCodeId && icdCodeId !== "custom") {
          await deleteDiagnosis(recordId, icdCodeId);
        }
      }
    }

    persistedKeys.clear();
    nextKeys.forEach((key) => persistedKeys.add(key));
  };

  const saveBoard = async () => {
    if (!canEditBoard || !appointment) return;
    setSaving(true);
    try {
      const record = await ensureMedicalRecord();
      await persistVitals(record.id);
      await persistDiagnoses(record.id);
      const latest = await getMedicalRecordById(record.id);
      setMedicalRecord(latest);
      alert("Saved.");
    } catch (saveError: any) {
      console.error(saveError);
      alert(saveError?.response?.data?.message || saveError?.message || "Could not save record.");
    } finally {
      setSaving(false);
    }
  };

  const createPrescriptionFromDraft = async () => {
    if (!canEditBoard || !appointment) return;
    if (prescriptionDraftItems.length === 0) {
      alert("Please add at least one medicine.");
      return;
    }

    setSaving(true);
    try {
      const record = await ensureMedicalRecord();
      const created = await createPrescription({
        medicalRecordId: record.id,
        patientId: appointment.patient.id,
        doctorId: appointment.doctor.id,
        prescribedDate: toLocalDate(new Date()),
        notes: prescriptionNotes || null,
        items: prescriptionDraftItems.map((item) => ({
          medicineId: item.medicineId || null,
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          durationDays: item.durationDays ? Number(item.durationDays) : null,
          quantity: Number(item.quantity),
          unit: item.unit || null,
          route: item.route || null,
          instructions: item.instructions || null,
          notes: item.notes || null,
        })),
      });
      setPrescriptionHistory((prev) => [created, ...prev]);
      setPrescriptionDraftItems([]);
      setPrescriptionNotes("");
      setActiveTab("history");
      alert("Prescription created.");
    } catch (createError: any) {
      console.error(createError);
      alert(createError?.response?.data?.message || createError?.message || "Could not create prescription.");
    } finally {
      setSaving(false);
    }
  };

  const completeBoard = async () => {
    if (!canEditBoard || !appointment) return;

    const confirmed = window.confirm("Complete the record and lock this appointment?");
    if (!confirmed) return;

    setSaving(true);
    try {
      const record = await ensureMedicalRecord();
      await persistVitals(record.id);
      await persistDiagnoses(record.id);
      const completedRecord = await completeMedicalRecord(record.id);
      setMedicalRecord(completedRecord);
      await completeAppointment(appointment.id).catch(() => null);
      navigate("/doctor-workspace");
    } catch (completeError: any) {
      console.error(completeError);
      alert(completeError?.response?.data?.message || completeError?.message || "Could not complete record.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-100" />
          <div className="h-4 w-80 rounded bg-slate-100" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-44 rounded-2xl bg-slate-100" />
            <div className="h-44 rounded-2xl bg-slate-100 lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <div className="font-semibold">Could not open the board</div>
        <div className="mt-1 text-sm">{error || "Missing appointment data."}</div>
        <button
          type="button"
          onClick={() => navigate("/doctor-workspace")}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200"
        >
          Back to queue
        </button>
      </div>
    );
  }

  const currentDoctorName = doctorProfile?.fullName || appointment.doctor.fullName;
  const currentDoctorBadge = doctorProfile?.degree || appointment.doctor.departmentName || "Doctor";

  const renderClinicalTab = () => (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Clinical Examination</h3>
              <p className="text-sm text-slate-500">Write symptoms, assessment and plan.</p>
            </div>
            <button
              type="button"
              onClick={() => setClinicalForm((prev) => ({ ...prev, visitDate: toLocalDateTimeInput(new Date()) }))}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <AppIcon name="clock" className="h-4 w-4" />
              Use now
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Visit time</span>
              <input
                type="datetime-local"
                value={clinicalForm.visitDate}
                onChange={(e) => updateClinical("visitDate", e.target.value)}
                disabled={!canEditBoard}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chief complaint</span>
              <input
                value={clinicalForm.chiefComplaint}
                onChange={(e) => updateClinical("chiefComplaint", e.target.value)}
                disabled={!canEditBoard}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Present illness</span>
              <textarea
                rows={4}
                value={clinicalForm.presentIllness}
                onChange={(e) => updateClinical("presentIllness", e.target.value)}
                disabled={!canEditBoard}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assessment</span>
              <textarea
                rows={4}
                value={clinicalForm.assessment}
                onChange={(e) => updateClinical("assessment", e.target.value)}
                disabled={!canEditBoard}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Treatment plan</span>
              <textarea
                rows={4}
                value={clinicalForm.treatmentPlan}
                onChange={(e) => updateClinical("treatmentPlan", e.target.value)}
                disabled={!canEditBoard}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Diagnoses</h3>
            <p className="text-sm text-slate-500">Search ICD codes and add them to the current record.</p>
          </div>

          {canEditBoard ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
              <input
                value={icdQuery}
                onChange={(e) => setIcdQuery(e.target.value)}
                placeholder="Search ICD code..."
                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setIcdQuery((prev) => prev.trim())}
                className="h-11 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
              >
                Search
              </button>
            </div>
          ) : null}

          {canEditBoard && icdResults.length > 0 ? (
            <div className="mt-3 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <div className="grid gap-2">
              {icdResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addDiagnosisFromIcd(item)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-100"
                >
                  <div className="font-semibold text-slate-900">
                    {item.id} - {item.name}
                  </div>
                  <div className="text-xs text-slate-500">{item.category || "ICD"}</div>
                </button>
              ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-3">
            {diagnoses.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No diagnosis added yet.</div>
            ) : (
              diagnoses.map((item, index) => (
                <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.icdLabel}</div>
                      <div className="mt-1 text-xs text-slate-500">{diagnosisTypeLabels[item.diagnosisType]}</div>
                    </div>
                    {canEditBoard ? (
                      <button
                        type="button"
                        onClick={() => setDiagnoses((prev) => prev.filter((row) => row.key !== item.key))}
                        className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Type</span>
                      <select
                        value={item.diagnosisType}
                        onChange={(e) =>
                          setDiagnoses((prev) =>
                            prev.map((row) => (row.key === item.key ? { ...row, diagnosisType: e.target.value as DiagnosisType } : row))
                          )
                        }
                        disabled={!canEditBoard}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        {Object.entries(diagnosisTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</span>
                      <input
                        value={item.notes}
                        onChange={(e) =>
                          setDiagnoses((prev) =>
                            prev.map((row) => (row.key === item.key ? { ...row, notes: e.target.value } : row))
                          )
                        }
                        disabled={!canEditBoard}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                    </label>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">#{index + 1}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Vital signs</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Temperature</span>
              <input
                value={vitalForm.temperature}
                onChange={(e) => updateVital("temperature", e.target.value)}
                disabled={!canEditBoard}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Heart rate</span>
              <input
                value={vitalForm.heartRate}
                onChange={(e) => updateVital("heartRate", e.target.value)}
                disabled={!canEditBoard}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Blood pressure</span>
              <input
                value={vitalForm.bloodPressure}
                onChange={(e) => updateVital("bloodPressure", e.target.value)}
                disabled={!canEditBoard}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Height (cm)</span>
              <input
                value={vitalForm.height}
                onChange={(e) => updateVital("height", e.target.value)}
                disabled={!canEditBoard}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Weight (kg)</span>
              <input
                value={vitalForm.weight}
                onChange={(e) => updateVital("weight", e.target.value)}
                disabled={!canEditBoard}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>
            <div className="rounded-xl bg-brand-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">BMI</div>
              <div className="mt-1 text-lg font-semibold text-brand-900">{bmi || "-"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Appointment info</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Appointment No</div>
              <div className="mt-1 font-semibold text-slate-900">{appointment.appointmentNo}</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Time</div>
              <div className="mt-1 font-semibold text-slate-900">{formatDateTime(appointment.appointmentTime)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Doctor</div>
              <div className="mt-1 font-semibold text-slate-900">{currentDoctorName}</div>
              <div className="text-sm text-slate-500">{currentDoctorBadge}</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Record status</div>
              <div className="mt-1 font-semibold text-slate-900">{medicalRecord?.status || "DRAFT"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrescriptionTab = () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Prescription</h3>
          <p className="text-sm text-slate-500">Search medicines and create a prescription draft.</p>
        </div>
        {canEditBoard ? (
          <button
            type="button"
            onClick={createPrescriptionFromDraft}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <AppIcon name="plus" className="h-4 w-4" />
            Create prescription
          </button>
        ) : null}
      </div>

      {canEditBoard ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <input
            value={medicineQuery}
            onChange={(e) => setMedicineQuery(e.target.value)}
            placeholder="Search by name, code or category..."
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />
          <select
            value={selectedMedicineId}
            onChange={(e) => setSelectedMedicineId(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
          >
            <option value="">Select medicine</option>
            {filteredMedicines.slice(0, 50).map((medicine) => (
              <option key={medicine.id} value={medicine.id}>
                {medicine.code} - {medicine.name} ({medicine.stockQuantity})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addMedicine}
            className="h-11 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Add medicine
          </button>
        </div>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Medicine</th>
              <th className="px-4 py-3 font-semibold">Dosage</th>
              <th className="px-4 py-3 font-semibold">Frequency</th>
              <th className="px-4 py-3 font-semibold">Days</th>
              <th className="px-4 py-3 font-semibold">Qty</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Instructions</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {prescriptionDraftItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No medicine added yet.
                </td>
              </tr>
            ) : (
              prescriptionDraftItems.map((item) => (
                <tr key={item.key}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{item.medicineName}</div>
                    <div className="text-xs text-slate-500">Stock: {item.stockQuantity}</div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={item.dosage}
                      onChange={(e) => updatePrescriptionItem(item.key, "dosage", e.target.value)}
                      disabled={!canEditBoard}
                      className="h-10 w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.frequency || "AS_NEEDED"}
                      onChange={(e) => updatePrescriptionItem(item.key, "frequency", e.target.value)}
                      disabled={!canEditBoard}
                      className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      {Object.entries(frequencyLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={item.durationDays}
                      onChange={(e) => updatePrescriptionItem(item.key, "durationDays", e.target.value)}
                      disabled={!canEditBoard}
                      className="h-10 w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={item.quantity}
                      onChange={(e) => updatePrescriptionItem(item.key, "quantity", e.target.value)}
                      disabled={!canEditBoard}
                      className="h-10 w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={item.route}
                      onChange={(e) => updatePrescriptionItem(item.key, "route", e.target.value)}
                      disabled={!canEditBoard}
                      className="h-10 w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={item.instructions}
                      onChange={(e) => updatePrescriptionItem(item.key, "instructions", e.target.value)}
                      disabled={!canEditBoard}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canEditBoard ? (
                      <button
                        type="button"
                        onClick={() => removePrescriptionItem(item.key)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <AppIcon name="trash" className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prescription notes</label>
        <textarea
          rows={3}
          value={prescriptionNotes}
          onChange={(e) => setPrescriptionNotes(e.target.value)}
          disabled={!canEditBoard}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Recent prescriptions</div>
          <div className="mt-3 space-y-3">
            {prescriptionHistory.length === 0 ? (
              <div className="text-sm text-slate-500">No prescriptions yet.</div>
            ) : (
              prescriptionHistory.map((item) => (
                <div key={item.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{item.prescriptionNo}</div>
                    <div className="text-xs text-slate-500">{item.itemCount ?? "-"} items</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</div>
                  <div className="mt-2 text-sm text-slate-600">{item.notes || "No notes"}</div>
                  <button
                    type="button"
                    onClick={async () => {
                      setSelectedPrescription(item);
                      setPrescriptionDetailOpen(true);
                      setPrescriptionDetailLoading(true);
                      setPrescriptionDetailError(null);
                      try {
                        const items = await getPrescriptionItems(item.id);
                        setSelectedPrescriptionItems(items);
                      } catch {
                        setSelectedPrescriptionItems([]);
                        setPrescriptionDetailError("Could not load prescription details.");
                      }
                      setPrescriptionDetailLoading(false);
                    }}
                    className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    View details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Filtered medicines</div>
          <div className="mt-3 max-h-[22rem] space-y-2 overflow-auto pr-1">
            {filteredMedicines.slice(0, 10).map((medicine) => (
              <div key={medicine.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                <div className="font-semibold text-slate-900">{medicine.name}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {medicine.code} | {medicine.categoryName || "No category"} | {medicine.stockQuantity} stock
                </div>
                <div className="mt-1 text-xs text-slate-500">Unit: {unitLabel(medicine.unit)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Medical history</h3>
        <div className="mt-4 space-y-3">
          {historyRecords.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No previous records found.</div>
          ) : (
            historyRecords.map((record) => (
              <div key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{record.recordNo}</div>
                    <div className="text-xs text-slate-500">{formatDateTime(record.visitDate)}</div>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                    {record.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-slate-600">{record.chiefComplaint}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Current visit</h3>
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Patient</div>
            <div className="mt-1 font-semibold text-slate-900">{appointment.patient.fullName}</div>
            <div className="text-sm text-slate-500">{appointment.patient.patientCode}</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Doctor</div>
            <div className="mt-1 font-semibold text-slate-900">{appointment.doctor.fullName}</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Department</div>
            <div className="mt-1 font-semibold text-slate-900">{appointment.department.name}</div>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Record status</div>
            <div className="mt-1 font-semibold text-slate-900">{medicalRecord?.status || "DRAFT"}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrescriptionDetailModal = () => {
    if (!prescriptionDetailOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
        <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Prescription details</div>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">{selectedPrescription?.prescriptionNo || "Prescription"}</h3>
              <p className="mt-1 text-sm text-slate-500">Issued on {formatDateTime(selectedPrescription?.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={closePrescriptionDetailModal}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              aria-label="Close prescription details"
            >
              <AppIcon name="close" className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Medical record</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedPrescription?.medicalRecordId || "-"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Patient</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedPrescription?.patientId || "-"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Items</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{selectedPrescriptionItems.length}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200">
              {prescriptionDetailLoading ? (
                <div className="space-y-3 p-4">
                  <div className="h-16 rounded-2xl bg-slate-100" />
                  <div className="h-16 rounded-2xl bg-slate-100" />
                  <div className="h-16 rounded-2xl bg-slate-100" />
                </div>
              ) : selectedPrescriptionItems.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-slate-500">
                  {prescriptionDetailError || "No prescription items found."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Medicine</th>
                        <th className="px-4 py-3 font-semibold">Dosage</th>
                        <th className="px-4 py-3 font-semibold">Frequency</th>
                        <th className="px-4 py-3 font-semibold">Quantity</th>
                        <th className="px-4 py-3 font-semibold">Route</th>
                        <th className="px-4 py-3 font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPrescriptionItems.map((row) => (
                        <tr key={row.id || `${row.medicineName}-${row.dosage}`}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{row.medicineName}</div>
                            <div className="text-xs text-slate-500">{row.medicineId || "Custom medicine"}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{row.dosage}</td>
                          <td className="px-4 py-3 text-slate-700">{row.frequency ? frequencyLabels[row.frequency] : "-"}</td>
                          <td className="px-4 py-3 text-slate-700">{row.quantity}</td>
                          <td className="px-4 py-3 text-slate-700">{row.route || "-"}</td>
                          <td className="px-4 py-3 text-slate-700">{row.notes || row.instructions || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closePrescriptionDetailModal}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6 pb-32">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_right,_rgba(8,86,207,0.12),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                Doctor Medical Board
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {isReadOnly ? "View medical record" : "Examination and prescription"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                {appointment.patient.fullName} | {appointment.appointmentNo} | {appointment.reason || "No reason provided"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Appointment time</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{formatDateTime(appointment.appointmentTime)}</div>
              <div className="mt-1 text-sm text-slate-500">{appointment.status}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "clinical", label: "Clinical", icon: "edit" as const },
            { key: "prescription", label: "Prescription", icon: "medicines" as const },
            { key: "history", label: "History", icon: "clock" as const },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-brand-700 text-white shadow-[0_12px_24px_rgba(8,86,207,0.18)]"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <AppIcon name={tab.icon} className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "clinical" ? renderClinicalTab() : null}
      {activeTab === "prescription" ? renderPrescriptionTab() : null}
      {activeTab === "history" ? renderHistoryTab() : null}
      {renderPrescriptionDetailModal()}

      {!isReadOnly ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex w-full flex-col gap-3 py-4 pl-[320px] pr-[16px] sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              {medicalRecord ? (
                <>
                  Record <span className="font-semibold text-slate-900">{medicalRecord.recordNo}</span> is{" "}
                  <span className="font-semibold text-slate-900">{medicalRecord.status}</span>.
                </>
              ) : (
                <>Nothing saved yet. Use save draft to create the medical record.</>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/doctor-workspace")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel visit
              </button>
              {canEditBoard ? (
                <>
                  <button
                    type="button"
                    onClick={saveBoard}
                    disabled={saving}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    onClick={completeBoard}
                    disabled={saving}
                    className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Complete record
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
