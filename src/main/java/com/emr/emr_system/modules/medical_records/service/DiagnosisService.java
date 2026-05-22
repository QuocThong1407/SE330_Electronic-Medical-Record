package com.emr.emr_system.modules.medical_records.service;

import com.emr.emr_system.modules.medical_records.dto.DiagnosisCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.DiagnosisResponse;

import java.util.List;
import java.util.UUID;

public interface DiagnosisService {
    List<DiagnosisResponse> getDiagnoses(UUID recordId);

    DiagnosisResponse addDiagnosis(UUID recordId, DiagnosisCreateRequest request);

    void deleteDiagnosis(UUID recordId, String icdCodeId);
}
