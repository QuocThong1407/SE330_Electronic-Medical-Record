package com.emr.emr_system.modules.specialization.controller;

import com.emr.emr_system.modules.specialization.dto.SpecializationRequest;
import com.emr.emr_system.modules.specialization.dto.SpecializationResponse;
import com.emr.emr_system.modules.specialization.service.SpecializationService;
import com.emr.emr_system.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/specializations")
@RequiredArgsConstructor
public class SpecializationController {

    private final SpecializationService specializationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SpecializationResponse> create(@Valid @RequestBody SpecializationRequest request) {
        return ApiResponse.success(specializationService.create(request), "Specialization created successfully");
    }

    @GetMapping
    public ApiResponse<List<SpecializationResponse>> getAll() {
        return ApiResponse.success(specializationService.getAll(), "Specialization list retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<SpecializationResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(specializationService.getById(id), "Specialization retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SpecializationResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SpecializationRequest request
    ) {
        return ApiResponse.success(specializationService.update(id, request), "Specialization updated successfully");
    }
}
