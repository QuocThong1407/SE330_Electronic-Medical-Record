package com.emr.emr_system.modules.patient.repository;

import com.emr.emr_system.modules.patient.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PatientProfileRepository extends JpaRepository<PatientProfile, UUID> {
    boolean existsByUser_Id(UUID userId);
    Optional<PatientProfile> findByUser_Id(UUID userId);
}
