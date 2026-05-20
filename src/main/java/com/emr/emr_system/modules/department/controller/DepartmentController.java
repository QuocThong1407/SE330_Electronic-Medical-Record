package com.emr.emr_system.modules.department.controller;

import com.emr.emr_system.modules.department.dto.DepartmentRequest;
import com.emr.emr_system.modules.department.dto.DepartmentResponse;
import com.emr.emr_system.modules.department.service.DepartmentService;
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
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DepartmentResponse> create(@Valid @RequestBody DepartmentRequest request) {
        return ApiResponse.success(departmentService.create(request), "Department created successfully");
    }

    @GetMapping
    public ApiResponse<List<DepartmentResponse>> getAll() {
        return ApiResponse.success(departmentService.getAll(), "Department list retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<DepartmentResponse> getById(@PathVariable UUID id) {
        return ApiResponse.success(departmentService.getById(id), "Department retrieved successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DepartmentResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody DepartmentRequest request
    ) {
        return ApiResponse.success(departmentService.update(id, request), "Department updated successfully");
    }
}
