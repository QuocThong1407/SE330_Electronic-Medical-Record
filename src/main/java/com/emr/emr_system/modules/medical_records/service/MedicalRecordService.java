package com.emr.emr_system.modules.medical_records.service;

import com.emr.emr_system.modules.medical_records.dto.MedicalRecordConfidentialRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordResponse;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordUpdateRequest;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface MedicalRecordService {
    Page<MedicalRecordResponse> getMedicalRecords(Long patientId,
                                                  Long doctorId,
                                                  RecordStatus status,
                                                  LocalDate fromDate,
                                                  LocalDate toDate,
                                                  Pageable pageable);

    MedicalRecordResponse getMedicalRecordById(Long id);

    MedicalRecordResponse createMedicalRecord(MedicalRecordCreateRequest request);

    MedicalRecordResponse updateMedicalRecord(Long id, MedicalRecordUpdateRequest request);

    MedicalRecordResponse completeMedicalRecord(Long id);

    MedicalRecordResponse archiveMedicalRecord(Long id);

    void deleteMedicalRecord(Long id);

    MedicalRecordResponse setConfidential(Long id, MedicalRecordConfidentialRequest request);
}
