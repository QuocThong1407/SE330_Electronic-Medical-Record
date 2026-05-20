package com.emr.emr_system.modules.specialization.repository;

import com.emr.emr_system.modules.specialization.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SpecializationRepository extends JpaRepository<Specialization, UUID> {
    Optional<Specialization> findByName(String name);
    boolean existsByName(String name);
}
