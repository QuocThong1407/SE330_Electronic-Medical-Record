package com.emr.emr_system.modules.medical_records.controller;

import com.emr.emr_system.modules.medical_records.dto.VitalSignsRequest;
import com.emr.emr_system.modules.medical_records.dto.VitalSignsResponse;
import com.emr.emr_system.modules.medical_records.service.VitalSignsService;
import com.emr.emr_system.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/medical-records/{recordId}/vital-signs")
@RequiredArgsConstructor
public class VitalSignsController {
    private final VitalSignsService vitalSignsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<VitalSignsResponse>> getVitalSigns(@PathVariable UUID recordId) {
        VitalSignsResponse result = vitalSignsService.getVitalSigns(recordId);
        return ResponseEntity.ok(ApiResponse.success(result, "Vital signs retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<VitalSignsResponse>> createVitalSigns(
            @PathVariable UUID recordId,
            @RequestBody VitalSignsRequest request) {
        VitalSignsResponse result = vitalSignsService.createVitalSigns(recordId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Vital signs created"));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<VitalSignsResponse>> updateVitalSigns(
            @PathVariable UUID recordId,
            @RequestBody VitalSignsRequest request) {
        VitalSignsResponse result = vitalSignsService.updateVitalSigns(recordId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Vital signs updated"));
    }
}
