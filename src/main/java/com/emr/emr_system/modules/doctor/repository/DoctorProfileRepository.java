package com.emr.emr_system.modules.doctor.repository;

import com.emr.emr_system.modules.doctor.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    boolean existsByUser_Id(UUID userId);
    Optional<DoctorProfile> findByUser_Id(UUID userId);
    boolean existsByEmployeeCode(String employeeCode);
}
