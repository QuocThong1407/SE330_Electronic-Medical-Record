package com.emr.emr_system.modules.medicine.repository;

import com.emr.emr_system.modules.medicine.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface MedicineRepository extends JpaRepository<Medicine, UUID> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    @Query("""
            SELECT m FROM Medicine m
            WHERE (:categoryId IS NULL OR m.categoryId = :categoryId)
              AND (:isActive IS NULL OR m.isActive = :isActive)
              AND (:keyword IS NULL
                   OR LOWER(m.name) LIKE :keyword
                   OR LOWER(m.code) LIKE :keyword)
            """)
    Page<Medicine> searchMedicines(@Param("keyword") String keyword,
            @Param("categoryId") UUID categoryId,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}