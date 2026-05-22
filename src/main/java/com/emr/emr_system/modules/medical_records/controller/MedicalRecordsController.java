package com.emr.emr_system.modules.medical_records.controller;

import com.emr.emr_system.modules.medical_records.dto.MedicalRecordConfidentialRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordCreateRequest;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordResponse;
import com.emr.emr_system.modules.medical_records.dto.MedicalRecordUpdateRequest;
import com.emr.emr_system.modules.medical_records.entity.RecordStatus;
import com.emr.emr_system.modules.medical_records.service.MedicalRecordService;
import com.emr.emr_system.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
public class MedicalRecordsController {
    private final MedicalRecordService medicalRecordService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Page<MedicalRecordResponse>>> getMedicalRecords(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(required = false) RecordStatus status,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MedicalRecordResponse> result = medicalRecordService.getMedicalRecords(
                patientId, doctorId, status, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Medical records retrieved"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> getMedicalRecordById(@PathVariable UUID id) {
        MedicalRecordResponse result = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Medical record retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> createMedicalRecord(
            @RequestBody MedicalRecordCreateRequest request) {
        MedicalRecordResponse result = medicalRecordService.createMedicalRecord(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Medical record created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> updateMedicalRecord(
            @PathVariable UUID id,
            @RequestBody MedicalRecordUpdateRequest request) {
        MedicalRecordResponse result = medicalRecordService.updateMedicalRecord(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Medical record updated"));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> completeMedicalRecord(@PathVariable UUID id) {
        MedicalRecordResponse result = medicalRecordService.completeMedicalRecord(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Medical record completed"));
    }

    @PatchMapping("/{id}/archive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> archiveMedicalRecord(@PathVariable UUID id) {
        MedicalRecordResponse result = medicalRecordService.archiveMedicalRecord(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Medical record archived"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalRecord(@PathVariable UUID id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Medical record deleted"));
    }

    @PatchMapping("/{id}/confidential")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponse>> setConfidential(
            @PathVariable UUID id,
            @RequestBody MedicalRecordConfidentialRequest request) {
        MedicalRecordResponse result = medicalRecordService.setConfidential(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Medical record confidentiality updated"));
    }
}
