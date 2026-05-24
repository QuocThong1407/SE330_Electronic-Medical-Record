package com.emr.emr_system.modules.prescription.controller;

import com.emr.emr_system.modules.prescription.dto.PrescriptionCreateRequest;
import com.emr.emr_system.modules.prescription.dto.PrescriptionDetailResponse;
import com.emr.emr_system.modules.prescription.dto.PrescriptionItemResponse;
import com.emr.emr_system.modules.prescription.dto.PrescriptionResponse;
import com.emr.emr_system.modules.prescription.service.PrescriptionService;
import com.emr.emr_system.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<PrescriptionDetailResponse>> create(
            @Valid @RequestBody PrescriptionCreateRequest request) {
        PrescriptionDetailResponse result = prescriptionService.create(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Prescription created"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Page<PrescriptionResponse>>> search(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) UUID medicalRecordId,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PrescriptionResponse> result = prescriptionService.search(
                medicalRecordId, patientId, doctorId, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Prescriptions retrieved"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<PrescriptionDetailResponse>> getById(@PathVariable UUID id) {
        PrescriptionDetailResponse result = prescriptionService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Prescription retrieved"));
    }

    @GetMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<PrescriptionItemResponse>>> getItems(@PathVariable UUID id) {
        List<PrescriptionItemResponse> result = prescriptionService.getItems(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Prescription items retrieved"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        prescriptionService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Prescription deleted"));
    }
}