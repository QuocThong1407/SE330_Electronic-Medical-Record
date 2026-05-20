package com.emr.emr_system.modules.department.service;

import com.emr.emr_system.modules.department.dto.DepartmentRequest;
import com.emr.emr_system.modules.department.dto.DepartmentResponse;
import com.emr.emr_system.modules.department.entity.Department;
import com.emr.emr_system.modules.department.repository.DepartmentRepository;
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
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentResponse create(DepartmentRequest request) {
        if (departmentRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Department", "code", request.getCode());
        }

        Department department = Department.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .phoneExt(request.getPhoneExt())
                .active(request.getActive() == null ? true : request.getActive())
                .build();

        return DepartmentResponse.from(departmentRepository.save(department));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream().map(DepartmentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(UUID id) {
        return DepartmentResponse.from(findDepartment(id));
    }

    public DepartmentResponse update(UUID id, DepartmentRequest request) {
        Department department = findDepartment(id);

        if (!department.getCode().equals(request.getCode()) && departmentRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Department", "code", request.getCode());
        }

        department.setCode(request.getCode());
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setLocation(request.getLocation());
        department.setPhoneExt(request.getPhoneExt());
        if (request.getActive() != null) {
            department.setActive(request.getActive());
        }

        return DepartmentResponse.from(departmentRepository.save(department));
    }

    private Department findDepartment(UUID id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
    }
}
