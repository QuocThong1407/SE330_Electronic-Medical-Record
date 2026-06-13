package com.emr.emr_system.modules.medicine.service.impl;

import com.emr.emr_system.modules.medicine.dto.MedicineCreateRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineResponse;
import com.emr.emr_system.modules.medicine.dto.MedicineStatusRequest;
import com.emr.emr_system.modules.medicine.dto.MedicineStockRequest;
import com.emr.emr_system.modules.medicine.entity.Medicine;
import com.emr.emr_system.modules.medicine.repository.MedicineRepository;
import com.emr.emr_system.modules.medicine_category.entity.MedicineCategory;
import com.emr.emr_system.modules.medicine_category.repository.MedicineCategoryRepository;
import com.emr.emr_system.shared.enums.MedicineUnit;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicineServiceImplTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineCategoryRepository medicineCategoryRepository;

    @InjectMocks
    private MedicineServiceImpl medicineService;

    private UUID medicineId;
    private UUID categoryId;
    private Medicine medicine;
    private MedicineCategory category;

    @BeforeEach
    void setUp() {
        medicineId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        category = MedicineCategory.builder()
                .id(categoryId)
                .name("Antibiotics")
                .build();

        medicine = Medicine.builder()
                .id(medicineId)
                .categoryId(categoryId)
                .code("MED-001")
                .name("Amoxicillin")
                .unit(MedicineUnit.VIAL)
                .stockQuantity(100)
                .price(BigDecimal.valueOf(10.5))
                .isActive(true)
                .build();
    }

    @Test
    void create_Success() {
        MedicineCreateRequest request = new MedicineCreateRequest();
        request.setCategoryId(categoryId);
        request.setCode("MED-001");
        request.setName("Amoxicillin");
        request.setUnit(MedicineUnit.VIAL);

        when(medicineRepository.existsByCode("MED-001")).thenReturn(false);
        when(medicineCategoryRepository.existsById(categoryId)).thenReturn(true);
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);
        when(medicineRepository.findById(medicineId)).thenReturn(Optional.of(medicine));
        when(medicineCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        MedicineResponse response = medicineService.create(request);

        assertNotNull(response);
        assertEquals("MED-001", response.getCode());
        assertEquals("Antibiotics", response.getCategoryName());
        verify(medicineRepository, times(1)).save(any(Medicine.class));
    }

    @Test
    void create_DuplicateCode_ThrowsException() {
        MedicineCreateRequest request = new MedicineCreateRequest();
        request.setCode("MED-001");

        when(medicineRepository.existsByCode("MED-001")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> medicineService.create(request));
    }

    @Test
    void create_CategoryNotFound_ThrowsException() {
        MedicineCreateRequest request = new MedicineCreateRequest();
        request.setCode("MED-001");
        request.setCategoryId(categoryId);

        when(medicineRepository.existsByCode("MED-001")).thenReturn(false);
        when(medicineCategoryRepository.existsById(categoryId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> medicineService.create(request));
    }

    @Test
    void search_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Medicine> page = new PageImpl<>(List.of(medicine));

        when(medicineRepository.searchMedicines(any(), any(), any(), eq(pageable))).thenReturn(page);
        when(medicineCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        Page<MedicineResponse> result = medicineService.search("Amox", categoryId, true, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("MED-001", result.getContent().get(0).getCode());
    }

    @Test
    void getById_Success() {
        when(medicineRepository.findById(medicineId)).thenReturn(Optional.of(medicine));
        when(medicineCategoryRepository.findById(categoryId)).thenReturn(Optional.of(category));

        MedicineResponse response = medicineService.getById(medicineId);

        assertNotNull(response);
        assertEquals(medicineId, response.getId());
        assertEquals("Antibiotics", response.getCategoryName());
    }

    @Test
    void updateStatus_Success() {
        MedicineStatusRequest request = new MedicineStatusRequest();
        request.setIsActive(false);

        when(medicineRepository.findById(medicineId)).thenReturn(Optional.of(medicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);

        MedicineResponse response = medicineService.updateStatus(medicineId, request);

        assertNotNull(response);
        assertFalse(medicine.getIsActive());
    }

    @Test
    void addStock_Success() {
        MedicineStockRequest request = new MedicineStockRequest();
        request.setQuantity(50);

        when(medicineRepository.findById(medicineId)).thenReturn(Optional.of(medicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);

        MedicineResponse response = medicineService.addStock(medicineId, request);

        assertNotNull(response);
        assertEquals(150, medicine.getStockQuantity());
    }
}
