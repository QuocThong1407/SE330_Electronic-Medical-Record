package com.emr.emr_system.modules.medical_records.controller;

import com.emr.emr_system.modules.medical_records.dto.DiagnosisCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.DiagnosisResponse;
import com.emr.emr_system.modules.medical_records.service.DiagnosisService;
import com.emr.emr_system.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/medical-records/{recordId}/diagnoses")
@RequiredArgsConstructor
public class DiagnosesController {
    private final DiagnosisService diagnosisService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<DiagnosisResponse>>> getDiagnoses(@PathVariable UUID recordId) {
        List<DiagnosisResponse> result = diagnosisService.getDiagnoses(recordId);
        return ResponseEntity.ok(ApiResponse.success(result, "Diagnoses retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<DiagnosisResponse>> addDiagnosis(
            @PathVariable UUID recordId,
            @RequestBody DiagnosisCreateRequest request) {
        DiagnosisResponse result = diagnosisService.addDiagnosis(recordId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Diagnosis added"));
    }

    @DeleteMapping("/{icdCodeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteDiagnosis(
            @PathVariable UUID recordId,
            @PathVariable String icdCodeId) {
        diagnosisService.deleteDiagnosis(recordId, icdCodeId);
        return ResponseEntity.ok(ApiResponse.success(null, "Diagnosis deleted"));
    }
}
