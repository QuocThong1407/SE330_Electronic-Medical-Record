package com.emr.emr_system.modules.department.service;

import com.emr.emr_system.modules.department.dto.DepartmentRequest;
import com.emr.emr_system.modules.department.dto.DepartmentResponse;
import com.emr.emr_system.modules.department.entity.Department;
import com.emr.emr_system.modules.department.repository.DepartmentRepository;
import com.emr.emr_system.shared.exceptions.DuplicateResourceException;
import com.emr.emr_system.shared.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentService departmentService;

    private UUID departmentId;
    private Department department;
    private DepartmentRequest request;

    @BeforeEach
    void setUp() {
        departmentId = UUID.randomUUID();
        department = Department.builder()
                .id(departmentId)
                .code("CAR")
                .name("Cardiology")
                .description("Heart and blood vessel diseases")
                .active(true)
                .build();

        request = new DepartmentRequest();
        request.setCode("CAR");
        request.setName("Cardiology");
        request.setDescription("Heart and blood vessel diseases");
    }

    @Test
    void create_Success() {
        when(departmentRepository.existsByCode(request.getCode())).thenReturn(false);
        when(departmentRepository.save(any(Department.class))).thenReturn(department);

        DepartmentResponse response = departmentService.create(request);

        assertNotNull(response);
        assertEquals("CAR", response.getCode());
        assertEquals("Cardiology", response.getName());
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void create_DuplicateCode_ThrowsException() {
        when(departmentRepository.existsByCode(request.getCode())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> departmentService.create(request));
    }

    @Test
    void getById_Success() {
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));

        DepartmentResponse response = departmentService.getById(departmentId);

        assertNotNull(response);
        assertEquals(departmentId, response.getId());
    }

    @Test
    void getById_NotFound_ThrowsException() {
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> departmentService.getById(departmentId));
    }

    @Test
    void update_Success() {
        request.setName("Updated Cardiology");

        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(departmentRepository.save(any(Department.class))).thenReturn(department);

        DepartmentResponse response = departmentService.update(departmentId, request);

        assertNotNull(response);
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void update_DuplicateCode_ThrowsException() {
        request.setCode("NEW_CODE");
        when(departmentRepository.findById(departmentId)).thenReturn(Optional.of(department));
        when(departmentRepository.existsByCode("NEW_CODE")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> departmentService.update(departmentId, request));
    }
}
