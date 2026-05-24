package com.emr.emr_system.modules.prescription.repository;

import com.emr.emr_system.modules.prescription.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    boolean existsByPrescriptionNo(String prescriptionNo);

    @Query("""
            SELECT p FROM Prescription p
            WHERE (:medicalRecordId IS NULL OR p.medicalRecordId = :medicalRecordId)
              AND (:patientId IS NULL OR p.patientId = :patientId)
              AND (:doctorId IS NULL OR p.doctorId = :doctorId)
              AND (:fromDate IS NULL OR p.prescribedDate >= :fromDate)
              AND (:toDate IS NULL OR p.prescribedDate <= :toDate)
            """)
    Page<Prescription> searchPrescriptions(@Param("medicalRecordId") UUID medicalRecordId,
            @Param("patientId") UUID patientId,
            @Param("doctorId") UUID doctorId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);
}