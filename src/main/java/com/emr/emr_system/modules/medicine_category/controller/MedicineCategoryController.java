package com.emr.emr_system.modules.medicine_category.controller;

import com.emr.emr_system.modules.medicine_category.dto.MedicineCategoryRequest;
import com.emr.emr_system.modules.medicine_category.dto.MedicineCategoryResponse;
import com.emr.emr_system.modules.medicine_category.service.MedicineCategoryService;
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
@RequestMapping("/medicine-categories")
@RequiredArgsConstructor
public class MedicineCategoryController {

    private final MedicineCategoryService medicineCategoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MedicineCategoryResponse> create(
            @Valid @RequestBody MedicineCategoryRequest request) {
        return ApiResponse.success(medicineCategoryService.create(request), "Medicine category created successfully");
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<MedicineCategoryResponse>> getAll() {
        return ApiResponse.success(medicineCategoryService.getAll(), "Medicine category list retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<MedicineCategoryResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(medicineCategoryService.getById(id), "Medicine category retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<MedicineCategoryResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody MedicineCategoryRequest request) {
        return ApiResponse.success(medicineCategoryService.update(id, request),
                "Medicine category updated successfully");
    }
}