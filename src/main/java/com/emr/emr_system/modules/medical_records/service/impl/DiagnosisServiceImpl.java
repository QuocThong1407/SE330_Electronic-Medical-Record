package com.emr.emr_system.modules.medical_records.service.impl;

import com.emr.emr_system.modules.icd_codes.repository.IcdCodeRepository;
import com.emr.emr_system.modules.medical_records.dto.DiagnosisCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.DiagnosisResponse;
import com.emr.emr_system.modules.medical_records.entity.DiagnosisType;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecord;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecordDiagnosis;
import com.emr.emr_system.modules.medical_records.entity.MedicalRecordDiagnosisId;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordDiagnosisRepository;
import com.emr.emr_system.modules.medical_records.repository.MedicalRecordRepository;
import com.emr.emr_system.modules.medical_records.service.DiagnosisService;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DiagnosisServiceImpl implements DiagnosisService {
    private final MedicalRecordDiagnosisRepository diagnosisRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final IcdCodeRepository icdCodeRepository;
    private static final int MAX_CUSTOM_CODE_ATTEMPTS = 10;

    @Override
    public List<DiagnosisResponse> getDiagnoses(UUID recordId) {
        if (!medicalRecordRepository.existsById(recordId)) {
            throw new ResourceNotFoundException("MedicalRecord", "id", recordId);
        }

        return diagnosisRepository.findByMedicalRecordId(recordId).stream()
            .map(diagnosis -> DiagnosisResponse.builder()
                .medicalRecordId(diagnosis.getMedicalRecordId())
                .icdCodeId(diagnosis.getIcdCodeId())
                .customDiagnosis(diagnosis.getCustomDiagnosis())
                .diagnosisType(diagnosis.getDiagnosisType())
                .notes(diagnosis.getNotes())
                .createdAt(diagnosis.getCreatedAt())
                .build())
            .toList();
    }

    @Override
    public DiagnosisResponse addDiagnosis(UUID recordId, DiagnosisCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", recordId));

        boolean hasIcdCode = request.getIcdCodeId() != null && !request.getIcdCodeId().isBlank();
        boolean hasCustom = request.getCustomDiagnosis() != null && !request.getCustomDiagnosis().isBlank();
        if (!hasIcdCode && !hasCustom) {
            throw new IllegalArgumentException("icdCodeId or customDiagnosis is required");
        }

        String icdCodeId = hasIcdCode ? request.getIcdCodeId().trim() : null;
        if (icdCodeId != null && !icdCodeRepository.existsById(icdCodeId)) {
            throw new ResourceNotFoundException("IcdCode", "id", icdCodeId);
        }

        if (icdCodeId == null) {
            icdCodeId = generateCustomCode(recordId);
        }

        DiagnosisType diagnosisType = request.getDiagnosisType() != null
                ? request.getDiagnosisType()
                : DiagnosisType.PRIMARY;

        MedicalRecordDiagnosis diagnosis = MedicalRecordDiagnosis.builder()
                .medicalRecordId(record.getId())
                .icdCodeId(icdCodeId)
                .customDiagnosis(request.getCustomDiagnosis())
                .diagnosisType(diagnosisType)
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        MedicalRecordDiagnosis saved = diagnosisRepository.save(diagnosis);
        return DiagnosisResponse.builder()
                .medicalRecordId(saved.getMedicalRecordId())
                .icdCodeId(saved.getIcdCodeId())
                .customDiagnosis(saved.getCustomDiagnosis())
                .diagnosisType(saved.getDiagnosisType())
                .notes(saved.getNotes())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    public void deleteDiagnosis(UUID recordId, String icdCodeId) {
        if (icdCodeId == null || icdCodeId.isBlank()) {
            throw new IllegalArgumentException("icdCodeId is required");
        }

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", recordId));
        if (record.getStatus() != RecordStatus.DRAFT) {
            throw new IllegalStateException("Only draft medical records can delete diagnoses");
        }

        MedicalRecordDiagnosisId id = new MedicalRecordDiagnosisId(recordId, icdCodeId.trim());
        MedicalRecordDiagnosis diagnosis = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis", "icdCodeId", icdCodeId));
        diagnosisRepository.delete(diagnosis);
    }

    private String generateCustomCode(UUID recordId) {
        for (int attempt = 0; attempt < MAX_CUSTOM_CODE_ATTEMPTS; attempt++) {
            int sequence = ThreadLocalRandom.current().nextInt(0, 1_000_000);
            String code = String.format("CUST%06d", sequence);
            MedicalRecordDiagnosisId id = new MedicalRecordDiagnosisId(recordId, code);
            if (!diagnosisRepository.existsById(id)) {
                return code;
            }
        }

        throw new IllegalStateException("Unable to generate a unique diagnosis code");
    }
}
