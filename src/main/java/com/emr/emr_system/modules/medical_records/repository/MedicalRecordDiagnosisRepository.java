package com.emr.emr_system.modules.medical_records.repository;

import com.emr.emr_system.modules.medical_records.entity.MedicalRecordDiagnosis;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecordDiagnosisId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MedicalRecordDiagnosisRepository extends JpaRepository<MedicalRecordDiagnosis, MedicalRecordDiagnosisId> {
    List<MedicalRecordDiagnosis> findByMedicalRecordId(UUID medicalRecordId);
}
