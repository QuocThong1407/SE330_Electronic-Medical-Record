package com.emr.emr_system.modules.medicine_category.service;

import com.emr.emr_system.modules.medicine_category.dto.MedicineCategoryRequest;
import com.emr.emr_system.modules.medicine_category.dto.MedicineCategoryResponse;
import com.emr.emr_system.modules.medicine_category.entity.MedicineCategory;
import com.emr.emr_system.modules.medicine_category.repository.MedicineCategoryRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicineCategoryService {

    private final MedicineCategoryRepository medicineCategoryRepository;

    public MedicineCategoryResponse create(MedicineCategoryRequest request) {
        if (medicineCategoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("MedicineCategory", "name", request.getName());
        }

        MedicineCategory category = MedicineCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        MedicineCategory saved = medicineCategoryRepository.saveAndFlush(category);
        return MedicineCategoryResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicineCategoryResponse> getAll() {
        return medicineCategoryRepository.findAll()
                .stream()
                .map(MedicineCategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicineCategoryResponse getById(UUID id) {
        return MedicineCategoryResponse.from(findCategory(id));
    }

    public MedicineCategoryResponse update(UUID id, MedicineCategoryRequest request) {
        MedicineCategory category = findCategory(id);

        if (!category.getName().equals(request.getName())
                && medicineCategoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("MedicineCategory", "name", request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return MedicineCategoryResponse.from(medicineCategoryRepository.save(category));
    }

    private MedicineCategory findCategory(UUID id) {
        return medicineCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicineCategory", "id", id));
    }
}