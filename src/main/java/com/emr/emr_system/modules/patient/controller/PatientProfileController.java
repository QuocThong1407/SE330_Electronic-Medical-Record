package com.emr.emr_system.modules.patient.controller;

import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.patient.dto.PatientLinkUserRequest;
import com.emr.emr_system.modules.patient.dto.PatientAdminCreateRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileRequest;
import com.emr.emr_system.modules.patient.dto.PatientProfileResponse;
import com.emr.emr_system.modules.patient.dto.PatientWalkInCreateRequest;
import com.emr.emr_system.modules.patient.service.PatientProfileService;
import com.emr.emr_system.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<PatientProfileResponse>> getAllPatients() {
        return ApiResponse.success(patientProfileService.getAllPatients(), "Patient list retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PatientProfileResponse> getPatientById(@PathVariable UUID id) {
        return ApiResponse.success(patientProfileService.getPatientById(id), "Patient profile retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PatientProfileResponse> updatePatientById(
            @PathVariable UUID id,
            @Valid @RequestBody PatientProfileRequest request
    ) {
        return ApiResponse.success(patientProfileService.updatePatientById(id, request), "Patient profile updated successfully");
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PatientProfileResponse> createPatientByAdmin(
            @Valid @RequestBody PatientAdminCreateRequest request
    ) {
        return ApiResponse.success(patientProfileService.createPatientByAdmin(request), "Patient profile created successfully");
    }

    @PostMapping("/walk-in")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ApiResponse<PatientProfileResponse> createWalkInProfile(
            @Valid @RequestBody PatientWalkInCreateRequest request
    ) {
        return ApiResponse.success(patientProfileService.createWalkInProfile(request), "Walk-in patient profile created successfully");
    }

    @PatchMapping("/{id}/link-user")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    public ApiResponse<PatientProfileResponse> linkUserToProfile(
            @PathVariable UUID id,
            @Valid @RequestBody PatientLinkUserRequest request
    ) {
        return ApiResponse.success(patientProfileService.linkUserToProfile(id, request), "Patient profile linked to account successfully");
    }
}
