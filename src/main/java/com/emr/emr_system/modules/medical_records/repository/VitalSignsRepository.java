package com.emr.emr_system.modules.medical_records.repository;

import com.emr.emr_system.modules.medical_records.entity.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VitalSignsRepository extends JpaRepository<VitalSigns, UUID> {
    Optional<VitalSigns> findByMedicalRecordId(UUID medicalRecordId);
}
