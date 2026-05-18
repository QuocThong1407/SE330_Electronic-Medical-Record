package com.emr.emr_system.modules.doctor.controller;

import com.emr.emr_system.modules.auth.security.UserPrincipal;
import com.emr.emr_system.modules.doctor.dto.DoctorProfileRequest;
import com.emr.emr_system.modules.doctor.dto.DoctorProfileResponse;
import com.emr.emr_system.modules.doctor.service.DoctorProfileService;
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
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorProfileController {

    private final DoctorProfileService doctorProfileService;

    @PostMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ApiResponse<DoctorProfileResponse> createProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorProfileRequest request
    ) {
        return ApiResponse.success(doctorProfileService.createMyProfile(principal, request), "Doctor profile created successfully");
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ApiResponse<DoctorProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorProfileRequest request
    ) {
        return ApiResponse.success(doctorProfileService.updateMyProfile(principal, request), "Doctor profile updated successfully");
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ApiResponse<DoctorProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success(doctorProfileService.getMyProfile(principal), "Doctor profile retrieved successfully");
    }
}
