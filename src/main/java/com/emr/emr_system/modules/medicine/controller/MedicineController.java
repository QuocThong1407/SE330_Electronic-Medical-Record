package com.emr.emr_system.modules.medicine.controller;

import com.emr.emr_system.modules.medicine.dto.MedicineCreateRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineResponse;
import com.emr.emr_system.modules.medicine.dto.MedicineStatusRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineStockRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineUpdateRequest;
import com.emr.emr_system.modules.medicine.service.MedicineService;
import com.emr.emr_system.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MedicineResponse>> create(
            @Valid @RequestBody MedicineCreateRequest request) {
        MedicineResponse result = medicineService.create(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Medicine created"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Page<MedicineResponse>>> search(
            @RequestParam int page,
            @RequestParam int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) Boolean isActive) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MedicineResponse> result = medicineService.search(keyword, categoryId, isActive, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Medicines retrieved"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<MedicineResponse>> getById(@PathVariable UUID id) {
        MedicineResponse result = medicineService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(result, "Medicine retrieved"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MedicineResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MedicineUpdateRequest request) {
        MedicineResponse result = medicineService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Medicine updated"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody MedicineStatusRequest request) {
        MedicineResponse result = medicineService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Medicine status updated"));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MedicineResponse>> addStock(
            @PathVariable UUID id,
            @Valid @RequestBody MedicineStockRequest request) {
        MedicineResponse result = medicineService.addStock(id, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Medicine stock updated"));
    }
}