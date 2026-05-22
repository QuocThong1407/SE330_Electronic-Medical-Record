package com.emr.emr_system.modules.medical_records.service;

import com.emr.emr_system.modules.medical_records.dto.DiagnosisCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.DiagnosisResponse;

import java.util.List;

public interface DiagnosisService {
    List<DiagnosisResponse> getDiagnoses(Long recordId);

    DiagnosisResponse addDiagnosis(Long recordId, DiagnosisCreateRequest request);

    void deleteDiagnosis(Long recordId, String icdCodeId);
}
