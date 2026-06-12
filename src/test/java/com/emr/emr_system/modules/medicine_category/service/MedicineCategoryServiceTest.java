package com.emr.emr_system.modules.medicine_category.service;

import com.emr.emr_system.modules.medicine_category.dto.MedicineCategoryRequest;
import com.emr.emr_system.modules.medicine_category.dto.MedicineCategoryResponse;
import com.emr.emr_system.modules.medicine_category.entity.MedicineCategory;
import com.emr.emr_system.modules.medicine_category.repository.MedicineCategoryRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicineCategoryServiceTest {

    @Mock
    private MedicineCategoryRepository medicineCategoryRepository;

    @InjectMocks
    private MedicineCategoryService medicineCategoryService;

    private UUID categoryId;
    private MedicineCategory category;
    private MedicineCategoryRequest request;

    @BeforeEach
    void setUp() {
        categoryId = UUID.randomUUID();
        category = MedicineCategory.builder()
                .id(categoryId)
                .name("Antibiotics")
                .description("Used to treat bacterial infections")
                .build();

        request = new MedicineCategoryRequest();
        request.setName("Antibiotics");
        request.setDescription("Used to treat bacterial infections");
    }

    @Test
    void create_Success() {
        when(medicineCategoryRepository.existsByName(request.getName())).thenReturn(false);
        when(medicineCategoryRepository.saveAndFlush(any(MedicineCategory.class))).thenReturn(category);

        MedicineCategoryResponse response = medicineCategoryService.create(request);

        assertNotNull(response);
        assertEquals("Antibiotics", response.getName());
        verify(medicineCategoryRepository, times(1)).saveAndFlush(any(MedicineCategory.class));
    }

    @Test
    void create_DuplicateName_ThrowsException() {
        when(medicineCategoryRepository.existsByName(request.getName())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> medicineCategoryService.create(request));
    }

    @Test
    void getById_Success() {
        when(medicineCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        MedicineCategoryResponse response = medicineCategoryService.getById(categoryId);

        assertNotNull(response);
        assertEquals(categoryId, response.getId());
    }

    @Test
    void getById_NotFound_ThrowsException() {
        when(medicineCategoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> medicineCategoryService.getById(categoryId));
    }

    @Test
    void update_Success() {
        request.setName("Updated Antibiotics");

        when(medicineCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(medicineCategoryRepository.save(any(MedicineCategory.class))).thenReturn(category);

        MedicineCategoryResponse response = medicineCategoryService.update(categoryId, request);

        assertNotNull(response);
        verify(medicineCategoryRepository, times(1)).save(any(MedicineCategory.class));
    }

    @Test
    void update_DuplicateName_ThrowsException() {
        request.setName("NEW_NAME");
        when(medicineCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(medicineCategoryRepository.existsByName("NEW_NAME")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> medicineCategoryService.update(categoryId, request));
    }
}
