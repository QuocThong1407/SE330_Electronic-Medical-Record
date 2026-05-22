package com.emr.emr_system.modules.medical_records.controller;

import com.emr.emr_system.modules.medical_records.dto.VitalSignsRequest;
import com.emr.emr_system.modules.medical_records.dto.VitalSignsResponse;
import com.emr.emr_system.modules.medical_records.service.VitalSignsService;
import com.emr.emr_system.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/medical-records/{recordId}/vital-signs")
@RequiredArgsConstructor
public class VitalSignsController {
    private final VitalSignsService vitalSignsService;

    @GetMapping
    public ResponseEntity<ApiResponse<VitalSignsResponse>> getVitalSigns(@PathVariable Long recordId) {
        VitalSignsResponse result = vitalSignsService.getVitalSigns(recordId);
        return ResponseEntity.ok(ApiResponse.success(result, "Vital signs retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VitalSignsResponse>> createVitalSigns(
            @PathVariable Long recordId,
            @RequestBody VitalSignsRequest request) {
        VitalSignsResponse result = vitalSignsService.createVitalSigns(recordId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Vital signs created"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<VitalSignsResponse>> updateVitalSigns(
            @PathVariable Long recordId,
            @RequestBody VitalSignsRequest request) {
        VitalSignsResponse result = vitalSignsService.updateVitalSigns(recordId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Vital signs updated"));
    }
}
