package com.emr.emr_system.modules.specialization.service;

import com.emr.emr_system.modules.specialization.dto.SpecializationRequest;
import com.emr.emr_system.modules.specialization.dto.SpecializationResponse;
import com.emr.emr_system.modules.specialization.entity.Specialization;
import com.emr.emr_system.modules.specialization.repository.SpecializationRepository;
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
public class SpecializationServiceTest {

    @Mock
    private SpecializationRepository specializationRepository;

    @InjectMocks
    private SpecializationService specializationService;

    private UUID specializationId;
    private Specialization specialization;
    private SpecializationRequest request;

    @BeforeEach
    void setUp() {
        specializationId = UUID.randomUUID();
        specialization = Specialization.builder()
                .id(specializationId)
                .name("Neurology")
                .description("Nervous system diseases")
                .build();

        request = new SpecializationRequest();
        request.setName("Neurology");
        request.setDescription("Nervous system diseases");
    }

    @Test
    void create_Success() {
        when(specializationRepository.existsByName(request.getName())).thenReturn(false);
        when(specializationRepository.save(any(Specialization.class))).thenReturn(specialization);

        SpecializationResponse response = specializationService.create(request);

        assertNotNull(response);
        assertEquals("Neurology", response.getName());
        verify(specializationRepository, times(1)).save(any(Specialization.class));
    }

    @Test
    void create_DuplicateName_ThrowsException() {
        when(specializationRepository.existsByName(request.getName())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> specializationService.create(request));
    }

    @Test
    void getById_Success() {
        when(specializationRepository.findById(specializationId)).thenReturn(Optional.of(specialization));

        SpecializationResponse response = specializationService.getById(specializationId);

        assertNotNull(response);
        assertEquals(specializationId, response.getId());
    }

    @Test
    void getById_NotFound_ThrowsException() {
        when(specializationRepository.findById(specializationId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> specializationService.getById(specializationId));
    }

    @Test
    void update_Success() {
        request.setName("Updated Neurology");

        when(specializationRepository.findById(specializationId)).thenReturn(Optional.of(specialization));
        when(specializationRepository.save(any(Specialization.class))).thenReturn(specialization);

        SpecializationResponse response = specializationService.update(specializationId, request);

        assertNotNull(response);
        verify(specializationRepository, times(1)).save(any(Specialization.class));
    }

    @Test
    void update_DuplicateName_ThrowsException() {
        request.setName("NEW_NAME");
        when(specializationRepository.findById(specializationId)).thenReturn(Optional.of(specialization));
        when(specializationRepository.existsByName("NEW_NAME")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> specializationService.update(specializationId, request));
    }
}
