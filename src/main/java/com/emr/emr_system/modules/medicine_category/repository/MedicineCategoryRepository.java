package com.emr.emr_system.modules.medicine_category.repository;

import com.emr.emr_system.modules.medicine_category.entity.MedicineCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MedicineCategoryRepository extends JpaRepository<MedicineCategory, UUID> {
    boolean existsByName(String name);

    Optional<MedicineCategory> findByName(String name);
}