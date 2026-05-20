package com.emr.emr_system.modules.specialization.service;

import com.emr.emr_system.modules.specialization.dto.SpecializationRequest;
import com.emr.emr_system.modules.specialization.dto.SpecializationResponse;
import com.emr.emr_system.modules.specialization.entity.Specialization;
import com.emr.emr_system.modules.specialization.repository.SpecializationRepository;
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
public class SpecializationService {

    private final SpecializationRepository specializationRepository;

    public SpecializationResponse create(SpecializationRequest request) {
        if (specializationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Specialization", "name", request.getName());
        }

        Specialization specialization = Specialization.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return SpecializationResponse.from(specializationRepository.save(specialization));
    }

    @Transactional(readOnly = true)
    public List<SpecializationResponse> getAll() {
        return specializationRepository.findAll().stream().map(SpecializationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public SpecializationResponse getById(UUID id) {
        return SpecializationResponse.from(findSpecialization(id));
    }

    public SpecializationResponse update(UUID id, SpecializationRequest request) {
        Specialization specialization = findSpecialization(id);

        if (!specialization.getName().equals(request.getName()) && specializationRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Specialization", "name", request.getName());
        }

        specialization.setName(request.getName());
        specialization.setDescription(request.getDescription());

        return SpecializationResponse.from(specializationRepository.save(specialization));
    }

    private Specialization findSpecialization(UUID id) {
        return specializationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization", "id", id));
    }
}
