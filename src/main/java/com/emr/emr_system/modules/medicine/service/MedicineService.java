package com.emr.emr_system.modules.medicine.service;

import com.emr.emr_system.modules.medicine.dto.MedicineCreateRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineResponse;
import com.emr.emr_system.modules.medicine.dto.MedicineStatusRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineStockRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MedicineService {

    MedicineResponse create(MedicineCreateRequest request);

    Page<MedicineResponse> search(String keyword, UUID categoryId, Boolean isActive, Pageable pageable);

    MedicineResponse getById(UUID id);

    MedicineResponse update(UUID id, MedicineUpdateRequest request);

    MedicineResponse updateStatus(UUID id, MedicineStatusRequest request);

    MedicineResponse addStock(UUID id, MedicineStockRequest request);
}