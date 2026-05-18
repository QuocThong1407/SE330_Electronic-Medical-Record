package com.emr.emr_system.modules.patient.controller;

import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.patient.dto.PatientProfileRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileResponse;
import com.emr.emr_system.modules.patient.service.PatientProfileService;
import com.emr.emr_system.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientProfileController {

    private final PatientProfileService patientProfileService;

    @PostMapping("/profile")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ApiResponse<PatientProfileResponse> createProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientProfileRequest request
    ) {
        return ApiResponse.success(patientProfileService.createMyProfile(principal, request), "Patient profile created successfully");
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ApiResponse<PatientProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PatientProfileRequest request
    ) {
        return ApiResponse.success(patientProfileService.updateMyProfile(principal, request), "Patient profile updated successfully");
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ApiResponse<PatientProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(patientProfileService.getMyProfile(principal), "Patient profile retrieved successfully");
    }
}
