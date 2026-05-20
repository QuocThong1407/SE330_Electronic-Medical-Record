package com.emr.emr_system.modules.department.repository;

import com.emr.emr_system.modules.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByCode(String code);
    boolean existsByCode(String code);
}
