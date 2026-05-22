package com.emr.emr_system.modules.medical_records.service;

import com.emr.emr_system.modules.medical_records.dto.MedicalRecordConfidentialRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordResponse;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordUpdateRequest;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface MedicalRecordService {
    Page<MedicalRecordResponse> getMedicalRecords(UUID patientId,
                                                  UUID doctorId,
                                                  RecordStatus status,
                                                  LocalDate fromDate,
                                                  LocalDate toDate,
                                                  Pageable pageable);

    MedicalRecordResponse getMedicalRecordById(UUID id);

    MedicalRecordResponse createMedicalRecord(MedicalRecordCreateRequest request);

    MedicalRecordResponse updateMedicalRecord(UUID id, MedicalRecordUpdateRequest request);

    MedicalRecordResponse completeMedicalRecord(UUID id);

    MedicalRecordResponse archiveMedicalRecord(UUID id);

    void deleteMedicalRecord(UUID id);

    MedicalRecordResponse setConfidential(UUID id, MedicalRecordConfidentialRequest request);
}
