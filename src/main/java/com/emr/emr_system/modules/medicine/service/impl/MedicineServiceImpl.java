package com.emr.emr_system.modules.medicine.service.impl;

import com.emr.emr_system.modules.medicine.dto.MedicineCreateRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineResponse;
import com.emr.emr_system.modules.medicine.dto.MedicineStatusRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineStockRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineUpdateRequest;
import com.emr.emr_system.modules.medicine.entity.Medicine;
import com.emr.emr_system.modules.medicine.repository.MedicineRepository;
import com.emr.emr_system.modules.medicine.service.MedicineService;
import com.emr.emr_system.modules.medicine_category.entity.MedicineCategory;
import com.emr.emr_system.modules.medicine_category.repository.MedicineCategoryRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository medicineCategoryRepository;

    @Override
    public MedicineResponse create(MedicineCreateRequest request) {
        String code = request.getCode().trim();
        if (medicineRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Medicine", "code", code);
        }

        if (request.getCategoryId() != null) {
            validateCategoryExists(request.getCategoryId());
        }

        Medicine medicine = Medicine.builder()
                .categoryId(request.getCategoryId())
                .code(code)
                .name(request.getName().trim())
                .unit(request.getUnit())
                .manufacturer(request.getManufacturer())
                .description(request.getDescription())
                .sideEffects(request.getSideEffects())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : Boolean.TRUE)
                .build();

        Medicine saved = medicineRepository.save(medicine);
        return toResponse(medicineRepository.findById(saved.getId()).orElseThrow());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MedicineResponse> search(String keyword, UUID categoryId, Boolean isActive, Pageable pageable) {
        String normalizedKeyword = (keyword == null || keyword.isBlank())
                ? null
                : "%" + keyword.trim().toLowerCase() + "%";

        return medicineRepository
                .searchMedicines(normalizedKeyword, categoryId, isActive, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getById(UUID id) {
        return toResponse(getMedicineOrThrow(id));
    }

    @Override
    public MedicineResponse update(UUID id, MedicineUpdateRequest request) {
        Medicine medicine = getMedicineOrThrow(id);

        String code = request.getCode().trim();
        if (medicineRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateResourceException("Medicine", "code", code);
        }

        if (request.getCategoryId() != null) {
            validateCategoryExists(request.getCategoryId());
        }

        medicine.setCategoryId(request.getCategoryId());
        medicine.setCode(code);
        medicine.setName(request.getName().trim());
        medicine.setUnit(request.getUnit());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setDescription(request.getDescription());
        medicine.setSideEffects(request.getSideEffects());
        medicine.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) {
            medicine.setStockQuantity(request.getStockQuantity());
        }
        if (request.getIsActive() != null) {
            medicine.setIsActive(request.getIsActive());
        }

        Medicine saved = medicineRepository.save(medicine);
        return toResponse(medicineRepository.findById(saved.getId()).orElseThrow());
    }

    @Override
    public MedicineResponse updateStatus(UUID id, MedicineStatusRequest request) {
        Medicine medicine = getMedicineOrThrow(id);
        medicine.setIsActive(request.getIsActive());
        Medicine saved = medicineRepository.save(medicine);
        return toResponse(medicineRepository.findById(saved.getId()).orElseThrow());
    }

    @Override
    public MedicineResponse addStock(UUID id, MedicineStockRequest request) {
        Medicine medicine = getMedicineOrThrow(id);
        medicine.setStockQuantity(medicine.getStockQuantity() + request.getQuantity());
        Medicine saved = medicineRepository.save(medicine);
        return toResponse(medicineRepository.findById(saved.getId()).orElseThrow());
    }

    private Medicine getMedicineOrThrow(UUID id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
    }

    private void validateCategoryExists(UUID categoryId) {
        if (!medicineCategoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("MedicineCategory", "id", categoryId);
        }
    }

    private MedicineResponse toResponse(Medicine medicine) {
        String categoryName = null;
        if (medicine.getCategoryId() != null) {
            categoryName = medicineCategoryRepository.findById(medicine.getCategoryId())
                    .map(MedicineCategory::getName)
                    .orElse(null);
        }
        return MedicineResponse.from(medicine, categoryName);
    }
}